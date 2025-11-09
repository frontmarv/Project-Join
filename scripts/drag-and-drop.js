let draggedTask = null;
let placeholder = null;
let startCol = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let clickedTask = null;

function initDragAndDrop() {
  document.addEventListener("pointerdown", onPointerDown);
}

function onPointerDown(e) {
  if (e.button !== 0) return; // nur linker Klick
  if (e.target.closest(".task-card__menu-icon")) return; // Menü klick ignorieren

  const task = e.target.closest(".task");
  if (!task) return;

  clickedTask = task;

  const rect = task.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  startCol = task.closest(".tasks");

  document.addEventListener("pointermove", onPointerMove, { passive: false });
  document.addEventListener("pointerup", onPointerUp, { passive: false });

  e.preventDefault();
}

function onPointerMove(e) {
  if (!clickedTask) return;

  // Drag startet direkt bei Bewegung mit gedrückter Taste
  if (!isDragging) {
    startDragging(e, clickedTask);
    isDragging = true;
  }

  onDragging(e);
}

function startDragging(e, taskEl) {
  draggedTask = taskEl;

  const rect = draggedTask.getBoundingClientRect();

  placeholder = document.createElement("div");
  placeholder.className = "task task--placeholder";
  placeholder.style.width = `${rect.width}px`;
  placeholder.style.height = `${rect.height}px`;
  draggedTask.parentNode.insertBefore(placeholder, draggedTask);

  Object.assign(draggedTask.style, {
    position: "fixed",
    left: `${rect.left}px`,
    top: `${rect.top}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    zIndex: "10000",
    pointerEvents: "none"
  });

  draggedTask.classList.add("dragging");

  try { draggedTask.setPointerCapture(e.pointerId); } catch {}
}

function onDragging(e) {
  if (!draggedTask) return;
  draggedTask.style.left = `${e.clientX - offsetX}px`;
  draggedTask.style.top = `${e.clientY - offsetY}px`;

  const under = document.elementFromPoint(e.clientX, e.clientY);
  const col = under?.closest(".tasks");
  if (col && placeholder && !col.contains(placeholder)) {
    col.appendChild(placeholder);
  }
}

async function onPointerUp(e) {
  document.removeEventListener("pointermove", onPointerMove);
  document.removeEventListener("pointerup", onPointerUp);

  // ✅ Kein Drag → Info öffnen
  if (!isDragging && clickedTask) {
    const id = clickedTask.getAttribute("data-task-id");
    if (id) renderTaskInfoDlg(id);
  }

  // ✅ Drag aktiv war → fallen lassen
  if (isDragging) await stopDragging(e);

  // Reset
  clickedTask = null;
  isDragging = false;
}

async function stopDragging(e) {
  if (!draggedTask) return;

  const id = draggedTask.getAttribute("data-task-id");
  const dropCol = placeholder?.closest(".tasks") || startCol;

  const newState = dropCol ? mapColumnIdToTaskState(dropCol.id) : null;
  const oldState = startCol ? mapColumnIdToTaskState(startCol.id) : null;

  draggedTask.classList.remove("dragging");
  Object.assign(draggedTask.style, {
    position: "",
    left: "",
    top: "",
    width: "",
    height: "",
    zIndex: "",
    pointerEvents: ""
  });

  // Karte an Placeholder-Position einsetzen
  if (placeholder && placeholder.parentNode) {
    placeholder.parentNode.insertBefore(draggedTask, placeholder);
  }

  placeholder?.remove();
  placeholder = null;

  try { draggedTask.releasePointerCapture(e.pointerId); } catch {}

  // Nur speichern, wenn Spalte geändert:
  if (id && newState && oldState && newState !== oldState) {
    await updateTaskState(id, newState);
    await refreshBoard();
  }

  draggedTask = null;
  startCol = null;
}

async function manualMoveTaskToNewColmn(TaskId, newStateUpperCase) {
  const newState = newStateUpperCase.charAt(0).toLowerCase() + newStateUpperCase.slice(1);
  await updateTaskState(TaskId, newState);
  await refreshBoard();
}

function mapColumnIdToTaskState(id) {
  return {
    "to-do-tasks": "to-do",
    "in-progress-tasks": "in-progress",
    "await-feedback-tasks": "await-feedback",
    "done-tasks": "done"
  }[id] || null;
}

async function updateTaskState(id, state) {
  await fetch(`https://join-25a0e-default-rtdb.europe-west1.firebasedatabase.app/tasks/${id}.json`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ taskState: state })
  });
}

async function refreshBoard() {
  await getData();
  loadTasks();
  updateAllPlaceholders();
}
