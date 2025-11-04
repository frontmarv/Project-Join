function generateUserId(userName) {
  let initials = getUserNameInitials(userName)
  const randomNumbers = Math.floor(100 + Math.random() * 900);
  return `${initials}${randomNumbers}`;
}


function capitalizeInitials(userName) {
  return userName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}


function getRandomColor() {
  const colors = [
    '--color-1', '--color-2', '--color-3', '--color-4', '--color-5',
    '--color-6', '--color-7', '--color-8', '--color-9', '--color-10',
    '--color-11', '--color-12', '--color-13', '--color-14', '--color-15'
  ];
  const randomColorVar = colors[Math.floor(Math.random() * colors.length)];
  return getComputedStyle(document.documentElement).getPropertyValue(randomColorVar).trim();
}


function createDataObject() {
  let userName = capitalizeInitials(nameInput.value)
  let color = getRandomColor();
  let data = {
    name: userName,
    email: email.value,
    password: password.value,
    phone: "",
    profilImgColor: color,
    loggedIn: false,
  }
  return data
}


async function pushDataToDB(key, data) {
  let response = await fetch(DB_URL + "users/" + key + ".json", {
    method: "PUT",
    header: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data)
  });
  let responseToJson = await response.json();
}


function sendSignupForm() {
  let key = generateUserId(nameInput.value);
  let data = createDataObject();
  pushDataToDB(key, data);
  showSuccessfulSignUpMessage();
  redirectToLoginAfterDelay();
}


