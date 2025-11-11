// ======================================================
// 🔹 TASK CARD UTILITIES
// ======================================================
// Handles task card rendering, subtask progress,
// assigned users, categories, and overdue date marking.
// ======================================================


// ======================================================
// 🔹 TASK MODEL & BASIC HELPERS
// ======================================================

/**
 * Builds a view model for rendering a task card.
 * @param {Object} task - The task object.
 * @param {string} task.category - Task category.
 * @param {Array|string|Object} task.assignedContacts - Assigned users.
 * @param {string} task.priority - Task priority level.
 * @returns {Object} View model with formatted task data.
 */
function buildTaskViewModel(task) {
  const { total, done, percent } = getSubtaskStats(task);
  return {
    categoryClass: getCategoryClass(task.category),
    progressHtml: total > 0 ? getProgressTpl(percent, done, total) : "",
    assignedHtml: getAssignedUsersHtml(task.assignedContacts),
    priorityIcon: getPriorityIcon(task.priority)
  };
}


/**
 * Formats a date string using German locale.
 * @param {string} dateStr - Date string to format.
 * @returns {string} Formatted date or an empty string.
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}


/**
 * Checks if a given due date is overdue (today or earlier).
 * @param {string} dueDate - The task’s due date string.
 * @returns {boolean} True if overdue, otherwise false.
 */
function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const date = new Date(dueDate).setHours(0, 0, 0, 0);
  return date <= today;
}


// ======================================================
// 🔹 OVERDUE DATE HANDLING
// ======================================================

/**
 * Iterates over all task cards and marks overdue ones.
 * Removes overdue style for tasks in “done” state.
 */
function markOverdueDates() {
  const today = new Date().setHours(0, 0, 0, 0);
  document.querySelectorAll(".task").forEach(taskCard => {
    const state = taskCard.closest(".tasks")?.id || "";
    const taskCardDate = taskCard.querySelector(".task-card__due-date");
    const dateStr = taskCardDate?.dataset.dueDate;
    if (!taskCardDate || !dateStr) return;
    updateOverdueState(taskCardDate, state, dateStr, today);
  });
}


/**
 * Adds or removes the overdue class from a due date element.
 * @param {HTMLElement} taskCardDate - The date element of the card.
 * @param {string} state - The column/task state (e.g. “done”).
 * @param {string} dateStr - The due date string.
 * @param {number} today - The normalized timestamp (midnight today).
 */
function updateOverdueState(taskCardDate, state, dateStr, today) {
  const dueDate = new Date(dateStr).setHours(0, 0, 0, 0);
  if (state.includes("done")) {
    taskCardDate.classList.remove("task-card__due-date--overdue");
    return;
  }
  const isLate = dueDate <= today;
  taskCardDate.classList.toggle("task-card__due-date--overdue", isLate);
}


// ======================================================
// 🔹 SUBTASK STATISTICS
// ======================================================

/**
 * Returns subtask statistics (total, done, percent).
 * @param {Object} task - The task object containing subtasks.
 * @returns {{total:number, done:number, percent:number}} Subtask stats.
 */
function getSubtaskStats(task) {
  return {
    total: getTotalSubtaskCount(task),
    done: getCheckedSubtaskCount(task),
    percent: getSubtaskProgressPercent(task)
  };
}


/**
 * Counts all subtasks within a task.
 * @param {Object} task - The task object.
 * @returns {number} Number of subtasks.
 */
function getTotalSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== "object") return 0;
  return Object.keys(task.subtasks).length;
}


/**
 * Counts all checked (completed) subtasks.
 * @param {Object} task - The task object.
 * @returns {number} Number of completed subtasks.
 */
function getCheckedSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== "object") return 0;
  return Object.values(task.subtasks).filter(st => st?.taskChecked === true).length;
}


/**
 * Calculates the percentage of completed subtasks.
 * @param {Object} task - The task object.
 * @returns {number} Completion percentage (0–100).
 */
function getSubtaskProgressPercent(task) {
  const total = getTotalSubtaskCount(task);
  const checked = getCheckedSubtaskCount(task);
  if (total === 0) return 0;
  return (checked / total) * 100;
}


// ======================================================
// 🔹 ASSIGNED USERS DISPLAY
// ======================================================

/**
 * Builds HTML for assigned user avatars on task cards.
 * @param {Array|Object} assigned - Assigned contact data.
 * @returns {string} HTML string for assigned users.
 */
function getAssignedUsersHtml(assigned) {
  const assUser = normalizeAssignedContacts(assigned);
  const MAX = 5;
  const visible = assUser.slice(0, MAX);
  const remain = Math.max(0, assUser.length - MAX);
  const avatars = visible.map(id => {
    const user = users.find(user => user.id === id);
    return user ? getAssignedUserInCardTpl(user) : "";
  });
  if (remain > 0) avatars.push(getMoreUsersBadgeTpl(remain));
  return avatars.join("");
}


/**
 * Normalizes assigned user data into a flat ID array.
 * @param {Array|Object|any} data - Raw assigned user data.
 * @returns {string[]} Normalized user ID array.
 */
function normalizeAssignedContacts(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}


// ======================================================
// 🔹 CATEGORY & PRIORITY
// ======================================================

/**
 * Returns the CSS class corresponding to the task category.
 * @param {string} category - Task category name.
 * @returns {string} CSS class name.
 */
function getCategoryClass(category) {
  const map = {
    "User Story": "task__category",
    "Technical Task": "task__category2"
  };
  return map[category] || "task__category";
}


/**
 * Returns the correct priority icon path for a given level.
 * @param {string} priority - Task priority (“urgent”, “medium”, “low”).
 * @returns {string} File path to the icon image.
 */
function getPriorityIcon(priority) {
  const base = "../assets/img/priority-";
  if (priority === "urgent") return base + "urgent.svg";
  if (priority === "medium") return base + "medium.svg";
  return base + "low.svg";
}


// ======================================================
// 🔹 TASK CARD INTERACTION HANDLERS
// ======================================================

/**
 * Opens the task info dialog when clicking a task card.
 * Prevents opening during drag or when clicking menu icons.
 * @param {MouseEvent} event - Click event.
 */
document.addEventListener("click", (event) => {
  if (isDragging) return;
  if (event.target.closest(".task-card__menu-icon")) return;
  const taskEl = event.target.closest(".task");
  const id = taskEl?.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
});


/**
 * Opens the context menu for a specific task card.
 * Hides all other open menus.
 * @param {MouseEvent} event - Click event.
 */
document.addEventListener("click", (event) => {
  const btn = event.target.closest(".task-card__menu-icon");
  if (!btn) return;
  event.preventDefault();

  document.querySelectorAll(".task-card__menu")
    .forEach(menu => (menu.style.display = "none"));

  const menu = btn.closest(".task-card__header")
    ?.querySelector(".task-card__menu");

  if (menu) menu.style.display = "flex";
});


/**
 * Closes all task card context menus when clicking outside.
 * @param {MouseEvent} event - Click event.
 */
document.addEventListener("click", (event) => {
  if (event.target.closest(".task-card__menu")) return;
  if (event.target.closest(".task-card__menu-icon")) return;

  document.querySelectorAll(".task-card__menu")
    .forEach(menu => (menu.style.display = "none"));
});
