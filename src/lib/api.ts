/**
 * Central API client — thin fetch wrapper for backend communication.
 *
 * Uses relative paths (e.g. "/api/health") instead of an absolute backend URL.
 * In development, Next.js rewrites proxy /api/* to the backend (see next.config.ts).
 * In production, a reverse proxy or Vercel rewrites handle the same routing.
 * This means no NEXT_PUBLIC_ env var is needed for the backend URL.
 */
interface ApiResponse<T> { data: T | null; error: string | null; headers?: Headers; }
interface HealthResponse { status: "ok" | "error"; timestamp: string; }

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
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
  return request<HealthResponse>("/api/health");
}

export async function authGet(path: string, token: string): Promise<ApiResponse<unknown>> {
  return request<unknown>(path, { headers: { Authorization: "Bearer " + token } });
}