// ======================================================
// 🔹 SEARCH TASKS
// ======================================================
// Provides live task filtering and highlighting within
// the board based on user search input.
// ======================================================

const HIGHLIGHT_CLASS = "search-highlight";


// ======================================================
// 🔹 INITIALIZATION
// ======================================================

/**
 * Initializes the search input for task filtering.
 */
function initSearch() {
  const input = document.getElementById("search-tasks");
  if (!input) return;
  input.addEventListener("input", () => filterTasks(input.value));
  input.addEventListener("keydown", clearSearchOnEsc);
  patchLoadTasks();
}


/**
 * Clears search input when Escape key is pressed.
 * @param {KeyboardEvent} event - Key event.
 */
function clearSearchOnEsc(event) {
  if (event.key !== "Escape") return;
  event.target.value = "";
  filterTasks("");
}


/**
 * Ensures that loadTasks() triggers search filter when reloading.
 */
function patchLoadTasks() {
  if (loadTasks.__patched) return;
  const original = loadTasks;
  loadTasks = function () {
    original.apply(this, arguments);
    const value = document.getElementById("search-tasks")?.value || "";
    filterTasks(value);
  };
  loadTasks.__patched = true;
}


// ======================================================
// 🔹 CORE FILTERING LOGIC
// ======================================================

/**
 * Filters visible tasks and highlights matches.
 * @param {string} query - The search term entered by the user.
 */
function filterTasks(query) {
  const clean = query.trim().toLowerCase();
  const allCards = document.querySelectorAll(".task");
  allCards.forEach(card => processCardFilter(card, clean));
  updateSearchPlaceholders(clean);
  updateTaskCursorState();
  updateSearchModeIndicator();
}


/**
 * Processes individual task card filtering and highlighting.
 * @param {HTMLElement} card - Task card element.
 * @param {string} query - The cleaned search query.
 */
function processCardFilter(card, query) {
  const title = card.querySelector(".task__title");
  const description = card.querySelector(".task__description");
  if (!title) return;

  resetHighlight(title);
  if (description) resetHighlight(description);

  if (query.length < 2) return resetCardVisibility(card);

  const hasMatch = checkCardMatch(card, title, description, query);
  card.style.display = hasMatch ? "" : "none";
  if (hasMatch) applyHighlights(title, description, query);
}


/**
 * Resets task visibility for unfiltered state.
 * @param {HTMLElement} card - Task card element.
 */
function resetCardVisibility(card) {
  card.style.display = "";
}


/**
 * Checks if the task title or description matches the query.
 * @param {HTMLElement} card - Task card element.
 * @param {HTMLElement} title - Title element.
 * @param {HTMLElement|null} description - Description element.
 * @param {string} query - Search term.
 * @returns {boolean} True if a match is found.
 */
function checkCardMatch(card, title, description, query) {
  const titleText = title.dataset.rawText.toLowerCase();
  const descText = description ? description.dataset.rawText.toLowerCase() : "";
  return titleText.includes(query) || descText.includes(query);
}


/**
 * Highlights matching text in title and description.
 * @param {HTMLElement} title - Title element.
 * @param {HTMLElement|null} description - Description element.
 * @param {string} query - Search term.
 */
function applyHighlights(title, description, query) {
  const titleText = title.dataset.rawText.toLowerCase();
  const descText = description ? description.dataset.rawText.toLowerCase() : "";
  if (titleText.includes(query)) highlightText(title, query);
  if (description && descText.includes(query)) highlightText(description, query);
}


// ======================================================
// 🔹 TEXT HIGHLIGHTING HELPERS
// ======================================================

/**
 * Restores original text content of an element.
 * @param {HTMLElement} element - Element to reset.
 */
function resetHighlight(element) {
  element.dataset.rawText ??= element.textContent;
  element.textContent = element.dataset.rawText;
}


/**
 * Wraps matching text with a highlight span.
 * @param {HTMLElement} element - Text container element.
 * @param {string} query - Search term.
 */
function highlightText(element, query) {
  const origText = element.dataset.rawText;
  const expression = new RegExp(`(${escapeRegExp(query)})`, "gi");
  element.innerHTML = origText.replace(
    expression,
    `<span class="${HIGHLIGHT_CLASS}">$1</span>`
  );
}


/**
 * Escapes special characters for regex-safe string matching.
 * @param {string} str - The input string.
 * @returns {string} Escaped regex string.
 */
function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


// ======================================================
// 🔹 PLACEHOLDER UPDATES
// ======================================================

/**
 * Updates empty-column placeholders during search filtering.
 * @param {string} query - Current search term.
 */
function updateSearchPlaceholders(query) {
  Object.values(columnMap).forEach(columnId => {
    const column = document.getElementById(columnId);
    const tasks = column.querySelectorAll('.task');
    const visibleTasks = Array.from(tasks).filter(task => task.style.display !== 'none');
    const existingPlaceholder = column.querySelector('.no-tasks-placeholder');
    handlePlaceholderDisplay(column, tasks, visibleTasks, existingPlaceholder, query);
  });
}


/**
 * Manages placeholder visibility based on visible tasks and query.
 */
function handlePlaceholderDisplay(column, tasks, visibleTasks, existingPlaceholder, query) {
  if (query.length < 2) return restoreDefaultPlaceholders(column, tasks, existingPlaceholder);
  if (visibleTasks.length === 0) showSearchPlaceholder(column, existingPlaceholder);
  else if (existingPlaceholder) existingPlaceholder.remove();
}


/**
 * Restores normal placeholders when not searching.
 */
function restoreDefaultPlaceholders(column, tasks, existingPlaceholder) {
  if (existingPlaceholder) existingPlaceholder.remove();
  if (tasks.length === 0) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = getPlaceholderTpl();
    column.appendChild(placeholder.firstElementChild);
  }
}


/**
 * Shows "no results" placeholder for filtered search.
 */
function showSearchPlaceholder(column, existingPlaceholder) {
  if (!existingPlaceholder) {
    const placeholder = document.createElement('div');
    placeholder.innerHTML = getSearchPlaceholderTpl();
    column.appendChild(placeholder.firstElementChild);
  }
}


// ======================================================
// 🔹 UI STATE UPDATES
// ======================================================

/**
 * Updates cursor state for tasks when search mode is active.
 */
function updateTaskCursorState() {
  const searchInput = document.getElementById("search-tasks");
  const inSearchMode = searchInput && searchInput.value.trim().length > 0;
  const tasks = document.querySelectorAll(".task");
  tasks.forEach(task => {
    task.style.cursor = inSearchMode ? "pointer" : "grab";
  });
}


/**
 * Toggles the search mode indicator visibility.
 */
function updateSearchModeIndicator() {
  const searchInput = document.getElementById("search-tasks");
  const indicator = document.getElementById("search-mode-indicator");
  if (!indicator) return;

  const inSearchMode = searchInput && searchInput.value.trim().length > 0;
  indicator.classList.toggle("show", inSearchMode);
  indicator.classList.toggle("d-none", !inSearchMode);
}
