// ======================================================
// 🔹 DRAG & DROP MOBILE MODULE
// ======================================================
// Enthält alles, was NUR für mobile Geräte (<1024px Breite)
// benötigt wird:
// - Long-Press Aktivierung
// - Abbrechen durch PointerUp / Bewegung
// - Touch-Scroll Unterdrückung
// - Mobile-spezifische Container-Erkennung
// ======================================================


// ======================================================
// 🔹 MOBILE LONG PRESS HANDLING
// ======================================================

/**
 * Handles pointer down on mobile devices and triggers
 * a long-press detection instead of immediate dragging.
 * @param {HTMLElement} taskCard - Task card element pressed.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function handleMobilePointerDown(taskCard, event) {
  taskCard.classList.add("task--pressing");

  startLongPressTimer(taskCard, event);
  setupMobilePointerUpCancel(taskCard);
  setupMobileMoveCancel(taskCard);
}


/**
 * Starts the long-press timer that activates dragging after delay.
 * @param {HTMLElement} taskCard - The card that is pressed.
 * @param {PointerEvent} event - Pointer event.
 * @returns {void}
 */
function startLongPressTimer(taskCard, event) {
  longPressTimer = setTimeout(() => {
    attachDragListeners();
    startDrag(clickedTask, event);
    taskCard.classList.remove("task--pressing");
  }, LONG_PRESS_DELAY);
}


/**
 * Cancels long-press if pointer is released before activation.
 * @param {HTMLElement} taskCard - Task card element.
 * @returns {void}
 */
function setupMobilePointerUpCancel(taskCard) {
  document.addEventListener(
    "pointerup",
    () => {
      if (!isDragging) {
        cancelLongPress();
        taskCard.classList.remove("task--pressing");
      }
    },
    { once: true }
  );
}


/**
 * Cancels long-press if the user moves too far (scroll gesture).
 * @param {HTMLElement} taskCard - Task card element.
 * @returns {void}
 */
function setupMobileMoveCancel(taskCard) {
  document.addEventListener(
    "pointermove",
    (event) => {
      if (!isDragging) {
        const movedDistance = Math.hypot(
          event.clientX - dragStartX,
          event.clientY - dragStartY
        );

        if (movedDistance > 10) {
          cancelLongPress();
          taskCard.classList.remove("task--pressing");
        }
      }
    },
    { passive: true }
  );
}


// ======================================================
// 🔹 MOBILE SCROLL CONTAINER HANDLING
// ======================================================

/**
 * Returns the vertical scroll container to use on mobile.
 * @returns {HTMLElement}
 */
function getMobileVerticalContainer() {
  const board = document.querySelector(".board-content");
  if (isScrollable(board)) return board;
  return document.scrollingElement || document.documentElement;
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