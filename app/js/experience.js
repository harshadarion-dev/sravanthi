/**
 * experience.js — Dynamic experience timeline from Supabase
 */

async function initExperience() {
  await injectSEO('Experience');
  const data = await fetchExperience();
  renderExperience(data);
}

function renderExperience(jobs) {
  const container = document.getElementById('experienceTimeline');
  if (!container) return;

  if (!jobs.length) {
    container.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--text-muted)">
      <p>Experience coming soon</p></div>`;
    return;
  }

  container.innerHTML = jobs.map((job, i) => {
    const startDate = formatDate(job.start_date);
    const endDate = job.end_date ? formatDate(job.end_date) : 'Present';
    const isPresent = !job.end_date;
    const tags = job.tags ? job.tags.split(',').map(t => `<span class="tag">${esc(t.trim())}</span>`).join('') : '';

    return `
    <div class="experience-item reveal ${i > 0 ? 'reveal-delay-' + Math.min(i, 3) : ''}">
      <div class="experience-marker">
        <div class="experience-dot ${isPresent ? 'experience-dot-active' : ''}"></div>
        <div class="experience-line"></div>
      </div>
      <div class="experience-content">
        <div class="experience-header">
          <div>
            <h3 class="experience-role">${esc(job.title)}</h3>
            <div class="experience-company">
              ${esc(job.company)}${job.location ? ` · ${esc(job.location)}` : ''}
            </div>
          </div>
          <div class="experience-date">
            ${startDate} — ${endDate}
            ${isPresent ? '<span class="experience-badge">Current</span>' : ''}
          </div>
        </div>
        ${job.description ? `<p class="experience-desc">${esc(job.description)}</p>` : ''}
        ${tags ? `<div class="experience-tags">${tags}</div>` : ''}
      </div>
    </div>`;
  }).join('');

  initReveal();
}

document.addEventListener('DOMContentLoaded', initExperience);
