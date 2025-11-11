/** @type {HTMLElement} DOM elements for login form */
const email = document.getElementById('email');
const emailWrapper = document.getElementById('email__wrapper');
const password = document.getElementById('password');
const passwordWrapper = document.getElementById('password__wrapper');
const errorMsg = document.getElementById('pw-error-warning');
const passwordIcon = document.getElementById('password-icon');
const logo = document.getElementById('joinlogo');
const headerSignup = document.querySelector('.header__signup');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const welcomescreenMobile = document.getElementById('welcomescreen-mobile');

/** @type {boolean} Tracks if mobile header has been added */
let headerAdded = false;

/** @type {string|null} Tracks if welcome animation was shown */
let hasShownWelcomeAnimation = sessionStorage.getItem('welcomeAnimationShown');


/**
* Checks whether the welcome animation has been shown in the current session.
* If not, marks it as shown in session storage to prevent repeat animations.
  */
if (!hasShownWelcomeAnimation) {
    sessionStorage.setItem('welcomeAnimationShown', 'true');
}

/**
* Preloads logo images once the DOM content is fully loaded.
* This helps prevent flickering during the welcome animation.
  */
window.addEventListener("DOMContentLoaded", () => {
    /** @type {string[]} List of logo image paths to preload. */
    let animationImages = [
        "../assets/img/logo-black.png",
        "../assets/img/logo-white.png"
    ];

    animationImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

/**
* Clears any displayed login error message when the user starts typing
* in the email input field.
@listens {Event} keyup
  */
email.addEventListener('keyup', clearLoginError);


/**
* Clears the login error and updates the password lock icon
* each time a key is released in the password input field.
@listens {Event} keyup
  */
password.addEventListener('keyup', () => {
    clearLoginError();
    updatePasswordLockIcon();
});

/**
* Handles screen resizing events to adjust the layout or UI components
* for different screen sizes dynamically.
 * @listens {Event} resize
  */
window.addEventListener("resize", handleResizeScreen);

/**
* Ensures correct layout adjustments when the page finishes loading.
 * @listens {Event} load
  */
window.addEventListener("load", handleResizeScreen);

/**
* Runs the welcome screen animation after the page is fully loaded.
* The animation type depends on the device width (mobile vs desktop).
* If the animation has already been shown, a static version is displayed instead.
 * @listens {Event} load
  */
window.addEventListener('load', () => {
    if (!hasShownWelcomeAnimation) {
        if (window.innerWidth < 1025) {
            welcomeScreenAnimationMobile();
        } else {
            welcomeScreenAnimationDesktop();
        }
    } else {
        welcomeScreenNoAnimation();
    }
});


/**
* Detects when the user presses the Enter key in the password input field
* and triggers the login attempt process.
* @listens {KeyboardEvent} keydown
* @param {KeyboardEvent} event - The keyboard event object.
  */
password.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        attemptLogin();
    }
});


/**
 * Handles the welcome screen animation for desktop devices
 * @returns {void}
 */
function welcomeScreenAnimation() {
    logo.style.transition = 'none';
    logo.classList.add('start');
    setTimeout(() => {
        logo.style.transition = 'transform 1s ease-in-out';
        logo.classList.remove('start');
    }, 200);
    setTimeout(() => {
        footer.classList.remove('invisible');
        main.classList.remove('invisible');
        headerSignup.classList.remove('invisible');
    }, 600);
}


/**
 * Handles the welcome screen animation for desktop devices
 * @returns {void}
 */
function welcomeScreenAnimationDesktop() {
    welcomescreenMobile.classList.add('d-none');
    welcomeScreenAnimation();
}


/**
 * Handles the welcome screen animation for mobile devices
 * @returns {void}
 */
function welcomeScreenAnimationMobile() {
    logo.classList.add('welcome-logo');
    setTimeout(() => {
        welcomescreenMobile.classList.add('hidden');
        welcomeScreenAnimation();
    }, 300);
    setTimeout(() => {
        logo.classList.remove('welcome-logo');
    }, 400);
}


/**
 * Handles the welcome screen when there is no welcome animation
 * @returns {void}
 */
function welcomeScreenNoAnimation() {
    welcomescreenMobile.classList.add('d-none');
    footer.classList.remove('invisible');
    main.classList.remove('invisible');
    headerSignup.classList.remove('invisible');
}


