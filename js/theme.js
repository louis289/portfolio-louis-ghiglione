/**
 * theme.js — Theme Management
 * Handles dark/light mode based on URL parameters, localStorage, and system preference.
 */

import { updateUrlParam } from './settings.js';

export function initTheme() {
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  const storedTheme = localStorage.getItem('portfolio-theme');
  const prefersLight = window.matchMedia('(prefers-color-scheme: light)');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);
    updateUrlParam('theme', theme);
    
    // Dispatch an event so circuit-bg can redraw if necessary
    window.dispatchEvent(new Event('themechange'));
  }

  // 1. URL Param overrides everything
  if (themeParam === 'light' || themeParam === 'dark') {
    setTheme(themeParam);
  } 
  // 2. Then localStorage
  else if (storedTheme === 'light' || storedTheme === 'dark') {
    setTheme(storedTheme);
  } 
  // 3. Then System Preference
  else if (prefersLight.matches) {
    setTheme('light');
  } 
  // Default is dark
  else {
    setTheme('dark');
  }

  // Listen to system changes
  prefersLight.addEventListener('change', (e) => {
    // Only auto-switch if user hasn't explicitly set a preference via URL
    if (!urlParams.get('theme')) {
        setTheme(e.matches ? 'light' : 'dark');
    }
  });

  // Handle theme change requests from settings modal
  window.addEventListener('request-theme', (e) => {
    setTheme(e.detail);
  });
}
