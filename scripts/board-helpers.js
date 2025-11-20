// ======================================================
// 🔹 HELPERS: USERS, CATEGORIES, VALIDATION, SCROLLING
// ======================================================

/**
 * Retrieves a user's name by their unique ID.
 *
 * @param {string} id - The user’s unique identifier.
 * @returns {string} The user's name, or "Unknown User" if not found.
 */
const getUserNameById = id => {
  const user = users.find(user => user.id === id);
  return user?.name || "Unknown User";
};


/**
 * Retrieves a user's profile color by their unique ID.
 *
 * @param {string} id - The user’s unique identifier.
 * @returns {string|null} The user's profile color, or null if not found.
 */
const getUserPicById = id => {
  const user = users.find(user => user.id === id);
  return user?.profilImgColor || null;
};


/**
 * Returns the initials of a given user name (e.g., "Max Mustermann" → "MM").
 * Safely handles invalid or missing input.
 *
 * @param {string} [userName=""] - The full name of the user.
 * @returns {string} User initials, or "?" if not available.
 */
function getUserNameInitials(userName = "") {
  if (typeof userName !== "string" || !userName.trim()) {
    return "?";
  }

  return userName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(word => word[0].toUpperCase())
    .join("") || "?";
}


/**
 * Returns the surrounding task categories for navigation between states.
 * Used to determine which task state comes before or after the current one.
 *
 * @param {Object} task - The task object.
 * @param {string} task.taskState - The current state of the task.
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
 *
 * @param {string} text - Input text.
 * @returns {string} Capitalized text.
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}


/**
 * Validates an input element and toggles validity-related CSS classes.
 * Adds `.valid-input` when filled and `.input-error` when empty.
 *
 * @param {HTMLInputElement} inputElement - Input element to validate.
 * @returns {void}
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
 * Ensures validation is applied dynamically within the given DOM scope.
 *
 * @param {HTMLElement} scope - Container element (e.g., dialog).
 * @returns {void}
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
 * Live validation handler for the due-date input field.
 *
 * This function runs on `input`, `change`, and `blur` events and applies
 * non-blocking validation rules for the due-date field. It uses
 * `applyDueDateValidation` with `required: false`, meaning:
 *
 * - Empty fields do NOT trigger a "required" error here (that happens on submit).
 * - Invalid dates (past / beyond max range) immediately display an error message.
 * - Valid dates clear the error state in real time.
 *
 * This function does not prevent form submission.
 *
 * @param {Event} event - The event triggered by the user interaction.
 * @returns {void}
 */
function onDueDateEvent(event) {
  if (!event.target.matches('#due-date')) return;
  const input = event.target;
  const form = input.closest('form') || document;
  const errorEl = form.querySelector('#date-error');
  applyDueDateValidation(input, errorEl, { required: false, valid: true });
}


/**
 * Saves the current scrollTop positions of given elements.
 *
 * @param {string[]} selectors - Array of CSS selectors.
 * @returns {Record<string, number>} Object mapping selectors to scroll positions.
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
 * Restores saved scroll positions for given elements and
 * scrolls to the last toggled subtask if one exists.
 *
 * @param {Record<string, number>} savedScroll - Object containing saved scroll positions.
 * @returns {void}
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


/**
 * Scrolls the view to the last toggled subtask (if recorded).
 * Used after reopening dialogs to restore context.
 *
 * @returns {void}
 */
function scrollToLastToggledSubtask() {
  if (!window.__lastToggledSubtaskId) return;
  const target = document.querySelector(`[data-subtask-id="${window.__lastToggledSubtaskId}"]`);
  if (target) target.scrollIntoView({ block: 'nearest' });
}
