function buildTaskViewModel(task) {
  const { total, done, percent } = getSubtaskStats(task);
  return {
    categoryClass: getCategoryClass(task.category),
    progressHtml: total > 0 ? getProgressTpl(percent, done, total) : "",
    assignedHtml: getAssignedUsersHtml(task.assignedContacts),
    priorityIcon: getPriorityIcon(task.priority)
  };
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const today = new Date().setHours(0, 0, 0, 0);
  const date = new Date(dueDate).setHours(0, 0, 0, 0);
  return date <= today;
}

function markOverdueDates() {
  const today = new Date().setHours(0, 0, 0, 0);
  document.querySelectorAll('.task').forEach(taskEl => {
    const state = taskEl.closest('.tasks')?.id || '';
    const dateEl = taskEl.querySelector('.task-card__due-date');
    const dateStr = dateEl?.dataset.dueDate;
    if (!dateEl || !dateStr) return;
    const due = new Date(dateStr).setHours(0, 0, 0, 0);
    if (state.includes('done')) {
      dateEl.classList.remove('task-card__due-date--overdue');
      return;
    }
    if (due <= today) dateEl.classList.add('task-card__due-date--overdue');
    else dateEl.classList.remove('task-card__due-date--overdue');
  });
}

function getSubtaskStats(task) {
  return {
    total: getTotalSubtaskCount(task),
    done: getCheckedSubtaskCount(task),
    percent: getSubtaskProgressPercent(task)
  };
}

function getAssignedUsersHtml(assigned) {
  const ids = normalizeAssignedContacts(assigned);
  const MAX = 5;
  const visible = ids.slice(0, MAX);
  const remain = Math.max(0, ids.length - MAX);
  const avatars = visible.map(id => {
    const user = users.find(u => u.id === id);
    return user ? getAssignedUserInCardTpl(user) : "";
  });
  if (remain > 0) avatars.push(getMoreUsersBadgeTpl(remain));
  return avatars.join("");
}

function normalizeAssignedContacts(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean);
  return [];
}

function getCategoryClass(category) {
  const map = { "User Story": "task__category", "Technical Task": "task__category2" };
  return map[category] || "task__category";
}

function getPriorityIcon(priority) {
  const base = "../assets/img/priority-";
  if (priority === "urgent") return base + "urgent.svg";
  if (priority === "medium") return base + "medium.svg";
  return base + "low.svg";
}

function getCheckedSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== 'object') return 0;
  return Object.values(task.subtasks).filter(st => st && st.taskChecked === true).length;
}

function getTotalSubtaskCount(task) {
  if (!task?.subtasks || typeof task.subtasks !== 'object') return 0;
  return Object.keys(task.subtasks).length;
}

function getSubtaskProgressPercent(task) {
  const total = getTotalSubtaskCount(task);
  const checked = getCheckedSubtaskCount(task);
  if (total === 0) return 0;
  return (checked / total) * 100;
}


document.addEventListener("click", (event) => {
  if (isDragging) return;
  if (event.target.closest(".task-card__menu-icon")) return;

  const taskEl = event.target.closest(".task");
  const id = taskEl?.getAttribute("data-task-id");
  if (id) renderTaskInfoDlg(id);
});


document.addEventListener("click", (event) => {
  const btn = event.target.closest(".task-card__menu-icon");
  if (!btn) return;
  event.preventDefault();
  document.querySelectorAll('.task-card__menu').forEach(m => (m.style.display = "none"));
  const menu = btn.closest(".task-card__header")?.querySelector(".task-card__menu");
  if (menu) menu.style.display = "flex";
});
