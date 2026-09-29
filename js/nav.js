/**
 * nav.js — Navigation module
 * - Fetches partials/nav.html and injects it into #nav-placeholder
 * - Sets aria-current="page" on the nav link matching the current page
 * - Wires up language switcher buttons and mobile burger menu
 */

import { applyLang, getCurrentLang } from './i18n.js';

/**
 * Fetches partials/nav.html and injects it into #nav-placeholder.
 * Returns a promise that resolves once the nav is in the DOM.
 */
async function loadNav() {
  const placeholder = document.getElementById('nav-placeholder');
  if (!placeholder) return;

  try {
    const res = await fetch('./partials/nav.html');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    placeholder.outerHTML = html;
  } catch (err) {
    console.error('[nav] Failed to load nav partial:', err);
    showNavFallbackPopup();
  }
}

/**
 * Shows a fallback popup proposing to download the full PDF portfolio
 * if the navigation fails to load (e.g. CORS error opening file locally).
 */
function showNavFallbackPopup() {
  const isFr = navigator.language.startsWith('fr');
  const title = isFr ? "⚠️ Erreur de chargement" : "⚠️ Loading Error";
  const text = isFr 
    ? "La navigation n'a pas pu être chargée (probablement car vous ouvrez ce fichier en local sans serveur). Veuillez télécharger mon portfolio complet au format PDF." 
    : "Navigation failed to load (likely because you opened this file locally without a server). Please download my full portfolio as a PDF instead.";
  const btnText = isFr ? "Télécharger le Portfolio" : "Download Portfolio";
  const pdfUrl = "./assets/Portfolio_Fallback.pdf"; // Fallback URL (user can edit this)

  const div = document.createElement('div');
  div.style.cssText = 'position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); background:#0f1322; padding:2rem; border:1px solid rgba(255,255,255,0.1); z-index:9999; border-radius:12px; text-align:center; color:#f0f4ff; box-shadow:0 12px 40px rgba(0,0,0,0.5); max-width:90vw; width:400px;';
  div.innerHTML = `
    <h3 style="margin-bottom:1rem; color:#fff; font-size:1.4rem;">${title}</h3>
    <p style="margin-bottom:1.5rem; line-height:1.5; color:#7a85a3;">${text}</p>
    <a href="${pdfUrl}" download style="display:inline-block; background:#6d4aff; color:#fff; padding:0.8rem 1.5rem; text-decoration:none; border-radius:8px; font-weight:600; transition:opacity 0.2s;">${btnText}</a>
  `;
  document.body.appendChild(div);
}

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
 */
function initLangSwitcher() {
  const switcher = document.querySelector('.lang-switcher');
  if (!switcher) return;

  const toggle = () => {
    applyLang(getCurrentLang() === 'en' ? 'fr' : 'en');
  };

  switcher.addEventListener('click', toggle);
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

  switcher.querySelectorAll('.lang-btn').forEach((btn) => {
    btn.setAttribute('tabindex', '-1');
    btn.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Wires the burger menu toggle for mobile viewports.
 */
function initMobileMenu() {
  const toggleBtn = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  if (!toggleBtn || !navLinks) return;

  const updateAriaLabel = () => {
    const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
    const lang = getCurrentLang();
    const label = lang === 'fr'
      ? (isExpanded ? 'Fermer le menu' : 'Ouvrir le menu')
      : (isExpanded ? 'Close menu' : 'Open menu');
    toggleBtn.setAttribute('aria-label', label);
    toggleBtn.setAttribute('title', label);
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
    toggleBtn.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('is-open')) {
      if (!navLinks.contains(e.target) && !toggleBtn.contains(e.target)) closeMenu();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
      closeMenu();
      toggleBtn.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('is-open')) closeMenu();
  });

  document.addEventListener('langchange', updateAriaLabel);
  updateAriaLabel();
}

/**
 * Initialises navigation: loads partial, sets active link,
 * wires lang switcher and mobile menu.
 * Must be awaited so i18n runs after the nav is in the DOM.
 */
export async function initNav() {
  await loadNav();
  setActiveNavLink();
  initLangSwitcher();
  initMobileMenu();
}
