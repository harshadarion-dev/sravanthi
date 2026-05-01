import { sb } from './supabaseClient.js';
import { requireAuth, initLogout, getCurrentUser } from './auth.js';
import { renderSidebar, initSidebarToggle } from './sidebar.js';
import { showToast, showConfirm, setLoading, openModal, closeModal, initModalClose } from './utils.js';

const BUCKET = 'blog-images';
let editingId = null;

async function init() {
  const session = await requireAuth();
  if (!session) return;
  document.getElementById('sidebarContainer').innerHTML = renderSidebar('blog');
  initSidebarToggle();
  initLogout();
  const user = await getCurrentUser();
  if (user) {
    const n = user.email.split('@')[0];
    const el = document.getElementById('sidebarName'); const av = document.getElementById('sidebarAvatar');
    if (el) el.textContent = n; if (av) av.textContent = n[0].toUpperCase();
  }
  initModalClose();
  initForm();
  loadBlogs();
}

async function loadBlogs(search = '') {
  const tbody = document.getElementById('blogsTable');
  tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;padding:32px;color:#9CA3AF">Loading…</td></tr>`;
  let q = sb.from('blogs').select('*').order('published_at', { ascending: false });
  if (search) q = q.ilike('title', `%${search}%`);
  
  const { data, error } = await q;
  if (error) { tbody.innerHTML = `<tr><td colspan="4" style="color:#EF4444;padding:16px">Error: ${error.message}</td></tr>`; return; }
  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/></svg><h3>No posts yet</h3><p>Click "Write Post" to create your first one</p></div></td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(b => `
    <tr>
      <td>
        <div style="display:flex;align-items:center;gap:12px">
          <div style="width:48px;height:36px;border-radius:6px;overflow:hidden;background:#EFF6FF;flex-shrink:0">
            ${b.thumbnail_url ? `<img src="${esc(b.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:18px">📝</div>'}
          </div>
          <div><strong style="font-size:14px">${esc(b.title)}</strong><br><a href="../blog/article.html?slug=${esc(b.slug)}" target="_blank" style="font-size:12px;color:#2563EB">View Live ↗</a></div>
        </div>
      </td>
      <td style="font-size:13px;color:#6B7280">${esc(b.published_at || 'No date')}</td>
      <td><span class="badge ${b.published ? 'badge-success' : 'badge-gray'}">${b.published ? 'Published' : 'Draft'}</span></td>
      <td>
        <div class="td-actions">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="editBlog('${b.id}')" title="Edit">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteBlog('${b.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>`).join('');
}

function initForm() {
  document.getElementById('addBlogBtn').addEventListener('click', () => {
    editingId = null;
    document.getElementById('blogForm').reset();
    document.getElementById('modalTitle').textContent = 'Write New Post';
    document.getElementById('thumbPreview').style.display = 'none';
    
    // Set default date to today
    document.querySelector('input[name="published_at"]').valueAsDate = new Date();
    
    openModal('blogModal');
  });

  // Auto-generate slug from title
  document.querySelector('input[name="title"]').addEventListener('blur', (e) => {
    if (!editingId) {
      const slugInput = document.querySelector('input[name="slug"]');
      if (!slugInput.value) {
        slugInput.value = e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      }
    }
  });

  document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('saveBlogBtn');
    setLoading(btn, true);
    try {
      const form = e.target;
      let thumbnail_url = form.currentThumb?.value || null;
      const file = form.thumbnail.files[0];
      if (file) {
        const ext = file.name.split('.').pop();
        const path = `${Date.now()}.${ext}`;
        const { data: uploadData, error: uploadErr } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true });
        // Create bucket if it doesn't exist
        if (uploadErr && uploadErr.message.includes('bucket not found')) {
            await sb.storage.createBucket(BUCKET, { public: true });
            const { error: retryErr } = await sb.storage.from(BUCKET).upload(path, file, { upsert: true });
            if (retryErr) throw retryErr;
        } else if (uploadErr) {
            throw uploadErr;
        }
        
        const { data: urlData } = sb.storage.from(BUCKET).getPublicUrl(path);
        thumbnail_url = urlData.publicUrl;
      }
      
      const payload = {
        title: form.title.value.trim(),
        slug: form.slug.value.trim(),
        excerpt: form.excerpt.value.trim(),
        content: form.content.value,
        tags: form.tags.value.trim(),
        published_at: form.published_at.value || null,
        published: form.published.checked,
        thumbnail_url,
      };
      
      if (editingId) {
        const { error } = await sb.from('blogs').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Blog post updated!');
      } else {
        const { error } = await sb.from('blogs').insert(payload);
        if (error) throw error;
        showToast('Blog post created!');
      }
      closeModal('blogModal');
      loadBlogs();
    } catch (err) { showToast(err.message, 'error'); }
    finally { setLoading(btn, false); }
  });

  // Thumbnail preview
  document.getElementById('thumbnailInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const prev = document.getElementById('thumbPreview');
      prev.style.display = 'block';
      prev.querySelector('img').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', (e) => loadBlogs(e.target.value));
}

window.editBlog = async (id) => {
  editingId = id;
  const { data, error } = await sb.from('blogs').select('*').eq('id', id).single();
  if (error) { showToast('Error loading blog post', 'error'); return; }
  const form = document.getElementById('blogForm');
  form.title.value = data.title || '';
  form.slug.value = data.slug || '';
  form.excerpt.value = data.excerpt || '';
  form.content.value = data.content || '';
  form.tags.value = data.tags || '';
  form.published_at.value = data.published_at || '';
  form.published.checked = !!data.published;
  
  if (form.currentThumb) form.currentThumb.value = data.thumbnail_url || '';
  
  const prev = document.getElementById('thumbPreview');
  if (data.thumbnail_url) { prev.style.display = 'block'; prev.querySelector('img').src = data.thumbnail_url; }
  else { prev.style.display = 'none'; }
  document.getElementById('modalTitle').textContent = 'Edit Post';
  openModal('blogModal');
};

window.deleteBlog = async (id) => {
  const ok = await showConfirm('Delete this blog post? This cannot be undone.');
  if (!ok) return;
  const { error } = await sb.from('blogs').delete().eq('id', id);
  if (error) { showToast(error.message, 'error'); return; }
  showToast('Blog post deleted');
  loadBlogs();
};

function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

init();
