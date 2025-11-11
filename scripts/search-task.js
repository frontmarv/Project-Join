
const HIGHLIGHT_CLASS = "search-highlight";

function initSearch() {
  const input = document.getElementById("search-tasks");
  if (!input) return;
  input.addEventListener("input", () => filterTasks(input.value));
  input.addEventListener("keydown", clearSearchOnEsc);
  patchLoadTasks();
}


function clearSearchOnEsc(event) {
  if (event.key !== "Escape") return;
  event.target.value = "";
  filterTasks("");
}


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


function filterTasks(query) {
  const clean = query.trim().toLowerCase();
  const allCards = document.querySelectorAll(".task");
  allCards.forEach(card => processCardFilter(card, clean));
  updateSearchPlaceholders(clean);
  updateTaskCursorState();
  updateSearchModeIndicator();
}


function processCardFilter(card, query) {
  const title = card.querySelector(".task__title");
  const description = card.querySelector(".task__description");
  if (!title) return;

  resetHighlight(title);
  if (description) resetHighlight(description);

  if (query.length < 2) {
    card.style.display = "";
    return;
  }

  const titleText = title.dataset.rawText.toLowerCase();
  const descText = description ? description.dataset.rawText.toLowerCase() : "";

  const hasMatch = titleText.includes(query) || descText.includes(query);
  card.style.display = hasMatch ? "" : "none";
  if (!hasMatch) return;

  if (titleText.includes(query)) {
    highlightText(title, query);
  }
  if (description && descText.includes(query)) {
    highlightText(description, query);
  }
}

function resetHighlight(element) {
  element.dataset.rawText ??= element.textContent;
  element.textContent = element.dataset.rawText;
}

function highlightText(element, query) {
  const origText = element.dataset.rawText;
  const expression = new RegExp(`(${escapeRegExp(query)})`, "gi");
  element.innerHTML = origText.replace(expression, `<span class="${HIGHLIGHT_CLASS}">$1</span>`);
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function updateSearchPlaceholders(query) {
  Object.values(columnMap).forEach(columnId => {
    const column = document.getElementById(columnId);
    const tasks = column.querySelectorAll('.task');
    const visibleTasks = Array.from(tasks).filter(task => task.style.display !== 'none');
    const existingPlaceholder = column.querySelector('.no-tasks-placeholder');

    if (query.length < 2) {
      if (existingPlaceholder) existingPlaceholder.remove();
      if (tasks.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.innerHTML = getPlaceholderTpl();
        column.appendChild(placeholder.firstElementChild);
      }
      return;
    }

    if (visibleTasks.length === 0) {
      if (!existingPlaceholder) {
        const placeholder = document.createElement('div');
        placeholder.innerHTML = getSearchPlaceholderTpl();
        column.appendChild(placeholder.firstElementChild);
      }
    } else {
      if (existingPlaceholder) existingPlaceholder.remove();
    }
  });
}

function updateTaskCursorState() {
  const searchInput = document.getElementById("search-tasks");
  const inSearchMode = searchInput && searchInput.value.trim().length > 0;
  const tasks = document.querySelectorAll(".task");

  tasks.forEach(task => {
    task.style.cursor = inSearchMode ? "pointer" : "grab";
  });
}

function updateSearchModeIndicator() {
  const searchInput = document.getElementById("search-tasks");
  const indicator = document.getElementById("search-mode-indicator");
  if (!indicator) return;

  const inSearchMode = searchInput && searchInput.value.trim().length > 0;
  indicator.classList.toggle("show", inSearchMode);
  indicator.classList.toggle("d-none", !inSearchMode);
}