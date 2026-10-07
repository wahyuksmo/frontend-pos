import { apiClient } from "./api-client";
import { ApiResponse, UnitConversion } from "@/types";

export interface QueryUnitConversionParams {
  page?: number;
  limit?: number;
  fromUnitId?: string;
  toUnitId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const unitConversionsService = {
  findAll: (params?: QueryUnitConversionParams): Promise<ApiResponse<UnitConversion[]>> => {
    return apiClient.get<ApiResponse<UnitConversion[]>>("/unit-conversions", params);
  },

  findById: (id: string): Promise<ApiResponse<UnitConversion>> => {
    return apiClient.get<ApiResponse<UnitConversion>>(`/unit-conversions/${id}`);
  },

  create: (data: Partial<UnitConversion>): Promise<ApiResponse<UnitConversion>> => {
    return apiClient.post<ApiResponse<UnitConversion>>("/unit-conversions", data);
  },

  update: (id: string, data: Partial<UnitConversion>): Promise<ApiResponse<UnitConversion>> => {
    return apiClient.patch<ApiResponse<UnitConversion>>(`/unit-conversions/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/unit-conversions/${id}`);
  },
};
