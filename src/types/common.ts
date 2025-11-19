export type Status = 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED' | 'EN_TRANSITO' | 'ACTIVO' | 'INACTIVO';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
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
  [key: string]: string | number | boolean | undefined;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}