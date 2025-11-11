function initSubtaskInput() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!input || !list) return;
  input.addEventListener('keydown', event => handleSubtaskInputKeydown(event, input, list));
}

function handleSubtaskInputKeydown(event, input, list) {
  const value = input.value.trim();
  if (event.key === 'Enter' && value) return addSubtaskOnEnter(event, list, input, value);
  if (event.key === 'Escape') return clearSubtaskInput(event, input);
}

function addSubtaskOnEnter(event, list, input, value) {
  event.preventDefault();
  list.innerHTML += getSubtaskTpl(value);
  input.value = '';
}

function clearSubtaskInput(event, input) {
  event.preventDefault();
  input.value = '';
  input.blur();
}


function initSubtaskHandlers() {
  const list = document.querySelector(".dlg-edit__subtask-list");
  if (!list) return;

  list.addEventListener("dblclick", event => {
    const listItem = event.target.closest("li");
    if (!listItem) return;
    if (event.target.closest(".subtask-edit-box__delete-img")) return;
    if (event.target.closest(".subtask-edit-box__edit-img")) return;
    startSubtaskEdit(listItem);
  });

  list.addEventListener("click", event => handleSubtaskClick(event));
  list.addEventListener("keydown", event => handleSubtaskEditKeydown(event));
}


function resetEditIcons(list) {
  const icons = list.querySelectorAll(".subtask-edit-box__edit-img");
  icons.forEach(icon => icon.replaceWith(icon.cloneNode(true)));
}

function bindSubtaskDblclick(list) {
  list.addEventListener("dblclick", event => {
    const listItem = event.target.closest("li");
    if (!listItem) return;
    if (event.target.closest(".subtask-edit-box__delete-img")) return;
    startSubtaskEdit(listItem);
  });
}

function bindEditIconClicks(list) {
  const icons = list.querySelectorAll(".subtask-edit-box__edit-img");
  icons.forEach(icon => {
    icon.addEventListener("click", event => {
      event.stopPropagation();
      const listItem = event.target.closest("li");
      if (!listItem) return;
      startSubtaskEdit(listItem);
    });
  });
}


function startSubtaskEdit(listItem) {
  if (!listItem || listItem.classList.contains("edit-mode")) return;
  const text = (listItem.textContent || "").replace("•", "").trim();
  replaceSubtaskWithEditTpl(listItem, text);
}


function handleSubtaskClick(event) {
  const editBtn = event.target.closest(".subtask-edit-box__edit-img");
  if (editBtn) {
    event.stopPropagation();
    const listItem = editBtn.closest("li");
    if (listItem) startSubtaskEdit(listItem);
    return;
  }

  handleSubtaskConfirm(event);
  handleSubtaskDelete(event);
}

function handleSubtaskEditKeydown(event) {
  const input = event.target.closest('.edit-input');
  if (!input) return;
  const listItem = input.closest('li');
  if (event.key === 'Escape') return cancelSubtaskEdit(event, listItem, input);
  if (event.key === 'Enter') return confirmSubtaskEdit(event, listItem, input);
}

function cancelSubtaskEdit(event, listItem, input) {
  event.preventDefault();
  listItem.outerHTML = getSubtaskTpl(input.dataset.original || input.value);
}

function confirmSubtaskEdit(event, listItem, input) {
  event.preventDefault();
  const newText = input.value.trim();
  if (newText) listItem.outerHTML = getSubtaskTpl(newText);
}

function initSubtaskIconButtons() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  const confirm = document.querySelector('.subtask-input__confirm-img');
  const cancel = document.querySelector('.subtask-input__cancel-img');
  if (!input || !list) return;
  confirm?.addEventListener('mousedown', event => handleConfirmBtnClick(event, input, list));
  cancel?.addEventListener('mousedown', event => handleCancelBtnClick(event, input));
}

function handleConfirmBtnClick(event, input, list) {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  list.innerHTML += getSubtaskTpl(value);
  input.value = '';
  input.focus();
}

function handleCancelBtnClick(event, input) {
  event.preventDefault();
  input.value = '';
  input.focus();
}

function handleSubtaskEdit(subtask) {
  const listItem = subtask.target.closest('li');
  if (!listItem || listItem.classList.contains('edit-mode')) return;
  if (subtask.target.closest('.subtask-edit-box__delete-img')) return;
  const text = (listItem.textContent || '').replace('•', '').trim();
  replaceSubtaskWithEditTpl(listItem, text);
}

function replaceSubtaskWithEditTpl(listItem, text) {
  listItem.outerHTML = getEditSubtaskTpl(text);
  const input = document.querySelector('.edit-input:last-of-type');
  if (!input) return;
  input.setAttribute('data-original', text);
  input.focus();
  input.select();
}

function handleSubtaskDelete(subtask) {
  const listItem = subtask.target.closest('.subtask-edit-box__delete-img')?.closest('li');
  listItem?.remove();
}

function handleSubtaskConfirm(subtask) {
  const listItem = subtask.target.closest('.subtask-edit-box__confirm-img')?.closest('li');
  if (!listItem) return;
  const input = listItem.querySelector('input');
  const newText = input?.value.trim();
  if (!newText) return;
  listItem.outerHTML = getSubtaskTpl(newText);
}

function collectSubtasksFromEditDialog() {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return {};
  const items = [...list.querySelectorAll('li:not(.edit-mode)')];
  return buildSubtaskObject(items);
}

function buildSubtaskObject(items) {
  const subtasksList = {};
  items.forEach((listItem, i) => {
    const value = (listItem.textContent || '').replace('•', '').trim();
    if (value) subtasksList[`subtask${i}`] = { task: value, taskChecked: false };
  });
  return subtasksList;
}
