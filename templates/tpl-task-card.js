// ======================================================
// 🔹 TASK CARD TEMPLATE HELPERS
// ======================================================
// Provides HTML templates for rendering task cards,
// progress bars, user avatars, and assignment indicators.
// ======================================================


// ======================================================
// 🔹 MAIN TASK TEMPLATE
// ======================================================

/**
 * Generates the full HTML template for a task card.
 * @param {Object} task - The task object containing task details.
 * @param {Object} context - Context object with adjacent states.
 * @param {string} context.previousTask - Previous column ID (for move).
 * @param {string} context.nextTask - Next column ID (for move).
 * @returns {string} HTML string representing the task card.
 */
function getTasksTemplate(task, { previousTask, nextTask }) {
  const view = buildTaskViewModel(task);

  return /*html*/ `
    <div class="task" data-task-id="${task.id}">
      <div class="task-card__header">
        <div class="task-card__header-top">
          <span class="task-card__due-date ${isOverdue(task.dueDate) ? "task-card__due-date--overdue" : ""}"
                data-due-date="${task.dueDate || ""}">
            Due Date: ${task.dueDate ? formatDate(task.dueDate) : ""}
          </span>
        </div>

        <div class="task-card__header-bottom">
          <span class="${view.categoryClass}">
            ${formatCategory(task.category)}
          </span>

          <img class="task-card__menu-icon"
               src="../assets/img/drag&drop-mobile.svg"
               alt="Open Task Menu"
               draggable="false"
               data-task-id="${task.id}">
        </div>

        <div class="task-card__menu" onclick="event.stopPropagation()">
          <p class="task-card__menu__header">Move to</p>

          <p class="task-card__menu__move"
             onclick="manualMoveTaskToNewColmn('${task.id}', '${previousTask}')">
            <img src="../assets/img/arrow_upward.svg" alt="">
            <span>${previousTask}</span>
          </p>

          <p class="task-card__menu__move"
             onclick="manualMoveTaskToNewColmn('${task.id}', '${nextTask}')">
            <img src="../assets/img/arrow_downward.svg" alt="">
            <span>${nextTask}</span>
          </p>
        </div>
      </div>

      <div class="task__content-metadata-box">
        <span class="task__title">${task.title || ""}</span>
        <span class="task__description">${task.description || ""}</span>
      </div>

      <div class="task__subtasks-and-progressbar-box">
        ${view.progressHtml}
      </div>

      <div class="task__assignment-and-priority-box">
        <div class="task__assignments">${view.assignedHtml}</div>
        <div class="task__priority">
          <img src="${view.priorityIcon}" alt="${task.priority} priority icon">
        </div>
      </div>
    </div>
  `;
}


// ======================================================
// 🔹 PROGRESS BAR TEMPLATE
// ======================================================

/**
 * Builds the progress bar template for subtasks.
 * @param {number} percent - Completion percentage (0–100).
 * @param {number} done - Number of completed subtasks.
 * @param {number} total - Total number of subtasks.
 * @returns {string} HTML for the progress bar and label.
 */
function getProgressTpl(percent, done, total) {
  const label = total === 1 ? "Subtask done" : "Subtasks done";
  return /*html*/ `
    <div class="task__progressbar" style="--progress:${percent}%;">
      <span class="task__progressbar-value">${done} / ${total}</span>
    </div>
    <span class="task__subtasks">${label}</span>
  `;
}


// ======================================================
// 🔹 ASSIGNED USER AVATARS
// ======================================================

/**
 * Returns an SVG avatar element for an assigned user.
 * @param {Object} user - The user object.
 * @param {string} user.name - User’s full name.
 * @param {string} user.profilImgColor - Background color for the avatar.
 * @returns {string} HTML markup for the user avatar.
 */
function getAssignedUserInCardTpl(user) {
  const initials = getUserNameInitials(user.name);
  return /*html*/ `
    <svg width="32" height="32" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <title>${user.name}</title>
      <circle cx="21" cy="21" r="20" fill="${user.profilImgColor}" stroke="white" stroke-width="2" />
      <text x="21" y="23"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="14"
            fill="white"
            font-family="sans-serif">${initials}</text>
    </svg>
  `;
}


/**
 * Returns a "+N" badge SVG for additional assigned users.
 * @param {number} count - Number of extra users.
 * @returns {string} HTML markup for the "+N" avatar badge.
 */
function getMoreUsersBadgeTpl(count) {
  return /*html*/ `
    <svg width="32" height="32" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <title>+${count} Users</title>
      <circle cx="21" cy="21" r="20" fill="#42526E" stroke="white" stroke-width="2" />
      <text x="21" y="23"
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="14"
            fill="white"
            font-family="sans-serif">+${count}</text>
    </svg>
  `;
}
