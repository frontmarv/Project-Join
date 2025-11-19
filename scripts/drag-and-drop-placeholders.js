// ======================================================
// 🔹 DRAG & DROP PLACEHOLDERS & VISUALS MODULE
// ======================================================
// Enthält:
//
// - Column Hover Logic
// - "No Tasks" Placeholder Handling
// - Drag Placeholder (Task-Space-Holder)
// - Visual Styling während des Drags
// - Board-basierte Placeholder-Aktualisierung
// ======================================================


// ======================================================
// 🔹 COLUMN HOVER LOGIC
// ======================================================

/**
 * Updates the currently hovered column during dragging.
 * Sets `lastHoverCol` and triggers placeholder refresh.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function updateHoverColumn(event) {
  const underPointer = document.elementFromPoint(event.clientX, event.clientY);
  const col = underPointer?.closest(".tasks") || null;

  if (col !== lastHoverCol) {
    handleColumnChange(col);
  }
}


/**
 * Handles switching between columns during dragging:
 * - move drag placeholder to new column
 * - update "no tasks" placeholders in both old and new column
 * @param {HTMLElement|null} col - Column currently hovered.
 * @returns {void}
 */
function handleColumnChange(col) {
  // Entering NEW column
  if (col) {
    handleNewHoverColumn(col);
    showNoTasksPlaceholderIfEmpty(col);
  }

  // Leaving OLD column
  if (lastHoverCol && lastHoverCol !== col) {
    showNoTasksPlaceholderIfEmpty(lastHoverCol);
  }

  lastHoverCol = col;
}


/**
 * Handles entering a new column during dragging:
 * - hides the general "no tasks" placeholder
 * - moves the drag placeholder into that column
 * @param {HTMLElement} col - Hovered tasks column.
 * @returns {void}
 */
function handleNewHoverColumn(col) {
  hideNoTasksPlaceholder(col);

  if (placeholder && !col.contains(placeholder)) {
    col.appendChild(placeholder);
  }
}


// ======================================================
// 🔹 "NO TASKS" PLACEHOLDER HANDLING
// ======================================================

/**
 * Hides the "No tasks" placeholder inside a column.
 * @param {HTMLElement} col - Column element.
 * @returns {void}
 */
function hideNoTasksPlaceholder(col) {
  const pl = col?.querySelector(".no-tasks-placeholder");
  if (pl) pl.style.display = "none";
}


/**
 * Ensures correct display of the "No tasks" placeholder
 * depending on whether the column contains tasks.
 * @param {HTMLElement} col - Column element.
 * @returns {void}
 */
function showNoTasksPlaceholderIfEmpty(col) {
  if (!col) return;

  const hasDragPlaceholder = col.querySelector(".task--placeholder");
  if (hasDragPlaceholder) {
    hideExistingPlaceholder(col);
    return;
  }

  const hasRealTask = col.querySelector(".task:not(.task--placeholder):not(.dragging)");

  if (hasRealTask) {
    hideExistingPlaceholder(col);
  } else {
    ensureNoTasksPlaceholder(col);
  }
}


/**
 * Hides an existing placeholder element inside a given column.
 * @param {HTMLElement} col - Column element.
 * @returns {void}
 */
function hideExistingPlaceholder(col) {
  const existing = col.querySelector(".no-tasks-placeholder");
  if (existing) existing.style.display = "none";
}


/**
 * Ensures that a "No tasks" placeholder exists and is visible.
 * Creates one if necessary.
 * @param {HTMLElement} col - Column element.
 * @returns {void}
 */
function ensureNoTasksPlaceholder(col) {
  let pl = col.querySelector(".no-tasks-placeholder");

  if (!pl) {
    const wrap = document.createElement("div");
    wrap.innerHTML = getPlaceholderTpl();
    pl = wrap.firstElementChild;
    col.appendChild(pl);
  }

  pl.style.display = "flex";
}


// ======================================================
// 🔹 DRAG PLACEHOLDER (Space-holder for dragged task)
// ======================================================

/**
 * Creates a placeholder matching the dragged task’s size
 * to preserve layout while dragging.
 * @param {HTMLElement} taskCard - Dragged task card.
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
 * Inserts the dragged task into the placeholder’s position.
 * @returns {void}
 */
function moveTaskToPlaceholder() {
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(draggedTask, placeholder);
  }

  placeholder?.remove();
  placeholder = null;
}


// ======================================================
// 🔹 VISUAL STYLING OF DRAGGED TASK
// ======================================================

/**
 * Applies fixed-position styling and transform effects
 * to visually separate the dragged task from the layout.
 * @param {HTMLElement} taskCard - Dragged task card.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function prepareTaskForDragging(taskCard, event) {
  const rect = taskCard.getBoundingClientRect();

  Object.assign(taskCard.style, {
    position: "fixed",
    left: `${event.clientX - offsetX}px`,
    top: `${event.clientY - offsetY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "10000",
    pointerEvents: "none"
  });

  taskCard.classList.add("dragging");
  taskCard.style.transform = "rotate(2deg) scale(1.02)";
}


// ======================================================
// 🔹 BOARD PLACEHOLDER UPDATE
// ======================================================


/**
 * Updates the "no tasks" placeholder for all board columns,
 * based on the board's internal `columnMap`.
 * @returns {void}
 */
function updateAllPlaceholders() {
  Object.values(columnMap).forEach(updateColumnPlaceholder);
}


/**
 * Shows or removes a "no tasks" placeholder for a specific column
 * based on presence of tasks and using board templates.
 * @param {string} columnId - ID of the column.
 * @returns {void}
 */
function updateColumnPlaceholder(columnId) {
  const col = document.getElementById(columnId);
  const hasTask = col.querySelector(".task");
  const placeholder = col.querySelector(".no-tasks-placeholder");

  if (hasTask && placeholder) {
    placeholder.remove();
  }

  if (!hasTask && !placeholder) {
    const div = document.createElement("div");
    div.innerHTML = getPlaceholderTpl();
    col.appendChild(div.firstElementChild);
  }
}
