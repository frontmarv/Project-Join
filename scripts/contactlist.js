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
            const userInitals = getUserNameInitials(cleanName(userName));
            const userImg = getMediumUserProfilImg(profilImgColor, userInitals);
            const userHTML = getUserContactListItemTpl(userName, email, userImg);
            section.insertAdjacentHTML("beforeend", userHTML);
        });
    });
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
