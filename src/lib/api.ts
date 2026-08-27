/**
 * Central API client — thin fetch wrapper for backend communication.
 *
 * Uses relative paths (e.g. "/api/health") instead of an absolute backend URL.
 * In development, Next.js rewrites proxy /api/* to the backend (see next.config.ts).
 * In production, a reverse proxy or Vercel rewrites handle the same routing.
 * This means no NEXT_PUBLIC_ env var is needed for the backend URL.
 */
import { supabase } from "./supabaseClient";

interface ApiResponse<T> { data: T | null; error: string | null; headers?: Headers; }
interface HealthResponse { status: "ok" | "error"; timestamp: string; }

/**
 * Make an authenticated API request.
 * Automatically attaches the current session token.
 */
async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }
    const response = await fetch(endpoint, { ...options, headers });
    if (!response.ok) return { data: null, error: "HTTP " + response.status + ": " + response.statusText, headers: response.headers };
    const data = await response.json();
    return { data, error: null, headers: response.headers };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

/** Make an unauthenticated API request. */
async function publicRequest<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: { "Content-Type": "application/json", ...options?.headers },
    });
    if (!response.ok) return { data: null, error: "HTTP " + response.status + ": " + response.statusText, headers: response.headers };
    const data = await response.json();
    return { data, error: null, headers: response.headers };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function checkBackendHealth(): Promise<ApiResponse<HealthResponse> & { headers?: Headers }> {
  return publicRequest<HealthResponse>("/api/health");
}

/** Authenticated GET with explicit token (for status page). */
export async function authGet(path: string, token: string): Promise<ApiResponse<unknown>> {
  return request<unknown>(path, { headers: { Authorization: "Bearer " + token } });
}

/** Authenticated API GET — auto token. */
export async function apiGet<T>(path: string): Promise<ApiResponse<T>> { return request<T>(path); }
/** Authenticated API POST — auto token. */
export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> { return request<T>(path, { method: "POST", body: JSON.stringify(body) }); }
/** Authenticated API PATCH — auto token. */
export async function apiPatch<T>(path: string, body: unknown): Promise<ApiResponse<T>> { return request<T>(path, { method: "PATCH", body: JSON.stringify(body) }); }