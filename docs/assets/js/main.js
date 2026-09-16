/* ═══════════════════════════════════════════════════════════
   LUNA GAME STORE — MAIN.JS
   Nav · FAQ · Search · Reveal · UI helpers
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════
  // 1. MOBILE NAV TOGGLE
  // ═══════════════════════════════════════════════════════════
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
      toggle.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.classList.contains('open')) return;
      if (navLinks.contains(e.target) || toggle.contains(e.target)) return;
      toggle.classList.remove('open');
      navLinks.classList.remove('open');
    });

    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. FAQ ACCORDION
  // ═══════════════════════════════════════════════════════════
  function initFaqAccordion() {
    const questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        if (!item) return;

        const isOpen = item.classList.contains('open');

        // Close all others
        document.querySelectorAll('.faq-item').forEach(i => {
          i.classList.remove('open');
        });

        // Open this one if it was closed
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 3. FAQ CATEGORY FILTER
  // ═══════════════════════════════════════════════════════════
  function initCategoryFilter() {
    const chips = document.querySelectorAll('.category-chip');
    const categories = document.querySelectorAll('.faq-category');

    if (!chips.length || !categories.length) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        const target = chip.dataset.category;

        categories.forEach(cat => {
          if (target === 'all' || cat.dataset.category === target) {
            cat.style.display = '';
          } else {
            cat.style.display = 'none';
          }
        });

        // Clear search when filtering
        const searchInput = document.getElementById('faqSearch');
        if (searchInput && searchInput.value) {
          searchInput.value = '';
          const noResults = document.getElementById('noResults');
          if (noResults) noResults.classList.remove('show');
          document.querySelectorAll('.faq-item').forEach(item => {
            item.style.display = '';
          });
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. FAQ LIVE SEARCH
  // ═══════════════════════════════════════════════════════════
  function initFaqSearch() {
    const search = document.getElementById('faqSearch');
    const noResults = document.getElementById('noResults');

    if (!search) return;

    const chips = document.querySelectorAll('.category-chip');
    const categories = document.querySelectorAll('.faq-category');

    // Debounce
    let debounceTimer;
    search.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        runSearch();
      }, 120);
    });

    function runSearch() {
      const query = search.value.trim().toLowerCase();

      // Reset category chips to "All"
      chips.forEach(c => c.classList.remove('active'));
      const allChip = document.querySelector('[data-category="all"]');
      if (allChip) allChip.classList.add('active');

      categories.forEach(cat => cat.style.display = '');

      let visibleCount = 0;

      categories.forEach(cat => {
        const items = cat.querySelectorAll('.faq-item');
        let categoryVisible = 0;

        items.forEach(item => {
          const questionText = item.querySelector('.faq-question').textContent.toLowerCase();
          const answerText = item.querySelector('.faq-answer').textContent.toLowerCase();

          const matches = query === '' ||
            questionText.includes(query) ||
            answerText.includes(query);

          if (matches) {
            item.style.display = '';
            categoryVisible++;
            visibleCount++;
          } else {
            item.style.display = 'none';
          }
        });

        cat.style.display = categoryVisible > 0 ? '' : 'none';
      });

      if (noResults) {
        noResults.classList.toggle('show', visibleCount === 0 && query !== '');
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 5. REVEAL ON SCROLL
  // ═══════════════════════════════════════════════════════════
  function initRevealOnScroll() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!elements.length) return;

    // Skip on reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  // ═══════════════════════════════════════════════════════════
  // 6. SMOOTH ANCHOR SCROLL (for #hash links)
  // ═══════════════════════════════════════════════════════════
  function initSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId === '#' || targetId === '') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({
          top,
          behavior: 'smooth'
        });
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 7. SCROLL-TRIGGERED NAV SHADOW
  // ═══════════════════════════════════════════════════════════
  function initNavShadow() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    let ticking = false;

    window.addEventListener('scroll', () => {
      if (ticking) return;

      requestAnimationFrame(() => {
        if (window.scrollY > 20) {
          nav.style.boxShadow = '0 8px 30px rgba(0, 0, 0, 0.4)';
        } else {
          nav.style.boxShadow = 'none';
        }
        ticking = false;
      });

      ticking = true;
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 8. EXTERNAL LINKS — safe rel attributes
  // ═══════════════════════════════════════════════════════════
  function initExternalLinks() {
    const links = document.querySelectorAll('a[href^="http"]');

    links.forEach(link => {
      // Skip if it points to our own site
      if (link.hostname === window.location.hostname) return;

      if (!link.rel) {
        link.rel = 'noopener noreferrer';
      }
      if (!link.target) {
        link.target = '_blank';
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 9. ACTIVE NAV LINK HIGHLIGHT
  // ═══════════════════════════════════════════════════════════
  function initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-links a');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Match index at root
      if (
        (currentPath === 'index.html' || currentPath === '') &&
        (href === './' || href === 'index.html' || href === '/')
      ) {
        link.classList.add('active');
        return;
      }

      if (href === currentPath) {
        link.classList.add('active');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 10. COUNT-UP ANIMATION (hero stats, etc.)
  // ═══════════════════════════════════════════════════════════
  function initCountUp() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 1500;
        const start = performance.now();

        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          const value = Math.floor(target * eased);

          el.textContent = prefix + value + suffix;

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            el.textContent = prefix + target + suffix;
          }
        }

        requestAnimationFrame(tick);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  // ═══════════════════════════════════════════════════════════
  // 11. TOAST NOTIFICATIONS (reusable)
  // ═══════════════════════════════════════════════════════════
  function showToast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.luna-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `luna-toast luna-toast-${type}`;
    toast.textContent = message;

    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      padding: 1rem 1.75rem;
      border-radius: 999px;
      background: rgba(19, 24, 41, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(0, 217, 255, 0.4);
      color: #FFFFFF;
      font-family: 'Inter', sans-serif;
      font-size: 0.9rem;
      z-index: 9999;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 217, 255, 0.3);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: none;
    `;

    if (type === 'error') {
      toast.style.borderColor = 'rgba(255, 77, 157, 0.5)';
      toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(255, 77, 157, 0.3)';
    } else if (type === 'success') {
      toast.style.borderColor = 'rgba(77, 255, 145, 0.5)';
      toast.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 40px rgba(77, 255, 145, 0.3)';
    }

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 500);
    }, duration);
  }

  // ═══════════════════════════════════════════════════════════
  // 12. KONAMI CODE (fun easter egg)
  // ═══════════════════════════════════════════════════════════
  function initKonami() {
    const sequence = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown',
                      'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
                      'b','a'];
    let index = 0;

    document.addEventListener('keydown', (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === sequence[index]) {
        index++;
        if (index === sequence.length) {
          index = 0;
          triggerEasterEgg();
        }
      } else {
        index = 0;
      }
    });
  }

  function triggerEasterEgg() {
    showToast('🌙 Luna loves you. ✨', 'success', 4000);

    // Bonus shooting stars
    if (window.LunaStars) {
      for (let i = 0; i < 15; i++) {
        setTimeout(() => window.LunaStars.spawnShootingStar(), i * 120);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // BOOT
  // ═══════════════════════════════════════════════════════════
  function init() {
    initMobileNav();
    initFaqAccordion();
    initCategoryFilter();
    initFaqSearch();
    initRevealOnScroll();
    initSmoothAnchors();
    initNavShadow();
    initExternalLinks();
    initActiveNav();
    initCountUp();
    initKonami();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Expose globals ─────────────────────────────
  window.Luna = {
    showToast,
    triggerEasterEgg
  };

})();
