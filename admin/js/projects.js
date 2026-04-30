import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading, openModal, closeModal, initModalClose } from './utils.js';

const BUCKET = 'project-images';
let editingId = null;

async function init() {
  const session = await requireAuth();
  if (!session) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('projects');
  initSidebarToggle();
  initLogout();
  const user = await getCurrentUser();
  if (user) {
    const n = user.email.split('@')[0];
    const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar');
    if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase();
  }
  initModalClose();
  initForm();
  loadProjects();
}

async function loadProjects(search = '', category = 'all') {
  const tbody = document.getElementById('projectsTable');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#9CA3AF">Loading…</td></tr>`;
  let q = sb.from('projects').select('*').order('sort_order', { ascending: true });
  if (search) q = q.ilike('title', `%${search}%`);
  if (category !== 'all') q = q.eq('category', category);
  const { data, error } = await q;
  if (error) { tbody.innerHTML = `<tr><td colspan="6" style="color:#EF4444;padding:16px">Error: ${error.message}</td></tr>`; return; }
  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg><h3>No projects yet</h3><p>Click "Add Project" to create your first one</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(p => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:48px;height:36px;border-radius:6px;overflow:hidden;background:#EFF6FF;flex-shrink:0">
            ${p.thumbnail_url ? `<img src="${esc(p.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:18px">📁</div>'}
          </div>
          <div><strong style="font-size:14px">${esc(p.title)}</strong>${p.live_url ? `<br><a href="${esc(p.live_url)}" target="_blank" style="font-size:12px;color:#2563EB">View Live ↗</a>` : ''}</div>
        </div>
      </td>
      <td><span class="badge badge-info">${esc(p.category || '—')}</span></td>
      <td style="font-size:13px;color:#6B7280;max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.tech_stack || '—')}</td>
      <td><span class="badge ${p.featured ? 'badge-warning' : 'badge-gray'}">${p.featured ? '★ Featured' : 'Normal'}</span></td>
      <td><span class="badge ${p.published ? 'badge-success' : 'badge-gray'}">${p.published ? 'Published' : 'Draft'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editProject('${p.id}')" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteProject('${p.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function initForm() {
  document.getElementById('addProjectBtn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('projectForm').reset();
    document.getElementById('modalTitle').textContent = 'Add New Project';
    document.getElementById('thumbPreview').style.display = 'none';
    openModal('projectModal');
  });

  document.getElementById('projectForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveProjectBtn');
    setLoading(btn, true);
    try {
      const form = e.target;
      let thumbnail_url = form.currentThumb?.value || null;
      const file = form.thumbnail.files[0];
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadErr } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true });
        if (uploadErr) throw uploadErr;
        const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
        thumbnail_url = urlData.publicUrl;
      }
      const payload = {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        category: form.category.value,
        tech_stack: form.tech_stack.value.trim(),
        live_url: form.live_url.value.trim() || null,
        github_url: form.github_url.value.trim() || null,
        featured: form.featured.checked,
        published: form.published.checked,
        thumbnail_url,
      };
      if (editingId) {
        const { error } = await sb.from('projects').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Project updated!');
      } else {
        const { error } = await sb.from('projects').insert(payload);
        if (error) throw error;
        showToast('Project created!');
      }
      closeModal('projectModal');
      loadProjects();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  });

  // Thumbnail preview
  document.getElementById('thumbnailInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const prev = document.getElementById('thumbPreview');
      prev.style.display = 'block';
      prev.querySelector('img').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Search & filter
  document.getElementById('searchInput').addEventListener('input', (e) => loadProjects(e.target.value, document.getElementById('catFilter').value));
  document.getElementById('catFilter').addEventListener('change', (e) => loadProjects(document.getElementById('searchInput').value, e.target.value));
}

window.editProject = async (id) => {
  editingId = id;
  const { data, error } = await sb.from('projects').select('*').eq('id', id).single();
  if (error) { showToast('Error loading project', 'error'); return; }
  const form = document.getElementById('projectForm');
  form.title.value = data.title || '';
  form.description.value = data.description || '';
  form.category.value = data.category || 'pipelines';
  form.tech_stack.value = data.tech_stack || '';
  form.live_url.value = data.live_url || '';
  form.github_url.value = data.github_url || '';
  form.featured.checked = !!data.featured;
  form.published.checked = !!data.published;
  const prev = document.getElementById('thumbPreview');
  if (data.thumbnail_url) { prev.style.display = 'block'; prev.querySelector('img').src = data.thumbnail_url; }
  else { prev.style.display = 'none'; }
  document.getElementById('modalTitle').textContent = 'Edit Project';
  openModal('projectModal');
};

window.deleteProject = async (id) => {
  const ok = await showConfirm('Delete this project? This cannot be undone.');
  if (!ok) return;
  const { error } = await sb.from('projects').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Project deleted');
  loadProjects();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

init();
