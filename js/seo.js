/**
 * seo.js — Enterprise SEO Engine v2.0
 * Sravanthi Maha | Senior Data Engineer Portfolio
 *
 * Injects per-page:
 *  - Title + Meta description + Keywords
 *  - Canonical tag
 *  - Open Graph (og:*) with image dimensions
 *  - Twitter Card (summary_large_image)
 *  - JSON-LD: Person, WebSite, WebPage, BreadcrumbList, FAQPage
 *  - Robots meta
 *  - Theme-color
 */

// ─── Site-Wide Defaults ──────────────────────────────────────────────────────
const SEO_DEFAULTS = {
  siteName:    'Sravanthi Maha — Senior Data Engineer',
  siteUrl:     'https://sravanthimaha.com',
  ogImage:     'https://sravanthimaha.com/assets/images/og-banner.png',
  ogImageW:    1200,
  ogImageH:    630,
  twitterCard: 'summary_large_image',
  locale:      'en_US',
  personName:  'Sravanthi Maha',
  alternateName: 'Sravanthi',
  jobTitle:    'Senior Data Engineer',
  email:       'sravanthi.mahamyjobit@gmail.com',
  phone:       '+16178632387',
  location:    'New York, NY, USA',
  description: 'Sravanthi Maha is a Senior Data Engineer with 6+ years architecting petabyte-scale ETL/ELT pipelines, BigQuery data warehouses, Vertex AI ML pipelines, and enterprise cloud data infrastructure.',
  linkedin:    'https://www.linkedin.com/in/sravanthi-maha',
  github:      'https://github.com/sravanthi-maha',
  profileImage: 'https://sravanthimaha.com/assets/images/hero-portrait.png',
  keywords:    'Sravanthi Maha, Senior Data Engineer, Data Engineer, BigQuery Engineer, Vertex AI, ETL ELT Pipelines, Cloud Data Architect, DataFlow, Cloud Composer, Terraform, Python Data Engineer, SQL, Apache Spark, Data Engineering Portfolio, New York Data Engineer',
};

