
function getActivePriorityBtn() {
  return document.querySelector(
    '.dlg-edit__main__task-priority-btn-box .priority-options-btn.active'
  );
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

function resetTitleInputErrors(titleInput, titleBox) {
  titleBox?.querySelector('.error-msg')?.remove();
  if (!titleInput) return;
  titleInput.classList.remove('input--validation-modifier');
  titleInput.removeAttribute('required');
}


function showTitleError(titleInput, titleBox) {
  if (!titleInput) return;
  titleInput.setAttribute('required', 'required');
  titleInput.classList.add('input--validation-modifier');
  titleInput.reportValidity?.();

  if (titleBox) {
    const msg = document.createElement('span');
    msg.className = 'error-msg';
    msg.textContent = 'Title is required.';
    titleBox.appendChild(msg);
  }
}


function collectSubtasksPreserveChecked(oldTaskObj) {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return {};

  const items = [...list.querySelectorAll('li')].filter(li => !li.classList.contains('edit-mode'));
  const oldCheckedByText = {};
  (oldTaskObj?.subtasks
    ? Object.values(oldTaskObj.subtasks)
    : []
  ).forEach(s => oldCheckedByText[s.task.trim()] = !!s.taskChecked);

  const result = {};
  items.forEach((sub, i) => {
    const raw = sub.textContent?.replace('•', '').trim();
    if (raw) result[`subtask${i}`] = { task: raw, taskChecked: oldCheckedByText[raw] || false };
  });
  return result;
}


async function updateTaskInDatabase(taskId, payload) {
  const res = await fetch(
    `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);
}


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
    const { id, ...payload } = merged;
    await updateTaskInDatabase(taskId, payload);
    await afterTaskSave(taskId);
  } catch (err) {
    console.error('Fehler beim Speichern:', err);
  }
}


async function buildUpdatedTaskObject(oldTask, title) {
  const description = document.getElementById('descriptions-input')?.value.trim() || '';
  const dueDate = document.getElementById('due-date')?.value.trim() || '';
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


function showPopupMsgChangesSaved() {
  const popup = document.createElement('div');
  popup.innerHTML = getPopupMsgChangesSavedTpl();
  document.body.appendChild(popup.firstElementChild);
  const popupEl = document.querySelector('.popup-msg-container');

  requestAnimationFrame(() => popupEl.classList.add('show'));
  setTimeout(() => {
    popupEl.classList.remove('show');
    setTimeout(() => popupEl.remove(), 300);
  }, 1500);
}


async function deleteSubtask(taskId, subtaskKey) {
  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
  await fetch(url, { method: 'DELETE' });
  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}
