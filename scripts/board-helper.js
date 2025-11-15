// ======================================================
// 🔹 BOARD HELPER FUNCTIONS
// ======================================================
// Contains reusable utility functions for board rendering,
// sorting, validation, layout handling, and scroll restoration.
// ======================================================


// ======================================================
// 🔹 CATEGORY & TEXT HELPERS
// ======================================================

/**
 * Returns the surrounding task categories for navigation between states.
 * Used to determine which task state comes before or after the current one.
 * @param {Object} task - The task object.
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


// ======================================================
// 🔹 VALIDATION HELPERS
// ======================================================

/**
 * Validates an input element and toggles validity-related CSS classes.
 * Adds `.valid-input` when filled and `.input-error` when empty.
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
 * Event handler for due-date input validation.
 * @param {Event} event - Input/change/blur event object.
 */
function onDueDateEvent(event) {
  if (!event.target.matches('#due-date')) return;
  syncValidityClass(event.target);
}


// ======================================================
// 🔹 SCROLL POSITION HELPERS
// ======================================================

/**
 * Saves the current scrollTop positions of given elements.
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
 * @param {Record<string, number>} savedScroll - Object containing saved scroll positions.
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
 */
function scrollToLastToggledSubtask() {
  if (!window.__lastToggledSubtaskId) return;
  const target = document.querySelector(`[data-subtask-id="${window.__lastToggledSubtaskId}"]`);
  if (target) target.scrollIntoView({ block: 'nearest' });
}


// ======================================================
// 🔹 SORTING HELPERS
// ======================================================

/**
 * Defines the current sorting mode for tasks.
 * Default is set to "dueDate" so tasks are initially sorted by due date.
 * @type {"dueDate" | "priority" | "title"}
 */
let currentSortMode = "dueDate";


/**
 * Initializes the sorting dropdown in the board header.
 * Synchronizes the current sort mode and listens for user changes.
 */
function initSorting() {
  const select = document.getElementById("task-sort-select");
  syncDropdownWithSortMode(select);
  bindSortDropdownChange();
}


/**
 * Synchronizes the dropdown UI with the current sorting mode.
 * @param {HTMLSelectElement|null} select - Sorting dropdown element.
 */
function syncDropdownWithSortMode(select) {
  if (select) select.value = currentSortMode;
}


/**
 * Binds a change event listener to the sorting dropdown.
 * Updates the current sort mode and reloads all tasks when changed.
 */
function bindSortDropdownChange() {
  document.addEventListener("change", event => {
    const select = event.target.closest("#task-sort-select");
    if (!select) return;
    currentSortMode = select.value;
    loadTasks();
  });
}


/**
 * Returns a sorted copy of the provided task list.
 * Automatically ensures a valid sorting mode ("dueDate", "priority", "title").
 * @param {Array<Object>} taskList - Array of task objects.
 * @returns {Array<Object>} Sorted array of tasks.
 */
function sortTasks(taskList) {
  const sorted = [...taskList];
  ensureValidSortMode();
  return sortByCurrentMode(sorted);
}


/**
 * Ensures the current sort mode is valid, otherwise resets it to "dueDate".
 */
function ensureValidSortMode() {
  const validModes = ["dueDate", "priority", "title"];
  if (!validModes.includes(currentSortMode)) currentSortMode = "dueDate";
}


/**
 * Sorts a list of tasks based on the active sort mode.
 * @param {Array<Object>} tasks - Array of task objects to sort.
 * @returns {Array<Object>} Sorted array of tasks.
 */
function sortByCurrentMode(tasks) {
  switch (currentSortMode) {
    case "dueDate":
      return tasks.sort(compareByDueDate);
    case "priority":
      return tasks.sort(compareByPriority);
    case "title":
      return tasks.sort(compareByTitle);
    default:
      return tasks;
  }
}


/**
 * Comparison function for sorting tasks by due date (earliest first).
 * @param {Object} a - Task A.
 * @param {Object} b - Task B.
 * @returns {number} Sorting order result.
 */
function compareByDueDate(a, b) {
  const dateA = new Date(a.dueDate || Infinity);
  const dateB = new Date(b.dueDate || Infinity);
  return dateA - dateB;
}


/**
 * Comparison function for sorting tasks by priority.
 * Order: urgent → medium → low.
 * @param {Object} a - Task A.
 * @param {Object} b - Task B.
 * @returns {number} Sorting order result.
 */
function compareByPriority(a, b) {
  const order = { urgent: 1, medium: 2, low: 3 };
  return (order[a.priority] || 99) - (order[b.priority] || 99);
}


/**
 * Comparison function for sorting tasks alphabetically by title (A–Z).
 * @param {Object} a - Task A.
 * @param {Object} b - Task B.
 * @returns {number} Sorting order result.
 */
function compareByTitle(a, b) {
  return (a.title || "").localeCompare(b.title || "");
}


// ======================================================
// 🔹 POPUP MESSAGE
// ======================================================

const POPUP_ANIMATION_TIME = 500;
const POPUP_VISIBLE_TIME   = 1000;
const POPUP_TOTAL_TIME     = POPUP_ANIMATION_TIME * 2 + POPUP_VISIBLE_TIME;

function preloadPopupMsg() {
  if (document.querySelector('.popup-msg-container')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = getPopupMsgChangesSavedTpl();

  const popupEl = wrapper.firstElementChild;
  document.body.appendChild(popupEl);

  popupEl.offsetHeight;

  return popupEl;
}


function showPopupMsgChangesSaved() {
  const popupEl = document.querySelector('.popup-msg-container');
  if (!popupEl) return;

  setDialogActionsDisabled(true);

  requestAnimationFrame(() => popupEl.classList.add('show'));

  setTimeout(() => {
    hidePopupElement(popupEl);
  }, POPUP_ANIMATION_TIME + POPUP_VISIBLE_TIME);

  setTimeout(() => {
    setDialogActionsDisabled(false);
  }, POPUP_TOTAL_TIME);
}


function hidePopupElement(popupEl) {
  popupEl.classList.remove('show');
  setTimeout(() => popupEl.remove(), POPUP_ANIMATION_TIME);
}


function setDialogActionsDisabled(disabled) {
  const dlg = document.querySelector('#dlg-box');
  if (dlg) dlg.classList.toggle('dialog-action-area--disabled', disabled);
}