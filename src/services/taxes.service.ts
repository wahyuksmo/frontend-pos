import { apiClient } from "./api-client";
import { ApiResponse, Tax } from "@/types";

export interface QueryTaxParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const taxesService = {
  findAll: (params?: QueryTaxParams): Promise<ApiResponse<Tax[]>> => {
    return apiClient.get<ApiResponse<Tax[]>>("/taxes", params);
  },

  findById: (id: string): Promise<ApiResponse<Tax>> => {
    return apiClient.get<ApiResponse<Tax>>(`/taxes/${id}`);
  },

  create: (data: Partial<Tax>): Promise<ApiResponse<Tax>> => {
    return apiClient.post<ApiResponse<Tax>>("/taxes", data);
  },

  update: (id: string, data: Partial<Tax>): Promise<ApiResponse<Tax>> => {
    return apiClient.patch<ApiResponse<Tax>>(`/taxes/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/taxes/${id}`);
  },
};
