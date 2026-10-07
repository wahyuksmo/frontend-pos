import { apiClient, tokenStorage } from "./api-client";
import { ApiResponse, LoginCredentials, AuthSession, ChangePasswordPayload, User } from "@/types";

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> => {
    const payload = {
      username: (credentials.username || credentials.usernameOrEmail || "").trim(),
      password: credentials.password,
    };
    const res = await apiClient.post<ApiResponse<AuthSession>>("/auth/login", payload);
    const token = res.data?.tokens?.accessToken || res.data?.accessToken;
    if (token) {
      tokenStorage.set(token);
      if (res.data?.tokens?.refreshToken && typeof window !== "undefined") {
        localStorage.setItem("pos_refresh_token", res.data.tokens.refreshToken);
      }
      tokenStorage.setUser(res.data?.user);
    }
    return res;
  },

  getProfile: (): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>("/auth/profile");
  },

  changePassword: (payload: ChangePasswordPayload): Promise<ApiResponse<null>> => {
    return apiClient.post<ApiResponse<null>>("/auth/change-password", payload);
  },

  logout: () => {
    tokenStorage.remove();
  },

  getCurrentUser: (): User | null => {
    return tokenStorage.getUser<User>();
  },
};
