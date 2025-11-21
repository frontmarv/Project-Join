/**
 * Creates a data patch object from contact form inputs.
 * Extracts values from name, email, and phone input fields.
 * @returns {Object} Multipatch object containing contact data
 * @returns {string} return.name - Contact's full name
 * @returns {string} return.email - Contact's email address
 * @returns {string} return.phone - Contact's phone number
 */
function setMultipatch() {
    const nameValue = document.getElementById("contact-dlg-name-input").value.trim();
    const emailValue = document.getElementById("contact-dlg-email-input").value.trim();
    const phoneValue = document.getElementById("contact-dlg-phone-input").value.trim();
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
    const multipatch = { "name": data.name.trim(), "email": data.email.trim(), "phone": data.phone.trim() };
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
 * Validates and saves new contact to database.
 * Collects form data, validates input, pushes to database, and updates UI.
 * @async
 * @returns {Promise<void>}
 */
async function putNewContactToDB() {
    const { key, data, addUserName } = collectDataFromDlg();
    const validation = await performContactValidation(addUserName, data);
    if (validation.isValid) {
        successfulValidationFlow(key, data);
    } else if (!validation.emailNotAlreadyTaken && !validation.nameNotAlreadyTaken) {
        styleNameAlreadyTaken();
        styleEmailAlreadyTaken();
    } else if (!validation.emailNotAlreadyTaken) {
        styleEmailAlreadyTaken();
        validateInputField(document.getElementById('contact-dlg-name-input'), isValidUsername, true);
    } else if (!validation.nameNotAlreadyTaken) {
        styleNameAlreadyTaken();
        validateInputField(document.getElementById('contact-dlg-email-input'), isValidEmail, true);
    } else {
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
    const validation = await performEditContactValidation(addUserName, data);
    if (validation.isValid) {
        saveDataEditContactDlg(data);
        editContactSuccessDlg();
    } else if (!validation.emailNotAlreadyTaken && !validation.nameNotAlreadyTaken) {
        styleNameAlreadyTaken();
        styleEmailAlreadyTaken();
    } else if (!validation.emailNotAlreadyTaken) {
        styleEmailAlreadyTaken();
        validateInputField(document.getElementById('contact-dlg-name-input'), isValidUsername, true);
    } else if (!validation.nameNotAlreadyTaken) {
        styleNameAlreadyTaken();
        validateInputField(document.getElementById('contact-dlg-email-input'), isValidEmail, true);
    } else {
        validateInputField(document.getElementById('contact-dlg-name-input'), isValidUsername, true);
        validateInputField(document.getElementById('contact-dlg-email-input'), isValidEmail, true);
    }
}


/**
 * Handles successful contact validation and database operations.
 * Pushes new contact to database, closes dialog, refreshes contact list, and shows success message.
 * @async
 * @param {string} key - The generated unique user ID
 * @param {Object} data - Contact data object to be saved
 * @returns {Promise<void>}
 */
async function successfulValidationFlow(key, data) {
    await pushDataToDB(key, data);
    removeAnimationClass();
    renderContactList();
    setContactCardtoInvisible();
    addContactSuccessDlg();
}


/**
 * Checks if an email address already exists in the database.
 * Fetches all users and returns count of users with matching email (case-insensitive).
 * @async
 * @param {Object} data - Contact data object
 * @param {string} data.email - Email address to check
 * @returns {Promise<number>} Count of existing users with matching email
 */
async function checkEmailAlreadyExists(data) {
    let fetchedData = await fetchUsers();
    let dataArray = Object.values(fetchedData);
    let existingUsers = dataArray.filter(user =>
        user.email.toLowerCase() === data.email &&
        user.name.toLowerCase() !== data.name
    );
    return existingUsers.length;
}


/**
 * Checks if a name already exists in the database.
 * Fetches all users and returns count of users with matching name (case-insensitive).
 * @async
 * @param {Object} data - Contact data object
 * @param {string} data.name - Name to check
 * @returns {Promise<number>} Count of existing users with matching name
 */
async function checkNameAlreadyExists(data) {
    let fetchedData = await fetchUsers();
    console.log(fetchedData);
    let dataArray = Object.values(fetchedData);
    let existingUsers = dataArray.filter(user =>
        user.name.toLowerCase() === data.name &&
        user.email.toLowerCase() !== data.email
    );
    return existingUsers.length;
}

/**
 * Resets all input field styling to default state.
 * Resets border colors to light grey, hides error messages, and resets email warning text.
 * @returns {void}
 */
function resetInputInfo() {
    document.querySelectorAll('.inputfield__wrapper').forEach(element => {
        element.classList.remove('error');
        element.classList.remove('success');
    });
    document.querySelectorAll('.inputfield_fill-in-info').forEach(element => element.style.opacity = '0');
    document.getElementById('email-error-warning').innerHTML = 'Enter a valid e-mail adress';
    document.getElementById('name-error-warning').innerHTML = 'Connect double names with "-", max. 50 letter';
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
    const addUserName = document.getElementById('contact-dlg-name-input').value.toLowerCase().trim();
    const addEmail = document.getElementById('contact-dlg-email-input').value.toLowerCase().trim();
    const addPhone = document.getElementById('contact-dlg-phone-input').value.toLowerCase().trim();
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
 * Maximum 2 words allowed with exactly one space between them (hyphenated names like Ann-Cathrin count as one word).
 * @param {string} username - Username to validate
 * @returns {boolean} True if username is valid, false otherwise
 */
function isValidUsername(username) {
    if (!username || typeof username !== 'string') return false;
    const trimmed = username.trim();
    const regex = /^[a-zA-ZäöüÄÖÜß\-]+(\s[a-zA-ZäöüÄÖÜß\-]+)?$/;
    const letterCount = (trimmed.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
    const isValidLength = trimmed.length >= 2 && trimmed.length <= 50;
    return regex.test(trimmed) && letterCount >= 2 && isValidLength;
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
 * Performs comprehensive validation checks for contact form data.
 * Validates input fields, checks for duplicate emails and names, and validates phone number.
 * @async
 * @param {string} addUserName - The username to validate
 * @param {Object} data - Contact data object
 * @param {string} data.email - Email address to validate
 * @param {string} data.phone - Phone number to validate
 * @param {string} data.name - Name to validate
 * @returns {Promise<Object>} Validation results object
 * @returns {boolean} return.validInput - True if username and email are valid
 * @returns {boolean} return.emailNotAlreadyTaken - True if email doesn't exist in database
 * @returns {boolean} return.nameNotAlreadyTaken - True if name doesn't exist in database
 * @returns {boolean} return.validPhone - True if phone is empty or valid format
 * @returns {boolean} return.isValid - True if all validation checks pass
 */
async function performContactValidation(addUserName, data) {
    const validInput = await validateInputfieldsDlg(addUserName, data);
    const emailNotAlreadyTaken = await checkEmailAlreadyExists(data) === 0;
    const nameNotAlreadyTaken = await checkNameAlreadyExists(data) === 0;
    const validPhone = data.phone === "" || isValidPhone(data.phone);

    return {
        validInput,
        emailNotAlreadyTaken,
        nameNotAlreadyTaken,
        validPhone,
        isValid: validInput && emailNotAlreadyTaken && nameNotAlreadyTaken && validPhone
    };
}

/**
 * Performs comprehensive validation checks for contact form data.
 * Validates input fields, checks for duplicate emails and names, and validates phone number.
 * @async
 * @param {string} addUserName - The username to validate
 * @param {Object} data - Contact data object
 * @param {string} data.email - Email address to validate
 * @param {string} data.phone - Phone number to validate
 * @param {string} data.name - Name to validate
 * @returns {Promise<Object>} Validation results object
 * @returns {boolean} return.validInput - True if username and email are valid
 * @returns {boolean} return.emailNotAlreadyTaken - True if email doesn't exist in database
 * @returns {boolean} return.nameNotAlreadyTaken - True if name doesn't exist in database
 * @returns {boolean} return.validPhone - True if phone is empty or valid format
 * @returns {boolean} return.isValid - True if all validation checks pass
 */
async function performEditContactValidation(addUserName, data) {
    const validInput = await validateInputfieldsDlg(addUserName, data);
    const emailNotAlreadyTaken = await editCheckEmailAlreadyExists(data) === 0;
    const nameNotAlreadyTaken = await editCheckNameAlreadyExists(data) === 0;
    const validPhone = data.phone === "" || isValidPhone(data.phone);

    return {
        validInput,
        emailNotAlreadyTaken,
        nameNotAlreadyTaken,
        validPhone,
        isValid: validInput && emailNotAlreadyTaken && nameNotAlreadyTaken && validPhone
    };
}


/**
 * Checks if a name already exists in the database.
 * Fetches all users and returns count of users with matching name (case-insensitive).
 * Excludes the current user being edited by comparing user IDs.
 * @async
 * @param {Object} data - Contact data object
 * @param {string} data.name - Name to check
 * @returns {Promise<number>} Count of existing users with matching name (excluding current user)
 */
async function editCheckNameAlreadyExists(data) {
    let fetchedData = await fetchUsers();
    let dataArray = Object.entries(fetchedData);
    dataArray.forEach(([userId, user]) => {
        console.log('DB user.name:', user.name, data.name);
    });
    let existingUsers = dataArray.filter(([userId, user]) =>
        user.name === data.name
        &&
            userId !== STORED_USER_KEY 
    );
    console.log(existingUsers);

    return existingUsers.length;
}


/**
 * Checks if a email already exists in the database.
 * Fetches all users and returns count of users with matching email (case-insensitive).
 * Excludes the current user being edited by comparing user IDs.
 * @async
 * @param {Object} data - Contact data object
 * @param {string} data.email - Name to check
 * @returns {Promise<number>} Count of existing users with matching name (excluding current user)
 */
async function editCheckEmailAlreadyExists(data) {
    let fetchedData = await fetchUsers();
    let dataArray = Object.entries(fetchedData);
    let existingUsers = dataArray.filter(([userId, user]) =>
        user.email === data.email &&
        userId !== STORED_USER_KEY
    );

    return existingUsers.length;
}