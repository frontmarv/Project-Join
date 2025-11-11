let draggedTask = null;
let placeholder = null;
let startCol = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let clickedTask = null;
let lastHoverCol = null;


function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}


function onPointerDown(event) {
  if (event.button !== 0) return;
  if (event.target.closest(".task-card__menu-icon")) return;

  const searchInput = document.getElementById("search-tasks");
  if (searchInput && searchInput.value.trim().length > 0) return;

  const task = event.target.closest(".task");
  if (!task) return;

  clickedTask = task;
  setPointerOffsets(event, task);
  startCol = task.closest(".tasks");

  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });

  event.preventDefault();
}


function setPointerOffsets(event, task) {
  const rect = task.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
}


function onPointerMove(event) {
  if (!clickedTask) return;
  if (!isDragging) {
    startDragging(clickedTask, event);
    isDragging = true;
  }
  updateDraggingPosition(event);
}


function startDragging(taskCard, event) {
  draggedTask = taskCard;
  createPlaceholder(taskCard);
  styleDraggedTask(taskCard);
  try { draggedTask.setPointerCapture(event.pointerId); } catch {}
}


function createPlaceholder(taskCard) {
  const taskPosition = taskCard.getBoundingClientRect();
  placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  placeholder.style.width = `${taskPosition.width}px`;
  placeholder.style.height = `${taskPosition.height}px`;
  taskCard.parentNode.insertBefore(placeholder, taskCard);
}


function styleDraggedTask(taskCard) {
  const rect = taskCard.getBoundingClientRect();
  Object.assign(taskCard.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "10000",
    pointerEvents: "none"
  });
  taskCard.classList.add("dragging");
  taskCard.style.transform = "rotate(2deg) scale(1.02)";
}


function updateDraggingPosition(event) {
  draggedTask.style.left = `${event.clientX - offsetX}px`;
  draggedTask.style.top = `${event.clientY - offsetY}px`;
  updateHoverColumn(event);
}


function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest('.tasks') || null;
  if (col !== lastHoverCol) handleColumnChange(col);
}


function handleColumnChange(col) {
  if (col) handleNewHoverColumn(col);
  if (lastHoverCol && lastHoverCol !== col) {
    showNoTasksPlaceholderIfEmpty(lastHoverCol);
  }
  lastHoverCol = col;
}


function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);
  if (placeholder && !col.contains(placeholder)) {
    col.appendChild(placeholder);
  }
}


async function onPointerUp(event) {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
  if (!isDragging && clickedTask) {
    const id = clickedTask.getAttribute("data-task-id");
    if (id) renderTaskInfoDlg(id);
  }
  if (isDragging) await stopDragging(event);
  resetDragState();
}


function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
}


async function stopDragging(event) {
  if (!draggedTask) return;
  const id = draggedTask.getAttribute("data-task-id");
  const dropCol = placeholder?.closest(".tasks") || startCol;
  const newState = dropCol ? mapColumnIdToTaskState(dropCol.id) : null;
  const oldState = startCol ? mapColumnIdToTaskState(startCol.id) : null;
  finalizeDraggedTaskStyle(event);
  moveTaskToPlaceholder();
  if (id && newState && oldState && newState !== oldState) {
    await updateTaskState(id, newState);
    await refreshBoard();
  }
  draggedTask = null;
  startCol = null;
}


function finalizeDraggedTaskStyle(event) {
  draggedTask.classList.remove("dragging");
  draggedTask.style.transform = "";
  Object.assign(draggedTask.style, {
    position: "", left: "", top: "", width: "", height: "", zIndex: "", pointerEvents: ""
  });
  try { draggedTask.releasePointerCapture(event.pointerId); } catch {}
}


function moveTaskToPlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(draggedTask, placeholder);
  }
  placeholder?.remove();
  placeholder = null;
}


async function manualMoveTaskToNewColmn(TaskId, newStateUpperCase) {
  const newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1);
  await updateTaskState(TaskId, newState);
  await refreshBoard();
}


function mapColumnIdToTaskState(id) {
  return {
    "to-do-tasks": "to-do",
    "in-progress-tasks": "in-progress",
    "await-feedback-tasks": "await-feedback",
    "done-tasks": "done"
  }[id] || null;
}


async function updateTaskState(id, state) {
  await fetch(`https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state })
  });
}


async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}


function hideNoTasksPlaceholder(col) {
  const placeholder = col?.querySelector('.no-tasks-placeholder');
  if (placeholder) placeholder.style.display = 'none';
}


function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;
  const hasRealTask = col.querySelector('.task:not(.task--placeholder):not(.dragging)');
  if (hasRealTask) {
    const existing = col.querySelector('.no-tasks-placeholder');
    if (existing) existing.style.display = 'none';
    return;
  }
  ensureNoTasksPlaceholder(col);
}


function ensureNoTasksPlaceholder(col) {
  let placeholder = col.querySelector('.no-tasks-placeholder');
  if (!placeholder) {
    const wrap = document.createElement('div');
    wrap.innerHTML = getPlaceholderTpl();
    placeholder = wrap.firstElementChild;
    col.appendChild(placeholder);
  }
  placeholder.style.display = 'flex';
}
