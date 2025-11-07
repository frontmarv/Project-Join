
function getTaskInfoDlgTpl(task) {
  return /*html*/ `
    <header class="dlg__header">
      <span class="dlg__header_task-category ${getCategoryClass(task.category)}">${formatCategory(task.category) || 'No category'}</span>
      <img
        class="dlg__close-btn"
        src="../assets/img/close-delete-cross.svg"
        onclick="hideDlg()"
        alt="small cross as close button">
    </header>

    <main class="dlg__main">
      <span class="dlg__main__task-title">${task.title || 'Untitled Task'}</span>
      <span class="dlg__main__task-description">${task.description || 'No description provided.'}</span>

      <div class="dlg__main__task__due-date">
        <span class="dlg__main__task__due-date-span">Due date:</span>
        <span class="dlg__main__task__due-date-value">${task.dueDate || 'No date'}</span>
      </div>

      <div class="dlg__main_task-priority-box"> 
        <span class="dlg__main_task-priority-title">Priority:</span>
        <img
          id="priority"
          class="dlg_main_task-priority"
          src="${getPriorityImg(task.priority)}"
          alt="priority icon">
      </div>
        <div class="scroll-wrapper">
          <div class="dlg__main__task-assignments">
            <span class="dlg__main__assignments-title">Assigned to:</span>
            <div class="task__assignments">${renderAssignedUsers(task.assignedContacts)}</div>
          </div>

          <div class="dlg__main__task-subtask-box">
            <span class="dlg__main__task-subtask-title">Subtasks:</span>
            <div class="subtasks-content">${renderSubtasks(task.subtasks, task.id)}</div>
          </div>
        </div>
    </main>

    <footer class="dlg__footer">
      <div class="dlg__footer__options-box">
        <img
          class="delete-btn"
          src="../assets/img/delete-with-text.svg"
          onclick="deleteTask('${task.id}')"
          alt="image of a garbage can">
        <span class="separator"></span>
        <img
          class="edit-btn"
          src="../assets/img/edit-with-text.svg"
          onclick="renderTaskEditDlg('${task.id}')"
          alt="image of a pencil">
      </div>
    </footer>
  `;
}

function getTaskEditDlgTpl(task) {
  return /*html*/ `
        <header class="dlg-edit__header">
            <img class="dlg-edit__close-btn" src="../assets/img/close-delete-cross.svg" onclick="hideDlg()" alt=" small cross as close button">
        </header>
        <main class="dlg-edit__main overflow-y">
            <div class="dlg-edit__main__title-box">
                <span class="dlg-edit__main__task-title">Title</span>
                <input id="title-input" class="title-input dlg-edit__input-text" type="text" placeholder="Enter a Title">
            </div>
            <div class="dlg-edit__main__description-box">
                <span class="dlg-edit__main__task-description">Description</span>
                <textarea id="descriptions-input" class="dlg-edit__textarea" type="text" placeholder="Enter a Description"></textarea>
            </div>
            <div class="dlg-edit__main__due-date-box" onclick="setMinDueDate()">
                <span class="dlg-edit__main__due-date-title">Due Date</span>
                <input type="date" id="due-date" class="dlg-edit__input-text">
            </div>
            <div class="dlg-edit__main__task-priority-options-box">
                <span class="dlg-edit__main__task-priority-title bold">Priority</span>
                <div class="dlg-edit__main__task-priority-btn-box">
                    <div class="priority-options-btn" id="urgent" onclick="changePriorityBtn(this)">Urgent 
                        <img src="../assets/img/priority-urgent.svg"
                            data-default="../assets/img/priority-urgent.svg"
                            data-selected="../assets/img/priority-urgent-active.svg"
                            alt="urgent">
                    </div>
                    <div class="priority-options-btn" id="medium" onclick="changePriorityBtn(this)">Medium 
                        <img src="../assets/img/priority-medium.svg"
                            data-default="../assets/img/priority-medium.svg"
                            data-selected="../assets/img/priority-medium-active.svg"
                            alt="medium">
                    </div>
                    <div class="priority-options-btn" id="low" onclick="changePriorityBtn(this)">Low 
                        <img src="../assets/img/priority-low.svg"
                            data-default="../assets/img/priority-low.svg"
                            data-selected="../assets/img/priority-low-active.svg"
                            alt="low">
                    </div>
                </div>
            </div>
            <div class="dlg-edit__main__task-assignments-box">
                <span class="dlg-edit__main__assignments-title">Assigned to</span>
                    <div class="contacts-selection" id="contact-select">
                      <div class="search-wrapper">
                        <input type="text" id="contact-search" class="selector" placeholder="Search contacts to assign..." autocomplete="off"/>
                      </div>
                      <ul class="contact-options"></ul>
                    </div>

                <div class="dlg-edit__main__assigned-user-container"></div>
            </div>
            <div class="dlg-edit__main__subtasks-box">
                <div class="dlg-edit__main__add-subtask-box">
                    <span class="dlg-edit__main__subtask-title">Subtasks</span>
                    <div class="subtask-input-wrapper">
                      <input id="subtask-input" class="subtask-input dlg-edit__input-text" type="text" placeholder="Add new Subtask" />
                      <div class="subtask-input-icons">
                          <img class="subtask-input__cancel-img" src="../assets/img/close-delete-cross.svg" alt="Cancel Subtask" />
                          <div class="separator"></div>
                          <img class="subtask-input__confirm-img" src="../assets/img/check.svg" alt="Add Subtask" />
                      </div>
                    </div>
                </div>
                <ul class="dlg-edit__subtask-list"></ul>
            </div>
        </main>
        <footer class="dlg-edit__footer">
            <div class="dlg-edit__footer__discard-btn filled-btn" onclick="renderTaskInfoDlg('${task.id}')">Discard</div>
            <div class="dlg-edit__footer__save-btn filled-btn" onclick="saveEditedTask('${task.id}')">SAVE</div>

        </footer>`
}

