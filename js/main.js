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
  // 0. Initialize theme (light/dark mode) and accessibility
  initTheme();
  initA11y();

  // 1. Start circuit background animation
  initCircuitBg();

  // 1.5 Inject nav partial first so its data-i18n elements are in the DOM
  await initNav();
  
  // 1.6 Init settings modal UI (after nav is loaded)
  initSettingsUI();

  // 2. Load translations & apply language to the full page (including nav)
  const translations = await initI18n('en', './data/translations.json');

  // 3. Wire card modals (pages that have [data-modal] cards)
  if (translations) {
    initModals(translations);

    // Re-wire after language switch
    document.addEventListener('langchange', () => initModals(translations));
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
