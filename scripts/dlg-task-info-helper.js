// ======================================================
// 🔹 DIALOG TASK INFO HELPER - Templates & Funktions
// ======================================================
// Provides helper functions for rendering task details,
// subtasks, assigned users, and interactive checkbox logic.
// ======================================================

let subtaskActionLock = false;

// ======================================================
// 🔹 USER HELPER FUNCTIONS
// ======================================================

/**
 * Returns the initials (e.g., "AB") of a user based on their user ID.
 * Looks up the user in the global `users` array.
 * @param {string} userId - The unique ID of the user.
 * @returns {string} The uppercase initials of the user, or "?" if not found.
 */
function getUserInitialsById(userId) {
  const user = users?.find(u => u.id === userId);
  if (!user || !user.name) return "?";

  return user.name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("");
}


// ======================================================
// 🔹 PRIORITY HANDLING
// ======================================================

/**
 * Returns the correct priority icon based on task priority.
 * @param {"urgent"|"medium"|"low"} priority - The priority level.
 * @returns {string} Path to the corresponding priority image.
 */
function getPriorityImg(priority) {
  switch (priority) {
    case "urgent":
      return "../assets/img/task-priority-urgent.svg";
    case "medium":
      return "../assets/img/task-priority-medium.svg";
    case "low":
      return "../assets/img/task-priority-low.svg";
    default:
      return "";
  }
}


// ======================================================
// 🔹 ASSIGNED USERS RENDERING
// ======================================================

/**
 * Renders assigned users as HTML list.
 * @param {string[]} [contacts=[]] - Array of user IDs.
 * @returns {string} HTML markup for assigned users list.
 */
function renderAssignedUsers(contacts = []) {
  const validContacts = normalizeContactList(contacts);
  if (validContacts.length === 0) return getNoUsersAssignedTpl();
  return getAssignedUsersListTpl(validContacts);
}


/**
 * Normalizes input contacts into a valid array.
 * @param {string[]|null|undefined} contacts - Contact list input.
 * @returns {string[]} Filtered contact ID array.
 */
function normalizeContactList(contacts) {
  if (!Array.isArray(contacts)) return [];
  return contacts.filter(id => id && id.trim() !== "");
}


/**
 * Returns HTML template for "no users assigned" message.
 * @returns {string} HTML markup.
 */
function getNoUsersAssignedTpl() {
  return /*html*/ `<div class="dlg__user-box"><span>No users assigned</span></div>`;
}


/**
 * Returns full HTML markup for a list of assigned users.
 * @param {string[]} contacts - Array of user IDs.
 * @returns {string} HTML markup of assigned users.
 */
function getAssignedUsersListTpl(contacts) {
  return /*html*/ `
    <div id="assigned-user-list">
      ${contacts.map(renderAssignedUserItem).join("")}
    </div>
  `;
}


/**
 * Returns HTML for a single assigned user.
 * @param {string} id - The user ID.
 * @returns {string} HTML markup for a single assigned user item.
 */
function renderAssignedUserItem(id) {
  const userName = getUserNameById(id);
  const name = addTagToLoggedInUser(userName);
  const imgColour = getUserPicById(id);
  const userInitials = getUserInitialsById(id);
  return /*html*/ `
    <div class="task__assignments__user-dates">
      <div class="task__assignments-circle" style="background-color:${imgColour}">
        ${userInitials}
      </div>
      <div class="assigned-user-name">${name}</div>
    </div>
  `;
}


// ======================================================
// 🔹 SUBTASK RENDERING
// ======================================================

/**
 * Returns checkbox image source depending on checked state.
 * @param {boolean} isChecked - Whether checkbox is checked.
 * @returns {string} Path to checkbox image.
 */
function getCheckboxImgSrc(isChecked) {
  return `../assets/img/${isChecked ? "checkbox-checked.svg" : "checkbox-unchecked.svg"}`;
}


/**
 * Renders the list of subtasks for a given task.
 * @param {Object} [subtasks={}] - Subtasks object.
 * @param {string} taskId - Parent task ID.
 * @returns {string} HTML markup for subtasks list.
 */
function renderSubtasks(subtasks = {}, taskId) {
  if (!isValidSubtaskData(subtasks))
    return /*html*/ `<span class="dlg__main__task-subtask no-subtasks">No subtasks</span>`;

  const sorted = sortSubtasks(subtasks);
  return sorted.map(([key, st]) => renderSubtaskItem(key, st, taskId)).join("");
}


/**
 * Checks whether subtasks data is valid.
 * @param {Object} subtasks - Subtasks object.
 * @returns {boolean} True if valid, false otherwise.
 */
function isValidSubtaskData(subtasks) {
  return subtasks && typeof subtasks === "object" && Object.keys(subtasks).length > 0;
}


