function getBigUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper big">
            <circle id="colored-circle__big" fill="${profilImgColor}" cx="60" cy="60" r="59"/>
            <text id="user-initials" class="user-initials big" x="60" y="63">${userInitals}</text>
        </svg>
    `
}


function getMediumUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper medium">
            <circle id="colored-circle" fill="${profilImgColor}" cx="21" cy="21" r="20"/>
            <text id="user-initials" class="user-initials medium" x="21" y="22">${userInitals}</text>
        </svg>
    `
}


function getSmallUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper">
            <circle id="colored-circle" fill="${profilImgColor}" cx="16" cy="16" r="15"/>
            <text id="user-initials" class="user-initials small" x="16" y="17">${userInitals}</text>
        </svg>
    `
}


function getLoggedInUserImg(userInitals) {
    return /*html*/ `
    <svg class="svg__wrapper loggedIn">
        <circle id="colored-circle--loggedIn" fill="transparent" cx="25" cy="25" r="22" stroke="var(--color-maincolor)" stroke-width="3"/>
        <text id="user-initials" class="user-initials loggedIn" x="25" y="26">${userInitals}</text>
    </svg>
    `
}

