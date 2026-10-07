import { apiClient } from "./api-client";
import { ApiResponse, Surcharge } from "@/types";

export interface QuerySurchargeParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  applicableOrderType?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const surchargesService = {
  findAll: (params?: QuerySurchargeParams): Promise<ApiResponse<Surcharge[]>> => {
    return apiClient.get<ApiResponse<Surcharge[]>>("/surcharges", params);
  },

  findById: (id: string): Promise<ApiResponse<Surcharge>> => {
    return apiClient.get<ApiResponse<Surcharge>>(`/surcharges/${id}`);
  },

  create: (data: Partial<Surcharge>): Promise<ApiResponse<Surcharge>> => {
    return apiClient.post<ApiResponse<Surcharge>>("/surcharges", data);
  },

  update: (id: string, data: Partial<Surcharge>): Promise<ApiResponse<Surcharge>> => {
    return apiClient.patch<ApiResponse<Surcharge>>(`/surcharges/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/surcharges/${id}`);
  },
};
