/* ═══════════════════════════════════════════════════════════
   LUNA GAME STORE — STARS.JS
   Animated starfield canvas · Shooting stars · Parallax
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ─── Config ─────────────────────────────────────
  const CONFIG = {
    starDensity: 8000,        // lower = more stars (px² per star)
    shootingStarChance: 0.75, // probability per interval tick
    shootingStarInterval: 4000,
    starColors: [
      { rgb: '255,255,255', weight: 0.72 }, // white
      { rgb: '123,92,255',  weight: 0.15 }, // purple
      { rgb: '0,217,255',   weight: 0.10 }, // cyan
      { rgb: '255,184,0',   weight: 0.03 }  // amber
    ],
    shootingStarColor: '0,217,255', // cyan
    parallaxEnabled: true
  };

  // ─── Canvas setup ───────────────────────────────
  const canvas = document.getElementById('stars');
  if (!canvas) return; // no canvas on this page — silently skip

  const ctx = canvas.getContext('2d');
  let stars = [];
  let shootingStars = [];
  let lastFrame = 0;
  let isRunning = true;

  // ─── Resize ─────────────────────────────────────
  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    buildStars();
  }

  // ─── Build starfield ────────────────────────────
  function buildStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / CONFIG.starDensity);

    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.7 + 0.3,
        speed: Math.random() * 0.02 + 0.005,
        phase: Math.random() * Math.PI * 2,
        color: pickStarColor()
      });
    }
  }

  // ─── Weighted random color pick ─────────────────
  function pickStarColor() {
    const roll = Math.random();
    let cumulative = 0;

    for (const c of CONFIG.starColors) {
      cumulative += c.weight;
      if (roll <= cumulative) return c.rgb;
    }
    return CONFIG.starColors[0].rgb;
  }

  // ─── Shooting stars ─────────────────────────────
  function spawnShootingStar() {
    shootingStars.push({
      x: Math.random() * canvas.width,
      y: -20,
      vx: -6 - Math.random() * 4,
      vy: 4 + Math.random() * 3,
      len: 100 + Math.random() * 80,
      life: 1,
      color: CONFIG.shootingStarColor
    });
  }

  // ─── Draw loop ──────────────────────────────────
  function draw(timestamp) {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // ── Twinkling stars ──
    stars.forEach(s => {
      s.phase += s.speed;
      const twinkle = Math.sin(s.phase) * 0.4 + 0.6;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${s.alpha * twinkle})`;
      ctx.fill();
    });

    // ── Shooting stars ──
    shootingStars = shootingStars.filter(s => s.life > 0);

    shootingStars.forEach(s => {
      const tailX = s.x - s.vx * (s.len / 10);
      const tailY = s.y - s.vy * (s.len / 10);

      const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
      grad.addColorStop(0, `rgba(${s.color},${s.life})`);
      grad.addColorStop(1, `rgba(${s.color},0)`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tailX, tailY);
      ctx.stroke();

      s.x += s.vx;
      s.y += s.vy;
      s.life -= 0.012;
    });

    requestAnimationFrame(draw);
  }

  // ─── Intersection observer — pause when hidden ──
  function setupVisibilityPause() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        isRunning = false;
      } else if (!isRunning) {
        isRunning = true;
        requestAnimationFrame(draw);
      }
    });
  }

  // ─── Parallax nebulas on scroll ─────────────────
  function setupParallax() {
    if (!CONFIG.parallaxEnabled) return;

    const neb1 = document.querySelector('.nebula-1');
    const neb2 = document.querySelector('.nebula-2');

    if (!neb1 || !neb2) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;

      requestAnimationFrame(() => {
        const y = window.scrollY;
        neb1.style.transform = `translate(${y * 0.05}px, ${y * 0.08}px)`;
        neb2.style.transform = `translate(${-y * 0.05}px, ${-y * 0.06}px)`;
        ticking = false;
      });

      ticking = true;
    }, { passive: true });
  }

  // ─── Reduced motion check ───────────────────────
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ─── Init ───────────────────────────────────────
  function init() {
    if (prefersReducedMotion()) return;

    window.addEventListener('resize', resize);
    resize();
    requestAnimationFrame(draw);

    // Auto-spawn shooting stars
    setInterval(() => {
      if (Math.random() < CONFIG.shootingStarChance) {
        spawnShootingStar();
      }
    }, CONFIG.shootingStarInterval);

    setupVisibilityPause();
    setupParallax();
  }

  // ─── Boot when DOM is ready ─────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Expose manual control (optional) ───────────
  window.LunaStars = {
    spawnShootingStar,
    pause: () => { isRunning = false; },
    resume: () => { isRunning = true; requestAnimationFrame(draw); }
  };

})();
