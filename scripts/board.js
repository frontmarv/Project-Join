const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};


const getUserNameById = id => {
  const user = users.find(user => user.id === id);
  return user?.name || "Unknown User";
};


const getUserPicById = id => {
  const user = users.find(user => user.id === id);
  return user?.profilImgColor || null;
};


const getUserInitialsById = id => {
  const user = users.find(user => user.id === id);
  return user?.name?.split(" ").map(n => n[0].toUpperCase()).join("") || "";
};


let currentLayout = null;
window.addEventListener("resize", handleResizeScreenBoard);
window.addEventListener("load", handleResizeScreenBoard);


async function initBoard() {
  await getData();
  loadTasks();
  initDragAndDrop();
  markOverdueDates();
  updateAllPlaceholders();
  initSearch();
  enableSearchBoxClickFocus();
}


function enableSearchBoxClickFocus() {
  const searchBoxes = document.querySelectorAll('.board__head__searchbox');
  searchBoxes.forEach(box => {
    box.addEventListener('click', () => {
      const input = box.querySelector('input');
      if (input) {
        input.focus();
        input.select();
      }
    });
  });
}


async function renderTaskInfoDlg(taskId) {
  const task = await loadTaskForInfo(taskId);
  if (!task) return;
  setupTaskInfoDialog(task);
  displayDlg();
}


async function loadTaskForInfo(taskId) {
  await getData();
  return tasks.find(task => task.id === taskId) || null;
}


function setupTaskInfoDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskInfoDlgTpl(task);
  return dlgBox;
}


async function renderTaskEditDlg(taskId) {
  const task = await loadTaskForEdit(taskId);
  if (!task) return;
  setupTaskEditDialog(task);
  displayDlg();
  initializeTaskEditFeatures(task);
}


async function loadTaskForEdit(taskId) {
  await getData();
  return tasks.find(task => task.id === taskId) || null;
}


function setupTaskEditDialog(task) {
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.classList.remove("dlg-add-task");
  dlgBox.innerHTML = getTaskEditDlgTpl(task);
  return dlgBox;
}


function initializeTaskEditFeatures(task) {
  initSubtaskInput();
  initSubtaskIconButtons();
  initSubtaskHandlers();
  fillEditFormWithTaskData(task);
  populateAssignmentListFromFirebase(task);
}


async function renderAddTaskDlg(defaultTaskState = "to-do") {
  if (shouldRedirectToMobile()) return redirectToAddTaskPage();
  const dlg = setupAddTaskDialog(defaultTaskState);
  await loadAddTaskContent(dlg);
  initializeAddTaskFeatures(dlg);
  showAddTaskDialog(dlg);
}
  

function shouldRedirectToMobile() {
  return window.innerWidth < 1025;
}


function redirectToAddTaskPage() {
  window.location.replace('../pages/add-task.html');
}


function setupAddTaskDialog(defaultTaskState) {
  const dlg = document.getElementById("dlg-box");
  dlg.classList.add("dlg-add-task");
  dlg.innerHTML = getAddTaskDlgTpl(defaultTaskState);
  return dlg;
}


async function loadAddTaskContent(dlg) {
  await InsertLoader.loadInsertByElement(dlg.querySelector("[data-insert]"));
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  await waitFor(".dlg-edit__subtask-list");
}


function initializeAddTaskFeatures(dlg) {
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
}


async function showAddTaskDialog(dlg) {
  dlg.classList.remove("d-none");
  document.getElementById('overlay').classList.remove('d-none');
  setTimeout(() => dlg.classList.add("show"), 10);
  await waitFor('#due-date');
  initDueDateValidationDelegated(dlg);
}



function loadTasks() {
  clearColumns();
  tasks.forEach(task => appendTaskToColumn(task));
  updateAllPlaceholders();
  markOverdueDates();
}


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


function clearColumns() {
  Object.values(columnMap).forEach(id => {
    document.getElementById(id).innerHTML = "";
  });
}


function appendTaskToColumn(task) {
  const colId = columnMap[task.taskState];
  if (!colId) return;
  const col = document.getElementById(colId);
  const surroundingTasks = getSurroundingCategories(task);
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getTasksTemplate(task, surroundingTasks).trim();
  col.appendChild(wrapper.firstElementChild);
}


function updateAllPlaceholders() {
  Object.values(columnMap).forEach(updateColumnPlaceholder);
}


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


function fillEditFormWithTaskData(task) {
  document.getElementById("title-input").value = task.title || "";
  document.getElementById("descriptions-input").value = task.description || "";
  document.getElementById("due-date").value = task.dueDate || "";
  const btn = document.getElementById(task.priority);
  if (btn) changePriorityBtn(btn);
  loadSubtasksIntoForm(task);
}


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


function handleResizeScreenBoard() {
  isSmallScreen = window.innerWidth < 1025;
  const boardHead = document.getElementById('board-head');
  setLayout(isSmallScreen);
  if (currentLayout === 'mobile') {
    renderMobileHead(boardHead);
  } else if (currentLayout === 'desktop') {
    renderDesktopHead(boardHead);
  }
}


function renderMobileHead(boardHead) {
  boardHead.innerHTML = getAddTaskBtnMobile();
}


function renderDesktopHead(boardHead) {
  boardHead.innerHTML = getBoardHeadDesktop();
}


function setLayout(isSmallScreen) {
  currentLayout = isSmallScreen ? 'mobile' : 'desktop';
}


function getSurroundingCategories(task) {
  const state = task.taskState;
  const keys = Object.keys(columnMap);
  const index = keys.indexOf(state);
  const prevKey = keys[index - 1];
  const nextKey = keys[index + 1];
  const previousTask = prevKey ? capitalize(prevKey) : "Done";
  const nextTask = nextKey ? capitalize(nextKey) : "To-do";
  return { previousTask, nextTask };
}


function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}


function syncValidityClass(el) {
  if (!el) return;
  if (el.value && el.value.trim() !== '') {
    el.classList.add('valid-input');
    el.classList.remove('invalid-input', 'input-error');
  } else {
    el.classList.add('input-error');
    el.classList.remove('valid-input');
  }
}


function initDueDateValidationDelegated(scope) {
  if (!scope || scope.dataset.ddBound === 'true') return;
  scope.dataset.ddBound = 'true';
  const date = scope.querySelector('#due-date');
  if (date) syncValidityClass(date);
  scope.addEventListener('input', onDueDateEvent, true);
  scope.addEventListener('change', onDueDateEvent, true);
  scope.addEventListener('blur', onDueDateEvent, true);
}


function onDueDateEvent(event) {
  if (!event.target.matches('#due-date')) return;
  syncValidityClass(event.target);
}