/**
 * Sorts subtasks by their numeric key index.
 * @param {Object} subtasks - Subtasks object.
 * @returns {[string, Object][]} Sorted subtasks as entries.
 */
function sortSubtasks(subtasks) {
  return Object.entries(subtasks).sort(([a], [b]) => {
    const na = parseInt(a.replace("subtask", ""), 10);
    const nb = parseInt(b.replace("subtask", ""), 10);
    return (isNaN(na) || isNaN(nb)) ? 0 : na - nb;
  });
}


/**
 * Renders a single subtask row.
 * @param {string} key - Subtask key.
 * @param {Object} st - Subtask data.
 * @param {string} taskId - Parent task ID.
 * @returns {string} HTML markup for a subtask.
 */
function renderSubtaskItem(key, st, taskId) {
  if (!st?.task) return "";
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
}


// ======================================================
// 🔹 SUBTASK INTERACTION HANDLERS
// ======================================================

/**
 * Handles subtask row click for toggling checked state.
 * @param {MouseEvent} event - Mouse event object.
 * @param {string} taskId - Parent task ID.
 * @param {string} subtaskKey - Subtask key.
 * @param {HTMLElement} rowEl - Subtask row element.
 */
function onSubtaskRowMouseDown(event, taskId, subtaskKey, rowEl) {
  if (event.target.closest(".deletebox-wrapper")) return;
  if (subtaskActionLock) return temporarilyLockSubtaskActions();
  event.preventDefault();
  event.stopPropagation();
  toggleSubtaskChecked(taskId, subtaskKey, rowEl);
}


/**
 * Handles delete button click for a subtask.
 * @param {MouseEvent} event - Mouse event object.
 * @param {string} taskId - Parent task ID.
 * @param {string} subtaskKey - Subtask key.
 * @param {HTMLElement} btnEl - Delete button element.
 */
function onDeleteSubtaskMouseDown(event, taskId, subtaskKey, btnEl) {
  if (subtaskActionLock) return temporarilyLockSubtaskActions();
  event.preventDefault();
  event.stopPropagation();
  const row = btnEl.closest(".dlg__main__task-subtask");
  deleteSubtask(taskId, subtaskKey, row);
}


/**
 * Temporarily locks subtask actions to prevent double-triggering.
 */
function temporarilyLockSubtaskActions() {
  subtaskActionLock = true;
  setTimeout(() => (subtaskActionLock = false), 200);
}


// ======================================================
// 🔹 SUBTASK CHECK STATE TOGGLING
// ======================================================

/**
 * Toggles the checked state of a subtask and updates Firebase.
 * @async
 * @param {string} taskId - Parent task ID.
 * @param {string} subtaskKey - Subtask key.
 * @param {HTMLElement} rowEl - Subtask row element.
 */
async function toggleSubtaskChecked(taskId, subtaskKey, rowEl) {
  const imgEl = rowEl.querySelector("img.checkbox");
  if (!imgEl) return;

  const willBeChecked = !(imgEl.dataset.checked === "true");
  updateCheckboxUI(imgEl, willBeChecked);

  const taskObj = tasks.find(t => t.id === taskId);
  const text = taskObj?.subtasks?.[subtaskKey]?.task || rowEl.querySelector(".subtask-text")?.textContent?.trim() || "";

  await updateSubtaskInFirebase(taskId, subtaskKey, text, willBeChecked);
  await refreshTaskInfo(taskId);
}


/**
 * Updates checkbox visual state in the UI.
 * @param {HTMLImageElement} imgEl - Checkbox image element.
 * @param {boolean} checked - Whether checkbox is checked.
 */
function updateCheckboxUI(imgEl, checked) {
  imgEl.dataset.checked = String(checked);
  imgEl.src = getCheckboxImgSrc(checked);
}


/**
 * Sends updated subtask state to Firebase.
 * @async
 * @param {string} taskId - Task ID.
 * @param {string} subtaskKey - Subtask key.
 * @param {string} text - Subtask text.
 * @param {boolean} checked - Whether subtask is checked.
 */
async function updateSubtaskInFirebase(taskId, subtaskKey, text, checked) {
  const url = `https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${taskId}/subtasks/${subtaskKey}.json`;
  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task: text, taskChecked: checked })
  });
}


/**
 * Reloads data and re-renders the task info dialog.
 * @async
 * @param {string} taskId - Task ID to refresh.
 */
async function refreshTaskInfo(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}


function setFooterOptionsDisabled(disabled) {
  const optionsBox = document.querySelector('.dlg__footer__options-box');
  if (!optionsBox) return;

  optionsBox.classList.toggle('dlg__footer__options-box--disabled', disabled);
}