// ─── Per-Page SEO Config ─────────────────────────────────────────────────────
const PAGE_SEO = {
  'index.html': {
    title:       'Sravanthi Maha | Senior Data Engineer — BigQuery, ETL Pipelines & Vertex AI',
    description: 'Sravanthi Maha is a Senior Data Engineer with 6+ years architecting petabyte-scale ETL/ELT pipelines using BigQuery, Dataflow, Vertex AI & Cloud Composer.',
    pageType:    'WebPage',
    breadcrumbs: [{ name: 'Home', url: '/' }],
    faqs: [
      { q: 'What does Sravanthi Maha specialize in?', a: 'Sravanthi Maha specializes in Data Engineering — designing petabyte-scale ETL/ELT pipelines, BigQuery data warehouses, Vertex AI ML feature pipelines, and enterprise cloud data infrastructure using Python, SQL, Dataflow, Pub/Sub, and Terraform.' },
      { q: 'How many years of data engineering experience does Sravanthi have?', a: 'Sravanthi Maha has 6+ years of enterprise data engineering experience working with companies like Wells Fargo, Amazon, and Tech Mahindra/Verizon.' },
      { q: 'Is Sravanthi Maha available for hire?', a: 'Yes — Sravanthi Maha is open to Senior Data Engineer and Cloud Data Architect roles. Contact via the website for inquiries.' },
    ],
  },
  'about.html': {
    title:       'About Sravanthi Maha — Data Engineer & Cloud Data Architect | New York',
    description: 'Meet Sravanthi Maha, a Data Engineer & Cloud Data Architect based in New York with expertise in BigQuery, Vertex AI, ETL automation, and enterprise analytics at petabyte scale.',
    pageType:    'AboutPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'About', url: '/about.html' }],
    faqs: [
      { q: 'What is Sravanthi Maha\'s educational background?', a: 'Sravanthi Maha holds advanced technical credentials in cloud data engineering with GCP certifications including Professional Data Engineer.' },
      { q: 'What companies has Sravanthi Maha worked with?', a: 'Sravanthi has engineered enterprise data solutions for Wells Fargo, Amazon, and Tech Mahindra/Verizon, delivering measurable business impact including $1.2M+ in infrastructure savings.' },
    ],
  },
  'skills.html': {
    title:       'Technical Skills — Sravanthi Maha | BigQuery, Dataflow, Vertex AI, Python, Terraform',
    description: 'Explore Sravanthi Maha\'s Data Engineering skills: BigQuery, Dataflow, Pub/Sub, Cloud Composer, Vertex AI, Python, SQL, Terraform, Apache Spark, Kafka & more.',
    pageType:    'WebPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Skills', url: '/skills.html' }],
    faqs: [
      { q: 'What GCP services does Sravanthi Maha know?', a: 'Sravanthi Maha is expert in BigQuery, Dataflow, Pub/Sub, Cloud Composer, Vertex AI, Dataproc, Cloud Storage, Cloud Functions, Cloud Run, and GCP IAM & security services.' },
      { q: 'What programming languages does Sravanthi use?', a: 'Sravanthi primarily uses Python and SQL for data engineering, along with HQL, Shell scripting, Terraform (HCL), and Spark (PySpark) for infrastructure and pipeline automation.' },
    ],
  },
  'experience.html': {
    title:       'Work Experience — Sravanthi Maha | Senior Data Engineer at Wells Fargo & Amazon',
    description: 'Sravanthi Maha\'s career as a Senior Data Engineer spans Wells Fargo, Amazon, Tech Mahindra/Verizon — delivering petabyte-scale pipelines and $1.2M+ infrastructure savings.',
    pageType:    'WebPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Experience', url: '/experience.html' }],
  },
  'projects.html': {
    title:       'Data Engineering Projects — Sravanthi Maha | BigQuery, Vertex AI, ETL Case Studies',
    description: 'Browse Sravanthi Maha\'s enterprise data engineering projects: real-time ETL pipelines, BigQuery optimization, Vertex AI ML pipelines, and anomaly detection systems.',
    pageType:    'CollectionPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Projects', url: '/projects.html' }],
  },
  'resume.html': {
    title:       'Resume — Sravanthi Maha | Senior Data Engineer | Download CV',
    description: 'Download Sravanthi Maha\'s resume. 6+ years as a Data Engineer — BigQuery, Dataflow, Python, SQL, Vertex AI, Cloud Composer, Terraform. Available for Senior Data Engineer roles.',
    pageType:    'WebPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Resume', url: '/resume.html' }],
  },
  'certifications.html': {
    title:       'GCP Certifications — Sravanthi Maha | Google Cloud Certified Data Engineer',
    description: 'View Sravanthi Maha\'s Google Cloud certifications including Professional Data Engineer, proving mastery in BigQuery, Dataflow, Pub/Sub, Vertex AI, and cloud-native architecture.',
    pageType:    'WebPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Certifications', url: '/certifications.html' }],
  },
  'contact.html': {
    title:       'Hire Sravanthi Maha — Senior Data Engineer | Contact for GCP Projects & Consulting',
    description: 'Contact Sravanthi Maha to discuss data engineering projects, BigQuery consulting, cloud architecture, or ETL pipeline design. Based in New York, NY. Open to senior roles.',
    pageType:    'ContactPage',
    breadcrumbs: [{ name: 'Home', url: '/' }, { name: 'Contact', url: '/contact.html' }],
    faqs: [
      { q: 'How can I contact Sravanthi Maha?', a: 'You can reach Sravanthi Maha via email at sravanthi.mahamyjobit@gmail.com or by phone at 617-863-2387. She is based in New York, NY.' },
      { q: 'Is Sravanthi Maha open to freelance or consulting work?', a: 'Yes — Sravanthi is open to data engineering consulting, BigQuery optimization engagements, and cloud architecture advisory roles in addition to full-time positions.' },
    ],
  },
};

