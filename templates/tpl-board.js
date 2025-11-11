// ======================================================
// 🔹 BOARD TEMPLATES
// ======================================================
// Contains HTML template generators for the board UI.
// Includes placeholders, header layouts, sorting dropdowns,
// and success popup messages.
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
// 🔹 BOARD HEADER (DESKTOP)
// ======================================================

/**
 * Generates HTML markup for the desktop version of the board header.
 * Includes:
 * - Board title
 * - Search input with search icon
 * - Sort dropdown for task ordering
 * - Add-task button
 * - Search mode indicator
 * @returns {string} HTML markup for the desktop board header.
 */
function getBoardHeadDesktop() {
  return /*html*/ `
    <h1>Board</h1>
    <div class="task-search-and-add">
      <div id="search-mode-indicator" class="search-mode-indicator d-none">
        🔍 Read Only <br> (Drag & Drop disabled)
      </div>
      <div class="board__head__searchbox">
        <input id="search-tasks" type="search" placeholder="Find Task">
        <img class="search-btn" src="../assets/img/search.svg" alt="Search icon">
      </div>

      <select id="task-sort-select" class="board__sort-select">
        <option value="default">Sort by: Default</option>
        <option value="dueDate">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title (A–Z)</option>
      </select>
      
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
 * Generates HTML markup for the mobile version of the board header.
 * Includes:
 * - Compact layout for smaller screens
 * - Board title and floating add-task button
 * - Search input with search icon
 * - Sort dropdown for task ordering
 * - Search mode indicator
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

    <div id="search-mode-indicator" class="search-mode-indicator d-none">
      🔍 Read Only <br> (Drag & Drop disabled)
    </div>

    <div class="board__head__searchbox">
      <input id="search-tasks" type="search" placeholder="Find Task">
      <img class="search-btn" src="../assets/img/search.svg" alt="Search icon">
    </div>

    <select id="task-sort-select" class="board__sort-select">
      <option value="default">Sort by: Default</option>
      <option value="dueDate">Due Date</option>
      <option value="priority">Priority</option>
      <option value="title">Title (A–Z)</option>
    </select>
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
