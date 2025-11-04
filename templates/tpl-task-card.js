document.addEventListener("click", (event) => {
  document.querySelectorAll('.task-card__menu').forEach(element => {
    if (!element.contains(event.target)) {
      element.style.display = "none";
    }
  });
});

function getTasksTemplate(task, {previousTask, nextTask}) {
  const view = buildTaskViewModel(task);
  return /*html*/ `
    <div class="task" draggable="true"
        ondragstart="startDragging('${task.id}')"
        onclick="renderTaskInfoDlg('${task.id}')">

      <div class="task-card__header">
        <div class="task-card__header-top">
          <span class="${view.categoryClass}">
            ${formatCategory(task.category)}
          </span>
          <img class="task-card__menu-icon"
            src="../assets/img/drag&drop-mobile.svg"
            alt=""
            draggable="false"
            onclick="toggleCardMenu(event, (this))"
            onmouseover="event.target.closest('.task').draggable = false"
            onmouseout="event.target.closest('.task').draggable = true"
            onpointerdown="event.stopPropagation();"
            onmousedown="event.stopPropagation();"
            ontouchstart="event.stopPropagation();"
            ondragstart="event.stopPropagation();">
        </div>

        <div class="task-card__header-bottom">
          <span class="task-card__due-date ${isOverdue(task.dueDate) ? 'task-card__due-date--overdue' : ''}"
                data-due-date="${task.dueDate || ''}">
                Due Date: ${task.dueDate ? formatDate(task.dueDate) : ''}
          </span>
        </div>

        <div class="task-card__menu" onclick="event.stopPropagation()">
          <p class="task-card__menu__header">Move to</p>
          <p class="task-card__menu__move"
            onclick="manualMoveTaskToNewColmn('${task.id}', '${previousTask}')">
            <img src="../assets/img/arrow_upward.svg"><span>${previousTask}</span>
          </p>
          <p class="task-card__menu__move"
            onclick="manualMoveTaskToNewColmn('${task.id}', '${nextTask}')">
            <img src="../assets/img/arrow_downward.svg"><span>${nextTask}</span>
          </p>
        </div>
      </div>

      <div class="task__content-metadata-box">
        <span class="task__title">${task.title || ''}</span>
        <span class="task__description">${task.description || ''}</span>
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

function getProgressTpl(percent, done, total) {
  const label = total === 1 ? "Subtask done" : "Subtasks done";
  return /*html*/ `
    <div class="task__progressbar" style="--progress:${percent}%;">
      <span class="task__progressbar-value">${done} / ${total}</span>
    </div>
    <span class="task__subtasks">${label}</span>
  `;
}

function getAssignedUserInCardTpl(user) {
  const initials = getUserNameInitials(user.name);
  return /*html*/ `
    <svg width="32" height="32" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <title>${user.name}</title>
      <circle cx="21" cy="21" r="20" fill="${user.profilImgColor}" stroke="white" stroke-width="2" />
      <text x="21" y="23" text-anchor="middle" dominant-baseline="middle"
            font-size="12" fill="white" font-family="sans-serif">${initials}</text>
    </svg>
  `;
}

function getMoreUsersBadgeTpl(count) {
  return /*html*/ `
    <svg width="32" height="32" viewBox="0 0 42 42" aria-hidden="true" focusable="false">
      <title>+${count} Users</title>
      <circle cx="21" cy="21" r="20" fill="#42526E" stroke="white" stroke-width="2"/>
      <text x="21" y="23" text-anchor="middle" dominant-baseline="middle"
            font-size="12" fill="white" font-family="sans-serif">+${count}</text>
    </svg>
  `;
}


function toggleCardMenu(event, element) {
  event.stopPropagation();
  event.preventDefault();
  element.nextElementSibling.style.display = "flex";
}


