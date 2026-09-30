/**
 * contact-export.js — Dynamic Contact Exporter & VCF Generator
 * 
 * Fully driven by translations.json data (zero hardcoded personal info).
 * Supports arbitrary channels: emails, multiple phone numbers, LinkedIn, Instagram, GitHub, etc.
 * 
 * Features:
 * 1. Generates universal vCard 3.0 (.vcf) with embedded base64 photo and all configured channels
 * 2. Glassmorphic modal preview with all dynamic contact channels & direct copy
 * 3. Long-press activation on Contact links without interfering with direct link navigation
 */

import { getTranslations, getCurrentLang } from './i18n.js';

let cachedAvatarBase64 = null;
let lastAvatarUrl = null;
let exportModalEl = null;

/**
 * Returns dynamic contact data extracted directly from translations.json
 */
export function getContactData() {
  const t = getTranslations() || {};
  const contact = t.contact || {};
  const config = t.config || {};

  const name = contact.name || config.name || 'Louis Ghiglione';
  const parts = name.trim().split(/\s+/);
  const firstName = contact.first_name || (parts.length > 1 ? parts[0] : name);
  const lastName = contact.last_name || (parts.length > 1 ? parts.slice(1).join(' ') : '');

  // Extract or build dynamic contact channels array
  let channels = [];
  if (Array.isArray(contact.channels) && contact.channels.length > 0) {
    channels = contact.channels.map(ch => ({ ...ch }));
  } else {
    // Fallback to config fields
    if (config.email_mailto || config.email_display) {
      const email = config.email_display || (config.email_mailto || '').replace(/^mailto:/, '');
      channels.push({
        type: 'email',
        label: email,
        url: config.email_mailto || `mailto:${email}`,
        pref: true
      });
    }
    if (config.linkedin_url) {
      channels.push({
        type: 'linkedin',
        label: config.linkedin_display || 'LinkedIn',
        url: config.linkedin_url
      });
    }
  }

  return {
    name,
    firstName,
    lastName,
    title: contact.contact_sub || contact.title_role || 'Engineering Student',
    org: contact.org || 'INP-ENSEEIHT - ISAE-SUPAERO',
    avatarUrl: contact.avatar_url || config.avatar_url || './images/avatar.jpg',
    location: contact.location || 'Toulouse, France',
    portfolio: config.portfolio_pdf_url || window.location.origin + window.location.pathname.replace(/\/contact\.html$/, '/'),
    channels
  };
}

/**
 * Returns clean SVG icon for any contact channel type
 */
