// ======================================================
// 🔹 INITIALIZATION OF SUBTASK INPUT
// ======================================================

/**
 * Initializes the subtask input field in the dialog.
 */
function initSubtaskInput() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!input || !list) return;
  input.addEventListener('keydown', event => handleSubtaskInputKeydown(event, input, list));
}


/**
 * Handles key events in the subtask input field.
 * @param {KeyboardEvent} event - The key event.
 * @param {HTMLInputElement} input - The subtask input element.
 * @param {HTMLElement} list - The subtask list element.
 */
function handleSubtaskInputKeydown(event, input, list) {
  const value = input.value.trim();
  if (event.key === 'Enter' && value) return addSubtaskOnEnter(event, list, input, value);
  if (event.key === 'Escape') return clearSubtaskInput(event, input);
}


/**
 * Adds a subtask when the Enter key is pressed.
 * @param {KeyboardEvent} event - The key event.
 * @param {HTMLElement} list - The subtask list element.
 * @param {HTMLInputElement} input - The input field.
 * @param {string} value - The subtask text value.
 */
function addSubtaskOnEnter(event, list, input, value) {
  event.preventDefault();
  list.innerHTML += getSubtaskTpl(value);
  input.value = '';
}


/**
 * Clears the input field when the Escape key is pressed.
 * @param {KeyboardEvent} event - The key event.
 * @param {HTMLInputElement} input - The input field.
 */
function clearSubtaskInput(event, input) {
  event.preventDefault();
  input.value = '';
  input.blur();
}


// ======================================================
// 🔹 INITIALIZATION OF SUBTASK LIST EVENTS
// ======================================================

/**
 * Initializes all event handlers for subtask list interactions.
 */
function initSubtaskHandlers() {
  const list = document.querySelector(".dlg-edit__subtask-list");
  if (!list) return;

  list.addEventListener("dblclick", event => {
    const listItem = event.target.closest("li");
    if (!listItem) return;
    if (event.target.closest(".subtask-edit-box__delete-img")) return;
    if (event.target.closest(".subtask-edit-box__edit-img")) return;
    startSubtaskEdit(listItem);
  });

  list.addEventListener("click", event => handleSubtaskClick(event));
  list.addEventListener("keydown", event => handleSubtaskEditKeydown(event));
}


/**
 * Resets all edit icons by replacing them to remove duplicate event listeners.
 * @param {HTMLElement} list - The subtask list element.
 */
function resetEditIcons(list) {
  const icons = list.querySelectorAll(".subtask-edit-box__edit-img");
  icons.forEach(icon => icon.replaceWith(icon.cloneNode(true)));
}

/**
 * Binds double-click event for editing subtasks.
 * @param {HTMLElement} list - The subtask list element.
 */
function bindSubtaskDblclick(list) {
  list.addEventListener("dblclick", event => {
    const listItem = event.target.closest("li");
    if (!listItem) return;
    if (event.target.closest(".subtask-edit-box__delete-img")) return;
    startSubtaskEdit(listItem);
  });
}


/**
 * Binds click events to edit icons of each subtask.
 * @param {HTMLElement} list - The subtask list element.
 */
function bindEditIconClicks(list) {
  const icons = list.querySelectorAll(".subtask-edit-box__edit-img");
  icons.forEach(icon => {
    icon.addEventListener("click", event => {
      event.stopPropagation();
      const listItem = event.target.closest("li");
      if (!listItem) return;
      startSubtaskEdit(listItem);
    });
  });
}


// ======================================================
// 🔹 SUBTASK EDITING
// ======================================================

/**
 * Starts the edit mode for a given subtask list item.
 * @param {HTMLElement} listItem - The subtask list item to edit.
 */
function startSubtaskEdit(listItem) {
  if (!listItem || listItem.classList.contains("edit-mode")) return;
  const text = (listItem.textContent || "").replace("•", "").trim();
  replaceSubtaskWithEditTpl(listItem, text);
}


/**
 * Handles click events inside the subtask list.
 * @param {MouseEvent} event - The click event.
 */
function handleSubtaskClick(event) {
  const editBtn = event.target.closest(".subtask-edit-box__edit-img");
  if (editBtn) {
    event.stopPropagation();
    const listItem = editBtn.closest("li");
    if (listItem) startSubtaskEdit(listItem);
    return;
  }

  handleSubtaskConfirm(event);
  handleSubtaskDelete(event);
}


/**
 * Handles keyboard input while editing a subtask.
 * @param {KeyboardEvent} event - The key event.
 */
function handleSubtaskEditKeydown(event) {
  const input = event.target.closest('.edit-input');
  if (!input) return;
  const listItem = input.closest('li');
  if (event.key === 'Escape') return cancelSubtaskEdit(event, listItem, input);
  if (event.key === 'Enter') return confirmSubtaskEdit(event, listItem, input);
}


