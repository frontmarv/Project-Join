// ======================================================
// 🔹 DIALOG TEMPLATES
// ======================================================
// Contains all HTML template generators for task dialogs,
// including task info, edit, add, and subtask elements.
// ======================================================


// ======================================================
// 🔹 TASK INFO DIALOG
// ======================================================

/**
 * Generates the HTML markup for the task info dialog.
 * @param {Object} task - Complete task object.
 * @param {string} task.id - Unique task identifier.
 * @param {string} [task.title] - Task title.
 * @param {string} [task.description] - Task description text.
 * @param {string} [task.category] - Task category name.
 * @param {string} [task.dueDate] - Due date in YYYY-MM-DD.
 * @param {string} [task.priority] - Priority level (urgent | medium | low).
 * @param {Array|Object|string} [task.assignedContacts] - Assigned user IDs.
 * @param {Object} [task.subtasks] - Object containing subtask key-value pairs.
 * @returns {string} HTML markup for the task info dialog.
 */
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
      <span class="dlg__main__task-description">${task.description || 'No description provided'}</span>

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

      <div class="dlg__main__task-assignments">
        <span class="dlg__main__assignments-title">Assigned to:</span>
        <div class="task__assignments">${renderAssignedUsers(task.assignedContacts)}</div>
      </div>

      <div class="dlg__main__task-subtask-box">
        <span class="dlg__main__task-subtask-title">Subtasks:</span>
        <div class="subtasks-content">${renderSubtasks(task.subtasks, task.id)}</div>
      </div>
    </main>

    <footer class="dlg__footer">
      <div class="dlg__footer__options-box">
        <img class="delete-btn" src="../assets/img/delete-with-text.svg" onclick="showDeleteTaskConfirm('${task.id}')" alt="delete icon">
        <span class="separator"></span>
        <img class="edit-btn" src="../assets/img/edit-with-text.svg" onclick="renderTaskEditDlg('${task.id}')" alt="edit icon">
      </div>
    </footer>
  `;
}


// ======================================================
// 🔹 TASK EDIT DIALOG
// ======================================================

/**
 * Generates the HTML markup for the "edit task" dialog.
 * @param {Object} task - Task object containing editable fields.
 * @param {string} task.id - Unique identifier of the task.
 * @returns {string} HTML markup for the edit dialog.
 */
function getTaskEditDlgTpl(task) {
  return /*html*/ `
        <header class="dlg-edit__header">
            <img class="dlg-edit__close-btn" src="../assets/img/close-delete-cross.svg" onclick="hideDlg()" alt="close button">
        </header>

        <main class="dlg-edit__main overflow-y">

            <div class="dlg-edit__main__title-box">
                <span class="dlg-edit__main__task-title">Title</span>
                <input id="title-input" class="title-input dlg-edit__input-text" type="text" maxlength="100" placeholder="Enter a Title">
            </div>

            <div class="dlg-edit__main__description-box">
                <span class="dlg-edit__main__task-description">Description</span>
                <textarea id="descriptions-input" class="dlg-edit__textarea" maxlength="800" placeholder="Enter a Description"></textarea>
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
                            data-selected="../assets/img/priority-urgent-active.svg">
                    </div>

                    <div class="priority-options-btn" id="medium" onclick="changePriorityBtn(this)">Medium 
                        <img src="../assets/img/priority-medium.svg"
                            data-default="../assets/img/priority-medium.svg"
                            data-selected="../assets/img/priority-medium-active.svg">
                    </div>

                    <div class="priority-options-btn" id="low" onclick="changePriorityBtn(this)">Low 
                        <img src="../assets/img/priority-low.svg"
                            data-default="../assets/img/priority-low.svg"
                            data-selected="../assets/img/priority-low-active.svg">
                    </div>

                </div>
            </div>

            <div class="dlg-edit__main__task-assignments-box">
                <span class="dlg-edit__main__assignments-title">Assigned to</span>

                <div class="contacts-selection" id="contact-select">
                  <div class="search-wrapper">
                    <input type="text" maxlength="50" id="contact-search" class="selector" placeholder="Search contacts" autocomplete="off"/>
                  </div>
                  <ul class="contact-options"></ul>
                </div>

                <div class="dlg-edit__main__assigned-user-container"></div>
            </div>

            <div class="dlg-edit__main__subtasks-box">
                <div class="dlg-edit__main__add-subtask-box">
                    <span class="dlg-edit__main__subtask-title">Subtasks</span>

                    <div class="subtask-input-wrapper">
                      <input id="subtask-input" class="subtask-input dlg-edit__input-text" type="text" maxlength="50" placeholder="Add new Subtask" />
                      
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
            <button class="dlg-edit__footer__discard-btn empty-btn" onclick="renderTaskInfoDlg('${task.id}')">
              Discard <img src="../assets/img/close.svg">
            </button>

            <button class="dlg-edit__footer__save-btn filled-btn" onclick="saveEditedTask('${task.id}')">
              Save Changes <img src="../assets/img/done.svg">
            </button>
        </footer>
    `;
}


// ======================================================
// 🔹 SUBTASK ELEMENTS
// ======================================================

/**
 * Generates HTML markup for a normal (non-editable) subtask list item.
 * @param {string} [value=""] - Subtask text.
 * @returns {string} HTML markup for a subtask item.
 */
function getSubtaskTpl(value = "") {
  return /*html*/ `
    <li class="dlg-edit__main__subtask">• ${value}
      <div class="subtask-edit-box">
        <img class="subtask-edit-box__edit-img" src="../assets/img/edit.svg" alt="Edit Subtask">
        <div class="separator"></div>
        <img class="subtask-edit-box__delete-img" src="../assets/img/delete.svg" alt="Delete Subtask">
      </div>
    </li>`;
}


/**
 * Generates HTML markup for an editable subtask row.
 * @param {string} [value=""] - Initial subtask text.
 * @returns {string} HTML markup for editable subtask.
 */
function getEditSubtaskTpl(value = "") {
  return /*html*/ `
    <li class="dlg-edit__main__subtask edit-mode">
      <input type="text" maxlength="50" class="dlg-edit__input-text edit-input" value="${value}" />
      <div class="subtask-edit-box">
        <img class="subtask-edit-box__delete-img" src="../assets/img/delete.svg" alt="Delete Subtask">
        <div class="separator"></div>
        <img class="subtask-edit-box__confirm-img" src="../assets/img/check.svg" alt="Confirm Edit">
      </div>
    </li>`;
}


/**
 * Generates HTML markup for a subtask item inside the task info dialog.
 * @param {string} key - Subtask key.
 * @param {string} taskId - ID of the parent task.
 * @param {boolean} checked - Completion state.
 * @param {string} text - Subtask text.
 * @returns {string} HTML markup for a subtask row.
 */
function subtaskItemTemplate(key, taskId, checked, text) {
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
            <span class="subtask-text">${text}</span>
        </div>

        <div class="deletebox-wrapper">
            <div class="separator"></div>
            <img class="subtask-delete-btn"
                src="../assets/img/delete.svg"
                alt="delete subtask"
                onmousedown="event.preventDefault(); showDeleteSubtaskConfirm('${taskId}', '${key}')">
        </div>
    </div>
  `;
}



