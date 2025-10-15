# Patrones de Diseño del Sistema de Administración

## 1. Patrones de Estructura de Layout

### Layout Principal de Administración
El sistema utiliza un layout consistente basado en:
- **Sidebar fijo** a la izquierda para navegación (DesktopSidebar)
- **Header superior** con título de página y acciones del usuario
- **Contenido principal** con padding variable (p-6 lg:p-8)
- **Sidebar móvil** deslizable (MobileSidebar)

```tsx
// Estructura básica del layout
<div className="flex h-screen bg-gray-100 text-gray-900">
  <DesktopSidebar navItems={navItems} theme="light" />
  <div className="flex-1 flex flex-col">
    <header>...</header>
    <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-100">
      {children}
    </main>
  </div>
  <MobileSidebar />
</div>
```

### Patrones de Contenedor
- **Contenedor principal**: `max-w-4xl mx-auto` para formularios
- **Contenedor de tarjetas**: `bg-white shadow-md rounded-lg p-6`
- **Contenedor de tablas**: `bg-white shadow-md shadow-[#2D3748]/30 rounded-lg overflow-hidden`

### Sistema de Grid
- **Dashboard**: Grid de 4 columnas para KPIs (`grid-cols-1 md:grid-cols-2 lg:grid-cols-4`)
- **Formularios**: Grid de 2 columnas (`grid-cols-1 md:grid-cols-2`)
- **Listas**: Grid de 3-4 columnas para controles (`grid-cols-3 gap-4` o `grid-cols-4 gap-4`)

## 2. Patrones de Componentes Reutilizables

### Sidebar Components
- **DesktopSidebar**: Navegación fija con items activos resaltados
- **MobileSidebar**: Versión deslizable para dispositivos móviles
- **Patrón de navegación**: Items con separadores (`---`) y estados activos

### Form Components
- **SupplierForm**: Formulario reutilizable con patrón de campos
- **Patrón de campo**: `label` + `input` con clases consistentes
- **Validación**: Required fields con asterisco (*)

### Modal Components
- **Modal**: Componente genérico con overlay y contenido
- **Patrón de estructura**: Overlay oscuro + contenedor centrado

## 3. Sistema de Colores y Temas

### Paleta de Colores Principal
- **Primario**: `#38A169` (verde品牌)
- **Secundario**: `#2D3748` (gris oscuro)
- **Fondo**: `gray-100` (gris claro)
- **Blanco**: `white` (para tarjetas y formularios)

### Sistema de Temas (Dual)
El sistema soporta dos temas definidos en `theme-classes.ts`:

#### Tema Light (Predeterminado)
- Background: `bg-gray-100`, `bg-white`
- Texto: `text-gray-900`, `text-gray-700`, `text-gray-500`
- Bordes: `border-gray-200`, `border-gray-300`

#### Tema Dark
- Background: `bg-[#000006]`, `bg-[#313636]`
- Texto: `text-[#f6eef6]`, `text-[#bebfd5]`, `text-[#7a7282]`
- Bordes: `border-[#7a7282]/20`

### Estados de Color
- **Pendiente**: Amarillo (`yellow-100` / `yellow-500/20`)
- **Parcial**: Azul (`blue-100` / `blue-500/20`)
- **Completado**: Verde (`green-100` / `green-500/20`)
- **En tránsito**: Amarillo (`yellow-100` / `yellow-500/20`)

## 4. Patrones de Formularios y Validaciones

### Estructura de Formularios
```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label htmlFor="field" className="block text-sm font-medium text-gray-700">
      Etiqueta *
    </label>
    <input
      type="text"
      id="field"
      name="field"
      value={formData.field}
      onChange={handleChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
    />
  </div>
</form>
```

### Patrones de Validación
- **Campos requeridos**: Marcados con asterisco (*)
- **Validación en frontend**: `required` en inputs HTML
- **Validación personalizada**: Funciones de validación antes de submit
- **Feedback de error**: Alerts para errores generales

### Patrones de Inputs
- **Texto**: Input estándar con placeholder
- **Select**: Dropdown con opción por defecto "Selecciona..."
- **Checkbox**: Para selecciones múltiples con etiqueta descriptiva
- **Textarea**: Para campos de texto largos (direcciones)

## 5. Patrones de Navegación y Breadcrumbs

### Navegación Principal
- **Sidebar**: Items activos con resaltado verde
- **Separadores**: Líneas divisorias entre secciones
- **Iconos**: SVGs inline para acciones comunes

### Navegación Secundaria
- **Botones de acción**: "Nueva Orden", "Nuevo Proveedor"
- **Enlaces de navegación**: "Ver todas →", "← Volver a..."
- **Breadcrumb implícito**: Títulos de página jerárquicos

### Patrones de Enrutamiento
```tsx
// Navegación programática
router.push('/admin/purchase-orders')
router.push('/admin/purchase-orders/new')
```

## 6. Patrones de Tablas y Listas

