// ======================================================
// 🔹 DRAG AND DROP LOGIC (with Firefox click suppression)
// ======================================================
// Handles all drag-and-drop interactions on the board,
// including pointer tracking, column updates, visual feedback,
// and suppressing synthetic clicks immediately after a drop.
// ======================================================


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
let wasDroppedInSameColumn = false;

/** Distance threshold (in px) to treat pointer movement as a drag. */
const DRAG_THRESHOLD = 5;


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/**
 * Initializes drag-and-drop and global click suppression.
 * Sets up pointer event listeners and a global click suppressor.
 */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
  // Capture-phase click suppressor (runs before any bubble handlers)
  document.addEventListener("click", suppressClickAfterDrag, true);
  // Failsafe: reset drag if pointer is canceled by the browser
  document.addEventListener("pointercancel", onPointerCancel, { passive: true });
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

  // If dragging was active → process drop first
  if (isDragging) {
    await stopDragging(event);
  }

  // Only trigger click if it was not a drag or recent drop
  if (wasClick && clickedTask && !isDragging && !wasDroppedInSameColumn) {
    handleTaskClick(clickedTask);
  }

  resetDragState();
}


/** Removes drag-related event listeners. */
function removeDragListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}


/**
 * Handles pointer cancellation (browser interrupted the gesture).
 * @param {PointerEvent} _event - Pointer event.
 */
function onPointerCancel(_event) {
  resetDragState();
}


/**
 * Handles click on task card when no dragging occurs.
 * @param {HTMLElement} task - The clicked task card.
 */
function handleTaskClick(task) {
  const id = task.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
}


// ======================================================
// 🔹 DRAG STOP / STATE UPDATE
// ======================================================

/**
 * Finalizes the drag operation and updates Firebase if necessary.
 * Also schedules global click suppression for a short window,
 * preventing synthetic clicks (Firefox) after a drop.
 * @param {PointerEvent} event - Pointer event.
 */
async function stopDragging(event) {
  if (!draggedTask) return;

  // Schedule click suppression for 300ms
  setClickSuppression(300);

  const { id, newState, oldState } = getDragContextData();
  wasDroppedInSameColumn = newState === oldState;

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
  lastHoverCol = null;
}


/**
 * Restores normal visual style to the dragged task.
 * @param {PointerEvent} event - Pointer event.
 */
function finalizeDraggedTaskStyle(event) {
  draggedTask.classList.remove("dragging");
  draggedTask.style.transform = "";
  Object.assign(draggedTask.style, {
    position: "",
    left: "",
    top: "",
    width: "",
    height: "",
    zIndex: "",
    pointerEvents: ""
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
// 🔹 STATE RESET & FAILSAFE
// ======================================================

/** Resets all temporary drag-related state variables. */
function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
  wasDroppedInSameColumn = false;
}

/** Cancels drag state when window loses focus (failsafe). */
window.addEventListener("blur", resetDragState);


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
