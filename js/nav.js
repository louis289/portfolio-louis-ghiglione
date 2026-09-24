/**
 * nav.js — Navigation module
 * - Sets aria-current="page" on the nav link matching the current page
 * - Wires up language switcher buttons
 */

import { applyLang, getCurrentLang } from './i18n.js';

/**
 * Reads the current page identifier from <body data-page="...">.
 * Sets aria-current="page" on the matching .nav-link[data-page].
 */
function setActiveNavLink() {
  const currentPage = document.body.dataset.page;
  if (!currentPage) return;

  document.querySelectorAll('.nav-link[data-page]').forEach((link) => {
    const isActive = link.dataset.page === currentPage;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });
}

/**
 * Wires the .lang-switcher container as a single EN↔FR toggle.
 * Clicking anywhere on the zone (either button or between them) toggles.
 * Keyboard: Enter / Space also toggle.
 */
function initLangSwitcher() {
  const switcher = document.querySelector('.lang-switcher');
  if (!switcher) return;

  const toggle = () => {
    applyLang(getCurrentLang() === 'en' ? 'fr' : 'en');
  };

  // Entire zone is clickable
  switcher.addEventListener('click', toggle);

  // Make the container keyboard-navigable as a single button
  switcher.setAttribute('tabindex', '0');
  switcher.setAttribute('role', 'button');
  const nextLang = getCurrentLang() === 'en' ? 'fr' : 'en';
  switcher.setAttribute('aria-label', nextLang === 'fr' ? 'Passer en français' : 'Switch to English');
  switcher.setAttribute('title', nextLang === 'fr' ? 'Passer en français' : 'Switch to English');

  switcher.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // Ensure inner buttons do not create duplicate tab stops
  switcher.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.setAttribute('tabindex', '-1');
    btn.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Initialises navigation: active link + lang switcher.
 * Call after initI18n() so button text is already translated.
 */
export function initNav() {
  setActiveNavLink();
  initLangSwitcher();
}
