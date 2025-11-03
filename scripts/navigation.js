window.addEventListener("resize", handleResizeScreen);
window.addEventListener("load", handleResizeScreen);

let logoAdded = false;
let helpAdded = false;

function handleResizeScreen() {
    let isSmallScreen = window.innerWidth < 1025;
    handleLogo(isSmallScreen);
    handleHelp(isSmallScreen);
}

function handleLogo(isSmallScreen) {
    if (isSmallScreen && !logoAdded) {
        document.getElementById('page-title').innerHTML = getJoinLogo();
        logoAdded = true;
    } else if (!isSmallScreen && logoAdded) {
        document.getElementById('join-logo')?.remove();
        logoAdded = false;
    }
}

function handleHelp(isSmallScreen) {
    let dropDownMenu = document.querySelector('.user-drop-down-menu');
    if(dropDownMenu == null){return}
    if (isSmallScreen && !helpAdded) {
        dropDownMenu.insertAdjacentHTML('afterbegin', getLinkToHelp());
        helpAdded = true;
    } else if (!isSmallScreen && helpAdded) {
        document.getElementById('link-to-help')?.remove();
        helpAdded = false;
    }
}