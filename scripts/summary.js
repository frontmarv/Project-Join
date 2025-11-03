const greetingName = document.getElementById('greeting-name');
const greetingHeader = document.getElementById('greeting-header');
let hasShownGreeting = sessionStorage.getItem('greetingShown');

if (!hasShownGreeting && isSmallScreen) {
    showGreetingMobile();
    sessionStorage.setItem('greetingShown', 'true');
}

async function initSummary() {
    await getData();
    let users = await fetchAllUsers();
    let loggedInUser = extractActiveUserInfo(users);
    setGreetingHeader();
    setGreetingName(loggedInUser);
    getDeadlineDates();
    countToDos();
}


function setGreetingHeader() {
    let hour = new Date().getHours();
    let greetingText = "";
    if (hour < 12) {
        greetingText = "Good morning,"
    } else if (hour < 18) {
        greetingText = "Good afternoon,"
    } else {
        greetingText = "Good evening,"
    }
    greetingHeader.textContent = greetingText;
}


function setGreetingName(loggedInUser) {
    if (loggedInUser !== null) {
        greetingName.innerHTML = loggedInUser;
    } else {
        greetingName.innerHTML = "";
        greetingHeader.textContent = greetingHeader.textContent.replace(',', '!');
    }
}


/* function currentDate() {
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    let date = document.getElementById('current-date');
    let currentDate = new Date();
    let day = currentDate.getDate();
    let month = months[currentDate.getMonth()];
    let year = currentDate.getFullYear();

    let completeDate = `${month} ${day}, ${year}`;
    date.textContent = completeDate;
} */

function countToDos() {
    const awaitingFeedback = document.getElementById('awaiting-feedback');
    const inProgress = document.getElementById('in-progress-count');
    const tasksInBoard = document.getElementById('tasks-count');
    const done = document.getElementById('done-count');
    const toDos = document.getElementById('to-do-count');
    const urgent = document.getElementById('urgent-count');
    [toDos, done, urgent, inProgress, awaitingFeedback, tasksInBoard].forEach(counter => counter.innerHTML = "0");
    for (let index = 0; index < tasks.length; index++) {
        countingLoop(index, { toDos, done, urgent, inProgress, awaitingFeedback, tasksInBoard }, tasks);
    }
    tasksInBoard.textContent = tasks.length;
}


function countingLoop(index, counters, tasks) {
    const task = tasks[index];
    const countRules = [
        { field: 'taskState', match: 'to-do', counter: 'toDos' },
        { field: 'taskState', match: 'done', counter: 'done' },
        { field: 'taskState', match: 'in-progress', counter: 'inProgress' },
        { field: 'taskState', match: 'await-feedback', counter: 'awaitingFeedback' },
        { field: 'priority', match: 'urgent', counter: 'urgent' }
    ];
    countRules.forEach(rule => {
        if (task[rule.field] === rule.match) {
            counters[rule.counter].innerHTML = Number(counters[rule.counter].innerHTML) + 1;
        }
    }
    );
}


function getDeadlineDates() {
    let allDeadlines = [];
    for (let index = 0; index < tasks.length; index++) {
        if (tasks[index].priority === "urgent") {
            allDeadlines.push(tasks[index].dueDate);
        }
    }
    allDeadlines.sort((a, b) => new Date(a) - new Date(b));
    showUpcomingDeadline(allDeadlines);
}


function showUpcomingDeadline(allDeadlines) {
    let deadLine = document.getElementById('next-due-date');
    deadLine.innerHTML = "";
    if (allDeadlines.length === 0) {
        deadLine.innerHTML = "";
    } else {
        deadLine.innerHTML = formatDate(allDeadlines[0]);
    }
}


function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE");
}


function showGreetingMobile() {
    document.querySelector('.summary-content__left').classList.add('d-none');
    document.querySelector('.summary-content__right').classList.add('greetingMobile');
    setTimeout(() => {
        document.querySelector('.summary-content__right').classList.remove('greetingMobile');
    }, 1000);
    setTimeout(() => {
        document.querySelector('.summary-content__right').classList.add('d-none');
        document.querySelector('.summary-content__left').classList.remove('d-none');
    }, 1600);
}


