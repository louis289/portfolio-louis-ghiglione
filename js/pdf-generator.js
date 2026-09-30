/**
 * pdf-generator.js
 * Triggers native print dialog to generate a PDF of the page.
 * Uses @media print styles to ensure it looks like a clean document.
 */

import { getCurrentLang } from './i18n.js';

export function initPdfGenerator() {
  const downloadBtn = document.getElementById('btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const pdfLang = getCurrentLang() || 'en';
      window.open(`./portfolio-doc.html?lang=${pdfLang}&print=true`, '_blank');
    });
  }
}
