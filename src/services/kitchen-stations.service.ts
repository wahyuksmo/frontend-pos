import { apiClient } from "./api-client";
import { ApiResponse, KitchenStation } from "@/types";

export interface QueryKitchenStationParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const kitchenStationsService = {
  findAll: (params?: QueryKitchenStationParams): Promise<ApiResponse<KitchenStation[]>> => {
    return apiClient.get<ApiResponse<KitchenStation[]>>("/kitchen-stations", params);
  },

  findById: (id: string): Promise<ApiResponse<KitchenStation>> => {
    return apiClient.get<ApiResponse<KitchenStation>>(`/kitchen-stations/${id}`);
  },

  create: (data: Partial<KitchenStation>): Promise<ApiResponse<KitchenStation>> => {
    return apiClient.post<ApiResponse<KitchenStation>>("/kitchen-stations", data);
  },

  update: (id: string, data: Partial<KitchenStation>): Promise<ApiResponse<KitchenStation>> => {
    return apiClient.patch<ApiResponse<KitchenStation>>(`/kitchen-stations/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/kitchen-stations/${id}`);
  },
};
