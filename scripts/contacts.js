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
 * Removes contact from tasks, deletes from database, updates UI, and handles responsive layout adjustments.
 * Redirects to index.html if deleting the logged-in user's own contact.
 * @async
 * @returns {Promise<void>}
 */
async function deleteContactFlow() {
    let userKey = getUserIdByEmail(contactMail.innerHTML)
    await removeContactFromAllTasks(userKey);
    if (userKey == getUserkeyLoggedInUser()) {
        await deleteContact(userKey);
        window.location.replace("../index.html");
    } else {
        await deleteContact(userKey);
        renderContactList();
        setContactCardtoInvisible();
    }
    if (window.innerWidth < 1025) {
        showContact = false;
        handleResizeScreenContacts();
    }
    removeDeleteClass();
    removeAnimationClass();
}


/**
 * Retrieves the user key of the currently logged-in user.
 * Searches through raw data to find the key matching the logged-in user's name.
 * @returns {string|undefined} The user key of the logged-in user, or undefined if not found
 */
function getUserkeyLoggedInUser() {
    for (const key in rawData) {
        if (rawData[key].name === LOGGED_IN_USER) {
            loggedInUserKey = key;
            return loggedInUserKey
        }
    }
}


/**
 * Removes a specific contact from all tasks' assignedContacts arrays (batch update)
 * @param {string} contactToRemove - The contact ID to remove (e.g., "EM123")
 */
async function removeContactFromAllTasks(contactToRemove) {
    try {
        const response = await fetch(DB_URL + "tasks.json");
        if (!response.ok) throw new Error(`Failed to fetch tasks: ${response.status}`);
        const tasks = await response.json();
        if (!tasks) return 0;
        const updates = {};
        for (const [taskKey, taskData] of Object.entries(tasks)) {
            if (taskData.assignedContacts && Array.isArray(taskData.assignedContacts) && taskData.assignedContacts.includes(contactToRemove)) {
                updates[`tasks/${taskKey}/assignedContacts`] = taskData.assignedContacts.filter(contact => contact !== contactToRemove);
            }
        }
        if (Object.keys(updates).length > 0) {
            const updateResponse = await fetch(DB_URL + ".json", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updates) });
            if (!updateResponse.ok) throw new Error(`Batch update failed: ${updateResponse.status}`);
        }
    } catch (error) {
        console.error('Error removing contact from tasks:', error);
        throw error;
    }
}


/**
 * Removes the delete contact dialog styling class from the dialog element.
 * @returns {void}
 */
function removeDeleteClass() {
    dialog.classList.remove('delete-contact__dialog');
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
    contactProfilImg.innerHTML = getScalableProfilImg(profilImgColor, userInitals);
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
        showAddContactIconMoblie();
        showContact = false;
    } else if (isSmallScreen && showContact) {
        document.querySelector('.content-left').style.display = 'none';
        document.querySelector('.content-right').style.display = 'flex';
        showEditContactIconMobile();
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
        showEditContactIconMobile();
        showContact = true;
    }
}


/**
 * Displays add user icon and hides contact options icon on mobile.
 * Used when returning to contact list view.
 * @returns {void}
 */
function showAddContactIconMoblie() {
    document.querySelector('.add-user-icon').style.display = 'flex';
    document.querySelector('.add-user-icon').style.pointerEvents = "all";
    document.querySelector('.contacts-options-icon').style.display = 'none';
    document.querySelector('.contacts-options-icon').style.pointerEvents = "none";
}


/**
 * Shows contact options icon and hides add user icon on mobile.
 * Used when viewing contact details.
 * @returns {void}
 */
function showEditContactIconMobile() {
    document.querySelector('.add-user-icon').style.display = 'none';
    document.querySelector('.add-user-icon').style.pointerEvents = "none";
    document.querySelector('.contacts-options-icon').style.display = 'flex';
    document.querySelector('.contacts-options-icon').style.pointerEvents = "all";
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

