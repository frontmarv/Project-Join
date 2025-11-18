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
 * Generates HTML for the placeholder displayed in a board column
 * when there are no active tasks available.
 * @returns {string} HTML markup for the "No active tasks" placeholder.
 */
function getPlaceholderTpl() {
  return /*html*/ `
    <div class="no-tasks-placeholder">No active tasks</div>
  `;
}


/**
 * Generates HTML for the placeholder displayed during a search
 * when no matching tasks are found.
 * @returns {string} HTML markup for the "No results" placeholder.
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
 * Generates HTML markup for the success popup message.
 * Appears briefly after a successful save operation (e.g., task changes saved).
 * @returns {string} HTML markup for the success confirmation popup.
 */
function getPopupMsgChangesSavedTpl() {
  return /*html*/ `
    <div class="popup-msg-container">
      <span>Changes successfully saved</span>
    </div>
  `;
}

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


