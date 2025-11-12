/**
 * Renders the add contact dialog and displays it with animation.
 * Populates dialog with the add contact form template.
 * @returns {void}
 */
function renderAddContactDlg() {
    dialog.innerHTML = getAddContactDlgTpl();
    showDlgWtihAnimation();
}


/**
 * Renders the delete contact confirmation dialog.
 * Hides the contact action menu and displays delete confirmation with animation.
 * @returns {void}
 */
function renderDeleteContactDlg() {
    hideContactActionMenu();
    dialog.innerHTML = getDeleteContactDlg();
    dialog.classList.add('delete-contact__dialog');
    showDlgWtihAnimation();
}


/**
 * Renders the edit contact dialog with pre-filled contact data.
 * Populates form fields with current contact information and profile image.
 * @returns {void}
 */
function renderEditContactDlg() {
    dialog.innerHTML = getEditContactDlgTpl();
    document.getElementById("contact-dlg-name-input").value = contactName.innerHTML;
    document.getElementById("contact-dlg-email-input").value = contactMail.innerHTML;
    document.getElementById("contact-dlg-phone-input").value = contactPhone.innerHTML;
    const userName = contactName.innerHTML;
    const profilImgColor = document.getElementById('colored-circle__big').getAttribute('fill');
    const userInitals = getUserNameInitials(userName);
    document.querySelector('.profil-img__wrapper').innerHTML = getBigUserProfilImg(profilImgColor, userInitals);
    showDlgWtihAnimation();
    getAndStoreUserId(userName);
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
        hideDlg();
    }, 300);
}


/**
 * Creates a data patch object from contact form inputs.
 * Extracts values from name, email, and phone input fields.
 * @returns {Object} Multipatch object containing contact data
 * @returns {string} return.name - Contact's full name
 * @returns {string} return.email - Contact's email address
 * @returns {string} return.phone - Contact's phone number
 */
function setMultipatch() {
    const nameValue = document.getElementById("contact-dlg-name-input").value;
    const emailValue = document.getElementById("contact-dlg-email-input").value;
    const phoneValue = document.getElementById("contact-dlg-phone-input").value;
    const multipatch = {
        "name": nameValue,
        "email": emailValue,
        "phone": phoneValue
    };
    return multipatch;
}


/**
 * Saves edited contact data to database and updates UI.
 * Updates contact list, reselects contact, and handles mobile view.
 * @async
 * @returns {Promise<void>}
 */
