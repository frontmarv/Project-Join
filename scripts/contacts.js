/** 
 * DOM elements for contact management interface.
 * @type {HTMLElement}
 */
const dialog = document.getElementById('dlg-box');
const contactList = document.querySelector('.contact-list');
const contactInfoCard = document.querySelector('.content-right__contact-info-card');
let contactName = document.getElementById('contact-name');
let contactMail = document.getElementById('contact-email');
let contactPhone = document.getElementById('contact-phone');
let contactProfilImg = document.querySelector('.header__contact-profil-img');

/**
 * Tracks whether a contact is currently being shown on mobile view.
 * @type {boolean}
 */
let showContact = false;

/**
 * Global array storing all user/contact data.
 * @type {Array<Object>}
 */
let userArrayGlobal = [];

/**
 * Event handler for window resize.
 * Adjusts contact layout for different screen sizes.
 * @listens {Event} resize
 */
window.addEventListener("resize", handleResizeScreenContacts);

/**
 * Event handler for page load.
 * Initializes contact layout based on initial screen size.
 * @listens {Event} load
 */
window.addEventListener("load", handleResizeScreenContacts);

/**
 * Event handler for DOM content loaded.
 * Preloads hover state images to prevent flickering during interactions.
 * @listens {Event} DOMContentLoaded
 */
