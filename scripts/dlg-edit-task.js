function getSelectedPriorityFromEditDialog() {
  const active = document.querySelector('.dlg-edit__main__task-priority-btn-box .priority-options-btn.active');
  if (active && active.id) return active.id;
  const btns = document.querySelectorAll('.dlg-edit__main__task-priority-btn-box .priority-options-btn');
  for (const btn of btns) {
    const img = btn.querySelector('img');
    if (img && img.getAttribute('src') === img.getAttribute('data-selected')) {
      return btn.id;
    }
  }
  return null;
}


async function saveEditedTask(taskId) {
  const titleInput = document.getElementById('title-input');
  const titleBox = titleInput?.closest('.dlg-edit__main__title-box');
  const existingError = titleBox?.querySelector('.error-msg');

  if (existingError) existingError.remove();
  if (titleInput) {
    titleInput.classList.remove('input--validation-modifier');
    titleInput.removeAttribute('required');
  }

  const title = (titleInput?.value || '').trim();

  if (!title) {
    if (titleInput) {
      titleInput.setAttribute('required', 'required');
      titleInput.classList.add('input--validation-modifier');
      titleInput.reportValidity?.();
    }
    if (titleBox) {
      const msg = document.createElement('span');
      msg.className = 'error-msg';
      msg.textContent = 'Title is required.';
      titleBox.appendChild(msg);
    }
    return;
  }

  try {
    const description = (document.getElementById('descriptions-input')?.value || '').trim();
    const dueDate = (document.getElementById('due-date')?.value || '').trim();
    const priority = getSelectedPriorityFromEditDialog();
    const assignedContacts = getSelectedAssignmentIds();
    const oldTask = tasks.find(t => t.id === taskId) || {};

    function collectSubtasksPreserveChecked(oldTaskObj) {
      const list = document.querySelector('.dlg-edit__subtask-list');
      if (!list) return {};

      const items = Array.from(list.querySelectorAll('li')).filter(li => !li.classList.contains('edit-mode'));
      const oldCheckedByText = {};

      if (oldTaskObj?.subtasks) {
        Object.values(oldTaskObj.subtasks).forEach(st => {
          if (st?.task) oldCheckedByText[st.task.trim()] = !!st.taskChecked;
        });
      }

      const result = {};
      let idx = 0;
      items.forEach(li => {
        let text = '';
        const tn = Array.from(li.childNodes).find(n => n.nodeType === Node.TEXT_NODE);
        text = tn?.nodeValue?.replace('•', '').trim() || li.textContent.replace('•', '').trim();
        if (!text) return;
        result[`subtask${idx}`] = { task: text, taskChecked: oldCheckedByText[text] || false };
        idx++;
      });
      return result;
    }

    const subtasks = collectSubtasksPreserveChecked(oldTask);
    const merged = { ...oldTask, title, description, dueDate, ...(priority ? { priority } : {}), assignedContacts, subtasks };
    const { id, ...payload } = merged;

    const res = await fetch(
      `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}.json`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );
    if (!res.ok) throw new Error(`Save failed: ${res.status} ${res.statusText}`);

    await getData();
    loadTasks();
    updateAllPlaceholders();

    renderTaskInfoDlg(taskId);

    showPopupMsgChangesSaved();

  } catch (err) {
    console.error('Fehler beim Speichern:', err);
  }
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


async function deleteSubtask(taskId, subtaskKey, rowEl) {
  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
  await fetch(url, { method: 'DELETE' });

  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}