/**
 * Cancels editing and restores the original subtask text.
 * @param {KeyboardEvent} event - The key event.
 * @param {HTMLElement} listItem - The subtask list item.
 * @param {HTMLInputElement} input - The input field.
 */
function cancelSubtaskEdit(event, listItem, input) {
  event.preventDefault();
  listItem.outerHTML = getSubtaskTpl(input.dataset.original || input.value);
}


/**
 * Confirms editing and replaces the subtask text with the new value.
 * @param {KeyboardEvent} event - The key event.
 * @param {HTMLElement} listItem - The subtask list item.
 * @param {HTMLInputElement} input - The input field.
 */
function confirmSubtaskEdit(event, listItem, input) {
  event.preventDefault();
  const newText = input.value.trim();
  if (newText) listItem.outerHTML = getSubtaskTpl(newText);
}


// ======================================================
// 🔹 ICON BUTTONS FOR SUBTASK INPUT
// ======================================================

/**
 * Initializes icon buttons for subtask input (confirm/cancel).
 */
function initSubtaskIconButtons() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  const confirm = document.querySelector('.subtask-input__confirm-img');
  const cancel = document.querySelector('.subtask-input__cancel-img');
  if (!input || !list) return;
  confirm?.addEventListener('mousedown', event => handleConfirmBtnClick(event, input, list));
  cancel?.addEventListener('mousedown', event => handleCancelBtnClick(event, input));
}


/**
 * Adds a new subtask when the confirm icon is clicked.
 * @param {MouseEvent} event - The mouse event.
 * @param {HTMLInputElement} input - The subtask input element.
 * @param {HTMLElement} list - The subtask list element.
 */
function handleConfirmBtnClick(event, input, list) {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  list.innerHTML += getSubtaskTpl(value);
  input.value = '';
  input.focus();
}


/**
 * Clears the input field when the cancel icon is clicked.
 * @param {MouseEvent} event - The mouse event.
 * @param {HTMLInputElement} input - The subtask input element.
 */
function handleCancelBtnClick(event, input) {
  event.preventDefault();
  input.value = '';
  input.focus();
}


// ======================================================
// 🔹 SUBTASK MANIPULATION (DELETE / CONFIRM)
// ======================================================

/**
 * Handles clicks on edit icons inside the subtask list.
 * @param {Event} subtask - The click event.
 */
function handleSubtaskEdit(subtask) {
  const listItem = subtask.target.closest('li');
  if (!listItem || listItem.classList.contains('edit-mode')) return;
  if (subtask.target.closest('.subtask-edit-box__delete-img')) return;
  const text = (listItem.textContent || '').replace('•', '').trim();
  replaceSubtaskWithEditTpl(listItem, text);
}


/**
 * Replaces a subtask item with an editable input template.
 * @param {HTMLElement} listItem - The subtask list item.
 * @param {string} text - The current subtask text.
 */
function replaceSubtaskWithEditTpl(listItem, text) {
  listItem.outerHTML = getEditSubtaskTpl(text);
  const input = document.querySelector('.edit-input:last-of-type');
  if (!input) return;
  input.setAttribute('data-original', text);
  input.focus();
  input.select();
}


/**
 * Deletes a subtask when the delete icon is clicked.
 * @param {Event} subtask - The click event.
 */
function handleSubtaskDelete(subtask) {
  const listItem = subtask.target.closest('.subtask-edit-box__delete-img')?.closest('li');
  listItem?.remove();
}


/**
 * Confirms subtask editing and replaces the edited text.
 * @param {Event} subtask - The click event.
 */
function handleSubtaskConfirm(subtask) {
  const listItem = subtask.target.closest('.subtask-edit-box__confirm-img')?.closest('li');
  if (!listItem) return;
  const input = listItem.querySelector('input');
  const newText = input?.value.trim();
  if (!newText) return;
  listItem.outerHTML = getSubtaskTpl(newText);
}


// ======================================================
// 🔹 SUBTASK COLLECTION / OBJECT CREATION
// ======================================================

/**
 * Collects all subtasks from the edit dialog and returns an object.
 * @returns {Object<string, {task: string, taskChecked: boolean}>} The subtask object.
 */
function collectSubtasksFromEditDialog() {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return {};
  const items = [...list.querySelectorAll('li:not(.edit-mode)')];
  return buildSubtaskObject(items);
}


/**
 * Builds a structured object from the given subtask list items.
 * @param {HTMLElement[]} items - Array of subtask list items.
 * @returns {Object<string, {task: string, taskChecked: boolean}>} The structured subtask data.
 */
function buildSubtaskObject(items) {
  const subtasksList = {};
  items.forEach((listItem, i) => {
    const value = (listItem.textContent || '').replace('•', '').trim();
    if (value) subtasksList[`subtask${i}`] = { task: value, taskChecked: false };
  });
  return subtasksList;
}
