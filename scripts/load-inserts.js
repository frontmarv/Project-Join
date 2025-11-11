// ======================================================
// 🔹 INSERT LOADER MODULE
// ======================================================

/**
 * InsertLoader
 * -------------
 * Automatically loads HTML inserts (e.g., header/footer) into elements with [data-insert].
 * Uses MemoryCache + LocalStorage for performance optimization.
 * Supports background revalidation (stale-while-revalidate).
 */
const InsertLoader = (() => {

  // ======================================================
  // 🔹 CONSTANTS & CACHE SETUP
  // ======================================================

  /** @constant {string} CACHE_KEY - LocalStorage key for cached inserts */
  const CACHE_KEY = "html_insert_cache";

  /** @constant {number} CACHE_TTL_MS - Cache lifetime in milliseconds (24 hours) */
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  /** @type {Map<string, string>} - In-memory cache for inserts */
  const memoryCache = new Map();

  /** @type {Record<string, {html: string, timestamp: number, lastModified: string|null}>} */
  let localCache = loadLocalCache();


  // ======================================================
  // 🔹 CACHE MANAGEMENT
  // ======================================================

  /** Loads cache content from localStorage. */
  function loadLocalCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
    } catch {
      return {};
    }
  }


  /** Saves the current cache state to localStorage. */
  function saveLocalCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(localCache));
  }


  /**
   * Checks if a cache entry has expired.
   * @param {{timestamp: number}} entry - Cache entry with timestamp.
   * @returns {boolean} True if expired.
   */
  function isExpired(entry) {
    return !entry || Date.now() - entry.timestamp > CACHE_TTL_MS;
  }


  /** Clears both memory and local caches. */
  function clearCache() {
    localCache = {};
    memoryCache.clear();
    saveLocalCache();
    console.info("InsertLoader: Cache cleared");
  }


  // ======================================================
  // 🔹 FETCHING & UPDATING
  // ======================================================

  /**
   * Fetches HTML from a given URL.
   * @async
   * @param {string} url - Target file URL.
   * @param {"no-cache"|"reload"|"force-cache"} [mode="no-cache"] - Fetch cache mode.
   * @returns {Promise<string>} The HTML content.
   */
  async function fetchHTML(url, mode = "no-cache") {
    const response = await fetch(url, { cache: mode });
    if (!response.ok) throw new Error(`Failed to load ${url}: ${response.status}`);
    return await response.text();
  }


  /**
   * Stores fetched HTML content in both memory and local caches.
   * @param {string} url - Insert URL.
   * @param {string} html - HTML content.
   * @param {string|null} lastModified - Last-Modified header value.
   */
  function setCache(url, html, lastModified) {
    const cachedFile = { html, timestamp: Date.now(), lastModified };
    localCache[url] = cachedFile;
    memoryCache.set(url, html);
    saveLocalCache();
  }


  /**
   * Retrieves HTML from cache if valid and not expired.
   * @param {string} url - Insert URL.
   * @returns {string|null} Cached HTML or null if invalid.
   */
  function getCachedHTML(url) {
    const cachedFile = localCache[url];
    if (cachedFile && !isExpired(cachedFile)) {
      memoryCache.set(url, cachedFile.html);
      return cachedFile.html;
    }
    return null;
  }


  /**
   * Fetches and updates an insert, refreshing the cache.
   * @async
   * @param {string} url - Insert URL.
   * @param {HTMLElement} insertElement - Target DOM element.
   */
  async function updateInsert(url, insertElement) {
    try {
      const html = await fetchHTML(url);
      const lastModified = await getLastModified(url);
      setCache(url, html, lastModified);
      if (insertElement) insertElement.innerHTML = html;
    } catch (error) {
      console.error(error);
      if (insertElement) {
        insertElement.innerHTML = /*html*/ `
          <div style="color:red;">Error loading "${url}"</div>`;
      }
    }
  }


  // ======================================================
  // 🔹 BACKGROUND REFRESH
  // ======================================================

  /**
   * Checks for newer versions in the background and updates if needed.
   * @async
   * @param {string} url - Insert URL.
   */
  async function backgroundRefresh(url) {
    try {
      const lastModified = await getLastModified(url);
      const cached = localCache[url];
      if (!cached || cached.lastModified !== lastModified) {
        await updateInsert(url);
      }
    } catch (error) {
      console.warn(`Background refresh failed for ${url}`, error);
    }
  }


  /**
   * Retrieves the "Last-Modified" header value from a file.
   * @async
   * @param {string} url - Target file URL.
   * @returns {Promise<string|null>} Last modified date or null.
   */
  async function getLastModified(url) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-cache" });
      return res.headers.get("Last-Modified") || null;
    } catch {
      return null;
    }
  }


  // ======================================================
  // 🔹 MAIN INSERT LOADING LOGIC
  // ======================================================

  /**
   * Loads an insert either from cache or directly from the server.
   * @async
   * @param {string} url - Insert file URL.
   * @param {HTMLElement} insertElement - Target DOM element.
   */
  async function fetchInsert(url, insertElement) {
    const cached = getCachedHTML(url);
    if (cached) {
      insertElement.innerHTML = cached;
      backgroundRefresh(url);
    } else {
      await updateInsert(url, insertElement);
    }
  }


  /**
   * Finds and loads all elements with [data-insert].
   * @async
   */
  async function loadInserts() {
    const inserts = document.querySelectorAll("[data-insert]");
    await Promise.all(
      Array.from(inserts).map(insertElement => {
        const url = insertElement.getAttribute("data-insert");
        return fetchInsert(url, insertElement);
      })
    );
  }

  
  /**
   * Loads a single insert element by its [data-insert] attribute.
   * @async
   * @param {HTMLElement} insertElement - Target element.
   */
  async function loadInsertByElement(insertElement) {
    const url = insertElement.getAttribute("data-insert");
    if (url) await fetchInsert(url, insertElement);
  }


  // ======================================================
  // 🔹 PUBLIC API
  // ======================================================

  return {
    loadInserts,
    clearCache,
    loadInsertByElement
  };

})();


// ======================================================
// 🔹 AUTO INITIALIZATION
// ======================================================

document.addEventListener("DOMContentLoaded", InsertLoader.loadInserts);
