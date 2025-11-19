# Análisis del Flujo de Operador - Acarreo.mx

## Resumen Ejecutivo

El módulo de operador (`/operator`) está diseñado para uso móvil y facilita las operaciones diarias de despacho, entrega y recepción de materiales. El flujo está optimizado para dispositivos táctiles y operaciones rápidas en campo.

## Estructura del Módulo

### Pantallas Principales

1. **Inicio del Operador** (`/operator`)
   - Punto de entrada principal
   - Selector de ubicación actual
   - Acceso a las tres operaciones principales

2. **Despacho** (`/operator/dispatch`)
   - Registro de nuevos envíos
   - Selección de camión, chofer y materiales
   - Confirmación y generación de tickets

3. **Entrega** (`/operator/delivery`)
   - Registro de descargas
   - Escaneo de camiones en tránsito
   - Confirmación de entrega

4. **Recepciones** (`/operator/receptions`)
   - Gestión de recepciones de materiales
   - Basado en órdenes de compra
   - Control de inventario

5. **Tickets** (`/operator/ticket/[shipmentId]`)
   - Visualización de tickets específicos
   - Códigos QR para seguimiento

## Flujo Detallado por Operación

### 1. Flujo de Despacho

**Paso 1: Selección de Camión**
- Lista desplegable con todos los camiones disponibles
- Muestra placa y modelo
- Requerido para continuar

**Paso 2: Selección de Chofer**
- Lista desplegable con choferes disponibles
- Requerido para continuar

**Paso 3: Selección de Materiales y Ubicación**
- Selector múltiple de materiales
- Control de cantidades con botones +/- 
- Cálculo automático de total
- Selección de ubicación de despacho

**Paso 4: Confirmación**
- Resumen completo del despacho
- Creación de shipment en Firestore
- Actualización de estado de camión y chofer
- Generación de ticket de despacho

### 2. Flujo de Entrega

**Paso 1: Escaneo/Ingreso de ID de Camión**
- Input manual o escaneo de ID
- Búsqueda automática de shipment activo
- Validación de estado EN_TRANSITO

**Paso 2: Confirmación de Entrega**
- Muestra datos del shipment encontrado
- Selección de ubicación de descarga
- Confirmación y actualización de estados
- Generación de ticket de entrega

### 3. Flujo de Recepciones

**Paso 1: Selección de Orden de Compra**
- Lista de órdenes pendientes para la ubicación actual
- Filtrado por estado (PENDING, PARTIAL)
- Información de proveedor y materiales

**Paso 2: Escaneo de Camión**
- Ingreso de código del camión
- Validación de volumen configurado
- Asociación automática con capacidad

**Paso 3: Selección de Material**
- Lista de materiales pendientes de recibir
- Cálculo automático basado en volumen del camión
- Control de cantidades parciales

**Paso 4: Confirmación de Recepción**
- Resumen de materiales a recibir
- Creación de registro de recepción
- Actualización de orden de compra
- Generación de ticket y shipment

## Datos Utilizados en el Flujo

### Entidades Principales

1. **Trucks (Camiones)**
   - Colección: `trucks`
   - Campos utilizados: id, plate, model, volume, status
   - Estados: AVAILABLE, IN_SHIPMENT

2. **Drivers (Choferes)**
   - Colección: `drivers`
   - Campos utilizados: id, name, status
   - Estados: AVAILABLE, IN_SHIPMENT

3. **Materials (Materiales)**
   - Colección: `materials`
   - Campos utilizados: id, name, unit
   - Para descripción y cantidades

4. **Locations (Ubicaciones)**
   - Colección: `locations`
   - Campos utilizados: id, name
   - Para origen y destino

5. **Shipments (Envíos)**
   - Colección: `shipments`
   - Campos utilizados: folio, truckId, driverId, materials, status
   - Multi-material support con array de materiales

6. **Tickets**
   - Colección: `tickets`
   - Tipos: dispatch, delivery, reception
   - Referencia a shipment y datos desnormalizados

