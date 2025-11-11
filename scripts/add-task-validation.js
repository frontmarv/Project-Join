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
 * Validates the due date input.
 * @param {HTMLElement} date - Date input element.
 * @param {HTMLElement} dateErr - Date error element.
 * @param {boolean} valid - Current validation state.
 * @returns {boolean}
 */
function validateDate(date, dateErr, valid) {
  if (!date.value.trim()) {
    showError(date, dateErr, 'This field is required');
    return false;
  }
  clearError(date, dateErr);
  return valid;
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
 * Handles due-date input validation and styling.
 */
function dueDateValidation() {
  const d = document.getElementById('due-date'), err = document.getElementById('date-error');
  if (!d) return;
  if (!d.dataset.bound) {
    d.dataset.bound = '1';
    d.addEventListener('change', () => {
      d.classList.toggle('valid-input', !!d.value);
      d.classList.toggle('invalid-input', !d.value);
      if (d.value) clearError?.(d, err);
    });
    d.addEventListener('input', () => { if (d.value.trim()) clearError?.(d, err); });
  }
  d.classList.remove('valid-input','invalid-input');
  d.classList.toggle('input-error', !d.value);
}