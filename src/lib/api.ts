/**
 * Central API client — thin fetch wrapper for backend communication.
 * Backend URL from NEXT_PUBLIC_API_BASE_URL env var.
 * In development, Next.js rewrites proxy /api to the backend.
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

interface HealthResponse { status: 'ok' | 'error'; timestamp: string; }

interface ApiResponse<T> { data: T | null; error: string | null; headers?: Headers; }

async function request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
    });
    if (!response.ok) return { data: null, error: `HTTP ${response.status}: ${response.statusText}`, headers: response.headers };
    const data = await response.json();
    return { data, error: null, headers: response.headers };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function checkBackendHealth(): Promise<ApiResponse<HealthResponse> & { headers?: Headers }> {
  return request<HealthResponse>('/api/health');
}
