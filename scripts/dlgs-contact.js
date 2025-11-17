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
    const profilImgColor = document.getElementById('scalable-profil-img').style.backgroundColor;
    const userInitals = getUserNameInitials(userName);
    document.querySelector('.profil-img__wrapper').innerHTML = getScalableProfilImg(profilImgColor, userInitals);
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
    const emailNotAlreadyTaken = await checkEmailAlreadyExists(data)
    if (validInput && emailNotAlreadyTaken === 0) {
        await pushDataToDB(key, data);
        removeAnimationClass();
        renderContactList();
        setContactCardtoInvisible();
        addContactSuccessDlg();
    }else if(emailNotAlreadyTaken !== 0){
        document.getElementById('email-error-warning').innerHTML = 'Email is already taken';
        document.getElementById('email-error-warning').style.opacity = '1';
    }
    else {
        validateInputField(document.getElementById('contact-dlg-name-input'), isValidUsername, true);
        validateInputField(document.getElementById('contact-dlg-email-input'), isValidEmail, true);
    }
}


/**
 * Validates contact name input and saves data if valid.
 * Shows error animation if name field is empty.
 * @returns {void}
 */
async function validateAndSaveData() {
    const { key, data, addUserName } = collectDataFromDlg();
    const validInput = await validateInputfieldsDlg(addUserName, data);
    const emailNotAlreadyTaken = await checkEmailAlreadyExists(data)
    if (validInput && emailNotAlreadyTaken === 0) {
        saveDataEditContactDlg(data);
        editContactSuccessDlg();
    } else if (emailNotAlreadyTaken !== 0) {
        document.getElementById('email-error-warning').innerHTML = 'Email is already taken';
        document.getElementById('email-error-warning').style.opacity = '1';
    }
    else {
        validateInputField(document.getElementById('contact-dlg-name-input'), isValidUsername, true);
        validateInputField(document.getElementById('contact-dlg-email-input'), isValidEmail, true);
    }
}

/**
 * Checks if an email address already exists in the database.
 * Fetches all users and returns all users with matching email address.
 * @async
 * @param {Object} data - Contact data object
 * @param {string} data.email - Email address to check
 * @returns {Promise<Array>} Array of user objects with matching email, empty array if none found
 */
async function checkEmailAlreadyExists(data) {
    let fetchedData = await fetchData();
    let dataArray = Object.values(fetchedData);
    let existingUsers = dataArray.filter(user =>
        user.email === data.email && user.name !== data.name
    );
    return existingUsers.length;
}


function resetInputInfo() {
    document.querySelectorAll('.inputfield__wrapper').forEach(element => element.style.borderColor = 'var(--color-lightgrey)');
    document.querySelectorAll('.inputfield_fill-in-info').forEach(element => element.style.opacity = '0');
    document.getElementById('email-error-warning').innerHTML = 'Enter a valid e-mail adress';
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


/**
 * Validates all input fields from the contact dialog.
 * Checks if username, email, and phone number meet validation requirements.
 * @async
 * @param {string} addUserName - The username to validate
 * @param {Object} data - Contact data object containing email and phone
 * @param {string} data.email - Email address to validate
 * @param {string} data.phone - Phone number to validate
 * @returns {Promise<boolean>} True if all fields are valid, false otherwise
 */
async function validateInputfieldsDlg(addUserName, data) {
    const validName = isValidUsername(addUserName);
    const validEmail = await isValidEmail(data.email);
    if (validName && validEmail) { return true }
    else { return false }
}


/**
 * Validates username format.
 * Username must contain at least 2 letters, allows alphabetic characters, spaces, and hyphens.
 * Maximum 2 words allowed (hyphenated names like Ann-Cathrin count as one word).
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid, false otherwise
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    const regex = /^[a-zA-ZäöüÄÖÜß\-\s]{2,50}$/;
    const letterCount = (trimmed.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
    const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
    return regex.test(trimmed) && letterCount >= 2 && wordCount <= 2;
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
    const regex = /^\+?[0-9][0-9]{7,14}$/;
    return regex.test(cleaned);
}


/**
 * Validates input field and applies visual feedback via border color.
 * @param {HTMLInputElement} input - The input element being validated
 * @param {Function} validationFn - Validation function to use (isValidUsername, isValidEmail, isValidPhone)
 * @returns {void}
 */
async function validateInputField(input, validationFn, submit) {
    const value = input.value;
    const wrapper = input.closest('.inputfield__wrapper');
    const infoText = input.closest('.inputfield-section').querySelector('.inputfield_fill-in-info');
    if (!wrapper) return;
    if (value.length > 0 || submit) {
        if (await validationFn(value)) {
            wrapper.style.borderColor = 'var(--color-success)';
            infoText.style.opacity = '0';
        } else {
            wrapper.style.borderColor = 'var(--color-error)';
            infoText.style.opacity = '1';
        }
    } else {
        wrapper.style.borderColor = 'var(--color-lightgrey)';
        infoText.style.opacity = '0';
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
    }, 2000);
}
