import { apiClient } from "./api-client";
import { ApiResponse, Brand } from "@/types";

export interface QueryBrandParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const brandsService = {
  findAll: (params?: QueryBrandParams): Promise<ApiResponse<Brand[]>> => {
    return apiClient.get<ApiResponse<Brand[]>>("/brands", params);
  },
  getAll: (params?: QueryBrandParams): Promise<ApiResponse<Brand[]>> => {
    return brandsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Brand>> => {
    return apiClient.get<ApiResponse<Brand>>(`/brands/${id}`);
  },

  create: (data: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    return apiClient.post<ApiResponse<Brand>>("/brands", data);
  },

  update: (id: string, data: Partial<Brand>): Promise<ApiResponse<Brand>> => {
    return apiClient.patch<ApiResponse<Brand>>(`/brands/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/brands/${id}`);
  },
};
