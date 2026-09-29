/**
 * a11y.js
 * Accessibility mode management
 */

import { updateUrlParam, getUrlParam } from './settings.js';

export function initA11y() {
  function setA11y(isActive) {
    const a11yLink = document.getElementById('theme-a11y');
    if (isActive) {
      document.documentElement.setAttribute('data-a11y', 'true');
      updateUrlParam('a11y', 'true');
      if (a11yLink) a11yLink.href = './css/themes/a11y.css';
    } else {
      document.documentElement.removeAttribute('data-a11y');
      updateUrlParam('a11y', 'false');
      if (a11yLink) a11yLink.href = '';
    }
  }

  // Init from URL param
  const a11yParam = getUrlParam('a11y');
  setA11y(a11yParam === 'true');

  window.addEventListener('request-a11y', (e) => {
    setA11y(e.detail === 'true');
  });
}
