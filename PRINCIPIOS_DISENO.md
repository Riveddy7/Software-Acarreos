# Principios de Diseño - Sistema de Administración

## 🎯 Directrices Principales de Diseño

### 1. Optimización de Espacio
- **Sin títulos redundantes**: El header dinámico del sistema ya contiene el título de la página
- **Espacio maximizado para datos**: Priorizar el contenido sobre los elementos decorativos
- **Layout compacto**: Botones de acción comparten fila con elementos de búsqueda/filtros

### 2. Estructura de Layout Estándar

#### Listas y Páginas Principal
```
┌─────────────────────────────────────────────────────────┐
│ Header del Sistema (título dinámico)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Búsqueda/Filtros] [Botón Acción Principal]             │
│                                                         │
│                                                         │
│ [Tabla/Contenido Principal]                             │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Páginas de Detalles
```
┌─────────────────────────────────────────────────────────┐
│ Header del Sistema (título dinámico)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Título del Elemento    [Badge Estado] [Botones Acción]  │
│ Subtítulo/Información                                   │
│                                                         │
│                                                         │
│ [Contenido Detallado]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

#### Formularios
```
┌─────────────────────────────────────────────────────────┐
│ Header del Sistema (título dinámico)                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Título del Formulario    [Botón Volver]                 │
│                                                         │
│                                                         │
│ [Campos del Formulario]                                 │
│                                                         │
│                                                         │
│ [Botones Cancelar/Guardar]                               │
└─────────────────────────────────────────────────────────┘
```

### 3. Sistema de Grid para Controles

#### Páginas con Búsqueda
- **Desktop**: 4 columnas (3 para búsqueda/filtros, 1 para botón principal)
- **Mobile**: 1 columna (stacked)

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <div className="md:col-span-3">
    <SearchInput />
  </div>
  <div className="md:col-span-1">
    <Button className="w-full" />
  </div>
</div>
```

#### Páginas con Búsqueda y Filtros
- **Desktop**: 4 columnas (2 para búsqueda, 1 para filtros, 1 para botón)
- **Mobile**: 1 columna (stacked)

```tsx
<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
  <div className="md:col-span-2">
    <SearchInput />
  </div>
  <div>
    <Select />
  </div>
  <div>
    <Button className="w-full" />
  </div>
</div>
```

### 4. Componentes Reutilizables

#### Botones
- **Primary**: Verde construcción (#38A169) para acciones principales
- **Secondary**: Carbón (#2D3748) para acciones secundarias
- **Ghost**: Transparente para acciones menos importantes
- **Danger**: Rojo para acciones destructivas

#### Estados
- **Pendiente**: Amarillo (#D69E2E)
- **Parcial**: Azul (#3182CE)
- **Completado**: Verde (#38A169)
- **Cancelado**: Rojo (#E53E3E)

#### Tablas
- **Estructura consistente**: Headers grises, filas con hover
- **Skeletons de carga**: Animaciones durante carga
- **Estados vacíos**: Mensajes claros cuando no hay datos

### 5. Jerarquía Visual

#### Encabezados de Página
- **H1**: No usar (título en header del sistema)
- **H2**: Para títulos de sección o página
- **H3**: Para subtítulos

#### Tamaños de Texto
- **Títulos**: `text-xl font-semibold text-gray-900`
- **Subtítulos**: `text-sm text-gray-500`
- **Contenido**: `text-sm text-gray-900`

### 6. Colores de Marca

#### Colores Primarios
- **Carbón**: #2D3748 (texto primario, botones secundarios)
- **Verde Construcción**: #38A169 (botones primarios, acentos)

#### Estados de Interacción
- **Focus**: Verde construcción con anillo
- **Hover**: Variaciones más oscuras del color base
- **Active**: Estados más oscuros aún

### 7. Responsive Design

#### Breakpoints
- **Mobile**: < 768px (1 columna)
- **Tablet**: 768px - 1024px (2 columnas)
- **Desktop**: > 1024px (4 columnas)

#### Adaptaciones
- **Botones**: `w-full` en mobile para mejor usabilidad
- **Tablas**: Scroll horizontal en mobile
- **Grid**: Stacked en mobile

### 8. Accesibilidad

#### Navegación
- **Tab order**: Lógico y predecible
- **Focus states**: Visibles con color verde construcción
- **Skip links**: Para contenido principal

#### Contraste
- **Texto**: Mínimo WCAG AA (4.5:1)
- **Elementos interactivos**: Mínimo WCAG AA (3:1)

### 9. Patrones de Interacción

#### Búsquedas
- **Debounce**: 300ms para optimizar performance
- **Placeholder**: Descriptivo y útil
- **Icono**: Lupa a la izquierda

#### Confirmaciones
- **Modales**: En lugar de window.confirm
- **Contexto**: Información clara sobre la acción
- **Botones**: Claros (Confirmar/Cancelar)

#### Estados de Carga
- **Skeletons**: Para contenido estructurado
- **Spinners**: Para botones y acciones específicas
- **Feedback**: Texto claro sobre lo que está sucediendo

### 10. Mejoras de UX

#### Microinteracciones
- **Transiciones**: Suaves (200-300ms)
- **Hover states**: Inmediatos y claros
- **Loading states**: Información sobre progreso

#### Feedback
- **Acciones exitosas**: Confirmaciones visuales
- **Errores**: Claros y con soluciones sugeridas
- **Estados vacíos**: Guía sobre próximos pasos

## 🚀 Implementación

### Componentes Base
- `Button`: Botones estandarizados con variantes
- `SearchInput`: Input con debounce
- `DataTable`: Tablas con skeletons y estados vacíos
- `StatusBadge`: Badges consistentes para estados
- `ConfirmModal`: Modales de confirmación

### Estructura de Archivos
```
src/
├── constants/
│   └── colors.ts          # Colores oficiales
├── types/
│   └── common.ts          # Tipos comunes
├── components/
│   └── ui/                # Componentes reutilizables
└── app/
    └── admin/             # Páginas de administración
```

### Próximos Pasos
1. Extender patrones a otras páginas (Camiones, Choferes, etc.)
2. Implementar paginación y sorting en DataTable
3. Añadir filtros avanzados
4. Crear Storybook para documentación de componentes

## ✅ Checklist de Validación

- [ ] Sin títulos redundantes en páginas
- [ ] Botones de acción en misma fila que búsquedas/filtros
- [ ] Colores de marca consistentes
- [ ] Responsive design funcional
- [ ] Accesibilidad implementada
- [ ] Estados de carga con skeletons
- [] Confirmaciones con modales
- [ ] Búsquedas con debounce
- [ ] Componentes reutilizables tipados
- [ ] Jerarquía visual consistente

Estos principios deben aplicarse a todas las nuevas páginas y componentes del sistema para mantener consistencia y usabilidad.