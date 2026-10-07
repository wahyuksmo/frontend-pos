import { apiClient } from "./api-client";
import type { ApiResponse } from "@/types";

export interface UploadImageResult {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export const uploadService = {
  uploadImage: async (file: File): Promise<UploadImageResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.upload<ApiResponse<UploadImageResult>>(
      "/upload/image",
      formData
    );
    return res.data;
  },
};
