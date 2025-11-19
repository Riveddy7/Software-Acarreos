# Estado Actual de la Aplicación - Acarreo.mx

## Resumen Ejecutivo

El sistema Acarreo.mx es una aplicación web para la gestión de acarreos y materiales en obras de construcción. La aplicación utiliza Next.js 15, TypeScript y Firebase Firestore como base de datos.

## Pantallas Activas (Menú de Navegación)

### OPERACIONES PRINCIPALES
1. **Vista de Requisiciones** (`/admin/requisiciones-material-vista`)
   - Visualización interactiva de requisiciones de material
   - Formulario para crear nuevas requisiciones
   - Gestión de múltiples materiales por requisición

2. **Acarreos** (`/admin/acarreos`)
   - Gestión de registros de acarreos
   - Control de carga y descarga de materiales

### GESTIÓN DE CAMIONES Y TRANSPORTE
3. **Camiones** (`/admin/trucks`)
   - Gestión de camiones (volteo, cisterna, góndolas)
   - Información completa: marca, modelo, placas, etc.

4. **Transportistas** (`/admin/transportistas`)
   - Gestión de empresas transportistas
   - Información de contacto y estado

5. **Tipos de Camión** (`/admin/tipos-camion`)
   - Clasificación de tipos de camiones

6. **Clasificaciones de Viaje** (`/admin/clasificaciones-viaje`)
   - Categorías para clasificar los viajes

### GESTIÓN DE OBRAS Y LOGÍSTICA
7. **Obras** (`/admin/obras`)
   - Gestión de obras de construcción
   - Relación con clientes y empresas internas

8. **Lugares** (`/admin/lugares`)
   - Ubicaciones específicas dentro de las obras
   - Coordenadas GPS

9. **Rutas** (`/admin/rutas`)
   - Definición de rutas entre lugares
   - Kilometraje y archivos KML

10. **Tipos de Acarreos** (`/admin/tipos-acarreo`)
    - Clasificación de tipos de acarreo

11. **Operadores** (`/admin/operadores`)
    - Gestión de operadores de camiones
    - Generación de códigos QR para impresión de tarjetas

### GESTIÓN DE MATERIALES Y PROVEEDORES
12. **Materiales** (`/admin/materials`)
    - Catálogo de materiales
    - Relación con clasificaciones y unidades

13. **Clasificaciones de Material** (`/admin/clasificaciones-material`)
    - Categorías de materiales

14. **Unidades** (`/admin/unidades`)
    - Unidades de medida

15. **Proveedores** (`/admin/suppliers`)
    - Gestión de proveedores de materiales

### GESTIÓN ADMINISTRATIVA
16. **Clientes** (`/admin/clientes`)
    - Gestión de clientes

17. **Empresas Internas** (`/admin/empresas-internas`)
    - Gestión de empresas internas del grupo

### SISTEMA Y OPERACIONES
18. **Lector de Tickets** (`/admin/ticket-reader`)
    - Escaneo de códigos QR para tickets

19. **Tickets** (`/admin/tickets`)
    - Gestión de tickets de operación

20. **Usuarios** (`/admin/users`)
    - Gestión de usuarios del sistema

### ACCESO MÓVIL
21. **Operador Móvil** (`/operator`)
    - Interfaz para operadores en dispositivos móviles

## Pantallas Existentes pero No en Navegación

Las siguientes pantallas existen en el sistema pero no están accesibles desde el menú de navegación:

- **Órdenes de Compra** (`/admin/purchase-orders`) - Oculta del menú principal
- **Purchase Orders** (`/admin/purchase-orders/new`) - Formulario de creación
- **Companies** (`/admin/companies`) - Gestión de empresas
- **Drivers** (`/admin/drivers`) - Funcionalidad movida a Operadores
- **Locations** (`/admin/locations`) - Eliminada, reemplazada por Lugares
- **Dashboard** (`/admin/page.tsx`) - Eliminada del menú
- **Requisiciones Material** (`/admin/requisiciones-material`) - Eliminada, reemplazada por Vista de Requisiciones

## Componentes UI Principales

- **Button**: Componente reutilizable con variantes (primary, secondary, danger, ghost, outline, success)
- **DataTable**: Componente para mostrar datos tabulares
- **Modal**: Componente para diálogos modales
- **ConfirmModal**: Modal para confirmaciones de eliminación
- **SearchInput**: Campo de búsqueda con filtrado
- **QrCodeDisplay**: Componente para mostrar códigos QR
- **PageHeader**: Encabezado de páginas
- **StatusBadge**: Indicadores de estado

## Estructura de Navegación

La navegación está organizada por categorías:

1. **Operaciones Principales** (más usado)
2. **Gestión de Camiones y Transporte**
3. **Gestión de Obras y Logística**
4. **Gestión de Materiales y Proveedores**
5. **Gestión Administrativa** (menos usado)
6. **Sistema y Operaciones**
7. **Acceso Móvil**

## Estado de Implementación

✅ **Completado**: Todas las pantallas principales están implementadas y funcionando
✅ **UI Consistente**: Componentes reutilizables con diseño consistente
✅ **Base de Datos**: Esquemas definidos en TypeScript
✅ **Autenticación**: Sistema de roles (admin/operator)
✅ **Responsive**: Diseño adaptativo para escritorio y móvil

## Próximos Pasos Recomendados

1. **Documentación Técnica**: Completar documentación de esquemas de base de datos
2. **Testing**: Implementar pruebas unitarias y de integración
3. **Optimización**: Mejorar rendimiento de consultas a Firestore
4. **Auditoría**: Implementar sistema de auditoría para cambios críticos
5. **Reportes**: Desarrollar módulo de reportes y análisis