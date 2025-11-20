/**
 * Applies success styling to an input field wrapper.
 * Removes error class, adds success class, and hides the info text.
 * @param {HTMLElement} wrapper - The input field wrapper element
 * @param {HTMLElement} infoText - The info text element to hide
 * @returns {void}
 */
function styleInputsSuccess(wrapper, infoText) {
    wrapper.classList.remove('error');
    wrapper.classList.add('success');
    infoText.style.opacity = '0';
}

/**
 * Applies error styling to an input field wrapper.
 * Removes success class, adds error class, and shows the info text.
 * @param {HTMLElement} wrapper - The input field wrapper element
 * @param {HTMLElement} infoText - The info text element to show
 * @returns {void}
 */
function styleInputsError(wrapper, infoText) {
    wrapper.classList.remove('success');
    wrapper.classList.add('error');
    infoText.style.opacity = '1';
}


/**
 * Applies neutral styling to an input field wrapper.
 * Removes both error and success classes and hides the info text.
 * @param {HTMLElement} wrapper - The input field wrapper element
 * @param {HTMLElement} infoText - The info text element to hide
 * @returns {void}
 */
function styleInputsNeutral(wrapper, infoText) {
    wrapper.classList.remove('error');
    wrapper.classList.remove('success');
    infoText.style.opacity = '0';
}


/**
 * Styles the email input field to indicate the email is already taken.
 * Updates error message text, shows the warning, and applies error border color.
 * @returns {void}
 */
function styleEmailAlreadyTaken() {
    document.getElementById('email-error-warning').innerHTML = 'Email is already taken';
    document.getElementById('email-error-warning').style.opacity = '1';
    document.getElementById('contact-dlg-email-input').closest('.inputfield__wrapper').classList.add('error');
}


/**
 * Styles the name input field to indicate the name is already taken.
 * Updates error message text, shows the warning, and applies error border color.
 * @returns {void}
 */
function styleNameAlreadyTaken() {
    document.getElementById('name-error-warning').innerHTML = 'Name is already taken';
    document.getElementById('name-error-warning').style.opacity = '1';
    document.getElementById('contact-dlg-name-input').closest('.inputfield__wrapper').classList.add('error');
}


/**
 * Marks the specified contact as selected in the contact list.
 * Applies selected styling to matching contact list item.
 * @param {string} userName - Name of the contact to mark as selected
 * @returns {void}
 */
function markStoredContactAsSelected(userName) {
    const nodelist = document.querySelectorAll('.contact-list__item');
    nodelist.forEach(item => {
        if (item.querySelector('.contact-name').innerHTML === userName) {
            styleContactSelected(item);
        }
    });
}


/**
 * Animates a success dialog into view and removes it after delay.
 * Inserts dialog into DOM, fades it in, then fades out and removes after 1.5 seconds.
 * @param {string} successDlg - HTML string containing the success dialog markup
 * @returns {void}
 */
function animationDlg(successDlg) {
    document.body.insertAdjacentHTML('beforeend', successDlg);
    const successDlgElement = document.querySelector('.create-contact-successful');
    requestAnimationFrame(() => successDlgElement.classList.remove('invisible'));
    setTimeout(() => {
        successDlgElement.classList.add('invisible');
        setTimeout(() => successDlgElement.remove(), 300);
    }, 2000);
}


/**
 * Displays dialog with fade-in animation.
 * Shows dialog overlay and applies animation class after short delay.
 * @returns {void}
 */
function showDlgWtihAnimation() {
    displayDlg();
    setTimeout(() => {
        dialog.classList.add('show');
    }, 100);
}


/**
 * Hides dialog with fade-out animation.
 * Removes animation class and hides dialog after transition completes.
 * @returns {void}
 */
function removeAnimationClass() {
    dialog.classList.remove('show');
    setTimeout(() => {
        removeDeleteClass();
        hideDlg();
    }, 300);
}


/**
 * Displays a success message dialog after adding a contact.
 * Shows animated dialog for 1.5 seconds then removes it.
 * @returns {void}
 */
function addContactSuccessDlg() {
    const successDlg = getAddUserSuccessDlg();
    animationDlg(successDlg);
}


/**
 * Displays a success message dialog after editing a contact.
 * Shows animated dialog for 1.5 seconds then removes it.
 * @returns {void}
 */
function editContactSuccessDlg() {
    const successDlg = getEditContactSuccessDlg();
    animationDlg(successDlg);
}
