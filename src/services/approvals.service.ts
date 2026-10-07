import { apiClient } from "./api-client";
import { ApiResponse, ApprovalLookups, ApprovalTemplate, ApprovalTransaction } from "@/types";

export interface QueryApprovalTemplateParams {
  page?: number;
  limit?: number;
  search?: string;
  objectCode?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const approvalsService = {
  // === TEMPLATE ENGINE METHODS ===
  getLookups: (): Promise<ApiResponse<ApprovalLookups>> => {
    return apiClient.get<ApiResponse<ApprovalLookups>>("/approvals/templates/lookups");
  },

  getTemplates: (params?: QueryApprovalTemplateParams): Promise<ApiResponse<ApprovalTemplate[]>> => {
    return apiClient.get<ApiResponse<ApprovalTemplate[]>>("/approvals/templates", params);
  },

  getTemplateById: (id: string): Promise<ApiResponse<ApprovalTemplate>> => {
    return apiClient.get<ApiResponse<ApprovalTemplate>>(`/approvals/templates/${id}`);
  },

  createTemplate: (data: Partial<ApprovalTemplate>): Promise<ApiResponse<ApprovalTemplate>> => {
    return apiClient.post<ApiResponse<ApprovalTemplate>>("/approvals/templates", data);
  },

  updateTemplate: (id: string, data: Partial<ApprovalTemplate>): Promise<ApiResponse<ApprovalTemplate>> => {
    return apiClient.patch<ApiResponse<ApprovalTemplate>>(`/approvals/templates/${id}`, data);
  },

  deleteTemplate: (id: string): Promise<ApiResponse<null>> => {
    return apiClient.delete<ApiResponse<null>>(`/approvals/templates/${id}`);
  },

  // === TRANSACTION ENGINE RUNTIME METHODS ===
  initiateApproval: (data: {
    objectCode: string;
    objectId: string;
    amount?: number;
    requestedByUserId?: string;
  }): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.post<ApiResponse<ApprovalTransaction>>("/approvals/transactions", data);
  },

  getApprovalStatus: (id: string): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.get<ApiResponse<ApprovalTransaction>>(`/approvals/transactions/${id}`);
  },

  getApprovalHistory: (objectCode: string, objectId: string): Promise<ApiResponse<ApprovalTransaction[]>> => {
    return apiClient.get<ApiResponse<ApprovalTransaction[]>>(`/approvals/transactions/object/${objectCode}/${objectId}`);
  },

  approve: (id: string, notes?: string): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.post<ApiResponse<ApprovalTransaction>>(`/approvals/transactions/${id}/approve`, { notes });
  },

  reject: (id: string, notes?: string): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.post<ApiResponse<ApprovalTransaction>>(`/approvals/transactions/${id}/reject`, { notes });
  },

  revise: (id: string, notes?: string): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.post<ApiResponse<ApprovalTransaction>>(`/approvals/transactions/${id}/revise`, { notes });
  },

  resubmit: (id: string, notes?: string): Promise<ApiResponse<ApprovalTransaction>> => {
    return apiClient.post<ApiResponse<ApprovalTransaction>>(`/approvals/transactions/${id}/resubmit`, { notes });
  },
};

