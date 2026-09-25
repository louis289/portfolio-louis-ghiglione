/**
 * modal.js — Card detail modal system
 * Opens a full-screen article overlay when a [data-modal] card is clicked.
 * Article data is stored in the translations object under a "articles" key.
 */

import { getCurrentLang } from './i18n.js';

let modalEl = null;

/**
 * Builds and injects the modal DOM once.
 */
function createModal() {
  if (document.getElementById('card-modal')) return;

  const tpl = `
  <div id="card-modal" class="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-panel">
      <button class="modal-close" id="modal-close-btn" aria-label="Close">&#10005;</button>
      <div class="modal-hero">
        <img id="modal-img" src="" alt="" class="modal-img" />
        <div class="modal-hero-text">
          <span id="modal-tag" class="section-tag"></span>
          <h2 id="modal-title" class="modal-title"></h2>
        </div>
      </div>
      <div class="modal-body">
        <div id="modal-content" class="modal-content"></div>
        <div id="modal-tags" class="modal-badge-row"></div>
        <div id="modal-links" class="modal-links"></div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', tpl);
  modalEl = document.getElementById('card-modal');

  // Close on backdrop click
  modalEl.querySelector('.modal-backdrop').addEventListener('click', closeModal);

  // Close on button
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

/**
 * Opens the modal with data from the given article key.
 * @param {string} articleKey — e.g. "passions.p1_article"
 * @param {object} translations — the full translations object
 */
export function openModal(articleKey, translations) {
  if (!modalEl) createModal();

  const lang = getCurrentLang();
  const t = translations[lang];

  // Resolve nested key like "passions.p1_article"
  const article = articleKey.split('.').reduce((o, k) => o?.[k], t);
  if (!article) return;

  document.getElementById('modal-title').textContent  = article.title  || '';
  document.getElementById('modal-tag').textContent    = article.tag    || '';
  document.getElementById('modal-content').innerHTML  = article.body   || '';

  // Image
  const img = document.getElementById('modal-img');
  if (article.img) {
    img.src = article.img;
    img.alt = article.title || '';
    img.style.display = 'block';
  } else {
    img.style.display = 'none';
  }

  // Badge tags
  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  if (article.tags && article.tags.length) {
    article.tags.forEach(tag => {
      const s = document.createElement('span');
      s.className = 'badge';
      s.textContent = tag;
      tagsEl.appendChild(s);
    });
  }

  // Links
  const linksEl = document.getElementById('modal-links');
  linksEl.innerHTML = '';
  if (article.links && article.links.length) {
    article.links.forEach(link => {
      const a = document.createElement('a');
      a.href = link.url;
      a.textContent = link.label;
      a.className = 'modal-link-btn';
      a.target = '_blank';
      a.rel = 'noopener';
      linksEl.appendChild(a);
    });
  }

  modalEl.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';

  // Focus trap — focus the close button
  setTimeout(() => document.getElementById('modal-close-btn')?.focus(), 50);
}

export function closeModal() {
  if (!modalEl) return;
  modalEl.setAttribute('hidden', '');
  document.body.style.overflow = '';
}

/**
 * Wire all [data-modal] cards on the page.
 * Must be called after i18n is ready and translations are passed in.
 * @param {object} translations
 */
export function initModals(translations) {
  createModal();

  document.querySelectorAll('[data-modal]').forEach(card => {
    card.style.cursor = 'pointer';
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');

    const open = () => openModal(card.dataset.modal, translations);

    card.addEventListener('click', open);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });
}
