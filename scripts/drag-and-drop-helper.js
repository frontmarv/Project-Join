// ======================================================
// 🔹 DRAG & DROP HELPERS
// ======================================================
// Provides utility functions for drag-and-drop handling,
// including placeholder management, column hovering logic,
// and temporary visual styling for dragged task cards.
// ======================================================


// ======================================================
// 🔹 GLOBAL CLICK SUPPRESSION
// ======================================================

/**
 * Timestamp (in ms) until which click events should be ignored.
 * Used to prevent accidental "click" triggers right after a drop,
 * particularly in Firefox where a click may follow a drag-drop.
 * @type {number}
 */
let suppressClicksUntil = 0;

/**
 * Suppresses click events fired right after a drag/drop.
 * Prevents Firefox and touch stacks from opening the task dialog
 * when a card is dropped back into the same column.
 * @param {MouseEvent} event - The click event to possibly suppress.
 * @returns {void}
 */
function suppressClickAfterDrag(event) {
  if (performance.now() < suppressClicksUntil) {
    event.stopImmediatePropagation();
    event.preventDefault();
  }
}


/**
 * Schedules click suppression for a short duration after a drop.
 * @param {number} [duration=300] - Duration (ms) to suppress clicks.
 * @returns {void}
 */
function setClickSuppression(duration = 300) {
  suppressClicksUntil = performance.now() + duration;
}


// ======================================================
// 🔹 COLUMN HOVER LOGIC
// ======================================================

/**
 * Updates the currently hovered column based on pointer position.
 * @param {PointerEvent} event - The current pointer event.
 * @returns {void}
 */
function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest(".tasks") || null;
  if (col !== lastHoverCol) handleColumnChange(col);
}


/**
 * Handles transition between hovered columns during dragging.
 * Ensures placeholders update visually when moving between columns.
 * @param {HTMLElement|null} col - The newly hovered column.
 * @returns {void}
 */
function handleColumnChange(col) {
  if (col) handleNewHoverColumn(col);
  if (lastHoverCol && lastHoverCol !== col) showNoTasksPlaceholderIfEmpty(lastHoverCol);
  lastHoverCol = col;
}


/**
 * Handles entering a new hover column, hiding empty placeholders
 * and moving the drag placeholder element into the hovered column.
 * @param {HTMLElement} col - The column currently hovered by the pointer.
 * @returns {void}
 */
function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);
  if (placeholder && !col.contains(placeholder)) col.appendChild(placeholder);
}


// ======================================================
// 🔹 PLACEHOLDER MANAGEMENT (EMPTY COLUMNS)
// ======================================================

/**
 * Hides the "No tasks" placeholder inside the specified column.
 * @param {HTMLElement} col - The column element containing the placeholder.
 * @returns {void}
 */
function hideNoTasksPlaceholder(col) {
  const placeholder = col?.querySelector(".no-tasks-placeholder");
  if (placeholder) placeholder.style.display = "none";
}


/**
 * Ensures that a "No tasks" placeholder is visible in empty columns
 * and hidden when at least one task exists.
 * @param {HTMLElement} col - The column element to update.
 * @returns {void}
 */
function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;
  const hasRealTask = col.querySelector(".task:not(.task--placeholder):not(.dragging)");
  if (hasRealTask) {
    hideExistingPlaceholder(col);
  } else {
    ensureNoTasksPlaceholder(col);
  }
}


/**
 * Hides an existing placeholder element within a given column.
 * @param {HTMLElement} col - The column element to check.
 * @returns {void}
 */
function hideExistingPlaceholder(col) {
  const existing = col.querySelector(".no-tasks-placeholder");
  if (existing) existing.style.display = "none";
}


/**
 * Ensures that a visible "No tasks" placeholder exists within a column.
 * Creates and appends one if missing.
 * @param {HTMLElement} col - The column element to update.
 * @returns {void}
 */
function ensureNoTasksPlaceholder(col) {
  let placeholder = col.querySelector(".no-tasks-placeholder");
  if (!placeholder) {
    const wrap = document.createElement("div");
    wrap.innerHTML = getPlaceholderTpl();
    placeholder = wrap.firstElementChild;
    col.appendChild(placeholder);
  }
  placeholder.style.display = "flex";
}


// ======================================================
// 🔹 PLACEHOLDER & VISUAL STYLING
// ======================================================

/**
 * Creates a temporary placeholder element at the original position
 * of the dragged task card. This maintains layout stability while dragging.
 * @param {HTMLElement} taskCard - The task card element being dragged.
 * @returns {void}
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
 * Applies temporary inline styles to the dragged task card
 * for smooth, fixed-position movement during dragging.
 * @param {HTMLElement} taskCard - The task card being dragged.
 * @returns {void}
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
