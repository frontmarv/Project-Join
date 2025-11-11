/**
 * Checks if a user is logged in by verifying session storage.
 * Redirects to login page if no valid login session is found.
 * @returns {void}
 */
function checkForLogin() {
    const loggedInStatus = sessionStorage.getItem('loggedIn');
    if (loggedInStatus == null) {
        window.location.replace("../index.html");
    }
}

checkForLogin();

/**
 * Event handler for pageshow event.
 * Handles browser back/forward cache (bfcache) scenarios by re-checking login status.
 * Prevents unauthorized access when user navigates back to page from cache.
 * @listens {PageTransitionEvent} pageshow
 * @param {PageTransitionEvent} event - The pageshow event object
 * @param {boolean} event.persisted - True if page was loaded from bfcache
 */
window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        const loggedInStatus = sessionStorage.getItem('loggedIn');
        if (loggedInStatus == null) {
            window.location.replace("../index.html");
        }
    }
});