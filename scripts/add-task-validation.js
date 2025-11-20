/**
 * Opens the browser's native date picker for the due-date input field.
 *
 * This function focuses the date input to trigger visual focus styles.
 * If the browser supports the `showPicker()` method (modern Chromium-based
 * browsers), it explicitly opens the native date selection popup.
 * 
 * @function openCustomDatePicker
 * @returns {void}
 */
function openCustomDatePicker() {
  const input = document.getElementById('due-date');
  input.focus();
  if (input.showPicker) {
    input.showPicker();
  }
}


/**
 * Focuses the first input with an error style.
 */
function focusFirstError() {
  document.querySelector('.input-error')?.focus();
}


/**
 * Resets all validation and error states inside the Add Task form.
 * Removes .input-error, clears error texts, and resets validation flags.
 * @param {HTMLElement} dlg - The dialog element containing the form.
 */
function resetAddTaskFormValidation(dlg) {
  const form = dlg.querySelector('#task-form');
  if (!form) return;

  form.classList.remove('was-validated');
  clearAllErrors(form);

  const due = form.querySelector('#due-date');
  const dateErr = form.querySelector('#date-error');
  due?.classList.remove('input-error');
  if (dateErr) dateErr.textContent = '';
}


/**
 * Removes all visible validation errors within a given container (default: entire document).
 * Clears red borders, error messages, and error state classes.
 *
 * @param {Document|HTMLElement} [root=document] - The root element or document to search within.
 * @example
 * // Clears all error styles and messages in a specific form
 * clearAllErrors(document.getElementById('task-form'));
 */
function clearAllErrors(root = document) {
  root.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
  root.querySelectorAll('.has-error').forEach(el => el.classList.remove('has-error'));
  root.querySelectorAll('.field-error').forEach(el => el.textContent = '');
}


/**
 * Clears the error of a required field as soon as it has a non-empty value.
 */
function bindLiveRequiredClear(inputId, errorId) {
  const el  = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (!el) return;

  if (!el.dataset.bound) {
    el.dataset.bound = '1';
    const clearIfHasValue = () => {
      if (el.value.trim()) clearError(el, err);
    };
    el.addEventListener('input', clearIfHasValue);
    el.addEventListener('change', clearIfHasValue);
  }
}


/**
 * Updates the category validity UI (.valid / .invalid classes).
 */
function updateCategoryValidity() {
  const root = document.querySelector('.category-selection');
  const hidden = document.getElementById('category-hidden');
  if (!root || !hidden) return;

  if (hidden.value.trim()) {
    root.classList.remove('invalid');
    root.classList.add('valid');
  } else {
    root.classList.add('invalid');
    root.classList.remove('valid');
  }
}


/**
 * Adds error styling and text to an input.
 * @param {HTMLElement} inputEl - The input element.
 * @param {HTMLElement} errorEl - The corresponding error element.
 * @param {string} message - The error message.
 */
function showError(inputEl, errorEl, message) {
  if (inputEl) inputEl.classList.add('input-error');
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.parentElement?.classList.add('has-error');
  }
}


/**
 * Clears error styling and message from an input.
 * @param {HTMLElement} inputEl - The input element.
 * @param {HTMLElement} errorEl - The corresponding error element.
 */
function clearError(inputEl, errorEl) {
  if (inputEl) inputEl.classList.remove('input-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.parentElement?.classList.remove('has-error');
  }
}


/**
 * Validates all fields in the Add Task form.
 * @returns {boolean} - True if valid, false otherwise.
 */
function validateTaskForm() {
  let valid = true;
  const title = document.getElementById('title');
  const titleErr = document.getElementById('title-error');
  const date = document.getElementById('due-date');
  const dateErr = document.getElementById('date-error');
  const catVisible = document.querySelector('.category-selection .selector');
  const catHidden = document.getElementById('category-hidden');
  const catErr = document.getElementById('category-error');
  valid = validateTitle(title, titleErr, valid);
  valid = validateDate(date, dateErr, valid);
  valid = validateCategory(catVisible, catHidden, catErr, valid);
 
  return valid;
}


/**
 * Validates the title input.
 * @param {HTMLElement} title - Title input element.
 * @param {HTMLElement} titleErr - Title error element.
 * @param {boolean} valid - Current validation state.
 * @returns {boolean}
 */
