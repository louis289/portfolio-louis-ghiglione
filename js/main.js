/**
 * main.js — Application entry point
 * Bootstraps i18n and navigation on every page.
 * Dynamically imports the map module only on the mobility page.
 */

import { initI18n } from './i18n.js';
import { initNav }  from './nav.js';

/** Tries to init the Leaflet map; safe to call multiple times. */
async function tryInitMap() {
  const { initMap } = await import('./map.js');
  initMap();
}

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load translations & restore saved language
  await initI18n('en', './data/translations.json');

  // 2. Set active nav link + wire lang switcher
  initNav();

  // 3. Init Leaflet map only on the mobility page
  if (document.body.dataset.page === 'mobility') {
    // Try immediately (container already in DOM)
    await tryInitMap();
    // Also retry on full load in case resources weren't ready
    window.addEventListener('load', tryInitMap, { once: true });
  }
});
