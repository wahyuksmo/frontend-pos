import { apiClient } from "./api-client";
import { ApiResponse, Outlet } from "@/types";

export interface QueryOutletParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const outletsService = {
  findAll: (params?: QueryOutletParams): Promise<ApiResponse<Outlet[]>> => {
    return apiClient.get<ApiResponse<Outlet[]>>("/outlets", params);
  },

  findById: (id: string): Promise<ApiResponse<Outlet>> => {
    return apiClient.get<ApiResponse<Outlet>>(`/outlets/${id}`);
  },

  create: (data: Partial<Outlet>): Promise<ApiResponse<Outlet>> => {
    return apiClient.post<ApiResponse<Outlet>>("/outlets", data);
  },

  update: (id: string, data: Partial<Outlet>): Promise<ApiResponse<Outlet>> => {
    return apiClient.patch<ApiResponse<Outlet>>(`/outlets/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/outlets/${id}`);
  },
};
