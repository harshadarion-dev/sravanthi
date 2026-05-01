/**
 * Fetches and renders blog list on blog/index.html
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('blogListContainer');
  if (!container) return;

  try {
    const blogs = await window.api.fetchBlogs();
    
    if (!blogs || blogs.length === 0) {
      container.innerHTML = `<div class="empty-state-block"><h3>No articles yet</h3><p>Check back later for new content!</p></div>`;
      return;
    }

    container.innerHTML = blogs.map((b, i) => `
      <article class="blog-card reveal ${i > 0 ? `reveal-delay-${Math.min(i, 5)}` : ''}" itemscope itemtype="https://schema.org/BlogPosting">
        <a href="article.html?slug=${b.slug}" style="text-decoration:none;color:inherit;display:block;">
          <div class="blog-card-image">
            ${b.thumbnail_url 
              ? `<img src="${b.thumbnail_url}" alt="${b.title}" loading="lazy" width="400" height="240" itemprop="image">`
              : `<div style="width:100%;height:100%;background:var(--bg-white);display:flex;align-items:center;justify-content:center;color:var(--text-muted);">No Image</div>`
            }
          </div>
          <div style="padding:0 4px;">
            <div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
              ${(b.tags && typeof b.tags === 'string') ? b.tags.split(',')[0].trim() : 'Blog'}
            </div>
            <h2 class="blog-card-title" itemprop="headline" style="font-size:1.1rem;">${b.title}</h2>
            <p class="blog-card-excerpt" itemprop="description">${b.excerpt || ''}</p>
            <div style="font-size:12px;color:var(--text-muted);margin-top:12px;">
              <span itemprop="author" itemscope itemtype="https://schema.org/Person"><span itemprop="name">Sravanthi Maha</span></span> ·
              <time itemprop="datePublished" datetime="${b.published_at}">${new Date(b.published_at || new Date()).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'})}</time>
            </div>
          </div>
        </a>
      </article>
    `).join('');

    // Trigger reveal animations for newly injected content
    setTimeout(() => {
      document.querySelectorAll('#blogListContainer .reveal').forEach(el => {
        el.classList.add('visible');
      });
    }, 100);

  } catch (err) {
    console.error('Error loading blogs:', err);
    container.innerHTML = `<div class="empty-state-block" style="color:var(--error);">Failed to load articles. <br><span style="font-size:12px;opacity:0.8;">(${err.message})</span></div>`;
  }
});
