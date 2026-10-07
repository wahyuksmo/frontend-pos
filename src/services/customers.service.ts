import { apiClient } from "./api-client";
import { ApiResponse, Customer } from "@/types";

export interface QueryCustomerParams {
  page?: number;
  limit?: number;
  search?: string;
  customerGroupId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const customersService = {
  findAll: (params?: QueryCustomerParams): Promise<ApiResponse<Customer[]>> => {
    return apiClient.get<ApiResponse<Customer[]>>("/customers", params);
  },
  getAll: (params?: QueryCustomerParams): Promise<ApiResponse<Customer[]>> => {
    return customersService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Customer>> => {
    return apiClient.get<ApiResponse<Customer>>(`/customers/${id}`);
  },

  create: (data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return apiClient.post<ApiResponse<Customer>>("/customers", data);
  },

  update: (id: string, data: Partial<Customer>): Promise<ApiResponse<Customer>> => {
    return apiClient.patch<ApiResponse<Customer>>(`/customers/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/customers/${id}`);
  },
};
