/**
 * Constructs a new task object based on form inputs.
 * @returns {Object} The newly built task.
 */
function buildNewTask() {
  return {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    dueDate: document.getElementById("due-date").value,
    assignedContacts: getSelectedAssignmentIds(),
    category: getSelectedCategoryText(),
    subtasks: collectSubtasksFromEditDialog(),
    priority: chosenPriority,
    taskState: document.getElementById("task-state").value
  };
}