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
  const user = users?.find(user => user.id === userId);
  if (!user || !user.name) return "?";

  return user.name
    .split(" ")
    .filter(Boolean)
    .map(n => n[0].toUpperCase())
    .join("");
}


/**
 * Renders one assigned user item including avatar and name.
 * @param {string} id - User ID.
 * @returns {string} HTML snippet for the assigned user row.
 */
function renderAssignedUserItem(id) {
  const userName = getUserNameById(id);
  const name = addTagToLoggedInUser(userName);
  const imgColour = getUserPicById(id);
  const userInitials = getUserInitialsById(id);

  return assignedUserItemTemplate(imgColour, userInitials, name);
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
 * Normalizes input contacts into a valid array of IDs.
 * @param {string[]|null|undefined} contacts - Contact list input.
 * @returns {string[]} Filtered contact ID array.
 */
function normalizeContactList(contacts) {
  if (!Array.isArray(contacts)) return [];
  return contacts.filter(id => id && id.trim() !== "");
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
    return /*html*/ `<span class="dlg__main__task-subtask no-subtasks">• No subtasks</span>`;

  const sorted = sortSubtasks(subtasks);
  return sorted.map(([key, subtask]) => renderSubtaskItem(key, subtask, taskId)).join("");
}


/**
 * Checks whether subtasks data is valid.
 * @param {Object} subtask - Subtasks object.
 * @returns {boolean} True if valid subtasks exist.
 */
function isValidSubtaskData(subtask) {
  return subtask && typeof subtask === "object" && Object.keys(subtask).length > 0;
}


/**
 * Sorts subtasks by numeric index (subtask0, subtask1, ...).
 * @param {Object} subtask - Subtasks object.
 * @returns {[string, Object][]} Sorted subtasks as entries.
 */
function sortSubtasks(subtask) {
  return Object.entries(subtask).sort(([a], [b]) => {
    const na = parseInt(a.replace("subtask", ""), 10);
    const nb = parseInt(b.replace("subtask", ""), 10);
    return (isNaN(na) || isNaN(nb)) ? 0 : na - nb;
  });
}


/**
 * Renders one subtask item row.
 * @param {string} key - Subtask key.
 * @param {Object} subtask - Subtask object.
 * @param {string} taskId - Parent task ID.
 * @returns {string} HTML for this subtask row.
 */
function renderSubtaskItem(key, subtask, taskId) {
  if (!subtask?.task) return "";

  const checked = !!subtask.taskChecked;
  const text = subtask.task;

  return subtaskItemTemplate(key, taskId, checked, text);
}


// ======================================================
// 🔹 SUBTASK INTERACTION HANDLERS
// ======================================================

/**
 * Handles subtask row click for toggling checked state.
 * @param {MouseEvent} event - Mouse event.
 * @param {string} taskId - Parent task ID.
 * @param {string} subtaskKey - Subtask key.
 * @param {HTMLElement} rowEl - The clicked row element.
 */
function onSubtaskRowMouseDown(event, taskId, subtaskKey, rowEl) {
  if (event.button !== 0) return;
  if (event.target.closest(".deletebox-wrapper")) return;
  if (subtaskActionLock) return temporarilyLockSubtaskActions();

  event.preventDefault();
  event.stopPropagation();
  toggleSubtaskChecked(taskId, subtaskKey, rowEl);
}


/**
 * Temporarily locks subtask interactions to avoid double clicks.
 * @returns {void}
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
 * @param {HTMLElement} rowEl - Subtask element.
 */
async function toggleSubtaskChecked(taskId, subtaskKey, rowEl) {
  const imgEl = rowEl.querySelector("img.checkbox");
  if (!imgEl) return;

  const willBeChecked = !(imgEl.dataset.checked === "true");
  updateCheckboxUI(imgEl, willBeChecked);

  const taskObj = tasks.find(t => t.id === taskId);
  const text =
    taskObj?.subtasks?.[subtaskKey]?.task ||
    rowEl.querySelector(".subtask-text")?.textContent?.trim() ||
    "";

  await updateSubtaskInFirebase(taskId, subtaskKey, text, willBeChecked);
  await refreshTaskInfo(taskId);
}


/**
 * Updates checkbox image & dataset in UI.
 * @param {HTMLImageElement} imgEl - Checkbox image element.
 * @param {boolean} checked - New state.
 */
function updateCheckboxUI(imgEl, checked) {
  imgEl.dataset.checked = String(checked);
  imgEl.src = getCheckboxImgSrc(checked);
}


/**
 * Sends updated subtask data to Firebase.
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
 * Reloads Firebase data and rerenders the task info dialog.
 * @async
 * @param {string} taskId - Task ID.
 */
async function refreshTaskInfo(taskId) {
  await getData();
  loadTasks();
  updateAllPlaceholders?.();
  renderTaskInfoDlg(taskId);
}


// ======================================================
// 🔹 FOOTER OPTIONS + DELETE DIALOGS
// ======================================================

/**
 * Enables or disables footer option buttons.
 * @param {boolean} disabled - Whether to disable the buttons.
 */
function setFooterOptionsDisabled(disabled) {
  const optionsBox = document.querySelector(".dlg__footer__options-box");
  if (!optionsBox) return;

  optionsBox.classList.toggle("dlg__footer__options-box--disabled", disabled);
}


/**
 * Shows confirmation dialog for deleting a task.
 * @param {string} taskId - Task ID to delete.
 */
function showDeleteTaskConfirm(taskId) {
  const dlg = document.getElementById("dlg-confirm");
  const overlay = document.getElementById("overlay-confirm");

  dlg.innerHTML = getDeleteTaskDlgTpl(taskId);

  overlay.classList.remove("d-none");
  dlg.classList.remove("d-none");

  overlay.addEventListener("click", hideConfirmDlg, { once: true });
  setTimeout(() => dlg.classList.add("show"), 10);
}


/**
 * Shows confirmation dialog for deleting a subtask.
 * @param {string} taskId - Parent task ID.
 * @param {string} subtaskKey - Subtask key to delete.
 */
function showDeleteSubtaskConfirm(taskId, subtaskKey) {
  const dlg = document.getElementById("dlg-confirm");
  const overlay = document.getElementById("overlay-confirm");

  dlg.innerHTML = getDeleteSubtaskDlgTpl(taskId, subtaskKey);

  overlay.classList.remove("d-none");
  dlg.classList.remove("d-none");

  overlay.addEventListener("click", hideConfirmDlg, { once: true });
  setTimeout(() => dlg.classList.add("show"), 10);
}


/**
 * Hides the active delete confirmation dialog with fade-out animation.
 */
function hideConfirmDlg() {
  const dlg = document.getElementById("dlg-confirm");
  const overlay = document.getElementById("overlay-confirm");

  dlg.classList.remove("show");

  setTimeout(() => {
    dlg.classList.add("d-none");
    overlay.classList.add("d-none");
  }, 300);
}