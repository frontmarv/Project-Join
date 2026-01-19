if (!localStorage.getItem('guestBoardId')) {
    localStorage.setItem('guestBoardId', 'board_' + Math.random().toString(36).substr(2, 9));
}

const myBoardId = localStorage.getItem('guestBoardId');

async function syncDefaultData() {
    const firebaseURL = `https://remotestorage-468cc-default-rtdb.europe-west1.firebasedatabase.app/${myBoardId}.json`;
    const check = await fetch(firebaseURL);
    const existingData = await check.json();
    if (!existingData) {
        try {
            const response = await fetch('./data-backup.json');
            const dataFromFile = await response.json();
            await fetch(firebaseURL, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataFromFile)
            });
        } catch (error) {
            console.error("Error loading JSON file:", error);
        }
    }
}
syncDefaultData();

/**
 * Base URL of the Firebase Realtime Database (must end with a trailing slash).
 * @constant {string}
 */
const DB_URL = `https://remotestorage-468cc-default-rtdb.europe-west1.firebasedatabase.app/${myBoardId}/`;

/**
 * Header user dropdown menu element.
 * @type {HTMLElement|null}
 */
let userMenu = document.getElementById('user-drop-down-menu');

/**
 * Global overlay element used for dialogs.
 * @type {HTMLElement|null}
 */
let overlay = document.getElementById('overlay');

/**
 * Container element for the header's user info/avatar.
 * @type {HTMLElement|null}
 */
let userAvatar = document.querySelector('.header__user-info');

/**
 * Display name of the currently logged-in user.
 * @type {string|undefined}
 */
let LOGGED_IN_USER;

/**
 * Firebase key (ID) of the currently logged-in user.
 * @type {string}
 */
let STORED_USER_KEY = "";

/**
 * Raw users object as fetched from the database (keyed by user ID).
 * @type {Object|undefined}
 */
let rawData;

/**
 * Flag indicating whether the viewport is below the small-screen breakpoint.
 * @type {boolean|undefined}
 */
let isSmallScreen;


// -----------------------------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------------------------


window.addEventListener("load", getScreenSize);
window.addEventListener('resize', getScreenSize);


if (overlay) {
    overlay.addEventListener('click', hideDlg);
}


// -----------------------------------------------------------------------------
// PASSWORD HASHING
// -----------------------------------------------------------------------------


/**
 * Generates a SHA-256 hash for the given password.
 * @async
 * @param {string} password - The plaintext password to hash.
 * @returns {Promise<string>} A promise resolving to the hex-encoded hash string.
 */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(hashBuffer)]
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}


// -----------------------------------------------------------------------------
// VIEWPORT & RESPONSIVENESS
// -----------------------------------------------------------------------------

/**
 * Updates the responsive flag based on current viewport width.
 * Sets `isSmallScreen` to true if width < 1025px.
 * @returns {void}
 */
function getScreenSize() {
    isSmallScreen = window.innerWidth < 1025;
}


// -----------------------------------------------------------------------------
// UI: MENU & DIALOG CONTROL
// -----------------------------------------------------------------------------


/**
 * Toggles the visibility of the header user dropdown menu.
 * @returns {void}
 */
function toggleMenuVisiblity() {
    userMenu.classList.toggle('d-none');
}


/**
 * Shows the global dialog with a short fade-in animation
 * and makes the overlay visible.
 * @returns {void}
 */
function displayDlg() {
    const dlg = document.getElementById('dlg-box');
    const overlay = document.getElementById('overlay');

    dlg.classList.remove('d-none');
    overlay.classList.remove('d-none');

    setTimeout(() => {
        dlg.classList.add('show');
    }, 10);
}


/**
 * Hides the global dialog with an exit animation,
 * hides the overlay, clears its content,
 * and removes task-specific dialog classes.
 * @returns {void}
 */
function hideDlg() {
    const dlg = document.getElementById('dlg-box');
    const overlay = document.getElementById('overlay');
    dlg.classList.remove('show');
    const wasAddTask = dlg.classList.contains('dlg-add-task');
    const wasDeleteContact = dlg.classList.contains('delete-contact__dialog');

    setTimeout(() => {
        dlg.classList.add('d-none');
        overlay.classList.add('d-none');
        if (wasDeleteContact) removeDeleteClass();
        if (wasAddTask) dlg.classList.remove('dlg-add-task');
        dlg.innerHTML = "";
    }, 300);
}


// -----------------------------------------------------------------------------
// UTILITY FUNCTIONS
// -----------------------------------------------------------------------------


/**
 * Extracts initials from the given full name.
 * Uses up to two words and takes the first letter of each.
 * @param {string} userName - The full name to process.
 * @returns {string} The derived initials (e.g., "JD").
 */
function getUserNameInitials(userName) {
    return userName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(word => word[0].toUpperCase())
        .join('');
}


/**
 * Sets the minimum selectable date on the due-date input to today
 * in YYYY-MM-DD format.
 * @returns {void}
 */
function setMinDueDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due-date').setAttribute('min', today);
}


// -----------------------------------------------------------------------------
// FIREBASE: USER DATA MANAGEMENT
// -----------------------------------------------------------------------------

/**
 * Applies a partial update (PATCH) to the currently logged-in user's document.
 * @async
 * @param {Object} multipatch - Key/value pairs to update in the user document.
 * @returns {Promise<void>} Resolves when successful.
 * @throws {Error} If no user is loaded or the request fails.
 */
async function saveChangesToDB(multipatch) {
    if (!STORED_USER_KEY) throw new Error('No user key found');

    const res = await fetch(`${DB_URL}users/${STORED_USER_KEY}.json`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(multipatch)
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
}


/**
 * Searches the raw user data for a matching display name
 * and stores its Firebase key globally in `STORED_USER_KEY`.
 * @param {string} userName - The display name to match.
 * @returns {string|undefined} The Firebase key or undefined if not found.
 */
function getAndStoreUserId(userName) {
    for (const key in rawData) {
        if (rawData[key].name === userName) {
            STORED_USER_KEY = key;
            return STORED_USER_KEY;
        }
    }
}


/**
 * Fetches all user objects from Firebase,
 * stores the raw keyed object into `rawData`,
 * and returns an array of user objects.
 * @async
 * @returns {Promise<Array<Object>|undefined>} An array of user objects.
 */
async function fetchAllUsers() {
    try {
        let response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) throw new Error(`Response status: ${response.status}`);

        let data = await response.json();
        rawData = data;

        return Object.values(data);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}


/**
 * Returns the name of the first user with `loggedIn === true`.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {string|null} The logged-in user's name or null if none.
 */
function extractActiveUserInfo(users) {
    let userLoggedIn = users.find(user => user.loggedIn === true);
    return userLoggedIn ? userLoggedIn.name : null;
}


/**
 * Appends " (You)" to the name if it matches the logged-in user.
 * @param {string} userName - The user name to check.
 * @returns {string} The modified name or the original.
 */
function addTagToLoggedInUser(userName) {
    return userName === LOGGED_IN_USER ? `${userName} (You)` : userName;
}


/**
 * Looks up a user's Firebase key by email
 * and stores it globally in `STORED_USER_KEY`.
 * @param {string} existingUserMail - Email address to search.
 * @returns {string|undefined} The found Firebase key or undefined.
 */
function getUserIdByEmail(existingUserMail) {
    for (const key in rawData) {
        if (rawData[key].email === existingUserMail) {
            STORED_USER_KEY = key;
            return STORED_USER_KEY;
        }
    }
}
