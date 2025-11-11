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
let dragStartTime = 0;
const DRAG_THRESHOLD = 5;


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/**
 * Initializes drag-and-drop event listeners for task cards.
 */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}


// ======================================================
// 🔹 POINTER DOWN
// ======================================================

/**
 * Handles pointer down event and prepares drag start conditions.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerDown(event) {
  if (!isValidDragStart(event)) return;
  const task = event.target.closest(".task");
  if (!task) return;

  clickedTask = task;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartTime = event.timeStamp;
  setPointerOffsets(event, task);
  startCol = task.closest(".tasks");
  attachDragListeners();

  event.preventDefault();
}


/**
 * Checks whether the event target is a valid drag start area.
 * Prevents dragging during search mode or on menu icons.
 * @param {PointerEvent} event - Pointer event.
 * @returns {boolean} True if drag can start.
 */
function isValidDragStart(event) {
  if (event.button !== 0) return false; // only left mouse
  if (event.target.closest(".task-card__menu-icon")) return false;
  const searchInput = document.getElementById("search-tasks");
  return !(searchInput && searchInput.value.trim().length > 0);
}


/** Attaches pointermove and pointerup listeners for dragging. */
function attachDragListeners() {
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });
}


/**
 * Stores the offset between pointer position and card origin.
 * @param {PointerEvent} event - Pointer event.
 * @param {HTMLElement} task - The task card element.
 */
function setPointerOffsets(event, task) {
  const rect = task.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
}


// ======================================================
// 🔹 POINTER MOVE
// ======================================================

/**
 * Handles pointer move events for dragging logic.
 * @param {PointerEvent} event - Pointer event.
 */
function onPointerMove(event) {
  if (!clickedTask) return;

  const distance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
  const primaryButtonStillPressed = event.buttons === 1;

  // Only start dragging after movement threshold and while button pressed
  if (!isDragging && distance > DRAG_THRESHOLD && primaryButtonStillPressed) {
    startDrag(clickedTask, event);
  }

  if (isDragging && primaryButtonStillPressed) {
    updateDraggingPosition(event);
  }
}


/**
 * Starts the drag operation and prepares visual feedback.
 * @param {HTMLElement} taskCard - The dragged task card.
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
 * Safely captures pointer events to maintain drag control.
 * @param {HTMLElement} taskCard - The dragged task card.
 * @param {PointerEvent} event - Pointer event.
 */
function capturePointer(taskCard, event) {
  try {
    taskCard.setPointerCapture(event.pointerId);
  } catch {
    // Firefox private mode may reject capture — ignore silently
  }
}


/**
 * Updates the visual position of the dragged task card.
 * @param {PointerEvent} event - Pointer event.
 */
function updateDraggingPosition(event) {
  if (!draggedTask) return;
  draggedTask.style.left = `${event.clientX - offsetX}px`;
  draggedTask.style.top = `${event.clientY - offsetY}px`;
  updateHoverColumn(event);
}


// ======================================================
// 🔹 PLACEHOLDER & VISUALS
// ======================================================

/**
 * Creates a visual placeholder in the original task position.
 * @param {HTMLElement} taskCard - Task element being dragged.
 */
