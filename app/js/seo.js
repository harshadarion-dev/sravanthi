/**
 * seo.js — Dynamic SEO Injector
 * Pulls meta data from Supabase settings and writes it into <head>
 */

async function injectSEO(pageTitle = null) {
  try {
    const settings = await fetchSettings();

    const siteTitle = settings.site_title || 'Sravanthi — Senior GCP Data Engineer';
    const desc = settings.site_description || 'Portfolio of Sravanthi — GCP Data Engineer specializing in BigQuery, Dataflow, and enterprise-scale ETL pipelines.';
    const keywords = settings.keywords || 'data engineer, GCP, BigQuery, Python, Dataflow, ETL';
    const ogImage = settings.og_image || '';
    const canonical = window.location.href;

    const title = pageTitle ? `${pageTitle} — ${siteTitle}` : siteTitle;

    // Title
    document.title = title;

    // Set/update meta tags
    setMeta('description', desc);
    setMeta('keywords', keywords);

    // Open Graph
    setOG('og:title', title);
    setOG('og:description', desc);
    setOG('og:type', 'website');
    setOG('og:url', canonical);
    if (ogImage) setOG('og:image', ogImage);

    // Twitter
    setOG('twitter:card', 'summary_large_image');
    setOG('twitter:title', title);
    setOG('twitter:description', desc);
    if (ogImage) setOG('twitter:image', ogImage);

    // Canonical
    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) { canonicalEl = document.createElement('link'); canonicalEl.rel = 'canonical'; document.head.appendChild(canonicalEl); }
    canonicalEl.href = canonical;

    // JSON-LD Person schema
    const name = settings.name || 'Sravanthi';
    const jobTitle = settings.tagline || 'Senior GCP Data Engineer';
    const email = settings.email || '';
    const linkedin = settings.linkedin || '';
    const github = settings.github || '';

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name, jobTitle,
      email: email ? `mailto:${email}` : undefined,
      url: canonical,
      sameAs: [linkedin, github].filter(Boolean),
    };

    let ldEl = document.getElementById('json-ld-schema');
    if (!ldEl) { ldEl = document.createElement('script'); ldEl.type = 'application/ld+json'; ldEl.id = 'json-ld-schema'; document.head.appendChild(ldEl); }
    ldEl.textContent = JSON.stringify(schema);

  } catch (e) {
    console.warn('SEO injection error:', e);
  }
}

function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el); }
  el.content = content;
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el); }
  el.content = content;
}
