document.addEventListener('DOMContentLoaded', renderUserAvatar);

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