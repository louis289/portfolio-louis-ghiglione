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
      const langRadios = document.querySelectorAll('input[name="pdf-lang"]');
      let pdfLang = 'en';
      for (const r of langRadios) {
        if (r.checked) pdfLang = r.value;
      }
      window.open(`./portfolio-doc.html?lang=${pdfLang}&print=true`, '_blank');
    });
  }
}
