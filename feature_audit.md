# Feature Audit & Evolution Tracking

## Requested on 2026-09-29

### 1. PDF Generator Enhancements
- [ ] Add contact information to the PDF.
- [ ] Fix the Welcome section in the PDF (currently empty).
- [ ] Add the CV and Motivation Letter PDFs as annexes (or link/QR code to them).
- [ ] Add a YouTube link with a QR code in the PDF.
- [ ] Language choice for PDF: Provide an option to generate it in English *only* or French *only*.
- [ ] Add photos (from projects, passions, etc.) to the PDF.

### 2. Bugs Fixed
- [x] Fix `passions.html` rendering bug (was empty due to grid-3 selector missing in renderer).

### 3. Theme & Accessibility Overhaul
- [ ] Total CSS overhaul for Light Mode: Re-evaluate colors from scratch.
- [ ] Total CSS overhaul for Accessibility Mode: Fix issues and ensure a perfect clean look.

### 4. Content Population
- [ ] Populate translations.json with all raw text provided by the user in `liste.txt` (LinkedIn data, Who am I, PIA, Scoutisme, etc.).
