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
 * Validates contact name input and saves data if valid.
 * Shows error animation if name field is empty.
 * @returns {void}
 */
function validateAndSaveData() {
    const userName = document.getElementById('contact-dlg-name-input').value;
    if (userName === "") {
        wrongInputPulseAnimation();
        return;
    } else {
        saveDataEditContactDlg();
        editContactSuccessDlg();
    }
}

/**
 * Saves edited contact data to database and updates UI.
 * Updates contact list, reselects contact, and handles mobile view.
 * @async
 * @returns {Promise<void>}
 */
async function saveDataEditContactDlg() {
    removeAnimationClass();
    const multipatch = setMultipatch();
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
    const { key, data, addUserName } = collectDataAddContactDlg();
    const validInput = validateInputAddContact(addUserName);
    if (!validInput) {
        wrongInputPulseAnimation();
        return;
    } else {
        await pushDataToDB(key, data);
        removeAnimationClass();
        renderContactList();
        setContactCardtoInvisible();
        addContactSuccessDlg();
    }
}

/**
 * Collects and structures data from add contact dialog form.
 * Extracts form values and creates data object with generated user ID.
 * @returns {Object} Collection of contact data
 * @returns {string} return.key - Generated unique user ID
 * @returns {Object} return.data - Contact data object
 * @returns {string} return.addUserName - Contact's name from form
 */
function collectDataAddContactDlg() {
    const addUserName = document.getElementById('contact-dlg-name-input').value;
    const addEmail = document.getElementById('contact-dlg-email-input').value;
    const addPhone = document.getElementById('contact-dlg-phone-input').value;
    const key = generateUserId(addUserName);
    const data = createDataObjectAddContact(addUserName, addEmail, addPhone);
    return { key, data, addUserName };
}

/**
 * Validates that contact name is not empty.
 * @param {string} addUserName - Contact name to validate
 * @returns {boolean} True if name is valid (not empty), undefined otherwise
 */
function validateInputAddContact(addUserName) {
    if (addUserName !== "") {
        return true;
    }
}

/**
 * Displays error animation on input fields.
 * Briefly changes border color to error color for visual feedback.
 * @returns {void}
 */
function wrongInputPulseAnimation() {
    document.querySelectorAll('.inputfield__wrapper').forEach(element => {
        element.style.borderColor = "var(--color-error)";
    });
    setTimeout(() => {
        document.querySelectorAll('.inputfield__wrapper').forEach(element => {
            element.style.borderColor = "var(--color-lightgrey)";
        });
    }, 500);
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


