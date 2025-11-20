// ======================================================
// 🔹 PRIORITY HANDLING
// ======================================================

/**
 * Returns the currently active priority button in the edit dialog.
 * @returns {HTMLElement|null} The active priority button or null.
 */
function getActivePriorityBtn() {
  return document.querySelector('.dlg-edit__main__task-priority-btn-box .priority-options-btn.active');
}


/**
 * Finds the priority button with a selected image state.
 * @returns {HTMLElement|null} The button with a selected image or null.
 */
function getImageSelectedPriorityBtn() {
  return [...document.querySelectorAll('.dlg-edit__main__task-priority-btn-box .priority-options-btn')]
    .find(btn => {
      const img = btn.querySelector('img');
      return img && img.getAttribute('src') === img.getAttribute('data-selected');
    });
}


/**
 * Gets the selected priority level (based on active or selected image button).
 * @returns {string|null} The selected priority ID or null.
 */
function getSelectedPriorityFromEditDialog() {
  return getActivePriorityBtn()?.id || getImageSelectedPriorityBtn()?.id || null;
}


// ======================================================
// 🔹 TITLE VALIDATION
// ======================================================

/**
 * Removes title validation errors and resets the input state.
 * @param {HTMLInputElement} titleInput - The title input element.
 * @param {HTMLElement} titleBox - The container element for the title input.
 */
function resetTitleInputErrors(titleInput, titleBox) {
  titleBox?.querySelector('.error-msg')?.remove();
  if (!titleInput) return;
  titleInput.classList.remove('input--validation-modifier');
  titleInput.removeAttribute('required');
}


/**
 * Displays an error message for an empty title field.
 * @param {HTMLInputElement} titleInput - The title input element.
 * @param {HTMLElement} titleBox - The container for the title field.
 */
function showTitleError(titleInput, titleBox) {
  if (!titleInput) return;
  applyTitleErrorStyles(titleInput);
  appendTitleErrorMessage(titleBox);
}


/**
 * Applies validation styles to the title input field.
 * @param {HTMLInputElement} titleInput - The title input element.
 */
function applyTitleErrorStyles(titleInput) {
  titleInput.setAttribute('required', 'required');
  titleInput.classList.add('input--validation-modifier');
  titleInput.reportValidity?.();
}


/**
 * Appends an error message below the title input field.
 * @param {HTMLElement} titleBox - The container element for the title input.
 */
function appendTitleErrorMessage(titleBox) {
  if (!titleBox) return;
  const msg = document.createElement('span');
  msg.className = 'error-msg';
  msg.textContent = 'Title is required.';
  titleBox.appendChild(msg);
}


// ======================================================
// 🔹 SUBTASK HANDLING
// ======================================================

/**
 * Collects subtasks from the edit dialog while preserving checked states.
 * @param {Object} oldTaskObj - The original task object.
 * @returns {Object} The rebuilt subtasks object.
 */
function collectSubtasksPreserveChecked(oldTaskObj) {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return {};
  const items = [...list.querySelectorAll('li')].filter(li => !li.classList.contains('edit-mode'));
  const oldCheckedByText = mapOldSubtasksChecked(oldTaskObj);
  return buildSubtaskResult(items, oldCheckedByText);
}


/**
 * Maps previous subtask text values to their checked states.
 * @param {Object} oldTaskObj - The original task object.
 * @returns {Object} A map of subtask text to checked boolean.
 */
function mapOldSubtasksChecked(oldTaskObj) {
  const map = {};
  const oldSubs = oldTaskObj?.subtasks ? Object.values(oldTaskObj.subtasks) : [];
  oldSubs.forEach(s => map[s.task.trim()] = !!s.taskChecked);
  return map;
}


/**
 * Builds the final subtask object preserving old checked states.
 * @param {HTMLElement[]} items - The subtask list items.
 * @param {Object} oldCheckedByText - Mapping of text to checked state.
 * @returns {Object} Reconstructed subtask data object.
 */
function buildSubtaskResult(items, oldCheckedByText) {
  const result = {};
  items.forEach((subtask, i) => {
    const raw = subtask.textContent?.replace('•', '').trim();
    if (raw) result[`subtask${i}`] = { task: raw, taskChecked: oldCheckedByText[raw] || false };
  });
  return result;
}


