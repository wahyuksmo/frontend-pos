import { apiClient } from "./api-client";
import { ApiResponse, CustomerGroup } from "@/types";

export interface QueryCustomerGroupParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const customerGroupsService = {
  findAll: (params?: QueryCustomerGroupParams): Promise<ApiResponse<CustomerGroup[]>> => {
    return apiClient.get<ApiResponse<CustomerGroup[]>>("/customer-groups", params);
  },
  getAll: (params?: QueryCustomerGroupParams): Promise<ApiResponse<CustomerGroup[]>> => {
    return customerGroupsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<CustomerGroup>> => {
    return apiClient.get<ApiResponse<CustomerGroup>>(`/customer-groups/${id}`);
  },

  create: (data: Partial<CustomerGroup>): Promise<ApiResponse<CustomerGroup>> => {
    return apiClient.post<ApiResponse<CustomerGroup>>("/customer-groups", data);
  },

  update: (id: string, data: Partial<CustomerGroup>): Promise<ApiResponse<CustomerGroup>> => {
    return apiClient.patch<ApiResponse<CustomerGroup>>(`/customer-groups/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/customer-groups/${id}`);
  },
};
