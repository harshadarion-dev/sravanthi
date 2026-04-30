import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading } from './utils.js';

const BUCKET = 'project-images';

async function init() {
  const s = await requireAuth(); if (!s) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('media');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  loadMedia(); initUpload();
}

async function loadMedia() {
  const grid = document.getElementById('mediaGrid');
  grid.innerHTML = `<p style="color:#9CA3AF;font-size:14px">Loading…</p>`;
  const { data, error } = await sb.storage.from(BUCKET).list('', { limit: 100, offset: 0, sortBy: { column: 'created_at', order: 'desc' } });
  if (error) { grid.innerHTML = `<p style="color:#EF4444">${error.message}</p>`; return; }
  const images = data.filter(f => f.name && /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name));
  if (!images.length) { grid.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg><h3>No images yet</h3><p>Upload images using the zone above</p></div>`; return; }
  grid.innerHTML = images.map(img => {
    const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(img.name);
    const url = urlData.publicUrl;
    return `
      <div class="media-card">
        <img src="${url}" alt="${esc(img.name)}" loading="lazy">
        <div class="media-card-name">${esc(img.name)}</div>
        <div class="media-card-actions">
          <button class="btn btn-ghost btn-sm" style="background:rgba(255,255,255,0.9);color:#111" onclick="copyUrl('${url}')" title="Copy URL">📋</button>
          <button class="btn btn-danger btn-sm" onclick="deleteMedia('${esc(img.name)}')" title="Delete">🗑️</button>
        </div>
      </div>`;
  }).join('');
}

function initUpload() {
  const zone = document.getElementById('uploadZone');
  const input = document.getElementById('mediaInput');
  const btn = document.getElementById('uploadBtn');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('dragover'); uploadFiles(e.dataTransfer.files); });
  input.addEventListener('change', () => uploadFiles(input.files));

  async function uploadFiles(files) {
    if (!files?.length) return;
    setLoading(btn, true);
    let success = 0;
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const name = `img_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(name, file, { upsert: false });
      if (!error) success++;
    }
    showToast(`${success} image${success !== 1 ? 's' : ''} uploaded!`);
    setLoading(btn, false);
    loadMedia();
  }
}

window.copyUrl = (url) => {
  navigator.clipboard.writeText(url).then(() => showToast('URL copied!'));
};

window.deleteMedia = async (name) => {
  if (!await showConfirm(`Delete "${name}"? This cannot be undone.`)) return;
  const { error } = await sb.storage.from(BUCKET).remove([name]);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Deleted'); loadMedia();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
init();
