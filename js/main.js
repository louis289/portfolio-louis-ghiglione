/**
 * main.js — Application entry point
 * Bootstraps i18n, navigation, and modal system on every page.
 */

import { initI18n }      from './i18n.js';
import { initNav }       from './nav.js';
import { initModals }    from './modal.js';
import { initCircuitBg } from './theme-3ea.js';
import { initTilt }      from './tilt.js';
import { initTheme }     from './theme.js';
import { initSettingsUI } from './settings.js';
import { initA11y }      from './a11y.js';
import { initPdfGenerator } from './pdf-generator.js';
import { renderDynamicContent } from './renderer.js';
import { initLuminanceEngine, evaluateLuminance } from './luminance.js';
import { initContactExport } from './contact-export.js';

/** Tries to init the Leaflet map; safe to call multiple times. */
async function tryInitMap() {
  const { initMap } = await import('./map.js');
  initMap();
}

/** Initializes the card filtering logic (ongoing/past/all) */
function initFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  if (filterBtns.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      document.querySelectorAll('.card[data-status]').forEach(card => {
        if (filter === 'all' || card.dataset.status === filter) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  // 0. Initialize theme (light/dark mode), luminance engine and accessibility
  initTheme();
  initLuminanceEngine();
  initA11y();

  // 1. Start circuit background animation
  initCircuitBg();

  // 1.5 Inject nav partial first so its data-i18n elements are in the DOM
  await initNav();
  
  // 1.6 Init settings modal UI and contact long-press export (after nav is loaded)
  initSettingsUI();
  initContactExport();
  initPdfGenerator();

  // 2. Load translations & apply language to the full page (including nav)
  const translations = await initI18n('en', './data/translations.json');

  function renderPageDynamicData() {
    const lang = localStorage.getItem('site_lang') || (new URLSearchParams(window.location.search).get('lang')) || 'en';
    renderDynamicContent(translations[lang], translations);
    initModals(translations); // Wire up the newly created modals
    evaluateLuminance(); // Recalculate contrast for newly injected cards
  }

  // 3. Wire card modals & Render dynamic arrays
  if (translations) {
    renderPageDynamicData();

    // Re-wire after language switch
    document.addEventListener('langchange', renderPageDynamicData);
  }

  // 4. Initialize filters (if any on page)
  initFilters();

  // 5. Init Leaflet map only on the mobility page
  if (document.body.dataset.page === 'mobility') {
    await tryInitMap();
    window.addEventListener('load', tryInitMap, { once: true });
  }

  // 6. Init 3D tilt on contact page
  if (document.body.dataset.page === 'contact') {
    initTilt();
  }
});
