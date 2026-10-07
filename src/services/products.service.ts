import { apiClient } from "./api-client";
import { ApiResponse, Product, ProductVariant, ProductOutletPrice, ProductModifierGroup, ProductModifierItem } from "@/types";

export interface QueryProductParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  brandId?: string;
  unitId?: string;
  productType?: string;
  isForSale?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const productsService = {
  findAll: (params?: QueryProductParams): Promise<ApiResponse<Product[]>> => {
    return apiClient.get<ApiResponse<Product[]>>("/products", params);
  },
  getAll: (params?: QueryProductParams): Promise<ApiResponse<Product[]>> => {
    return productsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<Product>> => {
    return apiClient.get<ApiResponse<Product>>(`/products/${id}`);
  },

  create: (data: any): Promise<ApiResponse<Product>> => {
    return apiClient.post<ApiResponse<Product>>("/products", data);
  },

  update: (id: string, data: any): Promise<ApiResponse<Product>> => {
    return apiClient.patch<ApiResponse<Product>>(`/products/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  },

  // Variants
  addVariant: (productId: string, data: Partial<ProductVariant>): Promise<ApiResponse<ProductVariant>> => {
    return apiClient.post<ApiResponse<ProductVariant>>(`/products/${productId}/variants`, data);
  },

  deleteVariant: (variantId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/products/variants/${variantId}`);
  },

  // Outlet Price Override
  setOutletPrice: (productId: string, data: Partial<ProductOutletPrice>): Promise<ApiResponse<ProductOutletPrice>> => {
    return apiClient.post<ApiResponse<ProductOutletPrice>>(`/products/${productId}/outlet-prices`, data);
  },

  deleteOutletPrice: (priceId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/products/outlet-prices/${priceId}`);
  },

  // Modifier Groups & Items
  addModifierGroup: (productId: string, data: any): Promise<ApiResponse<ProductModifierGroup>> => {
    return apiClient.post<ApiResponse<ProductModifierGroup>>(`/products/${productId}/modifier-groups`, data);
  },

  deleteModifierGroup: (groupId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/products/modifier-groups/${groupId}`);
  },

  addModifierItem: (groupId: string, data: Partial<ProductModifierItem>): Promise<ApiResponse<ProductModifierItem>> => {
    return apiClient.post<ApiResponse<ProductModifierItem>>(`/products/modifier-groups/${groupId}/items`, data);
  },

  deleteModifierItem: (itemId: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/products/modifier-items/${itemId}`);
  },
};
