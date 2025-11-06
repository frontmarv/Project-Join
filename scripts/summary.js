/** @type {HTMLElement | null} */
const greetingHeader = document.getElementById('greeting-header');

/** @type {HTMLElement | null} */
const greetingName = document.getElementById('greeting-name');

let hasShownGreeting = sessionStorage.getItem('greetingShown');

if (!hasShownGreeting && window.innerWidth < 1025) {
    showGreetingMobile();
    sessionStorage.setItem('greetingShown', 'true');
}

/**
 * Counts various task states based on fixed rules.
 * Defined globally since the rules are static and reused multiple times.
 * @type {Array<{field: string, match: string, counter: string}>}
 */
const countRules = [
    { field: 'taskState', match: 'to-do', counter: 'toDos' },
    { field: 'taskState', match: 'done', counter: 'done' },
    { field: 'taskState', match: 'in-progress', counter: 'inProgress' },
    { field: 'taskState', match: 'await-feedback', counter: 'awaitingFeedback' },
    { field: 'priority', match: 'urgent', counter: 'urgent' }
];

/**
 * Initializes the summary page: loads data, displays the greeting, and counts tasks.
 * @async
 * @returns {Promise<void>}
 */
async function initSummary() {
    await getData();
    let users = await fetchAllUsers();
    let loggedInUser = extractActiveUserInfo(users);
    setGreetingHeader();
    setGreetingName(loggedInUser);
    getDeadlineDates();
    countToDos();
}

/**
 * Sets the greeting header based on the current time of day.
 * @returns {void}
 */
function setGreetingHeader() {
    let hour = new Date().getHours();
    let greetingText = "";
    if (hour < 12) greetingText = "Good morning,";
    else if (hour < 17) greetingText = "Good afternoon,";
    else greetingText = "Good evening,";
    greetingHeader.textContent = greetingText;
}

/**
 * Displays the logged-in user's name in the greeting message.
 * @param {string|null} loggedInUser - The name of the logged-in user, or null if none is logged in.
 * @returns {void}
 */
function setGreetingName(loggedInUser) {
    if (loggedInUser !== null) {
        greetingName.innerHTML = loggedInUser;
    } else {
        greetingName.innerHTML = "";
        greetingHeader.textContent = greetingHeader.textContent.replace(',', '!');
    }
}

/**
 * Counts all tasks by status and priority and updates the HTML counters.
 * @returns {void}
 */
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

/**
 * Increments counters for a specific task based on predefined counting rules.
 * @param {number} index - The index of the current task in the array.
 * @param {Object<string, HTMLElement>} counters - An object containing all counter elements.
 * @param {Array<Object>} tasks - The array of all task objects.
 * @returns {void}
 */
function countingLoop(index, counters, tasks) {
    const task = tasks[index];
    countRules.forEach(rule => {
        if (task[rule.field] === rule.match) {
            counters[rule.counter].innerHTML = Number(counters[rule.counter].innerHTML) + 1;
        }
    });
}

/**
 * Retrieves all task deadlines, sorts them, and displays the next upcoming due date.
 * @returns {void}
 */
function getDeadlineDates() {
    let allDeadlines = [];
    for (let index = 0; index < tasks.length; index++) {
        if (tasks[index].taskState !== "done") {
            allDeadlines.push(tasks[index].dueDate);
        }
    }
    allDeadlines.sort((a, b) => new Date(a) - new Date(b));
    showUpcomingDeadline(allDeadlines);
}

/**
 * Displays the next upcoming due date on the page.
 * @param {Array<string>} allDeadlines - A list of all deadlines (ISO date strings).
 * @returns {void}
 */
function showUpcomingDeadline(allDeadlines) {
    let deadLine = document.getElementById('next-due-date');
    deadLine.innerHTML = "";
    if (allDeadlines.length > 0) {
        deadLine.innerHTML = formatDate(allDeadlines[0]);
    }
}

/**
 * Formats a date string into German date format (dd.mm.yyyy).
 * @param {string} dateStr - A date in ISO string format.
 * @returns {string} The formatted date.
 */
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("de-DE");
}

function showGreetingMobile() {
    document.querySelector('.summary-content__left').classList.add('d-none');
    document.querySelector('.summary-content__right').classList.add('greetingMobile');
    document.querySelector('.summary-content__right').style.display = "block";
    setTimeout(() => {
        document.querySelector('.summary-content__right').classList.remove('greetingMobile');
    }, 1000);
    setTimeout(() => {
        document.querySelector('.summary-content__right').style.display = "none";
        document.querySelector('.summary-content__left').classList.remove('d-none');
    }, 1600);
}