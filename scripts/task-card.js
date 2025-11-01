
function buildTaskViewModel(task) {
  const { total, done, percent } = getSubtaskStats(task);

  return {
    categoryClass: getCategoryClass(task.category),
    progressHtml: total > 0 ? getProgressTpl(percent, done, total) : "",
    assignedHtml: getAssignedUsersHtml(task.assignedContacts),
    priorityIcon: getPriorityIcon(task.priority)
  };
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
  if (data && typeof data === "object")
    return Object.values(data).filter(Boolean);
  return [];
}

function getCategoryClass(category) {
  const map = {
    "User Story": "task__category",
    "Technical Task": "task__category2"
  };
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

