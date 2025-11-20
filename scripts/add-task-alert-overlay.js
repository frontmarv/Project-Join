/**
 * Checks whether the current page is the Board page.
 *
 * @returns {boolean} True if the current URL ends with "board.html", otherwise false.
 */
function isBoardPage() {
  return window.location.pathname.toLowerCase().endsWith("board.html");
}


/**
 * Displays the "Task Added" alert dialog with a slide-in animation.
 * The overlay and dialog are unhidden and then animated in via CSS.
 *
 * On the Board page, the alert automatically closes after 2 seconds
 * to avoid requiring user interaction and to keep the workflow smooth.
 */
function showAddTaskDlgWtihAnimation() {
    alertOverlay.classList.remove('d-none');
    alertDialog.classList.remove('d-none', 'hide');
    
    setTimeout(() => {
        alertDialog.classList.add('show');
    }, 100);

    // if (isBoardPage()) {
    //   setTimeout(() => {
    //     closeAddTaskDlgWithAnimation();
    //   }, 2000);
    // }
}


/**
 * Closes the "Task Added" alert dialog with a slide-out animation.
 * After the animation ends, both dialog and overlay are hidden.
 *
 * When executed on the Board page, this function also triggers a
 * refresh of the task list by calling `initBoard()` so that the
 * newly created task becomes visible immediately.
 */
function closeAddTaskDlgWithAnimation() {
    alertDialog.classList.remove('show');
    alertDialog.classList.add('hide');
    
    setTimeout(() => {
        alertDialog.classList.add('d-none');
        alertOverlay.classList.add('d-none');
        
        if (isBoardPage() && typeof initBoard === 'function') {
            initBoard();
        }
    }, 500);
}


/**
 * Injects the alert dialog markup and shows the "Task Added" feedback overlay.
 * This function is triggered after successfully creating a task.
 */
function showTaskAddedAlert() {
    alertDialog.innerHTML = getTaskAddDlg();
    alertDialog.classList.add('alert-dialog');
    alertDialog.classList.remove('hide');
    showAddTaskDlgWtihAnimation();
}


/**
 * Closes the Board's Add-Task dialog if it is currently open.
 * Prevents visual overlapping when the "Task Added" alert appears on top.
 */
function closeBoardAddTaskDialogIfExists() {
    const boardOverlay = document.getElementById('overlay');
    const boardDialog  = document.getElementById('dlg-box');

    if (boardOverlay && boardDialog &&
        !boardOverlay.classList.contains('d-none')) {

        boardDialog.classList.add('d-none');
        boardOverlay.classList.add('d-none');
    }
}


/**
 * Generates the HTML markup for the "Task Added Successfully" alert dialog.
 *
 * Behavior:
 * - On add-task.html → shows both buttons:
 *     - "Add more tasks"
 *     - "Go to Board"
 * - On board.html → no buttons are rendered and the dialog receives a
 *     special CSS class ("alert-dialog-board") applied to
 *     the container element with ID "alert-dlg-box".
 *
 * Note:
 * This function both:
 *   1. Modifies DOM elements directly (adds a class to #alert-dlg-box)
 *   2. Returns an HTML string for the alert dialog markup
 *
 * @returns {string} HTML string containing the alert dialog structure.
 */
function getTaskAddDlg() {
    const onBoard = isBoardPage();
  if (onBoard) {
    document.getElementById('alert-dlg-box').classList.remove('alert-dialog');
    document.getElementById('alert-dlg-box').classList.add('alert-msg-board');
  }
    return /*html*/ `
      <div class="alert-overlay ${onBoard ? "alert-overlay-board" : ""}">
        <h2 id="alert-message">Task added to board</h2>
      <div class="alert-buttons ${onBoard ? "alert-buttons-board" : ""}">
          
      ${onBoard ? ""
                : /*html*/ `
                  <button id="alert-ok" class="empty-btn" onclick="closeAddTaskDlgWithAnimation()">Add more tasks</button>
                  <button id="alert-board" class="filled-btn" onclick="goToBoard()">Go to Board</button>
                  `}
        </div>
      </div>
    `;
}