/**
 * tilt.js — 3D Parallax Tilt Effect for Contact Card
 * Uses mousemove for desktop and deviceorientation for mobile.
 */

export function initTilt() {
  const card = document.getElementById('contact-tilt-card');
  const wrapper = document.getElementById('contact-tilt-wrapper');
  const glare = document.getElementById('contact-tilt-glare');

  if (!card || !wrapper || !glare) return;

  const MAX_TILT = 15; // Max rotation in degrees

  function applyTilt(xPercent, yPercent) {
    const rotateX = (MAX_TILT / 2 - yPercent * MAX_TILT).toFixed(2);
    const rotateY = (xPercent * MAX_TILT - MAX_TILT / 2).toFixed(2);

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
    applyTilt(x / rect.width, y / rect.height);
  });

  wrapper.addEventListener('mouseleave', () => {
    resetTilt();
  });

  // --- GYROSCOPE (Mobile) ---
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      // e.gamma is the left-to-right tilt in degrees, where right is positive (-90 to 90)
      // e.beta is the front-to-back tilt in degrees, where front is positive (-180 to 180)
      if (e.gamma === null || e.beta === null) return;

      // Normalize gamma (tilt left/right) and beta (tilt forward/backward)
      let gamma = e.gamma;
      let beta = e.beta;

      // Clamp values to a comfortable reading range
      gamma = Math.max(-30, Math.min(30, gamma));
      beta = Math.max(0, Math.min(60, beta)) - 30; // Assuming typical holding angle around 30deg

      const xPercent = (gamma + 30) / 60; // 0 to 1
      const yPercent = (beta + 30) / 60;  // 0 to 1

      applyTilt(xPercent, yPercent);
    }, true);
  }
}
