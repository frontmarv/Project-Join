// ======================================================
// 🔹 MAIL TLD VALIDATOR
// ======================================================
// Fetches and caches IANA TLDs, validates email syntax + TLD,
// and provides live input feedback.
// ======================================================


// ======================================================
// 🔹 CONSTANTS & FALLBACK
// ======================================================

const IANA_URL = "https://data.iana.org/TLD/tlds-alpha-by-domain.txt";
const CACHE_KEY = "iana_tlds";
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const FALLBACK_TLDS = ["com", "net", "org", "de", "io", "app"];

if (window.location.pathname === '/pages/sign-up.html') {
  initEmailValidation();
}
// ======================================================
// 🔹 FETCHING TLD DATA
// ======================================================

/**
 * Fetches the latest TLD list from the IANA registry.
 * @async
 * @returns {Promise<string[]>} Array of valid TLDs in lowercase.
 */
async function fetchTlds() {
  try {
    const response = await fetch(IANA_URL);
    if (!response.ok) throw new Error("IANA fetch failed");
    const text = await response.text();
    return text
      .split("\n")
      .filter(line => line && !line.startsWith("#"))
      .map(line => line.toLowerCase());
  } catch {
    return FALLBACK_TLDS;
  }
}


// ======================================================
// 🔹 CACHE MANAGEMENT
// ======================================================

/**
 * Saves a TLD list to localStorage with a timestamp.
 * @param {string[]} tlds - List of TLDs to cache.
 */
function saveTldsToCache(tlds) {
  const data = { tlds, time: Date.now() };
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}


/**
 * Retrieves cached TLDs if they are still valid.
 * @returns {string[]|null} Cached TLDs or null if expired.
 */
function getCachedTlds() {
  const cache = localStorage.getItem(CACHE_KEY);
  if (!cache) return null;
  const { tlds, time } = JSON.parse(cache);
  return Date.now() - time < CACHE_TTL ? tlds : null;
}


/**
 * Loads TLDs either from cache or from the IANA list.
 * @async
 * @returns {Promise<string[]>} Valid TLD list.
 */
async function loadTlds() {
  const cached = getCachedTlds();
  if (cached) return cached;
  const latestTlds = await fetchTlds();
  saveTldsToCache(latestTlds);
  return latestTlds;
}


// ======================================================
// 🔹 EMAIL VALIDATION LOGIC
// ======================================================

/**
 * Validates an email address for syntax and TLD correctness.
 * @async
 * @param {string} email - Email address to validate (max 254 characters per RFC 5321).
 * @returns {Promise<boolean>} True if valid, false otherwise.
 */
async function isValidEmail(email) {
  const MAX_EMAIL_LENGTH = 60;
  if (!email || email.length > MAX_EMAIL_LENGTH) return false;
  const tlds = await loadTlds();
  const regex = /^[^\s@]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
  if (!regex.test(email)) return false;
  const tld = email.split(".").pop().toLowerCase();
  return tlds.includes(tld);
}


// ======================================================
// 🔹 LIVE VALIDATION (UI INTERACTION)
// ======================================================

/**
 * Initializes live email validation on input field.
 */
function initEmailValidation() {
  const email = document.getElementById("email");
  const msg = document.getElementById("msg");
  const validEmail = document.getElementById("valid-email");
  bindEmailInputHandler(email, msg, validEmail);
}


/**
 * Binds the input event listener for live email validation.
 * @param {HTMLInputElement} email - Email input element.
 * @param {HTMLElement} msg - Message display element.
 * @param {HTMLElement} validEmail - Validation wrapper element.
 */
function bindEmailInputHandler(email, msg, validEmail) {
  email.addEventListener("input", async () => {
    const value = email.value.trim();
    if (!value) return resetEmailValidationUI(validEmail, msg);
    await handleEmailValidation(value, validEmail, msg);
  });
}


/**
 * Resets the email input UI when empty.
 * @param {HTMLElement} validEmail - Validation wrapper element.
 * @param {HTMLElement} msg - Message display element.
 */
function resetEmailValidationUI(validEmail, msg) {
  validEmail.style.border = "";
  msg.style.display = "none";
}


/**
 * Validates the email and updates UI accordingly.
 * @async
 * @param {string} value - Current input value.
 * @param {HTMLElement} validEmail - Validation wrapper element.
 * @param {HTMLElement} msg - Message display element.
 */
async function handleEmailValidation(value, validEmail, msg) {
  const valid = await isValidEmail(value);
  formState.isEmailValid = valid;
  evaluateFormValidity();
  updateEmailValidationUI(valid, validEmail, msg);
}


/**
 * Updates the visual feedback for email validity.
 * @param {boolean} valid - Whether the email is valid.
 * @param {HTMLElement} validEmail - Validation wrapper element.
 * @param {HTMLElement} msg - Message display element.
 */
function updateEmailValidationUI(valid, validEmail, msg) {
  validEmail.style.border = valid
    ? "2px solid var(--color-success)"
    : "2px solid var(--color-error)";
  msg.style.display = valid ? "none" : "inline";
}
