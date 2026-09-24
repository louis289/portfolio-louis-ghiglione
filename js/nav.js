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
 * Wires the burger menu toggle for mobile viewports.
 * Manages aria-expanded, click-outside, and ESC key.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggleBtn || !navLinks) return;

  const updateAriaLabel = () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const lang = getCurrentLang();
    if (lang === 'fr') {
      const label = isExpanded ? 'Fermer le menu' : 'Ouvrir le menu';
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    } else {
      const label = isExpanded ? 'Close menu' : 'Open menu';
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }
  };

  const closeMenu = () => {
    toggleBtn.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    updateAriaLabel();
  };

  const openMenu = () => {
    toggleBtn.setAttribute('aria-expanded', 'true');
    navLinks.classList.add('is-open');
    updateAriaLabel();
  };

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when clicking any nav link
  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside the nav
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open')) {
      if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) {
        closeMenu();
      }
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  // Close automatically if viewport resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Update label on language change
  document.addEventListener('langchange', updateAriaLabel);
  updateAriaLabel();
}

/**
 * Initialises navigation: active link + lang switcher + mobile menu.
 * Call after initI18n() so button text is already translated.
 */
export function initNav() {
  setActiveNavLink();
  initLangSwitcher();
  initMobileMenu();
}
