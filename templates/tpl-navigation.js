/**
 * Generates the Join logo image element.
 * Used to replace page title on small screens for mobile navigation.
 * @returns {string} HTML string containing Join logo image with alt text
 */
function getJoinLogo() {
  return /*html*/ `
    <img id="join-logo"
        src="../assets/img/logo-black.png"
        alt="the word 'Join' with a big J with a blue dot on the left side">
  `;
}

/**
 * Generates a help link list item for dropdown menu.
 * Inserted into user dropdown menu on small screens for mobile access.
 * @returns {string} HTML string containing help link list item
 */
function getLinkToHelp() {
  return /*html*/ `
    <li><a href="./help.html" id="link-to-help">Help</a></li>
  `;
}
