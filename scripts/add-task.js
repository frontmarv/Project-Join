let chosenPriority = "medium";
const alertDialog = document.getElementById('alert-dlg-box');
const alertOverlay = document.getElementById('alert-overlay');
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
  bindLiveRequiredClear('title', 'title-error');
  setMinDueDate();
  
}

const focusOrder = [
  "title", "description", "due-date", "urgent", "medium", "low", "contact-search", "category-proxy", "subtask-input"];

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
 * Resets all priority buttons to their default visual state (white background,
 * black text, and default icon). After resetting, the "medium" priority button
 * is visually highlighted again (orange background, white text, selected icon),
 * and `chosenPriority` is set back to `"medium"`.
 *
 * This function is typically used when clearing the Add Task form, ensuring that
 * the priority selection always returns to its default state.
 *
 * @function resetPriorityButtons
 * @returns {void}
 */
function resetPriorityButtons() {
  document.querySelectorAll(".priority-options-btn").forEach(btn => {
    btn.style.backgroundColor = "#FFF";
    btn.style.color = "#000";
    btn.querySelector("img").src = btn.querySelector("img").dataset.default;
  });
  const mediumBtn = document.getElementById("medium");
  const img = mediumBtn.querySelector("img");
  mediumBtn.style.backgroundColor = "#FFA700";
  mediumBtn.style.color = "#FFF";
  img.src = img.dataset.selected;
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
 * Resets the Add Task form and its related UI components.
 * @param {HTMLFormElement} form - The form element to reset.
 */
function resetCreatedTaskForm(form) {
  form.reset();

  document.querySelector('.category-selection .selector').value = '';
  document.getElementById('category-proxy').value = '';
  document.getElementById('category-hidden').value = '';
  updateCategoryValidity();
  resetPriorityButtons?.();
  resetContactList();
  refreshAssignedUserContainer();
}


/**
 * Builds and saves a new task, then shows success overlay.
 */
async function createTask() {
  const taskStateRef = document.getElementById("task-state").value;
  const key = await getNextTaskKey();
  const newTask = buildNewTask();

  await saveTaskToFirebase(newTask, key);
  closeBoardAddTaskDialogIfExists();
  showTaskAddedAlert();
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
  dueDateValidation();
  clearAllErrors(form);
  refreshAssignedUserContainer();
}


/**
 * @function resetContactList
 * Clears all active contacts in #contact-options.
 * Removes `.active`, resets `data-checked`, and updates the checkbox icon.
 * @example
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
