// ======================================================
// 🔹 DIALOGS & DOM-BEZOGENE FUNKTIONEN
// ======================================================

/**
 * Opens and displays the task info dialog for the given task ID.
 * Fetches fresh task data and restores scroll position after rendering.
 *
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
 *
 * @param {Object} task - Task object containing all task details.
 * @returns {HTMLElement} The rendered dialog container element.
 */
function setupTaskInfoDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskInfoDlgTpl(task);
  return dlgBox;
}


/**
 * Opens the edit dialog for a specific task, allowing updates to its details.
 *
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
 *
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
 *
 * @param {Object} task - Task object being edited.
 * @returns {void}
 */
function initializeTaskEditFeatures(task) {
  preloadPopupMsg();
  initSubtaskInput();
  initSubtaskIconButtons();
  initSubtaskHandlers();
  fillEditFormWithTaskData(task);
  populateAssignmentListFromFirebase(task);
}


/**
 * Opens the "Add Task" dialog or redirects to the mobile page,
 * depending on the current viewport size.
 *
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
 *
 * @returns {boolean} True if viewport width is below 1025px.
 */
function shouldRedirectToMobile() {
  return window.innerWidth < 1025;
}


/**
 * Redirects the user to the standalone "Add Task" page for mobile view.
 *
 * @returns {void}
 */
function redirectToAddTaskPage() {
  window.location.replace('../pages/add-task.html');
}


/**
 * Generates and injects the Add Task dialog HTML into the DOM.
 *
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
 *
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
 *
 * @param {HTMLElement} dlg - The dialog element.
 * @returns {void}
 */
function initializeAddTaskFeatures(dlg) {
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
}


/**
 * Displays the Add Task dialog with entry animation and validation setup.
 *
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
