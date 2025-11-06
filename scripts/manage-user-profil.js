/**
 * Event listener for DOM content loaded.
 * Initializes user avatar rendering.
 * @listens {Event} DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', renderUserAvatar);

/**
 * Event listener for handling clicks outside user menu.
 * Manages visibility of user dropdown menu.
 * @listens {Event} click
 * @param {MouseEvent} event - The click event object
 */
document.addEventListener('click', function (event) {
    if (userAvatar.contains(event.target)) {
        toggleMenuVisiblity();
        return;
    }
    if (!userMenu.classList.contains('d-none')) {
        if (!userMenu.contains(event.target)) {
            userMenu.classList.add('d-none');
        }
    }
});

/**
 * Renders the user avatar based on logged in user information.
 * Fetches user data and displays appropriate initials.
 * @async
 * @returns {Promise<void>}
 */
async function renderUserAvatar() {
    let users = await fetchAllUsers();
    LOGGED_IN_USER = extractActiveUserInfo(users);
    let userInitals;
    if (LOGGED_IN_USER === null) {
        userInitals = "G"
    } else {
        userInitals = getUserNameInitials(LOGGED_IN_USER);
    }
    let userImg = getLoggedInUserImg(userInitals)
    userAvatar.innerHTML = userImg;
}

/**
 * Logs out the current user and redirects to login page.
 * Updates user's logged in status in database.
 * @async
 * @returns {Promise<void>}
 */
async function logOutUser() {
    let userKey = getAndStoreUserId(LOGGED_IN_USER);
    let multipatch = {
        "loggedIn": false,
    };
    if (userKey === undefined) {
        window.location.replace("../index.html");
    }
    else {
        await saveChangesToDB(multipatch);
        window.location.replace("../index.html");
    }
    sessionStorage.removeItem('greetingShown');
}