async function saveDataEditContactDlg(data) {
    removeAnimationClass();
    const multipatch = {
        "name": data.name,
        "email": data.email,
        "phone": data.phone
    };
    await saveChangesToDB(multipatch);
    await renderContactList();
    const userName = rawData[STORED_USER_KEY].name;
    markStoredContactAsSelected(userName);
    const contactInfo = getContactInfofromContactlistandDB(userName);
    setContactInfoIntoCard(contactInfo);
    if (window.innerWidth < 1025) {
        showContact = true;
        handleResizeScreenContacts();
    }
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
 * Validates and saves new contact to database.
 * Collects form data, validates input, pushes to database, and updates UI.
 * @async
 * @returns {Promise<void>}
 */
async function putNewContactToDB() {
    const { key, data, addUserName } = collectDataFromDlg();
    const validInput = await validateInputfieldsDlg(addUserName, data);
    if (validInput) {
        await pushDataToDB(key, data);
        removeAnimationClass();
        renderContactList();
        setContactCardtoInvisible();
        addContactSuccessDlg();
    }
    else { checkForEmptyInput(); }
}


/**
 * Validates contact name input and saves data if valid.
 * Shows error animation if name field is empty.
 * @returns {void}
 */
async function validateAndSaveData() {
    const { key, data, addUserName } = collectDataFromDlg();
    const validInput = await validateInputfieldsDlg(addUserName, data);
    if (validInput) {
        saveDataEditContactDlg(data);
        editContactSuccessDlg();
    } else {
        checkForEmptyInput();
    }
}


/**
 * Checks if fields are empty and triggers error animation for invalid inputs.
 */
function checkForEmptyInput() {
    const nameInput = document.getElementById('contact-dlg-name-input');
    const emailInput = document.getElementById('contact-dlg-email-input');
    const phoneInput = document.getElementById('contact-dlg-phone-input');
    if (nameInput.value === "") {
        pulseRedError(nameInput);
    }
    if (emailInput.value === "") {
        pulseRedError(emailInput);
    }
    if (phoneInput.value === "") {
        pulseRedError(phoneInput);
    }
}


/**
 * Applies a red pulse animation to an input wrapper to indicate error.
 * @param {HTMLInputElement} input - Input element to apply error animation to
 * @returns {void}
 */
function pulseRedError(input) {
    const wrapper = input.closest('.inputfield__wrapper');
    if (!wrapper) return;
    wrapper.classList.add('pulse-error');
    setTimeout(() => {
        wrapper.classList.remove('pulse-error');
    }, 500);
}


/**
 * Collects and structures data from add contact dialog form.
 * Extracts form values and creates data object with generated user ID.
 * @returns {Object} Collection of contact data
 * @returns {string} return.key - Generated unique user ID
 * @returns {Object} return.data - Contact data object
 * @returns {string} return.addUserName - Contact's name from form
 */
function collectDataFromDlg() {
    const addUserName = document.getElementById('contact-dlg-name-input').value;
    const addEmail = document.getElementById('contact-dlg-email-input').value;
    const addPhone = document.getElementById('contact-dlg-phone-input').value;
    const key = generateUserId(addUserName);
    const data = createDataObjectAddContact(addUserName, addEmail, addPhone);
    return { key, data, addUserName };
}


async function validateInputfieldsDlg(addUserName, data) {
    const validName = isValidUsername(addUserName);
    const validEmail = await isValidEmail(data.email);
    const validPhone = isValidPhone(data.phone);
    if (validName && validEmail && validPhone) { return true }
    else { return false }
}

/**
 * Validates username format.
 * Username must contain at least 2 letters, only alphabetic characters and spaces allowed.
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid, false otherwise
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    const regex = /^[a-zA-ZäöüÄÖÜß\s]{2,50}$/;
    const letterCount = (trimmed.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
    return regex.test(trimmed) && letterCount >= 2;
}


/**
 * Validates phone number format.
 * Accepts international format with optional + prefix, spaces, hyphens, and parentheses.
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone number is valid, false otherwise
 */
function isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    const regex = /^\+?[1-9][0-9]{7,14}$/;
    return regex.test(cleaned);
}


/**
 * Validates input field and applies visual feedback via border color.
 * @param {HTMLInputElement} input - The input element being validated
 * @param {Function} validationFn - Validation function to use (isValidUsername, isValidEmail, isValidPhone)
 * @returns {void}
 */
async function validateInputField(input, validationFn) {
    const value = input.value;
    const wrapper = input.closest('.inputfield__wrapper');
    if (!wrapper) return;
    if (value.length > 0) {
        if (await validationFn(value)) {
            wrapper.style.borderColor = 'var(--color-success)';
        } else {
            wrapper.style.borderColor = 'var(--color-error)';
        }
    } else {
        wrapper.style.borderColor = 'var(--color-lightgrey)';
    }
}

/**
 * Validates username input field and applies visual feedback via border color.
 * @param {HTMLInputElement} input - The input element being validated
 * @returns {void}
 */
function validateUsernameInput(input) {
    validateInputField(input, isValidUsername);
}

/**
 * Validates email input field and applies visual feedback via border color.
 * @param {HTMLInputElement} input - The input element being validated
 * @returns {void}
 */
function validateEmailInput(input) {
    validateInputField(input, isValidEmail);
}

/**
 * Validates phone input field and applies visual feedback via border color.
 * @param {HTMLInputElement} input - The input element being validated
 * @returns {void}
 */
function validatePhoneInput(input) {
    validateInputField(input, isValidPhone);
}


/**
 * Creates a complete contact data object for new contact.
 * Capitalizes name, assigns random profile color, and sets default values.
 * @param {string} addUserName - Contact's name
 * @param {string} addEmail - Contact's email address
 * @param {string} addPhone - Contact's phone number
 * @returns {Object} Complete contact data object
 * @returns {string} return.name - Capitalized contact name
 * @returns {string} return.email - Contact's email
 * @returns {string} return.password - Empty password field
 * @returns {string} return.phone - Contact's phone
 * @returns {string} return.profilImgColor - Random hex color for profile image
 * @returns {boolean} return.loggedIn - Login status (always false for new contacts)
 */
function createDataObjectAddContact(addUserName, addEmail, addPhone) {
    const modifiedUserName = capitalizeInitials(addUserName);
    const color = getRandomColor();
    const data = {
        name: modifiedUserName,
        email: addEmail,
        password: "",
        phone: addPhone,
        profilImgColor: color,
        loggedIn: false,
    };
    return data;
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
    }, 1500);
}
