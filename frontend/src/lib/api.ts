/**
 * Centralized API Client & Session Helper for LankaCare.me
 *
 * Utilizes Next.js same-origin API proxy (/api/*) to route requests
 * seamlessly to the configured backend (local or production Azure App Service).
 * Enforces credentials: "include" for HttpOnly session cookies and
 * attaches CSRF protection tokens (X-XSRF-TOKEN) on state-changing operations.
 */

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  maskedNic?: string;
  roles: string[];
  verified: boolean;
  assignedFacilityId?: string;
  department?: string;
}

export interface AuthResponse {
  token?: string;
  userId: string;
  fullName: string;
  email: string;
  roles: string[];
  assignedFacilityId?: string;
  mfaRequired?: boolean;
  mfaSessionId?: string;
}

/**
 * Extracts a cookie value by name from document.cookie (client-side only).
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Low-level fetch wrapper that normalizes endpoints, attaches CSRF tokens,
 * and includes credentials for HttpOnly session cookies.
 */
export async function apiRawFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const normalizedPath = path.startsWith("http")
    ? path.replace(/^https?:\/\/[^\/]+/, "")
    : path.startsWith("/") ? path : `/${path}`;

  const method = (options.method || "GET").toUpperCase();
  const headers = new Headers(options.headers || {});

  if (!headers.has("Content-Type") && method !== "GET" && method !== "HEAD") {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Double Submit Cookie CSRF defense:
  // For state-changing requests, read XSRF-TOKEN cookie and attach X-XSRF-TOKEN header
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const xsrfToken = getCookie("XSRF-TOKEN");
    if (xsrfToken && !headers.has("X-XSRF-TOKEN")) {
      headers.set("X-XSRF-TOKEN", xsrfToken);
    }
  }

  return fetch(normalizedPath, {
    ...options,
    headers,
    credentials: "include", // Ensures HttpOnly hc_session cookie is always forwarded
  });
}

/**
 * Type-safe API request helper that parses JSON responses and throws structured Errors on failure.
 */
export async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiRawFetch(path, options);

  if (!res.ok) {
    let errorMsg = `Request failed with status ${res.status}`;
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message || (errorData.errors && errorData.errors[0]?.defaultMessage) || errorMsg;
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMsg);
  }

  if (res.status === 204) {
    return {} as T;
  }

  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await res.json()) as T;
  }

  return (await res.text()) as unknown as T;
}

/**
 * Fetches the currently authenticated profile from /api/auth/me.
 * Returns null if unauthenticated or session has expired.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const user = await apiFetch<UserProfile>("/api/auth/me", { method: "GET" });
    return user;
  } catch {
    return null;
  }
}

/**
 * Terminates the authenticated session both server-side and locally.
 */
export async function logoutUser(): Promise<void> {
  try {
    await apiRawFetch("/api/auth/logout", { method: "POST" });
  } catch {
    // Session cookie deletion header received even if network drops
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem("hc_token");
    localStorage.removeItem("hc_user");
    localStorage.removeItem("hc_staff_user");
  }
}
