import { apiClient } from "./api-client";
import { ApiResponse, DiningTable } from "@/types";

export interface QueryDiningTableParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  section?: string;
  status?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const diningTablesService = {
  findAll: (params?: QueryDiningTableParams): Promise<ApiResponse<DiningTable[]>> => {
    return apiClient.get<ApiResponse<DiningTable[]>>("/dining-tables", params);
  },

  findById: (id: string): Promise<ApiResponse<DiningTable>> => {
    return apiClient.get<ApiResponse<DiningTable>>(`/dining-tables/${id}`);
  },

  create: (data: Partial<DiningTable>): Promise<ApiResponse<DiningTable>> => {
    return apiClient.post<ApiResponse<DiningTable>>("/dining-tables", data);
  },

  update: (id: string, data: Partial<DiningTable>): Promise<ApiResponse<DiningTable>> => {
    return apiClient.patch<ApiResponse<DiningTable>>(`/dining-tables/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/dining-tables/${id}`);
  },
};
