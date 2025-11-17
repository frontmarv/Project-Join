// ======================================================
// 🔹 GLOBAL STATE & REFERENCES
// ======================================================

let selectRef, searchInputRef, optionsRef, listItemsRef;
let isDropdownOpen = false;


// ======================================================
// 🔹 DROPDOWN CONTROL
// ======================================================

/**
 * Toggles the visibility of the dropdown menu.
 * @param {boolean} [forceState] - Optional forced state (true/false).
 */
function toggleDropdown(forceState) {
  if (typeof forceState === "boolean") {
    isDropdownOpen = forceState;
  } else {
    isDropdownOpen = !isDropdownOpen;
  }

  if (optionsRef) {
    optionsRef.style.display = isDropdownOpen ? "flex" : "none";
  }
}


/**
 * Filters visible contacts in the dropdown based on search input.
 * @param {string} term - Search term entered by the user.
 */
function filterContacts(term) {
  listItemsRef.forEach(listItem => {
    const name = listItem.querySelector(".username").textContent.toLowerCase();
    listItem.style.display = name.includes(term) ? "flex" : "none";
  });
}


// ======================================================
// 🔹 CHECKBOX HANDLING
// ======================================================

/**
 * Updates the visual state of a checkbox depending on hover and checked status.
 * @param {HTMLImageElement} checkbox - The checkbox image element.
 * @param {boolean} isChecked - Whether the checkbox is checked.
 * @param {boolean} isHovering - Whether the user is hovering over it.
 */
function updateCheckboxVisual(checkbox, isChecked, isHovering) {
  if (isHovering) {
    checkbox.src = isChecked
      ? "../assets/img/checkbox-unchecked-hover.svg"
      : "../assets/img/checkbox-checked-hover.svg";
  } else {
    checkbox.src = isChecked
      ? "../assets/img/checkbox-checked-white.svg"
      : "../assets/img/checkbox-unchecked.svg";
  }
}


/**
 * Initializes all checkbox event handlers for the list items.
 */
function initCheckboxHandlers() {
  listItemsRef.forEach(listItem => {
    const checkbox = listItem.querySelector(".checkbox");
    bindCheckboxHoverHandlers(listItem, checkbox);
    bindCheckboxClickHandler(listItem, checkbox);
  });
}


/**
 * Binds hover events to update checkbox visuals on mouse enter and leave.
 * @param {HTMLElement} listItem - The list item element.
 * @param {HTMLElement} checkbox - The checkbox element.
 */
function bindCheckboxHoverHandlers(listItem, checkbox) {
  listItem.addEventListener("mouseenter", () => {
    updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", true);
  });

  listItem.addEventListener("mouseleave", () => {
    updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", false);
  });
}


/**
 * Binds click handler to toggle checkbox state and update visuals.
 * @param {HTMLElement} listItem - The list item element.
 * @param {HTMLElement} checkbox - The checkbox element.
 */
function bindCheckboxClickHandler(listItem, checkbox) {
  listItem.addEventListener("click", event => {
    event.stopPropagation();
    toggleCheckboxState(listItem, checkbox);
  });
}


/**
 * Toggles checkbox checked state and updates related visual/UI states.
 * @param {HTMLElement} listItem - The list item element.
 * @param {HTMLElement} checkbox - The checkbox element.
 */
function toggleCheckboxState(listItem, checkbox) {
  const isChecked = checkbox.dataset.checked === "true";
  checkbox.dataset.checked = (!isChecked).toString();
  updateCheckboxVisual(checkbox, !isChecked, false);
  listItem.classList.toggle("active", !isChecked);
}


// ======================================================
// 🔹 DROPDOWN EVENT HANDLERS
// ======================================================

/**
 * Initializes all dropdown-related event handlers.
 */
function initDropdownHandlers() {
  bindDropdownClickHandler();
  bindDropdownInputHandler();
  bindOutsideClickHandler();
}


/**
 * Binds click handler to toggle the dropdown when the input field is clicked.
 */
function bindDropdownClickHandler() {
  searchInputRef.addEventListener("click", event => {
    event.stopPropagation();
    toggleDropdown();
  });
}


/**
 * Binds input handler to dynamically filter contacts and open dropdown if closed.
 */
function bindDropdownInputHandler() {
  searchInputRef.addEventListener("input", event => {
    const searchTerm = event.target.value.toLowerCase();
    if (!isDropdownOpen) toggleDropdown(true);
    filterContacts(searchTerm);
  });
}


/**
 * Closes the dropdown when the user clicks outside of it.
 */
function bindOutsideClickHandler() {
  document.addEventListener("click", event => {
    if (!selectRef.contains(event.target)) toggleDropdown(false);
  });
}


// ======================================================
// 🔹 CONTACT ASSIGNMENT INITIALIZATION
// ======================================================

/**
 * Initializes the contact assignment dropdown and checkbox interactions.
 */
function initContactAssign() {
  initializeContactRefs();
  if (!validateContactRefs()) return;
  initDropdownHandlers();
  initCheckboxHandlers();
}


/**
 * Initializes all DOM reference variables for contact assignment UI.
 */
function initializeContactRefs() {
  selectRef = document.getElementById("contact-select");
  searchInputRef = document.getElementById("contact-search");
  optionsRef = selectRef?.querySelector(".contact-options");
  listItemsRef = optionsRef?.querySelectorAll("li") || [];
}


