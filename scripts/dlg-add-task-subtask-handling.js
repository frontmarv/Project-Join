
function initSubtaskInput() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!input || !list) return;
  input.addEventListener('keydown', event => {
    const value = input.value.trim();
    if (event.key === 'Enter' && value) {
      event.preventDefault();
      list.innerHTML += getSubtaskTpl(value);
      input.value = '';
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      input.value = '';
      input.blur();
    }
  });
}



function initSubtaskHandlers() {
  const list = document.querySelector('.dlg-edit__subtask-list');
  if (!list) return;
  list.addEventListener('dblclick', event => handleSubtaskEdit(event));
  list.addEventListener('click', event => {
    handleSubtaskConfirm(event);
    handleSubtaskDelete(event);
  });
  list.addEventListener('keydown', event => {
    const input = event.target.closest('.edit-input');
    if (!input) return;
    const listItem = input.closest('li');
    if (event.key === 'Escape') {
      event.preventDefault();
      listItem.outerHTML = getSubtaskTpl(input.dataset.original || input.value);
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const newText = input.value.trim();
      if (newText) listItem.outerHTML = getSubtaskTpl(newText);
    }
  });
}



function initSubtaskIconButtons() {
  const input = document.getElementById('subtask-input');
  const list = document.querySelector('.dlg-edit__subtask-list');
  const confirm = document.querySelector('.subtask-input__confirm-img');
  const cancel = document.querySelector('.subtask-input__cancel-img');
  if (!input || !list) return;
  confirm?.addEventListener('mousedown', event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;
    list.innerHTML += getSubtaskTpl(value);
    input.value = '';
    input.focus();
  });
  cancel?.addEventListener('mousedown', event => {
    event.preventDefault();
    input.value = '';
    input.focus();
  });
}



function handleSubtaskEdit(subtask) {
  const listItem = subtask.target.closest('li');
  if (!listItem || listItem.classList.contains('edit-mode')) return;
  if (subtask.target.closest('.subtask-edit-box__delete-img')) return;
  const text = (listItem.textContent || '').replace('•', '').trim();
  listItem.outerHTML = getEditSubtaskTpl(text);
  const input = document.querySelector('.edit-input:last-of-type');
  input?.setAttribute('data-original', text);
  input?.focus();
  input?.select();
}



function handleSubtaskDelete(subtask) {
  const listItem = subtask.target.closest('.subtask-edit-box__delete-img')?.closest('li');
  if (listItem) listItem.remove();
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
  const result = {};
  items.forEach((li, i) => {
    const value = (li.textContent || '').replace('•', '').trim();
    if (value) result[`subtask${i}`] = { task: value, taskChecked: false };
  });
  return result;
}
