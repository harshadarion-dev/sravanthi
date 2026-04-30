import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast } from './utils.js';

async function init() {
  const session = await requireAuth();
  if (!session) return;

  // Inject sidebar
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('dashboard');
  initSidebarToggle();
  initLogout();

  // Set admin name in sidebar
  const user = await getCurrentUser();
  if (user) {
    const email = user.email || 'Admin';
    const name = email.split('@')[0];
    const el = document.getElementById('sidebarName');
    const av = document.getElementById('sidebarAvatar');
    if (el) el.textContent = name;
    if (av) av.textContent = name[0].toUpperCase();
  }

  // Load dashboard stats
  await loadStats();
  await loadRecentMessages();
  await loadRecentProjects();
}

async function loadStats() {
  try {
    const [projects, messages, skills, certs] = await Promise.all([
      sb.from('projects').select('id', { count: 'exact', head: true }),
      sb.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('skills').select('id', { count: 'exact', head: true }),
      sb.from('certifications').select('id', { count: 'exact', head: true }),
    ]);
    setText('statProjects', projects.count ?? 0);
    setText('statMessages', messages.count ?? 0);
    setText('statSkills', skills.count ?? 0);
    setText('statCerts', certs.count ?? 0);
  } catch (e) {
    console.error('Stats error:', e);
  }
}

async function loadRecentMessages() {
  const tbody = document.getElementById('recentMessages');
  if (!tbody) return;
  try {
    const { data, error } = await sb.from('contact_messages')
      .select('*').order('created_at', { ascending: false }).limit(5);
    if (error) throw error;
    if (!data?.length) { tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#9CA3AF;padding:24px">No messages yet</td></tr>`; return; }
    tbody.innerHTML = data.map(m => `
      <tr>
        <td><strong>${esc(m.name)}</strong><br><span style="font-size:12px;color:#9CA3AF">${esc(m.email)}</span></td>
        <td>${esc(m.subject || '(No subject)')}</td>
        <td><span class="badge ${m.status === 'new' ? 'badge-info' : m.status === 'replied' ? 'badge-success' : 'badge-gray'}">${m.status}</span></td>
        <td style="font-size:12px;color:#9CA3AF">${fmtDate(m.created_at)}</td>
      </tr>`).join('');
  } catch (e) { tbody.innerHTML = `<tr><td colspan="4" style="color:#EF4444;padding:16px">Error loading messages</td></tr>`; }
}

async function loadRecentProjects() {
  const container = document.getElementById('recentProjects');
  if (!container) return;
  try {
    const { data, error } = await sb.from('projects')
      .select('*').order('created_at', { ascending: false }).limit(3);
    if (error) throw error;
    if (!data?.length) { container.innerHTML = `<p style="color:#9CA3AF;font-size:14px">No projects yet</p>`; return; }
    container.innerHTML = data.map(p => `
      <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #E5E7EB">
        <div style="width:48px;height:48px;border-radius:8px;background:#EFF6FF;flex-shrink:0;overflow:hidden">
          ${p.thumbnail_url ? `<img src="${esc(p.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#2563EB;font-size:20px">📁</div>'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(p.title)}</div>
          <div style="font-size:12px;color:#9CA3AF">${esc(p.category || '')}</div>
        </div>
        <span class="badge ${p.published ? 'badge-success' : 'badge-gray'}">${p.published ? 'Live' : 'Draft'}</span>
      </div>`).join('');
  } catch (e) { container.innerHTML = `<p style="color:#EF4444;font-size:14px">Error loading projects</p>`; }
}

function setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function fmtDate(s) { return s ? new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'; }

init();
