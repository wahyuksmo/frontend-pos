import { apiClient } from "./api-client";
import {
  ApiResponse,
  Production,
  CreateProductionPayload,
  CalculateBomResponse,
} from "@/types";

export interface QueryProductionParams {
  page?: number;
  limit?: number;
  warehouseId?: string;
  productId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const productionsService = {
  findAll: (params?: QueryProductionParams): Promise<ApiResponse<Production[]>> => {
    return apiClient.get<ApiResponse<Production[]>>("/inventory/productions", params);
  },

  findById: (id: string): Promise<ApiResponse<Production>> => {
    return apiClient.get<ApiResponse<Production>>(`/inventory/productions/${id}`);
  },

  create: (data: CreateProductionPayload): Promise<ApiResponse<Production>> => {
    return apiClient.post<ApiResponse<Production>>("/inventory/productions", data);
  },

  calculateFromBom: (
    productId: string,
    quantity: number = 1,
    variantId?: string
  ): Promise<ApiResponse<CalculateBomResponse>> => {
    return apiClient.get<ApiResponse<CalculateBomResponse>>("/inventory/productions/calculate", {
      productId,
      quantity,
      variantId,
    });
  },
};
