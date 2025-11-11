// ======================================================
// 🔹 CONSTANTS & BASE
// ======================================================

/** Maps task states to their corresponding column IDs in the DOM. */
const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};


/**
 * Returns a user's name based on their ID.
 * @param {string} id - User ID.
 * @returns {string} Username or "Unknown User".
 */
const getUserNameById = id => {
  const user = users.find(user => user.id === id);
  return user?.name || "Unknown User";
};


/**
 * Returns the user's profile color based on their ID.
 * @param {string} id - User ID.
 * @returns {string|null} Profile color or null.
 */
const getUserPicById = id => {
  const user = users.find(user => user.id === id);
  return user?.profilImgColor || null;
};


/**
 * Returns a user's initials based on their full name.
 * @param {string} id - User ID.
 * @returns {string} Initials, e.g., "AB".
 */
const getUserInitialsById = id => {
  const user = users.find(user => user.id === id);
  return user?.name?.split(" ").map(name => name[0].toUpperCase()).join("") || "";
};


let currentLayout = null;
window.addEventListener("resize", handleResizeScreenBoard);
window.addEventListener("load", handleResizeScreenBoard);


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/** Initializes the board including data, tasks, search, and drag-and-drop. */
async function initBoard() {
  await getData();
  loadTasks();
  initDragAndDrop();
  markOverdueDates();
  updateAllPlaceholders();
  initSearch();
  enableSearchBoxClickFocus();
}


/** Enables click-to-focus for all search boxes in the board header. */
function enableSearchBoxClickFocus() {
  document.addEventListener('click', event => {
    const box = event.target.closest('.board__head__searchbox');
    if (!box) return;
    focusSearchInput(box);
  });
}


/**
 * Focuses the input field inside a search box.
 * @param {HTMLElement} box - The search box container.
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
 * Opens the task info dialog for the specified task ID.
 * @param {string} taskId - Task ID.
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
 * Creates the task info dialog.
 * @param {object} task - Task object.
 * @returns {HTMLElement} The dialog element.
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
 * Opens the edit dialog for a specific task.
 * @param {string} taskId - Task ID.
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
 * Creates the HTML content for the task edit dialog.
 * @param {object} task - Task object.
 * @returns {HTMLElement} The dialog element.
 */
function setupTaskEditDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskEditDlgTpl(task);
  return dlgBox;
}


/**
 * Initializes all features in the edit dialog (subtasks, assignment, etc.).
 * @param {object} task - Task object.
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
 * Opens the Add Task dialog or redirects to the mobile page.
 * @param {string} [defaultTaskState="to-do"] - Default task state.
 */
async function renderAddTaskDlg(defaultTaskState = "to-do") {
  if (shouldRedirectToMobile()) return redirectToAddTaskPage();
  const dlg = setupAddTaskDialog(defaultTaskState);
  await loadAddTaskContent(dlg);
  initializeAddTaskFeatures(dlg);
  dueDateValidation();
  showAddTaskDialog(dlg);
}


/** Checks if the user should be redirected to the mobile Add Task page. */
function shouldRedirectToMobile() {
  return window.innerWidth < 1025;
}


/** Redirects the user to the mobile Add Task page. */
function redirectToAddTaskPage() {
  window.location.replace('../pages/add-task.html');
}


/**
 * Creates the Add Task dialog element.
 * @param {string} defaultTaskState - Initial task state.
 * @returns {HTMLElement} The dialog element.
 */
function setupAddTaskDialog(defaultTaskState) {
  const dlg = document.getElementById("dlg-box");
  dlg.classList.add("dlg-add-task");
  dlg.innerHTML = getAddTaskDlgTpl(defaultTaskState);
  return dlg;
}


/**
 * Loads all required content and data (assignments, subtasks) into the Add Task dialog.
 * @param {HTMLElement} dlg - The dialog element.
 */
async function loadAddTaskContent(dlg) {
  await InsertLoader.loadInsertByElement(dlg.querySelector("[data-insert]"));
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  await waitFor(".dlg-edit__subtask-list");
}


/**
 * Initializes input fields and icon buttons in the Add Task dialog.
 * @param {HTMLElement} dlg - The dialog element.
 */
function initializeAddTaskFeatures(dlg) {
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
}


/**
 * Displays the Add Task dialog and initializes due date validation.
 * @param {HTMLElement} dlg - The dialog element.
 */
async function showAddTaskDialog(dlg) {
  dlg.classList.remove("d-none");
  document.getElementById('overlay').classList.remove('d-none');
  setTimeout(() => dlg.classList.add("show"), 10);
  await waitFor('#due-date');
  initDueDateValidationDelegated(dlg);
}


// ======================================================
// 🔹 TASK / BOARD MANAGEMENT
// ======================================================

/** Loads all tasks into their respective columns. */
function loadTasks() {
  clearColumns();
  tasks.forEach(task => appendTaskToColumn(task));
  updateAllPlaceholders();
  markOverdueDates();
}


/**
 * Deletes a task from the database and updates the board.
 * @param {string} taskId - Task ID.
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


/** Clears all task columns. */
function clearColumns() {
  Object.values(columnMap).forEach(id => {
    document.getElementById(id).innerHTML = "";
  });
}


/**
 * Appends a task card to the appropriate column.
 * @param {object} task - Task object.
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


/** Updates all placeholder texts in empty columns. */
function updateAllPlaceholders() {
  Object.values(columnMap).forEach(updateColumnPlaceholder);
}


/**
 * Shows or removes the placeholder in a specific column.
 * @param {string} columnId - Column ID.
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
 * Populates the edit dialog form with task data.
 * @param {object} task - Task object.
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
 * Loads subtasks into the edit dialog view.
 * @param {object} task - Task object with subtasks.
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
// 🔹 LAYOUT / RESPONSIVE
// ======================================================

/** Handles layout switching between desktop and mobile views. */
function handleResizeScreenBoard() {
  const isSmallScreen = window.innerWidth < 1025;
  const boardHead = document.getElementById('board-head');
  setLayout(isSmallScreen);
  if (currentLayout === 'mobile') {
    renderMobileHead(boardHead);
  } else if (currentLayout === 'desktop') {
    renderDesktopHead(boardHead);
  }
}


/**
 * Renders the mobile version of the board header.
 * @param {HTMLElement} boardHead - Header container element.
 */
function renderMobileHead(boardHead) {
  boardHead.innerHTML = getAddTaskBtnMobile();
}


/**
 * Renders the desktop version of the board header.
 * @param {HTMLElement} boardHead - Header container element.
 */
function renderDesktopHead(boardHead) {
  boardHead.innerHTML = getBoardHeadDesktop();
}


/**
 * Sets the current layout mode.
 * @param {boolean} isSmallScreen - True if mobile view is active.
 */
function setLayout(isSmallScreen) {
  currentLayout = isSmallScreen ? 'mobile' : 'desktop';
}
