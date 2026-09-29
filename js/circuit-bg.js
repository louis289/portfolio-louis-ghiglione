/**
 * circuit-bg.js — Animated circuit board background
 * Draws blurred PCB traces with flowing electrical pulses
 * in the site's purple/cyan palette.
 */

const COLORS = {
  purple: '#6d4aff',
  cyan:   '#00e5ff',
  dim:    'rgba(109, 74, 255, 0.08)',
};

const GRID   = 48;   // px between grid nodes
const TRACE_ALPHA = 0.12;
const PULSE_COUNT = 28;

let canvas, ctx, W, H, cols, rows;
let traces  = [];  // [{pts: [{x,y},...], color}]
let pulses  = [];  // [{traceIdx, t, speed, color, size}]
let animId  = null;

/* ── Geometry helpers ─────────────────────────────────────── */

function snap(v) { return Math.round(v / GRID) * GRID; }

/**
 * Build a random L-shaped or multi-segment trace starting from
 * a random grid point and walking horizontally then vertically
 * (or vice-versa) a random number of steps.
 */
function buildTrace() {
  const startX = snap(Math.random() * W);
  const startY = snap(Math.random() * H);
  const pts    = [{ x: startX, y: startY }];
  let   cx     = startX;
  let   cy     = startY;
  const steps  = 3 + Math.floor(Math.random() * 6);

  for (let i = 0; i < steps; i++) {
    const horiz = Math.random() > 0.5;
    const dist  = (2 + Math.floor(Math.random() * 5)) * GRID;
    const dir   = Math.random() > 0.5 ? 1 : -1;

    if (horiz) cx += dist * dir;
    else       cy += dist * dir;

    cx = Math.max(0, Math.min(W, cx));
    cy = Math.max(0, Math.min(H, cy));
    pts.push({ x: cx, y: cy });
  }

  const color = Math.random() > 0.45 ? COLORS.purple : COLORS.cyan;
  return { pts, color };
}

/**
 * Spawn a pulse on a random trace at a random starting position.
 */
function spawnPulse() {
  const traceIdx = Math.floor(Math.random() * traces.length);
  const trace    = traces[traceIdx];
  const color    = Math.random() > 0.5 ? COLORS.purple : COLORS.cyan;
  return {
    traceIdx,
    segIdx: 0,
    t:      Math.random(),          // 0..1 along current segment
    speed:  0.003 + Math.random() * 0.007,
    color,
    size:   2 + Math.random() * 3,
    tail:   0.35 + Math.random() * 0.35,  // tail length as fraction of segment
    alpha:  0.6 + Math.random() * 0.4,
  };
}

/* ── Interpolation ────────────────────────────────────────── */

function lerpPt(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

/* ── Draw ─────────────────────────────────────────────────── */

function drawTraces() {
  traces.forEach(({ pts, color }) => {
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.strokeStyle = color.replace(')', `, ${TRACE_ALPHA})`).replace('rgb', 'rgba').replace('#', '');

    // Convert hex to rgba manually
    const hex = color.replace('#', '');
    const r   = parseInt(hex.slice(0,2), 16);
    const g   = parseInt(hex.slice(2,4), 16);
    const b   = parseInt(hex.slice(4,6), 16);
    ctx.strokeStyle = `rgba(${r},${g},${b},${TRACE_ALPHA})`;
    ctx.lineWidth   = 1;
    ctx.stroke();

    // Junction dots at bends
    pts.forEach(({ x, y }) => {
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${TRACE_ALPHA * 1.6})`;
      ctx.fill();
    });
  });
}

function drawPulse(p) {
  const trace  = traces[p.traceIdx];
  const pts    = trace.pts;
  const segEnd = pts.length - 1;
  if (p.segIdx >= segEnd) return;

  const a    = pts[p.segIdx];
  const b    = pts[p.segIdx + 1];
  const head = lerpPt(a, b, p.t);

  // Parse color
  const hex = p.color.replace('#', '');
  const r   = parseInt(hex.slice(0,2), 16);
  const g   = parseInt(hex.slice(2,4), 16);
  const bv  = parseInt(hex.slice(4,6), 16);

  // Glow halo
  const grd = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, p.size * 6);
  grd.addColorStop(0,   `rgba(${r},${g},${bv},${p.alpha * 0.9})`);
  grd.addColorStop(0.4, `rgba(${r},${g},${bv},${p.alpha * 0.3})`);
  grd.addColorStop(1,   `rgba(${r},${g},${bv},0)`);
  ctx.beginPath();
  ctx.arc(head.x, head.y, p.size * 6, 0, Math.PI * 2);
  ctx.fillStyle = grd;
  ctx.fill();

  // Core dot
  ctx.beginPath();
  ctx.arc(head.x, head.y, p.size, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r},${g},${bv},${p.alpha})`;
  ctx.fill();

  // Tail
  const tailT  = Math.max(0, p.t - p.tail);
  const tailPt = lerpPt(a, b, tailT);
  const grad   = ctx.createLinearGradient(tailPt.x, tailPt.y, head.x, head.y);
  grad.addColorStop(0, `rgba(${r},${g},${bv},0)`);
  grad.addColorStop(1, `rgba(${r},${g},${bv},${p.alpha * 0.5})`);
  ctx.beginPath();
  ctx.moveTo(tailPt.x, tailPt.y);
  ctx.lineTo(head.x, head.y);
  ctx.strokeStyle  = grad;
  ctx.lineWidth    = p.size * 0.8;
  ctx.lineCap      = 'round';
  ctx.stroke();
}

/* ── Animation loop ───────────────────────────────────────── */

function tick() {
  ctx.clearRect(0, 0, W, H);
  drawTraces();

  pulses.forEach((p, i) => {
    drawPulse(p);
    p.t += p.speed;

    if (p.t >= 1) {
      p.t -= 1;
      p.segIdx++;
      const trace = traces[p.traceIdx];
      if (p.segIdx >= trace.pts.length - 1) {
        // Respawn
        pulses[i] = spawnPulse();
      }
    }
  });

  animId = requestAnimationFrame(tick);
}

/* ── Setup / resize ───────────────────────────────────────── */

function build() {
  W    = window.innerWidth;
  H    = window.innerHeight;
  cols = Math.ceil(W / GRID) + 1;
  rows = Math.ceil(H / GRID) + 1;

  canvas.width  = W;
  canvas.height = H;

  const count = Math.floor((W * H) / 18000);
  traces = Array.from({ length: count }, buildTrace);
  pulses = Array.from({ length: PULSE_COUNT }, spawnPulse);
}

/* ── Public init ──────────────────────────────────────────── */

export function initCircuitBg() {
  canvas = document.createElement('canvas');
  canvas.id = 'circuit-bg';
  canvas.style.cssText = [
    'position:fixed',
    'inset:0',
    'z-index:-1',
    'pointer-events:none',
    'opacity:0.6',
    'filter:blur(1px)',
  ].join(';');

  // Insert before all content but after <body>
  document.body.insertAdjacentElement('afterbegin', canvas);
  ctx = canvas.getContext('2d');

  build();
  tick();

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
