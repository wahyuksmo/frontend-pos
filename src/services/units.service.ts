import { apiClient } from "./api-client";
import { ApiResponse, Unit } from "@/types";

export interface QueryUnitParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const unitsService = {
  findAll: (params?: QueryUnitParams): Promise<ApiResponse<Unit[]>> => {
    return apiClient.get<ApiResponse<Unit[]>>("/units", params);
  },
  getAll: (params?: QueryUnitParams): Promise<ApiResponse<Unit[]>> => {
    return unitsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Unit>> => {
    return apiClient.get<ApiResponse<Unit>>(`/units/${id}`);
  },

  create: (data: Partial<Unit>): Promise<ApiResponse<Unit>> => {
    return apiClient.post<ApiResponse<Unit>>("/units", data);
  },

  update: (id: string, data: Partial<Unit>): Promise<ApiResponse<Unit>> => {
    return apiClient.patch<ApiResponse<Unit>>(`/units/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/units/${id}`);
  },
};