### Estructura de Tablas
```tsx
<div className="bg-white shadow-md rounded-lg overflow-hidden">
  <table className="min-w-full divide-y divide-gray-200">
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Columna
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {/* Filas */}
    </tbody>
  </table>
</div>
```

### Patrones de Filas
- **Hover**: `hover:bg-gray-50` para filas interactivas
- **Estados**: Badges de color para estados
- **Acciones**: Botones en la última columna
- **Responsive**: Texto truncado con `whitespace-nowrap`

### Patrones de Listas
- **Cards**: Para elementos complejos con múltiples datos
- **Dividers**: `divide-y` para separar elementos
- **Empty states**: Mensajes centrados para listas vacías

## 7. Patrones de Estado y Carga

### Estados de Carga
```tsx
if (loading) {
  return <div className="p-8">Cargando...</div>;
}
```

### Estados Vacíos
```tsx
{filteredOrders.length === 0 ? (
  <div className="p-8 text-center text-gray-500">
    No hay órdenes de compra que coincidan con la búsqueda
  </div>
) : (
  // Contenido
)}
```

### Estados de Error
- **Console logging**: `console.error()` para depuración
- **User feedback**: Alerts para errores críticos
- **Estados parciales**: Manejo de datos incompletos

## 8. Patrones de Botones y Acciones

### Botones Primarios
```tsx
<button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center shadow-md shadow-[#2D3748]/30">
  <svg className="h-5 w-5 mr-2" />
  Texto
</button>
```

### Botones Secundarios
```tsx
<button className="text-green-600 hover:text-green-900">
  Ver Detalles
</button>
```

### Patrones de Iconos
- **Posición**: Íconos a la izquierda del texto
- **Tamaño**: `h-5 w-5` consistente
- **Estilo**: SVGs inline con `fill="none"` y `stroke="currentColor"`

### Botones de Acción en Tablas
- **Editar**: Icono de lápiz con hover verde
- **Eliminar**: Icono de basura con hover rojo
- **Ver**: Texto con hover azul

## 9. Patrones de Modales y Diálogos

### Estructura de Modal
```tsx
<div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex justify-center items-center p-4">
  <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg p-6 lg:p-8 m-4 border border-gray-200">
    <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl font-normal leading-none">
        &times;
      </button>
    </div>
    <div>{children}</div>
  </div>
</div>
```

### Patrones de Contenido de Modal
- **Header**: Título y botón de cierre
- **Body**: Contenido dinámico (formularios)
- **Footer**: Botones de acción (Cancelar/Guardar)

## 10. Recomendaciones y Estandarizaciones

### Mejoras Sugeridas

1. **Componentización**
   - Crear componente `DataTable` reutilizable
   - Extraer `Button` como componente propio
   - Componentizar `StatusBadge` para estados

2. **Consistencia Visual**
   - Estandarizar sombras: actualmente se usa `shadow-md` y `shadow-md shadow-[#2D3748]/30`
   - Unificar espaciado: algunos usan `p-4`, otros `p-6`
   - Consistencia en bordes: `rounded-md` vs `rounded-lg`

3. **Accesibilidad**
   - Añadir `aria-label` a botones con solo iconos
   - Mejorar contraste en modo oscuro
   - Añadir navegación por teclado

4. **Performance**
   - Implementar paginación en tablas grandes
   - Añadir skeletons para estados de carga
   - Optimizar re-renders con `useMemo`

5. **UX Mejorada**
   - Añadir indicadores de carga en botones
   - Implementar búsquedas con debounce
   - Añadir confirmaciones para acciones destructivas

### Estandarizaciones Propuestas

1. **Sistema de Espaciado**
   ```tsx
   // Estandarizar espaciado
   const spacing = {
     xs: 'p-2',
     sm: 'p-4',
     md: 'p-6',
     lg: 'p-8'
   }
   ```

2. **Sistema de Bordes**
   ```tsx
   // Estandarizar bordes
   const borders = {
     sm: 'rounded-sm',
     md: 'rounded-md',
     lg: 'rounded-lg'
   }
   ```

3. **Sistema de Sombras**
   ```tsx
   // Estandarizar sombras
   const shadows = {
     sm: 'shadow-sm',
     md: 'shadow-md',
     lg: 'shadow-lg'
   }
   ```

### Componentes Sugeridos

1. **DataTable Component**
   ```tsx
   <DataTable
     data={orders}
     columns={columns}
     loading={loading}
     emptyMessage="No hay datos"
   />
   ```

2. **StatusBadge Component**
   ```tsx
   <StatusBadge status="PENDING" />
   ```

3. **Button Component**
   ```tsx
   <Button variant="primary" size="md" loading={submitting}>
     Guardar
   </Button>
   ```

4. **PageHeader Component**
   ```tsx
   <PageHeader
     title="Órdenes de Compra"
     actions={<Button>Nueva Orden</Button>}
   />
   ```

## Conclusión

El sistema actual tiene patrones de diseño consistentes pero hay oportunidades para mejorar la reutilización de componentes y la consistencia visual. Las recomendaciones propuestas ayudarán a crear una interfaz más mantenible y escalable.