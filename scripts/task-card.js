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
 * Formats a date string to German locale.
 * @param {string} dateStr - Date string to format.
 * @returns {string} Formatted date or empty string.
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
 * Checks if a task due date is overdue.
 * @param {string} dueDate - The task's due date.
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
 * Iterates all task cards and marks overdue dates.
 * Removes overdue class for completed tasks.
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
 * Adds or removes the overdue class on a task's due date element.
 * @param {HTMLElement} taskCardDate - Element displaying the due date.
 * @param {string} state - Column/task state (e.g., "to-do", "done").
 * @param {string} dateStr - The due date string from dataset.
 * @param {number} today - Current normalized timestamp (00:00).
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
 * Returns subtask statistics for a given task.
 * @param {Object} task - Task object.
 * @returns {{total: number, done: number, percent: number}} Subtask stats.
 */
function getSubtaskStats(task) {
  return {
    total: getTotalSubtaskCount(task),
    done: getCheckedSubtaskCount(task),
    percent: getSubtaskProgressPercent(task)
  };
}


/**
 * Counts the total number of subtasks.
 * @param {Object} task - Task object.
 * @returns {number} Total subtask count.
 */
function getTotalSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== "object") return 0;
  return Object.keys(task.subtasks).length;
}


/**
 * Counts completed subtasks.
 * @param {Object} task - Task object.
 * @returns {number} Checked subtask count.
 */
function getCheckedSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== "object") return 0;
  return Object.values(task.subtasks)
    .filter(st => st && st.taskChecked === true).length;
}


/**
 * Calculates completion percentage of subtasks.
 * @param {Object} task - Task object.
 * @returns {number} Percentage of completed subtasks.
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
 * Generates assigned user avatars HTML for task cards.
 * @param {Array|Object} assigned - Assigned contact data.
 * @returns {string} HTML markup for avatars.
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
 * Normalizes assigned contact data into an array.
 * @param {any} data - Assigned contact data.
 * @returns {string[]} Array of user IDs.
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
 * Returns the CSS class for a given task category.
 * @param {string} category - Task category.
 * @returns {string} CSS class for category styling.
 */
function getCategoryClass(category) {
  const map = { "User Story": "task__category", "Technical Task": "task__category2" };
  return map[category] || "task__category";
}


/**
 * Returns the file path of the priority icon.
 * @param {string} priority - Task priority level.
 * @returns {string} Path to priority icon file.
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
 * Opens the task info dialog when clicking on a task card.
 * Ignores clicks on menu icons or during drag operations.
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
 * Opens the context menu for a task card.
 * Ensures only one menu is visible at a time.
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
