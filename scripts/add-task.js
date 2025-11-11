let chosenPriority = "medium";

window.addEventListener("resize", relocateRequiredInfo);
window.addEventListener("load", relocateRequiredInfo);

/**
 * Initializes the Add Task form: loads data, sets up handlers and validation.
 * @returns {Promise<void>}
 */
async function initAddTask() {
  await getData();
  await waitFor(".contact-options");
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
  setupCategoryInvalidHandler();
  updateCategoryValidity();
  dueDateValidation();
}

const focusOrder = ["title", "description", "due-date"];

/**
 * Handles Enter key navigation between form inputs.
 * @param {KeyboardEvent} e - The keyboard event.
 */
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  if (!e.target.closest("form")) return;
  if (e.target.id === "subtask-input" || e.target.classList.contains("subtask-input")) {
    return;}
  const { id } = e.target;
  const next = focusOrder[focusOrder.indexOf(id) + 1];
  if (!next) return;
  e.preventDefault();
  document.getElementById(next)?.focus();
});

/**
 * Waits for a DOM element to appear before resolving.
 * @param {string} selector - The CSS selector to wait for.
 * @returns {Promise<Element>}
 */
function waitFor(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const el2 = document.querySelector(selector);
      if (el2) {
        obs.disconnect();
        resolve(el2);
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
}

/**
 * Handles priority button selection: resets all, sets color/icon for selected, and updates chosenPriority.
 * @param {HTMLElement} btnEl - The clicked button element.
 */
function changePriorityBtn(btnEl) {
  const colors = { urgent: "#FF3D00", medium: "#FFA700", low: "#7AE229" };
  document.querySelectorAll(".priority-options-btn").forEach(b => {
    b.style.backgroundColor = "#FFFFFF";
    b.style.color = "#000000";
    const img = b.querySelector("img");
    if (img) img.src = img.dataset.default;
  });
  const sel = document.getElementById(btnEl.id);
  sel.style.backgroundColor = colors[sel.id];
  sel.style.color = "#FFFFFF";
  const selImg = sel.querySelector("img");
  if (selImg) selImg.src = selImg.dataset.selected;
  chosenPriority = sel.id;
}

/**
 * Resets all priority buttons to default and sets chosenPriority to "medium".
 */
function resetPriorityButtons() {
  document.querySelectorAll(".priority-options-btn").forEach(btn => {
    btn.style.backgroundColor = "#FFFFFF";
    btn.style.color = "#000000";
    const img = btn.querySelector("img");
    if (img) img.src = img.dataset.default;
  });
  chosenPriority = "medium";
}

/**
 * Handles category dropdown clicks: toggles, selects options, or closes all.
 * @param {MouseEvent} e - The click event.
 */
document.addEventListener('click', (e) => {
  const root = e.target.closest('.category-selection');
  if (!root) return closeAllCategories();

  if (e.target.closest('.selector')) return toggleCategory(root);

  const opt = e.target.closest('.category-options li');
  if (opt) return selectCategoryOption(root, opt);
});

/**
 * Toggles the open/closed state of a category dropdown.
 * @param {HTMLElement} root - The category root element.
 */
function toggleCategory(root) {
  const open = !root.classList.contains('open');
  root.classList.toggle('open', open);
  setCatExpanded(root, open);
}

/**
 * Handles category option selection.
 * @param {HTMLElement} root - The category root element.
 * @param {HTMLElement} option - The selected option element.
 */
function selectCategoryOption(root, option) {
  const { label, value } = getLabelAndValue(option);
  const visible = setCategoryInputs(root, { label, value });
  updateAriaSelection(root, option);
  finalizeCategorySelection(root, visible);
}

/**
 * Returns text label and value from the clicked category option.
 * @param {HTMLElement} option - The selected option element.
 * @returns {{label: string, value: string}}
 */
function getLabelAndValue(option) {
  const label = option.textContent.trim();
  const value = option.dataset.value || label;
  return { label, value };
}

/**
 * Sets category input values (visible/proxy/hidden).
 * @param {HTMLElement} root - The category root element.
 * @param {{label: string, value: string}} param1 - The selected label and value.
 * @returns {HTMLInputElement|null}
 */
function setCategoryInputs(root, { label, value }) {
  const visible = root.querySelector('.selector');
  const proxy   = root.querySelector('#category-proxy')  || document.getElementById('category-proxy');
  const hidden  = root.querySelector('#category-hidden') || document.getElementById('category-hidden');
  if (visible) visible.value = label;
  if (proxy)   proxy.value   = value;
  if (hidden)  hidden.value  = value;
  return visible; 
}

/**
 * Updates aria-selected state for the chosen category option.
 * @param {HTMLElement} root - The category root element.
 * @param {HTMLElement} option - The selected option element.
 */
function updateAriaSelection(root, option) {
  root.querySelectorAll('.category-options [aria-selected="true"]')
      .forEach(el => el.setAttribute('aria-selected', 'false'));
  option.setAttribute('aria-selected', 'true');
}

/**
 * Finalizes category selection and clears validation errors.
 * @param {HTMLElement} root - The category root element.
 * @param {HTMLElement} visible - The visible input element.
 */
function finalizeCategorySelection(root, visible) {
  updateCategoryValidity?.();
  const err = root.querySelector('#category-error') || document.getElementById('category-error');
  clearError?.(visible, err);
  root.classList.remove('open');
  setCatExpanded(root, false);
}

/**
 * Closes all open category dropdowns.
 */
function closeAllCategories() {
  document.querySelectorAll('.category-selection.open')
    .forEach(el => { el.classList.remove('open'); setCatExpanded(el, false); });
}

/**
 * Updates aria-expanded attributes for accessibility.
 * @param {HTMLElement} root - The category root element.
 * @param {boolean} open - Whether the dropdown is open.
 */
function setCatExpanded(root, open) {
  root?.setAttribute('aria-expanded', String(open));
  const input = root?.querySelector('.selector');
  input?.setAttribute('aria-expanded', String(open));
}

/**
 * Sets up invalid handler for category proxy and triggers initial validation.
 */
function setupCategoryInvalidHandler() {
  waitFor('#category-proxy').then((proxy) => {
    if (!proxy) return;

    proxy.addEventListener('invalid', () => {
      const root = document.querySelector('.category-selection');
      root?.classList.add('invalid');
      root?.classList.remove('valid');
    }, true);

    updateCategoryValidity();
  });
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
 * Handles form submission: validates inputs, creates the task, and resets the form.
 * @param {SubmitEvent} event - The submit event.
 */
window.handleCreateTask = async function handleCreateTask(event) {
  event.preventDefault();
  if (!validateTaskForm()) return focusFirstError();
  await createTask?.();
  resetCreatedTaskForm(event.target);
};

/**
 * Focuses the first input with an error style.
 */
function focusFirstError() {
  document.querySelector('.input-error')?.focus();
}

/**
 * Resets the Add Task form and its related UI components.
 * @param {HTMLFormElement} form - The form element to reset.
 */
function resetCreatedTaskForm(form) {
  form.reset();

  const visibleCategoryInput = document.querySelector('.category-selection .selector');
  const proxyCategoryInput   = document.getElementById('category-proxy');
  const hiddenCategoryInput  = document.getElementById('category-hidden');

  if (visibleCategoryInput) visibleCategoryInput.value = '';
  if (proxyCategoryInput)   proxyCategoryInput.value   = '';
  if (hiddenCategoryInput)  hiddenCategoryInput.value  = '';

  updateCategoryValidity();
  resetPriorityButtons?.();
}

/**
 * Builds and saves a new task, then shows success overlay.
 */
async function createTask() {
  const taskStateRef = document.getElementById("task-state").value;
  const key = await getNextTaskKey();
  const newTask = buildNewTask();

  await saveTaskToFirebase(newTask, key);
  showAlertOverlay();
}

/**
 * Constructs a new task object based on form inputs.
 * @returns {Object} The newly built task.
 */
function buildNewTask() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: document.getElementById("due-date").value,
    assignedContacts: getSelectedAssignmentIds(),
    category: getSelectedCategoryText(),
    subtasks: collectSubtasksFromEditDialog(),
    priority: chosenPriority,
    taskState: document.getElementById("task-state").value
  };
}

