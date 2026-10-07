import { apiClient } from "./api-client";
import { ApiResponse, Order } from "@/types";

export interface QueryOrderParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  registerId?: string;
  shiftId?: string;
  tableId?: string;
  customerId?: string;
  orderStatus?: string;
  paymentStatus?: string;
  orderType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateOrderPayload {
  outletId: string;
  shiftId?: string;
  registerId?: string;
  channelId?: string;
  tableId?: string;
  customerId?: string;
  orderType?: "DINE_IN" | "TAKE_AWAY" | "DELIVERY" | "DRIVE_THRU";
  guestName?: string;
  paxCount?: number;
  discountId?: string;
  tipAmount?: number;
  notes?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    notes?: string;
    modifiers?: {
      modifierGroupId?: string;
      modifierItemId?: string;
      modifierGroupName: string;
      modifierItemName: string;
      extraPrice: number;
      quantity?: number;
    }[];
  }[];
  payments?: {
    paymentMethodId: string;
    amount: number;
    tenderedAmount?: number;
    referenceNumber?: string;
    cardLastFour?: string;
    cardHolderName?: string;
  }[];
}

export interface AddPaymentPayload {
  payments: {
    paymentMethodId: string;
    amount: number;
    tenderedAmount?: number;
    referenceNumber?: string;
    cardLastFour?: string;
    cardHolderName?: string;
  }[];
}

export interface VoidOrderPayload {
  reason: string;
}

export const ordersService = {
  findAll: (params?: QueryOrderParams): Promise<ApiResponse<Order[]>> => {
    return apiClient.get<ApiResponse<Order[]>>("/orders", params);
  },

  findById: (id: string): Promise<ApiResponse<Order>> => {
    return apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  },

  create: (data: CreateOrderPayload): Promise<ApiResponse<Order>> => {
    return apiClient.post<ApiResponse<Order>>("/orders", data);
  },

  addPayment: (id: string, data: AddPaymentPayload): Promise<ApiResponse<Order>> => {
    return apiClient.post<ApiResponse<Order>>(`/orders/${id}/payments`, data);
  },

  voidOrder: (id: string, data: VoidOrderPayload): Promise<ApiResponse<Order>> => {
    return apiClient.patch<ApiResponse<Order>>(`/orders/${id}/void`, data);
  },
};
