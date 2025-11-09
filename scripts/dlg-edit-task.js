/** ---------------- Priority Handling ---------------- */

function getActivePriorityBtn() {
  return document.querySelector('.dlg-edit__main__task-priority-btn-box .priority-options-btn.active');
}

function getImageSelectedPriorityBtn() {
  return [...document.querySelectorAll('.dlg-edit__main__task-priority-btn-box .priority-options-btn')]
    .find(btn => {
      const img = btn.querySelector('img');
      return img && img.getAttribute('src') === img.getAttribute('data-selected');
    });
}

function getSelectedPriorityFromEditDialog() {
  return getActivePriorityBtn()?.id || getImageSelectedPriorityBtn()?.id || null;
}

/** ---------------- Title Validation ---------------- */

function resetTitleInputErrors(titleInput, titleBox) {
  titleBox?.querySelector('.error-msg')?.remove();
  if (!titleInput) return;
  titleInput.classList.remove('input--validation-modifier');
  titleInput.removeAttribute('required');
}

function showTitleError(titleInput, titleBox) {
  if (!titleInput) return;
  applyTitleErrorStyles(titleInput);
  appendTitleErrorMessage(titleBox);
}

function applyTitleErrorStyles(titleInput) {
  titleInput.setAttribute('required', 'required');
  titleInput.classList.add('input--validation-modifier');
  titleInput.reportValidity?.();
}

function appendTitleErrorMessage(titleBox) {
  if (!titleBox) return;
  const msg = document.createElement('span');
  msg.className = 'error-msg';
  msg.textContent = 'Title is required.';
  titleBox.appendChild(msg);
}

/** ---------------- Subtasks Handling ---------------- */

function collectSubtasksPreserveChecked(oldTaskObj) {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return {};
  const items = [...list.querySelectorAll('li')].filter(li => !li.classList.contains('edit-mode'));
  const oldCheckedByText = mapOldSubtasksChecked(oldTaskObj);
  return buildSubtaskResult(items, oldCheckedByText);
}

function mapOldSubtasksChecked(oldTaskObj) {
  const map = {};
  const oldSubs = oldTaskObj?.subtasks ? Object.values(oldTaskObj.subtasks) : [];
  oldSubs.forEach(s => map[s.task.trim()] = !!s.taskChecked);
  return map;
}

function buildSubtaskResult(items, oldCheckedByText) {
  const result = {};
  items.forEach((sub, i) => {
    const raw = sub.textContent?.replace('•', '').trim();
    if (raw) result[`subtask${i}`] = { task: raw, taskChecked: oldCheckedByText[raw] || false };
  });
  return result;
}

/** ---------------- Firebase Update ---------------- */

async function updateTaskInDatabase(taskId, payload) {
  const res = await fetch(
    `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`,
    getPutRequestConfig(payload)
  );
  if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);
}

function getPutRequestConfig(payload) {
  return {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  };
}

/** ---------------- Save Task Flow ---------------- */

async function afterTaskSave(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders();
  renderTaskInfoDlg(taskId);
  showPopupMsgChangesSaved();
}

async function saveEditedTask(taskId) {
  const titleInput = document.getElementById('title-input');
  const titleBox = titleInput?.closest('.dlg-edit__main__title-box');
  resetTitleInputErrors(titleInput, titleBox);

  const title = titleInput?.value.trim();
  if (!title) return showTitleError(titleInput, titleBox);

  try {
    const oldTask = tasks.find(t => t.id === taskId) || {};
    const merged = await buildUpdatedTaskObject(oldTask, title);
    await persistUpdatedTask(taskId, merged);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
  }
}

async function persistUpdatedTask(taskId, merged) {
  const { id, ...payload } = merged;
  await updateTaskInDatabase(taskId, payload);
  await afterTaskSave(taskId);
}

/** ---------------- Task Object Builder ---------------- */

async function buildUpdatedTaskObject(oldTask, title) {
  const description = getValueById('descriptions-input');
  const dueDate = getValueById('due-date');
  const priority = getSelectedPriorityFromEditDialog();
  const assignedContacts = getSelectedAssignmentIds();
  const subtasks = collectSubtasksPreserveChecked(oldTask);

  return {
    ...oldTask,
    title,
    description,
    dueDate,
    ...(priority ? { priority } : {}),
    assignedContacts,
    subtasks
  };
}

function getValueById(id) {
  return document.getElementById(id)?.value.trim() || '';
}

/** ---------------- Popup Message ---------------- */

function showPopupMsgChangesSaved() {
  const popup = document.createElement('div');
  popup.innerHTML = getPopupMsgChangesSavedTpl();
  document.body.appendChild(popup.firstElementChild);
  showAndAutoRemovePopup();
}

function showAndAutoRemovePopup() {
  const popupEl = document.querySelector('.popup-msg-container');
  requestAnimationFrame(() => popupEl.classList.add('show'));
  setTimeout(() => hidePopupElement(popupEl), 1500);
}

function hidePopupElement(popupEl) {
  popupEl.classList.remove('show');
  setTimeout(() => popupEl.remove(), 300);
}

/** ---------------- Delete Subtask ---------------- */

async function deleteSubtask(taskId, subtaskKey) {
  const url = getSubtaskUrl(taskId, subtaskKey);
  await fetch(url, { method: 'DELETE' });
  await refreshAfterSubtaskDelete(taskId);
}

function getSubtaskUrl(taskId, subtaskKey) {
  return `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
}

async function refreshAfterSubtaskDelete(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}
