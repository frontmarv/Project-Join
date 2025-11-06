function renderAddContactDlg() {
    dialog.innerHTML = getAddContactDlgTpl();
    showDlgWtihAnimation();
}


function renderDeleteContactDlg() {
    hideContactActionMenu();
    dialog.innerHTML = getDeleteContactDlg();
    dialog.classList.add('delete-contact__dialog');
    showDlgWtihAnimation();
}

function renderEditContactDlg() {
    dialog.innerHTML = getEditContactDlgTpl();
    document.getElementById("contact-dlg-name-input").value = contactName.innerHTML;
    document.getElementById("contact-dlg-email-input").value = contactMail.innerHTML;
    document.getElementById("contact-dlg-phone-input").value = contactPhone.innerHTML;
    let userName = contactName.innerHTML;
    let profilImgColor = document.getElementById('colored-circle__big').getAttribute('fill');
    let userInitals = getUserNameInitials(userName);
    document.querySelector('.profil-img__wrapper').innerHTML = getBigUserProfilImg(profilImgColor, userInitals);
    showDlgWtihAnimation();
    getAndStoreUserId(userName);
}


function showDlgWtihAnimation() {
    displayDlg();
    setTimeout(() => {
        dialog.classList.add('show');
    }, 100);
}


function removeAnimationClass() {
    dialog.classList.remove('show');
    setTimeout(() => {
        hideDlg();
    }, 300);
}


function setMultipatch() {
    let nameValue = document.getElementById("contact-dlg-name-input").value;
    let emailValue = document.getElementById("contact-dlg-email-input").value;
    let phoneValue = document.getElementById("contact-dlg-phone-input").value;
    let multipatch = {
        "name": nameValue,
        "email": emailValue,
        "phone": phoneValue
    };
    return multipatch
}


function validateAndSaveData() {
    let userName = document.getElementById('contact-dlg-name-input').value;
    if (userName === "") {
        wrongInputPulseAnimation();
        return;
    } else {
        saveDataEditContactDlg()
    }
}


async function saveDataEditContactDlg() {
    removeAnimationClass();
    let multipatch = setMultipatch();
    await saveChangesToDB(multipatch);
    await renderContactList();
    let userName = rawData[STORED_USER_KEY].name;
    markStoredContactAsSelected(userName);
    let contactInfo = getContactInfofromContactlistandDB(userName);
    setContactInfoIntoCard(contactInfo);
    if (window.innerWidth < 1025) {
        showContact = true;
        handleResizeScreenContacts();
    }
}


function markStoredContactAsSelected(userName) {
    let nodelist = document.querySelectorAll('.contact-list__item');
    nodelist.forEach(item => {
        if (item.querySelector('.contact-name').innerHTML === userName) {
            styleContactSelected(item);
        }
    })
}


async function putNewContactToDB() {
    let { key, data, addUserName } = collectDataAddContactDlg()
    let validInput = validateInputAddContact(addUserName);
    if (!validInput) {
        wrongInputPulseAnimation();
        return;
    } else {
        await pushDataToDB(key, data);
        removeAnimationClass();
        renderContactList();
        setContactCardtoInvisible();
        AddContactSuccessDlg();
    }
}


function collectDataAddContactDlg() {
    let addUserName = document.getElementById('contact-dlg-name-input').value;
    let addEmail = document.getElementById('contact-dlg-email-input').value;
    let addPhone = document.getElementById('contact-dlg-phone-input').value;
    let key = generateUserId(addUserName);
    let data = createDataObjectAddContact(addUserName, addEmail, addPhone);
    return { key, data, addUserName };
}


function validateInputAddContact(addUserName) {
    if (addUserName !== "") {
        return true
    }
}


function wrongInputPulseAnimation() {
    document.querySelectorAll('.inputfield__wrapper').forEach(element => {
        element.style.borderColor = "var(--color-error)";
    });
    setTimeout(() => {
        document.querySelectorAll('.inputfield__wrapper').forEach(element => {
            element.style.borderColor = "var(--color-lightgrey";
        });
    }, 500);
}


function createDataObjectAddContact(addUserName, addEmail, addPhone) {
    let modifiedUserName = capitalizeInitials(addUserName)
    let color = getRandomColor();
    let data = {
        name: modifiedUserName,
        email: addEmail,
        password: "",
        phone: addPhone,
        profilImgColor: color,
        loggedIn: false,
    }
    return data
}