/**
 * Displays the confirmation overlay after task creation.
 */
function showAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.remove("d-none");
}

/**
 * Closes the confirmation overlay and reloads the page.
 */
function closeAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.add("d-none");
  window.location.reload();
}

/**
 * Navigates to the Board view.
 */
function goToBoard() {
  window.location.href = "./board.html";
}

/**
 * Returns the currently selected category text.
 * @returns {string}
 */
function getSelectedCategoryText() {
  const el = document.querySelector(".category-selection .selector");
  return (el && el.value) ? el.value.trim() : "";
}

/**
 * Converts category name from camelCase to a readable string.
 * @param {string} category - The category name.
 * @returns {string}
 */
function formatCategory(category) {
  return String(category || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Clears the Add Task form and resets category and priority states.
 */
function clearTask() {
  const form = document.getElementById("task-form");
  form.reset();
  document.querySelector(".category-selection .selector").value = "";
  document.getElementById("category-proxy").value = "";
  document.getElementById("category-hidden").value = "";
  document.getElementById('subtask-list').innerHTML = "";
  document.getElementById('assigned-user').innerHTML = "";
  resetContactList();
  resetPriorityButtons();
  updateCategoryValidity();
}


/**
 * Resets the contact selection list by clearing all active states.
 *
 * This function finds all `<li>` elements within the `#contact-options` list
 * that have the class `active`, removes the class, resets their `data-checked`
 * attribute to "false", and updates their associated `<img>` elements to show
 * the unchecked checkbox icon.
 *
 * Use this to fully reset the contact selection UI back to its default state.
 *
 * @function resetContactList
 * @example
 * // Reset all contact list entries
 * resetContactList();
 */
function resetContactList() {
  document.querySelectorAll('#contact-options li.active').forEach(li => {
    li.classList.remove('active');
    li.dataset.checked = 'false';

    const img = li.querySelector('img');
    img.dataset.checked = 'false';
    img.src = '../assets/img/checkbox-unchecked.svg';
  });
}

/**
 * Handles layout adjustments for small screens.
 */
function relocateRequiredInfo() {
  isSmallScreen = window.innerWidth < 1025;
  let currentPath = window.location.pathname;
  let addTaskPath = "/pages/add-task.html";
  if (currentPath.endsWith(addTaskPath)) {
    toggleFirstInfoBox(isSmallScreen);
    toggleSecondInfoBox(isSmallScreen);
  }
}

/**
 * Shows or hides the first required-info box based on screen size.
 * @param {boolean} isSmallScreen - True if current screen width < 1025px.
 */
function toggleFirstInfoBox(isSmallScreen) {
  let requiredInfo = document.getElementById("required-info");
  if (!requiredInfo) return;
  if (isSmallScreen && !requiredInfo.classList.contains("d-none")) {
    requiredInfo.classList.add("d-none");
  } else if (!isSmallScreen && requiredInfo.classList.contains("d-none")) {
    requiredInfo.classList.remove("d-none");
  }
}

/**
 * Handles showing/hiding of the second required-info box for mobile.
 * @param {boolean} isSmallScreen - True if current screen width < 1025px.
 */
function toggleSecondInfoBox(isSmallScreen) {
  let rightColumn = document.querySelector(".add-task__right-column");
  if (!rightColumn) return;
  if (isSmallScreen && !document.getElementById("required-mobile")) {
    let insertHTML = getFieldRequiredInfo();
    rightColumn.innerHTML += insertHTML;
  } else if (!isSmallScreen && document.getElementById("required-mobile")) {
    document.getElementById("required-mobile").remove();
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