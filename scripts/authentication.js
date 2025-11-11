function checkForLogin() {
    let loggedInStatus = sessionStorage.getItem('loggedIn');
    if (loggedInStatus == null) {
        window.location.replace("../index.html");
    }
}

checkForLogin();


window.addEventListener('pageshow', function (event) {
    if (event.persisted) {
        let loggedInStatus = sessionStorage.getItem('loggedIn');
        if (loggedInStatus == null) {
            window.location.replace("../index.html");
        }
    }
});