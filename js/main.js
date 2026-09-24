/**
 * main.js — Application entry point
 * Bootstraps i18n and navigation on every page.
 * Dynamically imports the map module only on the mobility page.
 */

import { initI18n } from './i18n.js';
import { initNav }  from './nav.js';

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Load translations & restore saved language
  await initI18n('en', './data/translations.json');

  // 2. Set active nav link + wire lang switcher
  initNav();

  // 3. Lazy-load Leaflet map only on the mobility page
  if (document.body.dataset.page === 'mobility') {
    const { initMap } = await import('./map.js');
    // Small delay ensures the section is painted before Leaflet measures it
    setTimeout(initMap, 50);
  }
});
