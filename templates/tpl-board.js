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
// 🔹 POPUP MESSAGE TEMPLATE
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
