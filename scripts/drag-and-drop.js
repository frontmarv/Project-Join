// ======================================================
// 🔹 GLOBAL STATE
// ======================================================

let draggedTask = null;
let placeholder = null;
let startCol = null;
let offsetX = 0;
let offsetY = 0;
let clickedTask = null;
let lastHoverCol = null;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
const DRAG_THRESHOLD = 5;


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/** Initializes global pointerdown listener for drag and drop functionality. */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/** Initializes global pointerdown listener for drag and drop functionality. */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}


// ======================================================
// 🔹 POINTER DOWN
// ======================================================

/**
 * Handles pointer down event and prepares for a possible drag start.
 * @param {PointerEvent} event - Pointer event triggered on mouse/touch press.
 */
function onPointerDown(event) {
  if (!isValidDragStart(event)) return;
  const task = event.target.closest(".task");
  if (!task) return;

  clickedTask = task;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  setPointerOffsets(event, task);
  startCol = task.closest(".tasks");
  attachDragListeners();

  event.preventDefault();
}


/**
 * Validates whether drag can start depending on event target and search state.
 * @param {PointerEvent} event - Pointer down event.
 * @returns {boolean} True if drag is allowed, otherwise false.
 */
function isValidDragStart(event) {
  if (event.button !== 0) return false;
  if (event.target.closest(".task-card__menu-icon")) return false;
  const searchInput = document.getElementById("search-tasks");
  return !(searchInput && searchInput.value.trim().length > 0);
}


/** Attaches pointermove and pointerup event listeners for active drag handling. */
function attachDragListeners() {
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });
}


/**
 * Calculates pointer offset relative to the dragged task.
 * @param {PointerEvent} event - Pointer event.
 * @param {HTMLElement} task - Task card element.
 */
function setPointerOffsets(event, task) {
  const taskRect = task.getBoundingClientRect();
  offsetX = event.clientX - taskRect.left;
  offsetY = event.clientY - taskRect.top;
}


// ======================================================
// 🔹 POINTER MOVE
// ======================================================

/**
 * Handles pointer movement during drag operation.
 * @param {PointerEvent} event - Pointer move event.
 */
function onPointerMove(event) {
  if (!clickedTask) return;
  if (!isDragging) startDrag(clickedTask, event);
  updateDraggingPosition(event);
}


/**
 * Starts drag operation by styling the dragged task and creating a placeholder.
 * @param {HTMLElement} taskCard - Task card element being dragged.
 * @param {PointerEvent} event - Pointer event.
 */
function startDrag(taskCard, event) {
  draggedTask = taskCard;
  createPlaceholder(taskCard);
  styleDraggedTask(taskCard);
  capturePointer(taskCard, event);
  isDragging = true;
}


/**
 * Captures pointer to maintain drag control across browser contexts.
 * @param {HTMLElement} taskCard - Task card element.
 * @param {PointerEvent} event - Pointer event.
 */
function capturePointer(taskCard, event) {
  try {
    taskCard.setPointerCapture(event.pointerId);
  } catch {}
}


/**
 * Updates the position of the dragged task based on current pointer location.
 * @param {PointerEvent} event - Pointer event.
 */
function updateDraggingPosition(event) {
  draggedTask.style.left = `${event.clientX - offsetX}px`;
  draggedTask.style.top = `${event.clientY - offsetY}px`;
  updateHoverColumn(event);
}


// ======================================================
// 🔹 PLACEHOLDER & VISUALS
// ======================================================

/**
 * Creates a visual placeholder in the task's original position.
 * @param {HTMLElement} taskCard - Task element being dragged.
 */
function createPlaceholder(taskCard) {
  const cardPosition = taskCard.getBoundingClientRect();
  placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  placeholder.style.width = `${cardPosition.width}px`;
  placeholder.style.height = `${cardPosition.height}px`;
  taskCard.parentNode.insertBefore(placeholder, taskCard);
}


/**
 * Applies styling and transformation to visually represent the dragged task.
 * @param {HTMLElement} taskCard - Task card being dragged.
 */
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

/**
 * Updates the currently hovered column under the dragged task.
 * @param {PointerEvent} event - Pointer event.
 */
function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest(".tasks") || null;
  if (col !== lastHoverCol) handleColumnChange(col);
}


/**
 * Handles the transition between previously and newly hovered columns.
 * @param {HTMLElement|null} col - Newly hovered column.
 */
function handleColumnChange(col) {
  if (col) handleNewHoverColumn(col);
  if (lastHoverCol && lastHoverCol !== col) showNoTasksPlaceholderIfEmpty(lastHoverCol);
  lastHoverCol = col;
}


