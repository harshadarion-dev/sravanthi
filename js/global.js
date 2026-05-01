/**
 * global.js — Shared UI utilities loaded on every public page
 * - Skeleton loaders
 * - Image fallback
 * - Date formatter
 * - Tag renderer
 * - Smooth reveal (IntersectionObserver)
 * - Skill bar animator
 */

// ── Image fallback ────────────────────────────────────────
const FALLBACK_IMG = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280" viewBox="0 0 400 280"><rect fill="%23F0EEEA" width="400" height="280"/><text fill="%239A9A9A" font-family="Inter,sans-serif" font-size="14" x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle">No image</text></svg>';

function imgWithFallback(el) {
  if (!el) return;
  el.addEventListener('error', () => { el.src = FALLBACK_IMG; el.style.objectFit = 'contain'; });
  if (!el.src || el.src === window.location.href) el.src = FALLBACK_IMG;
}

function applyImageFallbacks() {
  document.querySelectorAll('img[data-dynamic]').forEach(imgWithFallback);
}

// ── Date formatter ────────────────────────────────────────
function formatDate(dateStr, opts = { year: 'numeric', month: 'short' }) {
  if (!dateStr) return 'Present';
  return new Date(dateStr).toLocaleDateString('en-US', opts);
}

// ── HTML escape ───────────────────────────────────────────
function esc(str) {
  const d = document.createElement('div');
  d.textContent = str || '';
  return d.innerHTML;
}

// ── URL formatter ─────────────────────────────────────────
function ensureUrl(url) {
  if (!url) return '';
  url = url.trim();
  if (!url.match(/^https?:\/\//i) && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
    return 'https://' + url;
  }
  return url;
}

// ── Tag list renderer ─────────────────────────────────────
function renderTags(tagsStr) {
  if (!tagsStr) return '';
  return tagsStr.split(',').map(t => `<span class="tag">${esc(t.trim())}</span>`).join('');
}

// ── Skeleton loader ───────────────────────────────────────
function showSkeleton(containerId, rows = 3, type = 'block') {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (type === 'cards') {
    el.innerHTML = Array(rows).fill(0).map(() => `
      <div class="skeleton-card">
        <div class="skeleton skeleton-img"></div>
        <div class="skeleton skeleton-line" style="width:70%;margin-top:12px"></div>
        <div class="skeleton skeleton-line" style="width:50%"></div>
      </div>`).join('');
  } else {
    el.innerHTML = Array(rows).fill(0).map(() => `<div class="skeleton skeleton-line"></div>`).join('');
  }
}

function hideSkeleton(containerId) {
  const el = document.getElementById(containerId);
  if (el) el.innerHTML = '';
}

// ── Reveal animations (IntersectionObserver) ──────────────
function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); observer.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach(el => observer.observe(el));
}

// ── Skill bar animator ────────────────────────────────────
function animateSkillBars() {
  const bars = document.querySelectorAll('.skill-bar-fill[data-width]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.width = (e.target.dataset.width || 0) + '%';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  bars.forEach(b => { b.style.width = '0%'; obs.observe(b); });
}

// ── Empty state ───────────────────────────────────────────
function emptyState(message = 'Nothing here yet.', icon = '📂') {
  return `<div class="empty-state-block"><div style="font-size:40px;margin-bottom:12px">${icon}</div><p style="color:var(--text-muted);font-size:15px">${esc(message)}</p></div>`;
}

// ── Global UI Updates ─────────────────────────────────────
async function initGlobalUI() {
  if (typeof fetchSettings !== 'function') return;
  
  try {
    const s = await fetchSettings();
    if (!s) return;

    // Update global email links
    if (s.email) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = `mailto:${s.email}`;
        if (a.textContent.includes('@')) a.textContent = s.email;
      });
    }

    // Update global phone links
    if (s.phone) {
      document.querySelectorAll('a[href^="tel:"]').forEach(a => {
        a.href = `tel:${String(s.phone).replace(/\D/g, '')}`;
        if (a.textContent.match(/\d/)) a.textContent = s.phone;
      });
    }

    // Update footer social links specifically
    const socialContainers = document.querySelectorAll('.footer-social');
    socialContainers.forEach(socialContainer => {
      socialContainer.innerHTML = '';
      if (s.instagram) socialContainer.innerHTML += `<a href="${esc(ensureUrl(s.instagram))}" aria-label="Instagram" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>`;
      if (s.twitter) socialContainer.innerHTML += `<a href="${esc(ensureUrl(s.twitter))}" aria-label="Twitter" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>`;
      if (s.linkedin) socialContainer.innerHTML += `<a href="${esc(ensureUrl(s.linkedin))}" aria-label="LinkedIn" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>`;
      if (s.github) socialContainer.innerHTML += `<a href="${esc(ensureUrl(s.github))}" aria-label="GitHub" target="_blank" rel="noopener"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>`;
    });
  } catch (e) {
    console.error('Failed to init global UI', e);
  }
}

// Auto-init on load
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initGlobalUI();
});
