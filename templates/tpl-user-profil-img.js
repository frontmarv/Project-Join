/**
 * Generates a large SVG profile image with colored background and user initials.
 * Used for detailed contact view and profile displays.
 * @param {string} profilImgColor - Hex color code for the circle background
 * @param {string} userInitals - User's initials to display (typically 1-2 characters)
 * @returns {string} HTML string containing SVG markup for large profile image
 */
function getBigUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper big">
            <circle id="colored-circle__big" fill="${profilImgColor}" cx="60" cy="60" r="59"/>
            <text id="user-initials" class="user-initials big" x="60" y="63">${userInitals}</text>
        </svg>
    `
}

/**
 * Generates a medium SVG profile image with colored background and user initials.
 * Used for contact list items and compact displays.
 * @param {string} profilImgColor - Hex color code for the circle background
 * @param {string} userInitals - User's initials to display (typically 1-2 characters)
 * @returns {string} HTML string containing SVG markup for medium profile image
 */
function getMediumUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper medium">
            <circle id="colored-circle" fill="${profilImgColor}" cx="21" cy="21" r="20"/>
            <text id="user-initials" class="user-initials medium" x="21" y="22">${userInitals}</text>
        </svg>
    `
}

/**
 * Generates a small SVG profile image with colored background and user initials.
 * Used for inline mentions, avatars in lists, and compact UI elements.
 * @param {string} profilImgColor - Hex color code for the circle background
 * @param {string} userInitals - User's initials to display (typically 1-2 characters)
 * @returns {string} HTML string containing SVG markup for small profile image
 */
function getSmallUserProfilImg(profilImgColor, userInitals) {
    return /*html*/ `
        <svg class="svg__wrapper">
            <circle id="colored-circle" fill="${profilImgColor}" cx="16" cy="16" r="15"/>
            <text id="user-initials" class="user-initials small" x="16" y="17">${userInitals}</text>
        </svg>
    `
}

/**
 * Generates SVG profile image for the currently logged-in user.
 * Features a transparent background with main color stroke outline.
 * @param {string} userInitals - User's initials to display (typically 1-2 characters)
 * @returns {string} HTML string containing SVG markup for logged-in user profile image
 */
function getLoggedInUserImg(userInitals) {
    return /*html*/ `
    <svg class="svg__wrapper loggedIn">
        <circle id="colored-circle--loggedIn" fill="transparent" cx="25" cy="25" r="22" stroke="var(--color-maincolor)" stroke-width="3"/>
        <text id="user-initials" class="user-initials loggedIn" x="25" y="26">${userInitals}</text>
    </svg>
    `
}

