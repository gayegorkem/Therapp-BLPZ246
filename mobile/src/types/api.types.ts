export type ApiError = {
  code: string;
  message: string;
  errors?: Array<{ field: string; message: string }>;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
};
