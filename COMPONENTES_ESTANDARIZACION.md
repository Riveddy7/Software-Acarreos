# Código de Componentes para Estandarización

## 1. Actualización de Sistema de Colores

### `src/constants/colors.ts`
```typescript
export const COLORS = {
  primary: '#2D3748',    // Carbón
  accent: '#38A169',     // Verde Construcción
  success: '#38A169',    // Verde Construcción
  warning: '#D69E2E',    // Amarillo
  danger: '#E53E3E',     // Rojo
  info: '#3182CE',       // Azul
  gray: {
    50: '#F7FAFC',
    100: '#EDF2F7',
    200: '#E2E8F0',
    300: '#CBD5E0',
    400: '#A0AEC0',
    500: '#718096',
    600: '#4A5568',
    700: '#2D3748',
    800: '#1A202C',
    900: '#171923',
  }
};

export const STATUS_COLORS = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  PARTIAL: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  EN_TRANSITO: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
};
```

## 2. Componentes UI Reutilizables

### `src/components/ui/Button.tsx`
```typescript
'use client';

import React from 'react';
import { COLORS } from '@/constants/colors';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: `bg-[${COLORS.accent}] text-white hover:bg-[#2F8C5A] focus:ring-[${COLORS.accent}]`,
    secondary: `bg-[${COLORS.primary}] text-white hover:bg-[#1A202C] focus:ring-[${COLORS.primary}]`,
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };
  
  const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
  
  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;
  
  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### `src/components/ui/StatusBadge.tsx`
```typescript
'use client';

import React from 'react';
import { STATUS_COLORS } from '@/constants/colors';

export type Status = 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED' | 'EN_TRANSITO';

export interface StatusBadgeProps {
  status: Status;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className = ''
}) => {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  
  const statusLabels = {
    PENDING: 'Pendiente',
    PARTIAL: 'Parcial',
    COMPLETED: 'Completado',
    CANCELLED: 'Cancelado',
    EN_TRANSITO: 'En Tránsito'
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs font-medium'
  };
  
  const classes = `inline-flex items-center rounded-full ${colors.bg} ${colors.text} ${colors.border} border ${sizeClasses[size]} ${className}`;
  
  return (
    <span className={classes}>
      {statusLabels[status]}
    </span>
  );
};
```

