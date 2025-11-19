// -----------------------------------------------------------------------------
// USER ID GENERATION
// -----------------------------------------------------------------------------


/**
 * Generates a unique user ID consisting of the user's name initials
 * followed by three random digits (e.g., "JD482").
 * @param {string} userName - The full name of the user.
 * @returns {string} A unique user ID.
 */
function generateUserId(userName) {
    let initials = getUserNameInitials(userName);
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${initials}${randomNumbers}`;
}


// -----------------------------------------------------------------------------
// NAME PROCESSING
// -----------------------------------------------------------------------------


/**
 * Capitalizes the first letter of each word in a user's name.
 * @param {string} userName - The name to capitalize.
 * @returns {string} The name with properly capitalized initials.
 */
function capitalizeInitials(userName) {
    return userName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


// -----------------------------------------------------------------------------
// RANDOM COLOR SELECTION
// -----------------------------------------------------------------------------


/**
 * Selects a random CSS variable from predefined color variables
 * and returns its computed RGB value.
 * @returns {string} The computed CSS color value (e.g., "rgb(120, 58, 99)").
 */
function getRandomColor() {
    const colors = [
        '--color-1', '--color-2', '--color-3', '--color-4', '--color-5',
        '--color-6', '--color-7', '--color-8', '--color-9', '--color-10',
        '--color-11', '--color-12', '--color-13', '--color-14', '--color-15'
    ];
    const randomColorVar = colors[Math.floor(Math.random() * colors.length)];
    return getComputedStyle(document.documentElement).getPropertyValue(randomColorVar).trim();
}


// -----------------------------------------------------------------------------
// USER DATA CREATION
// -----------------------------------------------------------------------------


/**
 * Creates a fully prepared user data object for Firebase storage.
 * Hashes the password, sets avatar color, and formats name.
 * @async
 * @returns {Promise<Object>} A complete user data object.
 */
async function createDataObject() {
    let userName = capitalizeInitials(nameInput.value);
    let color = getRandomColor();

    const hashedPw = await hashPassword(password.value);

    return {
        name: userName,
        email: email.value,
        password: hashedPw,
        phone: "",
        profilImgColor: color,
        loggedIn: false
    };
}


// -----------------------------------------------------------------------------
// DATABASE WRITE
// -----------------------------------------------------------------------------


/**
 * Stores a user object in Firebase under the given key.
 * @async
 * @param {string} key - The unique Firebase user ID.
 * @param {Object} data - The user data object to write.
 * @returns {Promise<Object>} The Firebase response JSON.
 * @throws {Error} If the network request fails.
 */
async function pushDataToDB(key, data) {
    let response = await fetch(DB_URL + "users/" + key + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    return await response.json();
}


// -----------------------------------------------------------------------------
// SIGNUP HANDLING
// -----------------------------------------------------------------------------


/**
 * Handles the signup form submission process.
 * - Checks if email already exists
 * - Generates user ID
 * - Creates user data object
 * - Writes data to Firebase
 * - Shows success UI message
 * @async
 * @returns {Promise<void>}
 */
async function sendSignupForm() {
    const userAlreadyExists = await checkEmailAlreadyExists();

    if (!userAlreadyExists) {
        let key = generateUserId(nameInput.value);
        let data = await createDataObject();
        await pushDataToDB(key, data);
        showSuccessfulSignUpMessage();
        redirectToLoginAfterDelay();
    } else {
        emailTakenStyling();
    }
}


// -----------------------------------------------------------------------------
// ERROR HANDLING / UI
// -----------------------------------------------------------------------------


/**
 * Applies visual styling and UI feedback when the signup email
 * is already taken.
 * - Shows error message
 * - Highlights email field in error color
 * - Unchecks the privacy checkbox
 * - Disables sign-up button
 * - Auto-hides error message after 2 seconds
 * @returns {void}
 */
function emailTakenStyling() {
    document.getElementById('email-error-warning').style.visibility = 'visible';
    document.getElementById('valid-email').style.borderColor = "var(--color-error)";
    document.getElementById('check').checked = false;
    formState.isCheckboxChecked = false;
    disableSignUpBtn();

    setTimeout(() => {
        document.getElementById('email-error-warning').style.visibility = 'hidden';
    }, 2000);
}


// -----------------------------------------------------------------------------
// DATABASE FETCHING
// -----------------------------------------------------------------------------


/**
 * Fetches all user data from the Firebase database.
 * @async
 * @returns {Promise<Object|null>} The users object, or null on failure.
 */
async function fetchData() {
    try {
        const response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        rawData = await response.json();
        return rawData;

    } catch (error) { console.error("Error fetching data:", error.message);
        return null;
    }
}