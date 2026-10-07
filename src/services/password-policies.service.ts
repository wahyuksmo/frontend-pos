import { apiClient } from "./api-client";
import { ApiResponse, PasswordPolicy } from "@/types";

export interface QueryPasswordPolicyParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const passwordPoliciesService = {
  findAll: (params?: QueryPasswordPolicyParams): Promise<ApiResponse<PasswordPolicy[]>> => {
    return apiClient.get<ApiResponse<PasswordPolicy[]>>("/password-policies", params);
  },

  findById: (id: string): Promise<ApiResponse<PasswordPolicy>> => {
    return apiClient.get<ApiResponse<PasswordPolicy>>(`/password-policies/${id}`);
  },

  update: (
    id: string,
    data: { value?: string; message?: string }
  ): Promise<ApiResponse<PasswordPolicy>> => {
    return apiClient.patch<ApiResponse<PasswordPolicy>>(`/password-policies/${id}`, data);
  },
};
