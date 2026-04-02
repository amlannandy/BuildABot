export interface ApiSuccessResponse<T> {
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  errors: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  has_more: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ListRequest<F> {
  page: number;
  limit: number;
  filters: F;
}
