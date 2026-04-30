import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm } from './utils.js';

async function init() {
  const s = await requireAuth(); if (!s) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('contact');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  loadMessages('all');
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadMessages(btn.dataset.status);
    });
  });
}

async function loadMessages(status = 'all') {
  const tbody = document.getElementById('messagesTable');
  tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:32px;color:#9CA3AF">Loading…</td></tr>`;
  let q = sb.from('contact_messages').select('*').order('created_at', { ascending: false });
  if (status !== 'all') q = q.eq('status', status);
  const { data, error } = await q;
  if (error) { tbody.innerHTML = `<tr><td colspan="6" style="color:#EF4444;padding:16px">${error.message}</td></tr>`; return; }
  if (!data?.length) { tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><h3>No messages</h3><p>Contact form submissions will appear here</p></div></td></tr>`; return; }
  tbody.innerHTML = data.map(m => `
    <tr style="cursor:pointer" onclick="viewMsg('${m.id}')">
      <td><strong>${esc(m.name)}</strong></td>
      <td><a href="mailto:${esc(m.email)}" style="color:#2563EB">${esc(m.email)}</a></td>
      <td>${esc(m.subject || '(No subject)')}</td>
      <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#6B7280;font-size:13px">${esc(m.message || '')}</td>
      <td><span class="badge ${m.status === 'new' ? 'badge-info' : m.status === 'replied' ? 'badge-success' : 'badge-gray'}">${m.status}</span></td>
      <td style="font-size:12px;color:#9CA3AF">${fmtDate(m.created_at)}</td>
    </tr>`).join('');
}

window.viewMsg = async (id) => {
  const { data: m } = await sb.from('contact_messages').select('*').eq('id', id).single();
  document.getElementById('msgName').textContent = m.name || '—';
  document.getElementById('msgEmail').textContent = m.email || '—';
  document.getElementById('msgSubject').textContent = m.subject || '(No subject)';
  document.getElementById('msgDate').textContent = fmtDate(m.created_at);
  document.getElementById('msgBody').textContent = m.message || '';
  document.getElementById('msgStatus').innerHTML = `<span class="badge ${m.status === 'new' ? 'badge-info' : m.status === 'replied' ? 'badge-success' : 'badge-gray'}">${m.status}</span>`;
  document.getElementById('markRead').onclick = () => updateStatus(id, 'read');
  document.getElementById('markReplied').onclick = () => updateStatus(id, 'replied');
  document.getElementById('deleteMsg').onclick = async () => {
    if (await showConfirm('Delete this message?')) { await sb.from('contact_messages').delete().eq('id', id); showToast('Deleted'); document.getElementById('msgModal').classList.remove('active'); loadMessages('all'); }
  };
  document.getElementById('msgModal').classList.add('active');
  if (m.status === 'new') await updateStatus(id, 'read', false);
};

async function updateStatus(id, status, reload = true) {
  await sb.from('contact_messages').update({ status }).eq('id', id);
  if (reload) { showToast(`Marked as ${status}`); document.getElementById('msgModal').classList.remove('active'); loadMessages('all'); }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function fmtDate(s) { return s ? new Date(s).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }
init();
