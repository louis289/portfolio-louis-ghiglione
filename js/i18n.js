/**
 * i18n.js — Internationalisation module
 * Loads translations.json and exposes applyLang()
 */

/** @type {Record<string, object>} */
let translations = {};

/** @type {'en' | 'fr'} */
let currentLang = 'en';

/**
 * Resolves a dot-separated key path against an object.
 * @param {object} obj
 * @param {string} keyPath  e.g. "nav.welcome"
 * @returns {string}
 */
function resolve(obj, keyPath) {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
}

/**
 * Applies the given language to all data-i18n / data-i18n-html elements.
 * @param {'en' | 'fr'} lang
 */
export function applyLang(lang) {
  const t = translations[lang];
  if (!t) {
    console.warn(`[i18n] Language "${lang}" not found.`);
    return;
  }

  currentLang = lang;
  document.documentElement.lang = lang;

  // Plain text nodes
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = resolve(t, el.dataset.i18n);
    if (value) el.textContent = value;
  });

  // HTML nodes (e.g. <br/> in hero title)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const value = resolve(t, el.dataset.i18nHtml);
    if (value) el.innerHTML = value;
  });

  // Update lang button states
  document.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });
}

/**
 * Returns the currently active language.
 * @returns {'en' | 'fr'}
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Loads translations.json and applies the default language.
 * @param {'en' | 'fr'} [defaultLang='en']
 */
export async function initI18n(defaultLang = 'en') {
  try {
    const response = await fetch('translations.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
    applyLang(defaultLang);
  } catch (err) {
    console.error('[i18n] Failed to load translations:', err);
  }
}
