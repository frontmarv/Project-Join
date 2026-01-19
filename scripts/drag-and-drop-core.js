// ======================================================
// 🔹 DRAG & DROP — CORE MODULE
// ======================================================
// Enthält:
// - Globalen Drag-State
// - Safari/iOS Touch-Fix
// - Globale Initialisierung
// - Click-Suppression
// - Firebase-Update & Board-Refresh
// - Failsafe Reset
// ======================================================


// ======================================================
// 🔹 GLOBAL DRAG STATE
// ======================================================

/** Currently dragged task card element. */
let draggedTask = null;

/** Placeholder element that occupies space while dragging. */
let placeholder = null;

/** Column element from which the drag started. */
let startCol = null;

/** Pointer offset X from the task card’s left edge. */
let offsetX = 0;

/** Pointer offset Y from the task card’s top edge. */
let offsetY = 0;

/** Task element that received the initial pointerdown event. */
let clickedTask = null;

/** Last column hovered during dragging. */
let lastHoverCol = null;

/** True if a drag operation is currently active. */
let isDragging = false;

/** Pointer X-coordinate at the drag start. */
let dragStartX = 0;

/** Pointer Y-coordinate at the drag start. */
let dragStartY = 0;

/** Timestamp of the pointerdown event. */
let dragStartTime = 0;

/** True if the task was dropped back into its original column. */
let wasDroppedInSameColumn = false;

/** Timeout ID for mobile long-press activation. */
let longPressTimer = null;

/** Pixel threshold before dragging begins. */
const DRAG_THRESHOLD = 2;

/** Mobile long-press duration before drag starts. */
const LONG_PRESS_DELAY = 500;

/** Screen width breakpoint for mobile drag mode. */
const MOBILE_BREAKPOINT = 1024;


// ======================================================
// 🔹 SAFARI / IOS TOUCH FIX
// ======================================================

/**
 * Prevents iOS/Safari from scrolling the page while dragging.
 * Required because Safari often breaks pointer-capture during scroll.
 */
document.addEventListener(
  "touchmove",
  (e) => {
    if (isDragging) e.preventDefault();
  },
  { passive: false }
);


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/**
 * Initializes global drag-and-drop listeners.
 * Registers pointerdown, click-suppression and pointercancel handlers.
 */
function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("click", suppressClickAfterDrag, true);
  document.addEventListener("pointercancel", onPointerCancel, { passive: true });
}


// ======================================================
// 🔹 CLICK SUPPRESSION (Firefox fix)
// ======================================================

/**
 * Timestamp until which click events should be ignored.
 * Prevents task dialogs from opening right after a drop.
 */
let suppressClicksUntil = 0;

/**
 * Suppresses unintended click events immediately after a drag.
 * @param {MouseEvent} event - The incoming click event.
 */
function suppressClickAfterDrag(event) {
  if (performance.now() < suppressClicksUntil) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}


/**
 * Enables click suppression for a short duration after dropping.
 * @param {number} [duration=300] - Milliseconds to suppress clicks.
 */
function setClickSuppression(duration = 300) {
  suppressClicksUntil = performance.now() + duration;
}


// ======================================================
// 🔹 TASK STATE UPDATE + BOARD REFRESH
// ======================================================

/**
 * Updates a task's state in Firebase.
 * @param {string} id - Task ID.
 * @param {string} state - New task state to save.
 * @returns {Promise<void>}
 */
async function updateTaskState(id, state) {
  await fetch(`https://remotestorage-468cc-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskState: state })
    }
  );
}


/**
 * Reloads tasks from Firebase and re-renders the board.
 * Called after a task was successfully moved to another column.
 * @returns {Promise<void>}
 */
async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}


// ======================================================
// 🔹 GLOBAL FAILSAFE (STATE RESET)
// ======================================================

/**
 * Resets all drag-related state variables.
 * Used when drag cancels, pointer operations fail,
 * or the browser window loses focus.
 */
function resetDragState() {
  clickedTask = null;
  isDragging = false;
  lastHoverCol = null;
  wasDroppedInSameColumn = false;
}


/** Resets drag state when the browser loses window focus. */
window.addEventListener("blur", resetDragState);
