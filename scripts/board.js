// ======================================================
// 🔹 KONSTANTEN & BASIS
// ======================================================

/** Mapping von Task-Status zu den jeweiligen Spalten-IDs im DOM */
const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};

/**
 * Gibt den Namen eines Users anhand seiner ID zurück.
 * @param {string} id - User-ID.
 * @returns {string} Benutzername oder "Unknown User".
 */
const getUserNameById = id => {
  const user = users.find(user => user.id === id);
  return user?.name || "Unknown User";
};

/**
 * Gibt die Profilfarbe eines Users anhand seiner ID zurück.
 * @param {string} id - User-ID.
 * @returns {string|null} Profilfarbe oder null.
 */
const getUserPicById = id => {
  const user = users.find(user => user.id === id);
  return user?.profilImgColor || null;
};

/**
 * Gibt die Initialen eines Users anhand seines Namens zurück.
 * @param {string} id - User-ID.
 * @returns {string} Initialen, z. B. "AB".
 */
const getUserInitialsById = id => {
  const user = users.find(user => user.id === id);
  return user?.name?.split(" ").map(name => name[0].toUpperCase()).join("") || "";
};

let currentLayout = null;
window.addEventListener("resize", handleResizeScreenBoard);
window.addEventListener("load", handleResizeScreenBoard);


// ======================================================
// 🔹 INITIALISIERUNG
// ======================================================

/** Initialisiert das Board inkl. Daten, Aufgaben, Suche & Drag-and-Drop. */
async function initBoard() {
  await getData();
  loadTasks();
  initDragAndDrop();
  markOverdueDates();
  updateAllPlaceholders();
  initSearch();
  enableSearchBoxClickFocus();
}

/** Aktiviert Klick-Fokus für alle Suchboxen im Board-Header. */
function enableSearchBoxClickFocus() {
  document.addEventListener('click', event => {
    const box = event.target.closest('.board__head__searchbox');
    if (!box) return;
    focusSearchInput(box);
  });
}

/**
 * Fokussiert das Inputfeld in einer Suchbox.
 * @param {HTMLElement} box - Container der Suchbox.
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
 * Öffnet den Task-Info-Dialog für die übergebene Task-ID.
 * @param {string} taskId - ID des Tasks.
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
 * Erstellt den Task-Info-Dialog.
 * @param {object} task - Task-Objekt.
 * @returns {HTMLElement} Das Dialogelement.
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
 * Öffnet den Bearbeitungs-Dialog für einen Task.
 * @param {string} taskId - ID des Tasks.
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
 * Erstellt das HTML für den Task-Edit-Dialog.
 * @param {object} task - Task-Objekt.
 * @returns {HTMLElement} Das Dialogelement.
 */
function setupTaskEditDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskEditDlgTpl(task);
  return dlgBox;
}

/**
 * Initialisiert alle Features im Edit-Dialog (Subtasks, Assignment etc.).
 * @param {object} task - Task-Objekt.
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
 * Öffnet den Add-Task-Dialog oder leitet auf Mobile-Seite weiter.
 * @param {string} [defaultTaskState="to-do"] - Standard-Taskstatus.
 */
async function renderAddTaskDlg(defaultTaskState = "to-do") {
  if (shouldRedirectToMobile()) return redirectToAddTaskPage();
  const dlg = setupAddTaskDialog(defaultTaskState);
  await loadAddTaskContent(dlg);
  initializeAddTaskFeatures(dlg);
  dueDateValidation();
  showAddTaskDialog(dlg);
}

/** Prüft, ob auf Mobile weitergeleitet werden soll. */
function shouldRedirectToMobile() {
  return window.innerWidth < 1025;
}

/** Leitet auf die Mobile-Add-Task-Seite weiter. */
function redirectToAddTaskPage() {
  window.location.replace('../pages/add-task.html');
}

/**
 * Erstellt den Add-Task-Dialog.
 * @param {string} defaultTaskState - Initialer Taskstatus.
 * @returns {HTMLElement} Das Dialogelement.
 */
function setupAddTaskDialog(defaultTaskState) {
  const dlg = document.getElementById("dlg-box");
  dlg.classList.add("dlg-add-task");
  dlg.innerHTML = getAddTaskDlgTpl(defaultTaskState);
  return dlg;
}

/**
 * Lädt Inhalte & Daten (Assignments, Subtasks) in den Add-Task-Dialog.
 * @param {HTMLElement} dlg - Dialogelement.
 */
async function loadAddTaskContent(dlg) {
  await InsertLoader.loadInsertByElement(dlg.querySelector("[data-insert]"));
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  await waitFor(".dlg-edit__subtask-list");
}

/**
 * Initialisiert Eingaben und Icons im Add-Task-Dialog.
 * @param {HTMLElement} dlg - Dialogelement.
 */
function initializeAddTaskFeatures(dlg) {
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
}

/**
 * Zeigt den Add-Task-Dialog an und initialisiert Fälligkeitsvalidierung.
 * @param {HTMLElement} dlg - Dialogelement.
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

/** Lädt alle Tasks in die jeweiligen Spalten. */
function loadTasks() {
  clearColumns();
  tasks.forEach(task => appendTaskToColumn(task));
  updateAllPlaceholders();
  markOverdueDates();
}

/**
 * Löscht einen Task in der Datenbank und aktualisiert das Board.
 * @param {string} taskId - ID des Tasks.
 */
async function deleteTask(taskId) {
  try {
    const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`;
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error(`Fehler: ${response.status}`);
    await getData();
    loadTasks();
    updateAllPlaceholders();
    hideDlg();
  } catch (error) {
    console.error("Fehler beim Löschen:", error);
  }
}

/** Leert alle Task-Spalten. */
function clearColumns() {
  Object.values(columnMap).forEach(id => {
    document.getElementById(id).innerHTML = "";
  });
}

/**
 * Fügt einen Task der entsprechenden Spalte hinzu.
 * @param {object} task - Task-Objekt.
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

/** Aktualisiert alle Placeholder-Texte in leeren Spalten. */
function updateAllPlaceholders() {
  Object.values(columnMap).forEach(updateColumnPlaceholder);
}

/**
 * Zeigt oder entfernt den Placeholder in einer bestimmten Spalte.
 * @param {string} columnId - ID der Spalte.
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
 * Füllt das Formular im Edit-Dialog mit den Task-Daten.
 * @param {object} task - Task-Objekt.
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
 * Lädt Subtasks in die Edit-Ansicht.
 * @param {object} task - Task-Objekt mit Subtasks.
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

/** Handhabt Layoutwechsel zwischen Desktop und Mobile. */
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
 * Rendert die Mobile-Version des Headers.
 * @param {HTMLElement} boardHead - Header-Container.
 */
function renderMobileHead(boardHead) {
  boardHead.innerHTML = getAddTaskBtnMobile();
}

/**
 * Rendert die Desktop-Version des Headers.
 * @param {HTMLElement} boardHead - Header-Container.
 */
function renderDesktopHead(boardHead) {
  boardHead.innerHTML = getBoardHeadDesktop();
}

/**
 * Setzt den aktuellen Layout-Modus.
 * @param {boolean} isSmallScreen - true, wenn Mobile-Ansicht aktiv ist.
 */
function setLayout(isSmallScreen) {
  currentLayout = isSmallScreen ? 'mobile' : 'desktop';
}
