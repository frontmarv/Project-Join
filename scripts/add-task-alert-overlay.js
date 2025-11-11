

/**
 * Displays the confirmation overlay after task creation.
 */
function showAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.remove("d-none");
}


/**
 * Closes the confirmation overlay and reloads the page.
 */
function closeAlertOverlay() {
  const overlay = document.getElementById("alert-overlay");
  overlay.classList.add("d-none");
  window.location.reload();
}