
const databaseURL = "https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/.json";

let users = [];
let tasks = [];

async function getData() {
  try {
    const response = await fetch(databaseURL);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Fetched data:", data);

    // Prüfen, ob users und tasks existieren
    if (data.users) {
      users = Object.entries(data.users).map(([id, u]) => ({ id, ...u }));
    }

    if (data.tasks) {
      tasks = Object.entries(data.tasks).map(([id, t]) => ({ id, ...t }));
    }

  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}


async function saveTaskToFirebase(task, taskKey) {
  // taskKey z.B. "task3"
  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskKey}.json`;

  const response = await fetch(url, {
    method: 'PUT',              // gezielt unter /tasks/taskX schreiben
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task)
  });

  const data = await response.json();
  console.log('Gespeichert unter Key:', taskKey, data);
}


async function getNextTaskKey() {
  const url = 'https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks.json';
  const res = await fetch(url);
  const obj = await res.json() || {};

  // Keys wie "task0", "task12" filtern und höchste Nummer ermitteln
  const nums = Object.keys(obj)
    .map(k => (k.startsWith('task') ? parseInt(k.slice(4), 10) : NaN))
    .filter(n => Number.isInteger(n));

  const next = nums.length ? Math.max(...nums) + 1 : 0;
  return `task${next}`;
}


