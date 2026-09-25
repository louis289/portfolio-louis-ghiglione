/**
 * main.js — Application entry point
 * Bootstraps i18n, navigation, and modal system on every page.
 */

import { initI18n } from './i18n.js';
import { initNav }  from './nav.js';
import { initModals } from './modal.js';

/** Tries to init the Leaflet map; safe to call multiple times. */
async function tryInitMap() {
  const { initMap } = await import('./map.js');
  initMap();
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load translations & restore saved language
  const translations = await initI18n('en', './data/translations.json');

  // 2. Set active nav link + wire lang switcher
  initNav();

  // 3. Wire card modals (pages that have [data-modal] cards)
  if (translations) {
    initModals(translations);

    // Re-wire after language switch
    document.addEventListener('langchange', () => initModals(translations));
  }

  // 4. Init Leaflet map only on the mobility page
  if (document.body.dataset.page === 'mobility') {
    await tryInitMap();
    window.addEventListener('load', tryInitMap, { once: true });
  }
});