/**
 * Validates that all required contact assignment elements exist.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateContactRefs() {
  const isValid = selectRef && searchInputRef && optionsRef && listItemsRef.length > 0;
  if (!isValid) {
    console.warn("ContactAssign: Not initialized – required elements missing");
  }
  return isValid;
}


// ======================================================
// 🔹 ASSIGNMENT LIST POPULATION
// ======================================================

/**
 * Populates the assignment list with users and initializes event handlers.
 * @param {Object} task - The task object containing assigned contacts.
 */
function populateAssignmentListFromFirebase(task) {
  const contactsDropDownList = document.querySelector('.contact-options');
  const avatarContainer = document.querySelector('.dlg-edit__main__assigned-user-container');
  if (!validateAssignmentElements(contactsDropDownList, avatarContainer)) return;

  const assignedIds = getAssignedIds(task);
  renderAssignmentList(contactsDropDownList, assignedIds);
  initContactAssign();
  refreshAssignedUserContainer(avatarContainer);
  bindAssignmentListEvents(contactsDropDownList, avatarContainer);
}


/**
 * Ensures both dropdown and avatar container exist before rendering.
 * @param {HTMLElement} contactsDropDownList - Dropdown list element.
 * @param {HTMLElement} avatarContainer - Avatar container element.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateAssignmentElements(contactsDropDownList, avatarContainer) {
  return contactsDropDownList && avatarContainer;
}


/**
 * Extracts valid assigned user IDs from a task.
 * @param {Object} task - Task object.
 * @returns {string[]} Array of assigned contact IDs.
 */
function getAssignedIds(task) {
  return Array.isArray(task.assignedContacts)
    ? task.assignedContacts.filter(Boolean)
    : [];
}


/**
 * Renders user entries inside the dropdown based on assigned IDs.
 * @param {HTMLElement} contactsDropDownList - Dropdown list element.
 * @param {string[]} assignedIds - Array of assigned user IDs.
 */
function renderAssignmentList(contactsDropDownList, assignedIds) {
  contactsDropDownList.innerHTML = users
    .map(user => getAssignmentListUserTpl(user, assignedIds.includes(user.id)))
    .join('');
}


/**
 * Binds click events to dropdown list items to refresh assigned users.
 * @param {HTMLElement} contactsDropDownList - Dropdown list element.
 * @param {HTMLElement} avatarContainer - Avatar container element.
 */
function bindAssignmentListEvents(contactsDropDownList, avatarContainer) {
  contactsDropDownList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      requestAnimationFrame(() => refreshAssignedUserContainer(avatarContainer));
    });
  });
}


// ======================================================
// 🔹 ASSIGNED USER AVATARS
// ======================================================

/**
 * Creates an SVG badge showing "+x users".
 * @param {number} count - Number of additional users.
 * @returns {string} SVG markup.
 */
function getMoreUsersSvg(count) {
  return /*html*/ `
    <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden="true">
      <circle cx="21" cy="21" r="20" fill="rgb(66, 82, 110)" stroke="white" stroke-width="2"/>
      <text x="21" y="23" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="400" fill="white">
        +${count}
      </text>
    </svg>`;
}


/**
 * Renders up to 5 assigned user avatars and adds a "+x" SVG if more are selected.
 * @param {HTMLElement} c - The container element where avatars are rendered.
 */
function refreshAssignedUserContainer(c) {
  const ids = getSelectedAssignmentIds(), max = 5;
  const shown = ids.slice(0, max).map(id => users.find(u => u.id === id)).filter(Boolean);
  c.innerHTML = shown.map(u => `
    <div class="dlg-edit__user-box" title="${u.name}">
      ${getUserAvatarSvg(u)}
    </div>`).join('');
  if (ids.length > max) {
    const more = ids.length - max;
    c.innerHTML += `
      <div class="dlg-edit__user-box" title="+${more} Users">
        ${getMoreUsersSvg(more)}
      </div>`;
  }
}


/**
 * Retrieves the correct SVG template for a user's avatar.
 * @param {Object} user - User object.
 * @returns {string} SVG markup.
 */
function getUserAvatarSvg(user) {
  if (typeof getAssignedUserSvgTpl === 'function') return getAssignedUserSvgTpl(user);
  if (typeof getAssignetUserSvgtpl === 'function') return getAssignetUserSvgtpl(user);
  return '';
}


// ======================================================
// 🔹 SELECTED USER ID EXTRACTION
// ======================================================

/**
 * Collects all selected user IDs from the contact assignment list.
 * @returns {string[]} Array of selected user IDs.
 */
function getSelectedAssignmentIds() {
  const ul = document.querySelector('.contact-options');
  if (!ul) return [];

  const items = ul.querySelectorAll('li');
  return extractSelectedIds(items);
}


/**
 * Extracts user IDs from list items that are either active or checked.
 * @param {NodeListOf<HTMLElement>} items - List of contact list items.
 * @returns {string[]} Array of selected user IDs.
 */
function extractSelectedIds(items) {
  const picked = [];
  items.forEach(li => {
    const userId = getListItemUserId(li);
    if (userId && isListItemSelected(li)) picked.push(userId);
  });
  return picked;
}


/**
 * Retrieves the user ID from a list item element.
 * @param {HTMLElement} li - The list item element.
 * @returns {string|null} The user ID or null.
 */
function getListItemUserId(li) {
  return li.getAttribute('data-user-id');
}


/**
 * Determines whether a list item is selected or its checkbox is checked.
 * @param {HTMLElement} li - The list item element.
 * @returns {boolean} True if the item is selected.
 */
function isListItemSelected(li) {
  const checkbox = li.querySelector('.checkbox');
  const isActive = li.classList.contains('active');
  const isChecked = checkbox && checkbox.dataset.checked === 'true';
  return isActive || isChecked;
}
