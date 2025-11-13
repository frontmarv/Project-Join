/**
 * Base URL of the Firebase Realtime Database (must end with a trailing slash).
 * @constant {string}
 */
const DB_URL = 'https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/';

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

window.addEventListener("load", getScreenSize);
window.addEventListener('resize', getScreenSize);

/**
 * Updates the responsive flag based on current viewport width.
 * Sets `isSmallScreen` to true if width < 1025px.
 * @returns {void}
 */
function getScreenSize() {
    isSmallScreen = window.innerWidth < 1025;
}


if (overlay) {
    overlay.addEventListener('click', hideDlg);
}


/**
 * Toggles the visibility of the header user dropdown menu
 * by adding/removing the `.d-none` class.
 * @returns {void}
 */
function toggleMenuVisiblity() {
    userMenu.classList.toggle('d-none');
}


/**
 * Shows the global dialog with a short enter animation and reveals the overlay.
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
 * Hides the global dialog with a short exit animation, hides the overlay,
 * clears dialog content, and removes the `dlg-add-task` class if present.
 * @returns {void}
 */
function hideDlg() {
    const dlg = document.getElementById('dlg-box');
    const overlay = document.getElementById('overlay');
    
    dlg.classList.remove('show');
    const wasAddTask = dlg.classList.contains('dlg-add-task');

    setTimeout(() => {
        dlg.classList.add('d-none');
        overlay.classList.add('d-none');

        if (wasAddTask) dlg.classList.remove('dlg-add-task');
        dlg.innerHTML = "";
    }, 300);
}


/**
 * Returns the initials (uppercase) for a given full user name.
 * Splits by spaces and concatenates the first letter of each part.
 * @param {string} userName - The full name to derive initials from.
 * @returns {string} Initials string (e.g., "JD" for "John Doe").
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
 * Sets the minimum selectable date of the due-date input to today (YYYY-MM-DD).
 * @returns {void}
 */
function setMinDueDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due-date').setAttribute('min', today);
};


/**
 * Partially updates the currently logged-in user's document in Firebase.
 * Uses PATCH with the provided `multipatch` object.
 * @async
 * @param {Object} multipatch - Key/value pairs to be patched on the user document.
 * @returns {Promise<void>} Resolves when the request completes successfully.
 * @throws {Error} If no user key is stored or the HTTP request fails.
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
 * Looks up a user's Firebase key by their display name and stores it in `STORED_USER_KEY`.
 * @param {string} userName - The display name to search for.
 * @returns {string|undefined} The found Firebase key, or undefined if not found.
 */
function getAndStoreUserId(userName) {
    for (const key in rawData) {
        if (rawData[key].name === userName) {
            STORED_USER_KEY = key;
            return STORED_USER_KEY
        }
    }
}


/**
 * Fetches all users from Firebase and returns them as an array.
 * Also stores the raw keyed object in `rawData`.
 * @async
 * @returns {Promise<Array<Object>|undefined>} An array of user objects, or undefined on error.
 */
async function fetchAllUsers() {
    try {
        let response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let data = await response.json();
        rawData = data;
        let userArray = Object.values(data);
        return userArray
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}


/**
 * Extracts the name of the user with `loggedIn === true` from a user array.
 * @param {Array<Object>} users - Array of user objects.
 * @returns {string|null} The logged-in user's name, or null if none found.
 */
function extractActiveUserInfo(users) {
    let userLoggedIn = users.find(user => user.loggedIn === true);
    if (userLoggedIn !== undefined) {
        return userLoggedIn.name
    } else {
        return null
    }
}


/**
 * Appends " (You)" to the given user name if it matches the current `LOGGED_IN_USER`.
 * @param {string} userName - The user name to tag.
 * @returns {string} The possibly tagged display name.
 */
function addTagToLoggedInUser(userName) {
    if (userName === LOGGED_IN_USER) {
        let modifiedUserName = userName + ' (You)';
        return modifiedUserName
    } else {
        return userName
    }
}