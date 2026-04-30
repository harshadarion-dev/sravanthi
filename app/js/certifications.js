/**
 * certifications.js — Dynamic certifications page from Supabase
 */

async function initCertifications() {
  await injectSEO('Certifications');
  const data = await fetchCertifications();
  renderCertifications(data);
}

function renderCertifications(certs) {
  const grid = document.getElementById('certsGrid');
  if (!grid) return;

  if (!certs.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)">
      <div style="font-size:40px;margin-bottom:12px">🏅</div>
      <p>Certifications coming soon</p>
    </div>`;
    return;
  }

  grid.innerHTML = certs.map((c, i) => {
    const linkUrl = c.credential_url || c.thumbnail_url || '';
    return `
    <div class="project-card reveal ${i === 1 ? 'reveal-delay-1' : i === 2 ? 'reveal-delay-2' : ''}"
      data-category="certification"
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

document.addEventListener('DOMContentLoaded', initCertifications);
