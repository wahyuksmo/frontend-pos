import { apiClient } from "./api-client";
import { ApiResponse, Supplier } from "@/types";

export interface QuerySupplierParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const suppliersService = {
  findAll: (params?: QuerySupplierParams): Promise<ApiResponse<Supplier[]>> => {
    return apiClient.get<ApiResponse<Supplier[]>>("/suppliers", params);
  },
  getAll: (params?: QuerySupplierParams): Promise<ApiResponse<Supplier[]>> => {
    return suppliersService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Supplier>> => {
    return apiClient.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  },

  create: (data: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    return apiClient.post<ApiResponse<Supplier>>("/suppliers", data);
  },

  update: (id: string, data: Partial<Supplier>): Promise<ApiResponse<Supplier>> => {
    return apiClient.patch<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/suppliers/${id}`);
  },
};
