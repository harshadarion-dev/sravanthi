import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading, openModal, closeModal, initModalClose } from './utils.js';

let editingId = null;

async function init() {
  const session = await requireAuth(); if (!session) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('experience');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  initModalClose(); initForm(); loadExperience();
}

async function loadExperience() {
  const list = document.getElementById('expList');
  list.innerHTML = `<div style="text-align:center;padding:32px;color:#9CA3AF">Loading…</div>`;
  const { data, error } = await sb.from('experience').select('*').order('sort_order', { ascending: true });
  if (error) { list.innerHTML = `<p style="color:#EF4444">${error.message}</p>`; return; }
  if (!data?.length) { list.innerHTML = `<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><h3>No experience entries</h3><p>Add your first role</p></div>`; return; }
  list.innerHTML = data.map(e => `
    <div class="card" style="margin-bottom:14px">
      <div class="card-body" style="display:flex;align-items:flex-start;gap:16px">
        <div style="flex:1">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px">
            <strong style="font-size:15px">${esc(e.title)}</strong>
            <span class="badge badge-info">${esc(e.company)}</span>
          </div>
          <div style="font-size:13px;color:#9CA3AF;margin-bottom:6px">${esc(e.location || '')} ${e.start_date ? '· ' + fmtDate(e.start_date) + ' — ' + (e.end_date ? fmtDate(e.end_date) : 'Present') : ''}</div>
          <p style="font-size:13px;color:#6B7280;margin:0">${esc(e.description || '')}</p>
          ${e.tags ? `<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">${e.tags.split(',').map(t => `<span class="badge badge-gray">${esc(t.trim())}</span>`).join('')}</div>` : ''}
        </div>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editExp('${e.id}')" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteExp('${e.id}')" title="Delete">🗑️</button>
        </div>
      </div>
    </div>`).join('');
}

function initForm() {
  document.getElementById('addExpBtn').addEventListener('click', () => {
    editingId = null; document.getElementById('expForm').reset();
    document.getElementById('modalTitle').textContent = 'Add Experience'; openModal('expModal');
  });
  document.getElementById('expForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveExpBtn'); setLoading(btn, true);
    try {
      const f = e.target;
      const payload = { title: f.title.value.trim(), company: f.company.value.trim(), location: f.location.value.trim(), start_date: f.start_date.value || null, end_date: f.end_date.value || null, description: f.description.value.trim(), tags: f.tags.value.trim() };
      const { error } = editingId ? await sb.from('experience').update(payload).eq('id', editingId) : await sb.from('experience').insert(payload);
      if (error) throw error;
      showToast(editingId ? 'Updated!' : 'Added!'); closeModal('expModal'); loadExperience();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  });
}

window.editExp = async (id) => {
  editingId = id;
  const { data } = await sb.from('experience').select('*').eq('id', id).single();
  const f = document.getElementById('expForm');
  f.title.value = data.title || ''; f.company.value = data.company || ''; f.location.value = data.location || '';
  f.start_date.value = data.start_date || ''; f.end_date.value = data.end_date || '';
  f.description.value = data.description || ''; f.tags.value = data.tags || '';
  document.getElementById('modalTitle').textContent = 'Edit Experience'; openModal('expModal');
};

window.deleteExp = async (id) => {
  if (!await showConfirm('Delete this experience entry?')) return;
  const { error } = await sb.from('experience').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Deleted'); loadExperience();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function fmtDate(s) { return s ? new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : ''; }
init();
