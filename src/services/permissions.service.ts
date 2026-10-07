import { apiClient } from "./api-client";
import { ApiResponse, UserPermission, YesNoFlag } from "@/types";

export interface BatchPermissionItem {
  menuId: string;
  createPerm: YesNoFlag;
  readPerm: YesNoFlag;
  updatePerm: YesNoFlag;
  deletePerm: YesNoFlag;
  exportPerm: YesNoFlag;
  importPerm: YesNoFlag;
}

export const permissionsService = {
  findByUserGroup: (usergroupId: string): Promise<ApiResponse<UserPermission[]>> => {
    return apiClient.get<ApiResponse<UserPermission[]>>(`/permissions/usergroup/${usergroupId}`);
  },

  batchUpdate: (payload: {
    usergroupId: string;
    permissions: BatchPermissionItem[];
  }): Promise<ApiResponse<{ updatedCount: number }>> => {
    return apiClient.put<ApiResponse<{ updatedCount: number }>>("/permissions/batch", payload);
  },
};
