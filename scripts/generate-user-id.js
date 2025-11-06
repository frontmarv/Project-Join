/**
 * Generates a unique user ID combining name initials and random numbers
 * @param {string} userName - The full name of the user
 * @returns {string} The generated user ID (format: initials + 3 random digits)
 */
function generateUserId(userName) {
    let initials = getUserNameInitials(userName)
    const randomNumbers = Math.floor(100 + Math.random() * 900);
    return `${initials}${randomNumbers}`;
}

/**
 * Capitalizes first letter of each word in the user's name
 * @param {string} userName - The full name to capitalize
 * @returns {string} The name with first letters capitalized
 */
function capitalizeInitials(userName) {
    return userName
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Selects a random color from predefined CSS variables
 * @returns {string} The computed RGB color value
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

/**
 * Creates a user data object for database storage
 * @returns {Object} User data object
 * @property {string} name - Capitalized user name
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} phone - User's phone number (empty initially)
 * @property {string} profilImgColor - Random color for user's profile
 * @property {boolean} loggedIn - User's login state
 */
function createDataObject() {
    let userName = capitalizeInitials(nameInput.value)
    let color = getRandomColor();
    let data = {
        name: userName,
        email: email.value,
        password: password.value,
        phone: "",
        profilImgColor: color,
        loggedIn: false,
    }
    return data
}

/**
 * Pushes user data to the database
 * @async
 * @param {string} key - The unique user ID
 * @param {Object} data - The user data object
 * @returns {Promise<Object>} The server response
 * @throws {Error} When the network request fails
 */
async function pushDataToDB(key, data) {
    let response = await fetch(DB_URL + "users/" + key + ".json", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });
    let responseToJson = await response.json();
    return responseToJson;
}

/**
 * Handles form submission for user signup
 * Creates user ID, stores data, and shows success message
 * @returns {void}
 */
function sendSignupForm() {
    let key = generateUserId(nameInput.value);
    let data = createDataObject();
    pushDataToDB(key, data);
    showSuccessfulSignUpMessage();
    redirectToLoginAfterDelay();
}