// ─── Main SEO Injector ────────────────────────────────────────────────────────
async function injectSEO(pageKeyOverride = null) {
  try {
    // Determine page key from URL path
    const path    = window.location.pathname;
    const pageKey = pageKeyOverride
      || path.split('/').filter(Boolean).pop()
      || 'index.html';

    const pageSEO = PAGE_SEO[pageKey] || PAGE_SEO['index.html'];

    // Attempt to merge dynamic Supabase settings (non-blocking)
    let settings = {};
    try { settings = await fetchSettings(); } catch(_) {}

    const siteUrl      = SEO_DEFAULTS.siteUrl;
    const canonical    = siteUrl + (path === '/' ? '/' : path);
    const title        = settings.site_title ? `${pageSEO.title.split('|')[0].trim()} | ${settings.site_title}` : pageSEO.title;
    const description  = settings.site_description || pageSEO.description;
    const ogImage      = settings.og_image || SEO_DEFAULTS.ogImage;
    const name         = settings.name     || SEO_DEFAULTS.personName;
    const jobTitle     = settings.tagline  || SEO_DEFAULTS.jobTitle;
    const email        = settings.email    || SEO_DEFAULTS.email;
    const linkedin     = ensureHttps(settings.linkedin || SEO_DEFAULTS.linkedin);
    const github       = ensureHttps(settings.github   || SEO_DEFAULTS.github);
    const keywords     = settings.keywords || SEO_DEFAULTS.keywords;

    // ── Document Title ──
    document.title = title;

    // ── Standard Meta ──
    setMeta('description', description);
    setMeta('keywords', keywords);
    setMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    setMeta('author', SEO_DEFAULTS.personName);
    setMeta('theme-color', '#0F172A');

    // ── Canonical ──
    setLink('canonical', canonical);

    // ── Open Graph ──
    setOG('og:type',          pageSEO.pageType === 'AboutPage' ? 'profile' : 'website');
    setOG('og:url',           canonical);
    setOG('og:title',         title);
    setOG('og:description',   description);
    setOG('og:image',         ogImage);
    setOG('og:image:width',   String(SEO_DEFAULTS.ogImageW));
    setOG('og:image:height',  String(SEO_DEFAULTS.ogImageH));
    setOG('og:image:alt',     `${SEO_DEFAULTS.personName} — ${SEO_DEFAULTS.jobTitle}`);
    setOG('og:site_name',     SEO_DEFAULTS.siteName);
    setOG('og:locale',        SEO_DEFAULTS.locale);

    // ── Twitter Card ──
    setOG('twitter:card',        SEO_DEFAULTS.twitterCard);
    setOG('twitter:title',       title);
    setOG('twitter:description', description);
    setOG('twitter:image',       ogImage);
    setOG('twitter:image:alt',   `${SEO_DEFAULTS.personName} — ${SEO_DEFAULTS.jobTitle}`);

    // ── JSON-LD Schemas ──
    injectSchemas({ name, jobTitle, email, linkedin, github, canonical, pageSEO, siteUrl, description });

  } catch (e) {
    console.warn('[SEO] Injection error:', e);
  }
}

