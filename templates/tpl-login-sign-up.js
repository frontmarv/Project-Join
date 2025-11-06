function renderSuccessMessage() {
    return /*html*/ `
        <dialog id="dlg-box" class="signup__success-message startposition d-none">
                You Signed Up successfully
        </dialog>`
}


function renderHeaderSignup() {
    return /*html*/ `
        <div id="header__mobile-signup" class="header__signup mobileview">
            <span>Not a Join user?</span>
            <button class="btn filled-btn" onclick="location.href='/pages/sign-up.html'">Signup</button>
        </div>`
}



