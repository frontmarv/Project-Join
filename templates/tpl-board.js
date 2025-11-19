// ======================================================
// 🔹 BOARD TEMPLATES
// ======================================================
// Contains HTML template generators for the board UI.
// Includes placeholders and success popup messages.
// ======================================================


// ======================================================
// 🔹 PLACEHOLDER TEMPLATES
// ======================================================

/**
 * Generates the HTML markup for the column placeholder shown
 * when a board column contains no active tasks.
 * @returns {string} HTML markup for the "No active tasks" placeholder.
 */
function getPlaceholderTpl() {
  return /*html*/ `
    <div class="no-tasks-placeholder">No active tasks</div>
  `;
}


/**
 * Generates the HTML for the placeholder shown when a user performs
 * a search and no matching tasks are found.
 * @returns {string} HTML markup for the "No results" search placeholder.
 */
function getSearchPlaceholderTpl() {
  return /*html*/ `
    <div class="no-tasks-placeholder">No results</div>
  `;
}


// ======================================================
// 🔹 POPUP MESSAGE TEMPLATES
// ======================================================

/**
 * Generates the HTML markup for the success popup message
 * that appears briefly after saving changes (e.g., editing a task).
 * @returns {string} HTML markup for the "changes saved" popup message.
 */
function getPopupMsgChangesSavedTpl() {
  return /*html*/ `
    <div class="popup-msg-container">
      <span>Changes successfully saved</span>
    </div>
  `;
}


/**
 * Generates the HTML template for the "Delete Task" confirmation dialog.
 * @param {string} taskId - ID of the task to be deleted.
 * @returns {string} HTML markup for the delete-task confirmation dialog.
 */
function getDeleteTaskDlgTpl(taskId) {
  return /*html*/ `
    <div class="dlg-confirm-delete">
      <h2>Permanently delete Task?</h2>
      <div class="dlg-confirm-delete__btn-box">
        <button class="empty-btn" onclick="hideConfirmDlg()">
          Cancel<img src="../assets/img/close.svg">
        </button>
        <button class="filled-btn" onclick="deleteTask('${taskId}'); hideConfirmDlg();">
          Delete Task<img src="../assets/img/done.svg">
        </button>
      </div>
    </div>`;
}


/**
 * Generates the HTML template for the "Delete Subtask" confirmation dialog.
 * @param {string} taskId - ID of the parent task.
 * @param {string} subtaskKey - Unique identifier of the subtask to delete.
 * @returns {string} HTML markup for the delete-subtask confirmation dialog.
 */
function getDeleteSubtaskDlgTpl(taskId, subtaskKey) {
  return /*html*/ `
    <div class="dlg-confirm-delete">
      <h2>Permanently delete Subtask?</h2>
      <div class="dlg-confirm-delete__btn-box">
        <button class="empty-btn" onclick="hideConfirmDlg()">
          Cancel<img src="../assets/img/close.svg">
        </button>
        <button class="filled-btn" onclick="deleteSubtask('${taskId}', '${subtaskKey}'); hideConfirmDlg();">
          Delete Subtask<img src="../assets/img/done.svg">
        </button>
      </div>
    </div>`;
}
