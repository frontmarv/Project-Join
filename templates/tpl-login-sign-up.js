/**
 * Generates a success message dialog for sign-up completion.
 * Displays a centered dialog with confirmation text after successful registration.
 * @returns {string} HTML string containing success message dialog element
 */
function renderSuccessMessage() {
    return /*html*/ `
        <dialog id="dlg-box" class="signup__success-message startposition d-none">
                You Signed Up successfully
        </dialog>`
}

/**
 * Generates mobile header signup section.
 * Shows signup prompt and button for non-registered users on mobile devices.
 * @returns {string} HTML string containing mobile signup header with button
 */
function renderHeaderSignup() {
    return /*html*/ `
        <div id="header__mobile-signup" class="header__signup mobileview">
            <span>Not a Join user?</span>
            <button class="btn filled-btn" onclick="location.href='./pages/sign-up.html'">Signup</button>
        </div>`
}



