/**
 * analytics.js — Lightweight GA4 Event Tracker
 * Sravanthi Maha Portfolio
 *
 * Tracks: page views, CTA clicks, resume downloads, contact form submissions,
 *         blog reads, project views, scroll depth, and session source.
 *
 * Replace GA_MEASUREMENT_ID with your real GA4 Measurement ID (G-XXXXXXXXXX)
 * Replace SC_VERIFY_CODE with your Search Console HTML tag meta content value
 */

const GA_MEASUREMENT_ID  = 'G-WMBZND0S52'; // ← Replace with your GA4 ID
const BING_VERIFY_CODE   = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // ← Replace with Bing code
const SC_VERIFY_CODE     = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'; // ← Replace with GSC code

// ── Inject GA4 Script ─────────────────────────────────────────────────────────
(function injectGA4() {
  if (GA_MEASUREMENT_ID === 'G-XXXXXXXXXX') return; // Skip if placeholder

  const script = document.createElement('script');
  script.async = true;
  script.src   = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title:    document.title,
    page_location: window.location.href,
    send_page_view: true,
    custom_map: {
      dimension1: 'user_type',
      dimension2: 'page_section',
    },
  });
})();

// ── Inject Verification Meta Tags ─────────────────────────────────────────────
(function injectVerification() {
  // Google Search Console
  if (SC_VERIFY_CODE !== 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
    const gsc = document.createElement('meta');
    gsc.name    = 'google-site-verification';
    gsc.content = SC_VERIFY_CODE;
    document.head.appendChild(gsc);
  }

  // Bing Webmaster Tools
  if (BING_VERIFY_CODE !== 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
    const bing = document.createElement('meta');
    bing.name    = 'msvalidate.01';
    bing.content = BING_VERIFY_CODE;
    document.head.appendChild(bing);
  }
})();

// ── Event Tracking Helpers ────────────────────────────────────────────────────
function trackEvent(eventName, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', eventName, {
    event_category: params.category || 'engagement',
    event_label:    params.label    || '',
    value:          params.value    || undefined,
    ...params,
  });
}

// ── CTA Button Tracking ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', function() {

  // Track "Let's Talk" / "Contact Me" CTA clicks
  document.querySelectorAll('a[href="contact.html"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('cta_click', { category: 'CTA', label: 'Contact CTA — ' + el.textContent.trim() });
    });
  });

  // Track "Download Resume" clicks
  document.querySelectorAll('a[href="resume.html"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('resume_view', { category: 'Conversion', label: 'Resume Page Visit' });
    });
  });

  // Track "View Work" / Projects CTA
  document.querySelectorAll('a[href="projects.html"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('projects_view', { category: 'Navigation', label: 'Projects — ' + el.textContent.trim() });
    });
  });

  // Track Contact Form Submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', () => {
      trackEvent('contact_form_submit', { category: 'Conversion', label: 'Contact Form Submitted', value: 1 });
    });
  }

  // Track Blog Article reads (on blog pages)
  if (window.location.pathname.includes('/blog/')) {
    trackEvent('blog_read', { category: 'Content', label: document.title });
  }

  // Track LinkedIn / GitHub social link clicks
  document.querySelectorAll('[aria-label="LinkedIn"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('social_click', { category: 'Social', label: 'LinkedIn Profile' });
    });
  });
  document.querySelectorAll('[aria-label="GitHub"]').forEach(el => {
    el.addEventListener('click', () => {
      trackEvent('social_click', { category: 'Social', label: 'GitHub Profile' });
    });
  });

  // ── Scroll Depth Tracking ──────────────────────────────────────────────────
  const depths = [25, 50, 75, 90];
  const reached = new Set();
  window.addEventListener('scroll', function scrollDepthTracker() {
    const scrollPct = Math.round(
      (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
    );
    depths.forEach(d => {
      if (scrollPct >= d && !reached.has(d)) {
        reached.add(d);
        trackEvent('scroll_depth', { category: 'Engagement', label: `${d}%`, value: d });
      }
    });
  }, { passive: true });

  // ── Session Source Attribution ─────────────────────────────────────────────
  const ref = document.referrer;
  if (ref) {
    const isRecruiter = /linkedin|indeed|glassdoor|lever|greenhouse|workday/i.test(ref);
    if (isRecruiter) {
      trackEvent('recruiter_visit', { category: 'Recruiter', label: ref });
    }
  }

});
