const email = document.getElementById('email');
const emailWrapper = document.getElementById('email__wrapper');
const password = document.getElementById('password');
const passwordWrapper = document.getElementById('password__wrapper');
const errorMsg = document.getElementById('pw-error-warning');
const passwordIcon = document.getElementById('password-icon');
const logo = document.getElementById('joinlogo');
const headerSignup = document.querySelector('.header__signup');
const main = document.querySelector('main');
const footer = document.querySelector('footer');
const welcomeScreenBckgrnd = document.getElementById('welcomescreen-mobile');
let headerAdded = false;


window.addEventListener("DOMContentLoaded", () => {
    let animationImages = [
        "../assets/img/logo-black.png",
        "../assets/img/logo-white.png"
    ];
    animationImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
});

window.addEventListener("resize", handleResizeScreen);
window.addEventListener("load", handleResizeScreen);
email.addEventListener('keyup', clearLoginError());
password.addEventListener('keyup', () => {
    clearLoginError();
    updatePasswordLockIcon();
});
window.addEventListener('load', () => {
    if (window.innerWidth < 1025) {
        setTimeout(() => {
            welcomeScreenBckgrnd.classList.add('hidden');
            fullsizeScreenWelcome();
        }, 300);
        setTimeout(() => {
            logo.classList.remove('welcome-logo');
        }, 400);
    } else {
        welcomeScreenBckgrnd.classList.add('d-none');
        fullsizeScreenWelcome();
    }
});

function fullsizeScreenWelcome() {
    setTimeout(() => {
        logo.classList.remove('start');
    }, 200);
    setTimeout(() => {
        footer.classList.remove('invisible');
        main.classList.remove('invisible');
        headerSignup.classList.remove('invisible');
    }, 600);
}

async function fetchData() {
    try {
        const response = await fetch(DB_URL + "users/" + ".json");
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        rawData = await response.json();
        return rawData
    } catch (error) {
        console.error("Error fetching data:", error.message);
        return null;
    }
}

async function attemptLogin() {
    let data = await fetchData();
    let dataArray = Object.values(data)
    let existingUser = dataArray.find(user => user.email === email.value);
    let loginIsValid = validateLoginInputs(existingUser);
    if (loginIsValid) {
        getAndStoreUserId(existingUser.name);
        let multipatch = { "loggedIn": true };
        await saveChangesToDB(multipatch);
        window.location.replace("./pages/summary.html");
    }
}

function validateLoginInputs(existingUser) {
    if (existingUser == undefined || verifyPassword(existingUser) == false) {
        showLoginError();
        return false;
    } else { return true }
}

function verifyPassword(existingUser) {
    return existingUser.password === password.value;
}

function showLoginError() {
    errorMsg.style.visibility = "visible";
    emailWrapper.classList.add('error');
    passwordWrapper.classList.add('error');
}

function clearLoginError() {
    errorMsg.style.visibility = "hidden";
    emailWrapper.classList.remove('error');
    passwordWrapper.classList.remove('error');
}

function togglePasswordVisibility() {
    password.type = password.type === 'password' ? 'text' : 'password';
    togglePasswordIcon();
}

function updatePasswordLockIcon() {
    if (password.value === "") {
        passwordIcon.src = "../assets/img/lock.svg";
    } else {
        togglePasswordIcon();
    }
}

function togglePasswordIcon() {
    if (password.type === 'password') {
        passwordIcon.src = '../assets/img/pw-not-visible.svg';
    }
    else {
        passwordIcon.src = '../assets/img/pw-visible.svg';
    }
}

function handleResizeScreen() {
    let isSmallScreen = window.innerWidth < 1025;
    if (isSmallScreen && !headerAdded) {
        main.insertAdjacentHTML('beforeend', renderHeaderSignup());
        headerAdded = true;
    } else if (!isSmallScreen && headerAdded) {
        let header = document.getElementById('header__mobile-signup');
        if (header) header.remove();
        headerAdded = false;
    }
}
