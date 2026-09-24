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
 * Wires click events on .lang-btn[data-lang] buttons.
 */
function initLangSwitcher() {
  document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => {
      applyLang(btn.dataset.lang);
    });
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
