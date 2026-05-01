/**
 * Fetches and renders daily tech news from RSS feeds using rss2json
 */

const RSS_FEEDS = [
  { url: 'https://medium.com/feed/tag/google-cloud', source: 'Google Cloud Blog' },
  { url: 'https://medium.com/feed/towards-data-science', source: 'Towards Data Science' },
  { url: 'https://medium.com/feed/tag/data-engineering', source: 'Data Engineering' }
];

const API_ENDPOINT = 'https://api.rss2json.com/v1/api.json?rss_url=';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('newsContainer');
  const tabs = document.querySelectorAll('.filter-tab');
  
  if (!container) return;

  async function fetchNews() {
    try {
      let allArticles = [];

      // Fetch all feeds concurrently
      const fetchPromises = RSS_FEEDS.map(async (feed) => {
        try {
          const res = await fetch(API_ENDPOINT + encodeURIComponent(feed.url));
          const data = await res.json();
          if (data.status === 'ok') {
            return data.items.map(item => ({
              ...item,
              source: feed.source
            }));
          }
          return [];
        } catch (e) {
          console.warn(`Failed to fetch feed ${feed.url}`, e);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      
      // Flatten and sort by date descending
      allArticles = results.flat().sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

      renderNews(allArticles);
      initFiltering(allArticles);

    } catch (err) {
      console.error('Error fetching news:', err);
      container.innerHTML = `<div class="empty-state-block" style="grid-column: 1 / -1; text-align: center; color: var(--error);">Failed to load news. Please try again later.</div>`;
    }
  }

  function renderNews(articles) {
    if (!articles.length) {
      container.innerHTML = `<div class="empty-state-block" style="grid-column: 1 / -1; text-align: center;">No articles found for this filter.</div>`;
      return;
    }

    container.innerHTML = articles.map((b, i) => {
      // Extract first image from content if thumbnail is not available
      let img = b.thumbnail;
      if (!img || img.includes('stat?event')) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = b.content || b.description;
        const imgEl = tempDiv.querySelector('img');
        img = imgEl ? imgEl.src : null;
      }

      // Clean HTML from description/excerpt
      const tempDiv2 = document.createElement('div');
      tempDiv2.innerHTML = b.description || b.content || '';
      let excerpt = tempDiv2.textContent || tempDiv2.innerText || '';
      excerpt = excerpt.substring(0, 120) + '...';

      return `
      <article class="blog-card reveal ${i > 0 ? `reveal-delay-${Math.min(i, 5)}` : ''} visible" style="opacity: 1; transform: translateY(0);">
        <a href="${b.link}" target="_blank" rel="noopener noreferrer" style="text-decoration:none;color:inherit;display:block;">
          <div class="blog-card-image">
            ${img 
              ? `<img src="${img}" alt="Article Cover" loading="lazy" width="400" height="240" style="object-fit:cover;">`
              : `<div style="width:100%;height:100%;background:var(--bg-white);display:flex;align-items:center;justify-content:center;color:var(--text-muted);">📰 Read Article</div>`
            }
          </div>
          <div style="padding:0 4px;">
            <div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
              ${b.source}
            </div>
            <h2 class="blog-card-title" style="font-size:1.1rem; line-height: 1.4;">${b.title}</h2>
            <p class="blog-card-excerpt" style="font-size:0.9rem; margin-bottom: 12px;">${excerpt}</p>
            <div style="font-size:12px;color:var(--text-muted);margin-top:auto;">
              ${b.author ? `<span style="font-weight:500;color:var(--text-color);">${b.author}</span> · ` : ''}
              <time datetime="${b.pubDate}">${new Date(b.pubDate).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</time>
            </div>
          </div>
        </a>
      </article>
    `}).join('');
  }

  function initFiltering(allArticles) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        const filter = tab.dataset.filter;
        if (filter === 'all') {
          renderNews(allArticles);
        } else {
          // Because 'Google Cloud Blog' is mapped, we can filter exactly
          const filtered = allArticles.filter(a => a.source === filter || (filter === 'Google Cloud Blog' && a.source === 'Google Cloud Blog'));
          renderNews(filtered);
        }
      });
    });
  }

  fetchNews();
});
