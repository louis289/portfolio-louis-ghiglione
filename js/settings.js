/**
 * settings.js
 * Centralized handling of URL parameters for settings (theme, lang, a11y)
 */

import { propagateUrlParams } from './nav.js';

export function updateUrlParam(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.replaceState({}, '', url);
  propagateUrlParams();
}

export function getUrlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

export function initSettingsUI() {
  const settingsBtn = document.getElementById('settings-toggle');
  const settingsModal = document.getElementById('settings-modal');
  const closeBtn = document.getElementById('settings-close');

  if (!settingsBtn || !settingsModal) return;

  settingsBtn.addEventListener('click', () => {
    settingsModal.classList.add('active');
    syncUI();
  });

  closeBtn?.addEventListener('click', () => {
    settingsModal.classList.remove('active');
  });

  document.addEventListener('click', (e) => {
    if (e.target.matches('.settings-backdrop')) {
      settingsModal.classList.remove('active');
    }
  });

  // Wire up the theme selector
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) {
    themeSelector.addEventListener('change', (e) => {
      window.dispatchEvent(new CustomEvent('request-theme', { detail: e.target.value }));
      syncUI();
    });
  }

  document.getElementById('set-lang-en')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('request-lang', { detail: 'en' }));
    syncUI();
  });
  document.getElementById('set-lang-fr')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('request-lang', { detail: 'fr' }));
    syncUI();
  });

  document.getElementById('set-a11y-off')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('request-a11y', { detail: 'false' }));
    syncUI();
  });
  document.getElementById('set-a11y-on')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('request-a11y', { detail: 'true' }));
    syncUI();
  });
}

function syncUI() {
  const params = new URLSearchParams(window.location.search);
  const theme = params.get('theme') || document.documentElement.getAttribute('data-theme') || 'dark-default';
  const lang = params.get('lang') || document.documentElement.lang || 'en';
  const a11y = params.get('a11y') || 'false';

  document.querySelectorAll('.settings-btn').forEach(btn => {
    if (btn.tagName !== 'SELECT') btn.classList.remove('active');
  });
  
  const themeSelector = document.getElementById('theme-selector');
  if (themeSelector) themeSelector.value = theme;

  document.getElementById(`set-lang-${lang}`)?.classList.add('active');
  document.getElementById(`set-a11y-${a11y === 'true' ? 'on' : 'off'}`)?.classList.add('active');
}
