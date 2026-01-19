// ======================================================
// 🔹 TASKS: LOADING, CRUD, SORTING
// ======================================================

/**
 * Defines the current sorting mode for tasks.
 * Default is set to "dueDate" so tasks are initially sorted by due date.
 *
 * @type {"dueDate" | "priority" | "title"}
 */
let currentSortMode = "dueDate";

/**
 * Loads all tasks from the global task list and renders them into their
 * corresponding columns, applying sorting and overdue highlighting.
 *
 * @returns {void}
 */
function loadTasks() {
  clearColumns();
  const sorted = sortTasks(tasks);
  sorted.forEach(task => appendTaskToColumn(task));
  updateAllPlaceholders();
  markOverdueDates();
}


/**
 * Deletes a specific task from Firebase and refreshes the board.
 *
 * @async
 * @param {string} taskId - ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  try {
    const url = `${DB_URL}}/tasks/${taskId}.json`;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error(`Error: ${response.status}`);
    await getData();
    loadTasks();
    updateAllPlaceholders();
    hideDlg();
  } catch (error) {
    console.error("Error deleting task:", error);
  }
}


/**
 * Clears all existing tasks from the board columns before re-rendering.
 *
 * @returns {void}
 */
function clearColumns() {
  Object.values(columnMap).forEach(id => {
    document.getElementById(id).innerHTML = "";
  });
}


/**
 * Appends a single task card to its corresponding column.
 *
 * @param {Object} task - Task object containing all task properties.
 * @param {string} task.taskState - The current state of the task.
 * @returns {void}
 */
function appendTaskToColumn(task) {
  const colId = columnMap[task.taskState];
  if (!colId) return;
  const col = document.getElementById(colId);
  const surroundingTasks = getSurroundingCategories(task);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getTasksTemplate(task, surroundingTasks).trim();
  col.appendChild(wrapper.firstElementChild);
}

/**
 * Fills the edit task dialog inputs with existing task data.
 *
 * @param {Object} task - Task object to populate into the form.
 * @param {string} [task.title] - Task title.
 * @param {string} [task.description] - Task description.
 * @param {string} [task.dueDate] - Task due date (ISO string).
 * @param {string} [task.priority] - Priority key (urgent|medium|low).
 * @returns {void}
 */
function fillEditFormWithTaskData(task) {
  document.getElementById("title-input").value = task.title || "";
  document.getElementById("descriptions-input").value = task.description || "";
  document.getElementById("due-date").value = task.dueDate || "";
  const btn = document.getElementById(task.priority);
  if (btn) changePriorityBtn(btn);
  loadSubtasksIntoForm(task);
}


/**
 * Loads and renders subtasks inside the edit task dialog.
 *
 * @param {Object} task - Task object containing subtasks.
 * @param {Object<string, {task: string}>} [task.subtasks] - Subtasks keyed by ID.
 * @returns {void}
 */
function loadSubtasksIntoForm(task) {
  const ul = document.querySelector(".dlg-edit__subtask-list");
  if (!ul) return;
  ul.innerHTML = "";
  if (!task.subtasks) return;
  Object.values(task.subtasks).forEach(subtask => {
    if (!subtask?.task) return;
    const li = document.createElement("li");
    li.innerHTML = getSubtaskTpl(subtask.task).trim();
    ul.appendChild(li.firstElementChild);
  });
}


// ======================================================
// 🔹 SORTING HELPERS (LOGIC ONLY, UI IN board-ui.js)
// ======================================================

/**
 * Returns a sorted copy of the provided task list.
 * Automatically ensures a valid sorting mode ("dueDate", "priority", "title").
 *
 * @param {Array<Object>} taskList - Array of task objects.
 * @returns {Array<Object>} Sorted array of tasks.
 */
function sortTasks(taskList) {
  const sorted = [...taskList];
  ensureValidSortMode();
  return sortByCurrentMode(sorted);
}


/**
 * Ensures the current sort mode is valid, otherwise resets it to "dueDate".
 *
 * @returns {void}
 */
function ensureValidSortMode() {
  const validModes = ["dueDate", "priority", "title"];
  if (!validModes.includes(currentSortMode)) currentSortMode = "dueDate";
}


/**
 * Sorts a list of tasks based on the active sort mode.
 *
 * @param {Array<Object>} tasks - Array of task objects to sort.
 * @returns {Array<Object>} Sorted array of tasks.
 */
function sortByCurrentMode(tasks) {
  switch (currentSortMode) {
    case "dueDate":
      return tasks.sort(compareByDueDate);
    case "priority":
      return tasks.sort(compareByPriority);
    case "title":
      return tasks.sort(compareByTitle);
    default:
      return tasks;
  }
}


/**
 * Comparison function for sorting tasks by due date (earliest first).
 *
 * @param {Object} a - Task A.
 * @param {string} [a.dueDate] - Due date of task A.
 * @param {Object} b - Task B.
 * @param {string} [b.dueDate] - Due date of task B.
 * @returns {number} Sorting order result.
 */
function compareByDueDate(a, b) {
  const dateA = new Date(a.dueDate || Infinity);
  const dateB = new Date(b.dueDate || Infinity);
  return dateA - dateB;
}


/**
 * Comparison function for sorting tasks by priority.
 * Order: urgent → medium → low.
 *
 * @param {Object} a - Task A.
 * @param {string} [a.priority] - Priority of task A.
 * @param {Object} b - Task B.
 * @param {string} [b.priority] - Priority of task B.
 * @returns {number} Sorting order result.
 */
function compareByPriority(a, b) {
  const order = { urgent: 1, medium: 2, low: 3 };
  return (order[a.priority] || 99) - (order[b.priority] || 99);
}


/**
 * Comparison function for sorting tasks alphabetically by title (A–Z).
 *
 * @param {Object} a - Task A.
 * @param {string} [a.title] - Title of task A.
 * @param {Object} b - Task B.
 * @param {string} [b.title] - Title of task B.
 * @returns {number} Sorting order result.
 */
function compareByTitle(a, b) {
  return (a.title || "").localeCompare(b.title || "");
}
