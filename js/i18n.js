/**
 * i18n.js — Internationalisation module
 * - Loads translations from a JSON file
 * - Persists language choice in localStorage
 * - Exposes: initI18n(), applyLang(), getCurrentLang()
 */

const STORAGE_KEY = 'portfolio-lang';

/** @type {Record<string, object>} */
let translations = {};

/** @type {'en' | 'fr'} */
let currentLang = 'en';

/**
 * Resolves a dot-separated key against a nested object.
 * Returns empty string if not found.
 * @param {object} obj
 * @param {string} keyPath  e.g. "nav.welcome"
 * @returns {string}
 */
function resolve(obj, keyPath) {
  return keyPath.split('.').reduce((acc, key) => acc?.[key], obj) ?? '';
}

/**
 * Applies the given language to all [data-i18n] and [data-i18n-html] elements.
 * Updates lang buttons and persists choice to localStorage.
 * @param {'en' | 'fr'} lang
 */
export function applyLang(lang) {
  const t = translations[lang];
  if (!t) {
    console.warn(`[i18n] Language "${lang}" not found in translations.`);
    return;
  }

  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem(STORAGE_KEY, lang);

  // Plain text nodes
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = resolve(t, el.dataset.i18n);
    if (value) el.textContent = value;
  });

  // HTML nodes (needed for <br> in hero title)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const value = resolve(t, el.dataset.i18nHtml);
    if (value) el.innerHTML = value;
  });

  // Update lang button active state + aria
  document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
    const isActive = btn.dataset.lang === lang;
    btn.classList.toggle('is-active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  // Update switcher title / aria-label indicating toggle target
  const switcher = document.querySelector('.lang-switcher');
  if (switcher) {
    const nextLang = lang === 'en' ? 'fr' : 'en';
    const label = nextLang === 'fr' ? 'Passer en français' : 'Switch to English';
    switcher.setAttribute('aria-label', label);
    switcher.setAttribute('title', label);
  }

  // Notify other modules (e.g. map) that the language changed
  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

/**
 * Returns the currently active language code.
 * @returns {'en' | 'fr'}
 */
export function getCurrentLang() {
  return currentLang;
}

/**
 * Returns the translated string for a given keyPath in the current language.
 * @param {string} keyPath
 * @returns {string}
 */
export function t(keyPath) {
  return resolve(translations[currentLang], keyPath) || '';
}

/**
 * Loads translations.json, restores saved language from localStorage,
 * and applies it. Falls back to `defaultLang` if no saved preference.
 * @param {'en' | 'fr'} [defaultLang='en']
 * @param {string} [translationsPath='./data/translations.json']
 */
export async function initI18n(defaultLang = 'en', translationsPath = './data/translations.json') {
  try {
    const response = await fetch(translationsPath);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    translations = await response.json();
  } catch (err) {
    console.error('[i18n] Failed to load translations:', err);
    return;
  }

  const savedLang = localStorage.getItem(STORAGE_KEY);
  const lang = (savedLang in translations) ? savedLang : defaultLang;
  applyLang(lang);
}
