/**
 * Auth Guard — protects all admin pages, handles login/logout
 */
import { sb } from './supabaseClient.js';
import { showToast } from './utils.js';

// ── Session Guard ─────────────────────────────────────────────────
// Call this at the top of every admin page (except login.html)
export async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// ── Login ─────────────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// ── Logout ────────────────────────────────────────────────────────
export async function signOut() {
  await sb.auth.signOut();
  window.location.href = 'login.html';
}

// ── Init Logout Button ────────────────────────────────────────────
export function initLogout() {
  document.querySelectorAll('[data-logout]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await signOut();
    });
  });
}

// ── Get Current User ──────────────────────────────────────────────
export async function getCurrentUser() {
  const { data: { user } } = await sb.auth.getUser();
  return user;
}