### `src/components/ui/SearchInput.tsx`
```typescript
'use client';

import React, { useState, useEffect, useCallback } from 'react';

export interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  debounceMs = 300,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value);
  
  // Debounce search
  const debouncedOnChange = useCallback(
    debounce((searchValue: string) => {
      onChange(searchValue);
    }, debounceMs),
    [onChange, debounceMs]
  );
  
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    debouncedOnChange(newValue);
  };
  
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        className={`block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-[#38A169] focus:border-[#38A169] sm:text-sm ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

// Utility function for debouncing
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### `src/components/ui/PageHeader.tsx`
```typescript
'use client';

import React from 'react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = ''
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
```

### `src/components/ui/DataTable.tsx`
```typescript
'use client';

import React from 'react';

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T, index: number) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  onRowClick,
  className = ''
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (data.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`bg-white shadow rounded-lg overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  scope="col"
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr
                key={index}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                  >
                    {column.render ? column.render(item[column.key], item, index) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

### `src/components/ui/ConfirmModal.tsx`
```typescript
'use client';

import React from 'react';
import { Button } from './Button';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
  danger = false
}) => {
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    onConfirm();
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className={`mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full ${danger ? 'bg-red-100' : 'bg-yellow-100'} sm:mx-0 sm:h-10 sm:w-10`}>
                <svg className={`h-6 w-6 ${danger ? 'text-red-600' : 'text-yellow-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {danger ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  )}
                </svg>
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {message}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <Button
              type="button"
              variant={danger ? 'danger' : 'primary'}
              loading={loading}
              onClick={handleConfirm}
              className="w-full sm:ml-3 sm:w-auto"
            >
              {confirmText}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
            >
              {cancelText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 3. Implementación en Páginas

### Ejemplo de uso en `src/app/admin/suppliers/page.tsx`
```typescript
// Importar nuevos componentes
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SearchInput } from '@/components/ui/SearchInput';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

// Definir columnas para la tabla
const columns: Column<Supplier>[] = [
  {
    key: 'name',
    label: 'Nombre',
    render: (value, supplier) => (
      <div>
        <div className="font-medium text-gray-900">{value}</div>
        {supplier.address && (
          <div className="text-sm text-gray-500">{supplier.address}</div>
        )}
      </div>
    )
  },
  {
    key: 'contact',
    label: 'Contacto',
    render: (value) => value || '-'
  },
  {
    key: 'phone',
    label: 'Teléfono',
    render: (value) => value || '-'
  },
  {
    key: 'email',
    label: 'Email',
    render: (value) => value || '-'
  },
  {
    key: 'actions',
    label: 'Acciones',
    render: (_, supplier) => (
      <div className="flex space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openEditModal(supplier)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
          </svg>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => openDeleteModal(supplier)}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </Button>
      </div>
    )
  }
];

// En el componente principal
return (
  <div>
    <PageHeader
      title="Proveedores"
      actions={
        <Button onClick={openAddModal}>
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
          </svg>
          Nuevo Proveedor
        </Button>
      }
    />
    
    <div className="mb-6">
      <SearchInput
        placeholder="Buscar por nombre de proveedor..."
        value={searchQuery}
        onChange={setSearchQuery}
      />
    </div>
    
    <DataTable
      data={filteredSuppliers}
      columns={columns}
      loading={loading}
      emptyMessage="No hay proveedores que coincidan con la búsqueda"
    />
    
    <ConfirmModal
      isOpen={isDeleteModalOpen}
      onClose={closeDeleteModal}
      onConfirm={handleDeleteSupplier}
      title="Eliminar Proveedor"
      message={`¿Estás seguro de que quieres eliminar el proveedor "${selectedSupplier?.name}"? Esta acción no se puede deshacer.`}
      confirmText="Eliminar"
      danger={true}
      loading={deleting}
    />
  </div>
);
```

## 4. Actualización de `src/lib/theme-classes.ts`
```typescript
import { COLORS } from '@/constants/colors';

export const getThemeClasses = (isDark: boolean) => ({
  // Backgrounds
  bgPrimary: isDark ? 'bg-[#000006]' : 'bg-gray-100',
  bgSecondary: isDark ? 'bg-[#313636]' : 'bg-white',
  bgTertiary: isDark ? 'bg-[#7a7282]/10' : 'bg-gray-50',
  bgHover: isDark ? 'hover:bg-[#7a7282]/10' : 'hover:bg-gray-50',

  // Text
  textPrimary: isDark ? 'text-[#f6eef6]' : 'text-gray-900',
  textSecondary: isDark ? 'text-[#bebfd5]' : 'text-gray-700',
  textTertiary: isDark ? 'text-[#7a7282]' : 'text-gray-500',

  // Borders
  border: isDark ? 'border-[#7a7282]/20' : 'border-gray-200',
  borderHover: isDark ? 'hover:border-[#7a7282]/40' : 'hover:border-gray-300',

  // Cards
  card: isDark ? 'bg-[#313636] border border-[#7a7282]/20' : 'bg-white border border-gray-200 shadow-sm',
  cardHover: isDark ? 'hover:border-[#7a7282]/40' : 'hover:shadow-md',

  // Buttons - Actualizados con colores oficiales
  btnPrimary: `bg-[${COLORS.accent}] text-white hover:bg-[#2F8C5A] focus:ring-[${COLORS.accent}]`,
  btnSecondary: `bg-[${COLORS.primary}] text-white hover:bg-[#1A202C] focus:ring-[${COLORS.primary}]`,
  btnDanger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  btnGhost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',

  // Tables
  tableHeader: isDark ? 'bg-[#313636] border-b border-[#7a7282]/20' : 'bg-gray-50 border-b border-gray-200',
  tableRow: isDark ? 'border-b border-[#7a7282]/20 hover:bg-[#7a7282]/10' : 'border-b border-gray-100 hover:bg-gray-50',

  // Links
  link: isDark ? 'text-[#bebfd5] hover:text-[#f6eef6]' : `text-[${COLORS.accent}] hover:text-[#2F8C5A]`,

  // Inputs
  input: isDark
    ? 'bg-[#313636] border-[#7a7282]/30 text-[#f6eef6] focus:border-[#bebfd5]'
    : `bg-white border-gray-300 text-gray-900 focus:border-[${COLORS.accent}]`,

  // Status badges
  statusPending: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800',
  statusPartial: isDark ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-800',
  statusCompleted: isDark ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-100 text-green-800',
  statusInTransit: isDark ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 'bg-yellow-100 text-yellow-800',
});
```

## 5. Tipos Comunes

### `src/types/common.ts`
```typescript
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
```

## 6. Resumen de Implementación

### Pasos para Implementar:
1. Crear archivos de constantes y tipos
2. Crear componentes UI reutilizables
3. Actualizar sistema de temas
4. Refactorizar página de proveedores
5. Refactorizar página de órdenes de compra
6. Probar y ajustar

### Beneficios:
- **Consistencia visual**: Uso consistente de colores y estilos
- **Mantenibilidad**: Componentes reutilizables y centralizados
- **Accesibilidad**: Mejores prácticas implementadas
- **UX**: Estados de carga, confirmaciones y feedback mejorados
- **Performance**: Componentes optimizados con memoización

### Próximos Pasos:
1. Implementar estos componentes en el proyecto
2. Actualizar las páginas específicas
3. Realizar pruebas de funcionalidad
4. Documentar el uso de componentes para el equipo