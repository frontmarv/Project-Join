function initSubtaskInput() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!input || !list) return;
  input.addEventListener('keydown', e => handleSubtaskInputKeydown(e, input, list));
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
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return;
  list.addEventListener('dblclick', handleSubtaskEdit);
  list.addEventListener('click', e => handleSubtaskClick(e));
  list.addEventListener('keydown', e => handleSubtaskEditKeydown(e));
}

function handleSubtaskClick(event) {
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
  confirm?.addEventListener('mousedown', e => handleConfirmBtnClick(e, input, list));
  cancel?.addEventListener('mousedown', e => handleCancelBtnClick(e, input));
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
  const result = {};
  items.forEach((li, i) => {
    const value = (li.textContent || '').replace('•', '').trim();
    if (value) result[`subtask${i}`] = { task: value, taskChecked: false };
  });
  return result;
}
