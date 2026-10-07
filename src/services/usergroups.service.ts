import { apiClient } from "./api-client";
import { ApiResponse, UserGroup } from "@/types";

export interface QueryUserGroupParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const usergroupsService = {
  findAll: (params?: QueryUserGroupParams): Promise<ApiResponse<UserGroup[]>> => {
    return apiClient.get<ApiResponse<UserGroup[]>>("/usergroups", params);
  },

  findById: (id: string): Promise<ApiResponse<UserGroup>> => {
    return apiClient.get<ApiResponse<UserGroup>>(`/usergroups/${id}`);
  },

  create: (data: { usergroupCode: string; usergroupName: string }): Promise<ApiResponse<UserGroup>> => {
    return apiClient.post<ApiResponse<UserGroup>>("/usergroups", data);
  },

  update: (id: string, data: Partial<UserGroup>): Promise<ApiResponse<UserGroup>> => {
    return apiClient.patch<ApiResponse<UserGroup>>(`/usergroups/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/usergroups/${id}`);
  },
};