// ======================================================
// 🔹 ADD TASK DIALOG
// ======================================================

/**
 * Generates HTML markup for the add-task dialog.
 * @param {string} [defaultTaskState="to-do"] - Initial task state for new task.
 * @returns {string} HTML markup for the add-task dialog.
 */
function getAddTaskDlgTpl(defaultTaskState = "to-do") {
  return /*html*/ `
    <header class="dlg-edit__header dlg-add-task-header">
        <img class="dlg-edit__close-btn" src="../assets/img/close-delete-cross.svg" onclick="hideDlg()" alt="close button">
    </header>

    <input type="hidden" id="task-state" value="${defaultTaskState}">
    <div data-insert="add-task-insert.html"></div>
  `;
}



// ======================================================
// 🔹 ASSIGNMENT TEMPLATES
// ======================================================

/**
 * Generates HTML markup for a single user option inside the assignment selector.
 * @param {Object} user - User data object.
 * @param {string} user.id - User ID.
 * @param {string} user.name - User full name.
 * @param {string} user.profilImgColor - Avatar color.
 * @param {boolean} [checked=false] - Whether the user is already assigned.
 * @returns {string} HTML markup for a selectable user row.
 */
function getAssignmentListUserTpl(user, checked = false) {
  const initials = getUserNameInitials(user.name || "");
  const color = user.profilImgColor;
  const userName = addTagToLoggedInUser(user.name);

  return /*html*/ `
    <li data-user-id="${user.id}" class="${checked ? "active" : ""}">
      <div class="user-selection-field">
        <div class="user-avatar" style="background-color: ${color};">${initials}</div>
        <span class="username">${userName}</span>
      </div>
      <img 
        class="checkbox"
        src="../assets/img/${checked ? "checkbox-checked-white.svg" : "checkbox-unchecked.svg"}"
        alt="checkbox"
        data-checked="${checked}">
    </li>
  `;
}


