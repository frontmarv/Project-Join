// ======================================================
// 🔹 GLOBAL STATE
// ======================================================

let draggedTask = null;
let placeholder = null;
let startCol = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let clickedTask = null;
let lastHoverCol = null;


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/** Initializes drag and drop event listeners. */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}


// ======================================================
// 🔹 POINTER DOWN
// ======================================================

/**
 * Handles pointer down event and prepares drag start.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerDown(event) {
  if (!isValidDragStart(event)) return;
  const task = event.target.closest(".task");
  if (!task) return;

  clickedTask = task;
  setPointerOffsets(event, task);
  startCol = task.closest(".tasks");
  attachDragListeners();

  event.preventDefault();
}


/** Validates if drag can start based on target and search state. */
function isValidDragStart(event) {
  if (event.button !== 0) return false;
  if (event.target.closest(".task-card__menu-icon")) return false;
  const searchInput = document.getElementById("search-tasks");
  return !(searchInput && searchInput.value.trim().length > 0);
}


/** Attaches pointermove and pointerup listeners for dragging. */
function attachDragListeners() {
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });
}


/** Calculates offset between pointer position and task card. */
function setPointerOffsets(event, task) {
  const taskRect = task.getBoundingClientRect();
  offsetX = event.clientX - taskRect.left;
  offsetY = event.clientY - taskRect.top;
}


// ======================================================
// 🔹 POINTER MOVE
// ======================================================

/**
 * Handles pointer move event during drag.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerMove(event) {
  if (!clickedTask) return;
  if (!isDragging) startDrag(clickedTask, event);
  updateDraggingPosition(event);
}


/** Starts dragging logic and creates placeholder. */
function startDrag(taskCard, event) {
  draggedTask = taskCard;
  createPlaceholder(taskCard);
  styleDraggedTask(taskCard);
  capturePointer(taskCard, event);
  isDragging = true;
}


/** Safely captures pointer to avoid losing drag control. */
function capturePointer(taskCard, event) {
  try {
    taskCard.setPointerCapture(event.pointerId);
  } catch {}
}


/** Updates the current dragged element’s position. */
function updateDraggingPosition(event) {
  draggedTask.style.left = `${event.clientX - offsetX}px`;
  draggedTask.style.top = `${event.clientY - offsetY}px`;
  updateHoverColumn(event);
}


// ======================================================
// 🔹 PLACEHOLDER & VISUALS
// ======================================================

/** Creates a placeholder in the original task-card position. */
function createPlaceholder(taskCard) {
  const cardPosition = taskCard.getBoundingClientRect();
  placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  placeholder.style.width = `${cardPosition.width}px`;
  placeholder.style.height = `${cardPosition.height}px`;
  taskCard.parentNode.insertBefore(placeholder, taskCard);
}


/** Applies visual styling to the dragged task-card. */
function styleDraggedTask(taskCard) {
  const cardPosition = taskCard.getBoundingClientRect();
  Object.assign(taskCard.style, {
    position: "fixed",
    left: `${cardPosition.left}px`,
    top: `${cardPosition.top}px`,
    width: `${cardPosition.width}px`,
    height: `${cardPosition.height}px`,
    zIndex: "10000",
    pointerEvents: "none"
  });
  taskCard.classList.add("dragging");
  taskCard.style.transform = "rotate(2deg) scale(1.02)";
}


// ======================================================
// 🔹 COLUMN HOVER LOGIC
// ======================================================

/** Updates which column is currently hovered by the dragged task. */
function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest(".tasks") || null;
  if (col !== lastHoverCol) handleColumnChange(col);
}


/** Handles transition between hovered columns. */
function handleColumnChange(col) {
  if (col) handleNewHoverColumn(col);
  if (lastHoverCol && lastHoverCol !== col) showNoTasksPlaceholderIfEmpty(lastHoverCol);
  lastHoverCol = col;
}


/** Handles entering a new hover column. */
function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);
  if (placeholder && !col.contains(placeholder)) col.appendChild(placeholder);
}


// ======================================================
// 🔹 POINTER UP (DROP HANDLING)
// ======================================================

/**
 * Handles pointer release event (drop or click).
 * @param {PointerEvent} event - Pointer event.
 */
async function onPointerUp(event) {
  removeDragListeners();
  if (!isDragging && clickedTask) return handleTaskClick(clickedTask);
  if (isDragging) await stopDragging(event);
  resetDragState();
}


/** Removes pointermove and pointerup listeners. */
function removeDragListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}


