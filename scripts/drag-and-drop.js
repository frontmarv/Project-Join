let draggedTaskId = null;
const placeholder = createPlaceholder();

function createPlaceholder() {
  const placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  return placeholder;
}

function startDragging(id) {
  draggedTaskId = id;
  const card = document.querySelector(`[onclick="renderTaskInfoDlg('${id}')"]`);
  if (!card) return;
  card.classList.add("dragging");
  const { height } = card.getBoundingClientRect();
  placeholder.style.height = `${height}px`;
  placeholder.style.width = "100%";
}

function stopDragging() {
  const card = document.querySelector(".task.dragging");
  if (card) card.classList.remove("dragging");
  if (placeholder.isConnected) placeholder.remove();
  draggedTaskId = null;
}

function allowDrop(event) {
  event.preventDefault();
  const col = event.currentTarget;
  if (!col.contains(placeholder)) col.appendChild(placeholder);
}

async function moveTo(event) {
  event.preventDefault();
  const target = event.currentTarget;
  if (!isValidDropTarget(target)) return stopDragging();
  const newState = mapColumnIdToTaskState(target.id);
  if (!newState) return stopDragging();
  await updateTaskState(draggedTaskId, newState);
  await refreshBoard();
  stopDragging();
}

function isValidDropTarget(target) {
  return draggedTaskId && target.classList.contains("tasks");
}

function mapColumnIdToTaskState(id) {
  const map = {
    "to-do-tasks": "to-do",
    "in-progress-tasks": "in-progress",
    "await-feedback-tasks": "await-feedback",
    "done-tasks": "done",
  };
  return map[id];
}

async function updateTaskState(id, state) {
  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`;
  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state }),
  });
}

async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}

document.addEventListener("dragend", stopDragging);

async function manualMoveTaskToNewColmn(TaskId, newStateUpperCase) {
  let newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1)
  await updateTaskState(TaskId, newState);
  await refreshBoard();
}
