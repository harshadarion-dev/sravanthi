import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, setLoading } from './utils.js';

const BUCKET = 'resume-files';

async function init() {
  const s = await requireAuth(); if (!s) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('resume');
  initSidebarToggle(); initLogout();
  const user = await getCurrentUser();
  if (user) { const n = user.email.split('@')[0]; const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar'); if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase(); }
  loadResume(); initUpload();
}

async function loadResume() {
  const area = document.getElementById('currentResume');
  try {
    const { data } = await sb.from('settings').select('value').eq('key', 'resume_url').single();
    const url = data?.value;
    if (url) {
      area.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;padding:20px;background:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB">
          <div style="width:48px;height:48px;background:#EFF6FF;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:24px">📄</div>
          <div style="flex:1"><div style="font-size:14px;font-weight:600">Current Resume</div><div style="font-size:12px;color:#9CA3AF;margin-top:2px">PDF File</div></div>
          <a href="${url}" target="_blank" download class="btn btn-primary btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download
          </a>
        </div>`;
    } else {
      area.innerHTML = `<p style="color:#9CA3AF;font-size:14px">No resume uploaded yet. Upload one below.</p>`;
    }
  } catch (e) {
    area.innerHTML = `<p style="color:#9CA3AF;font-size:14px">No resume uploaded yet.</p>`;
  }
}

function initUpload() {
  const zone = document.getElementById('resumeZone');
  const input = document.getElementById('resumeInput');
  const btn = document.getElementById('uploadResumeBtn');

  zone.addEventListener('click', () => input.click());
  zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('dragover'); const file = e.dataTransfer.files[0]; if (file) handleFile(file); });
  input.addEventListener('change', () => { if (input.files[0]) handleFile(input.files[0]); });

  async function handleFile(file) {
    if (file.type !== 'application/pdf') { showToast('Please upload a PDF file', 'error'); return; }
    setLoading(btn, true);
    try {
      const fileName = `resume_${Date.now()}.pdf`;
      const { error: upErr } = await sb.storage.from(BUCKET).upload(fileName, file, { upsert: true, contentType: 'application/pdf' });
      if (upErr) throw upErr;
      const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      // Save URL to settings table
      const { error: dbErr } = await sb.from('settings').upsert({ key: 'resume_url', value: publicUrl }, { onConflict: 'key' });
      if (dbErr) throw dbErr;
      showToast('Resume uploaded successfully!');
      loadResume();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  }
}

init();