function validateTitle(title, titleErr, valid) {
  if (!title.value.trim()) {
    showError(title, titleErr, 'This field is required');
    return false;
  }
  clearError(title, titleErr);
  return valid;
}


/**
 * Applies validation rules to a due-date input field.
 *
 * Behavior:
 * - If the field is empty:
 *     - Shows a "required" error when `required` is true.
 *     - Otherwise clears errors without blocking submission.
 * - If the field has a value:
 *     - Checks whether the date is before today or beyond the allowed max date.
 *     - Displays the appropriate error message if invalid.
 *     - Clears errors when valid.
 *
 * Used by both live-validation (non-critical) and submit-validation (critical).
 *
 * @param {HTMLInputElement} inputEl - The date input element.
 * @param {HTMLElement|null} errorEl - The error message element (may be null).
 * @param {{required: boolean, valid: boolean}} options - Validation options.
 * @returns {boolean} `false` when invalid, otherwise returns the provided `valid` flag.
 */
function applyDueDateValidation(inputEl, errorEl, { required, valid }) {
  const v = inputEl.value.trim(),
        today = todayLocalISO(),
        maxDate = getMaxDueDateISO(2);
  if (!v) {
    return required
      ? (showError(inputEl, errorEl, 'This field is required'), false)
      : (clearError(inputEl, errorEl), valid);
  }
  const msg = getDueDateError(v, today, maxDate);
  return msg
    ? (showError(inputEl, errorEl, msg), false)
    : (clearError(inputEl, errorEl), valid);
}


/**
 * Performs submit-level validation for the due-date field.
 *
 * This function enforces all required validation rules:
 * - The field must not be empty.
 * - The selected date must not be in the past.
 * - The selected date must not exceed the maximum allowed date range.
 *
 * It delegates the actual logic to `applyDueDateValidation` with
 * `required: true`, ensuring the field is treated as mandatory.
 *
 * @param {HTMLInputElement} date - The date input element being validated.
 * @param {HTMLElement} dateErr - The associated error message element.
 * @param {boolean} valid - The current accumulated validation state.
 * @returns {boolean} Updated validation state (`false` if invalid).
 */
function validateDate(date, dateErr, valid) {
  return applyDueDateValidation(date, dateErr, { required: true, valid });
}


/**
 * Validates the category selection.
 * @param {HTMLElement} catVisible - Visible category input.
 * @param {HTMLElement} catHidden - Hidden category input.
 * @param {HTMLElement} catErr - Category error element.
 * @param {boolean} valid - Current validation state.
 * @returns {boolean}
 */
function validateCategory(catVisible, catHidden, catErr, valid) {
  if (!catHidden.value.trim()) {
    showError(catVisible, catErr, 'This field is required');
    return false;
  }
  clearError(catVisible, catErr);
  return valid;
}


/**
 * Returns today's date in local timezone as YYYY-MM-DD.
 */
function todayLocalISO() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().split('T')[0];
}



function getMaxDueDateISO(years = 2) {
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date.toISOString().split("T")[0];
}


/**
 * Returns a validation error message for a given due date.
 *
 * Rules:
 * - If the date is before today → returns an error message.
 * - If the date is more than the allowed maxDate → returns an error message.
 * - If the date is valid → returns an empty string.
 *
 * @param {string} v - The selected date in ISO format (YYYY-MM-DD).
 * @param {string} today - Today's date in ISO format.
 * @param {string} maxDate - The maximum allowed date in ISO format.
 * @returns {string} An error message or an empty string if the date is valid.
 */
function getDueDateError(v, today, maxDate) {
  return v < today
    ? 'Please select a current or future date.'
    : v > maxDate
      ? 'Please select a date within the next two years.'
      : '';
}


/**
 * Validates the due date field in real time and shows a custom error if it's in the past.
 */
/**
 * Sets up validation behavior for the due-date field without showing errors initially.
 */
function dueDateValidation() {
  const d = document.getElementById('due-date'), err = document.getElementById('date-error');
  if (!d || d.dataset.bound) return; d.dataset.bound = '1';
  const today = todayLocalISO()
  const maxDate = getMaxDueDateISO(2);
  const validate = () => {
    const v = d.value.trim(), msg = getDueDateError(v, today, maxDate);
    msg ? showError(d, err, msg) : clearError(d, err);
  };
  d.addEventListener('input', validate);
  d.addEventListener('change', validate);
  d.addEventListener('blur', validate);
}
