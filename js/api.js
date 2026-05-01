/**
 * api.js — Centralized Supabase Data Fetching Layer
 * All public read operations go through here.
 */

// ---------- Settings & Profile ----------

async function fetchSettings() {
  const { data } = await sb.from('settings').select('key,value');
  if (!data) return {};
  return data.reduce((acc, row) => { acc[row.key] = row.value; return acc; }, {});
}

async function fetchProfile() {
  const { data } = await sb.from('profile').select('*').limit(1).single();
  return data || null;
}

// ---------- Skills ----------

async function fetchSkills() {
  const { data, error } = await sb.from('skills').select('*').order('category').order('sort_order');
  if (error) { console.warn('fetchSkills:', error.message); return []; }
  return data || [];
}

// ---------- Experience ----------

async function fetchExperience() {
  const { data, error } = await sb.from('experience').select('*').order('sort_order', { ascending: true });
  if (error) { console.warn('fetchExperience:', error.message); return []; }
  return data || [];
}

// ---------- Projects ----------

async function fetchProjects({ category = null, featuredOnly = false } = {}) {
  let q = sb.from('projects').select('*').eq('published', true).order('sort_order', { ascending: true });
  if (category && category !== 'all') q = q.eq('category', category);
  if (featuredOnly) q = q.eq('featured', true);
  const { data, error } = await q;
  if (error) { console.warn('fetchProjects:', error.message); return []; }
  return data || [];
}

// ---------- Certifications ----------

async function fetchCertifications() {
  const { data, error } = await sb.from('certifications').select('*').order('sort_order', { ascending: true });
  if (error) { console.warn('fetchCertifications:', error.message); return []; }
  return data || [];
}

// ---------- Resume ----------

async function fetchResumeUrl() {
  const { data } = await sb.from('settings').select('value').eq('key', 'resume_url').single();
  return data?.value || null;
}

// ---------- Contact ----------

async function submitContactForm({ name, email, subject, message }) {
  const { error } = await sb.from('contact_messages').insert({ name, email, subject: subject || null, message, status: 'new' });
  if (error) throw error;
}

// ---------- Blogs ----------

async function fetchBlogs() {
  const { data, error } = await sb.from('blogs')
    .select('id, title, slug, excerpt, thumbnail_url, published_at, tags')
    .eq('published', true)
    .order('published_at', { ascending: false });
  if (error) { console.warn('fetchBlogs:', error.message); return []; }
  return data || [];
}

async function fetchBlogBySlug(slug) {
  const { data, error } = await sb.from('blogs')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single();
  if (error) { console.warn('fetchBlogBySlug:', error.message); return null; }
  return data;
}

// Expose globally
window.api = {
  fetchSettings, fetchProfile, fetchSkills, fetchExperience, 
  fetchProjects, fetchCertifications, fetchResumeUrl, submitContactForm,
  fetchBlogs, fetchBlogBySlug
};
