// ======================================================
// 🔹 HELPER-FUNKTIONEN (ALLGEMEIN)
// ======================================================

/**
 * Gibt benachbarte Task-Kategorien zurück (für Navigation).
 * @param {object} task - Task-Objekt.
 * @returns {{previousTask: string, nextTask: string}}
 */
function getSurroundingCategories(task) {
  const state = task.taskState;
  const keys = Object.keys(columnMap);
  const index = keys.indexOf(state);
  const prevKey = keys[index - 1];
  const nextKey = keys[index + 1];
  const previousTask = prevKey ? capitalize(prevKey) : "Done";
  const nextTask = nextKey ? capitalize(nextKey) : "To-do";
  return { previousTask, nextTask };
}

/**
 * Wandelt den ersten Buchstaben eines Strings in einen Großbuchstaben um.
 * @param {string} text - Eingabetext.
 * @returns {string} Kapitalisierter Text.
 */
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/**
 * Prüft Eingabefelder und weist entsprechende CSS-Klassen zu.
 * @param {HTMLInputElement} inputElement - Eingabefeld.
 */
function syncValidityClass(inputElement) {
  if (!inputElement) return;
  if (inputElement.value && inputElement.value.trim() !== '') {
    inputElement.classList.add('valid-input');
    inputElement.classList.remove('invalid-input', 'input-error');
  } else {
    inputElement.classList.add('input-error');
    inputElement.classList.remove('valid-input');
  }
}

/**
 * Initialisiert Delegation für Datumseingabe-Validierung.
 * @param {HTMLElement} scope - Container-Element (z. B. Dialog).
 */
function initDueDateValidationDelegated(scope) {
  if (!scope || scope.dataset.ddBound === 'true') return;
  scope.dataset.ddBound = 'true';
  const date = scope.querySelector('#due-date');
  if (date) syncValidityClass(date);
  scope.addEventListener('input', onDueDateEvent, true);
  scope.addEventListener('change', onDueDateEvent, true);
  scope.addEventListener('blur', onDueDateEvent, true);
}

/**
 * Event-Handler für Datumseingabe-Validierung.
 * @param {Event} event - Eingabeereignis.
 */
function onDueDateEvent(event) {
  if (!event.target.matches('#due-date')) return;
  syncValidityClass(event.target);
}

/**
 * Speichert Scrollpositionen ausgewählter Elemente.
 * @param {string[]} selectors - Array mit CSS-Selektoren.
 * @returns {Object<string, number>} Gespeicherte Scrollwerte.
 */
function saveScrollPositions(selectors) {
  const savedScroll = {};
  selectors.forEach(select => {
    const element = document.querySelector(select);
    if (element) savedScroll[select] = element.scrollTop;
  });
  return savedScroll;
}

/**
 * Stellt Scrollpositionen wieder her und scrollt ggf. zu Subtask.
 * @param {Object<string, number>} savedScroll - Gespeicherte Scrollwerte.
 */
function restoreScrollPositions(savedScroll) {
  requestAnimationFrame(() => {
    Object.entries(savedScroll).forEach(([sel, top]) => {
      const element = document.querySelector(sel);
      if (element) element.scrollTop = top;
    });
    scrollToLastToggledSubtask();
  });
}

/** Scrollt zum zuletzt umgeschalteten Subtask, falls vorhanden. */
function scrollToLastToggledSubtask() {
  if (!window.__lastToggledSubtaskId) return;
  const target = document.querySelector(
    `[data-subtask-id="${window.__lastToggledSubtaskId}"]`
  );
  if (target) target.scrollIntoView({ block: 'nearest' });
}
