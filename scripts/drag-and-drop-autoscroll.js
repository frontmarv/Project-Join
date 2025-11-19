// ======================================================
// 🔹 DRAG & DROP AUTOSCROLL MODULE
// ======================================================
// Beinhaltet die komplette Auto-Scroll Engine:
//
// - Automatisches horizontales Scrollen (mobile)
// - Automatisches vertikales Scrollen (mobile & desktop)
// - Berechnung der Scroll-Geschwindigkeit
// - Erkennen der passenden Scroll-Container
// - Intervallbasierte Scroll-Updates während des Drags
// ======================================================

// ======================================================
// 🔹 INTERNAL AUTO-SCROLL STATE
// ======================================================

/**
 * Interval handle for auto-scrolling.
 * @type {number|null}
 */
let autoScrollInterval = null;

/**
 * Last pointer event (needed to update hover column during autoscroll).
 * @type {PointerEvent|null}
 */
let lastPointerEvent = null;

/**
 * Edge threshold in px where scrolling starts.
 * @type {number}
 */
const AUTO_SCROLL_EDGE = 60;

/**
 * Maximum scroll speed.
 * @type {number}
 */
const AUTO_SCROLL_SPEED_MAX = 18;

/**
 * Minimum enforced scroll speed.
 * @type {number}
 */
const AUTO_SCROLL_SPEED_MIN = 4;

/**
 * Current auto-scroll state object.
 */
const autoScrollState = {
  hSpeed: 0,
  vSpeed: 0,
  hContainer: null,
  vContainer: null,
};



// ======================================================
// 🔹 MAIN AUTO-SCROLL ENGINE
// ======================================================

/**
 * Main autoscroll handler. Called on pointermove.
 * @param {PointerEvent} event - Current pointer event.
 * @returns {void}
 */
function handleAutoScroll(event) {
  if (!isDragging) return stopAutoScroll();

  const hContainer = isMobileDragMode() ? getHorizontalScrollContainer() : null;
  const vContainer = getVerticalScrollContainer();

  if (!hContainer && !vContainer) return stopAutoScroll();

  const { hSpeed, vSpeed } = calculateScrollSpeeds(event, hContainer, vContainer);

  updateAutoScrollState(hSpeed, vSpeed, hContainer, vContainer);

  if (!hSpeed && !vSpeed) return stopAutoScroll();

  startAutoScroll();
}


/**
 * Calculates autoscroll speeds horizontally and vertically.
 * @param {PointerEvent} event
 * @param {HTMLElement|null} hContainer
 * @param {HTMLElement|null} vContainer
 * @returns {{hSpeed:number, vSpeed:number}}
 */
function calculateScrollSpeeds(event, hContainer, vContainer) {
  const { clientX: x, clientY: y } = event;
  let hSpeed = hContainer ? computeHorizontalSpeed(x, hContainer) : 0;
  let vSpeed = vContainer ? computeVerticalSpeed(y, vContainer) : 0;
  return { hSpeed, vSpeed };
}


/**
 * Computes horizontal scroll intensity based on pointer position.
 * @param {number} x - Pointer X.
 * @param {HTMLElement} hContainer
 * @returns {number}
 */
function computeHorizontalSpeed(x, hContainer) {
  const rect = hContainer.getBoundingClientRect();
  const distLeft = x - rect.left;
  const distRight = rect.right - x;

  if (distLeft < AUTO_SCROLL_EDGE) {
    return -scrollIntensity(distLeft);
  }
  if (distRight < AUTO_SCROLL_EDGE) {
    return scrollIntensity(distRight);
  }
  return 0;
}


/**
 * Computes vertical scroll intensity based on pointer Y.
 * @param {number} y
 * @param {HTMLElement} vContainer
 * @returns {number}
 */
function computeVerticalSpeed(y, vContainer) {
  const { distTop, distBottom } = computeVerticalDistances(y, vContainer);

  if (distTop < AUTO_SCROLL_EDGE) {
    return -scrollIntensity(distTop);
  }
  if (distBottom < AUTO_SCROLL_EDGE) {
    return scrollIntensity(distBottom);
  }
  return 0;
}


/**
 * Computes distances from pointer to top/bottom edges of container.
 * @param {number} y
 * @param {HTMLElement} container
 * @returns {{distTop:number, distBottom:number}}
 */
function computeVerticalDistances(y, container) {
  const isDoc =
    container === document.scrollingElement ||
    container === document.documentElement ||
    container === document.body;

  if (isDoc) {
    return { distTop: y, distBottom: window.innerHeight - y };
  }

  const rect = container.getBoundingClientRect();
  return { distTop: y - rect.top, distBottom: rect.bottom - y };
}