window.addEventListener("DOMContentLoaded", () => {
    const hoverImages = [
        "../assets/img/arrow-left-blue-hover.svg",
        "../assets/img/contacts-add-user-active.svg",
        "../assets/img/contacts-options-active.svg",
        "../assets/img/edit-with-text-hover.svg",
        "../assets/img/delete-with-text-hover.svg"
    ];
    hoverImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

/**
 * Fetches all users from Firebase database.
 * Updates global user array and raw data storage.
 * @async
 * @returns {Promise<Array<Object>>} Array of user objects
 * @throws {Error} If the HTTP request fails
 */
async function getUsersfromFirebase() {
    try {
        const response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const data = await response.json();
        const userArray = Object.values(data);
        userArrayGlobal = userArray;
        rawData = data;
        return userArray;
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

/**
 * Deletes a contact from the Firebase database.
 * @async
 * @param {string} userkeyToDelete - The unique key of the user to delete
 * @returns {Promise<void>}
 * @throws {Error} If the delete operation fails
 */
async function deleteContact(userkeyToDelete) {
    try {
        const response = await fetch(DB_URL + "users/" + userkeyToDelete + ".json", {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Fehler beim Löschen: ${response.status}`);
        }
    } catch (error) {
        console.error(error);
    }
}

/**
 * Executes the complete contact deletion workflow.
 * Deletes contact, updates UI, and handles responsive layout adjustments.
 * @async
 * @returns {Promise<void>}
 */
async function deleteContactFlow() {
    let userName = contactName.innerText;
    getAndStoreUserId(userName);
    await deleteContact(STORED_USER_KEY);
    if (userName == LOGGED_IN_USER) { logOutUser(); }
    renderContactList();
    setContactCardtoInvisible();
    if (window.innerWidth < 1025) {
        showContact = false;
        handleResizeScreenContacts();
    }
    removeAnimationClass();
}

/**
 * Extracts and returns unique initial letters from user names.
 * Sorts letters alphabetically and removes duplicates.
 * @param {Array<Object>} array - Array of user objects
 * @param {string} array[].name - User's name
 * @returns {Array<string>} Sorted array of unique initial letters
 */
function getInitialLetters(array) {
    const initialLetters = [];
    for (let index = 0; index < array.length; index++) {
        const userNameInitialLetter = array[index].name[0];
        initialLetters.push(userNameInitialLetter);
    }
    initialLetters.sort();
    const uniqueLetters = [...new Set(initialLetters)];
    return uniqueLetters;
}

/**
 * Renders HTML sections for each initial letter.
 * Creates alphabetical section headers for contact grouping.
 * @param {Array<string>} initialLettersArray - Array of unique initial letters
 * @returns {string} Concatenated HTML string of all section templates
 */
function renderInitialLettersSections(initialLettersArray) {
    let initialLetterSections = "";
    initialLettersArray.forEach(letter => {
        initialLetterSections += getUserInitialLetterSectionTpl(letter);
    });
    return initialLetterSections;
}

/**
 * Renders contacts into their respective alphabetical sections.
 * Filters users by initial letter and populates section with contact items.
 * @param {Array<string>} initialLettersArray - Array of unique initial letters
 * @param {Array<Object>} userArray - Array of user objects to render
 * @returns {void}
 */
function renderContactsIntoSections(initialLettersArray, userArray) {
    initialLettersArray.forEach(letter => {
        const section = document.querySelector(`#initial-letter__wrapper-${letter}`);
        const filteredUsers = userArray.filter(user => user.name[0] === letter);
        filteredUsers.forEach(userId => {
            const userName = checkLoggedInUser(userId);
            const email = userId.email;
            const profilImgColor = userId.profilImgColor;
            const userInitals = getUserNameInitials(userName);
            const userImg = getMediumUserProfilImg(profilImgColor, userInitals);
            const userHTML = getUserContactListItemTpl(userName, email, userImg);
            section.insertAdjacentHTML("beforeend", userHTML);
        });
    });
}

/**
 * Checks if user is the logged-in user and appends "(You)" indicator.
 * @param {Object} userId - User object to check
 * @param {string} userId.name - User's name
 * @returns {string} Modified user name with "(You)" suffix if logged in, otherwise original name
 */
function checkLoggedInUser(userId) {
    if (userId.name === LOGGED_IN_USER) {
        const modifiedUserName = userId.name + ' (You)';
        return modifiedUserName;
    } else {
        const userName = userId.name;
        return userName;
    }
}

/**
 * Renders the complete contact list with alphabetical sections.
 * Fetches users, clears existing list, and populates with grouped contacts.
 * @async
 * @returns {Promise<void>}
 */
async function renderContactList() {
    const userArray = await getUsersfromFirebase();
    contactList.innerHTML = "";
    const initialLettersArray = getInitialLetters(userArray);
    contactList.innerHTML += renderInitialLettersSections(initialLettersArray);
    renderContactsIntoSections(initialLettersArray, userArray);
    setEventlistenerEveryContact();
}

/**
 * Attaches click event listeners to all contact list items.
 * Handles contact selection and deselection styling.
 * @returns {void}
 */
function setEventlistenerEveryContact() {
    const contactListItems = document.querySelectorAll('.contact-list__item');
    contactListItems.forEach(item => {
        item.addEventListener('click', () => {
            contactListItems.forEach(i => styleContactNotSelected(i));
            styleContactSelected(item);
        });
    });
}

/**
 * Removes selected styling from a contact list item.
 * Resets text color and profile circle styling.
 * @param {HTMLElement} i - Contact list item element to deselect
 * @returns {void}
 */
function styleContactNotSelected(i) {
    i.classList.remove('selected');
    i.querySelector('.contact-name').style.color = 'var(--color-black)';
    i.querySelector('circle').classList.remove('colored-circle__selected');
}

/**
 * Applies selected styling to a contact list item.
 * Changes text color and profile circle styling.
 * @param {HTMLElement} item - Contact list item element to select
 * @returns {void}
 */
function styleContactSelected(item) {
    item.classList.add('selected');
    const contactName = item.querySelector('.contact-name');
    contactName.style.color = 'var(--color-white)';
    item.querySelector('circle').classList.add('colored-circle__selected');
}

/**
 * Makes the contact information card visible.
 * Removes invisible class and sets visibility style.
 * @returns {void}
 */
function setContactCardtoVisible() {
    contactInfoCard.classList.remove('invisible');
    contactInfoCard.style.visibility = 'visible';
}

/**
 * Hides the contact information card.
 * Adds invisible class to hide card from view.
 * @returns {void}
 */
function setContactCardtoInvisible() {
    contactInfoCard.classList.add('invisible');
}

/**
 * Displays selected contact's details in the information card.
 * Retrieves contact data and populates card fields.
 * @param {HTMLElement} selectedContact - Selected contact list item element
 * @returns {void}
 */
function showContactDetailsinCard(selectedContact) {
    const userName = selectedContact.querySelector('.contact-name').innerHTML;
    getAndStoreUserId(userName);
    const contactInfo = getContactInfofromContactlistandDB(userName);
    setContactInfoIntoCard(contactInfo);
    setContactCardtoVisible();
}

/**
 * Removes "(You)" suffix from user name.
 * Cleans up display name for data operations.
 * @param {string} userName - User name potentially containing "(You)" suffix
 * @returns {string} Cleaned user name without suffix
 */
function cleanName(userName) {
    return userName.replace(/\s*\(You\)\s*$/, '');
}

/**
 * Retrieves contact information from global user array.
 * Finds user by name and extracts relevant contact details.
 * @param {string} userName - Name of the contact (may include "(You)" suffix)
 * @returns {Object} Contact information object
 * @returns {string} return.cleanUserName - Contact's name without suffix
 * @returns {string} return.email - Contact's email address
 * @returns {string} return.phone - Contact's phone number
 * @returns {string} return.profilImgColor - Profile image color hex code
 */
function getContactInfofromContactlistandDB(userName) {
    const cleanUserName = cleanName(userName);
    const selectedUser = userArrayGlobal.find(user => user.name === cleanUserName);
    const email = selectedUser.email;
    const phone = selectedUser.phone;
    const profilImgColor = selectedUser.profilImgColor;
    return { cleanUserName, email, phone, profilImgColor };
}

/**
 * Populates contact information card with contact details.
 * Updates name, email, phone, and profile image in the card.
 * @param {Object} contactInfo - Contact information object
 * @param {string} contactInfo.cleanUserName - Contact's name
 * @param {string} contactInfo.email - Contact's email address
 * @param {string} contactInfo.phone - Contact's phone number
 * @param {string} contactInfo.profilImgColor - Profile image color hex code
 * @returns {void}
 */
function setContactInfoIntoCard({ cleanUserName, email, phone, profilImgColor }) {
    contactName.innerText = cleanUserName;
    contactMail.innerText = email;
    contactPhone.innerText = phone;
    const userInitals = getUserNameInitials(cleanUserName);
    contactProfilImg.innerHTML = getBigUserProfilImg(profilImgColor, userInitals);
}

/**
 * Handles screen resize events for contacts page.
 * Determines if screen is small and adjusts layout accordingly.
 * @returns {void}
 */
function handleResizeScreenContacts() {
    const isSmallScreen = window.innerWidth < 1025;
    handleContent(isSmallScreen);
}

/**
 * Manages content visibility based on screen size and contact view state.
 * Shows/hides contact list and detail views for responsive layout.
 * @param {boolean} isSmallScreen - True if screen width is below 1025px
 * @returns {void}
 */
function handleContent(isSmallScreen) {
    if (isSmallScreen && !showContact) {
        document.querySelector('.content-left').style.display = 'flex';
        document.querySelector('.content-right').style.display = 'none';
        showAddUserIconMoblie();
        showContact = false;
    } else if (isSmallScreen && showContact) {
        document.querySelector('.content-left').style.display = 'none';
        document.querySelector('.content-right').style.display = 'flex';
        showContact = true;
    } else {
        document.querySelector('.content-right').style.display = 'flex';
        document.querySelector('.content-left').style.display = 'flex';
    }
}

/**
 * Displays contact details view on mobile devices.
 * Hides contact list and shows detail view with options icon.
 * @returns {void}
 */
function showContactMobile() {
    if (isSmallScreen) {
        document.querySelector('.content-left').style.display = 'none';
        document.querySelector('.content-right').style.display = 'flex';
        document.querySelector('.add-user-icon').style.display = 'none';
        document.querySelector('.contacts-options-icon').style.display = 'flex';
        showContact = true;
    }
}

/**
 * Shows add user icon and hides contact options icon on mobile.
 * Used when returning to contact list view.
 * @returns {void}
 */
function showAddUserIconMoblie() {
    document.querySelector('.add-user-icon').style.display = 'flex';
    document.querySelector('.contacts-options-icon').style.display = 'none';
}

/**
 * Returns to contact list view from contact detail view.
 * Deselects all contacts and adjusts responsive layout.
 * @returns {void}
 */
function showContactList() {
    showContact = false;
    handleResizeScreenContacts();
    const contactListItems = document.querySelectorAll('.contact-list__item');
    contactListItems.forEach(item => {
        styleContactNotSelected(item);
    });
}

/**
 * Displays the contact action menu (edit/delete).
 * Makes menu visible and sets up outside click handler after brief delay.
 * @returns {void}
 */
function displayContactActionMenu() {
    document.querySelector('.manage-contact__actions').classList.remove('invisible');
    setTimeout(() => {
        document.addEventListener("click", handleMenuClick);
    }, 400);
}

/**
 * Hides the contact action menu.
 * Removes menu from view and cleans up click event listener.
 * @returns {void}
 */
function hideContactActionMenu() {
    document.querySelector('.manage-contact__actions').classList.add('invisible');
    document.removeEventListener("click", handleMenuClick);
}

/**
 * Handles clicks outside the contact action menu to close it.
 * Only active on small screens to prevent accidental closures.
 * @param {MouseEvent} event - Click event object
 * @returns {void}
 */
function handleMenuClick(event) {
    const menu = document.querySelector('.manage-contact__actions');
    if (isSmallScreen && !menu.contains(event.target)) {
        hideContactActionMenu();
    }
}

/**
 * Displays a success message dialog after adding a contact.
 * Shows animated dialog for 1.5 seconds then removes it.
 * @returns {void}
 */
function AddContactSuccessDlg() {
    const successDlg = getAddUserSuccessDlg();
    document.body.insertAdjacentHTML('beforeend', successDlg);
    const successDlgElement = document.querySelector('.create-contact-successful');
    requestAnimationFrame(() => successDlgElement.classList.remove('invisible'));
    setTimeout(() => {
        successDlgElement.classList.add('invisible');
        setTimeout(() => successDlgElement.remove(), 300);
    }, 1500);
}


