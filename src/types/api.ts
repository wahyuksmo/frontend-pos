export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T = any> {
  statusCode?: number;
  success?: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
  timestamp?: string;
}

export interface PaginatedResponse<T = any> {
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}
