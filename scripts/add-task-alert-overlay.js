/**
 * Shows the "Task Added" alert dialog with a slide-in animation.
 * Removes the d-none class from the overlay and dialog, then
 * triggers the CSS animation by adding the "show" class.
 */
function showAddTaskDlgWtihAnimation() {
    alertOverlay.classList.remove('d-none');
    alertDialog.classList.remove('d-none', 'hide');
    
    setTimeout(() => {
        alertDialog.classList.add('show');
    }, 100);
}


/**
 * Closes the "Task Added" alert dialog with a slide-out animation.
 * After the animation completes, it hides the dialog and overlay.
 * If executed on the Board page, it automatically refreshes the task list
 * by calling `initBoard()`.
 */
function closeAddTaskDlgWithAnimation() {
    alertDialog.classList.remove('show');
    alertDialog.classList.add('hide');
    
    setTimeout(() => {
        alertDialog.classList.add('d-none');
        alertOverlay.classList.add('d-none');
        const path = window.location.pathname.toLowerCase();

        if (path.endsWith('board.html') && typeof initBoard === 'function') {
            initBoard();
        }
    }, 300);
}


/**
 * Renders and displays the "Task Added Successfully" alert dialog.
 * Injects the dialog HTML, ensures the correct classes are applied,
 * and triggers the opening animation.
 */
function showTaskAddedAlert() {
    alertDialog.innerHTML = getTaskAddDlg();
    alertDialog.classList.add('alert-overlay');
    alertDialog.classList.remove('hide');
    showAddTaskDlgWtihAnimation();
}


/**
 * Closes the board's Add Task dialog if it is currently open.
 * This prevents overlapping dialogs when the success alert appears.
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
 * Returns the HTML markup for the "Task Added Successfully" alert dialog.
 * The content adapts based on the page:
 * - On add-task.html: shows "OK" and "Go to Board" buttons.
 * - On board.html: shows only "OK".
 *
 * @returns {string} HTML string representing the alert dialog
 */
function getTaskAddDlg() {
    const onBoard = window.location.pathname.endsWith("board.html");
    return `
      <div class="alert-overlay">
        <h2 id="alert-message">Task added successfully!</h2>
        <div class="alert-buttons">
          <button id="alert-ok" onclick="closeAddTaskDlgWithAnimation()">OK</button>
          
          ${ onBoard 
              ? ""
              : `<button id="alert-board" onclick="goToBoard()">Go to Board</button>`
          }
        </div>
      </div>
    `;
}