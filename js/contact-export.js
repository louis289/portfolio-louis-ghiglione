/**
 * contact-export.js — Long-press Contact Exporter (ICS / VCF)
 * 
 * Enables long-press (550ms hold) on any "Contact" navigation link or contact card
 * to open a sleek glassmorphic modal proposing:
 * 1. An iCalendar (.ics) appointment/contact event with embedded profile photo, emails, and LinkedIn
 * 2. A vCard (.vcf) contact file for smartphones with embedded profile photo, emails, and LinkedIn
 * 3. Quick copy to clipboard
 */

let cachedAvatarBase64 = null;
let exportModalEl = null;

const CONTACT_INFO = {
  name: 'Louis Ghiglione',
  firstName: 'Louis',
  lastName: 'Ghiglione',
  title: 'Élève-Ingénieur Microélectronique & Automatique',
  org: 'INP-ENSEEIHT - ISAE-SUPAERO',
  email: 'louis.ghiglione@etu.toulouse-inp.fr',
  linkedin: 'https://www.linkedin.com/in/louis-ghiglione-722165294/',
  linkedinDisplay: 'linkedin.com/in/louis-ghiglione-722165294',
  portfolio: 'https://louis289.github.io/portfolio-louis-ghiglione/',
  avatarUrl: './images/avatar.jpg',
  location: 'Toulouse, France',
  note: 'Ingénieur en apprentissage (FISA S5). Spécialité Microélectronique & Automatique. Projets: Tolosat, Park4Move, Fare Ingénierie ITER.'
};

/**
 * Folds lines according to RFC 5545 / RFC 2426 (max 75 octets per line)
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
 * Loads avatar.jpg and compresses it via offscreen canvas to a lightweight base64 JPEG
 */
async function getAvatarBase64() {
  if (cachedAvatarBase64) return cachedAvatarBase64;

  try {
    const res = await fetch(CONTACT_INFO.avatarUrl);
    const blob = await res.blob();
    const img = new Image();
    const objectUrl = URL.createObjectURL(blob);

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = objectUrl;
    });

    // Create a 180x180 canvas for optimal vCard/iCal file size
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
    return cachedAvatarBase64;
  } catch (err) {
    console.warn('Avatar base64 conversion failed', err);
    return null;
  }
}

/**
 * Generates RFC 5545 iCalendar (.ics) content with embedded base64 photo and contact details
 */
export async function generateIcsContent() {
  const photoBase64 = await getAvatarBase64();
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const nowStr = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  // Default meeting placeholder: tomorrow 14:00 - 15:00 UTC
  const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000);
  tomorrow.setUTCHours(14, 0, 0, 0);
  const startStr = `${tomorrow.getUTCFullYear()}${pad(tomorrow.getUTCMonth() + 1)}${pad(tomorrow.getUTCDate())}T140000Z`;
  const endStr = `${tomorrow.getUTCFullYear()}${pad(tomorrow.getUTCMonth() + 1)}${pad(tomorrow.getUTCDate())}T150000Z`;

  let ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Louis Ghiglione//Portfolio Contact System//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:contact-louis-ghiglione-${Date.now()}@etu.toulouse-inp.fr`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:Contact & Échange — ${CONTACT_INFO.name}`,
    `DESCRIPTION:Fiche Contact & Échange avec ${CONTACT_INFO.name}\\n\\n` +
      `Email: ${CONTACT_INFO.email}\\n` +
      `LinkedIn: ${CONTACT_INFO.linkedin}\\n` +
      `Portfolio: ${CONTACT_INFO.portfolio}\\n` +
      `Formation: ${CONTACT_INFO.org}\\n` +
      `Titre: ${CONTACT_INFO.title}\\n\\n` +
      `Note: ${CONTACT_INFO.note}`,
    `LOCATION:${CONTACT_INFO.location}`,
    `URL:${CONTACT_INFO.linkedin}`,
    `ORGANIZER;CN=${CONTACT_INFO.name}:mailto:${CONTACT_INFO.email}`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;CN=${CONTACT_INFO.name}:mailto:${CONTACT_INFO.email}`,
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE'
  ];

  if (photoBase64) {
    ics.push(foldLine(`ATTACH;ENCODING=BASE64;VALUE=BINARY;FMTTYPE=image/jpeg:${photoBase64}`));
  }

  ics.push('END:VEVENT');
  ics.push('END:VCALENDAR');

  return ics.join('\r\n');
}

/**
 * Generates vCard 3.0 (.vcf) content with embedded base64 photo, emails, and LinkedIn
 */
export async function generateVcfContent() {
  const photoBase64 = await getAvatarBase64();

  let vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${CONTACT_INFO.lastName};${CONTACT_INFO.firstName};;;`,
    `FN:${CONTACT_INFO.name}`,
    `ORG:${CONTACT_INFO.org}`,
    `TITLE:${CONTACT_INFO.title}`,
    `EMAIL;TYPE=INTERNET,PREF:${CONTACT_INFO.email}`,
    `URL:${CONTACT_INFO.linkedin}`,
    `URL;TYPE=Portfolio:${CONTACT_INFO.portfolio}`,
    `NOTE:${CONTACT_INFO.note}`
  ];

  if (photoBase64) {
    vcf.push(foldLine(`PHOTO;ENCODING=b;TYPE=JPEG:${photoBase64}`));
  }

  vcf.push('END:VCARD');
  return vcf.join('\r\n');
}

