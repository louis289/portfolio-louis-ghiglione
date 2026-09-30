/**
 * tilt.js — 3D Parallax Tilt Effect for Contact Card
 * Uses mousemove for desktop, touchmove and deviceorientation for mobile.
 * Exact 15h49 physics & natural lighting calculation.
 */

export function initTilt() {
  const card = document.getElementById('contact-tilt-card');
  const wrapper = document.getElementById('contact-tilt-wrapper');
  const glare = document.getElementById('contact-tilt-glare');

  if (!card || !wrapper || !glare) return;

  const MAX_TILT = 15; // Max rotation in degrees

  function applyTilt(xPercent, yPercent) {
    // Inverted parallax calculation as at 15h49
    const rotateX = (yPercent * MAX_TILT - MAX_TILT / 2).toFixed(2);
    const rotateY = (MAX_TILT / 2 - xPercent * MAX_TILT).toFixed(2);

    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    glare.style.opacity = '1';
    glare.style.background = `radial-gradient(circle at ${xPercent * 100}% ${yPercent * 100}%, rgba(255,255,255,0.2), transparent 50%)`;
  }

  function resetTilt() {
    card.style.transform = 'rotateX(0deg) rotateY(0deg)';
    glare.style.opacity = '0';
  }

  // --- MOUSE (Desktop) ---
  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    applyTilt(Math.max(0, Math.min(1, x / rect.width)), Math.max(0, Math.min(1, y / rect.height)));
  });

  wrapper.addEventListener('mouseleave', () => {
    resetTilt();
  });
  /*
    // --- TOUCH (Mobile) ---
    wrapper.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1) {
        const rect = wrapper.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        applyTilt(Math.max(0, Math.min(1, x / rect.width)), Math.max(0, Math.min(1, y / rect.height)));
      }
    }, { passive: true });
  
    wrapper.addEventListener('touchend', resetTilt, { passive: true });
  */
  // --- GYROSCOPE (Mobile) ---
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      if (e.gamma === null || e.beta === null) return;
      let gamma = Math.max(-30, Math.min(30, e.gamma));
      let beta = Math.max(0, Math.min(60, e.beta)) - 30;
      const xPercent = (- gamma + 30) / 90;
      const yPercent = (- beta + 30) / 30;
      applyTilt(xPercent, yPercent);
    }, { passive: true });
  }
}
