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
      // Wait a tiny bit for the settings modal to close before printing
      setTimeout(() => {
        window.print();
      }, 300);
    });
  }
}
