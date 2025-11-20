/**
 * Generates a required field validation message.
 * Displays error message for empty required form fields.
 * @returns {string} HTML string containing required field validation span element
 */
function getFieldRequiredInfo() {
    return /*html*/ `<span id="required-mobile" class="required required--before"> This field is required</span>`
}

function getAlertMsgTpl() {
  return /*html*/ `
      <div>
        <h2 id="alert-message">Task added to board!</h2>
      </div>
    `;
}

function getAlertDlgButtons() {
  return /*html*/ `
      <div class="alert-buttons">
        <button id="alert-ok" class="empty-btn" onclick="closeAddTaskDlgWithAnimation()">Add more tasks</button>
        <button id="alert-board" class="filled-btn" onclick="goToBoard()">Go to Board</button>
      </div>
    `;
}