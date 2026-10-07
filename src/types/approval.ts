export type ApproverType = 'DIRECT_MANAGER' | 'ROLE' | 'SPECIFIC_USER';
export type ApprovalStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';
export type ApprovalActionType = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISED';

export interface ApprovalLookups {
  modules: { value: string; label: string }[];
  approverTypes: { value: string; label: string }[];
  usergroups: { value: string; label: string }[];
  users: { value: string; label: string }[];
}

export interface ApprovalTemplateDetail {
  templateDetailId?: string;
  templateId?: string;
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  usergroupId?: string | null;
  userId?: string | null;
  canRevise?: string;
  usergroup?: {
    usergroupId: string;
    usergroupName: string;
    usergroupCode: string;
  };
  user?: {
    userId: string;
    fullname: string;
    username: string;
  };
}

export interface ApprovalTemplate {
  templateId: string;
  templateCode: string;
  templateName: string;
  objectCode: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  description?: string | null;
  isActive: string;
  createdAt: string;
  updatedAt: string;
  details: ApprovalTemplateDetail[];
  _count?: {
    transactions: number;
  };
}

export interface ApprovalTransactionDetail {
  approvalDetailId: string;
  approvalId: string;
  stepOrder: number;
  stepName: string;
  approverType: ApproverType;
  usergroupId?: string | null;
  assignedUserId?: string | null;
  actionByUserId?: string | null;
  action: ApprovalActionType;
  notes?: string | null;
  actionAt?: string | null;
  actionByUser?: {
    userId: string;
    fullname: string;
    username: string;
  };
}

export interface ApprovalTransaction {
  approvalId: string;
  templateId: string;
  objectCode: string;
  objectId: string;
  totalSteps: number;
  currentStep: number;
  status: ApprovalStatus;
  createdAt: string;
  updatedAt: string;
  template?: {
    templateCode: string;
    templateName: string;
    objectCode?: string;
  };
  details: ApprovalTransactionDetail[];
}

