/**
 * a11y.js
 * Accessibility mode management
 */

import { updateUrlParam, getUrlParam } from './settings.js';

export function initA11y() {
  function setA11y(isActive) {
    if (isActive) {
      document.documentElement.setAttribute('data-a11y', 'true');
      updateUrlParam('a11y', 'true');
    } else {
      document.documentElement.removeAttribute('data-a11y');
      updateUrlParam('a11y', 'false');
    }
  }

  // Init from URL param
  const a11yParam = getUrlParam('a11y');
  setA11y(a11yParam === 'true');

  window.addEventListener('request-a11y', (e) => {
    setA11y(e.detail === 'true');
  });
}
