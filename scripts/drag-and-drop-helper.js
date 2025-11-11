// ======================================================
// 🔹 DRAG & DROP HELPERS
// ======================================================
// Contains utility functions for drag-and-drop handling,
// including placeholder management and visual styling.
// ======================================================


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
 * Hides an existing placeholder within a given column.
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
