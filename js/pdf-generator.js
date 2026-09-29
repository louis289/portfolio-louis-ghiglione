/**
 * pdf-generator.js
 * Triggers native print dialog to generate a PDF of the page.
 * Uses @media print styles to ensure it looks like a clean document.
 */

export function initPdfGenerator() {
  const downloadBtn = document.getElementById('btn-download-pdf');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const params = new URLSearchParams(window.location.search);
      const lang = params.get('lang') || 'en';
      window.open(`./portfolio-doc.html?lang=${lang}&print=true`, '_blank');
    });
  }
}
