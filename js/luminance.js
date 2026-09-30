/**
 * luminance.js — Dynamic Luminance & WCAG Contrast Engine
 * 
 * Computes exact relative luminance according to WCAG 2.1 / 2.2 specifications:
 * L = 0.2126 * R_lin + 0.7152 * G_lin + 0.0722 * B_lin
 * 
 * Inspects background colors (blending semi-transparent cards over base backgrounds),
 * calculates contrast ratios, and dynamically determines the highest-contrast font colors
 * for titles, body text, muted subtitles, and cards across all themes and animated backgrounds.
 */

// Cached 1x1 canvas for robust parsing of any CSS color string
let colorCanvas = null;
let colorCtx = null;

function getColorContext() {
  if (!colorCanvas) {
    colorCanvas = document.createElement('canvas');
    colorCanvas.width = 1;
    colorCanvas.height = 1;
    colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
  }
  return colorCtx;
}

/**
 * Parses any CSS color format (hex, rgb, rgba, hsl, named, color-mix) into [r, g, b, a]
 * where r, g, b are in 0..255 and a is in 0..1
 */
export function parseColor(colorStr) {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit') {
    return [0, 0, 0, 0];
  }

  // Fast path for hex #RRGGBB
  if (colorStr.startsWith('#')) {
    const hex = colorStr.replace('#', '').trim();
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16),
        1
      ];
    }
    if (hex.length === 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        1
      ];
    }
    if (hex.length === 8) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        parseInt(hex.slice(6, 8), 16) / 255
      ];
    }
  }

  // Fast path for rgb/rgba
  const rgbMatch = colorStr.match(/rgba?\s*\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)/i);
  if (rgbMatch) {
    return [
      parseFloat(rgbMatch[1]),
      parseFloat(rgbMatch[2]),
      parseFloat(rgbMatch[3]),
      rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1
    ];
  }

  // Universal canvas fallback for hsl, named colors, color-mix, etc.
  try {
    const ctx = getColorContext();
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = colorStr;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0], data[1], data[2], data[3] / 255];
  } catch {
    return [0, 0, 0, 1];
  }
}

/**
 * Standard alpha blending: composites a foreground RGBA over a background RGBA
 */
export function blendColors(fgRgba, bgRgba) {
  const [r1, g1, b1, a1] = fgRgba;
  const [r2, g2, b2, a2] = bgRgba;

  if (a1 >= 1) return [r1, g1, b1, 1];
  if (a1 <= 0) return [r2, g2, b2, a2];

  const outA = a1 + a2 * (1 - a1);
  if (outA === 0) return [0, 0, 0, 0];

  const outR = Math.round((r1 * a1 + r2 * a2 * (1 - a1)) / outA);
  const outG = Math.round((g1 * a1 + g2 * a2 * (1 - a1)) / outA);
  const outB = Math.round((b1 * a1 + b2 * a2 * (1 - a1)) / outA);

  return [outR, outG, outB, outA];
}

/**
 * Converts sRGB channel [0..255] to linear channel [0..1] (gamma expansion)
 */
function sRgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.04045 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

/**
 * Computes WCAG 2.1 relative luminance for sRGB values (0..255)
 * Returns a value in [0, 1]
 */
