/**
 * tilt.js — Amplified 3D Parallax Tilt & Specular Lighting for Contact Card
 * Supports desktop mouse movement, mobile touch tracking, and device gyroscope.
 */

export function initTilt() {
  const card = document.getElementById('contact-tilt-card');
  const wrapper = document.getElementById('contact-tilt-wrapper');
  const glare = document.getElementById('contact-tilt-glare');

  if (!card || !wrapper || !glare) return;

  // Amplified tilt range in degrees
  const MAX_TILT = 26;
  let isInteracting = false;
  let resetTimeout = null;

  function applyTilt(xPercent, yPercent) {
    isInteracting = true;
    if (resetTimeout) clearTimeout(resetTimeout);

    // Inverted 3D rotational physics
    const rotateX = ((yPercent - 0.5) * -MAX_TILT).toFixed(2);
    const rotateY = ((xPercent - 0.5) * MAX_TILT).toFixed(2);

    // Dynamic directional shadow that shifts opposite to the light source
    const shadowX = ((xPercent - 0.5) * -35).toFixed(1);
    const shadowY = ((yPercent - 0.5) * -35).toFixed(1);

    // Apply amplified 3D transform with depth pop
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
    card.style.boxShadow = `${shadowX}px ${shadowY}px 55px rgba(0, 0, 0, 0.55), 0 0 50px rgba(0, 212, 255, 0.35), 0 0 30px rgba(109, 74, 255, 0.25)`;
    card.style.borderColor = 'rgba(0, 212, 255, 0.45)';

    // Amplified radiant glare with prismatic light rings
    const gx = (xPercent * 100).toFixed(1);
    const gy = (yPercent * 100).toFixed(1);
    glare.style.opacity = '1';
    glare.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255, 255, 255, 0.55) 0%, rgba(0, 212, 255, 0.38) 22%, rgba(109, 74, 255, 0.20) 48%, transparent 72%)`;
  }

  function resetTilt() {
    isInteracting = false;
    card.style.transform = 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.boxShadow = '0 25px 60px rgba(0, 0, 0, 0.4), 0 0 35px rgba(109, 74, 255, 0.15)';
    card.style.borderColor = 'rgba(255, 255, 255, 0.16)';
    glare.style.opacity = '0';
  }

  // ── DESKTOP MOUSE EVENTS ───────────────────────────────────
  wrapper.addEventListener('mousemove', (e) => {
    const rect = wrapper.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    applyTilt(x, y);
  });

  wrapper.addEventListener('mouseleave', () => {
    resetTimeout = setTimeout(resetTilt, 200);
  });

  // ── MOBILE TOUCH EVENTS (Swipe & Tilt on touchscreens) ─────
  wrapper.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      const rect = wrapper.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
      applyTilt(x, y);
    }
  }, { passive: true });

  wrapper.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      const rect = wrapper.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
      applyTilt(x, y);
    }
  }, { passive: true });

  wrapper.addEventListener('touchend', () => {
    resetTimeout = setTimeout(resetTilt, 400);
  }, { passive: true });

  wrapper.addEventListener('touchcancel', () => {
    resetTimeout = setTimeout(resetTilt, 200);
  }, { passive: true });

  // ── MOBILE GYROSCOPE (DeviceOrientation) ───────────────────
  if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', (e) => {
      // If user is currently dragging with finger, prioritize touch
      if (isInteracting && e.type === 'deviceorientation') return;

      if (e.gamma === null || e.beta === null) return;

      // Gamma = left/right tilt (-90 to 90)
      // Beta = front/back tilt (-180 to 180)
      let gamma = Math.max(-32, Math.min(32, e.gamma));
      let beta = Math.max(-20, Math.min(44, e.beta - 32)); // Centered around ~32deg holding angle

      const xPercent = (gamma + 32) / 64;
      const yPercent = (beta + 20) / 64;

      applyTilt(xPercent, yPercent);
    }, { passive: true });
  }
}
