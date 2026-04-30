import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading, openModal, closeModal, initModalClose } from './utils.js';

const BUCKET = 'project-images';
let editingId = null;

async function init() {
  const s = await requireAuth(); if (!s) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('certifications');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  initModalClose(); initForm(); load();
}

async function load() {
  const tbody = document.getElementById('certTable');
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:32px;color:#9CA3AF">Loading…</td></tr>`;
  const { data, error } = await sb.from('certifications').select('*').order('year', { ascending: false });
  if (error) { tbody.innerHTML = `<tr><td colspan="5" style="color:#EF4444;padding:16px">${error.message}</td></tr>`; return; }
  if (!data?.length) { tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h3>No certifications yet</h3><p>Add your first certification</p></div></td></tr>`; return; }
  
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:48px;height:36px;border-radius:6px;overflow:hidden;background:#EFF6FF;flex-shrink:0">
            ${c.thumbnail_url ? `<img src="${esc(c.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:18px">📜</div>'}
          </div>
          <div><strong style="font-size:14px">${esc(c.title)}</strong></div>
        </div>
      </td>
      <td>${esc(c.issuer)}</td>
      <td>${c.year || '—'}</td>
      <td>${c.credential_url ? `<a href="${esc(c.credential_url)}" target="_blank" style="color:#2563EB;font-size:13px">View ↗</a>` : '—'}</td>
      <td><div class="td-actions">
        <button class="btn btn-ghost btn-icon btn-sm" onclick="editCert('${c.id}')">✏️</button>
        <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteCert('${c.id}')">🗑️</button>
      </div></td>
    </tr>`).join('');
}

function initForm() {
  const form = document.getElementById('certForm');
  const preview = document.getElementById('imgPreview');
  const previewImg = preview.querySelector('img');

  form.thumbnail.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      preview.style.display = 'block';
      previewImg.src = URL.createObjectURL(file);
    }
  });

  document.getElementById('addCertBtn').addEventListener('click', () => {
    editingId = null; form.reset();
    preview.style.display = 'none'; previewImg.src = '';
    document.getElementById('modalTitle').textContent = 'Add Certification'; openModal('certModal');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveCertBtn'); setLoading(btn, true);
    try {
      const f = e.target;
      let thumbnail_url = null;

      // Handle file upload
      const file = f.thumbnail.files[0];
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `certs/${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadErr } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: publicUrlData } = sb.storage.from(BUCKET).getPublicUrl(path);
        thumbnail_url = publicUrlData.publicUrl;
      }

      const payload = { 
        title: f.title.value.trim(), 
        issuer: f.issuer.value.trim(), 
        year: f.year.value ? parseInt(f.year.value) : null, 
        credential_url: f.credential_url.value.trim() || null 
      };

      if (thumbnail_url) payload.thumbnail_url = thumbnail_url;

      const { error } = editingId ? await sb.from('certifications').update(payload).eq('id', editingId) : await sb.from('certifications').insert(payload);
      if (error) throw error;
      showToast('Saved!'); closeModal('certModal'); load();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  });
}

window.editCert = async (id) => {
  editingId = id;
  const { data } = await sb.from('certifications').select('*').eq('id', id).single();
  const f = document.getElementById('certForm');
  const preview = document.getElementById('imgPreview');
  const previewImg = preview.querySelector('img');

  f.reset();
  f.title.value = data.title || ''; f.issuer.value = data.issuer || '';
  f.year.value = data.year || ''; f.credential_url.value = data.credential_url || '';
  
  if (data.thumbnail_url) {
    preview.style.display = 'block';
    previewImg.src = data.thumbnail_url;
  } else {
    preview.style.display = 'none';
    previewImg.src = '';
  }

  document.getElementById('modalTitle').textContent = 'Edit Certification'; openModal('certModal');
};

window.deleteCert = async (id) => {
  if (!await showConfirm('Delete this certification?')) return;
  const { error } = await sb.from('certifications').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Deleted'); load();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
init();