// ======================================================
// 🔹 FIREBASE UPDATE
// ======================================================

/**
 * Sends updated task data to Firebase via PUT request.
 * @param {string} taskId - The task ID.
 * @param {Object} payload - The task data to update.
 */
async function updateTaskInDatabase(taskId, payload) {
  const res = await fetch(
    `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`,
    getPutRequestConfig(payload)
  );
  if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);
}


/**
 * Returns the fetch configuration for a Firebase PUT request.
 * @param {Object} payload - The request body.
 * @returns {RequestInit} Fetch configuration object.
 */
function getPutRequestConfig(payload) {
  return {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}


// ======================================================
// 🔹 SAVE TASK FLOW
// ======================================================

/**
 * Refreshes data and shows a success popup after a successful save.
 * @param {string} taskId - The saved task ID.
 */
async function afterTaskSave(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders();
  renderTaskInfoDlg(taskId);
  showPopupMsgChangesSaved();
}


/**
 * Validates and saves the edited task to Firebase.
 * @param {string} taskId - The task ID.
 */
async function saveEditedTask(taskId) {
  const titleInput = document.getElementById('title-input');
  const titleBox = titleInput?.closest('.dlg-edit__main__title-box');
  resetTitleInputErrors(titleInput, titleBox);
  const title = titleInput?.value.trim();
  if (!title) return showTitleError(titleInput, titleBox);
  const dateInput = document.getElementById('due-date');
  const dateErr = document.getElementById('date-error');
  if (!validateDate(dateInput, dateErr, true)) {
    dateInput.focus();
    return;}
  const oldTask = tasks.find(task => task.id === taskId) || {};
  const merged = await buildUpdatedTaskObject(oldTask, title);
  await persistUpdatedTask(taskId, merged);
}


/**
 * Persists the updated task object to Firebase and triggers UI updates.
 * @param {string} taskId - The task ID.
 * @param {Object} merged - The updated task object.
 */
async function persistUpdatedTask(taskId, merged) {
  const { id, ...payload } = merged;
  await updateTaskInDatabase(taskId, payload);
  await afterTaskSave(taskId);
}


// ======================================================
// 🔹 TASK OBJECT BUILDER
// ======================================================

/**
 * Builds a new task object by merging old and new input values.
 * @param {Object} oldTask - The existing task data.
 * @param {string} title - The updated title.
 * @returns {Promise<Object>} The updated task object.
 */
async function buildUpdatedTaskObject(oldTask, title) {
  const description = getValueById('descriptions-input');
  const dueDate = getValueById('due-date');
  const priority = getSelectedPriorityFromEditDialog();
  const assignedContacts = getSelectedAssignmentIds();
  const subtasks = collectSubtasksPreserveChecked(oldTask);

  return {
    ...oldTask, title, description, dueDate, ...(priority ? { priority } : {}), assignedContacts, subtasks
  };
}


/**
 * Gets the trimmed string value of an input element by ID.
 * @param {string} id - The element ID.
 * @returns {string} The input value or empty string.
 */
function getValueById(id) {
  return document.getElementById(id)?.value.trim() || '';
}


// ======================================================
// 🔹 DELETE SUBTASK
// ======================================================

/**
 * Deletes a specific subtask from Firebase and refreshes the view.
 * @param {string} taskId - The task ID.
 * @param {string} subtaskKey - The subtask key.
 */
async function deleteSubtask(taskId, subtaskKey) {
  const url = getSubtaskUrl(taskId, subtaskKey);
  await fetch(url, { method: 'DELETE' });
  await refreshAfterSubtaskDelete(taskId);
}


/**
 * Returns the Firebase URL for a specific subtask.
 * @param {string} taskId - The task ID.
 * @param {string} subtaskKey - The subtask key.
 * @returns {string} The full Firebase URL.
 */
function getSubtaskUrl(taskId, subtaskKey) {
  return `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
}


/**
 * Refreshes data and UI after a subtask has been deleted.
 * @param {string} taskId - The task ID.
 */
async function refreshAfterSubtaskDelete(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}
