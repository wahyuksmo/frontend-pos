import { apiClient } from "./api-client";
import { ApiResponse, Menu } from "@/types";

export interface QueryMenuParams {
  page?: number;
  limit?: number;
  search?: string;
  pid?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const menusService = {
  findAll: (params?: QueryMenuParams): Promise<ApiResponse<Menu[]>> => {
    return apiClient.get<ApiResponse<Menu[]>>("/menus", params);
  },

  getNavigation: (): Promise<ApiResponse<Menu[]>> => {
    return apiClient.get<ApiResponse<Menu[]>>("/menus/navigation");
  },

  getTree: (): Promise<ApiResponse<Menu[]>> => {
    return apiClient.get<ApiResponse<Menu[]>>("/menus/tree");
  },

  create: (data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    return apiClient.post<ApiResponse<Menu>>("/menus", data);
  },

  update: (id: string, data: Partial<Menu>): Promise<ApiResponse<Menu>> => {
    return apiClient.patch<ApiResponse<Menu>>(`/menus/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/menus/${id}`);
  },
};
