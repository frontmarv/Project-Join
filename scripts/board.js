// ======================================================
// 🔹 CONSTANTS & BASE
// ======================================================

/**
 * Maps internal task states to their corresponding column IDs in the DOM.
 * Used to determine where each task should be rendered on the board.
 * @type {Record<string, string>}
 */
const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};


/**
 * Retrieves a user's name by their unique ID.
 * @param {string} id - The user’s unique identifier.
 * @returns {string} The user's name, or "Unknown User" if not found.
 */
const getUserNameById = id => {
  const user = users.find(user => user.id === id);
  return user?.name || "Unknown User";
};


/**
 * Retrieves a user's profile color by their unique ID.
 * @param {string} id - The user’s unique identifier.
 * @returns {string|null} The user's profile color, or null if not found.
 */
const getUserPicById = id => {
  const user = users.find(user => user.id === id);
  return user?.profilImgColor || null;
};


/**
 * Returns the initials of a given user name (e.g., "Max Mustermann" → "MM").
 * Safely handles invalid or missing input.
 * @param {string} [userName=""] - The full name of the user.
 * @returns {string} User initials, or "?" if not available.
 */
function getUserNameInitials(userName = "") {
  if (typeof userName !== "string" || !userName.trim()) {
    return "?";
  }

  return userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase())
    .join("") || "?";
}


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/**
 * Initializes the Kanban board.
 * Loads task data, sets up drag & drop, initializes search, sorting,
 * overdue detection, and event listeners for responsive layout.
 * @async
 * @returns {Promise<void>}
 */
async function initBoard() {
  await getData();
  loadTasks();
  initDragAndDrop();
  markOverdueDates();
  updateAllPlaceholders();
  initSearch();
  initSorting();
  enableSearchBoxClickFocus();
}


/**
 * Enables click-to-focus behavior for search boxes in the board header.
 * Allows clicking anywhere inside the search box container to focus the input.
 */
function enableSearchBoxClickFocus() {
  document.addEventListener('click', event => {
    const box = event.target.closest('.board__head__searchbox');
    if (!box) return;
    focusSearchInput(box);
  });
}


/**
 * Focuses and selects text in the search input inside a given search box.
 * @param {HTMLElement} box - The search box container element.
 */
function focusSearchInput(box) {
  const input = box.querySelector('input');
  if (input) {
    input.focus();
    input.select();
  }
}


// ======================================================
// 🔹 RENDER: TASK INFO DIALOG
// ======================================================

/**
 * Opens and displays the task info dialog for the given task ID.
 * Fetches fresh task data and restores scroll position after rendering.
 * @async
 * @param {string} taskId - The unique ID of the task to display.
 * @returns {Promise<void>}
 */
async function renderTaskInfoDlg(taskId) {
  await getData();
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  const savedScroll = saveScrollPositions(['.dlg__main']);
  setupTaskInfoDialog(task);
  displayDlg();
  requestAnimationFrame(() => restoreScrollPositions(savedScroll));
}


/**
 * Generates the task info dialog markup and injects it into the DOM.
 * @param {Object} task - Task object containing all task details.
 * @returns {HTMLElement} The rendered dialog container element.
 */
function setupTaskInfoDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskInfoDlgTpl(task);
  return dlgBox;
}


// ======================================================
// 🔹 RENDER: TASK EDIT DIALOG
// ======================================================

/**
 * Opens the edit dialog for a specific task, allowing updates to its details.
 * @async
 * @param {string} taskId - The unique ID of the task to edit.
 * @returns {Promise<void>}
 */
async function renderTaskEditDlg(taskId) {
  await getData();
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;

  setupTaskEditDialog(task);
  displayDlg();
  initializeTaskEditFeatures(task);
}


/**
 * Generates and injects the edit dialog HTML for a given task.
 * @param {Object} task - Task object with current task data.
 * @returns {HTMLElement} The rendered dialog container element.
 */
function setupTaskEditDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskEditDlgTpl(task);
  return dlgBox;
}


/**
 * Initializes the interactive features within the edit dialog:
 * subtasks, contact assignment, and priority selection.
 * @param {Object} task - Task object being edited.
 */
function initializeTaskEditFeatures(task) {
  initSubtaskInput();
  initSubtaskIconButtons();
  initSubtaskHandlers();
  fillEditFormWithTaskData(task);
  populateAssignmentListFromFirebase(task);
}


