const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};

// let currentLayout = null;
// window.addEventListener("resize", handleResizeScreenBoard);
// window.addEventListener("load", handleResizeScreenBoard);

async function initBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
  initSearch();
}

async function renderTaskInfoDlg(taskId) {
  await getData();
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.innerHTML = getTaskInfoDlgTpl(task);
  displayDlg();
}

async function renderTaskEditDlg(taskId) {
  await getData();
  const task = tasks.find(task => task.id === taskId);
  if (!task) return;
  const dlgBox = document.getElementById("dlg-box");
  dlgBox.innerHTML = getTaskEditDlgTpl(task);
  displayDlg();
  initSubtaskInput();
  initSubtaskIconButtons();
  initSubtaskHandlers();
  fillEditFormWithTaskData(task);
  populateAssignmentListFromFirebase(task);
}

async function renderAddTaskDlg(defaultTaskState = "to-do") {
  const dlg = document.getElementById("dlg-box");
  dlg.classList.add("dlg-add-task");
  dlg.innerHTML = getAddTaskDlgTpl(defaultTaskState);
  await InsertLoader.loadInsertByElement(dlg.querySelector("[data-insert]"));
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  await waitFor(".dlg-edit__subtask-list");
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
  displayDlg();
}

function loadTasks() {
  clearColumns();
  tasks.forEach(task => appendTaskToColumn(task));
  updateAllPlaceholders();
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
  const wrapper = document.createElement("div");
  wrapper.innerHTML = getTasksTemplate(task).trim();
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

const getUserNameById = id => users.find(user => user.id === id)?.name || "Unknown User";
const getUserPicById = id => users.find(user => user.id === id)?.profilImgColor || null;
const getUserInitialsById = id =>
  users.find(user => user.id === id)?.name?.split(" ").map(name => name[0].toUpperCase()).join("") || "";

function toggleTasksAutoHeight(enable) {
  document.querySelectorAll(".tasks").forEach(col => {
    col.style.height = enable ? "auto" : "calc(100vh - 27rem)";
  });
}
