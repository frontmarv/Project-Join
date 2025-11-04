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


function getLoggedInUserImg(userInitals) {
    return /*html*/ `
    <svg class="svg__wrapper loggedIn">
        <circle id="colored-circle--loggedIn" fill="transparent" cx="25" cy="25" r="22" stroke="var(--color-maincolor)" stroke-width="3"/>
        <text id="user-initials" class="user-initials loggedIn" x="25" y="26">${userInitals}</text>
    </svg>
    `
}


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