// ======================================================
// 🔹 RENDER: ADD TASK DIALOG
// ======================================================

/**
 * Opens the "Add Task" dialog or redirects to the mobile page,
 * depending on the current viewport size.
 * @async
 * @param {string} [defaultTaskState="to-do"] - Default task state.
 * @returns {Promise<void>}
 */
async function renderAddTaskDlg(defaultTaskState = "to-do") {
  if (shouldRedirectToMobile()) return redirectToAddTaskPage();
  const dlg = setupAddTaskDialog(defaultTaskState);
  await loadAddTaskContent(dlg);
  initializeAddTaskFeatures(dlg);
  dueDateValidation();
  bindLiveRequiredClear('title', 'title-error');
  showAddTaskDialog(dlg);
}


/**
 * Determines if the user should be redirected to the mobile Add Task page.
 * @returns {boolean} True if viewport width is below 1025px.
 */
function shouldRedirectToMobile() {
  return window.innerWidth < 1025;
}


/**
 * Redirects the user to the standalone "Add Task" page for mobile view.
 */
function redirectToAddTaskPage() {
  window.location.replace('../pages/add-task.html');
}


/**
 * Generates and injects the Add Task dialog HTML into the DOM.
 * @param {string} defaultTaskState - Initial task state (e.g. "to-do").
 * @returns {HTMLElement} The dialog element.
 */
function setupAddTaskDialog(defaultTaskState) {
  const dlg = document.getElementById("dlg-box");
  dlg.classList.add("dlg-add-task");
  dlg.innerHTML = getAddTaskDlgTpl(defaultTaskState);
  return dlg;
}


/**
 * Loads and initializes dynamic content for the Add Task dialog,
 * including contacts and subtask lists.
 * @async
 * @param {HTMLElement} dlg - The dialog container element.
 * @returns {Promise<void>}
 */
async function loadAddTaskContent(dlg) {
  await InsertLoader.loadInsertByElement(dlg.querySelector("[data-insert]"));
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  await waitFor(".dlg-edit__subtask-list");
}


/**
 * Initializes input fields and button handlers in the Add Task dialog.
 * @param {HTMLElement} dlg - The dialog element.
 */
function initializeAddTaskFeatures(dlg) {
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
}


/**
 * Displays the Add Task dialog with entry animation and validation setup.
 * @async
 * @param {HTMLElement} dlg - The dialog container.
 * @returns {Promise<void>}
 */
async function showAddTaskDialog(dlg) {
  dlg.classList.remove("d-none");
  document.getElementById('overlay').classList.remove('d-none');
  setTimeout(() => dlg.classList.add("show"), 10);
  await waitFor('#due-date');
  initDueDateValidationDelegated(dlg);
  resetAddTaskFormValidation(dlg);
}


// ======================================================
// 🔹 TASK / BOARD MANAGEMENT
// ======================================================

/**
 * Loads all tasks from the global task list and renders them into their
 * corresponding columns, applying sorting and overdue highlighting.
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
 * @async
 * @param {string} taskId - ID of the task to delete.
 * @returns {Promise<void>}
 */
async function deleteTask(taskId) {
  try {
    const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;
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
 */
function clearColumns() {
  Object.values(columnMap).forEach(id => {
    document.getElementById(id).innerHTML = "";
  });
}


/**
 * Appends a single task card to its corresponding column.
 * @param {Object} task - Task object containing all task properties.
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
 * Updates the "no tasks" placeholder for all columns.
 */
function updateAllPlaceholders() {
  Object.values(columnMap).forEach(updateColumnPlaceholder);
}


/**
 * Displays or removes a "no tasks" placeholder in the specified column.
 * @param {string} columnId - The ID of the column to update.
 */
function updateColumnPlaceholder(columnId) {
  const col = document.getElementById(columnId);
  const hasTask = col.querySelector(".task");
  const placeholder = col.querySelector(".no-tasks-placeholder");
  if (hasTask && placeholder) placeholder.remove();
  if (!hasTask && !placeholder) {
    const div = document.createElement("div");
    div.innerHTML = getPlaceholderTpl();
    col.appendChild(div.firstElementChild);
  }
}


/**
 * Fills the edit task dialog inputs with existing task data.
 * @param {Object} task - Task object to populate into the form.
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
 * @param {Object} task - Task object containing subtasks.
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