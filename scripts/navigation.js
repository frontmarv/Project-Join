/**
 * Event handler for window resize.
 * Adjusts navigation layout for different screen sizes.
 * @listens {Event} resize
 */
window.addEventListener("resize", handleResizeScreen);

/**
 * Event handler for page load.
 * Initializes navigation layout based on initial screen size.
 * @listens {Event} load
 */
window.addEventListener("load", handleResizeScreen);

/**
 * Tracks if the mobile logo has been added to the DOM.
 * @type {boolean}
 */
let logoAdded = false;

/**
 * Tracks if the help link has been added to the dropdown menu.
 * @type {boolean}
 */
let helpAdded = false;


/**
 * Handles screen resize events and updates navigation elements accordingly.
 * Determines if screen is small and triggers logo and help link updates.
 * @returns {void}
 */
function handleResizeScreen() {
    const isSmallScreen = window.innerWidth < 1025;
    handleLogo(isSmallScreen);
    handleHelp(isSmallScreen);
}


/**
 * Manages logo display based on screen size.
 * Replaces page title with logo on small screens, restores title on larger screens.
 * @param {boolean} isSmallScreen - True if screen width is below 1025px
 * @returns {void}
 */
function handleLogo(isSmallScreen) {
    if (isSmallScreen && !logoAdded) {
        document.getElementById('page-title').innerHTML = getJoinLogo();
        logoAdded = true;
    } else if (!isSmallScreen && logoAdded) {
        document.getElementById('join-logo')?.remove();
        document.getElementById('page-title').innerHTML = "Kanban Project Management Tool";
        logoAdded = false;
    }
}


/**
 * Manages help link visibility in dropdown menu based on screen size.
 * Adds help link to dropdown on small screens, removes it on larger screens.
 * @param {boolean} isSmallScreen - True if screen width is below 1025px
 * @returns {void}
 */
function handleHelp(isSmallScreen) {
    const dropDownMenu = document.querySelector('.user-drop-down-menu');
    if (dropDownMenu == null) { return; }
    if (isSmallScreen && !helpAdded) {
        dropDownMenu.insertAdjacentHTML('afterbegin', getLinkToHelp());
        helpAdded = true;
    } else if (!isSmallScreen && helpAdded) {
        document.getElementById('link-to-help')?.remove();
        helpAdded = false;
    }
}