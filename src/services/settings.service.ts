import { apiClient } from "./api-client";
import { ApiResponse, SystemSetting } from "@/types";

export interface QuerySettingParams {
  page?: number;
  limit?: number;
  search?: string;
  settingKey?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateSettingData {
  settingKey: string;
  settingValue: string;
  valueType?: string;
  description?: string | null;
  objectCode?: string | null;
}

export const settingsService = {
  findAll: (params?: QuerySettingParams): Promise<ApiResponse<SystemSetting[]>> => {
    return apiClient.get<ApiResponse<SystemSetting[]>>("/settings", params);
  },

  findById: (id: string): Promise<ApiResponse<SystemSetting>> => {
    return apiClient.get<ApiResponse<SystemSetting>>(`/settings/${id}`);
  },

  create: (data: CreateSettingData): Promise<ApiResponse<SystemSetting>> => {
    return apiClient.post<ApiResponse<SystemSetting>>("/settings", data);
  },

  update: (id: string, data: Partial<CreateSettingData>): Promise<ApiResponse<SystemSetting>> => {
    return apiClient.patch<ApiResponse<SystemSetting>>(`/settings/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/settings/${id}`);
  },
};
