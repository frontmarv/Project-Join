// ======================================================
// 🔹 UI: SEARCHBOX, SORT-SELECT, POPUP
// ======================================================

/**
 * Enables click-to-focus behavior for search boxes in the board header.
 * Allows clicking anywhere inside the search box container to focus the input.
 *
 * @returns {void}
 */
function enableSearchBoxClickFocus() {
  document.addEventListener('click', event => {
    const box = event.target.closest('.board__head__searchbox');
    if (!box) return;
    focusSearchInput(box);
  });
}


/**
 * Focuses and selects text in the search input inside a given search box.
 *
 * @param {HTMLElement} box - The search box container element.
 * @returns {void}
 */
function focusSearchInput(box) {
  const input = box.querySelector('input');
  if (input) {
    input.focus();
    input.select();
  }
}


// ======================================================
// 🔹 POPUP MESSAGE
// ======================================================

/**
 * Duration of the popup show/hide animation in milliseconds.
 *
 * @type {number}
 */
const POPUP_ANIMATION_TIME = 500;

/**
 * Duration in milliseconds that the popup stays fully visible.
 *
 * @type {number}
 */
const POPUP_VISIBLE_TIME   = 1000;

/**
 * Total lifecycle time of the popup (in ms) including
 * show animation, visible time, and hide animation.
 *
 * @type {number}
 */
const POPUP_TOTAL_TIME     = POPUP_ANIMATION_TIME * 2 + POPUP_VISIBLE_TIME;

/**
 * Preloads the "changes saved" popup message markup and injects it into the DOM.
 * If the popup already exists, it will not be created again.
 *
 * @returns {HTMLElement|undefined} The popup container element, if created.
 */
function preloadPopupMsg() {
  if (document.querySelector('.popup-msg-container')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = getPopupMsgChangesSavedTpl();

  const popupEl = wrapper.firstElementChild;
  document.body.appendChild(popupEl);

  // Force reflow so CSS animations can run later
  popupEl.offsetHeight;

  return popupEl;
}


/**
 * Shows the "changes saved" popup with animation and temporarily
 * disables dialog action buttons while the popup is visible.
 *
 * @returns {void}
 */
function showPopupMsgChangesSaved() {
  const popupEl = document.querySelector('.popup-msg-container');
  if (!popupEl) return;

  setDialogActionsDisabled(true);
  requestAnimationFrame(() => popupEl.classList.add('show'));

  setTimeout(() => {
    hidePopupElement(popupEl);
  }, POPUP_ANIMATION_TIME + POPUP_VISIBLE_TIME);

  setTimeout(() => {
    setDialogActionsDisabled(false);
  }, POPUP_TOTAL_TIME);
}


/**
 * Hides and removes the given popup element after its hide animation.
 *
 * @param {HTMLElement} popupEl - Popup element to hide and remove.
 * @returns {void}
 */
function hidePopupElement(popupEl) {
  popupEl.classList.remove('show');
  setTimeout(() => popupEl.remove(), POPUP_ANIMATION_TIME);
}


/**
 * Adds or removes a CSS class on the dialog to indicate that
 * actions are temporarily disabled (e.g., while popup is showing).
 *
 * @param {boolean} disabled - Whether to disable dialog actions.
 * @returns {void}
 */
function setDialogActionsDisabled(disabled) {
  const dlg = document.querySelector('#dlg-box');
  if (dlg) dlg.classList.toggle('dialog-action-area--disabled', disabled);
}


// ======================================================
// 🔹 SORT SELECT (UI BEHAVIOR AROUND currentSortMode)
// ======================================================

/**
 * Initializes the custom sort select dropdown.
 * Binds click handlers for toggling and option selection.
 *
 * @returns {void}
 */
function initCustomSortSelect() {
  const wrapper = document.getElementById("custom-sort-select");
  const display = document.getElementById("sort-selected-text");
  const dropdown = wrapper.querySelector(".custom-sort-options");
  const trigger = wrapper.querySelector(".custom-sort-selected");

  initSortTrigger(wrapper, dropdown, trigger);
  initSortOptions(wrapper, dropdown, display);
  initSortOutsideClose(wrapper, dropdown);
  initSortActiveState(wrapper, display);
}


/**
 * Initializes the trigger that opens/closes the sort dropdown.
 *
 * @param {HTMLElement} wrapper - Wrapper element of the sort component.
 * @param {HTMLElement} dropdown - The dropdown options container.
 * @param {HTMLElement} trigger - The element that toggles the dropdown.
 * @returns {void}
 */
function initSortTrigger(wrapper, dropdown, trigger) {
  trigger.addEventListener("click", () => {
    const isHidden = dropdown.classList.contains("d-none");
    dropdown.classList.toggle("d-none", !isHidden);
    wrapper.classList.toggle("is-open", isHidden);
  });
}


/**
 * Sets up click handlers on each sort option in the dropdown.
 * Changes the current sort mode and reloads tasks when an option is selected.
 *
 * @param {HTMLElement} wrapper - Wrapper element of the sort component.
 * @param {HTMLElement} dropdown - The dropdown options container.
 * @param {HTMLElement} display - Element to display the selected option text.
 * @returns {void}
 */
function initSortOptions(wrapper, dropdown, display) {
  wrapper.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
      const val = option.dataset.value;
      const text = option.innerText;
      display.innerText = text;
      currentSortMode = val;
      dropdown.classList.add("d-none");
      wrapper.classList.remove("is-open");
      loadTasks();
    });
  });
}


/**
 * Closes the sort dropdown when a click occurs outside of it.
 *
 * @param {HTMLElement} wrapper - Wrapper element of the sort component.
 * @param {HTMLElement} dropdown - The dropdown options container.
 * @returns {void}
 */
function initSortOutsideClose(wrapper, dropdown) {
  document.addEventListener("click", (event) => {
    if (!wrapper.contains(event.target)) {
      dropdown.classList.add("d-none");
      wrapper.classList.remove("is-open");
    }
  });
}


/**
 * Sets the initial active state of the sort dropdown by
 * reflecting the current sort mode to the visible label.
 *
 * @param {HTMLElement} wrapper - Wrapper element of the sort component.
 * @param {HTMLElement} display - Element to display the selected option text.
 * @returns {void}
 */
function initSortActiveState(wrapper, display) {
  const activeOption = wrapper.querySelector(`li[data-value="${currentSortMode}"]`);
  if (activeOption) display.innerText = activeOption.innerText;
}