function createPlaceholder(taskCard) {
  const rect = taskCard.getBoundingClientRect();
  placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${rect.height}px`;
  taskCard.parentNode.insertBefore(placeholder, taskCard);
}


/**
 * Applies temporary visual styles to the dragged task card.
 * @param {HTMLElement} taskCard - The dragged task element.
 */
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


// ======================================================
// 🔹 COLUMN HOVER LOGIC
// ======================================================

/**
 * Updates the currently hovered column based on pointer position.
 * @param {PointerEvent} event - Pointer event.
 */
function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest(".tasks") || null;
  if (col !== lastHoverCol) handleColumnChange(col);
}


/**
 * Handles transition between hovered columns.
 * @param {HTMLElement|null} col - The newly hovered column.
 */
function handleColumnChange(col) {
  if (col) handleNewHoverColumn(col);
  if (lastHoverCol && lastHoverCol !== col) showNoTasksPlaceholderIfEmpty(lastHoverCol);
  lastHoverCol = col;
}


/**
 * Handles entering a new hover column.
 * @param {HTMLElement} col - The hovered column.
 */
function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);
  if (placeholder && !col.contains(placeholder)) col.appendChild(placeholder);
}


// ======================================================
// 🔹 POINTER UP (DROP HANDLING)
// ======================================================

/**
 * Handles pointer release event (drop or click detection).
 * @param {PointerEvent} event - Pointer event.
 */
async function onPointerUp(event) {
  removeDragListeners();

  const movedDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
  const wasClick = movedDistance < DRAG_THRESHOLD && event.timeStamp - dragStartTime < 500;

  if (wasClick && clickedTask && !isDragging) {
    handleTaskClick(clickedTask);
  }

  if (isDragging) await stopDragging(event);
  resetDragState();
}


/** Removes drag-related event listeners. */
function removeDragListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}


/**
 * Handles click on task card when no dragging occurs.
 * @param {HTMLElement} task - The clicked task card.
 */
function handleTaskClick(task) {
  const id = task.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
}


/** Resets all temporary drag-related state variables. */
function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
}


// ======================================================
// 🔹 DRAG STOP / STATE UPDATE
// ======================================================

/**
 * Finalizes the drag operation and updates Firebase if necessary.
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
 * Retrieves current drag context (task ID, old/new state).
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
 * @param {string|null} newState - Target state.
 * @param {string|null} oldState - Original state.
 */
async function handleTaskStateChange(id, newState, oldState) {
  const shouldUpdate = id && newState && oldState && newState !== oldState;
  if (!shouldUpdate) return;
  await updateTaskState(id, newState);
  await refreshBoard();
}


/** Resets references to dragged elements after completion. */
function resetDragReferences() {
  draggedTask = null;
  startCol = null;
}


/**
 * Restores normal visual style to the dragged task.
 * @param {PointerEvent} event - Pointer event.
 */
function finalizeDraggedTaskStyle(event) {
  draggedTask.classList.remove("dragging");
  draggedTask.style.transform = "";
  Object.assign(draggedTask.style, {
    position: "", left: "", top: "", width: "", height: "",
    zIndex: "", pointerEvents: ""
  });
  try {
    draggedTask.releasePointerCapture(event.pointerId);
  } catch {}
}


/** Inserts dragged task back into DOM at placeholder position. */
function moveTaskToPlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(draggedTask, placeholder);
  }
  placeholder?.remove();
  placeholder = null;
}



// ======================================================
// 🔹 MANUAL MOVE / FIREBASE UPDATE
// ======================================================

/**
 * Moves a task manually to a new column (used in info view).
 * @param {string} taskId - Task ID.
 * @param {string} newStateUpperCase - Target state (capitalized).
 */
async function manualMoveTaskToNewColmn(taskId, newStateUpperCase) {
  const newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1);
  await updateTaskState(taskId, newState);
  await refreshBoard();
}


/**
 * Maps a column DOM ID to its internal task state.
 * @param {string} id - Column DOM ID.
 * @returns {string|null} Task state.
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
 * @param {string} state - Target state.
 */
async function updateTaskState(id, state) {
  await fetch(`https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state })
  });
}


/** Reloads the board and refreshes placeholders. */
async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}


// ======================================================
// 🔹 PLACEHOLDER MANAGEMENT (EMPTY COLUMNS)
// ======================================================

/**
 * Hides the "No tasks" placeholder inside a given column.
 * @param {HTMLElement} col - Column element.
 */
function hideNoTasksPlaceholder(col) {
  const placeholder = col?.querySelector('.no-tasks-placeholder');
  if (placeholder) placeholder.style.display = 'none';
}


/**
 * Ensures placeholders reappear in empty columns after drag.
 * @param {HTMLElement} col - Column element.
 */
function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;
  const hasTask = col.querySelector('.task:not(.task--placeholder):not(.dragging)');
  if (hasTask) return hideExistingPlaceholder(col);
  ensureNoTasksPlaceholder(col);
}


/**
 * Hides an existing placeholder element.
 * @param {HTMLElement} col - Column element.
 */
function hideExistingPlaceholder(col) {
  const existing = col.querySelector('.no-tasks-placeholder');
  if (existing) existing.style.display = 'none';
}


/**
 * Creates and displays a "No tasks" placeholder if missing.
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
// 🔹 FAILSAFE HANDLING
// ======================================================

/** Cancels drag state when window loses focus (failsafe). */
window.addEventListener("blur", () => {
  if (isDragging) resetDragState();
});
