/**
 * projects.js — Fully dynamic projects page with filter tabs
 */

let allProjects = [];

async function initProjects() {
  await injectSEO('Selected Works');
  await loadProjects();
  initFilters();
}

async function loadProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  // Skeleton
  grid.innerHTML = `<div class="project-skeleton-grid">${Array(6).fill(0).map(() => `
    <div class="project-card">
      <div class="skeleton" style="height:220px;border-radius:12px"></div>
      <div class="skeleton skeleton-line" style="width:70%;margin-top:12px"></div>
    </div>`).join('')}</div>`;

  allProjects = await fetchProjects();

  if (!allProjects.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)">
      <div style="font-size:48px;margin-bottom:16px">📂</div>
      <p style="font-size:16px">No projects published yet</p>
    </div>`;
    return;
  }

  renderProjectCards(allProjects, grid);
  initReveal();
}

function renderProjectCards(projects, grid) {
  if (!projects.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)">
      <p style="font-size:16px">No projects found in this category</p>
    </div>`;
    return;
  }
  grid.innerHTML = projects.map((p, i) => {
    const linkUrl = p.live_url || p.github_url || '';
    return `
    <div class="project-card reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''}"
      data-category="${esc(p.category || 'other')}"
      ${linkUrl ? `onclick="window.open('${esc(linkUrl)}','_blank')" style="cursor:pointer"` : ''}>
      <img src="${p.thumbnail_url || FALLBACK_IMG}" alt="${esc(p.title)}" loading="lazy"
        onerror="this.src='${FALLBACK_IMG}';this.style.objectFit='contain'">
      <div class="project-card-overlay">
        <div class="project-card-title">${esc(p.title)}</div>
        <div class="project-card-tags">${renderTags(p.tech_stack)}</div>
        ${p.description ? `<p style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:6px;line-height:1.5">${esc(p.description.substring(0, 100))}${p.description.length > 100 ? '…' : ''}</p>` : ''}
      </div>
      <div class="project-card-arrow">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 12L12 4M12 4H6M12 4V10" stroke="currentColor" stroke-width="1.5"/></svg>
      </div>
      ${p.featured ? '<div class="project-featured-badge">⭐ Featured</div>' : ''}
    </div>`;
  }).join('');

  // Re-init reveal for newly added elements
  initReveal();
}

function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const grid = document.getElementById('projectsGrid');
  if (!tabs.length || !grid) return;
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      const filtered = filter === 'all' ? allProjects : allProjects.filter(p => p.category === filter);
      renderProjectCards(filtered, grid);
    });
  });
}

document.addEventListener('DOMContentLoaded', initProjects);
