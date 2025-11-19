// ======================================================
// 🔹 DRAG & DROP POINTER MODULE
// ======================================================
// Enthält alle Pointer-Events für:
// - pointerdown
// - pointermove
// - pointerup
// - startDrag()
// - stopDragging()
// - Low-level Pointer-Capture Handling
// ======================================================


// ======================================================
// 🔹 MOBILE DRAG MODE DETECTION
// ======================================================

/**
 * Determines if the current device width should use long-press mode.
 * @returns {boolean} True if viewport width < MOBILE_BREAKPOINT.
 */
function isMobileDragMode() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}


/**
 * Cancels the pending long-press drag activation.
 * @returns {void}
 */
function cancelLongPress() {
  clearTimeout(longPressTimer);
  longPressTimer = null;
}


/**
 * Prevents native page scrolling during dragging on touch devices.
 * @param {TouchEvent} e - Touch move event.
 * @returns {void}
 */
function preventTouchScroll(e) {
  e.preventDefault();
}


// ======================================================
// 🔹 POINTER DOWN
// ======================================================

/**
 * Handles pointer down and potential drag start initialization.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function onPointerDown(event) {
  if (!isValidDragStart(event)) return;

  const taskCard = event.target.closest(".task");
  if (!taskCard) return;

  event.preventDefault();
  initializePointerDownState(event, taskCard);

  if (isMobileDragMode()) { handleMobilePointerDown(taskCard, event);
  } else { attachDragListeners();
    }
}


/**
 * Initializes drag start reference data.
 * @param {PointerEvent} event - Pointer event.
 * @param {HTMLElement} taskCard - The clicked task card.
 * @returns {void}
 */
function initializePointerDownState(event, taskCard) {
  clickedTask = taskCard;
  dragStartX = event.clientX;
  dragStartY = event.clientY;
  dragStartTime = event.timeStamp;
  setPointerOffsets(event, taskCard);
  startCol = taskCard.closest(".tasks");
}


/**
 * Checks if a drag is allowed to start based on the target element.
 * @param {PointerEvent} event - Pointer event.
 * @returns {boolean} True if the event is eligible for drag start.
 */
function isValidDragStart(event) {
  if (event.button !== 0) return false; // left click only
  if (event.target.closest(".task-card__menu-icon")) return false;

  const searchInput = document.getElementById("search-tasks");
  return !(searchInput && searchInput.value.trim().length > 0);
}


/**
 * Attaches pointer move & pointer up handlers after pointerdown.
 * @returns {void}
 */
function attachDragListeners() {
  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });
}


/**
 * Stores pointer-to-task offsets for visual accuracy while dragging.
 * @param {PointerEvent} event - Pointer event.
 * @param {HTMLElement} taskCard - The clicked task card.
 * @returns {void}
 */
function setPointerOffsets(event, taskCard) {
  const rect = taskCard.getBoundingClientRect();
  offsetX = event.clientX - rect.left;
  offsetY = event.clientY - rect.top;
}


// ======================================================
// 🔹 POINTER MOVE (Dragging logic)
// ======================================================

/**
 * Main pointermove handler.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function onPointerMove(event) {
  if (!clickedTask) return;

  if (isMobileDragMode() && !isDragging && longPressTimer)
    return;

  handleDesktopDragStart(event);
  handleDraggingMovement(event);
  handleEmptyColumnPlaceholder();
}


/**
 * Detects first drag movement on desktop and starts drag.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function handleDesktopDragStart(event) {
  const distance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
  const primaryButtonStillPressed = event.buttons === 1;

  if (!isDragging &&
      distance > DRAG_THRESHOLD &&
      primaryButtonStillPressed &&
      !isMobileDragMode()) {
    startDrag(clickedTask, event);
  }
}


/**
 * Updates drag movement (position, hover column, autoscroll).
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function handleDraggingMovement(event) {
  if (!isDragging || event.buttons !== 1) return;

  updateDraggingPosition(event);
  lastPointerEvent = event;
  handleAutoScroll(event);
}


/**
 * Ensures empty columns correctly display/hide placeholder.
 * @returns {void}
 */
function handleEmptyColumnPlaceholder() {
  if (!isDragging || !startCol || !placeholder) return;

  const hasRealTask = startCol.querySelector(".task:not(.task--placeholder):not(.dragging)");
  const hasDragPlaceholder = startCol.querySelector(".task--placeholder");

  if (!hasRealTask && !hasDragPlaceholder) {
    showNoTasksPlaceholderIfEmpty(startCol);
  }
}


// ======================================================
// 🔹 START DRAG
// ======================================================

