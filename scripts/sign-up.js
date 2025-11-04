const nameInputRegex = /^[A-Za-zÄÖÜäöüß]+\s+[A-Za-zÄÖÜäöüß]+$/;

const nameInput = document.getElementById('name');
const nameWrapper = document.getElementById('name__wrapper');
const missmatchWarning = document.getElementById('pw-error-warning');
const pwWrapper = document.getElementById('password__wrapper');
const confirmPwWrapper = document.getElementById('confirm-pw__wrapper');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirm-password');
const signUpBtn = document.getElementById('sign-up-btn');
const checkbox = document.getElementById('check');
const email = document.getElementById('email');

let formState = {
    isNameValid: false,
    isEmailValid: false,
    isPasswordMatch: false,
    isCheckboxChecked: false
};

password.addEventListener('keyup', updatePasswordIcon);
confirmPassword.addEventListener('keyup', updatePasswordIcon);

checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
        formState.isCheckboxChecked = true;
    } else {
        formState.isCheckboxChecked = false;
    }
    evaluateFormValidity();
});


function updatePasswordIcon(event) {
    let passwordIcon = event.target.parentElement.querySelector('img');
    let type = event.target.type;
    if (event.target.value === "") {
        passwordIcon.src = "../assets/img/lock.svg";
    }
    else {
        if (type === 'text') {
            passwordIcon.src = '../assets/img/pw-visible.svg';
        } else { passwordIcon.src = '../assets/img/pw-not-visible.svg'; }
    }
}


function handlePasswordInputChange(element) {
    if (confirmPassword.value !== "") {
        validatePasswordMatch();
    }
}


function isValidFullName(element) {
    let inputName = element.value;
    let test = nameInputRegex.test(inputName);
    return test
}


function handleNameValidation(element) {
    let validInput = isValidFullName(element);
    if (element.value === "") {
        nameWrapper.classList.remove('error', 'valid-input');
    } else {
        setWrapperColor(validInput, nameWrapper);
    }
    evaluateFormValidity();
}


function setWrapperColor(validInput, elementById) {
    elementById.classList.remove('error', 'valid-input');
    if (!validInput) {
        elementById.classList.add('error');
        formState.isNameValid = false;
    } else {
        elementById.classList.add('valid-input');
        formState.isNameValid = true;
    }
}


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


function resetPwStyles() {
    missmatchWarning.style.visibility = "hidden";
    pwWrapper.classList.remove('valid-input', 'error');
    confirmPwWrapper.classList.remove('valid-input', 'error');
}


function setPwSuccess() {
    missmatchWarning.style.visibility = "hidden";
    pwWrapper.classList.add('valid-input');
    confirmPwWrapper.classList.add('valid-input');
}


function setPwError() {
    missmatchWarning.style.visibility = "visible";
    pwWrapper.classList.remove('valid-input');
    confirmPwWrapper.classList.remove('valid-input');
    confirmPwWrapper.classList.add('error');
}


function setPasswordVisibility(clickedElement) {
    let wrapper = clickedElement.parentElement;
    let passwordInput = wrapper.querySelector('input');
    passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    clickedElement.src =
        passwordInput.type === 'password'
            ? '../assets/img/pw-not-visible.svg'
            : '../assets/img/pw-visible.svg';
}


function enableSignUpBtn() {
    signUpBtn.setAttribute('aria-disabled', 'false');
    signUpBtn.classList.remove('disabled');
}


function disableSignUpBtn() {
    signUpBtn.setAttribute('aria-disabled', 'true');
    signUpBtn.classList.add('disabled');
}


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


function redirectToLoginAfterDelay() {
    setTimeout(() => {
        window.location.replace('../index.html');
    }, 2000);
}


function evaluateFormValidity() {
    if (Object.values(formState).every(Boolean)) { enableSignUpBtn() }
    else { disableSignUpBtn() }
}

