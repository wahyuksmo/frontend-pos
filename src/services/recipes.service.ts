import { apiClient } from "./api-client";
import { ApiResponse, Recipe, RecipeGrouped, BulkSaveRecipePayload } from "@/types";

export interface QueryRecipeParams {
  page?: number;
  limit?: number;
  productId?: string;
  ingredientProductId?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const recipesService = {
  findAll: (params?: QueryRecipeParams): Promise<ApiResponse<Recipe[]>> => {
    return apiClient.get<ApiResponse<Recipe[]>>("/recipes", params);
  },

  findGrouped: (params?: QueryRecipeParams): Promise<ApiResponse<RecipeGrouped[]>> => {
    return apiClient.get<ApiResponse<RecipeGrouped[]>>("/recipes/grouped", params);
  },

  findByProduct: (productId: string, variantId?: string): Promise<ApiResponse<Recipe[]>> => {
    return apiClient.get<ApiResponse<Recipe[]>>(`/recipes/product/${productId}`, { variantId });
  },

  saveBulk: (data: BulkSaveRecipePayload): Promise<ApiResponse<Recipe[]>> => {
    return apiClient.post<ApiResponse<Recipe[]>>("/recipes/bulk", data);
  },

  deleteByProduct: (productId: string, variantId?: string): Promise<ApiResponse<null>> => {
    const url = variantId
      ? `/recipes/product/${productId}?variantId=${encodeURIComponent(variantId)}`
      : `/recipes/product/${productId}`;
    return apiClient.delete<ApiResponse<null>>(url);
  },

  findById: (id: string): Promise<ApiResponse<Recipe>> => {
    return apiClient.get<ApiResponse<Recipe>>(`/recipes/${id}`);
  },

  create: (data: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
    return apiClient.post<ApiResponse<Recipe>>("/recipes", data);
  },

  update: (id: string, data: Partial<Recipe>): Promise<ApiResponse<Recipe>> => {
    return apiClient.patch<ApiResponse<Recipe>>(`/recipes/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/recipes/${id}`);
  },
};
