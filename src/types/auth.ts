import { User } from "./pos";

export interface LoginCredentials {
  username?: string;
  usernameOrEmail?: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: string;
}

export interface AuthSession {
  tokens?: AuthTokens;
  accessToken?: string;
  refreshToken?: string;
  user: User;
  permissions?: any[];
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
