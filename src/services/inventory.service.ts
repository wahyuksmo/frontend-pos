import { apiClient } from "./api-client";
import {
  ApiResponse,
  StockItem,
  StockMovementItem,
  StockAdjustmentItem,
  StockTransferItem,
} from "@/types";

export interface QueryStockParams {
  warehouseId?: string;
  search?: string;
  isLowStock?: string;
  page?: number;
  limit?: number;
}

export interface QueryMovementParams {
  warehouseId?: string;
  productId?: string;
  movementType?: string;
  referenceType?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateAdjustmentItemPayload {
  productId: string;
  variantId?: string;
  actualQuantity: number;
  notes?: string;
}

export interface CreateAdjustmentPayload {
  warehouseId: string;
  reason?: string;
  notes?: string;
  items: CreateAdjustmentItemPayload[];
}

export interface QueryAdjustmentParams {
  warehouseId?: string;
  status?: string;
  reason?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateTransferItemPayload {
  productId: string;
  variantId?: string;
  quantity: number;
  notes?: string;
}

export interface CreateTransferPayload {
  fromWarehouseId: string;
  toWarehouseId: string;
  notes?: string;
  items: CreateTransferItemPayload[];
}

export interface QueryTransferParams {
  fromWarehouseId?: string;
  toWarehouseId?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateTransferStatusPayload {
  status: string;
  notes?: string;
}

export const inventoryService = {
  // 1. Saldo Stok
  getStocks: (params?: QueryStockParams): Promise<ApiResponse<StockItem[]>> => {
    return apiClient.get<ApiResponse<StockItem[]>>("/inventory/stocks", params);
  },

  // 2. Kartu Stok & Mutasi
  getMovements: (params?: QueryMovementParams): Promise<ApiResponse<StockMovementItem[]>> => {
    return apiClient.get<ApiResponse<StockMovementItem[]>>("/inventory/movements", params);
  },

  // 3. Penyesuaian Stok / Opname
  getAdjustments: (params?: QueryAdjustmentParams): Promise<ApiResponse<StockAdjustmentItem[]>> => {
    return apiClient.get<ApiResponse<StockAdjustmentItem[]>>("/inventory/adjustments", params);
  },

  getAdjustmentById: (id: string): Promise<ApiResponse<StockAdjustmentItem>> => {
    return apiClient.get<ApiResponse<StockAdjustmentItem>>(`/inventory/adjustments/${id}`);
  },

  createAdjustment: (data: CreateAdjustmentPayload): Promise<ApiResponse<StockAdjustmentItem>> => {
    return apiClient.post<ApiResponse<StockAdjustmentItem>>("/inventory/adjustments", data);
  },

  // 4. Transfer Stok Antar Gudang
  getTransfers: (params?: QueryTransferParams): Promise<ApiResponse<StockTransferItem[]>> => {
    return apiClient.get<ApiResponse<StockTransferItem[]>>("/inventory/transfers", params);
  },

  getTransferById: (id: string): Promise<ApiResponse<StockTransferItem>> => {
    return apiClient.get<ApiResponse<StockTransferItem>>(`/inventory/transfers/${id}`);
  },

  createTransfer: (data: CreateTransferPayload): Promise<ApiResponse<StockTransferItem>> => {
    return apiClient.post<ApiResponse<StockTransferItem>>("/inventory/transfers", data);
  },

  updateTransferStatus: (id: string, data: UpdateTransferStatusPayload): Promise<ApiResponse<StockTransferItem>> => {
    return apiClient.patch<ApiResponse<StockTransferItem>>(`/inventory/transfers/${id}/status`, data);
  },
};
