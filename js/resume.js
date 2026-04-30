/**
 * resume.js — Dynamic resume page: live download button, highlights from Supabase
 */

async function initResume() {
  await injectSEO('Resume');
  const [resumeUrl, settings] = await Promise.all([fetchResumeUrl(), fetchSettings()]);
  renderResume(resumeUrl, settings);
}

function renderResume(url, settings) {
  // Download buttons
  document.querySelectorAll('.resume-download-btn').forEach(btn => {
    if (url) {
      btn.href = url;
      btn.download = '';
      btn.removeAttribute('aria-disabled');
    } else {
      btn.style.opacity = '0.4';
      btn.style.pointerEvents = 'none';
      btn.setAttribute('aria-disabled', 'true');
      btn.title = 'Resume not available yet';
    }
  });

  // PDF embed
  const embed = document.getElementById('resumeEmbed');
  if (embed && url) {
    embed.innerHTML = `<iframe src="${url}" width="100%" height="700px" style="border:none;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.08)" title="Resume PDF"></iframe>`;
  } else if (embed) {
    embed.innerHTML = `<div style="text-align:center;padding:60px;background:var(--bg-card);border-radius:12px;border:2px dashed var(--border-light)">
      <div style="font-size:48px;margin-bottom:16px">📄</div>
      <p style="color:var(--text-muted);font-size:16px">Resume will appear here once uploaded</p>
    </div>`;
  }

  // Contact info on resume page
  if (settings.email) {
    const el = document.getElementById('resumeEmail');
    if (el) { el.href = `mailto:${settings.email}`; el.textContent = settings.email; }
  }
  if (settings.linkedin) {
    const el = document.getElementById('resumeLinkedin');
    if (el) el.href = settings.linkedin;
  }
}

document.addEventListener('DOMContentLoaded', initResume);