/**
 * Computes scroll intensity given distance to scroll edge.
 * @param {number} distance
 * @returns {number}
 */
function scrollIntensity(distance) {
  const intensity = 1 - Math.max(distance, 0) / AUTO_SCROLL_EDGE;
  return Math.max(AUTO_SCROLL_SPEED_MIN, AUTO_SCROLL_SPEED_MAX * intensity);
}


/**
 * Updates auto-scroll state to current speeds and containers.
 * @param {number} hSpeed
 * @param {number} vSpeed
 * @param {HTMLElement|null} hContainer
 * @param {HTMLElement|null} vContainer
 * @returns {void}
 */
function updateAutoScrollState(hSpeed, vSpeed, hContainer, vContainer) {
  autoScrollState.hSpeed = hSpeed;
  autoScrollState.vSpeed = vSpeed;
  autoScrollState.hContainer = hContainer;
  autoScrollState.vContainer = vContainer;
}


// ======================================================
// 🔹 SCROLL CONTAINER DETECTION
// ======================================================

/**
 * Returns the horizontal scroll container for mobile.
 * @returns {HTMLElement|null}
 */
function getHorizontalScrollContainer() {
  if (!placeholder) return null;
  return placeholder.closest(".tasks");
}


/**
 * Returns vertical scroll container (mobile OR desktop).
 * @returns {HTMLElement|null}
 */
function getVerticalScrollContainer() {
  if (isMobileDragMode()) {
    return getMobileVerticalContainer();
  }

  const col = getColumnVerticalContainer();
  if (col) return col;

  return getBoardOrDocumentContainer();
}


/**
 * Column scroll container (desktop).
 * @returns {HTMLElement|null}
 */
function getColumnVerticalContainer() {
  if (!placeholder) return null;
  const col = placeholder.closest(".tasks");
  return isScrollable(col) ? col : null;
}


/**
 * Returns scroll container for board OR entire document.
 * @returns {HTMLElement}
 */
function getBoardOrDocumentContainer() {
  const board = document.querySelector(".board-content");
  if (isScrollable(board)) return board;
  return document.scrollingElement || document.documentElement;
}


/**
 * Returns true if element is scrollable.
 * @param {HTMLElement|null} element
 * @returns {boolean}
 */
function isScrollable(element) {
  return element && element.scrollHeight > element.clientHeight + 1;
}


// ======================================================
// 🔹 SCROLL INTERVAL ENGINE
// ======================================================

/**
 * Starts autoscroll loop if not already running.
 * @returns {void}
 */
function startAutoScroll() {
  if (autoScrollInterval) return;

  autoScrollInterval = setInterval(() => {
    if (!isDragging) return stopAutoScroll();

    performHorizontalScroll();
    performVerticalScroll();
    updateHoverColumnIfNeeded();
  }, 16); // ≈ 60 FPS
}


/**
 * Applies horizontal scrolling.
 * @returns {void}
 */
function performHorizontalScroll() {
  const { hContainer, hSpeed } = autoScrollState;
  if (hContainer && hSpeed) {
    hContainer.scrollLeft += hSpeed;
  }
}


/**
 * Applies vertical scrolling.
 * @returns {void}
 */
function performVerticalScroll() {
  const { vContainer, vSpeed } = autoScrollState;
  if (!vContainer || !vSpeed) return;

  const isDoc =
    vContainer === document.scrollingElement ||
    vContainer === document.documentElement ||
    vContainer === document.body;

  if (isDoc) {
    window.scrollBy(0, vSpeed);
  } else {
    vContainer.scrollTop += vSpeed;
  }
}


/**
 * Updates column hover detection after autoscroll.
 * @returns {void}
 */
function updateHoverColumnIfNeeded() {
  if (draggedTask && lastPointerEvent) {
    updateHoverColumn(lastPointerEvent);
  }
}


/**
 * Stops autoscroll and clears state.
 * @returns {void}
 */
function stopAutoScroll() {
  if (autoScrollInterval) {
    clearInterval(autoScrollInterval);
    autoScrollInterval = null;
  }

  autoScrollState.hSpeed = 0;
  autoScrollState.vSpeed = 0;
  autoScrollState.hContainer = null;
  autoScrollState.vContainer = null;
}

document.addEventListener("pointerup", stopAutoScroll);
document.addEventListener("pointercancel", stopAutoScroll);