/**
 * Starts drag operation: placeholder creation, visual styling, capture.
 * @param {HTMLElement} taskCard - The card being dragged.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function startDrag(taskCard, event) {
  draggedTask = taskCard;
  taskCard.classList.remove("task--pressing");

  createPlaceholder(taskCard);
  prepareTaskForDragging(taskCard, event);

  if (!isMobileDragMode()) {
    try { taskCard.setPointerCapture(event.pointerId); } catch {}
  }

  document.addEventListener("touchmove", preventTouchScroll, { passive: false });
  isDragging = true;
}


/**
 * Force-captures pointer for consistent drag behavior.
 * @param {HTMLElement} taskCard - Dragged task.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function capturePointer(taskCard, event) {
  try { taskCard.setPointerCapture(event.pointerId); } catch {}
}


/**
 * Updates visual position of dragged card.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function updateDraggingPosition(event) {
  if (!draggedTask) return;
  draggedTask.style.left = `${event.clientX - offsetX}px`;
  draggedTask.style.top = `${event.clientY - offsetY}px`;
  updateHoverColumn(event);
}


// ======================================================
// 🔹 POINTER UP (Drop handling)
// ======================================================

/**
 * Handles pointerup → drop → click-detection.
 * @param {PointerEvent} event - Pointer event.
 * @returns {Promise<void>}
 */
async function onPointerUp(event) {
  cancelLongPress();
  cleanupTouchScroll();
  removeDragListeners();

  const wasClick = checkIfWasClick(event);

  if (isDragging) { await stopDragging(event);
  }

  handlePossibleClick(wasClick);
  resetDragState();
}


/**
 * Removes touchmove scroll blocker.
 * @returns {void}
 */
function cleanupTouchScroll() {
  document.removeEventListener("touchmove", preventTouchScroll);
}


/**
 * Determines whether pointerup should be treated as a click.
 * @param {PointerEvent} event
 * @returns {boolean}
 */
function checkIfWasClick(event) {
  const movedDistance = Math.hypot(event.clientX - dragStartX, event.clientY - dragStartY);
  const shortTime = event.timeStamp - dragStartTime < 500;
  return movedDistance < DRAG_THRESHOLD && shortTime;
}


/**
 * Handles click on a task when the event was not a drag.
 * @param {boolean} wasClick
 * @returns {void}
 */
function handlePossibleClick(wasClick) {
  if (!wasClick) return;
  if (!clickedTask || isDragging || wasDroppedInSameColumn) return;

  handleTaskClick(clickedTask);
}


/**
 * Removes pointer listeners once drag is done.
 * @returns {void}
 */
function removeDragListeners() {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);
}


/**
 * Called when browser cancels pointer event.
 * @param {PointerEvent} _event
 * @returns {void}
 */
function onPointerCancel(_event) {
  cancelLongPress();
  resetDragState();
}


/**
 * Opens task info dialog on click (not drag).
 * @param {HTMLElement} task
 * @returns {void}
 */
function handleTaskClick(task) {
  const id = task.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
}


// ======================================================
// 🔹 STOP DRAG
// ======================================================

/**
 * Finalizes drag, moves card, updates Firebase, refreshes board.
 * @param {PointerEvent} event - Pointer event.
 * @returns {Promise<void>}
 */
async function stopDragging(event) {
  if (!draggedTask) return;

  cleanupTouchScroll();
  setClickSuppression(300);

  const context = getDragContextData();

  finalizeDraggedTaskStyle(event);
  handleDrop(context);
  await updateTaskStateIfChanged(context);
  showEmptyPlaceholderIfNeeded();
  resetDragReferences();
}


/**
 * Converts a column DOM ID to its internal task state.
 * @param {string} id - Column DOM ID.
 * @returns {string|null} Matching task state or null.
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
 * Builds a drop-context object for further processing.
 * @returns {{id:string,newState:string,oldState:string,isValidDrop:boolean}}
 */
function getDragContextData() {
  const taskId = draggedTask.getAttribute("data-task-id");
  const dropCol = placeholder?.closest(".tasks");
  const newState = dropCol ? mapColumnIdToTaskState(dropCol.id) : null;
  const oldState = startCol ? mapColumnIdToTaskState(startCol.id) : null;
  const isValidDrop = !!dropCol;
  return { id: taskId, newState, oldState, isValidDrop };
}


/**
 * Ends the visual dragging styles.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
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

  try { draggedTask.releasePointerCapture(event.pointerId) }catch {}
}


/**
 * Moves the dragged task into the correct drop column.
 * @param {Object} context - Drag context.
 * @returns {void}
 */
function handleDrop({ isValidDrop }) {
  if (!isValidDrop) {startCol.insertBefore(draggedTask, placeholder);
  } else {moveTaskToPlaceholder();
    }

  placeholder?.remove();
  placeholder = null;
}


/**
 * Applies state update only if drop changed column.
 * @returns {Promise<void>}
 */
async function updateTaskStateIfChanged({ isValidDrop, id, newState, oldState }) {
  if (!isValidDrop) return;
  if (!id || !newState || !oldState) return;
  if (newState === oldState) return;

  await updateTaskState(id, newState);
  await refreshBoard();
}


/**
 * Ensures placeholder appears in previously empty columns.
 * @returns {void}
 */
function showEmptyPlaceholderIfNeeded() {
  if (startCol) {
    showNoTasksPlaceholderIfEmpty(startCol);
  }
}


/**
 * Clears drag-specific references.
 * @returns {void}
 */
function resetDragReferences() {
  draggedTask = null;
  startCol = null;
  lastHoverCol = null;
}
