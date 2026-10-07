import { apiClient } from "./api-client";
import { ApiResponse, PaymentMethod } from "@/types";

export interface QueryPaymentMethodParams {
  page?: number;
  limit?: number;
  search?: string;
  methodType?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const paymentMethodsService = {
  findAll: (params?: QueryPaymentMethodParams): Promise<ApiResponse<PaymentMethod[]>> => {
    return apiClient.get<ApiResponse<PaymentMethod[]>>("/payment-methods", params);
  },
  getAll: (params?: QueryPaymentMethodParams): Promise<ApiResponse<PaymentMethod[]>> => {
    return paymentMethodsService.findAll(params);
  },

  findById: (id: string): Promise<ApiResponse<PaymentMethod>> => {
    return apiClient.get<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`);
  },

  create: (data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> => {
    return apiClient.post<ApiResponse<PaymentMethod>>("/payment-methods", data);
  },

  update: (id: string, data: Partial<PaymentMethod>): Promise<ApiResponse<PaymentMethod>> => {
    return apiClient.patch<ApiResponse<PaymentMethod>>(`/payment-methods/${id}`, data);
  },

  delete: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/payment-methods/${id}`);
  },
};
