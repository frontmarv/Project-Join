// ======================================================
// 🔹 DRAG & DROP MAIN ENTRY FILE
// ======================================================
// Diese Datei dient nur als Einstiegspunkt.
//
// Alle Logik befindet sich in folgenden Modulen:
//  - drag-and-drop-core.js
//  - drag-and-drop-pointer.js
//  - drag-and-drop-mobile.js
//  - drag-and-drop-autoscroll.js
//  - drag-and-drop-placeholders.js
//
// Diese Datei stellt sicher, dass das Drag & Drop System
// korrekt initialisiert wird.
// ======================================================


/**
 * Initializes the full Drag and Drop system.
 * This is called automatically after all module scripts load.
 * @returns {void}
 */
document.addEventListener("DOMContentLoaded", () => {
  initDragAndDrop();
});
