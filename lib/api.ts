import { ApiClient } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export  async function apiFetch(endpoint: string, options: RequestInit = {}) {
  // If you are storing JWT in localStorage (Client-Side implementation)
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `${token}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'An error occurred fetching API data.');
  }

  return response.json();
}
// ২. 💡 Axios-এর মতো অবজেক্ট মেথড (যাতে আপনার .post এররটি স্থায়ীভাবে ফিক্স হয়ে যায়)
export const api: ApiClient = {
  get: (endpoint, options) => 
    apiFetch(endpoint, { method: 'GET', ...options }),

  post: (endpoint, body, options) => 
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body), ...options }),

  patch: (endpoint, body, options) => 
    apiFetch(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options }),

  delete: (endpoint, options) => 
    apiFetch(endpoint, { method: 'DELETE', ...options }),
};