/**
 * Generates the HTML markup for a small "assigned user" item
 * inside the task info dialog.
 * @param {string} imgColour - Background color.
 * @param {string} userInitials - Initials of the user.
 * @param {string} name - Full name of the user.
 * @returns {string} HTML markup for an assigned user entry.
 */
function assignedUserItemTemplate(imgColour, userInitials, name) {
  return /*html*/ `
    <div class="task__assignments__user-dates">
        <div class="task__assignments-circle" style="background-color:${imgColour}">
            ${userInitials}
        </div>
        <div class="assigned-user-name">${name}</div>
    </div>
  `;
}


/**
 * Generates an SVG avatar for an assigned user.
 * @param {Object} user - User object.
 * @param {string} user.name - Full name.
 * @param {string} user.profilImgColor - Background color.
 * @returns {string} SVG avatar markup.
 */
function getAssignedUserSvgTpl(user) {
  const initials = getUserNameInitials(user.name || "");
  const color = user.profilImgColor;

  return /*html*/ `
    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <circle cx="21" cy="21" r="20" fill="${color}" stroke="white" stroke-width="2" />
      <text x="21" y="23" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="white">${initials}</text>
    </svg>
  `;
}


/**
 * Generates a "no users assigned" message element.
 * @returns {string} HTML markup.
 */
function getNoUsersAssignedTpl() {
  return /*html*/ `
    <div class="dlg__user-box">
      <span>No users assigned</span>
    </div>`;
}


/**
 * Generates the complete assignment list for the task edit dialog.
 * @param {string[]} contacts - List of user IDs.
 * @returns {string} HTML markup of assigned user elements.
 */
function getAssignedUsersListTpl(contacts) {
  return /*html*/ `
    <div id="assigned-user-list">
      ${contacts.map(renderAssignedUserItem).join("")}
    </div>
  `;
}


/**
 * Generates a small avatar bubble for the task edit dialog.
 * @param {Object} user - User object.
 * @returns {string} HTML markup.
 */
function userAvatarTemplate(user) {
  return /*html*/ `
    <div class="dlg-edit__user-box" title="${user.name}">
      ${getUserAvatarSvg(user)}
    </div>`;
}


/**
 * Generates a compact "+X users" bubble for overflowing avatar lists.
 * @param {number} more - Number of additional users.
 * @returns {string} HTML markup.
 */
function moreUsersTemplate(more) {
  return /*html*/ `
    <div class="dlg-edit__user-box" title="+${more} Users">
      ${getMoreUsersSvg(more)}
    </div>`;
}


/**
 * Generates a placeholder text when no users are assigned.
 * @returns {string} HTML markup.
 */
function noUsersTemplate() {
  return /*html*/ `
    <p class="no-users">No user assigned</p>
  `;
}
