import { apiClient } from "./api-client";
import { ApiResponse, Discount } from "@/types";

export interface QueryDiscountParams {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: string;
  requiresApproval?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const discountsService = {
  findAll: (params?: QueryDiscountParams): Promise<ApiResponse<Discount[]>> => {
    return apiClient.get<ApiResponse<Discount[]>>("/discounts", params);
  },
  getAll: (params?: QueryDiscountParams): Promise<ApiResponse<Discount[]>> => {
    return discountsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Discount>> => {
    return apiClient.get<ApiResponse<Discount>>(`/discounts/${id}`);
  },

  create: (data: Partial<Discount>): Promise<ApiResponse<Discount>> => {
    return apiClient.post<ApiResponse<Discount>>("/discounts", data);
  },

  update: (id: string, data: Partial<Discount>): Promise<ApiResponse<Discount>> => {
    return apiClient.patch<ApiResponse<Discount>>(`/discounts/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/discounts/${id}`);
  },
};
