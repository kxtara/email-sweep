/**
 * API client configuration.
 *
 * VITE_API_URL is baked in at build time (see Frontend/.env.example).
 * Defaults to localhost:3000 for local development.
 */
const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const API_BASE_URL = apiBase.replace(/\/$/, "");

/**
 * Wrapper around fetch that always sends credentials (session cookies)
 * and JSON content-type — required for authenticated backend calls.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
