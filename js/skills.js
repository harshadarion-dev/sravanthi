/**
 * skills.js — Dynamic skills page with grouped categories + animated bars
 */

async function initSkills() {
  await injectSEO('Core Competencies');
  const skills = await fetchSkills();
  renderSkills(skills);
}

function renderSkills(skills) {
  const grid = document.getElementById('skillsGrid');
  if (!grid) return;

  if (!skills.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 0;color:var(--text-muted)">
      <p>Skills coming soon</p></div>`;
    return;
  }

  // Group by category
  const grouped = skills.reduce((acc, s) => {
    (acc[s.category] = acc[s.category] || []).push(s);
    return acc;
  }, {});

  grid.innerHTML = Object.entries(grouped).map(([cat, items], gi) => `
    <div class="skill-category reveal ${gi % 2 === 1 ? 'reveal-delay-1' : ''}">
      <h3>${esc(cat)}</h3>
      ${items.map(s => `
        <div class="skill-item">
          <div class="skill-header">
            <span class="skill-name">${esc(s.name)}</span>
            <span class="skill-percent">${s.percentage || 0}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-bar-fill" data-width="${s.percentage || 0}"></div>
          </div>
        </div>`).join('')}
    </div>`).join('');

  // Animate bars after render
  requestAnimationFrame(() => {
    initReveal();
    animateSkillBars();
  });
}

document.addEventListener('DOMContentLoaded', initSkills);