/**
 * Handles entry into a new hover column and updates placeholders.
 * @param {HTMLElement} col - Column element.
 */
function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);
  if (placeholder && !col.contains(placeholder)) col.appendChild(placeholder);
}


// ======================================================
// 🔹 POINTER UP (DROP HANDLING)
// ======================================================

/**
 * Handles pointer release event — determines if it was a click or drop.
 * @param {PointerEvent} event - Pointer event.
 */
async function onPointerUp(event) {
  removeDragListeners();

  const movedDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
  const wasClick = movedDistance < DRAG_THRESHOLD;

  if (wasClick && clickedTask && !isDragging) {
    handleTaskClick(clickedTask);
  }

  if (isDragging) await stopDragging(event);
  resetDragState();
}


/** Removes active drag listeners after release. */
function removeDragListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}


/**
 * Handles simple click on a task (when not dragging).
 * @param {HTMLElement} task - Task card element.
 */
function handleTaskClick(task) {
  const id = task.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
}


/** Resets all drag-related global state variables. */
function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
}


// ======================================================
// 🔹 DRAG STOP / STATE UPDATE
// ======================================================

/**
 * Finalizes drag operation — determines new column, updates state, and cleans up.
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
 * Collects drag context info such as IDs and state transitions.
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
 * Updates task state in Firebase when the column has changed.
 * @param {string|null} id - Task ID.
 * @param {string|null} newState - Target state.
 * @param {string|null} oldState - Original state.
 */
async function handleTaskStateChange(id, newState, oldState) {
  const shouldUpdate = id && newState && oldState && newState !== oldState;
  if (!shouldUpdate) return;
  await updateTaskState(id, newState);
  await refreshBoard();
}


/** Clears drag references after completion. */
function resetDragReferences() {
  draggedTask = null;
  startCol = null;
}


/**
 * Removes temporary drag styling and restores original element layout.
 * @param {PointerEvent} event - Pointer event.
 */
function finalizeDraggedTaskStyle(event) {
  draggedTask.classList.remove("dragging");
  draggedTask.style.transform = "";
  Object.assign(draggedTask.style, {
    position: "", left: "", top: "", width: "", height: "",
    zIndex: "", pointerEvents: ""
  });
  try { draggedTask.releasePointerCapture(event.pointerId); } catch {}
}


/** Moves task element to the placeholder’s position and cleans up DOM. */
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
 * Moves a task manually into a new column (used in task info dialog).
 * @param {string} TaskId - Task ID.
 * @param {string} newStateUpperCase - Target state (capitalized).
 */
async function manualMoveTaskToNewColmn(TaskId, newStateUpperCase) {
  const newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1);
  await updateTaskState(TaskId, newState);
  await refreshBoard();
}


/**
 * Maps column DOM ID to its respective task state key.
 * @param {string} id - Column DOM ID.
 * @returns {string|null} Corresponding task state.
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
 * @param {string} state - New task state.
 */
async function updateTaskState(id, state) {
  await fetch(`https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state })
  });
}


/** Refreshes the board after a task update by reloading data and placeholders. */
async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}


// ======================================================
// 🔹 PLACEHOLDER MANAGEMENT (EMPTY COLUMNS)
// ======================================================

/**
 * Hides the "no tasks" placeholder inside a column.
 * @param {HTMLElement} col - Column element.
 */
function hideNoTasksPlaceholder(col) {
  const placeholder = col?.querySelector('.no-tasks-placeholder');
  if (placeholder) placeholder.style.display = 'none';
}


/**
 * Shows a "no tasks" placeholder in an empty column after drag end.
 * @param {HTMLElement} col - Column element.
 */
function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;
  const hasRealTask = col.querySelector('.task:not(.task--placeholder):not(.dragging)');
  if (hasRealTask) return hideExistingPlaceholder(col);
  ensureNoTasksPlaceholder(col);
}


/**
 * Hides an existing placeholder in a given column.
 * @param {HTMLElement} col - Column element.
 */
function hideExistingPlaceholder(col) {
  const existing = col.querySelector('.no-tasks-placeholder');
  if (existing) existing.style.display = 'none';
}


/**
 * Ensures that a visible placeholder element exists for empty columns.
 * @param {HTMLElement} col - Column element.
 */
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


// ======================================================
// 🔹 WINDOW BLUR HANDLER
// ======================================================

/** Resets drag state when the window loses focus (e.g., user switches tabs). */
window.addEventListener("blur", () => {
  if (isDragging) resetDragState();
});