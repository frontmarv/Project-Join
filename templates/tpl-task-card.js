function getTasksTemplate(task) {
  const view = buildTaskViewModel(task);
  return /*html*/ `
    <div class="task" draggable="true"
        ondragstart="startDragging('${task.id}')"
        onclick="renderTaskInfoDlg('${task.id}')">
<div class="task-card--header">
      <span class="${view.categoryClass}">
        ${formatCategory(task.category)}
      </span>
      <img class="task-card-menu"
      src="../assets/img/contacts-options-active.svg"
      alt=""
      draggable="false"
      onclick="toggleCardMenu(event, this)"
      onmouseover="event.target.closest('.task').draggable = false"
      onmouseout="event.target.closest('.task').draggable = true"
      onpointerdown="event.stopPropagation();"
      onmousedown="event.stopPropagation();"
      ontouchstart="event.stopPropagation();"
      ondragstart="event.stopPropagation(); return false;">
</div>
      <div class="task__content-metadata-box">
        <span class="task__title">${task.title || ''}</span>
        <span class="task__description">${task.description || ''}</span>
      </div>

      <div class="task__subtasks-and-progressbar-box">
        ${view.progressHtml}
      </div>

      <div class="task__assignment-and-priority-box">
        <div class="task__assignments">
          ${view.assignedHtml}
        </div>
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


function toggleCardMenu(event, icon) {
  event.stopPropagation();
  event.preventDefault();
  icon.classList.toggle('rotate90');
}