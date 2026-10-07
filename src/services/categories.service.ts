import { apiClient } from "./api-client";
import { ApiResponse, Category } from "@/types";

export interface QueryCategoryParams {
  page?: number;
  limit?: number;
  search?: string;
  parentCategoryId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const categoriesService = {
  findAll: (params?: QueryCategoryParams): Promise<ApiResponse<Category[]>> => {
    return apiClient.get<ApiResponse<Category[]>>("/categories", params);
  },
  getAll: (params?: QueryCategoryParams): Promise<ApiResponse<Category[]>> => {
    return categoriesService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Category>> => {
    return apiClient.get<ApiResponse<Category>>(`/categories/${id}`);
  },

  create: (data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return apiClient.post<ApiResponse<Category>>("/categories", data);
  },

  update: (id: string, data: Partial<Category>): Promise<ApiResponse<Category>> => {
    return apiClient.patch<ApiResponse<Category>>(`/categories/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/categories/${id}`);
  },
};
