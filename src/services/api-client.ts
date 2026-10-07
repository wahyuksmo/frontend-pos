const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7780/api/v1";

export const tokenStorage = {
  get: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("pos_access_token");
  },
  set: (token: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_access_token", token);
    }
  },
  remove: (): void => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("pos_access_token");
      localStorage.removeItem("pos_refresh_token");
      localStorage.removeItem("pos_current_user");
      localStorage.removeItem("pos_active_store_id");
    }
  },
  getUser: <T = any>(): T | null => {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem("pos_current_user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_current_user", JSON.stringify(user));
    }
  },
  getActiveCompany: (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("pos_active_store_id");
  },
  setActiveCompany: (storeId: string): void => {
    if (typeof window !== "undefined") {
      localStorage.setItem("pos_active_store_id", storeId);
    }
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const activeCompanyId = tokenStorage.getActiveCompany();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(activeCompanyId ? { "x-company-id": activeCompanyId } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      const path = window.location.pathname;
      if (!path.startsWith("/login") && !path.startsWith("/register")) {
        tokenStorage.remove();
        window.location.href = "/login";
      }
    }
    throw new Error(json.message || `Terjadi kesalahan (HTTP ${res.status})`);
  }

  return json as T;
}

export const apiClient = {
  get: <T>(endpoint: string, params?: Record<string, any>) => {
    if (params) {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          query.append(key, String(value));
        }
      });
      const qs = query.toString();
      if (qs) endpoint += `?${qs}`;
    }
    return request<T>(endpoint, { method: "GET" });
  },

  post: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put: <T>(endpoint: string, body?: any) => {
    return request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete: <T>(endpoint: string) => {
    return request<T>(endpoint, { method: "DELETE" });
  },

  upload: async <T>(endpoint: string, formData: FormData): Promise<T> => {
    const token = tokenStorage.get();
    const activeCompanyId = tokenStorage.getActiveCompany();
    const headers: HeadersInit = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(activeCompanyId ? { "x-company-id": activeCompanyId } : {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401 && typeof window !== "undefined") {
        const path = window.location.pathname;
        if (!path.startsWith("/login") && !path.startsWith("/register")) {
          tokenStorage.remove();
          window.location.href = "/login";
        }
      }
      throw new Error(json.message || `Upload gagal (HTTP ${res.status})`);
    }

    return json as T;
  },
};
