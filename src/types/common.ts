export type Status = 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED' | 'EN_TRANSITO';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: any;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}