/** Handles click on task when not dragging. */
function handleTaskClick(task) {
  const id = task.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
}


/** Resets all drag-related state variables. */
function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
}


// ======================================================
// 🔹 DRAG STOP / STATE UPDATE
// ======================================================

/**
 * Handles drag stop logic: determines new column, updates state, and cleans up.
 * @param {PointerEvent} event - Pointer event.
 */
async function stopDragging(event) {
  if (!draggedTask) return;

  const { id, newState, oldState } = getDragContextData();
  finalizeDraggedTaskStyle(event);
  moveTaskToPlaceholder();

  await handleTaskStateChange(id, newState, oldState);
  resetDragReferences();
}


/**
 * Collects current drag context information (IDs and states).
 * @returns {{id: string|null, newState: string|null, oldState: string|null}}
 */
function getDragContextData() {
  const taskId = draggedTask.getAttribute("data-task-id");
  const dropCol = placeholder?.closest(".tasks") || startCol;
  const newState = dropCol ? mapColumnIdToTaskState(dropCol.id) : null;
  const oldState = startCol ? mapColumnIdToTaskState(startCol.id) : null;
  return { id: taskId, newState, oldState };
}


/**
 * Updates task state in Firebase if column has changed.
 * @param {string|null} id - Task ID.
 * @param {string|null} newState - New column state.
 * @param {string|null} oldState - Original column state.
 */
async function handleTaskStateChange(id, newState, oldState) {
  const shouldUpdate = id && newState && oldState && newState !== oldState;
  if (!shouldUpdate) return;
  await updateTaskState(id, newState);
  await refreshBoard();
}


/** Resets references after dragging has stopped. */
function resetDragReferences() {
  draggedTask = null;
  startCol = null;
}


/** Removes dragging visuals and resets inline styles. */
function finalizeDraggedTaskStyle(event) {
  draggedTask.classList.remove("dragging");
  draggedTask.style.transform = "";
  Object.assign(draggedTask.style, {
    position: "", left: "", top: "", width: "", height: "",
    zIndex: "", pointerEvents: ""
  });
  try { draggedTask.releasePointerCapture(event.pointerId); } catch {}
}


/** Inserts task into placeholder position and cleans up. */
function moveTaskToPlaceholder() {
  if (placeholder && placeholder.parentNode)
    placeholder.parentNode.insertBefore(draggedTask, placeholder);

  placeholder?.remove();
  placeholder = null;
}


// ======================================================
// 🔹 MANUAL MOVE / FIREBASE UPDATE
// ======================================================

/**
 * Moves a task manually to a new column (used in info view).
 * @param {string} TaskId - The task ID.
 * @param {string} newStateUpperCase - Target state (capitalized).
 */
async function manualMoveTaskToNewColmn(TaskId, newStateUpperCase) {
  const newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1);
  await updateTaskState(TaskId, newState);
  await refreshBoard();
}


/**
 * Maps column DOM ID to task state key.
 * @param {string} id - Column DOM ID.
 * @returns {string|null} Task state key.
 */
function mapColumnIdToTaskState(id) {
  return {
    "to-do-tasks": "to-do",
    "in-progress-tasks": "in-progress",
    "await-feedback-tasks": "await-feedback",
    "done-tasks": "done"
  }[id] || null;
}


/**
 * Updates a task’s state in Firebase.
 * @param {string} id - Task ID.
 * @param {string} state - New state.
 */
async function updateTaskState(id, state) {
  await fetch(`https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state })
  });
}


/** Reloads board data and refreshes placeholders. */
async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}


// ======================================================
// 🔹 PLACEHOLDER MANAGEMENT (EMPTY COLUMNS)
// ======================================================

/**
 * Hides the "no tasks" placeholder in a column.
 * @param {HTMLElement} col - Column element.
 */
function hideNoTasksPlaceholder(col) {
  const placeholder = col?.querySelector('.no-tasks-placeholder');
  if (placeholder) placeholder.style.display = 'none';
}


/**
 * Displays a placeholder in empty columns after drag.
 * @param {HTMLElement} col - Column element.
 */
function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;
  const hasRealTask = col.querySelector('.task:not(.task--placeholder):not(.dragging)');
  if (hasRealTask) return hideExistingPlaceholder(col);
  ensureNoTasksPlaceholder(col);
}


/** Hides an existing placeholder in a column. */
function hideExistingPlaceholder(col) {
  const existing = col.querySelector('.no-tasks-placeholder');
  if (existing) existing.style.display = 'none';
}


/** Ensures that a visible "no tasks" placeholder exists. */
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
