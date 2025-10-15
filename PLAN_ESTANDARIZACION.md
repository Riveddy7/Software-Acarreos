# Plan de Estandarización - Órdenes de Compra y Proveedores

## 1. Actualización de Sistema de Colores

### Actualizar `src/lib/theme-classes.ts`
```typescript
// Colores oficiales
const COLORS = {
  primary: '#2D3748', // Carbón
  accent: '#38A169',  // Verde Construcción
  // ... otros colores
};

export const getThemeClasses = (isDark: boolean) => ({
  // Actualizar con colores oficiales
  btnPrimary: isDark
    ? 'bg-[#38A169] text-white hover:bg-[#2F8C5A]'
    : 'bg-[#38A169] text-white hover:bg-[#2F8C5A]',
  btnSecondary: isDark
    ? 'bg-[#2D3748] text-white hover:bg-[#1A202C]'
    : 'bg-[#2D3748] text-white hover:bg-[#1A202C]',
  // ... demás clases
});
```

## 2. Componentes Reutilizables

### 2.1 Componente Button (`src/components/ui/Button.tsx`)
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

// Implementación con variantes y estados
```

### 2.2 Componente StatusBadge (`src/components/ui/StatusBadge.tsx`)
```typescript
interface StatusBadgeProps {
  status: 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED' | 'EN_TRANSITO';
  size?: 'sm' | 'md';
}

// Implementación con colores consistentes
```

### 2.3 Componente DataTable (`src/components/ui/DataTable.tsx`)
```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

// Implementación con sorting, filtering y paginación básica
```

### 2.4 Componente PageHeader (`src/components/ui/PageHeader.tsx`)
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

// Implementación con estructura consistente
```

### 2.5 Componente SearchInput (`src/components/ui/SearchInput.tsx`)
```typescript
interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  debounceMs?: number;
}

// Implementación con debounce
```

## 3. Estandarización de Página de Órdenes de Compra

### 3.1 Actualizar `src/app/admin/purchase-orders/page.tsx`
- Usar componente PageHeader
- Usar componente SearchInput con debounce
- Usar componente DataTable
- Usar componente Button para acciones
- Usar componente StatusBadge para estados
- Implementar skeletons para estado de carga

### 3.2 Actualizar `src/app/admin/purchase-orders/[id]/page.tsx`
- Usar componente PageHeader
- Usar componente Button para acciones
- Usar componente StatusBadge
- Mejorar estructura de formulario de edición
- Añadir indicadores de carga en botones

### 3.3 Actualizar `src/app/admin/purchase-orders/new/page.tsx`
- Usar componente PageHeader
- Usar componente Button para acciones
- Estandarizar estructura de formularios
- Mejorar validación y feedback

## 4. Estandarización de Página de Proveedores

### 4.1 Actualizar `src/app/admin/suppliers/page.tsx`
- Usar componente PageHeader
- Usar componente SearchInput con debounce
- Usar componente DataTable
- Usar componente Button para acciones
- Implementar skeletons para estado de carga

### 4.2 Actualizar `src/components/admin/SupplierForm.tsx`
- Usar componente Button
- Estandarizar estructura de campos
- Mejorar validación y feedback
- Añadir indicadores de carga

## 5. Mejoras de UX

### 5.1 Estados de Carga
- Implementar skeletons para tablas
- Añadir loading states en botones
- Mejorar feedback durante operaciones asíncronas

### 5.2 Acciones Destructivas
- Añadir confirmaciones para eliminar
- Implementar Modal de confirmación reutilizable
- Mejorar feedback de error

### 5.3 Accesibilidad
- Añadir aria-labels a botones con iconos
- Mejorar navegación por teclado
- Añadir focus states consistentes

### 5.4 Responsive Design
- Mejorar visualización en móviles
- Optimizar tablas para pantallas pequeñas
- Ajustar espaciado y tamaños

## 6. Implementación Paso a Paso

### Paso 1: Crear Componentes Base
1. Crear `src/components/ui/Button.tsx`
2. Crear `src/components/ui/StatusBadge.tsx`
3. Crear `src/components/ui/SearchInput.tsx`
4. Crear `src/components/ui/PageHeader.tsx`
5. Actualizar `src/lib/theme-classes.ts`

### Paso 2: Crear Componentes Complejos
1. Crear `src/components/ui/DataTable.tsx`
2. Crear `src/components/ui/ConfirmModal.tsx`
3. Crear `src/components/ui/LoadingSkeleton.tsx`

### Paso 3: Actualizar Página de Proveedores
1. Actualizar `src/app/admin/suppliers/page.tsx`
2. Actualizar `src/components/admin/SupplierForm.tsx`
3. Probar y ajustar

### Paso 4: Actualizar Página de Órdenes de Compra
1. Actualizar `src/app/admin/purchase-orders/page.tsx`
2. Actualizar `src/app/admin/purchase-orders/[id]/page.tsx`
3. Actualizar `src/app/admin/purchase-orders/new/page.tsx`
4. Probar y ajustar

### Paso 5: Verificación Final
1. Revisar consistencia visual
2. Probar responsive design
3. Verificar accesibilidad
4. Documentar cambios

## 7. Código Específico de Implementación

### 7.1 Estructura de Directorios
```
src/components/ui/
├── Button.tsx
├── StatusBadge.tsx
├── SearchInput.tsx
├── PageHeader.tsx
├── DataTable.tsx
├── ConfirmModal.tsx
└── LoadingSkeleton.tsx
```

### 7.2 Constantes de Color
```typescript
// src/constants/colors.ts
export const COLORS = {
  primary: '#2D3748',    // Carbón
  accent: '#38A169',     // Verde Construcción
  success: '#38A169',    // Verde Construcción
  warning: '#D69E2E',    // Amarillo
  danger: '#E53E3E',     // Rojo
  info: '#3182CE',       // Azul
};
```

### 7.3 Tipos Comunes
```typescript
// src/types/common.ts
export type Status = 'PENDING' | 'PARTIAL' | 'COMPLETED' | 'CANCELLED' | 'EN_TRANSITO';
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
```

## 8. Pruebas y Validación

### 8.1 Checklist de Validación
- [ ] Todos los botones usan componente Button
- [ ] Todos los estados usan componente StatusBadge
- [ ] Todas las tablas usan componente DataTable
- [ ] Todas las páginas usan PageHeader
- [ ] Colores consistentes con marca
- [ ] Responsive design funcional
- [ ] Accesibilidad mejorada
- [ ] Estados de carga implementados

### 8.2 Pruebas Manuales
1. Probar creación, edición y eliminación de proveedores
2. Probar creación, edición y visualización de órdenes
3. Probar responsive en diferentes tamaños
4. Probar navegación por teclado
5. Probar estados de carga y error

## 9. Consideraciones Adicionales

### 9.1 Performance
- Implementar React.memo en componentes pesados
- Usar useCallback y useState eficientemente
- Optimizar re-renders

### 9.2 Mantenimiento
- Documentar componentes con JSDoc
- Crear storybooks para componentes ui
- Establecer guías de uso

### 9.3 Futuras Mejoras
- Implementar paginación en DataTable
- Añadir sorting avanzado
- Implementar filtros combinados
- Añadir exportación de datos