import { supabase } from './supabase.js';

const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  getMe: () => apiFetch('/auth/me'),

  // Favorites
  getFavorites: () => apiFetch('/favorites'),
  addFavorite: (favorite) => apiFetch('/favorites', { method: 'POST', body: JSON.stringify(favorite) }),
  removeFavorite: (title) => apiFetch(`/favorites/${encodeURIComponent(title)}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => apiFetch('/orders'),
  getOrder: (id) => apiFetch(`/orders/${id}`),

  // Stripe
  createPaymentIntent: (data) => apiFetch('/stripe/create-payment-intent', { method: 'POST', body: JSON.stringify(data) }),
};
