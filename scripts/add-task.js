let chosenPriority = "medium";

window.addEventListener("resize", relocateRequiredInfo);
window.addEventListener("load", relocateRequiredInfo);

async function initAddTask() {
  await getData();
  await waitFor(".contact-options"); // Insert ist geladen
  populateAssignmentListFromFirebase({ assignedContacts: [] });
  initSubtaskInput();
  initSubtaskHandlers();
  initSubtaskIconButtons();
  setupCategoryInvalidHandler();
  updateCategoryValidity();
}

/** Helper: wartet, bis ein Selector im DOM existiert */
function waitFor(selector) {
  return new Promise(resolve => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const el2 = document.querySelector(selector);
      if (el2) {
        obs.disconnect();
        resolve(el2);
      }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
}

/* ================= Priority ================= */
function changePriorityBtn(priorityBtn) {
  changePriorityBtnColor(priorityBtn.id);
  changePriorityBtnIcon(priorityBtn.id);
  chosenPriority = priorityBtn.id;
}

function changePriorityBtnColor(btn) {
  const colors = { urgent: "#FF3D00", medium: "#FFA700", low: "#7AE229" };
  ["urgent", "medium", "low"].forEach(id => {
    const b = document.getElementById(id);
    b.style.backgroundColor = "#FFFFFF";
    b.style.color = "#000000";
  });
  const selectedBtn = document.getElementById(btn);
  selectedBtn.style.backgroundColor = colors[selectedBtn.id];
  selectedBtn.style.color = "#FFFFFF";
}

function resetPriorityButtons() {
  ["urgent", "medium", "low"].forEach(id => {
    const btn = document.getElementById(id);
    btn.style.backgroundColor = "#FFFFFF";
    btn.style.color = "#000000";
    const img = btn.querySelector("img");
    if (img) img.src = img.dataset.default;
  });
  chosenPriority = "medium";
}

function changePriorityBtnIcon(btnId) {
  document.querySelectorAll(".priority-options-btn img").forEach(img => {
    img.src = img.dataset.default;
  });
  const selectedBtnIcon = document.getElementById(btnId)?.querySelector("img");
  if (selectedBtnIcon) selectedBtnIcon.src = selectedBtnIcon.dataset.selected;
}

/* ========== Category Dropdown & Validation (=Variante Proxy) ========== */

// Öffnen/Schließen + Auswahl + Außenklick (delegiert)
document.addEventListener('click', (e) => {
  // Toggle
  const trigger = e.target.closest('.category-selection .selector');
  const root    = e.target.closest('.category-selection');
  if (trigger && root) {
    root.classList.toggle('open');
    return;
  }

  // Option gewählt
  const opt = e.target.closest('.category-selection .category-options li');
  if (opt) {
    const currentRoot   = opt.closest('.category-selection');
    const visibleInput  = currentRoot.querySelector('.selector');
    const proxyInput    = document.getElementById('category-proxy');
    const hiddenInput   = document.getElementById('category-hidden');

    const text  = opt.textContent.trim();
    const value = opt.dataset.value || text;

    if (visibleInput) visibleInput.value = text; // Anzeige
    if (proxyInput)   proxyInput.value   = text; // Proxy erfüllt required
    if (hiddenInput)  hiddenInput.value  = value; // tatsächlicher Wert
    updateCategoryValidity();
    currentRoot.classList.remove('open');
    return;
  }

  // Klick außerhalb -> schließen
  if (!e.target.closest('.category-selection')) {
    document.querySelectorAll('.category-selection.open')
      .forEach(el => el.classList.remove('open'));
  }
});

function setupCategoryInvalidHandler() {
  waitFor('#category-proxy').then((proxy) => {
    if (!proxy) return;

    // Browser-Validation feuert -> als ungültig markieren
    proxy.addEventListener('invalid', () => {
      const root = document.querySelector('.category-selection');
      root?.classList.add('invalid');
      root?.classList.remove('valid');
    }, true);

    // Beim Start den Zustand anhand des Hidden-Felds setzen
    updateCategoryValidity();
  });
}

function updateCategoryValidity() {
  const root   = document.querySelector('.category-selection');
  const hidden = document.getElementById('category-hidden');
  if (!root || !hidden) return;

  if (hidden.value.trim()) {
    root.classList.remove('invalid');
    root.classList.add('valid');
  } else {
    root.classList.add('invalid');
    root.classList.remove('valid');
  }
}

window.handleCreateTask = async function handleCreateTask(event) {
  event.preventDefault();
  const form = event.target;

  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  await createTask?.();

  // Reset
  form.reset();

  const catVisible = document.querySelector('.category-selection .selector');
  const catProxy   = document.getElementById('category-proxy');
  const catHidden  = document.getElementById('category-hidden');

  if (catVisible) catVisible.value = '';
  if (catProxy)   catProxy.value   = '';
  if (catHidden)  catHidden.value  = '';

  // ✅ HIER einfügen:
  updateCategoryValidity();

  resetPriorityButtons?.();
};


/* ================= Task-Erstellung ================= */
async function createTask() {
  const taskStateRef = document.getElementById("task-state").value;

  const newTask = {
    title:        document.getElementById("title").value,
    description:  document.getElementById("description").value,
    dueDate:      document.getElementById("due-date").value,
    assignedContacts: getSelectedAssignmentIds(),
    category:     getSelectedCategoryText(),   // sichtbarer Text
    categoryValue:getSelectedCategoryValue(),  // ID/Value (optional)
    subtasks:     collectSubtasksFromEditDialog(),
    priority:     chosenPriority,
    taskState:    taskStateRef
  };

  const key = await getNextTaskKey();
  await saveTaskToFirebase(newTask, key);

  showAlertOverlay();
  console.log(tasks);
}

/* ================= Overlay / Navigation ================= */
function showAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.remove("d-none");
}

function closeAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.add("d-none");
  window.location.reload();
}

function goToBoard() {
  window.location.href = "./board.html";
}

/* ================= Utilities ================= */
function getSelectedUserIds(selectId = "assigned-to") {
  return Array.from(document.getElementById(selectId).selectedOptions)
              .map(option => option.value);
}

function getSelectedCategoryText() {
  const el = document.querySelector(".category-selection .selector");
  return (el && el.value) ? el.value.trim() : "";
}

function getSelectedCategoryValue() {
  const el = document.getElementById("category-hidden");
  return (el && el.value) ? el.value.trim() : "";
}

function formatCategory(category) {
  return String(category || "")
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function clearTask() {
  const form = document.getElementById("task-form");
  form.reset();
  const catVisible = document.querySelector(".category-selection .selector");
  const catProxy   = document.getElementById("category-proxy");
  const catHidden  = document.getElementById("category-hidden");
  if (catVisible) catVisible.value = "";
  if (catProxy)   catProxy.value   = "";
  if (catHidden)  catHidden.value  = "";
  resetPriorityButtons();
  updateCategoryValidity();
}

/* ================= Responsive Hinweisboxen ================= */
function relocateRequiredInfo() {
  isSmallScreen = window.innerWidth < 1025;
  let currentPath = window.location.pathname;
  let relativePath = "/pages/add-task.html";
  if (currentPath.endsWith(relativePath)) {
    toggleFirstInfoBox(isSmallScreen);
    toggleSecondInfoBox(isSmallScreen);
  }
}

function toggleFirstInfoBox(isSmallScreen) {
  let requiredInfo = document.getElementById("required-info");
  if (!requiredInfo) return;
  if (isSmallScreen && !requiredInfo.classList.contains("d-none")) {
    requiredInfo.classList.add("d-none");
  } else if (!isSmallScreen && requiredInfo.classList.contains("d-none")) {
    requiredInfo.classList.remove("d-none");
  }
}

function toggleSecondInfoBox(isSmallScreen) {
  let rightColumn = document.querySelector(".add-task__right-column");
  if (!rightColumn) return;
  if (isSmallScreen && !document.getElementById("required-mobile")) {
    let insertHTML = getFieldRequiredInfo?.();
    if (insertHTML) rightColumn.insertAdjacentHTML("beforeend", insertHTML);
  } else if (!isSmallScreen && document.getElementById("required-mobile")) {
    document.getElementById("required-mobile").remove();
  }
}