7. **Purchase Orders (Órdenes de Compra)**
   - Colección: `purchase_orders`
   - Utilizadas en recepciones
   - Control de inventario y proveedores

## Componentes UI Específicos

### 1. OperatorNavigation
- Navegación inferior fija (bottom navigation)
- Solo botón de inicio activo
- Diseño mobile-first

### 2. LocationSelector
- Selector de ubicación actual del operador
- Almacenado en contexto de usuario
- Filtra datos según ubicación

### 3. Cards Móviles
- Diseño adaptado para tactil
- Bordes y sombras definidas
- Estados visuales claros

### 4. Botones de Acción
- Grandes y fáciles de presionar
- Colores distintivos por operación
- Estados de carga y deshabilitado

## Flujo de Datos con Firestore

### Despacho
```typescript
1. Crear shipment con materiales array
2. Actualizar truck status a IN_SHIPMENT
3. Actualizar driver status a IN_SHIPMENT
4. Crear ticket tipo 'dispatch'
5. Navegar a ticket creado
```

### Entrega
```typescript
1. Buscar shipment con status EN_TRANSITO
2. Actualizar shipment status a COMPLETADO
3. Actualizar truck status a AVAILABLE
4. Actualizar driver status a AVAILABLE
5. Crear ticket tipo 'delivery'
6. Navegar a ticket creado
```

### Recepción
```typescript
1. Seleccionar purchase order pendiente
2. Escanear camión y validar volumen
3. Crear reception record
4. Crear shipment tipo COMPLETADO
5. Actualizar purchase order status
6. Crear ticket tipo 'reception'
7. Redirigir a ticket creado
```

## Características Móviles

### Diseño Responsive
- Layout optimizado para móviles
- Botones grandes para tactil
- Navegación por gestos
- Safe areas para iOS

### Performance
- Carga lazy de datos maestros
- Estados de carga locales
- Manejo de errores offline
- Cache de consultas frecuentes

### UX Simplificada
- Flujo lineal con pasos claros
- Confirmaciones antes de acciones críticas
- Retroalimentación visual inmediata
- Navegación intuitiva

## Validaciones y Reglas de Negocio

### Despacho
- Camión debe estar AVAILABLE
- Chofer debe estar AVAILABLE
- Al menos un material requerido
- Ubicación de despacho requerida

### Entrega
- Camión debe tener shipment EN_TRANSITO
- Ubicación de entrega requerida
- Solo se puede entregar una vez

### Recepción
- Camión debe tener volumen configurado
- Purchase order debe estar PENDING o PARTIAL
- Cantidades validadas contra orden de compra

## Integración con Panel Admin

### Datos Compartidos
- Mismas colecciones de Firestore
- Estados sincronizados en tiempo real
- Tickets visibles en ambos paneles

### Diferencias de Propósito
- **Admin**: Gestión y configuración
- **Operator**: Operaciones diarias
- **Flujo**: Admin → Configuración → Operador → Ejecución

## Posibles Mejoras Identificadas

1. **Offline Support**
   - Cache local de datos maestros
   - Cola de operaciones offline
   - Sincronización automática

2. **Notificaciones Push**
   - Alertas de nuevos despachos
   - Confirmaciones de entrega
   - Recordatorios de recepciones

3. **GPS Integration**
   - Ubicación automática del camión
   - Validación de rutas
   - Tiempos estimados

4. **Firma Digital**
   - Confirmación con firma del receptor
   - Validación de identidad
   - Registro fotográfico

5. **Voice Commands**
   - Operación manos libres
   - Comandos de voz para escaneo
   - Integración con asistentes virtuales

## Conclusiones

El flujo de operador está bien diseñado para operaciones móviles con:

- ✅ **UX optimizada** para dispositivos táctiles
- ✅ **Flujos lineales** con validaciones claras
- ✅ **Integración completa** con panel admin
- ✅ **Multi-material support** en todas las operaciones
- ✅ **Estados consistentes** entre operador y admin
- ✅ **Tickets generados** para trazabilidad completa

El sistema permite operaciones eficientes en campo con sincronización en tiempo real con el panel administrativo.