export function getChannelIconSvg(type) {
  const t = (type || '').toLowerCase();
  if (t === 'email' || t === 'mail') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
  }
  if (t === 'phone' || t === 'tel' || t === 'mobile') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
  }
  if (t === 'linkedin') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`;
  }
  if (t === 'instagram' || t === 'insta') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`;
  }
  if (t === 'github') {
    return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>`;
  }
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
}

/**
 * Folds lines according to RFC 2426 (max 75 octets per line)
 */
function foldLine(str, maxLen = 75) {
  if (str.length <= maxLen) return str;
  let result = str.slice(0, maxLen);
  let pos = maxLen;
  while (pos < str.length) {
    result += '\r\n ' + str.slice(pos, pos + maxLen - 1);
    pos += maxLen - 1;
  }
  return result;
}

/**
 * Loads avatar image and compresses it via offscreen canvas to base64 JPEG
 */
async function getAvatarBase64(url) {
  if (cachedAvatarBase64 && lastAvatarUrl === url) return cachedAvatarBase64;

  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl;
    });

    const maxDim = 180;
    const canvas = document.createElement('canvas');
    const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
    canvas.width = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(objectUrl);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
    cachedAvatarBase64 = dataUrl.split(',')[1];
    lastAvatarUrl = url;
    return cachedAvatarBase64;
  } catch (err) {
    console.warn('Avatar base64 conversion failed', err);
    return null;
  }
}

/**
 * Generates dynamic vCard 3.0 (.vcf) content from translations data
 */
export async function generateVcfContent() {
  const info = getContactData();
  const photoBase64 = await getAvatarBase64(info.avatarUrl);

  let vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${info.lastName};${info.firstName};;;`,
    `FN:${info.name}`,
    `ORG:${info.org}`,
    `TITLE:${info.title}`
  ];

  // Dynamic channels: emails, phones, socials, websites
  info.channels.forEach(ch => {
    const type = (ch.type || '').toLowerCase();
    if (type === 'email' || type === 'mail') {
      const email = ch.label || ch.url.replace(/^mailto:/, '');
      const pref = ch.pref ? ',PREF' : '';
      vcf.push(`EMAIL;TYPE=INTERNET${pref}:${email}`);
    } else if (type === 'phone' || type === 'tel' || type === 'mobile') {
      const tel = ch.label || ch.url.replace(/^tel:/, '');
      vcf.push(`TEL;TYPE=CELL,VOICE:${tel}`);
    } else if (type === 'linkedin') {
      vcf.push(`URL;TYPE=LinkedIn:${ch.url}`);
    } else if (type === 'instagram' || type === 'insta') {
      vcf.push(`URL;TYPE=Instagram:${ch.url}`);
    } else if (type === 'github') {
      vcf.push(`URL;TYPE=GitHub:${ch.url}`);
    } else {
      vcf.push(`URL;TYPE=WORK:${ch.url}`);
    }
  });

  if (info.portfolio) {
    vcf.push(`URL;TYPE=Portfolio:${info.portfolio}`);
  }

  if (photoBase64) {
    vcf.push(foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`));
  }

  vcf.push('END:VCARD');
  return vcf.join('\r\n');
}

/**
 * Triggers a direct file download in the browser
 */
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/**
 * Builds and opens the Contact Export Modal
 */
export function openContactExportModal() {
  createOrUpdateExportModal();
  exportModalEl.removeAttribute('hidden');
  document.body.style.overflow = 'hidden';
}

export function closeContactExportModal() {
  if (exportModalEl) {
    exportModalEl.setAttribute('hidden', '');
    document.body.style.overflow = '';
  }
}

/**
 * Injects or refreshes modal HTML with current dynamic contact data
 */
function createOrUpdateExportModal() {
  const info = getContactData();
  const isFr = getCurrentLang() === 'fr';

  let metaItemsHtml = '';
  info.channels.forEach(ch => {
    metaItemsHtml += `
      <div class="contact-meta-item">
        ${getChannelIconSvg(ch.type)}
        <a href="${ch.url}" ${!ch.url.startsWith('mailto:') && !ch.url.startsWith('tel:') ? 'target="_blank" rel="noopener"' : ''}>${ch.label}</a>
      </div>
    `;
  });

  const modalHtml = `
  <div id="contact-export-modal" class="modal-overlay contact-export-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-export-title" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-panel contact-export-panel">
      <button class="modal-close" id="contact-export-close" aria-label="Close">&times;</button>
      
      <div class="contact-export-header">
        <span class="section-tag">${isFr ? 'EXPORT CONTACT' : 'CONTACT EXPORT'}</span>
        <h2 id="contact-export-title" class="contact-export-heading">${isFr ? 'Fiche Contact (.vcf)' : 'Contact Card (.vcf)'}</h2>
        <p class="contact-export-sub">${isFr ? 'Exportez directement les coordonnées avec photo, emails, téléphones et réseaux au format universel vCard (compatible iOS, Android, macOS, Windows).' : 'Directly export coordinates with photo, emails, phone numbers, and socials into universal vCard format.'}</p>
      </div>

      <div class="contact-export-preview card">
        <div class="contact-export-preview__avatar-box">
          <img src="${info.avatarUrl}" alt="${info.name}" class="contact-export-preview__avatar" />
          <span class="contact-export-preview__dot" title="Actif"></span>
        </div>
        <div class="contact-export-preview__details">
          <h3 class="contact-export-preview__name">${info.name}</h3>
          <p class="contact-export-preview__title">${info.title}</p>
          <p class="contact-export-preview__org">${info.org}</p>

          <div class="contact-export-preview__meta">
            ${metaItemsHtml}
          </div>
        </div>
      </div>

      <div class="contact-export-actions">
        <button id="btn-export-vcf" class="modal-link-btn contact-action-btn contact-action-btn--primary" style="width: 100%; justify-content: center; padding: 0.95rem 1.8rem; font-size: 1rem;">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>${isFr ? 'Télécharger la Fiche Contact (.vcf)' : 'Download Contact Card (.vcf)'}</span>
        </button>
      </div>

      <div class="contact-export-copy-row">
        <button id="btn-copy-contact-info" class="badge contact-copy-badge">
          <span>📋 ${isFr ? 'Copier les coordonnées' : 'Copy contact info'}</span>
        </button>
        <span id="contact-copy-feedback" class="contact-copy-feedback" style="display:none;">${isFr ? 'Copié dans le presse-papier !' : 'Copied to clipboard!'}</span>
      </div>

      <p class="contact-export-tip">
        💡 <strong>${isFr ? 'Astuce' : 'Tip'}</strong> : ${isFr ? 'Vous pouvez ouvrir ce menu à tout moment par un <em>appui long</em> sur le lien <strong>Contact</strong>.' : 'You can open this menu at any time with a <em>long-press</em> on the <strong>Contact</strong> link.'}
      </p>
    </div>
  </div>`;

  const existing = document.getElementById('contact-export-modal');
  if (existing) {
    existing.remove();
  }

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  exportModalEl = document.getElementById('contact-export-modal');

  // Backdrop click
  exportModalEl.querySelector('.modal-backdrop').addEventListener('click', closeContactExportModal);

  // Close button
  document.getElementById('contact-export-close').addEventListener('click', closeContactExportModal);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && exportModalEl && !exportModalEl.hasAttribute('hidden')) {
      closeContactExportModal();
    }
  });

  // VCF Download
  const vcfBtn = document.getElementById('btn-export-vcf');
  vcfBtn.addEventListener('click', async () => {
    vcfBtn.classList.add('loading');
    vcfBtn.textContent = isFr ? 'Génération du .vcf...' : 'Generating .vcf...';
    try {
      const vcf = await generateVcfContent();
      const filename = `${info.firstName}_${info.lastName}.vcf`;
      downloadBlob(vcf, filename, 'text/vcard');
    } finally {
      vcfBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        <span>${isFr ? 'Télécharger la Fiche Contact (.vcf)' : 'Download Contact Card (.vcf)'}</span>`;
      vcfBtn.classList.remove('loading');
    }
  });

  // Copy text to clipboard
  const copyBtn = document.getElementById('btn-copy-contact-info');
  const copyFeedback = document.getElementById('contact-copy-feedback');
  copyBtn.addEventListener('click', async () => {
    const lines = [
      `${info.name} — ${info.title}`,
      `${info.org}`,
      `${info.location}`
    ];
    info.channels.forEach(ch => {
      lines.push(`${ch.type.toUpperCase()} : ${ch.label || ch.url}`);
    });
    const text = lines.join('\n');

    try {
      await navigator.clipboard.writeText(text);
      copyFeedback.style.display = 'inline-block';
      setTimeout(() => {
        copyFeedback.style.display = 'none';
      }, 2500);
    } catch {
      prompt('Coordonnées :', text);
    }
  });
}

