
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
  document.querySelectorAll(".task").forEach((card) =>
    processCardFilter(card, clean)
  );
  toggleTasksAutoHeight(clean.length >= 2);
}


function processCardFilter(card, query) {
  const title = card.querySelector(".task__title");
  if (!title) return;
  resetHighlight(title);
  if (query.length < 2) return (card.style.display = "");
  const hasMatch = title.dataset.rawText.toLowerCase().includes(query);
  card.style.display = hasMatch ? "" : "none";
  if (hasMatch) highlightTitle(title, query);
}


function resetHighlight(titleElement) {
  if (!titleElement.dataset.rawText) titleElement.dataset.rawText = titleElement.textContent;
  titleElement.textContent = titleElement.dataset.rawText;
}


function highlightTitle(titleElement, query) {
  const raw = titleElement.dataset.rawText;
  const re = new RegExp(`(${escapeRegExp(query)})`, "gi");
  titleElement.innerHTML = raw.replace(re, `<span class="${HIGHLIGHT_CLASS}">$1</span>`);
}


function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
