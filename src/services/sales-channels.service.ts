import { apiClient } from "./api-client";
import { ApiResponse, SalesChannel } from "@/types";

export interface QuerySalesChannelParams {
  page?: number;
  limit?: number;
  search?: string;
  orderType?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const salesChannelsService = {
  findAll: (params?: QuerySalesChannelParams): Promise<ApiResponse<SalesChannel[]>> => {
    return apiClient.get<ApiResponse<SalesChannel[]>>("/sales-channels", params);
  },

  findById: (id: string): Promise<ApiResponse<SalesChannel>> => {
    return apiClient.get<ApiResponse<SalesChannel>>(`/sales-channels/${id}`);
  },

  create: (data: Partial<SalesChannel>): Promise<ApiResponse<SalesChannel>> => {
    return apiClient.post<ApiResponse<SalesChannel>>("/sales-channels", data);
  },

  update: (id: string, data: Partial<SalesChannel>): Promise<ApiResponse<SalesChannel>> => {
    return apiClient.patch<ApiResponse<SalesChannel>>(`/sales-channels/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/sales-channels/${id}`);
  },
};
