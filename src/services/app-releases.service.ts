import { apiClient } from "./api-client";
import type {
  ApiResponse,
  AppRelease,
  CreateAppReleasePayload,
  UpdateAppReleasePayload,
  QueryAppReleaseParams,
} from "@/types";

export const appReleasesService = {
  findAll: async (params?: QueryAppReleaseParams): Promise<ApiResponse<AppRelease[]>> => {
    return apiClient.get<ApiResponse<AppRelease[]>>("/app-releases", params);
  },

  findOne: async (id: string): Promise<ApiResponse<AppRelease>> => {
    return apiClient.get<ApiResponse<AppRelease>>(`/app-releases/${id}`);
  },

  getLatest: async (): Promise<ApiResponse<AppRelease>> => {
    return apiClient.get<ApiResponse<AppRelease>>("/app-releases/latest");
  },

  getQrCode: async (
    id: string
  ): Promise<{ releaseId: string; versionName: string; downloadUrl: string; qrCode: string }> => {
    return apiClient.get<{
      releaseId: string;
      versionName: string;
      downloadUrl: string;
      qrCode: string;
    }>(`/app-releases/${id}/qrcode`);
  },

  upload: async (payload: CreateAppReleasePayload): Promise<ApiResponse<AppRelease>> => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("versionName", payload.versionName);
    if (payload.versionCode) {
      formData.append("versionCode", String(payload.versionCode));
    }
    if (payload.releaseNotes) {
      formData.append("releaseNotes", payload.releaseNotes);
    }
    if (payload.isLatest) {
      formData.append("isLatest", payload.isLatest);
    }
    if (payload.isActive) {
      formData.append("isActive", payload.isActive);
    }

    return apiClient.upload<ApiResponse<AppRelease>>("/app-releases/upload", formData);
  },

  update: async (
    id: string,
    data: UpdateAppReleasePayload
  ): Promise<ApiResponse<AppRelease>> => {
    return apiClient.patch<ApiResponse<AppRelease>>(`/app-releases/${id}`, data);
  },

  delete: async (id: string): Promise<ApiResponse<void>> => {
    return apiClient.delete<ApiResponse<void>>(`/app-releases/${id}`);
  },

  getDownloadUrl: (id: string): string => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7780/api/v1";
    return `${apiBase}/app-releases/${id}/download`;
  },

  getLatestDownloadUrl: (): string => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7780/api/v1";
    return `${apiBase}/app-releases/latest/download`;
  },
};
