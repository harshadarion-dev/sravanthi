import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, setLoading } from './utils.js';

const KEYS = ['site_title','site_description','og_image','keywords','name','tagline','bio','email','phone','location','linkedin','github','twitter','instagram'];

async function init() {
  const s = await requireAuth(); if (!s) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('settings');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  initTabs(); loadSettings(); initSaveBtns();
}

function initTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    });
  });
}

async function loadSettings() {
  const { data } = await sb.from('settings').select('key,value').in('key', KEYS);
  if (!data) return;
  data.forEach(row => {
    const el = document.getElementById(`setting_${row.key}`);
    if (el) el.value = row.value || '';
  });
}

function initSaveBtns() {
  document.querySelectorAll('[data-save-section]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const section = btn.dataset.saveSection;
      const fields = document.querySelectorAll(`[data-section="${section}"]`);
      setLoading(btn, true);
      try {
        const upserts = [];
        fields.forEach(f => { upserts.push({ key: f.dataset.key, value: f.value }); });
        const { error } = await sb.from('settings').upsert(upserts, { onConflict: 'key' });
        if (error) throw error;
        showToast('Settings saved!');
      } catch (err) { showToast(err.message, 'error'); }
      finally { setLoading(btn, false); }
    });
  });
}

init();