/**
 * Triggers a direct download of a text blob in the browser
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
 * Builds and displays the Contact & Calendar export modal
 */
export function openContactExportModal() {
  if (!exportModalEl) {
    createExportModal();
  }
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
 * Injects modal HTML into DOM once
 */
function createExportModal() {
  const existing = document.getElementById('contact-export-modal');
  if (existing) {
    exportModalEl = existing;
    return;
  }

  const modalHtml = `
  <div id="contact-export-modal" class="modal-overlay contact-export-overlay" role="dialog" aria-modal="true" aria-labelledby="contact-export-title" hidden>
    <div class="modal-backdrop"></div>
    <div class="modal-panel contact-export-panel">
      <button class="modal-close" id="contact-export-close" aria-label="Close">&times;</button>
      
      <div class="contact-export-header">
        <span class="section-tag">EXPORT COORDONNÉES</span>
        <h2 id="contact-export-title" class="contact-export-heading">Fiche Contact & Calendrier</h2>
        <p class="contact-export-sub">Exportez directement les coordonnées avec photo de profil, emails et profil LinkedIn.</p>
      </div>

      <div class="contact-export-preview card">
        <div class="contact-export-preview__avatar-box">
          <img src="${CONTACT_INFO.avatarUrl}" alt="${CONTACT_INFO.name}" class="contact-export-preview__avatar" />
          <span class="contact-export-preview__dot" title="Actif"></span>
        </div>
        <div class="contact-export-preview__details">
          <h3 class="contact-export-preview__name">${CONTACT_INFO.name}</h3>
          <p class="contact-export-preview__title">${CONTACT_INFO.title}</p>
          <p class="contact-export-preview__org">${CONTACT_INFO.org}</p>

          <div class="contact-export-preview__meta">
            <div class="contact-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>${CONTACT_INFO.email}</span>
            </div>
            <div class="contact-meta-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              <a href="${CONTACT_INFO.linkedin}" target="_blank" rel="noopener">${CONTACT_INFO.linkedinDisplay}</a>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-export-actions">
        <button id="btn-export-ics" class="modal-link-btn contact-action-btn contact-action-btn--primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          <span>Télécharger Rendez-vous (.ics)</span>
        </button>

        <button id="btn-export-vcf" class="modal-link-btn contact-action-btn contact-action-btn--secondary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          <span>Fiche Contact Téléphone (.vcf)</span>
        </button>
      </div>

      <div class="contact-export-copy-row">
        <button id="btn-copy-contact-info" class="badge contact-copy-badge">
          <span>📋 Copier les coordonnées textuelles</span>
        </button>
        <span id="contact-copy-feedback" class="contact-copy-feedback" style="display:none;">Copié dans le presse-papier !</span>
      </div>

      <p class="contact-export-tip">
        💡 <strong>Astuce</strong> : Vous pouvez ouvrir ce menu à tout moment par un <em>appui long</em> sur le lien <strong>Contact</strong> de la barre de navigation.
      </p>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  exportModalEl = document.getElementById('contact-export-modal');

  // Event handlers
  const backdrop = exportModalEl.querySelector('.modal-backdrop');
  backdrop.addEventListener('click', closeContactExportModal);

  const closeBtn = document.getElementById('contact-export-close');
  closeBtn.addEventListener('click', closeContactExportModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !exportModalEl.hasAttribute('hidden')) {
      closeContactExportModal();
    }
  });

  // Download ICS
  const icsBtn = document.getElementById('btn-export-ics');
  icsBtn.addEventListener('click', async () => {
    icsBtn.classList.add('loading');
    icsBtn.textContent = 'Génération du .ics...';
    try {
      const ics = await generateIcsContent();
      downloadBlob(ics, 'Contact_Louis_Ghiglione.ics', 'text/calendar');
    } finally {
      icsBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
        <span>Télécharger Rendez-vous (.ics)</span>`;
    }
  });

  // Download VCF
  const vcfBtn = document.getElementById('btn-export-vcf');
  vcfBtn.addEventListener('click', async () => {
    vcfBtn.classList.add('loading');
    vcfBtn.textContent = 'Génération du .vcf...';
    try {
      const vcf = await generateVcfContent();
      downloadBlob(vcf, 'Louis_Ghiglione.vcf', 'text/vcard');
    } finally {
      vcfBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        <span>Fiche Contact Téléphone (.vcf)</span>`;
    }
  });

  // Copy text
  const copyBtn = document.getElementById('btn-copy-contact-info');
  const copyFeedback = document.getElementById('contact-copy-feedback');
  copyBtn.addEventListener('click', async () => {
    const text = [
      `${CONTACT_INFO.name} — ${CONTACT_INFO.title}`,
      `Formation : ${CONTACT_INFO.org}`,
      `Email : ${CONTACT_INFO.email}`,
      `LinkedIn : ${CONTACT_INFO.linkedin}`,
      `Portfolio : ${CONTACT_INFO.portfolio}`
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      copyFeedback.style.display = 'inline-block';
      setTimeout(() => {
        copyFeedback.style.display = 'none';
      }, 2500);
    } catch {
      // Fallback
      prompt('Coordonnées de Louis Ghiglione :', text);
    }
  });
}

/**
 * Attaches long-press listeners (touch and pointer) to target elements
 */
function attachLongPressListener(targetEl) {
  if (!targetEl || targetEl.__hasLongPress) return;
  targetEl.__hasLongPress = true;

  let pressTimer = null;
  let isPressing = false;
  let longPressTriggered = false;
  const PRESS_DURATION = 550; // ms

  function startPress(e) {
    // Only primary mouse button or touch
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

  // Pointer events (unifies mouse + touch + stylus)
  targetEl.addEventListener('pointerdown', startPress);
  targetEl.addEventListener('pointerup', cancelPress);
  targetEl.addEventListener('pointerleave', cancelPress);
  targetEl.addEventListener('pointercancel', cancelPress);

  // Prevent default click navigation if long press was triggered
  targetEl.addEventListener('click', (e) => {
    if (longPressTriggered) {
      e.preventDefault();
      e.stopPropagation();
      longPressTriggered = false;
    }
  }, true);

  // Also support long-press via keyboard hold (Enter or Space for a11y)
  let keyTimer = null;
  targetEl.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !keyTimer) {
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
 * Initializes long-press contact exporting across the application
 */
export function initContactExport() {
  // 1. Hook into navbar Contact link
  const navContactLinks = document.querySelectorAll('a[href*="contact.html"], a[data-page="contact"]');
  navContactLinks.forEach(link => {
    attachLongPressListener(link);
    link.title = 'Contact (Maintenir appuyé pour exporter la fiche .ics / .vcf)';
  });

  // 2. Hook into 3D contact card on contact.html
  const contactCard = document.getElementById('contact-tilt-card') || document.querySelector('.contact-card');
  if (contactCard) {
    attachLongPressListener(contactCard);
  }

  // 3. Hook into dedicated button if present
  const exportBtn = document.getElementById('btn-export-contact');
  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openContactExportModal();
    });
  }
}
