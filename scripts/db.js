/**
 * The base URL of the Firebase Realtime Database.
 * All fetch requests use this URL as their root endpoint.
 * @constant {string}
 */
const databaseURL = `${DB_URL}.json`;
/**
 * Global array storing all user objects fetched from Firebase.
 * @type {Array<Object>}
 */
let users = [];


/**
 * Global array storing all task objects fetched from Firebase.
 * @type {Array<Object>}
 */
let tasks = [];


/**
 * Fetches user and task data from Firebase Realtime Database.
 *
 * This function retrieves the entire database JSON, extracts `users` and `tasks`,
 * and populates the global arrays `users` and `tasks` as arrays of objects
 * that include their Firebase ID as an `id` property.
 *
 * @async
 * @function getData
 * @returns {Promise<void>} Resolves when data is successfully fetched and stored.
 * @throws {Error} Logs an error message if the fetch request fails.
 *
 * @example
 * await getData();
 * console.log(users, tasks);
 */
async function getData() {
  try {
    const res = await fetch(databaseURL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const { users: u, tasks: t } = await res.json();

    users = u ? Object.entries(u).map(([id, user]) => ({ id, ...user })) : [];
    tasks = t ? Object.entries(t).map(([id, task]) => ({ id, ...task })) : [];

  } catch (err) {
    console.error("Error fetching data:", err.message);
  }
}


/**
 * Saves a single task object to Firebase under a specific key.
 *
 * Uses HTTP PUT to write or overwrite the task at `tasks/{taskKey}` in Firebase.
 *
 * @async
 * @function saveTaskToFirebase
 * @param {Object} task - The task object to be saved.
 * @param {string} taskKey - The unique key (e.g. "task5") where the task is stored.
 * @returns {Promise<void>} Resolves when the task has been successfully saved.
 *
 * @example
 * const newTask = { title: "New Task", description: "Do something" };
 * await saveTaskToFirebase(newTask, "task12");
 */
async function saveTaskToFirebase(task, taskKey) {
  const url = `${databaseURL}tasks/${taskKey}.json`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  const data = await response.json();
}


/**
 * Generates the next available Firebase task key (e.g. "task0", "task1", …).
 *
 * This function fetches all existing task keys, extracts their numeric parts,
 * and returns a new key incremented by one from the highest existing number.
 * If no tasks exist, it returns "task0".
 *
 * @async
 * @function getNextTaskKey
 * @returns {Promise<string>} The next unique task key for Firebase.
 *
 * @example
 * const key = await getNextTaskKey();
 * console.log(key); // "task7"
 */
async function getNextTaskKey() {
  const url = `${databaseURL}tasks.json`;
  const res = await fetch(url);
  const obj = await res.json() || {};

  const nums = Object.keys(obj)
    .map(k => (k.startsWith('task') ? parseInt(k.slice(4), 10) : NaN))
    .filter(n => Number.isInteger(n));

  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return `task${next}`;
}