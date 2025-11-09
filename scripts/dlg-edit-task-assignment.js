let selectRef, searchInputRef, optionsRef, listItemsRef;
let isDropdownOpen = false;

/** ------------------ Dropdown Visibility ------------------ */

function toggleDropdown(forceState) {
  isDropdownOpen = typeof forceState === "boolean" ? forceState : !isDropdownOpen;
  if (optionsRef) optionsRef.style.display = isDropdownOpen ? "flex" : "none";
}

/** ------------------ Filtering ------------------ */

function filterContacts(term) {
  listItemsRef.forEach(listItem => {
    const name = listItem.querySelector(".username").textContent.toLowerCase();
    listItem.style.display = name.includes(term) ? "flex" : "none";
  });
}

/** ------------------ Checkbox Visual Update ------------------ */

function updateCheckboxVisual(checkbox, isChecked, isHovering) {
  const prefix = "../assets/img/";
  const hoverChecked = isChecked ? "checkbox-unchecked-hover.svg" : "checkbox-checked-hover.svg";
  const normalChecked = isChecked ? "checkbox-checked-white.svg" : "checkbox-unchecked.svg";
  checkbox.src = prefix + (isHovering ? hoverChecked : normalChecked);
}

/** ------------------ Checkbox Interactions ------------------ */

function initCheckboxHandlers() {
  listItemsRef.forEach(listItem => {
    const checkbox = listItem.querySelector(".checkbox");
    addCheckboxHoverEvents(listItem, checkbox);
    addCheckboxClickEvent(listItem, checkbox);
  });
}

function addCheckboxHoverEvents(listItem, checkbox) {
  listItem.addEventListener("mouseenter", () => {
    updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", true);
  });
  listItem.addEventListener("mouseleave", () => {
    updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", false);
  });
}

function addCheckboxClickEvent(listItem, checkbox) {
  listItem.addEventListener("click", event => {
    event.stopPropagation();
    toggleCheckboxState(checkbox, listItem);
  });
}

function toggleCheckboxState(checkbox, listItem) {
  const isChecked = checkbox.dataset.checked === "true";
  checkbox.dataset.checked = (!isChecked).toString();
  updateCheckboxVisual(checkbox, !isChecked, false);
  listItem.classList.toggle("active", !isChecked);
}

/** ------------------ Dropdown Handlers ------------------ */

function initDropdownHandlers() {
  searchInputRef.addEventListener("click", handleDropdownClick);
  searchInputRef.addEventListener("input", handleDropdownInput);
  document.addEventListener("click", handleDocumentClick);
}

function handleDropdownClick(event) {
  event.stopPropagation();
  toggleDropdown();
}

function handleDropdownInput(event) {
  const searchTerm = event.target.value.toLowerCase();
  if (!isDropdownOpen) toggleDropdown(true);
  filterContacts(searchTerm);
}

function handleDocumentClick(event) {
  if (!selectRef.contains(event.target)) toggleDropdown(false);
}

/** ------------------ Contact Assignment Init ------------------ */

function initContactAssign() {
  selectRef = document.getElementById("contact-select");
  searchInputRef = document.getElementById("contact-search");
  optionsRef = selectRef?.querySelector(".contact-options");
  listItemsRef = optionsRef?.querySelectorAll("li") || [];
  if (!selectRef || !searchInputRef || !optionsRef || listItemsRef.length === 0) {
    console.warn("ContactAssign: Not initialized – required elements missing");
    return;
  }
  initDropdownHandlers();
  initCheckboxHandlers();
}

/** ------------------ Populate Assignments ------------------ */

function populateAssignmentListFromFirebase(task) {
  const contactsDropDownList = document.querySelector(".contact-options");
  const avatarContainer = document.querySelector(".dlg-edit__main__assigned-user-container");
  if (!contactsDropDownList || !avatarContainer) return;

  const assignedIds = getAssignedIds(task);
  contactsDropDownList.innerHTML = users
    .map(user => getAssignmentListUserTpl(user, assignedIds.includes(user.id)))
    .join("");

  initContactAssign();
  refreshAssignedUserContainer(avatarContainer);
  addAssignmentClickHandlers(contactsDropDownList, avatarContainer);
}

function getAssignedIds(task) {
  return Array.isArray(task.assignedContacts)
    ? task.assignedContacts.filter(Boolean)
    : [];
}

function addAssignmentClickHandlers(list, avatarContainer) {
  list.querySelectorAll("li").forEach(li => {
    li.addEventListener("click", () => {
      requestAnimationFrame(() => refreshAssignedUserContainer(avatarContainer));
    });
  });
}

/** ------------------ Avatar Refresh ------------------ */

function refreshAssignedUserContainer(avatarContainer) {
  const selectedIds = getSelectedAssignmentIds();
  avatarContainer.innerHTML = selectedIds.map(id => renderUserAvatar(id)).join("");
}

function renderUserAvatar(id) {
  const user = users.find(u => u.id === id);
  if (!user) return "";
  const svg = typeof getAssignedUserSvgTpl === "function"
    ? getAssignedUserSvgTpl(user)
    : (typeof getAssignetUserSvgtpl === "function" ? getAssignetUserSvgtpl(user) : "");
  return `<div class="dlg-edit__user-box" title="${user.name}">${svg}</div>`;
}

/** ------------------ Selected Users ------------------ */

function getSelectedAssignmentIds() {
  const ul = document.querySelector(".contact-options");
  if (!ul) return [];
  const picked = [];
  ul.querySelectorAll("li").forEach(li => {
    const checkbox = li.querySelector(".checkbox");
    const userId = li.getAttribute("data-user-id");
    const isActive = li.classList.contains("active");
    const isChecked = checkbox && checkbox.dataset.checked === "true";
    if (userId && (isActive || isChecked)) picked.push(userId);
  });
  return picked;
}
