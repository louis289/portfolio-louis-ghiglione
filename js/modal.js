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
      <div id="modal-gallery-container" class="modal-gallery-container" style="display:none;">
        <div class="modal-gallery-track" id="modal-gallery-track"></div>
        <button class="gallery-nav prev" id="gallery-prev" aria-label="Previous image">&#10094;</button>
        <button class="gallery-nav next" id="gallery-next" aria-label="Next image">&#10095;</button>
        <div class="gallery-counter" id="gallery-counter">1 / 1</div>
      </div>
      <div class="modal-header-section">
        <span id="modal-tag" class="section-tag"></span>
        <h2 id="modal-title" class="modal-title-solid"></h2>
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

  // Resolve nested key like "passions.p1_article" or "projects_item_0"
  let article = null;
  let itemObj = null;
  if (articleKey.includes('_item_')) {
    const parts = articleKey.split('_item_');
    const sec = parts[0];
    const idx = parseInt(parts[1], 10);
    if (sec === 'career') {
      itemObj = t?.career?.jobs?.items?.[idx];
    } else {
      itemObj = t?.[sec]?.items?.[idx];
    }
    article = itemObj?.article;
  } else if (articleKey.includes('.')) {
    const match = articleKey.match(/^([a-z]+)\.p(\d+)_article$/);
    if (match) {
      const sec = match[1];
      const idx = parseInt(match[2], 10) - 1;
      itemObj = t?.[sec]?.items?.[idx];
      article = itemObj?.article;
    } else {
      article = articleKey.split('.').reduce((o, k) => o?.[k], t);
    }
  }
  if (!article && !itemObj) return;
  article = article || {};

  document.getElementById('modal-title').textContent  = article.title  || itemObj?.title || itemObj?.role || '';
  document.getElementById('modal-tag').textContent    = article.tag    || itemObj?.tag || '';
  document.getElementById('modal-content').innerHTML  = article.body   || itemObj?.desc || '';

  // Images Gallery
  const track = document.getElementById('modal-gallery-track');
  const container = document.getElementById('modal-gallery-container');
  const btnPrev = document.getElementById('gallery-prev');
  const btnNext = document.getElementById('gallery-next');
  const counter = document.getElementById('gallery-counter');
  
  const media = translations?.media?.[itemObj?.id] || {};
  const allImgs = itemObj?.images || itemObj?.photos || article?.images || media.gallery || [];
  const singleImg = article.img || article.image || itemObj?.image || itemObj?.img || media.image || media.article_img;
  let imgs = [...allImgs];
  if (singleImg && !imgs.includes(singleImg)) imgs.unshift(singleImg);
  
  if (imgs.length > 0) {
    container.style.display = 'block';
    track.innerHTML = '';
    imgs.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.className = 'modal-img-slide';
      track.appendChild(img);
    });
    
    let currentIndex = 0;
    const updateGallery = () => {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      counter.textContent = `${currentIndex + 1} / ${imgs.length}`;
      btnPrev.style.display = imgs.length > 1 ? 'block' : 'none';
      btnNext.style.display = imgs.length > 1 ? 'block' : 'none';
    };
    
    btnPrev.onclick = () => { currentIndex = (currentIndex - 1 + imgs.length) % imgs.length; updateGallery(); };
    btnNext.onclick = () => { currentIndex = (currentIndex + 1) % imgs.length; updateGallery(); };
    
    updateGallery();
  } else {
    container.style.display = 'none';
  }

  // Badge tags — seamlessly retransmit tags across all cards (mobility, projects, career, passions, civic)
  const tagsEl = document.getElementById('modal-tags');
  tagsEl.innerHTML = '';
  const tags = (article.tags && article.tags.length) ? article.tags : (itemObj?.tags || []);
  if (tags && tags.length) {
    tags.forEach(tag => {
      const a = document.createElement('a');
      a.className = 'badge';
      a.href = `./tag.html?tag=${encodeURIComponent(tag)}&lang=${localStorage.getItem('site_lang') || 'en'}`;
      a.textContent = tag;
      tagsEl.appendChild(a);
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