// ─── Schema Injection ─────────────────────────────────────────────────────────
function injectSchemas({ name, jobTitle, email, linkedin, github, canonical, pageSEO, siteUrl, description }) {

  // 1. Person Schema
  const personSchema = {
    '@context':     'https://schema.org',
    '@type':        'Person',
    '@id':          siteUrl + '/#person',
    name:           name,
    alternateName:  SEO_DEFAULTS.alternateName,
    jobTitle:       jobTitle,
    description:    SEO_DEFAULTS.description,
    url:            siteUrl,
    image: {
      '@type':      'ImageObject',
      url:          SEO_DEFAULTS.profileImage,
      width:        400,
      height:       400,
    },
    email:          email ? `mailto:${email}` : undefined,
    telephone:      SEO_DEFAULTS.phone,
    address: {
      '@type':          'PostalAddress',
      addressLocality:  'New York',
      addressRegion:    'NY',
      addressCountry:   'US',
    },
    sameAs: [linkedin, github].filter(Boolean),
    knowsAbout: [
      'Google Cloud Platform', 'BigQuery', 'Dataflow', 'Pub/Sub',
      'Cloud Composer', 'Vertex AI', 'Dataproc', 'ETL Pipelines',
      'ELT Architecture', 'Data Warehousing', 'Python', 'SQL',
      'Apache Spark', 'Apache Kafka', 'Terraform', 'Machine Learning',
      'Data Engineering', 'Cloud Data Architecture', 'Snowflake',
    ],
    alumniOf: {
      '@type': 'EducationalOrganization',
      name:    'University',
    },
    hasCredential: {
      '@type':    'EducationalOccupationalCredential',
      name:       'Google Cloud Professional Data Engineer',
      credentialCategory: 'Professional Certification',
      recognizedBy: {
        '@type': 'Organization',
        name:    'Google Cloud',
      },
    },
  };

  // 2. WebSite Schema with SearchAction
  const websiteSchema = {
    '@context':  'https://schema.org',
    '@type':     'WebSite',
    '@id':       siteUrl + '/#website',
    name:        SEO_DEFAULTS.siteName,
    url:         siteUrl,
    description: SEO_DEFAULTS.description,
    author:      { '@id': siteUrl + '/#person' },
    potentialAction: {
      '@type':       'SearchAction',
      target:        { '@type': 'EntryPoint', urlTemplate: siteUrl + '/projects.html?q={search_term_string}' },
      'query-input': 'required name=search_term_string',
    },
    inLanguage: 'en-US',
  };

  // 3. WebPage Schema
  const webpageSchema = {
    '@context':    'https://schema.org',
    '@type':       pageSEO.pageType || 'WebPage',
    '@id':         canonical + '#webpage',
    url:           canonical,
    name:          document.title,
    description:   description,
    isPartOf:      { '@id': siteUrl + '/#website' },
    about:         { '@id': siteUrl + '/#person' },
    author:        { '@id': siteUrl + '/#person' },
    inLanguage:    'en-US',
    dateModified:  '2026-05-01',
    breadcrumb:    pageSEO.breadcrumbs ? buildBreadcrumbSchema(pageSEO.breadcrumbs, siteUrl) : undefined,
  };

  // 4. FAQ Schema (only if page has FAQs)
  let faqSchema = null;
  if (pageSEO.faqs && pageSEO.faqs.length > 0) {
    faqSchema = {
      '@context':   'https://schema.org',
      '@type':      'FAQPage',
      mainEntity:   pageSEO.faqs.map(f => ({
        '@type':          'Question',
        name:             f.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text:    f.a,
        },
      })),
    };
  }

  // Inject all schemas
  setJsonLD('seo-person',   personSchema);
  setJsonLD('seo-website',  websiteSchema);
  setJsonLD('seo-webpage',  webpageSchema);
  if (faqSchema) setJsonLD('seo-faq', faqSchema);
}

// ─── BreadcrumbList Builder ───────────────────────────────────────────────────
function buildBreadcrumbSchema(crumbs, siteUrl) {
  return {
    '@context':       'https://schema.org',
    '@type':          'BreadcrumbList',
    itemListElement:  crumbs.map((c, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      c.name,
      item:      siteUrl + c.url,
    })),
  };
}

// ─── DOM Helpers ──────────────────────────────────────────────────────────────
function setMeta(name, content) {
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.name = name;
    document.head.appendChild(el);
  }
  el.content = content;
}

function setOG(property, content) {
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.content = content;
}

function setLink(rel, href) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
}

function setJsonLD(id, schema) {
  let el = document.getElementById('jsonld-' + id);
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id   = 'jsonld-' + id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(schema, null, 0);
}

function ensureHttps(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return 'https://' + url;
}
