/**
 * Generates the add contact dialog template.
 * Contains form fields for name, email, and phone with validation.
 * @returns {string} HTML string containing complete add contact dialog structure
 */
function getAddContactDlgTpl() {
    return /*html*/`
        <div class="dialog-left">
            <img src="../assets/img/logo-white.png"
                alt="the word: join with a big J with a blue dot on the left side">
            <h1>Add contact</h1>
            <p>Tasks are better with a team!</p>
            <div class="content-left__bluestrip"></div>
        </div>

        <div class="dialog-right">
            <div class="close-button__wrapper" id="dialog-close-btn" onclick="removeAnimationClass()">
                <img src="../assets/img/close.svg" alt="icon of the letter X">
            </div>
            <div class="content-right__wrapper">
                <div class="profil-img__wrapper">
                    <img id="contact-dlg-profil-img" src="../assets/img/unknownuser.png"
                        alt="a grey circle with a white outline of a person in the middle">
                </div>
                <div class="width-div">
                    <div class="inputfields">
                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-name-input" type="text" placeholder="Name" aria-label="name" onkeyup="validateUsernameInput(this)">
                            <img src="../assets/img/person.svg" alt="icon of an person">
                        </div>
                        
                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-email-input" type="email" placeholder="Email" aria-label="email" onkeyup="validateEmailInput(this)">
                            <img src="../assets/img/mail.svg" alt="icon of an email">
                        </div>

                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-phone-input" type="tel" placeholder="Phone" aria-label="Phone" onkeyup="validatePhoneInput(this)">
                            <img src="../assets/img/call.svg" alt="icon of an phone">
                        </div>
                        <div class="inputfields__button-holder">
                            <button class="empty-btn" onclick="removeAnimationClass()">Cancel<img src="../assets/img/close.svg"
                                    alt="icon of the letter X"></button>
                            <button class="filled-btn" onclick="putNewContactToDB()">Create contact<img src="../assets/img/done.svg"
                                    alt="icon of a checkmark"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

/**
 * Generates the edit contact dialog template.
 * Pre-fills form with existing contact data for editing.
 * @returns {string} HTML string containing complete edit contact dialog structure
 */
function getEditContactDlgTpl() {
    return /*html*/ `
        <div class="dialog-left">
            <img src="../assets/img/logo-white.png"
                alt="the word: join with a big J with a blue dot on the left side">
            <h1>Edit contact</h1>
            <p>Tasks are better with a team!</p>
            <div class="content-left__bluestrip"></div>
        </div>

        <div class="dialog-right">
            <div class="close-button__wrapper" id="dialog-close-btn" onclick="removeAnimationClass(); hideContactActionMenu()">
                <img src="../assets/img/close.svg" alt="icon of the letter X">
            </div>
            <div class="content-right__wrapper">
                <div class="profil-img__wrapper">
                </div>
                <div class="width-div">
                    <div class="inputfields">
                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-name-input" type="text" placeholder="Name" aria-label="name" onkeyup="validateUsernameInput(this)">
                            <img src="../assets/img/person.svg" alt="icon of an person">
                        </div>
                        

                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-email-input" type="email" placeholder="Email" aria-label="email" onkeyup="validateEmailInput(this)">
                            <img src="../assets/img/mail.svg" alt="icon of an email">
                        </div>

                        <div class="inputfield__wrapper">
                            <input id="contact-dlg-phone-input" type="tel" placeholder="Phone" aria-label="Phone" onkeyup="validatePhoneInput(this)">
                            <img src="../assets/img/call.svg" alt="icon of an phone">
                        </div>
                        <div class="inputfields__button-holder">
                            <button class="empty-btn" onclick="removeAnimationClass()">Cancel<img src="../assets/img/close.svg"
                                    alt="icon of the letter X"></button>
                            <button class="filled-btn" onclick="validateAndSaveData()">Save<img src="../assets/img/done.svg"
                                    alt="icon of a checkmark"></button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

/**
 * Generates an alphabetical section header for contact grouping.
 * Creates a container for contacts starting with the specified letter.
 * @param {string} letter - Single uppercase letter for section header
 * @returns {string} HTML string containing section wrapper with letter heading
 */
function getUserInitialLetterSectionTpl(letter) {
    return /*html*/ `
        <div id="initial-letter__wrapper-${letter}">
            <p class="contact-list__initial-letter">${letter}</p>
        </div>
    `
}

/**
 * Generates a contact list item template.
 * Displays contact name, email, and profile image with click handler.
 * @param {string} username - Contact's full name (may include "(You)" suffix)
 * @param {string} email - Contact's email address
 * @param {string} userImg - SVG markup for user profile image
 * @returns {string} HTML string containing clickable contact list item
 */
function getUserContactListItemTpl(username, email, userImg) {
    return /*html*/ `
        <div class="contact-list__item" onclick="showContactDetailsinCard(event.currentTarget); showContactMobile()">
            <div id="user-profil-img__wrapper">${userImg}
            </div>
            <div>
                <p class="contact-name">${username}</p>
                <p class="contact-email">${email}</p>
            </div>
        </div>
    `
}

/**
 * Generates a success notification dialog for contact creation.
 * Displays animated confirmation message after successfully adding a contact.
 * @returns {string} HTML string containing success message dialog
 */
function getAddUserSuccessDlg() {
    return /*html*/ `
        <div id="dlg-box" class="create-contact-successful invisible">
                Contact successfully created
        </div>`
}

/**
 * Generates a delete confirmation dialog for contacts.
 * Prompts user to confirm permanent deletion of selected contact.
 * @returns {string} HTML string containing delete confirmation dialog with action buttons
 */
function getDeleteContactDlg() {
    return /*html*/ `
        <div class="delete-contact__content ">
            <h2>Permanently delete contact?</h2>
            <div class="inputfields__button-holder">
                <button class="empty-btn" onclick="removeAnimationClass()">Cancel<img src="../assets/img/close.svg"
                        alt="icon of the letter X"></button>
                <button class="filled-btn" onclick="deleteContactFlow()">Delete Contact<img src="../assets/img/done.svg"
                        alt="icon of a checkmark"></button>
            </div>
        </div>`
}


/**
 * Generates a success notification dialog for contact editing.
 * Displays animated confirmation message after successfully updating a contact.
 * @returns {string} HTML string containing success message dialog
 */
function getEditContactSuccessDlg() {
    return /*html*/ `
        <div id="dlg-box" class="create-contact-successful invisible">
                Contact edit successful
        </div>`
}