function getSubtaskTpl(value = '') {
  return /*html*/ `
    <li class="dlg-edit__main__subtask">• ${value}
      <div class="subtask-edit-box">
        <img class="subtask-edit-box__edit-img" src="../assets/img/edit.svg" alt="Edit Subtask">
        <div class="separator"></div>
        <img class="subtask-edit-box__delete-img" src="../assets/img/delete.svg" alt="Delete Subtask">
      </div>
    </li>`;
}

function getEditSubtaskTpl(value = '') {
  return /*html*/ `
    <li class="dlg-edit__main__subtask edit-mode">
      <input type="text" class="dlg-edit__input-text edit-input" value="${value}" />
      <div class="subtask-edit-box">
        <img class="subtask-edit-box__delete-img" src="../assets/img/delete.svg" alt="Delete Subtask">
        <div class="separator"></div>
        <img class="subtask-edit-box__confirm-img" src="../assets/img/check.svg" alt="Confirm Edit">
      </div>
    </li>`
}

function getAddTaskDlgTpl(defaultTaskState = "to-do") {
  return /*html*/ `
        <header class="dlg-edit__header dlg-add-task-header">
            <img class="dlg-edit__close-btn" src="../assets/img/close-delete-cross.svg" onclick="hideDlg()" alt=" small cross as close button">
        </header>
        <input type="hidden" id="task-state" value="${defaultTaskState}">
        <div data-insert="add-task-insert.html"></div>
    `
}

function getAssignmentListUserTpl(user, checked = false) {
  const initials = getUserNameInitials(user.name || '');
  const color = user.profilImgColor;
  const userName = addTagToLoggedInUser(user.name);
  return /*html*/ `
    <li data-user-id="${user.id}" class="${checked ? 'active' : ''}">
      <div class="user-selection-field">
        <svg width="32" height="32" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
          <circle cx="21" cy="21" r="20" fill="${color}" stroke="white" stroke-width="2" />
          <text x="21" y="23" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="white" font-family="sans-serif">${initials}</text>
        </svg>
        <span class="username">${userName}</span>
      </div>
      <img class="checkbox"
          src="../assets/img/${checked ? 'checkbox-checked-white.svg' : 'checkbox-unchecked.svg'}"
          alt="checkbox"
          data-checked="${checked}">
    </li>
  `;
}

function getAssignedUserSvgTpl(user) {
  const initials = getUserNameInitials(user.name || '');
  const color = user.profilImgColor;
  return /*html*/ `
    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <circle cx="21" cy="21" r="20" fill="${color}" stroke="white" stroke-width="2" />
      <text x="21" y="23" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="white" font-family="sans-serif">${initials}</text>
    </svg>
  `;
}