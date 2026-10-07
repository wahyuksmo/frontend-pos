import { apiClient } from "./api-client";
import { ApiResponse, RegisterShift, CashMovement, ShiftSummary } from "@/types";

export interface QueryShiftParams {
  page?: number;
  limit?: number;
  search?: string;
  outletId?: string;
  registerId?: string;
  cashierUserId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface OpenShiftPayload {
  outletId: string;
  registerId: string;
  openingCash: number;
}

export interface CloseShiftPayload {
  actualCash: number;
  closingNotes?: string;
}

export interface CashMovementPayload {
  movementType: "CASH_IN" | "CASH_OUT";
  amount: number;
  reason: string;
  recipient?: string;
  authorizedBy?: string;
}

export const shiftsService = {
  findAll: (params?: QueryShiftParams): Promise<ApiResponse<RegisterShift[]>> => {
    return apiClient.get<ApiResponse<RegisterShift[]>>("/shifts", params);
  },

  findById: (id: string): Promise<ApiResponse<RegisterShift>> => {
    return apiClient.get<ApiResponse<RegisterShift>>(`/shifts/${id}`);
  },

  getSummary: (id: string): Promise<ApiResponse<ShiftSummary>> => {
    return apiClient.get<ApiResponse<ShiftSummary>>(`/shifts/${id}/summary`);
  },

  getActive: (registerId?: string): Promise<ApiResponse<RegisterShift | null>> => {
    return apiClient.get<ApiResponse<RegisterShift | null>>("/shifts/active", { registerId });
  },

  open: (data: OpenShiftPayload): Promise<ApiResponse<RegisterShift>> => {
    return apiClient.post<ApiResponse<RegisterShift>>("/shifts/open", data);
  },

  close: (id: string, data: CloseShiftPayload): Promise<ApiResponse<RegisterShift>> => {
    return apiClient.post<ApiResponse<RegisterShift>>(`/shifts/${id}/close`, data);
  },

  addCashMovement: (id: string, data: CashMovementPayload): Promise<ApiResponse<CashMovement>> => {
    return apiClient.post<ApiResponse<CashMovement>>(`/shifts/${id}/cash-movement`, data);
  },
};
