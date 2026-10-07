import { apiClient } from "./api-client";
import { ApiResponse, Register } from "@/types";

export interface QueryRegisterParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const registersService = {
  findAll: (params?: QueryRegisterParams): Promise<ApiResponse<Register[]>> => {
    return apiClient.get<ApiResponse<Register[]>>("/registers", params);
  },

  findById: (id: string): Promise<ApiResponse<Register>> => {
    return apiClient.get<ApiResponse<Register>>(`/registers/${id}`);
  },

  create: (data: Partial<Register>): Promise<ApiResponse<Register>> => {
    return apiClient.post<ApiResponse<Register>>("/registers", data);
  },

  update: (id: string, data: Partial<Register>): Promise<ApiResponse<Register>> => {
    return apiClient.patch<ApiResponse<Register>>(`/registers/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/registers/${id}`);
  },
};
