const dialog = document.getElementById('dlg-box');
const contactList = document.querySelector('.contact-list');
const contactInfoCard = document.querySelector('.content-right__contact-info-card');
let contactName = document.getElementById('contact-name');
let contactMail = document.getElementById('contact-email');
let contactPhone = document.getElementById('contact-phone');
let contactProfilImg = document.querySelector('.header__contact-profil-img');

let showContact = false;
let userArrayGlobal = [];

window.addEventListener("resize", handleResizeScreenContacts);
window.addEventListener("load", handleResizeScreenContacts);
window.addEventListener("DOMContentLoaded", () => {
    let hoverImages = [
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


async function getUsersfromFirebase() {
    try {
        let response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let data = await response.json();
        let userArray = Object.values(data);
        userArrayGlobal = userArray;
        rawData = data;
        return userArray
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}


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


async function deleteContactFlow() {
    getAndStoreUserId(contactName.innerText);
    await deleteContact(STORED_USER_KEY);
    renderContactList();
    setContactCardtoInvisible();
    if (window.innerWidth < 1025) {
        showContact = false;
        handleResizeScreenContacts();
    }
    removeAnimationClass();
}


function getInitialLetters(array) {
    let initialLetters = [];
    for (let index = 0; index < array.length; index++) {
        let userNameInitialLetter = array[index].name[0];
        initialLetters.push(userNameInitialLetter);
    }
    initialLetters.sort();
    let uniqueLetters = [...new Set(initialLetters)];
    return uniqueLetters
}


function renderInitialLettersSections(initialLettersArray) {
    let initialLetterSections = "";
    initialLettersArray.forEach(letter => {
        initialLetterSections += getUserInitialLetterSectionTpl(letter);
    })
    return initialLetterSections
}


function renderContactsIntoSections(initialLettersArray, userArray) {
    initialLettersArray.forEach(letter => {
        let section = document.querySelector(`#initial-letter__wrapper-${letter}`);
        let filteredUsers = userArray.filter(user => user.name[0] === letter);
        filteredUsers.forEach(userId => {
            let userName = checkLoggedInUser(userId);
            let email = userId.email;
            let profilImgColor = userId.profilImgColor;
            let userInitals = getUserNameInitials(userName);
            let userImg = getMediumUserProfilImg(profilImgColor, userInitals);
            let userHTML = getUserContactListItemTpl(userName, email, userImg);
            section.insertAdjacentHTML("beforeend", userHTML);
        })
    })
}


function checkLoggedInUser(userId) {
    if (userId.name === LOGGED_IN_USER) {
        let modifiedUserName = userId.name + ' (You)';
        return modifiedUserName
    } else {
        let userName = userId.name
        return userName
    }
}


async function renderContactList() {
    let userArray = await getUsersfromFirebase();
    contactList.innerHTML = "";
    let initialLettersArray = getInitialLetters(userArray);
    contactList.innerHTML += renderInitialLettersSections(initialLettersArray);
    renderContactsIntoSections(initialLettersArray, userArray);
    setEventlistenerEveryContact();
}


function setEventlistenerEveryContact() {
    let contactListItems = document.querySelectorAll('.contact-list__item');
    contactListItems.forEach(item => {
        item.addEventListener('click', () => {
            contactListItems.forEach(i => styleContactNotSelected(i));
            styleContactSelected(item);
        })
    })
}


function styleContactNotSelected(i) {
    i.classList.remove('selected');
    i.querySelector('.contact-name').style.color = 'var(--color-black)';
    i.querySelector('circle').classList.remove('colored-circle__selected');
}


function styleContactSelected(item) {
    item.classList.add('selected');
    let contactName = item.querySelector('.contact-name');
    contactName.style.color = 'var(--color-white)';
    item.querySelector('circle').classList.add('colored-circle__selected');
}


function setContactCardtoVisible() {
    contactInfoCard.classList.remove('invisible');
    contactInfoCard.style.visibility = 'visible';
}


function setContactCardtoInvisible() {
    contactInfoCard.classList.add('invisible');
}


function showContactDetailsinCard(selectedContact) {
    const userName = selectedContact.querySelector('.contact-name').innerHTML;
    getAndStoreUserId(userName);
    let contactInfo = getContactInfofromContactlistandDB(userName);
    setContactInfoIntoCard(contactInfo);
    setContactCardtoVisible();
}


function cleanName(userName) {
    return userName.replace(/\s*\(You\)\s*$/, '');
}


function getContactInfofromContactlistandDB(userName) {
    let cleanUserName = cleanName(userName);
    let selectedUser = userArrayGlobal.find(user => user.name === cleanUserName);
    let email = selectedUser.email;
    let phone = selectedUser.phone;
    let profilImgColor = selectedUser.profilImgColor;
    return { cleanUserName, email, phone, profilImgColor };
}


function setContactInfoIntoCard({ cleanUserName, email, phone, profilImgColor }) {
    contactName.innerText = cleanUserName;
    contactMail.innerText = email;
    contactPhone.innerText = phone;
    let userInitals = getUserNameInitials(cleanUserName);
    contactProfilImg.innerHTML = getBigUserProfilImg(profilImgColor, userInitals);
}


function handleResizeScreenContacts() {
    let isSmallScreen = window.innerWidth < 1025;
    handleContent(isSmallScreen);
}


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


function showContactMobile() {
    if (isSmallScreen) {
        document.querySelector('.content-left').style.display = 'none';
        document.querySelector('.content-right').style.display = 'flex';
        document.querySelector('.add-user-icon').style.display = 'none';
        document.querySelector('.contacts-options-icon').style.display = 'flex';
        showContact = true;
    }
}


function showAddUserIconMoblie() {
    document.querySelector('.add-user-icon').style.display = 'flex';
    document.querySelector('.contacts-options-icon').style.display = 'none';
}


function showContactList() {
    showContact = false;
    handleResizeScreenContacts();
    let contactListItems = document.querySelectorAll('.contact-list__item');
    contactListItems.forEach(item => {
        styleContactNotSelected(item);
    })
}


function displayContactActionMenu() {
    document.querySelector('.manage-contact__actions').classList.remove('invisible');
    setTimeout(() => {
        document.addEventListener("click", handleMenuClick);
    }, 400);
}


function hideContactActionMenu() {
    document.querySelector('.manage-contact__actions').classList.add('invisible');
    document.removeEventListener("click", handleMenuClick);
}


function handleMenuClick(event) {
    let menu = document.querySelector('.manage-contact__actions');
    if (isSmallScreen && !menu.contains(event.target)) {
        hideContactActionMenu();
    }
}


function AddContactSuccessDlg() {
    let successDlg = getAddUserSuccessDlg();
    document.body.insertAdjacentHTML('beforeend', successDlg);
    let successDlgElement = document.querySelector('.create-contact-successful');
    requestAnimationFrame(() => successDlgElement.classList.remove('invisible'));
    setTimeout(() => {
        successDlgElement.classList.add('invisible');
        setTimeout(() => successDlgElement.remove(), 300);
    }, 1500);
}


