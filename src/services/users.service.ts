import { apiClient } from "./api-client";
import { ApiResponse, User } from "@/types";

export interface QueryUserParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  isActive?: string;
  isLocked?: string;
  usergroupId?: string;
}

export const usersService = {
  findAll: (params?: QueryUserParams): Promise<ApiResponse<User[]>> => {
    return apiClient.get<ApiResponse<User[]>>("/users", params);
  },

  findById: (id: string): Promise<ApiResponse<User>> => {
    return apiClient.get<ApiResponse<User>>(`/users/${id}`);
  },

  create: (data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> => {
    return apiClient.post<ApiResponse<User>>("/users", data);
  },

  update: (id: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}`, data);
  },

  toggleLock: (id: string): Promise<ApiResponse<User>> => {
    return apiClient.patch<ApiResponse<User>>(`/users/${id}/toggle-lock`);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/users/${id}`);
  },
};
