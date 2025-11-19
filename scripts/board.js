// ======================================================
// 🔹 CORE: KONSTANTEN & BOARD-INITIALISIERUNG
// ======================================================

/**
 * Maps internal task states to their corresponding column IDs in the DOM.
 * Used to determine where each task should be rendered on the board.
 *
 * @type {Record<string, string>}
 */
const columnMap = {
  'to-do': 'to-do-tasks',
  'in-progress': 'in-progress-tasks',
  'await-feedback': 'await-feedback-tasks',
  'done': 'done-tasks',
};


/**
 * Initializes the Kanban board.
 * Loads task data, sets up drag & drop, initializes search, sorting,
 * overdue detection, and event listeners for responsive layout.
 *
 * @async
 * @returns {Promise<void>}
 */
async function initBoard() {
  await getData();
  loadTasks();
  initDragAndDrop();
  markOverdueDates();
  updateAllPlaceholders();
  initSearch();
  enableSearchBoxClickFocus();
  initCustomSortSelect();
}
