/**
 * home.js — Dynamic homepage content from Supabase
 * Renders: hero stats, hero title, about bio, featured projects
 */

async function initHome() {
  await injectSEO();

  const [settings, projects, certs, experience] = await Promise.all([
    fetchSettings(),
    fetchProjects({ featuredOnly: true }),
    fetchCertifications(),
    fetchExperience()
  ]);

  renderHeroContent(settings);
  renderFeaturedProjects(projects);
  renderFeaturedCerts(certs);
  renderFeaturedExperience(experience);
  renderContactInfo(settings);
}

function renderHeroContent(s) {
  // Tagline
  const subtitle = document.getElementById('heroSubtitle');
  if (subtitle && s.tagline) {
    subtitle.textContent = `I'm ${s.name || 'Sravanthi'}, ${s.tagline}`;
  }

  // About bio
  const bioEl = document.getElementById('heroBio');
  if (bioEl && s.bio) bioEl.textContent = s.bio;

  // Profile image
  if (s.avatar_url) {
    const img = document.getElementById('heroPortrait');
    if (img) { img.src = s.avatar_url; imgWithFallback(img); }
  }
}

function renderFeaturedProjects(projects) {
  const grid = document.getElementById('featuredProjects');
  if (!grid) return;
  if (!projects.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = projects.slice(0, 3).map((p, i) => {
    const linkUrl = p.live_url || p.github_url || '';
    return `
    <div class="project-card reveal ${i > 0 ? 'reveal-delay-' + i : ''}" data-category="${esc(p.category || '')}"
      ${linkUrl ? `onclick="window.open('${esc(linkUrl)}','_blank')" style="cursor:pointer"` : ''}>
      <img src="${p.thumbnail_url || FALLBACK_IMG}" alt="${esc(p.title)}" loading="lazy"
        onerror="this.src='${FALLBACK_IMG}';this.style.objectFit='contain'">
      <div class="project-card-overlay">
        <div class="project-card-title">${esc(p.title)}</div>
        <div class="project-card-tags">${renderTags(p.tech_stack)}</div>
      </div>
      <div class="project-card-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>`;
  }).join('');

  initReveal();
}

function renderFeaturedExperience(jobs) {
  const container = document.getElementById('featuredExperience');
  if (!container) return;

  if (!jobs || !jobs.length) {
    container.innerHTML = `<div style="text-align:center;padding:40px 0;color:var(--text-muted)"><p>Experience coming soon</p></div>`;
    return;
  }

  container.innerHTML = jobs.slice(0, 3).map((job, i) => {
    const startDate = formatDate(job.start_date);
    const endDate = job.end_date ? formatDate(job.end_date) : 'Present';
    
    return `
      <div class="timeline-item reveal ${i > 0 ? 'reveal-delay-' + i : ''}">
        <div class="timeline-date">${startDate} — ${endDate}</div>
        <div class="timeline-content">
          <h4>${esc(job.title)}</h4>
          <p class="location">${esc(job.company)}${job.location ? `, ${esc(job.location)}` : ''}</p>
          ${job.description ? `<p>${esc(job.description)}</p>` : ''}
          ${job.tags ? `<div class="timeline-tags">${job.tags.split(',').map(t => `<span class="tag">${esc(t.trim())}</span>`).join('')}</div>` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  initReveal();
}

function renderFeaturedCerts(certs) {
  const grid = document.getElementById('featuredCerts');
  if (!grid || !certs.length) return;
  grid.innerHTML = certs.slice(0, 3).map((c, i) => {
    const linkUrl = c.credential_url || c.thumbnail_url || '';
    return `
    <div class="project-card reveal ${i > 0 ? 'reveal-delay-' + i : ''}" data-category="certification"
      ${linkUrl ? `onclick="window.open('${esc(linkUrl)}','_blank')" style="cursor:pointer"` : ''}>
      <img src="${c.thumbnail_url || FALLBACK_IMG}" alt="${esc(c.title)}" loading="lazy"
        onerror="this.src='${FALLBACK_IMG}';this.style.objectFit='contain'">
      <div class="project-card-overlay">
        <div class="project-card-title">${esc(c.title)}</div>
        <div class="project-card-tags">
          <span class="tag">${esc(c.issuer)}</span>
          ${c.year ? `<span class="tag">${c.year}</span>` : ''}
        </div>
      </div>
      <div class="project-card-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
    </div>`;
  }).join('');
  initReveal();
}

function renderContactInfo(s) {
  const emailEl = document.getElementById('contactEmail');
  const linkedinEl = document.getElementById('contactLinkedin');
  if (emailEl && s.email) { emailEl.href = `mailto:${s.email}`; emailEl.textContent = s.email; }
  if (linkedinEl && s.linkedin) { linkedinEl.href = s.linkedin; }
}

document.addEventListener('DOMContentLoaded', initHome);
