
let selectRef, searchInputRef, optionsRef, listItemsRef;
let isDropdownOpen = false;

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


function filterContacts(term) {
  listItemsRef.forEach((listItem) => {
    const name = listItem.querySelector(".username").textContent.toLowerCase();
    listItem.style.display = name.includes(term) ? "flex" : "none";
  });
}


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


function initCheckboxHandlers() {
  listItemsRef.forEach((listItem) => {
    const checkbox = listItem.querySelector(".checkbox");

    listItem.addEventListener("mouseenter", () => {
      updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", true);
    });

    listItem.addEventListener("mouseleave", () => {
      updateCheckboxVisual(checkbox, checkbox.dataset.checked === "true", false);
    });

    listItem.addEventListener("click", (event) => {
      event.stopPropagation();
      const isChecked = checkbox.dataset.checked === "true";
      checkbox.dataset.checked = (!isChecked).toString();
      updateCheckboxVisual(checkbox, !isChecked, false);
      listItem.classList.toggle("active", !isChecked);
    });
  });
}


function initDropdownHandlers() {
  searchInputRef.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleDropdown();
  });

  searchInputRef.addEventListener("input", (event) => {
    const searchTerm = event.target.value.toLowerCase();
    if (!isDropdownOpen) toggleDropdown(true);
    filterContacts(searchTerm);
  });

  document.addEventListener("click", (event) => {
    if (!selectRef.contains(event.target)) toggleDropdown(false);
  });
}


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


function populateAssignmentListFromFirebase(task) {
  const contactsDropDownList = document.querySelector('.contact-options');
  const avatarContainer = document.querySelector('.dlg-edit__main__assigned-user-container');
  if (!contactsDropDownList || !avatarContainer) return;

  const assignedIds = Array.isArray(task.assignedContacts) ? task.assignedContacts.filter(Boolean) : [];

  contactsDropDownList.innerHTML = users
    .map(user => getAssignmentListUserTpl(user, assignedIds.includes(user.id)))
    .join('');

  initContactAssign();
  refreshAssignedUserContainer();
  contactsDropDownList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      requestAnimationFrame(refreshAssignedUserContainer);
    });
  });


  function refreshAssignedUserContainer() {
    const selectedIds = getSelectedAssignmentIds();
    avatarContainer.innerHTML = selectedIds
      .map(id => {
        const user = users.find(user => user.id === id);
        const svg = (typeof getAssignedUserSvgTpl === 'function')
          ? getAssignedUserSvgTpl(user)
          : (typeof getAssignetUserSvgtpl === 'function' ? getAssignetUserSvgtpl(user) : '');
        return user ? /*html*/ `<div class="dlg-edit__user-box" title="${user.name}">${svg}</div>` : '';
      })
      .join('');
  }
}


function getSelectedAssignmentIds() {
  const ul = document.querySelector('.contact-options');
  if (!ul) return [];
  const items = ul.querySelectorAll('li');
  const picked = [];
  items.forEach(li => {
    const checkbox = li.querySelector('.checkbox');
    const userId = li.getAttribute('data-user-id');
    const isActive = li.classList.contains('active');
    const isChecked = checkbox && checkbox.dataset.checked === 'true';
    if (userId && (isActive || isChecked)) picked.push(userId);
  });
  return picked;
}