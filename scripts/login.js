/**
 * DOM elements for the login form
 * @type {HTMLElement}
 */
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

/**
 * Tracks if the mobile header has been dynamically added
 * @type {boolean}
 */
let headerAdded = false;

/**
 * Tracks if the welcome animation was previously shown
 * @type {string|null}
 */
let hasShownWelcomeAnimation = sessionStorage.getItem('welcomeAnimationShown');

// -----------------------------------------------------------------------------
// INITIALIZATION
// -----------------------------------------------------------------------------

/**
 * Marks welcome animation as shown if not already recorded in session storage.
 */
if (!hasShownWelcomeAnimation) {
    sessionStorage.setItem('welcomeAnimationShown', 'true');
}


/**
 * Preloads logo images to avoid flickering during the intro animation.
 * @listens DOMContentLoaded
 */
window.addEventListener("DOMContentLoaded", () => {
    /** @type {string[]} */
    let animationImages = [
        "./assets/img/logo-black.png",
        "./assets/img/logo-white.png"
    ];

    animationImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

// -----------------------------------------------------------------------------
// EVENT LISTENERS
// -----------------------------------------------------------------------------

/**
 * Clears login error feedback when typing begins in the email field.
 * @listens keyup
 */
email.addEventListener('keyup', clearLoginError);
email.addEventListener('click', clearLoginError);

/**
 * Clears error state & updates password lock icon with each keyup.
 * @listens keyup
 */
password.addEventListener('keyup', () => {
    clearLoginError();
    updatePasswordLockIcon();
});
password.addEventListener('click', clearLoginError)

/**
 * Handles responsive layout adjustments.
 * @listens resize
 */
window.addEventListener("resize", handleResizeScreen);

/**
 * Ensures correct UI layout when page is fully loaded.
 * @listens load
 */
window.addEventListener("load", handleResizeScreen);

/**
 * Controls welcome animation or fallback static state.
 * @listens load
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
 * Detects Enter key in password field and triggers login.
 * @listens keydown
 * @param {KeyboardEvent} event
 */
password.addEventListener("keydown", function (event) {
    if (event.key === "Enter") { attemptLogin() }
});

// -----------------------------------------------------------------------------
// WELCOME SCREEN ANIMATIONS
// -----------------------------------------------------------------------------

/**
 * General welcome animation logic (desktop & mobile).
 * @returns {void}
 */
function welcomeScreenAnimation() {
    logo.style.transition = 'none';
    logo.classList.add('start');
    logo.style.visibility = 'visible';

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
 * Executes desktop variant of welcome animation.
 * @returns {void}
 */
function welcomeScreenAnimationDesktop() {
    welcomescreenMobile.classList.add('d-none');
    welcomeScreenAnimation();
}


/**
 * Executes mobile welcome animation flow.
 * @returns {void}
 */
function welcomeScreenAnimationMobile() {
    logo.classList.add('welcome-logo');

    setTimeout(() => {
        welcomescreenMobile.classList.add('hidden');
        welcomeScreenAnimation()
    }, 300);

    setTimeout(() => {
        logo.classList.remove('welcome-logo')
    }, 400);
}


/**
 * Displays static welcome state when animation already occurred.
 * @returns {void}
 */
function welcomeScreenNoAnimation() {
    logo.style.visibility = 'visible';
    welcomescreenMobile.classList.add('d-none');
    footer.classList.remove('invisible');
    main.classList.remove('invisible');
    headerSignup.classList.remove('invisible');
}

// -----------------------------------------------------------------------------
// LOGIN FUNCTIONALITY
// -----------------------------------------------------------------------------

/**
 * Attempts to authenticate the user using provided email & password.
 * @async
 * @returns {Promise<void>}
 */
async function attemptLogin() {
    let data = await fetchUsers();
    let dataArray = Object.values(data);
    let existingUser = dataArray.find(user => user.email === email.value);

    let loginIsValid = await validateLoginInputs(existingUser);

    if (loginIsValid) {
        getUserIdByEmail(existingUser.email);
        let multipatch = { "loggedIn": true };
        await saveChangesToDB(multipatch);
        sessionStorage.setItem('loggedIn', 'user');
        window.location.replace("./pages/summary.html");
    }
}


/**
 * Fetches all users from the database.
 * @async
 * @returns {Promise<Object>} User object keyed by userId.
 * @throws {Error} If request fails.
 */
async function fetchAllUsersForLogout() {
    const res = await fetch(DB_URL + "users.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const users = await res.json();
    if (!users) throw new Error("No users found in database");
    return users;
}


/**
 * Sends a multipatch to set loggedIn:false to one user.
 * @async
 * @param {string} key - User ID key.
 * @returns {Promise<Response>}
 */
function logoutSingleUser(key) {
    const multipatch = { loggedIn: false };
    return fetch(DB_URL + "users/" + key + ".json", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(multipatch)
    });
}


/**
 * Logs out all users by setting loggedIn:false for each.
 * @async
 * @returns {Promise<void>}
 */
async function logoutAllUsers() {
    try {
        const users = await fetchAllUsersForLogout();
        await Promise.all(Object.keys(users).map(key => logoutSingleUser(key)));
    } catch (error) {
        console.error("Error applying multipatch to all users:", error);
    }
}


/**
 * Logs in as guest user and redirects to summary page.
 * @async
 * @returns {Promise<void>}
 */
async function guestLogin() {
    await logoutAllUsers();
    sessionStorage.setItem('loggedIn', 'guest');
    window.location.replace("./pages/summary.html");
}


/**
 * Validates login input: checks existing user + password match.
 * @async
 * @param {Object|null} existingUser - User object with email & hashed password.
 * @returns {Promise<boolean>} True if valid login, otherwise false.
 */
async function validateLoginInputs(existingUser) {
    if (!existingUser) {
        showLoginError();
        return false;
    }

    const passwordMatches = await verifyPassword(existingUser);

    if (!passwordMatches) {
        showLoginError();
        return false;
    }

    return true;
}


/**
 * Verifies password by hashing entered value and comparing with DB.
 * @async
 * @param {Object} existingUser - User object containing hashed password.
 * @returns {Promise<boolean>} True if passwords match.
 */
async function verifyPassword(existingUser) {
    const enteredHash = await hashPassword(password.value);
    return existingUser.password === enteredHash;
}

// -----------------------------------------------------------------------------
// ERROR DISPLAY & PASSWORD FIELD UI
// -----------------------------------------------------------------------------

/**
 * Displays visual error styling for invalid login attempt.
 * @returns {void}
 */
function showLoginError() {
    errorMsg.style.visibility = "visible";
    emailWrapper.classList.add('error');
    passwordWrapper.classList.add('error');
}


/**
 * Removes error styling from input fields.
 * @returns {void}
 */
function clearLoginError() {
    errorMsg.style.visibility = "hidden";
    emailWrapper.classList.remove('error');
    passwordWrapper.classList.remove('error');
}


/**
 * Toggles visibility between password and text input field.
 * @returns {void}
 */
function togglePasswordVisibility() {
    password.type = password.type === 'password' ? 'text' : 'password';
    togglePasswordIcon();
}


/**
 * Updates lock/visibility icon depending on input state.
 * @returns {void}
 */
function updatePasswordLockIcon() {
    if (password.value === "") {
        passwordIcon.src = "./assets/img/lock.svg";
    } else {
        togglePasswordIcon();
    }
}


/**
 * Toggles password field icon depending on current input type.
 * @returns {void}
 */
function togglePasswordIcon() {
    if (password.type === 'password') {
        passwordIcon.src = './assets/img/pw-not-visible.svg';
    } else {
        passwordIcon.src = './assets/img/pw-visible.svg';
    }
}

// -----------------------------------------------------------------------------
// RESPONSIVE HEADER HANDLING
// -----------------------------------------------------------------------------

/**
 * Handles dynamically rendering or removing mobile header based on screen size.
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

// -----------------------------------------------------------------------------
// DATABASE FETCHING
// -----------------------------------------------------------------------------

/**
 * Fetches all user data from Firebase.
 * @async
 * @returns {Promise<Object|null>} JSON object of users or null on error.
 */
async function fetchUsers() {
    try {
        const response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        rawData = await response.json();
        return rawData;

    } catch (error) {
        console.error("Error fetching data:", error.message);
        return null;
    }
}