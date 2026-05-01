/**
 * contact.js — Dynamic contact page: live settings + Supabase form submission
 */

async function initContact() {
  await injectSEO('Contact');
  const settings = await fetchSettings();
  renderContactDetails(settings);
  initContactForm();
}

function renderContactDetails(s) {
  const pairs = {
    contactEmail: s.email ? { href: `mailto:${s.email}`, text: s.email } : null,
    contactPhone: s.phone ? { href: `tel:${String(s.phone).replace(/\s/g, '')}`, text: s.phone } : null,
    contactLocation: s.location ? { text: s.location } : null,
    socialLinkedin: s.linkedin ? { href: ensureUrl(s.linkedin) } : null,
    socialGithub: s.github ? { href: ensureUrl(s.github) } : null,
    socialTwitter: s.twitter ? { href: ensureUrl(s.twitter) } : null,
  };

  Object.entries(pairs).forEach(([id, val]) => {
    if (!val) return;
    const el = document.getElementById(id);
    if (!el) return;
    if (val.href) el.href = val.href;
    if (val.text) el.textContent = val.text;
    el.closest?.('[data-contact-item]')?.classList.remove('hidden');
  });
}

function initContactForm() {
  const form = document.getElementById('contactForm');
  const successBox = document.getElementById('formSuccess');
  const errorBox = document.getElementById('formError');
  const submitBtn = document.getElementById('submitBtn');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (!name || !email || !message) return;

    if (errorBox) errorBox.style.display = 'none';
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      await submitContactForm({ name, email, subject: form.subject?.value?.trim() || null, message });
      form.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    } catch (err) {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      if (errorBox) { errorBox.textContent = 'Failed to send. Please email directly.'; errorBox.style.display = 'block'; }
    }
  });
}

document.addEventListener('DOMContentLoaded', initContact);
