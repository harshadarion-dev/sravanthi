document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    window.location.href = 'index.html';
    return;
  }

  try {
    const blog = await window.api.fetchBlogBySlug(slug);

    if (!blog) {
      document.querySelector('.page-hero').innerHTML = `<div class="container" style="max-width:800px;text-align:center;"><h1>Post Not Found</h1><p>The article you're looking for doesn't exist or has been removed.</p><a href="index.html" class="btn btn-primary" style="margin-top:20px;">Back to Blog</a></div>`;
      document.querySelector('article.section').innerHTML = '';
      return;
    }

    // Update DOM
    document.title = `${blog.title} — Sravanthi Maha | Data Engineering Blog`;
    
    // Breadcrumb title
    const titleLabel = document.getElementById('bTitleLabel');
    if (titleLabel) titleLabel.textContent = blog.title.length > 30 ? blog.title.substring(0, 30) + '...' : blog.title;
    
    // Tag and Headline
    const tagEl = document.getElementById('bTag');
    if (tagEl) tagEl.textContent = blog.tags ? blog.tags.split(',')[0].trim() : 'Blog';
    
    const h1El = document.getElementById('bH1');
    if (h1El) {
      h1El.textContent = blog.title;
      h1El.classList.add('visible'); // If reveal animation is used
    }
    
    // Meta (Date)
    const metaEl = document.getElementById('bMeta');
    if (metaEl) {
      const d = new Date(blog.published_at || blog.created_at || new Date()).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
      metaEl.innerHTML = `By <a href="../about.html" style="color:var(--text-color);font-weight:600;">Sravanthi Maha</a> · ${d}`;
    }

    // Content
    const contentEl = document.getElementById('bContent');
    if (contentEl) {
      contentEl.innerHTML = blog.content;
    }

    // Inject SEO Meta tags dynamically (Optional but good for single page sharing)
    document.querySelector('meta[name="description"]')?.setAttribute('content', blog.excerpt || '');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', blog.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', blog.excerpt || '');
    if (blog.thumbnail_url) {
      document.querySelector('meta[property="og:image"]')?.setAttribute('content', blog.thumbnail_url);
    }
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', window.location.href);

  } catch (err) {
    console.error('Error loading blog post:', err);
    document.querySelector('.page-hero').innerHTML = `<div class="container" style="max-width:800px;text-align:center;"><h1>Error Loading Post</h1><p>Something went wrong. Please try again later.</p><a href="index.html" class="btn btn-primary" style="margin-top:20px;">Back to Blog</a></div>`;
  }
});
