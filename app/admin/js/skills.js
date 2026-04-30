import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading, openModal, closeModal, initModalClose } from './utils.js';

let editingId = null;

async function init() {
  const session = await requireAuth(); if (!session) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('skills');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  initModalClose(); initForm(); loadSkills();
}

async function loadSkills() {
  const list = document.getElementById('skillsList');
  list.innerHTML = `<div style="text-align:center;padding:32px;color:#9CA3AF">Loading…</div>`;
  const { data, error } = await sb.from('skills').select('*').order('category').order('sort_order');
  if (error) { list.innerHTML = `<p style="color:#EF4444">${error.message}</p>`; return; }
  if (!data?.length) { list.innerHTML = `<div class="empty-state"><h3>No skills yet</h3><p>Add your first skill</p></div>`; return; }

  // Group by category
  const grouped = data.reduce((acc, s) => { (acc[s.category] = acc[s.category] || []).push(s); return acc; }, {});
  list.innerHTML = Object.entries(grouped).map(([cat, skills]) => `
    <div class="card" style="margin-bottom:20px">
      <div class="card-header"><div class="card-title">${esc(cat)}</div></div>
      <div class="card-body" style="padding:16px 24px">
        ${skills.map(s => `
          <div class="skill-row">
            <div class="skill-info"><div class="skill-name">${esc(s.name)}</div></div>
            <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${s.percentage || 0}%"></div></div>
            <div class="skill-pct">${s.percentage || 0}%</div>
            <div class="td-actions">
              <button class="btn btn-ghost btn-icon btn-sm" onclick="editSkill('${s.id}')" title="Edit">✏️</button>
              <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteSkill('${s.id}')" title="Delete">🗑️</button>
            </div>
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function initForm() {
  document.getElementById('addSkillBtn').addEventListener('click', () => {
    editingId = null; document.getElementById('skillForm').reset();
    document.getElementById('pctDisplay').textContent = '80%';
    document.getElementById('modalTitle').textContent = 'Add Skill'; openModal('skillModal');
  });
  document.getElementById('pctRange').addEventListener('input', (e) => {
    document.getElementById('pctDisplay').textContent = e.target.value + '%';
  });
  document.getElementById('skillForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveSkillBtn'); setLoading(btn, true);
    try {
      const f = e.target;
      const payload = { name: f.name.value.trim(), category: f.category.value, percentage: parseInt(f.percentage.value) };
      const { error } = editingId ? await sb.from('skills').update(payload).eq('id', editingId) : await sb.from('skills').insert(payload);
      if (error) throw error;
      showToast(editingId ? 'Updated!' : 'Skill added!'); closeModal('skillModal'); loadSkills();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  });
}

window.editSkill = async (id) => {
  editingId = id;
  const { data } = await sb.from('skills').select('*').eq('id', id).single();
  const f = document.getElementById('skillForm');
  f.name.value = data.name || ''; f.category.value = data.category || 'Cloud Platforms';
  f.percentage.value = data.percentage || 80; document.getElementById('pctDisplay').textContent = (data.percentage || 80) + '%';
  document.getElementById('modalTitle').textContent = 'Edit Skill'; openModal('skillModal');
};

window.deleteSkill = async (id) => {
  if (!await showConfirm('Delete this skill?')) return;
  const { error } = await sb.from('skills').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Deleted'); loadSkills();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
init();