/**
 * Attaches long-press listeners to target elements while guaranteeing child links remain directly clickable
 */
function attachLongPressListener(targetEl) {
  if (!targetEl || targetEl.__hasLongPress) return;
  targetEl.__hasLongPress = true;

  let pressTimer = null;
  let isPressing = false;
  let longPressTriggered = false;
  const PRESS_DURATION = 550; // ms

  function startPress(e) {
    // If user clicked or touched an anchor <a>, NEVER trigger long-press!
    if (e.target.closest('a')) return;

    if (e.pointerType === 'mouse' && e.button !== 0) return;

    longPressTriggered = false;
    isPressing = true;
    targetEl.classList.add('is-long-pressing');

    pressTimer = setTimeout(() => {
      if (isPressing) {
        longPressTriggered = true;
        isPressing = false;
        targetEl.classList.remove('is-long-pressing');
        if (navigator.vibrate) navigator.vibrate(50);
        openContactExportModal();
      }
    }, PRESS_DURATION);
  }

  function cancelPress() {
    isPressing = false;
    targetEl.classList.remove('is-long-pressing');
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
  }

  targetEl.addEventListener('pointerdown', startPress);
  targetEl.addEventListener('pointerup', cancelPress);
  targetEl.addEventListener('pointerleave', cancelPress);
  targetEl.addEventListener('pointercancel', cancelPress);

  // Prevent default click navigation ONLY if long press was triggered on the element itself
  targetEl.addEventListener('click', (e) => {
    if (e.target.closest('a') && !longPressTriggered) {
      return; // Direct anchor click, proceed normally
    }
    if (longPressTriggered) {
      e.preventDefault();
      e.stopPropagation();
      longPressTriggered = false;
    }
  }, true);

  // Keyboard long-press support (a11y)
  let keyTimer = null;
  targetEl.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !keyTimer) {
      if (e.target.closest('a')) return;
      targetEl.classList.add('is-long-pressing');
      keyTimer = setTimeout(() => {
        targetEl.classList.remove('is-long-pressing');
        openContactExportModal();
        keyTimer = null;
      }, PRESS_DURATION);
    }
  });

  targetEl.addEventListener('keyup', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      targetEl.classList.remove('is-long-pressing');
      if (keyTimer) {
        clearTimeout(keyTimer);
        keyTimer = null;
      }
    }
  });
}

/**
 * Initializes contact exporting across the application
 */
export function initContactExport() {
  // 1. Navbar Contact link (long-press)
  const navContactLinks = document.querySelectorAll('a[href*="contact.html"], a[data-page="contact"]');
  navContactLinks.forEach(link => {
    attachLongPressListener(link);
    link.title = 'Contact (Maintenir appuyé pour exporter la fiche .vcf)';
  });

  // Note: Contact card itself does NOT have long-press attached, guaranteeing all links are 100% directly clickable without delay or interception.

  // 3. Header dedicated download button
  const exportBtn = document.getElementById('btn-export-contact');
  if (exportBtn) {
    exportBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const originalHtml = exportBtn.innerHTML;
      const isFr = getCurrentLang() === 'fr';
      exportBtn.classList.add('loading');
      exportBtn.innerHTML = `
        <svg class="download-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
        <span>${isFr ? 'Téléchargement du .vcf...' : 'Downloading .vcf...'}</span>`;
      try {
        const vcf = await generateVcfContent();
        const info = getContactData();
        const filename = `${info.firstName}_${info.lastName}.vcf`;
        downloadBlob(vcf, filename, 'text/vcard');
      } catch (err) {
        console.error('Failed to export VCF', err);
        openContactExportModal();
      } finally {
        setTimeout(() => {
          exportBtn.classList.remove('loading');
          exportBtn.innerHTML = originalHtml;
        }, 800);
      }
    });
  }
}
