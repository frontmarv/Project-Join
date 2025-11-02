const DB_URL = 'https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/';
let userMenu = document.getElementById('user-drop-down-menu');
let overlay = document.getElementById('overlay');
let userAvatar = document.querySelector('.header__user-info');
let LOGGED_IN_USER;
let STORED_USER_KEY = "";
let rawData;
let isSmallScreen = window.innerWidth < 1025;
if (overlay) {
    overlay.addEventListener('click', hideDlg);
}

function toggleMenuVisiblity() {
    userMenu.classList.toggle('d-none');
}

function displayDlg() {
    const dlg = document.getElementById('dlg-box');
    const overlay = document.getElementById('overlay');
    dlg.classList.remove('d-none');
    overlay.classList.remove('d-none');
}

function hideDlg() {
    const dlg = document.getElementById('dlg-box');
    dlg.classList.add('d-none');
    dlg.classList.remove('dlg-add-task');
    document.getElementById('overlay').classList.add('d-none');
}

function getUserNameInitials(userName) {
    return userName
        .split(' ')
        .filter(Boolean)
        .map(word => word[0].toUpperCase())
        .join('');
}

function setMinDueDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('due-date').setAttribute('min', today);
};

async function saveChangesToDB(multipatch) {
    try {
        let user = STORED_USER_KEY;
        if (!user) {
            throw new Error('No user key found');
        }
        let response = await fetch(DB_URL + "users/" + user + ".json", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(multipatch)
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving to database:', error.message);
        throw error;
    }
}

function getAndStoreUserId(userName) {
    for (const key in rawData) {
        if (rawData[key].name === userName) {
            STORED_USER_KEY = key;
            return STORED_USER_KEY
        }
    }
}

async function fetchAllUsers() {
    try {
        let response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        let data = await response.json();
        rawData = data;
        let userArray = Object.values(data);
        return userArray
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

function extractActiveUserInfo(users) {
    let userLoggedIn = users.find(user => user.loggedIn === true);
    if (userLoggedIn !== undefined) {
        return userLoggedIn.name
    } else {
        return null
    }
}

