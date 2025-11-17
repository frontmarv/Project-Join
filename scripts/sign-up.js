/** Regular expression for validating full names (first and last name) */
const nameInputRegex = /^[a-zA-ZäöüÄÖÜß\-\s]{2,50}$/;

/** @type {HTMLElement} DOM elements for form inputs and validation */
const nameInput = document.getElementById('name');
const nameWrapper = document.getElementById('name__wrapper');
const nameErrorWarning = document.querySelector('.name-error-warning');
const missmatchWarning = document.getElementById('pw-error-warning');
const pwWrapper = document.getElementById('password__wrapper');
const confirmPwWrapper = document.getElementById('confirm-pw__wrapper');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const signUpBtn = document.getElementById('sign-up-btn');
const checkbox = document.getElementById('check');
const email = document.getElementById('email');

/** @type {Object} Tracks form field validation states */
let formState = {
    isNameValid: false,
    isEmailValid: false,
    isPasswordMatch: false,
    isCheckboxChecked: false
};

/**
 * Event handlers for password field changes
 * @listens {Event} keyup
 */
password.addEventListener('keyup', updatePasswordIcon);
confirmPassword.addEventListener('keyup', updatePasswordIcon);

/**
 * Event handler for checkbox changes
 * Updates form state and validates form
 * @listens {Event} change
 */
checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        formState.isCheckboxChecked = true;
    } else {
        formState.isCheckboxChecked = false;
    }
    evaluateFormValidity();
});


/**
 * Updates password field icon based on input state
 * @param {Event} event - The input event object
 * @returns {void}
 */
function updatePasswordIcon(event) {
    let passwordIcon = event.target.parentElement.querySelector('img');
    let inputType = event.target.type;
    if (event.target.value === "") {
        passwordIcon.src = "../assets/img/lock.svg";
    }
    else {
        if (inputType === 'text') {
            passwordIcon.src = '../assets/img/pw-visible.svg';
        } else { passwordIcon.src = '../assets/img/pw-not-visible.svg'; }
    }
}


/**
 * Handles password input changes and validates matching passwords
 * @param {HTMLElement} element - The password input element
 * @returns {void}
 */
function handlePasswordInputChange(element) {
    if (confirmPassword.value !== "") {
        validatePasswordMatch();
    }
}


/**
 * Validates if the input contains a valid full name
 * Maximum 2 words allowed (hyphenated names like Ann-Cathrin count as one word)
 * @param {HTMLElement} element - The name input element
 * @returns {boolean} True if name is valid, false otherwise
 */
function isValidFullName(element) {
    let inputName = element.value.trim();
    if (!inputName) return false;
    
    const testResult = nameInputRegex.test(inputName);
    const letterCount = (inputName.match(/[a-zA-ZäöüÄÖÜß]/g) || []).length;
    const wordCount = inputName.split(/\s+/).filter(word => word.length > 0).length;
    
    return testResult && letterCount >= 2 && wordCount <= 2;
}


/**
 * Handles name input validation and updates UI accordingly
 * @param {HTMLElement} element - The name input element
 * @returns {void}
 */
function handleNameValidation(element) {
    let validInput = isValidFullName(element);
    if (element.value === "") {
        nameWrapper.classList.remove('error', 'valid-input');
        nameErrorWarning.style.visibility= "hidden";
    } else {
        setWrapperColor(validInput, nameWrapper);
    }
    evaluateFormValidity();
}


/**
 * Updates wrapper element styling based on validation state
 * @param {boolean} validInput - Whether the input is valid
 * @param {HTMLElement} elementById - The wrapper element to style
 * @returns {void}
 */
function setWrapperColor(validInput, elementById) {
    elementById.classList.remove('error', 'valid-input');
    if (!validInput) {
        elementById.classList.add('error');
        nameErrorWarning.style.visibility= "visible";
        formState.isNameValid = false;
    } else {
        elementById.classList.add('valid-input');
        nameErrorWarning.style.visibility= "hidden";
        formState.isNameValid = true;
    }
}


/**
 * Validates if passwords match and updates UI accordingly
 * @returns {void}
 */
function validatePasswordMatch() {
    if (confirmPassword.value === "") {
        resetPwStyles();
        formState.isPasswordMatch = false
    } else if (password.value === confirmPassword.value) {
        setPwSuccess();
        formState.isPasswordMatch = true;
    }
    else {
        setPwError();
        formState.isPasswordMatch = false;
    }
    evaluateFormValidity();
}


/**
 * Resets password field styles to default state
 * @returns {void}
 */
function resetPwStyles() {
    missmatchWarning.style.visibility = "hidden";
    pwWrapper.classList.remove('valid-input', 'error');
    confirmPwWrapper.classList.remove('valid-input', 'error');
}


/**
 * Sets password fields to success state
 * @returns {void}
 */
function setPwSuccess() {
    missmatchWarning.style.visibility = "hidden";
    pwWrapper.classList.add('valid-input');
    confirmPwWrapper.classList.add('valid-input');
}


/**
 * Sets password fields to error state
 * @returns {void}
 */
function setPwError() {
    missmatchWarning.style.visibility = "visible";
    pwWrapper.classList.remove('valid-input');
    confirmPwWrapper.classList.remove('valid-input');
    confirmPwWrapper.classList.add('error');
}


/**
 * Toggles password field visibility between text and password
 * @param {HTMLElement} clickedElement - The clicked visibility toggle icon
 * @returns {void}
 */
function setPasswordVisibility(clickedElement) {
    let wrapper = clickedElement.parentElement;
    let passwordInput = wrapper.querySelector('input');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    clickedElement.src =
        passwordInput.type === 'password'
            ? '../assets/img/pw-not-visible.svg'
            : '../assets/img/pw-visible.svg';
}


/**
 * Enables the sign-up button
 * @returns {void}
 */
function enableSignUpBtn() {
    signUpBtn.setAttribute('aria-disabled', 'false');
    signUpBtn.classList.remove('disabled');
}


/**
 * Disables the sign-up button
 * @returns {void}
 */
function disableSignUpBtn() {
    signUpBtn.setAttribute('aria-disabled', 'true');
    signUpBtn.classList.add('disabled');
}


/**
 * Shows success message after successful sign-up
 * @returns {void}
 */
function showSuccessfulSignUpMessage() {
    let body = document.querySelector('body');
    body.innerHTML += renderSuccessMessage();
    let successDlg = document.getElementById('dlg-box');
    document.getElementById('overlay').classList.remove('d-none');
    successDlg.classList.remove('d-none');
    setTimeout(() => {
        successDlg.classList.remove('startposition');
    }, 10);
}


/**
 * Redirects to login page after a delay
 * @returns {void}
 */
function redirectToLoginAfterDelay() {
    setTimeout(() => {
        window.location.replace('../index.html');
    }, 2000);
}


/**
 * Evaluates overall form validity and updates submit button state
 * @returns {void}
 */
function evaluateFormValidity() {
    if (Object.values(formState).every(Boolean)) { enableSignUpBtn() }
    else { disableSignUpBtn() }
}


/**
 * Checks if an email address already exists in the database.
 * Fetches all users and searches for a matching email address.
 * @async
 * @returns {Promise<Object|undefined>} The existing user object if found, undefined otherwise
 */
async function checkEmailAlreadyExists() {
    let data = await fetchData();
    let dataArray = Object.values(data)
    let existingUser = dataArray.find(user => user.email === email.value);
    return existingUser
}