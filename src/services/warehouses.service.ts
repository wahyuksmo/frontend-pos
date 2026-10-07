import { apiClient } from "./api-client";
import { ApiResponse, Warehouse } from "@/types";

export interface QueryWarehouseParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  warehouseType?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const warehousesService = {
  findAll: (params?: QueryWarehouseParams): Promise<ApiResponse<Warehouse[]>> => {
    return apiClient.get<ApiResponse<Warehouse[]>>("/warehouses", params);
  },

  findById: (id: string): Promise<ApiResponse<Warehouse>> => {
    return apiClient.get<ApiResponse<Warehouse>>(`/warehouses/${id}`);
  },

  create: (data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
    return apiClient.post<ApiResponse<Warehouse>>("/warehouses", data);
  },

  update: (id: string, data: Partial<Warehouse>): Promise<ApiResponse<Warehouse>> => {
    return apiClient.patch<ApiResponse<Warehouse>>(`/warehouses/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/warehouses/${id}`);
  },
};
