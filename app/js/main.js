/**
 * Finox Portfolio - Main JavaScript
 * Handles animations, interactions, scroll effects, form validation
 */

(function() {
  'use strict';

  // ============================================
  // DOM ELEMENTS
  // ============================================
  const navbar = document.querySelector('.navbar');
  const navToggle = document.querySelector('.nav-toggle');
  const navOverlay = document.querySelector('.nav-overlay');
  const scrollTopBtn = document.querySelector('.scroll-top');
  const revealElements = document.querySelectorAll('.reveal');
  const statNumbers = document.querySelectorAll('[data-count]');
  const skillBars = document.querySelectorAll('.skill-bar-fill');
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('[data-category]');
  const contactForm = document.querySelector('.contact-form');

  // ============================================
  // NAVBAR SCROLL EFFECT
  // ============================================
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  // ============================================
  // MOBILE NAVIGATION
  // ============================================
  function toggleMobileNav() {
    navToggle.classList.toggle('active');
    navOverlay.classList.toggle('active');
    document.body.style.overflow = navOverlay.classList.contains('active') ? 'hidden' : '';
  }

  function closeMobileNav() {
    navToggle.classList.remove('active');
    navOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============================================
  // SCROLL TO TOP
  // ============================================
  function handleScrollTop() {
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ============================================
  // SCROLL REVEAL (Intersection Observer)
  // ============================================
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // ============================================
  // ANIMATED COUNTER
  // ============================================
  function animateCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.dataset.count);
          const suffix = el.dataset.suffix || '';
          const prefix = el.dataset.prefix || '';
          const duration = parseInt(el.dataset.duration) || 2000;
          const startTime = performance.now();

          function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            el.textContent = prefix + current + suffix;

            if (progress < 1) {
              requestAnimationFrame(updateCounter);
            } else {
              el.textContent = prefix + target + suffix;
            }
          }

          requestAnimationFrame(updateCounter);
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));
  }

  // ============================================
  // SKILL BAR ANIMATION
  // ============================================
  function animateSkillBars() {
    const skillObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const width = bar.dataset.width;
          setTimeout(() => {
            bar.style.width = width + '%';
          }, 200);
          skillObserver.unobserve(bar);
        }
      });
    }, { threshold: 0.5 });

    skillBars.forEach(bar => skillObserver.observe(bar));
  }

  // ============================================
  // PROJECT FILTERING
  // ============================================
  function initProjectFilter() {
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const filter = tab.dataset.filter;

        // Update active tab
        filterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Filter cards
        projectCards.forEach(card => {
          const category = card.dataset.category;
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden');
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 50);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.classList.add('hidden');
            }, 300);
          }
        });
      });
    });
  }

  // ============================================
  // CONTACT FORM VALIDATION
  // ============================================
  function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = contactForm.querySelector('[name="name"]');
      const email = contactForm.querySelector('[name="email"]');
      const message = contactForm.querySelector('[name="message"]');
      let isValid = true;

      // Reset errors
      contactForm.querySelectorAll('.form-input').forEach(input => {
        input.style.borderColor = '';
      });

      // Validate name
      if (!name.value.trim() || name.value.trim().length < 2) {
        name.style.borderColor = 'var(--error)';
        isValid = false;
      }

      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailRegex.test(email.value)) {
        email.style.borderColor = 'var(--error)';
        isValid = false;
      }

      // Validate message
      if (!message.value.trim() || message.value.trim().length < 10) {
        message.style.borderColor = 'var(--error)';
        isValid = false;
      }

      if (isValid) {
        // Show success state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Message Sent!';
        submitBtn.style.background = 'var(--success)';
        submitBtn.disabled = true;

        setTimeout(() => {
          submitBtn.textContent = originalText;
          submitBtn.style.background = '';
          submitBtn.disabled = false;
          contactForm.reset();
        }, 3000);
      }
    });
  }

  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });

          // Close mobile nav if open
          if (navOverlay && navOverlay.classList.contains('active')) {
            closeMobileNav();
          }
        }
      });
    });
  }

  // ============================================
  // HEADER HIDE/SHOW ON SCROLL
  // ============================================
  let lastScrollY = 0;
  let ticking = false;

  function handleHeaderVisibility() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 200) {
      // Scrolling down - hide navbar
      navbar.style.transform = 'translateY(-100%)';
    } else {
      // Scrolling up - show navbar
      navbar.style.transform = 'translateY(0)';
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function onScroll() {
    handleNavbarScroll();
    handleScrollTop();

    if (!ticking) {
      requestAnimationFrame(handleHeaderVisibility);
      ticking = true;
    }
  }

  // ============================================
  // CURRENT PAGE ACTIVE NAV
  // ============================================
  function setActiveNav() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';

    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === pageName || (pageName === '' && href === 'index.html') || (pageName === 'index.html' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // ============================================
  // PARALLAX EFFECT FOR HERO PORTRAIT
  // ============================================
  function initParallax() {
    const portrait = document.querySelector('.hero-portrait img');
    if (!portrait) return;

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        portrait.style.transform = `translateY(${scrolled * 0.15}px)`;
      }
    }, { passive: true });
  }

  // ============================================
  // WHATSAPP FLOATING BUTTON
  // ============================================
  function initWhatsAppButton() {
    const waBtn = document.querySelector('.whatsapp-float');
    if (!waBtn) return;

    waBtn.addEventListener('click', () => {
      const phone = '1234567890'; // Replace with actual number
      const message = encodeURIComponent('Hello! I\'m interested in your design services.');
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    });
  }

  // ============================================
  // SVG ARROW DRAW ANIMATION
  // ============================================
  function initArrowDraw() {
    const arrow = document.querySelector('.about-arrow svg path');
    if (!arrow) return;

    const pathLength = arrow.getTotalLength ? arrow.getTotalLength() : 500;
    arrow.style.strokeDasharray = pathLength;
    arrow.style.strokeDashoffset = pathLength;

    const arrowObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          arrow.style.transition = 'stroke-dashoffset 2s ease-out';
          arrow.style.strokeDashoffset = '0';
          arrowObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    arrowObserver.observe(arrow.closest('.about-arrow'));
  }

  // ============================================
  // STAGGER ANIMATION FOR LISTS
  // ============================================
  function initStaggerAnimations() {
    document.querySelectorAll('.stagger-container').forEach(container => {
      const children = container.children;
      Array.from(children).forEach((child, index) => {
        child.style.setProperty('--i', index);
        child.classList.add('reveal');
      });
    });
  }

  // ============================================
  // INITIALIZE EVERYTHING
  // ============================================
  function init() {
    // Event listeners
    window.addEventListener('scroll', onScroll, { passive: true });

    if (navToggle) {
      navToggle.addEventListener('click', toggleMobileNav);
    }

    if (navOverlay) {
      navOverlay.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileNav);
      });
    }

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', scrollToTop);
    }

    // Initialize features
    initStaggerAnimations();
    initScrollReveal();
    animateCounters();
    animateSkillBars();
    initProjectFilter();
    initContactForm();
    initSmoothScroll();
    setActiveNav();
    initParallax();
    initWhatsAppButton();
    initArrowDraw();

    // Initial navbar state
    handleNavbarScroll();
    handleScrollTop();

    // Add loaded class to body for initial animations
    document.body.classList.add('loaded');
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