/**
 * Fetches user data from the database
 * @returns {Promise<Object|null>} The user data or null if fetch fails
 */
async function fetchData() {
    try {
        const response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        rawData = await response.json();
        return rawData
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return null;
    }
}


/**
 * Attempts to log in the user with provided credentials
 * @returns {Promise<void>}
 */
async function attemptLogin() {
    let data = await fetchData();
    let dataArray = Object.values(data)
    let existingUser = dataArray.find(user => user.email === email.value);
    let loginIsValid = validateLoginInputs(existingUser);
    if (loginIsValid) {
        getAndStoreUserId(existingUser.name);
        let multipatch = { "loggedIn": true };
        await saveChangesToDB(multipatch);
        sessionStorage.setItem('loggedIn', 'user')
        window.location.replace("./pages/summary.html");
    }
}


/**
 * Logs out all users by setting their loggedIn status to false in the database.
 * Fetches all users and applies a PATCH operation to set loggedIn: false for each user.
 * Errors are caught and logged to the console.
 * 
 * @async
 * @returns {Promise<void>}
 * @throws {Error} If the HTTP request fails or no users are found.
 */
async function logoutAllUsers() {
    try {
        const res = await fetch(DB_URL + "users.json");
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const users = await res.json();
        if (!users) throw new Error("No users found in database");
        const multipatch = { "loggedIn": false };
        await Promise.all(
            Object.keys(users).map(key =>
                fetch(DB_URL + "users/" + key + ".json", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(multipatch)
                })
            )
        );
    } catch (error) {
        console.error("Error applying multipatch to all users:", error);
    }
}

/**
 * Initiates a guest login session and redirects to the summary page.
 * Logs out all users, sets session storage to 'guest', and redirects to summary.html.
 * 
 * @async
 * @returns {Promise<void>}
 */
async function guestLogin() {
    await logoutAllUsers();
    sessionStorage.setItem('loggedIn', 'guest');
    window.location.replace("./pages/summary.html");
}


/**
 * Validates the login input against existing user data
 * @param {Object} existingUser - The user object to validate against
 * @param {string} existingUser.email - User's email
 * @param {string} existingUser.password - User's password
 * @returns {boolean} True if login is valid, false otherwise
 */
function validateLoginInputs(existingUser) {
    if (existingUser == undefined || verifyPassword(existingUser) == false) {
        showLoginError();
        return false;
    } else { return true }
}


/**
 * Verifies if the entered password matches the stored password
 * @param {Object} existingUser - The user object containing the password
 * @param {string} existingUser.password - The stored password to check against
 * @returns {boolean} True if passwords match, false otherwise
 */
function verifyPassword(existingUser) {
    return existingUser.password === password.value;
}


/**
 * Shows error styling for invalid login attempt
 * @returns {void}
 */
function showLoginError() {
    errorMsg.style.visibility = "visible";
    emailWrapper.classList.add('error');
    passwordWrapper.classList.add('error');
}


/**
 * Removes error styling from invalid login attempt
 * @returns {void}
 */
function clearLoginError() {
    errorMsg.style.visibility = "hidden";
    emailWrapper.classList.remove('error');
    passwordWrapper.classList.remove('error');
}


/**
 * Toggles password field visibility between text and password
 * @returns {void}
 */
function togglePasswordVisibility() {
    password.type = password.type === 'password' ? 'text' : 'password';
    togglePasswordIcon();
}


/**
 * Updates the password field icon based on field content
 * @returns {void}
 */
function updatePasswordLockIcon() {
    if (password.value === "") {
        passwordIcon.src = "../assets/img/lock.svg";
    } else {
        togglePasswordIcon();
    }
}


/**
 * Toggles password icon between 2 different imgs
 * @returns {void}
 */
function togglePasswordIcon() {
    if (password.type === 'password') {
        passwordIcon.src = '../assets/img/pw-not-visible.svg';
    }
    else {
        passwordIcon.src = '../assets/img/pw-visible.svg';
    }
}


/**
 * Handles screen resize events and updates header accordingly
 * @returns {void}
 */
function handleResizeScreen() {
    if (isSmallScreen && !headerAdded) {
        main.insertAdjacentHTML('beforeend', renderHeaderSignup());
        headerAdded = true;
    } else if (!isSmallScreen && headerAdded) {
        let header = document.getElementById('header__mobile-signup');
        if (header) header.remove();
        headerAdded = false;
    }
}
