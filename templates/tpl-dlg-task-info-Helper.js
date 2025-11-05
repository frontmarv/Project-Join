let subtaskActionLock = false;

function getPriorityImg(priority) {
  switch (priority) {
    case 'urgent':
      return '../assets/img/task-priority-urgent.svg';
    case 'medium':
      return '../assets/img/task-priority-medium.svg';
    case 'low':
      return '../assets/img/task-priority-low.svg';
  }
}


function renderAssignedUsers(contacts = []) {
  if (!Array.isArray(contacts)) contacts = [];

  const validContacts = contacts.filter(id => id && id.trim() !== "");
  if (validContacts.length === 0) {
    return /*html*/ `
      <div class="dlg__user-box"><span>No users assigned</span></div>`;
  }

  return /*html*/ `
    <div id="assigned-user-list">
      ${contacts
      .map(id => {
        const userName = getUserNameById(id);
        const name = addTagToLoggedInUser(userName);
        const imgColour = getUserPicById(id);
        const userInitials = getUserInitialsById(id);
        return /*html*/ `
            <div class="task__assignments__user-dates">
                <div class="task__assignments-circle" style="background-color : ${imgColour}">${userInitials}</div>
                <div class="assigned-user-name">${name}</div>
            </div>`;
      })
      .join('')}
    </div>
  `;
}


function getCheckboxImgSrc(isChecked) {
  return /*html*/ `../assets/img/${isChecked ? 'checkbox-checked.svg' : 'checkbox-unchecked.svg'}`;
}

function renderSubtasks(subtasks = {}, taskId) {
  if (!subtasks || typeof subtasks !== 'object' || Object.keys(subtasks).length === 0) {
    return /*html*/ `<span class="dlg__main__task-subtask no-subtasks">No subtasks</span>`;
  }

  const entries = Object.entries(subtasks).sort(([a], [b]) => {
    const na = parseInt(a.replace('subtask', ''), 10);
    const nb = parseInt(b.replace('subtask', ''), 10);
    return (isNaN(na) || isNaN(nb)) ? 0 : na - nb;
  });

  return entries.map(([key, st]) => {
    if (!st || !st.task) return '';
    const checked = !!st.taskChecked;

    return /*html*/ `
      <div class="dlg__main__task-subtask"
          data-subtask-key="${key}"
          data-task-id="${taskId}"
          onmousedown="onSubtaskRowMouseDown(event, '${taskId}', '${key}', this)">

        <div class="subtask-wrapper">
          <img class="checkbox"
              src="${getCheckboxImgSrc(checked)}"
              data-checked="${checked}"
              alt="checkbox">
          <span class="subtask-text">${st.task}</span>
        </div>

        <div class="deletebox-wrapper">
          <div class="separator"></div>
          <img class="subtask-delete-btn"
              src="../assets/img/delete.svg"
              alt="delete subtask"
              onmousedown="onDeleteSubtaskMouseDown(event, '${taskId}', '${key}', this)">
        </div>
      </div>
    `;
  }).join('');
}

function onSubtaskRowMouseDown(e, taskId, subtaskKey, rowEl) {
  if (e.target.closest('.deletebox-wrapper')) return;

  if (subtaskActionLock) return;
  subtaskActionLock = true;
  setTimeout(() => subtaskActionLock = false, 200);

  e.preventDefault();
  e.stopPropagation();
  toggleSubtaskChecked(taskId, subtaskKey, rowEl);
}

function onDeleteSubtaskMouseDown(e, taskId, subtaskKey, btnEl) {
  if (subtaskActionLock) return;
  subtaskActionLock = true;
  setTimeout(() => subtaskActionLock = false, 200);

  e.preventDefault();
  e.stopPropagation();
  deleteSubtask(taskId, subtaskKey, btnEl.closest('.dlg__main__task-subtask'));
}

async function toggleSubtaskChecked(taskId, subtaskKey, rowEl) {
  const imgEl = rowEl.querySelector('img.checkbox');
  if (!imgEl) return;

  const wasChecked = imgEl.dataset.checked === 'true';
  const willBeChecked = !wasChecked;

  imgEl.dataset.checked = String(willBeChecked);
  imgEl.src = getCheckboxImgSrc(willBeChecked);

  let text = '';
  const taskObj = tasks.find(t => t.id === taskId);
  if (taskObj?.subtasks?.[subtaskKey]?.task) {
    text = taskObj.subtasks[subtaskKey].task;
  } else {
    text = rowEl.querySelector('.subtask-text')?.textContent?.trim() || '';
  }

  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
  await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ task: text, taskChecked: willBeChecked })
  });

  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}