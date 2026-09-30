# Feature Audit & Evolution Tracking

## Requested on 2026-09-29

### 1. PDF Generator Enhancements (COMPLETED)
- [x] Add contact information to the PDF.
- [x] Fix the Welcome section in the PDF.
- [x] Add the CV and Motivation Letter PDFs as annexes via QR code links.
- [x] Add a YouTube link with a QR code in the PDF.
- [x] Language choice for PDF: Radio buttons added next to the download button.
- [x] Add photos (from projects, passions, etc.) to the PDF.

### 2. Bugs Fixed
- [x] Fix `passions.html` rendering bug (was empty due to grid-3 selector missing in renderer).

### 3. Theme & Accessibility Overhaul
- [ ] Total CSS overhaul for Light Mode: Re-evaluate colors from scratch.
- [ ] Total CSS overhaul for Accessibility Mode: Fix issues and ensure a perfect clean look.

### 4. Content Population
- [ ] Populate translations.json with all raw text provided by the user in `liste.txt` (LinkedIn data, Who am I, PIA, Scoutisme, etc.).

### 5. Style & Background Fixes (COMPLETED on 2026-09-30)
- [x] Removed full-width matte overlay blocking the background effects at the top of pages (`projects`, `passions`, `civic`, `contact`, `career`).
- [x] Scoped `.modal-backdrop` to `.modal-overlay` and prevented orphan backdrops from displaying.
- [x] Removed duplicate/orphan backdrop injection from `renderer.js` and `contact.html`.
- [x] Unified modal article opening in `modal.js` so all dynamically generated cards open correctly with modal dialog.
- [x] Added `fx-electric.css` and enhanced electrical effect opacity for vibrant glowing blobs and circuit traces.
- [x] Fixed light mode body background to transparent so background effects remain visible.

### 6. Tag Interconnection & Lexicon System (COMPLETED on 2026-09-30)
- [x] Interlinked tags across `projects`, `passions`, `civic`, and `experience` in `data/translations.json`.
- [x] Created `tags_info` bilingual technical and encyclopedic dictionary (ISAE-SUPAERO, Microélectronique, CMOS, ASIC, FPGA, VHDL, CADENCE, LoRaWAN, IoT, Scoutisme, etc.) with external links to official sites.
- [x] Overhauled `tag.html` and `js/tags.js` with category pills, technical descriptions, provenance badges, and co-occurring tag suggestions.
- [x] Added `stopPropagation()` on tag badges to enable smooth navigation without triggering modal dialogs.

### 7. Readability, Frosted Card Containers & Luminance Engine (COMPLETED on 2026-09-30)
- [x] Created `.hero-card` on `index.html` to house the hero subtitle and CTA inside a frosted glass card, shielding text from moving background traces.
- [x] Created `.about-card` on `index.html` framing avatar, status badge, biography paragraphs, and technology badges in an executive glass card.
- [x] Converted standalone `.section-desc` across sections into frosted pill containers with backdrop filters.
- [x] Upgraded `.page-header` across all inner pages (`projects.html`, `career.html`, `passions.html`, `civic.html`, `mobility.html`, `contact.html`) to frosted glass cards.
- [x] Built WCAG 2.1 dynamic relative luminance and contrast engine in `js/luminance.js` that inspects background colors, computes contrast ratios, and dynamically assigns high-contrast font colors across light and dark themes.

### 8. Settings Icon Modernization (COMPLETED on 2026-09-30)
- [x] Replaced the emoji gear (`⚙️`) in `partials/nav.html` with a sober, modern vector SVG (sliders/tuning icon).
- [x] Upgraded `.settings-toggle` button styling in `css/template.css` to match navbar aesthetics (38x38px, glassmorphic card background, subtle border, hover micro-interaction).

### 9. Long-Press Contact & ICS / VCF Exporter (COMPLETED on 2026-09-30)
- [x] Created `js/contact-export.js` with unified touch, pointer and keyboard long-press detection (550ms hold).
- [x] Integrated trigger on navbar `Contact` link (accessible anywhere across the portfolio), on the 3D contact card on `contact.html`, and via a direct export button.
- [x] Added visual press-and-hold feedback animation (`.is-long-pressing` pulse-ring) and haptic vibration (`navigator.vibrate`).
- [x] Implemented RFC 5545 iCalendar (`.ics`) generator with embedded base64 profile photo, emails, and LinkedIn URL.
- [x] Implemented vCard 3.0 (`.vcf`) generator for native iOS/Android contact saving with embedded base64 photo, emails, and LinkedIn URL.
- [x] Designed glassmorphic modal with contact preview, direct download buttons, and 1-click clipboard copy.

### 10. Contact Card 3D Amplification & Header Download Button (COMPLETED on 2026-09-30)
- [x] Replaced export button icon with the official download SVG arrow (tray/arrow symbol) and moved it to the end of the header paragraph, removing it from the 3D card.
- [x] Amplified 3D perspective to 26° on `js/tilt.js` with dynamic directional shadows and radiant multi-color specular glare.
- [x] Added mobile touchscreen support (drag & swipe tilt) and calibrated gyroscope sensitivity on smartphones.
- [x] Added prismatic border reflection and enhanced pop-out parallax depth on the avatar, name, and contact links.
