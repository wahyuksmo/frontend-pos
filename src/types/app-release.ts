export interface AppRelease {
  releaseId: string;
  versionName: string;
  versionCode: number;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  fileSizeFormatted: string;
  releaseNotes?: string | null;
  downloadCount: number;
  isLatest: string; // 'Y' | 'N'
  isActive: string; // 'Y' | 'N'
  objectCode: string;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string | null;
  downloadUrl?: string;
  directFileUrl?: string;
  qrCode?: string;
}

export interface CreateAppReleasePayload {
  file: File;
  versionName: string;
  versionCode?: number;
  releaseNotes?: string;
  isLatest?: string;
  isActive?: string;
}

export interface UpdateAppReleasePayload {
  versionName?: string;
  versionCode?: number;
  releaseNotes?: string;
  isLatest?: string;
  isActive?: string;
}

export interface QueryAppReleaseParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
