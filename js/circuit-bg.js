/**
 * circuit-bg.js — Animated circuit board background
 * - Sparse PCB traces biased to screen edges
 * - Slow electrical pulses with glow + tail
 * - Parallax offset on scroll
 */

const COLORS = {
  purple: '#6d4aff',
  cyan:   '#00e5ff',
};

const GRID         = 56;    // px between grid nodes (larger = sparser)
const TRACE_ALPHA  = 0.09;  // trace line opacity
const PULSE_COUNT  = 14;    // fewer pulses

let canvas, ctx, W, H;
let traces  = [];
let pulses  = [];
let animId  = null;
let scrollY = 0;
let targetScrollY = 0;

/* ── Helpers ──────────────────────────────────────────────── */

function snap(v, grid) { return Math.round(v / grid) * grid; }

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
}

/**
 * Pick a starting X biased heavily toward the left or right edge.
 * Centre third of the screen is avoided.
 */
function edgeBiasedX() {
  // 70% chance left third, 30% right third
  if (Math.random() < 0.5) {
    return snap(Math.random() * (W * 0.28), GRID);            // left band
  } else {
    return snap(W * 0.72 + Math.random() * (W * 0.28), GRID); // right band
  }
}

function buildTrace() {
  const startX = edgeBiasedX();
  const startY = snap(Math.random() * H, GRID);
  const pts    = [{ x: startX, y: startY }];
  let cx = startX, cy = startY;

  // 3–5 segments only
  const steps = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < steps; i++) {
    const horiz = Math.random() > 0.45;
    const dist  = (1 + Math.floor(Math.random() * 4)) * GRID;
    const dir   = Math.random() > 0.5 ? 1 : -1;

    if (horiz) cx += dist * dir;
    else       cy += dist * dir;

    // Clamp but keep near edges — allow slight overflow
    cx = Math.max(-GRID, Math.min(W + GRID, cx));
    cy = Math.max(-GRID, Math.min(H + GRID, cy));
    pts.push({ x: cx, y: cy });
  }

  const color = Math.random() > 0.45 ? COLORS.purple : COLORS.cyan;
  return { pts, color };
}

function spawnPulse() {
  const traceIdx = Math.floor(Math.random() * traces.length);
  const color    = Math.random() > 0.5 ? COLORS.purple : COLORS.cyan;
  return {
    traceIdx,
    segIdx: 0,
    t:      Math.random(),
    speed:  0.0008 + Math.random() * 0.0018,  // much slower
    color,
    size:   1.8 + Math.random() * 2.5,
    tail:   0.4 + Math.random() * 0.4,
    alpha:  0.55 + Math.random() * 0.35,
  };
}

/* ── Interpolation ────────────────────────────────────────── */

function lerpPt(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/* ── Draw ─────────────────────────────────────────────────── */

function drawTraces(offsetY) {
  traces.forEach(({ pts, color }) => {
    const [r,g,b] = hexToRgb(color);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y + offsetY);
    for (let i = 1; i < pts.length; i++) {
      ctx.lineTo(pts[i].x, pts[i].y + offsetY);
    }
    ctx.strokeStyle = `rgba(${r},${g},${b},${TRACE_ALPHA})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Junction dots
    pts.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y + offsetY, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${TRACE_ALPHA * 1.8})`;
      ctx.fill();
    });
  });
}

function drawPulse(p, offsetY) {
  const trace = traces[p.traceIdx];
  const pts   = trace.pts;
  if (p.segIdx >= pts.length - 1) return;

  const a    = pts[p.segIdx];
  const b    = pts[p.segIdx + 1];
  const head = lerpPt(a, b, p.t);
  const hx   = head.x;
  const hy   = head.y + offsetY;

  const [r,g,bv] = hexToRgb(p.color);

  // Outer glow
  const grd = ctx.createRadialGradient(hx, hy, 0, hx, hy, p.size * 7);
  grd.addColorStop(0,   `rgba(${r},${g},${bv},${p.alpha * 0.85})`);
  grd.addColorStop(0.35,`rgba(${r},${g},${bv},${p.alpha * 0.25})`);
  grd.addColorStop(1,   `rgba(${r},${g},${bv},0)`);
  ctx.beginPath();
  ctx.arc(hx, hy, p.size * 7, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Core
  ctx.beginPath();
  ctx.arc(hx, hy, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${bv},${p.alpha})`;
  ctx.fill();

  // Tail
  const tailT  = Math.max(0, p.t - p.tail);
  const tailPt = lerpPt(a, b, tailT);
  const grad   = ctx.createLinearGradient(tailPt.x, tailPt.y + offsetY, hx, hy);
  grad.addColorStop(0, `rgba(${r},${g},${bv},0)`);
  grad.addColorStop(1, `rgba(${r},${g},${bv},${p.alpha * 0.45})`);
  ctx.beginPath();
  ctx.moveTo(tailPt.x, tailPt.y + offsetY);
  ctx.lineTo(hx, hy);
  ctx.strokeStyle = grad;
  ctx.lineWidth   = p.size * 0.75;
  ctx.lineCap     = 'round';
  ctx.stroke();
}

/* ── Animation loop ───────────────────────────────────────── */

function tick() {
  // Smooth scroll easing
  scrollY += (targetScrollY - scrollY) * 0.06;
  const parallaxOffset = -scrollY * 0.18; // subtle parallax factor

  ctx.clearRect(0, 0, W, H);
  drawTraces(parallaxOffset);

  pulses.forEach((p, i) => {
    drawPulse(p, parallaxOffset);
    p.t += p.speed;

    if (p.t >= 1) {
      p.t -= 1;
      p.segIdx++;
      if (p.segIdx >= traces[p.traceIdx].pts.length - 1) {
        pulses[i] = spawnPulse();
      }
    }
  });

  animId = requestAnimationFrame(tick);
}

/* ── Setup / resize ───────────────────────────────────────── */

function build() {
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width  = W;
  canvas.height = H;

  // Fewer traces — roughly 1 per 30000px² instead of 18000
  const count = Math.max(6, Math.floor((W * H) / 34000));
  traces = Array.from({ length: count }, buildTrace);
  pulses = Array.from({ length: PULSE_COUNT }, spawnPulse);
}

/* ── Public init ──────────────────────────────────────────── */

export function initCircuitBg() {
  // Create background blobs dynamically
  const blobs = document.createElement('div');
  blobs.className = 'bg-blobs';
  blobs.setAttribute('aria-hidden', 'true');
  blobs.innerHTML = '<div class="blob blob--purple"></div><div class="blob blob--cyan"></div>';
  document.body.insertAdjacentElement('afterbegin', blobs);

  canvas = document.createElement('canvas');
  canvas.id = 'circuit-bg';
  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:-1',
    'pointer-events:none',
    'opacity:0.65',
    'filter:blur(0.8px)',
  ].join(';');

  document.body.insertAdjacentElement('afterbegin', canvas);
  ctx = canvas.getContext('2d');

  build();
  tick();

  // Scroll parallax
  window.addEventListener('scroll', () => {
    targetScrollY = window.scrollY;
  }, { passive: true });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (animId) cancelAnimationFrame(animId);
      build();
      tick();
    }, 200);
  });
}
