const HIGHLIGHT_CLASS = "search-highlight";

/** ---------------- Init ---------------- */

function initSearch() {
  const input = document.getElementById("search-tasks");
  if (!input) return;
  addSearchEventListeners(input);
  patchLoadTasks();
}

function addSearchEventListeners(input) {
  input.addEventListener("input", () => filterTasks(input.value));
  input.addEventListener("keydown", clearSearchOnEsc);
}

/** ---------------- Escape Key ---------------- */

function clearSearchOnEsc(event) {
  if (event.key !== "Escape") return;
  event.target.value = "";
  filterTasks("");
}

/** ---------------- Patch loadTasks ---------------- */

function patchLoadTasks() {
  if (loadTasks.__patched) return;
  const original = loadTasks;
  loadTasks = function () {
    original.apply(this, arguments);
    applySearchAfterLoad();
  };
  loadTasks.__patched = true;
}

function applySearchAfterLoad() {
  const value = document.getElementById("search-tasks")?.value || "";
  filterTasks(value);
}

/** ---------------- Filtering ---------------- */

function filterTasks(query) {
  const clean = query.trim().toLowerCase();
  document.querySelectorAll(".task").forEach(card => processCardFilter(card, clean));
  updateSearchPlaceholders(clean);
}

function processCardFilter(card, query) {
  const title = card.querySelector(".task__title");
  const description = card.querySelector(".task__description");
  if (!title) return;

  resetHighlight(title);
  if (description) resetHighlight(description);

  if (query.length < 2) return resetCardVisibility(card);

  const { titleText, descText } = getTaskTextContent(title, description);
  const hasMatch = titleText.includes(query) || descText.includes(query);
  setCardVisibility(card, hasMatch);
  if (hasMatch) applyHighlights(title, description, query, titleText, descText);
}

function getTaskTextContent(title, description) {
  const titleText = title.dataset.rawText.toLowerCase();
  const descText = description ? description.dataset.rawText.toLowerCase() : "";
  return { titleText, descText };
}

function resetCardVisibility(card) {
  card.style.display = "";
}

function setCardVisibility(card, hasMatch) {
  card.style.display = hasMatch ? "" : "none";
}

/** ---------------- Highlighting ---------------- */

function applyHighlights(title, description, query, titleText, descText) {
  if (titleText.includes(query)) highlightText(title, query);
  if (description && descText.includes(query)) highlightText(description, query);
}

function resetHighlight(element) {
  element.dataset.rawText ??= element.textContent;
  element.textContent = element.dataset.rawText;
}

function highlightText(element, query) {
  const origText = element.dataset.rawText;
  const expression = new RegExp(`(${escapeRegExp(query)})`, "gi");
  element.innerHTML = origText.replace(
    expression,
    `<span class="${HIGHLIGHT_CLASS}">$1</span>`
  );
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** ---------------- Placeholders ---------------- */

function updateSearchPlaceholders(query) {
  Object.values(columnMap).forEach(columnId => {
    const column = document.getElementById(columnId);
    updateColumnPlaceholderState(column, query);
  });
}

function updateColumnPlaceholderState(column, query) {
  const tasks = column.querySelectorAll(".task");
  const visibleTasks = [...tasks].filter(task => task.style.display !== "none");
  const existingPlaceholder = column.querySelector(".no-tasks-placeholder");

  if (query.length < 2) {
    resetDefaultPlaceholder(column, tasks, existingPlaceholder);
  } else {
    updateSearchPlaceholder(column, visibleTasks, existingPlaceholder);
  }
}

function resetDefaultPlaceholder(column, tasks, existingPlaceholder) {
  if (existingPlaceholder) existingPlaceholder.remove();
  if (tasks.length === 0) appendPlaceholder(column, getPlaceholderTpl());
}

function updateSearchPlaceholder(column, visibleTasks, existingPlaceholder) {
  if (visibleTasks.length === 0 && !existingPlaceholder)
    appendPlaceholder(column, getSearchPlaceholderTpl());
  else if (visibleTasks.length > 0 && existingPlaceholder)
    existingPlaceholder.remove();
}

function appendPlaceholder(column, tplFn) {
  const placeholder = document.createElement("div");
  placeholder.innerHTML = tplFn();
  column.appendChild(placeholder.firstElementChild);
}
