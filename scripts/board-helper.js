// ======================================================
// 🔹 HELPER FUNCTIONS (GENERAL)
// ======================================================

/**
 * Returns the surrounding task categories (for navigation between states).
 * @param {object} task - Task object.
 * @returns {{previousTask: string, nextTask: string}} Object with the previous and next task states.
 */
function getSurroundingCategories(task) {
  const state = task.taskState;
  const keys = Object.keys(columnMap);
  const index = keys.indexOf(state);
  const prevKey = keys[index - 1];
  const nextKey = keys[index + 1];
  const previousTask = prevKey ? capitalize(prevKey) : "Done";
  const nextTask = nextKey ? capitalize(nextKey) : "To-do";
  return { previousTask, nextTask };
}


/**
 * Capitalizes the first letter of a given string.
 * @param {string} text - Input text.
 * @returns {string} Capitalized text.
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}


/**
 * Validates an input element and toggles CSS classes accordingly.
 * @param {HTMLInputElement} inputElement - Input element to validate.
 */
function syncValidityClass(inputElement) {
  if (!inputElement) return;
  if (inputElement.value && inputElement.value.trim() !== '') {
    inputElement.classList.add('valid-input');
    inputElement.classList.remove('invalid-input', 'input-error');
  } else {
    inputElement.classList.add('input-error');
    inputElement.classList.remove('valid-input');
  }
}


/**
 * Initializes delegated validation for date input fields.
 * @param {HTMLElement} scope - Container element (e.g., dialog).
 */
function initDueDateValidationDelegated(scope) {
  if (!scope || scope.dataset.ddBound === 'true') return;
  scope.dataset.ddBound = 'true';
  const date = scope.querySelector('#due-date');
  if (date) syncValidityClass(date);
  scope.addEventListener('input', onDueDateEvent, true);
  scope.addEventListener('change', onDueDateEvent, true);
  scope.addEventListener('blur', onDueDateEvent, true);
}


/**
 * Event handler for date input validation.
 * @param {Event} event - Input event.
 */
function onDueDateEvent(event) {
  if (!event.target.matches('#due-date')) return;
  syncValidityClass(event.target);
}


/**
 * Saves the scroll positions of given elements.
 * @param {string[]} selectors - Array of CSS selectors.
 * @returns {Object<string, number>} Stored scroll positions.
 */
function saveScrollPositions(selectors) {
  const savedScroll = {};
  selectors.forEach(select => {
    const element = document.querySelector(select);
    if (element) savedScroll[select] = element.scrollTop;
  });
  return savedScroll;
}


/**
 * Restores previously saved scroll positions and scrolls to the last toggled subtask if available.
 * @param {Object<string, number>} savedScroll - Stored scroll positions.
 */
function restoreScrollPositions(savedScroll) {
  requestAnimationFrame(() => {
    Object.entries(savedScroll).forEach(([sel, top]) => {
      const element = document.querySelector(sel);
      if (element) element.scrollTop = top;
    });
    scrollToLastToggledSubtask();
  });
}


/** Scrolls to the last toggled subtask if one exists. */
function scrollToLastToggledSubtask() {
  if (!window.__lastToggledSubtaskId) return;
  const target = document.querySelector(
    `[data-subtask-id="${window.__lastToggledSubtaskId}"]`
  );
  if (target) target.scrollIntoView({ block: 'nearest' });
}
