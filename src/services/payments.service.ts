import { apiClient } from "./api-client";
import { ApiResponse } from "@/types";

export interface GenerateQrisPayload {
  orderId?: string;
  orderNumber: string;
  amount: number;
  customerName?: string;
  outletName?: string;
}

export interface GenerateQrisResponse {
  transactionId: string;
  referenceNumber: string;
  qrString: string;
  qrDataUrl: string;
  amount: number;
  expiredAt: string;
  provider: string;
  status: "PENDING" | "SUCCESS" | "EXPIRED" | "FAILED";
}

export interface PaymentStatusResponse {
  transactionId: string;
  referenceNumber: string;
  orderId?: string;
  status: "PENDING" | "SUCCESS" | "EXPIRED" | "FAILED";
  paidAt?: string;
  amount: number;
  paymentMethodCode: string;
}

export interface SimulateSuccessResponse {
  payment: PaymentStatusResponse;
  orderUpdated: boolean;
  order?: any;
}

export const paymentsService = {
  generateQris: async (payload: GenerateQrisPayload): Promise<ApiResponse<GenerateQrisResponse>> => {
    return apiClient.post<ApiResponse<GenerateQrisResponse>>("/payments/qris/generate", payload);
  },

  checkStatus: async (transactionId: string): Promise<ApiResponse<PaymentStatusResponse>> => {
    return apiClient.get<ApiResponse<PaymentStatusResponse>>(`/payments/qris/${transactionId}/status`);
  },

  simulateSuccess: async (transactionId: string): Promise<ApiResponse<SimulateSuccessResponse>> => {
    return apiClient.post<ApiResponse<SimulateSuccessResponse>>("/payments/qris/simulate-success", {
      transactionId,
    });
  },
};
