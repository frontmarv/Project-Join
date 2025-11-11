// ======================================================
// 🔹 BOARD TEMPLATES
// ======================================================
// Contains HTML template generators for the board UI.
// Includes placeholders, header layouts, and popup messages.
// ======================================================


// ======================================================
// 🔹 PLACEHOLDER TEMPLATES
// ======================================================

/**
 * Returns HTML for a column placeholder when no tasks are active.
 * @returns {string} HTML markup for the "No active tasks" placeholder.
 */
function getPlaceholderTpl() {
  return /*html*/ `
    <div class="no-tasks-placeholder">No active tasks</div>
  `;
}

/**
 * Returns HTML for a placeholder shown when no search results are found.
 * @returns {string} HTML markup for the "No results" placeholder.
 */
function getSearchPlaceholderTpl() {
  return /*html*/ `
    <div class="no-tasks-placeholder">No results</div>
  `;
}


// ======================================================
// 🔹 BOARD HEADER (DESKTOP)
// ======================================================

/**
 * Returns HTML markup for the desktop board header.
 * Includes title, search bar, search indicator, and add-task button.
 * @returns {string} HTML markup for the desktop board header.
 */
function getBoardHeadDesktop() {
  return /*html*/ `
    <h1>Board</h1>
    <div class="task-search-and-add">
      <div class="board__head__searchbox">
        <input id="search-tasks" type="search" placeholder="Find Task">
        <img
          class="search-btn"
          src="../assets/img/search.svg"
          alt="icon of a magnifying glass for search field description">
      </div>
      <div id="search-mode-indicator" class="search-mode-indicator d-none">
        🔍 Read Only <br> (Drag & Drop disabled)
      </div>
      <span id="add-task-btn" class="add-task-btn filled-btn" onclick="renderAddTaskDlg()">
        Add Task
        <img src="../assets/img/add.svg" alt="Add Task Button">
      </span>
    </div>
  `;
}


// ======================================================
// 🔹 BOARD HEADER (MOBILE)
// ======================================================

/**
 * Returns HTML markup for the mobile version of the board header.
 * Includes title, compact add-task button, and search bar.
 * @returns {string} HTML markup for the mobile board header.
 */
function getAddTaskBtnMobile() {
  return /*html*/ `
    <div class="board__head--mobile">
      <h1>Board</h1>
      <span id="add-task-btn" class="add-task-btn filled-btn" onclick="renderAddTaskDlg()">
        <img src="../assets/img/add.svg" alt="Add Task Button">
      </span>
    </div>
    <div class="board__head__searchbox">
      <input id="search-tasks" type="search" placeholder="Find Task">
      <img
        class="search-btn"
        src="../assets/img/search.svg"
        alt="icon of a magnifying glass for search field description">
    </div>
    <div id="search-mode-indicator" class="search-mode-indicator d-none">
      🔍 Read Only <br> (Drag & Drop disabled)
    </div>
  `;
}


// ======================================================
// 🔹 POPUP MESSAGE TEMPLATE
// ======================================================

/**
 * Returns HTML for the popup message that appears after saving changes.
 * @returns {string} HTML markup for the success popup message.
 */
function getPopupMsgChangesSavedTpl() {
  return /*html*/ `
    <div class="popup-msg-container">
      <span>Changes successfully saved</span>
    </div>
  `;
}