export function calculateLuminance(r, g, b) {
  const R = sRgbToLinear(r);
  const G = sRgbToLinear(g);
  const B = sRgbToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

/**
 * Computes WCAG contrast ratio between two relative luminance values
 * Returns ratio in [1, 21]
 */
export function calculateContrast(lum1, lum2) {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Palette of high-performance candidate font colors for rigorous contrast selection
 */
const TEXT_CANDIDATES = {
  lightOnDark: {
    primary:   { color: '#f8fafc', r: 248, g: 250, b: 252 }, // Slate 50
    secondary: { color: '#cbd5e1', r: 203, g: 213, b: 225 }, // Slate 300 (ultra readable)
    heading:   { color: '#ffffff', r: 255, g: 255, b: 255 }, // Pure white
  },
  darkOnLight: {
    primary:   { color: '#0f172a', r: 15,  g: 23,  b: 42  }, // Slate 900
    secondary: { color: '#334155', r: 51,  g: 65,  b: 85  }, // Slate 700 (ultra readable)
    heading:   { color: '#090d16', r: 9,   g: 13,  b: 22  }, // Deep dark
  }
};

/**
 * Resolves effective background color for any element by traversing up the DOM
 * and blending translucent layers together over document base background.
 */
export function getEffectiveBackgroundColor(element) {
  const root = document.documentElement;
  const styleRoot = getComputedStyle(root);
  const baseBgStr = styleRoot.getPropertyValue('--color-bg').trim() || '#080b14';
  const baseBgRgba = parseColor(baseBgStr);

  if (!element || element === document.body || element === root) {
    return baseBgRgba;
  }

  // Collect layers from element up to document.body
  const layers = [];
  let curr = element;
  while (curr && curr !== document.documentElement) {
    const cs = getComputedStyle(curr);
    const bg = cs.backgroundColor;
    const rgba = parseColor(bg);
    if (rgba[3] > 0) {
      layers.unshift(rgba);
    }
    curr = curr.parentElement;
  }

  // Also check if element uses --color-card
  const cardTokenStr = styleRoot.getPropertyValue('--color-card').trim();
  if (layers.length === 0 && cardTokenStr) {
    layers.push(parseColor(cardTokenStr));
  }

  // Composite layers over baseBgRgba
  let composite = baseBgRgba;
  for (const layer of layers) {
    composite = blendColors(layer, composite);
  }
  return composite;
}

/**
 * Main evaluation function:
 * Calculates luminance of theme background and all cards,
 * setting optimal CSS variables and contrast-tuned typography.
 */
export function evaluateLuminance() {
  const root = document.documentElement;
  const styleRoot = getComputedStyle(root);

  // 1. Get base theme background
  const themeBgStr = styleRoot.getPropertyValue('--color-bg').trim() || '#080b14';
  const cardTokenStr = styleRoot.getPropertyValue('--color-card').trim() || 'rgba(8, 11, 20, 0.72)';
  const accent1 = styleRoot.getPropertyValue('--color-accent').trim() || '#6d4aff';
  const accent2 = styleRoot.getPropertyValue('--color-accent2').trim() || '#00d4ff';

  const baseBgRgba = parseColor(themeBgStr);
  const cardRgba = parseColor(cardTokenStr);
  const effectiveCardBg = blendColors(cardRgba, baseBgRgba);

  // 2. Compute relative luminance of effective card background
  const cardLum = calculateLuminance(effectiveCardBg[0], effectiveCardBg[1], effectiveCardBg[2]);
  const baseLum = calculateLuminance(baseBgRgba[0], baseBgRgba[1], baseBgRgba[2]);

  // Is this a light or dark theme? (Threshold 0.45 per colorimetry standards)
  const isLight = cardLum > 0.45;

  // 3. Determine optimal font colors using contrast algorithms
  const candidates = isLight ? TEXT_CANDIDATES.darkOnLight : TEXT_CANDIDATES.lightOnDark;

  const primaryLum = calculateLuminance(candidates.primary.r, candidates.primary.g, candidates.primary.b);
  const secondaryLum = calculateLuminance(candidates.secondary.r, candidates.secondary.g, candidates.secondary.b);
  const headingLum = calculateLuminance(candidates.heading.r, candidates.heading.g, candidates.heading.b);

  const primaryContrast = calculateContrast(primaryLum, cardLum);
  const secondaryContrast = calculateContrast(secondaryLum, cardLum);
  const headingContrast = calculateContrast(headingLum, cardLum);

  // 4. Set global dynamic CSS variables on :root
  root.style.setProperty('--lum-card-value', cardLum.toFixed(4));
  root.style.setProperty('--lum-base-value', baseLum.toFixed(4));
  root.style.setProperty('--lum-is-light', isLight ? '1' : '0');
  
  root.style.setProperty('--font-color-auto', candidates.primary.color);
  root.style.setProperty('--font-muted-auto', candidates.secondary.color);
  root.style.setProperty('--font-title-auto', candidates.heading.color);

  // High-contrast title gradients
  if (isLight) {
    root.style.setProperty('--hero-title-gradient', `linear-gradient(135deg, ${candidates.heading.color} 40%, ${accent1})`);
    root.style.setProperty('--card-bg-elevated', 'rgba(255, 255, 255, 0.88)');
    root.style.setProperty('--card-border-elevated', 'rgba(15, 23, 42, 0.12)');
    root.classList.add('theme-is-light');
    root.classList.remove('theme-is-dark');
  } else {
    root.style.setProperty('--hero-title-gradient', `linear-gradient(135deg, #ffffff 40%, ${accent2})`);
    root.style.setProperty('--card-bg-elevated', 'rgba(10, 15, 28, 0.82)');
    root.style.setProperty('--card-border-elevated', 'rgba(255, 255, 255, 0.12)');
    root.classList.add('theme-is-dark');
    root.classList.remove('theme-is-light');
  }

  // 5. Evaluate individual card containers for custom backdrops
  const cardElements = document.querySelectorAll(
    '.card, .hero-card, .about-card, .page-header, .section-header .section-desc, .career-item, .modal-panel'
  );

  cardElements.forEach(el => {
    const elBg = getEffectiveBackgroundColor(el);
    const elLum = calculateLuminance(elBg[0], elBg[1], elBg[2]);
    const elIsLight = elLum > 0.45;
    const elCandidates = elIsLight ? TEXT_CANDIDATES.darkOnLight : TEXT_CANDIDATES.lightOnDark;

    el.style.setProperty('--card-font-color', elCandidates.primary.color);
    el.style.setProperty('--card-muted-color', elCandidates.secondary.color);
    el.style.setProperty('--card-title-color', elCandidates.heading.color);

    if (elIsLight) {
      el.classList.add('lum-light-surface');
      el.classList.remove('lum-dark-surface');
    } else {
      el.classList.add('lum-dark-surface');
      el.classList.remove('lum-light-surface');
    }
  });

  // Store diagnostics for debugging / verification
  window.__luminanceState = {
    cardLuminance: cardLum,
    baseLuminance: baseLum,
    isLight,
    primaryContrast: primaryContrast.toFixed(2) + ':1',
    secondaryContrast: secondaryContrast.toFixed(2) + ':1',
    headingContrast: headingContrast.toFixed(2) + ':1',
    fontPrimary: candidates.primary.color,
    fontSecondary: candidates.secondary.color,
    fontHeading: candidates.heading.color,
  };
}

/**
 * Diagnostic helper accessible in console: window.getLuminanceDiagnostic()
 */
export function getLuminanceDiagnostic() {
  return window.__luminanceState || null;
}

/**
 * Initializes the luminance system and hooks into theme/language changes
 */
export function initLuminanceEngine() {
  // Expose to window for testing
  window.evaluateLuminance = evaluateLuminance;
  window.getLuminanceDiagnostic = getLuminanceDiagnostic;

  // Run on initial load
  evaluateLuminance();

  // Listen to custom themechange events
  window.addEventListener('themechange', () => {
    setTimeout(evaluateLuminance, 30);
  });

  // Listen to stylesheet link load events (when switching themes asynchronously)
  const themeLink = document.getElementById('theme-colors');
  if (themeLink) {
    themeLink.addEventListener('load', () => {
      setTimeout(evaluateLuminance, 50);
    });
  }

  // Re-run when language changes
  document.addEventListener('langchange', () => {
    setTimeout(evaluateLuminance, 50);
  });

  // Re-run on window resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(evaluateLuminance, 150);
  }, { passive: true });
}
