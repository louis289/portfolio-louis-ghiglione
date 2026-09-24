/**
 * main.js — Portfolio entry point
 * Handles: tab navigation, language switching, map init
 */

import { initI18n, applyLang } from './i18n.js';
import { initMap } from './map.js';

// ── Constants ─────────────────────────────────────────────────

const TABS = ['welcome', 'projects', 'career', 'mobility', 'passions', 'civic'];

// ── Tab Navigation ────────────────────────────────────────────

/**
 * Activates a tab section and updates nav aria state.
 * Initializes the Leaflet map lazily when mobility tab is first shown.
 * @param {string} tabId
 */
function showTab(tabId) {
  if (!TABS.includes(tabId)) return;

  // Sections
  document.querySelectorAll('.tab-section').forEach((section) => {
    section.classList.remove('is-active');
    section.setAttribute('aria-hidden', 'true');
  });

  const target = document.getElementById(`tab-${tabId}`);
  if (target) {
    target.classList.add('is-active');
    target.removeAttribute('aria-hidden');
  }

  // Nav links
  document.querySelectorAll('.nav-link[data-tab]').forEach((link) => {
    const isActive = link.dataset.tab === tabId;
    link.setAttribute('aria-current', isActive ? 'page' : 'false');
  });

  // Lazy-init Leaflet map on first visit to Mobility tab
  if (tabId === 'mobility') {
    // Small delay to ensure the section is visible before Leaflet measures the container
    setTimeout(initMap, 50);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Bootstrap ─────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', async () => {
  // Init i18n first (loads JSON + renders EN text)
  await initI18n('en');

  // Show default tab after translations are applied
  showTab('welcome');

  // Nav tab links
  document.querySelectorAll('.nav-link[data-tab]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      showTab(link.dataset.tab);
    });
  });

  // Hero CTA
  document.getElementById('hero-cta')?.addEventListener('click', () => {
    showTab('career');
  });

  // Language switcher
  document.querySelectorAll('.lang-btn[data-lang]').forEach((btn) => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });
});
