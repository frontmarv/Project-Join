/**
 * Determines whether the current page is the Board page.
 * @returns {boolean} True if the URL ends with "board.html".
 */
function isBoardPage() {
  return window.location.pathname.toLowerCase().endsWith("board.html");
}


/**
 * Opens the "Task Added" dialog with a fade-in animation.
 * If executed on the Board page, the dialog auto-closes after 2 seconds.
 * @returns {void}
 */
function showAddTaskDlgWtihAnimation() {
  alertOverlay.classList.remove('d-none');
  alertDialog.classList.remove('d-none', 'hide');

  setTimeout(() => {
    alertDialog.classList.add('show');
  }, 100);

  if (isBoardPage()) {
    setTimeout(() => {
      closeAddTaskDlgWithAnimation();
    }, 2000);
  }
}


/**
 * Closes the "Task Added" dialog with a fade-out animation.
 * When on the Board page, the board is re-initialized afterwards.
 * @returns {void}
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
 * Updates the alert dialog with "task added" content
 * and then displays the dialog with animation.
 * @returns {void}
 */
function showTaskAddedAlert() {
  alertDialog.innerHTML = getTaskAddDlg();
  alertDialog.classList.remove('hide');
  showAddTaskDlgWtihAnimation();
}


/**
 * Closes the board's own Add-Task dialog (overlay + dialog box)
 * if it is currently visible.
 * @returns {void}
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
 * Builds and returns the complete HTML markup for the
 * "Task added" alert dialog content.
 * On the Board page:
 *  - applies special CSS class
 *  - hides dialog buttons (auto-closes)
 * On other pages:
 *  - includes dialog action buttons
 * @returns {string} HTML markup for the alert dialog content.
 */
function getTaskAddDlg() {
  const onBoard = isBoardPage();
  const dlg = document.getElementById('alert-dlg-box');

  if (onBoard) {
    dlg.classList.remove('alert-dialog');
    dlg.classList.add('alert-msg-board');
  }
  const msg = getAlertMsgTpl();
  const btns = !onBoard ? getAlertDlgButtons() : "";
  return `${msg} ${btns}`;
}
