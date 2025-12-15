# Modelos de Datos y Relaciones

## Base de Datos: Firestore (Firebase)

### Estructura General
- **Documentos**: Entidades principales con ID único
- **Colecciones**: Grupos de documentos del mismo tipo
- **Subcolecciones**: Documentos anidados dentro de otros documentos
- **Desnormalización**: Datos repetidos para optimizar consultas

## Modelo Base

### BaseDoc
```typescript
interface BaseDoc {
  id: string;              // Firestore document ID
  createdAt: Timestamp;     // Fecha de creación automática
}
```

## Entidades Principales

### 1. Transportista (Carrier)
```typescript
interface Transportista extends BaseDoc {
  nombre: string;           // NN - Nombre del transportista
  contacto?: string;        // Contacto principal
  telefono?: string;        // Teléfono
  email?: string;          // Correo electrónico
  direccion?: string;      // Dirección física
  activo: boolean;        // NN - Estado activo/inactivo
}
```

### 2. Tipo de Camión (Truck Type)
```typescript
interface TipoCamion extends BaseDoc {
  nombre: string;          // NN - Nombre del tipo (ej: Volteo, Cisterna)
  descripcion?: string;    // Descripción detallada
  activo: boolean;        // NN - Estado activo
}
```

### 3. Clasificación para Viajes (Trip Classification)
```typescript
interface ClasificacionViaje extends BaseDoc {
  nombre: string;          // NN - Nombre (ej: Corta Distancia, Larga Distancia)
  descripcion?: string;    // Descripción
  activo: boolean;        // NN - Estado activo
}
```

### 4. Camión (Truck) - Modelo Completo
```typescript
interface Truck extends BaseDoc {
  // Campos básicos
  model: string;                    // Modelo del camión
  volume?: number;                   // Capacidad volumétrica (m³)
  status: TruckStatus;               // AVAILABLE | IN_SHIPMENT
  currentShipmentId?: string;        // Envío actual si está en viaje
  currentDriverId?: string;          // Conductor actual
  currentDriverName?: string;        // Nombre conductor (desnormalizado)
  
  // Campos extendidos (nuevo modelo)
  idTransportista: string;           // FK (NN) - Transportista dueño
  idTipoCamion: string;             // FK (NN) - Tipo de camión
  idClasificacionViaje: string;    // FK (NN) - Clasificación de viaje
  idUltimoCamionero?: string;      // FK - Último conductor asignado
  nombreParaMostrar: string;        // NN - Nombre para mostrar
  estatusActivo: boolean;           // NN - Estado activo
  marca?: string;                   // Marca del camión
  numeroSerie?: string;             // Número de serie
  placas: string;                   // NN - Placas (reemplaza a 'plate')
  descripcionNotas?: string;         // Notas descriptivas
  
  // Campos desnormalizados para display
  transportistaNombre?: string;      // Nombre transportista (desnormalizado)
  tipoCamionNombre?: string;         // Nombre tipo camión (desnormalizado)
  clasificacionViajeNombre?: string; // Nombre clasificación (desnormalizado)
  ultimoCamioneroNombre?: string;   // Nombre último conductor (desnormalizado)
}
```

### 5. Conductor (Driver)
```typescript
interface Driver extends BaseDoc {
  name: string;                    // Nombre completo
  licenseNumber: string;            // Número de licencia
  status: DriverStatus;             // AVAILABLE | IN_SHIPMENT
  currentShipmentId?: string;       // Envío actual
  currentTruckId?: string;         // Camión actual
  currentTruckPlate?: string;       // Placas camión (desnormalizado)
}
```

### 6. Material
```typescript
interface Material extends BaseDoc {
  nombreParaMostrar: string;        // NN - Nombre para mostrar
  descripcionNotas?: string;         // Descripción
  idClasificacionMaterial: string;   // FK (NN) - Clasificación
  idUnidad: string;                 // FK (NN) - Unidad de medida
  
  // Campos desnormalizados
  clasificacionMaterialNombre?: string; // Nombre clasificación
  unidadNombre?: string;              // Nombre unidad
}
```

### 7. Clasificación de Material
```typescript
interface ClasificacionMaterial extends BaseDoc {
  nombre: string;          // NN - Nombre clasificación
  descripcion?: string;    // Descripción
  activo: boolean;        // NN - Estado activo
}
```

### 8. Unidad
```typescript
interface Unidad extends BaseDoc {
  nombre: string;          // NN - Nombre unidad (ej: m³, ton, kg)
  descripcion?: string;    // Descripción
  activo: boolean;        // NN - Estado activo
}
```

### 9. Cliente
```typescript
interface Cliente extends BaseDoc {
  nombreParaMostrar: string; // NN - Nombre del cliente
}
```

### 10. Empresa Interna
```typescript
interface EmpresaInterna extends BaseDoc {
  nombreParaMostrar: string; // NN - Nombre para mostrar
  razonSocial: string;       // Razón social legal
  logo?: string;            // URL logo en Firebase Storage
}
```

### 11. Obra (Construction Site)
```typescript
interface Obra extends BaseDoc {
  nombreParaMostrar: string;        // NN - Nombre de la obra
  idCliente: string;                // FK (NN) - Cliente dueño
  estatusActivo: boolean;           // NN - Estado activo
  descripcionNotas?: string;         // Descripción
  empresaContratante?: string;      // Empresa contratista
  idEmpresaInterna: string;          // FK (NN) - Empresa interna
  latitud?: number;                 // Coordenada latitud
  longitud?: number;                // Coordenada longitud
  
  // Campos desnormalizados
  clienteNombre?: string;            // Nombre cliente
  empresaInternaNombre?: string;     // Nombre empresa interna
}
```

### 12. Lugar (Location)
```typescript
interface Lugar extends BaseDoc {
  nombreParaMostrar: string;        // NN - Nombre del lugar
  idObra: string;                  // FK (NN) - Obra a la que pertenece
  estatusActivo: boolean;           // NN - Estado activo
  descripcionNotas?: string;         // Descripción
  latitud?: number;                 // Coordenada latitud
  longitud?: number;                // Coordenada longitud
  
  // Campos desnormalizados
  obraNombre?: string;               // Nombre obra
}
```

### 13. Tipo de Acarreo
```typescript
interface TipoAcarreo extends BaseDoc {
  nombreParaMostrar: string; // NN - Nombre tipo de acarreo
}
```

### 14. Ruta (Route)
```typescript
interface Ruta extends BaseDoc {
  nombreParaMostrar: string;        // NN - Nombre de la ruta
  idLugarOrigen: string;            // FK (NN) - Lugar de origen
  idLugarDestino: string;           // FK (NN) - Lugar de destino
  idTipoAcarreo: string;            // FK (NN) - Tipo de acarreo
  totalKilometrosReales?: number;    // Kilómetros reales
  totalKilometrosConciliados?: number; // Kilómetros conciliados
  estatusActivo: boolean;           // NN - Estado activo
  descripcionNotas?: string;         // Descripción
  kmlTexto?: string;               // Ruta en formato KML
  
  // Campos desnormalizados
  lugarOrigenNombre?: string;        // Nombre lugar origen
  lugarDestinoNombre?: string;       // Nombre lugar destino
  tipoAcarreoNombre?: string;        // Nombre tipo acarreo
}
```

### 15. Operador (Field Operator)
```typescript
interface Operador extends BaseDoc {
  idTransportista: string;    // FK (NN) - Transportista al que pertenece
  apellidoPaterno: string;    // NN - Apellido paterno
  apellidoMaterno?: string;   // Apellido materno
  nombres: string;            // NN - Nombres
  nombreParaMostrar?: string; // Nombre completo para mostrar
  
  // Campos desnormalizados
  transportistaNombre?: string; // Nombre transportista
}
```

### 16. Acarreo (Hauling Event)
```typescript
interface Acarreo extends BaseDoc {
  // Datos básicos
  idEmpresaInterna: string;          // FK (NN) - Empresa interna
  fechaHora: Timestamp;              // DATETIME (NN) - Fecha/hora del evento
  fechaHoraCaptura: Timestamp;       // METADATO - Fecha/hora de captura
  idUsuario: string;                // FK (NN) - Usuario que capturó
  nombreMostrarUsuario: string;      // NN - Nombre usuario
  
  // Datos de obra
  idObra: string;                   // FK (NN) - Obra
  nombreMostrarObra: string;         // NN - Nombre obra
  
  // Datos de acarreo
  idTipoAcarreo: string;            // FK (NN) - Tipo de acarreo
  nombreMostrarTipoAcarreo: string;  // NN - Nombre tipo acarreo
  esCarga: boolean;                // NN - Indica si es carga
  esTiro: boolean;                 // NN - Indica si es tiro
  
  // Datos de ruta
  idRuta: string;                   // FK (NN) - Ruta
  nombreMostrarRuta: string;         // NN - Nombre ruta
  idLugarOrigen: string;            // FK (NN) - Lugar origen
  nombreMostrarLugarOrigen: string;  // NN - Nombre lugar origen
  idLugarDestino: string;           // FK (NN) - Lugar destino
  nombreMostrarLugarDestino: string; // NN - Nombre lugar destino
  
  // Datos de camión y material
  idCamion: string;                 // FK (NN) - Camión
  nombreMostrarCamion: string;       // NN - Nombre camión
  idMaterial: string;               // FK (NN) - Material
  nombreMaterial: string;            // NN - Nombre material
  nombreCamionero?: string;         // Nombre del camionero
  
  // Cantidades y métricas
  porcentajeCargaCamion: number;    // INTEGER (NN) - % de carga
  cantidadCapturada: number;        // NN - Cantidad capturada
  cantidadConciliada?: number;      // Cantidad conciliada
  kilometrosTotalesRuta: number;    // NN - Kilómetros totales
  
  // Referencias y metadatos
  idRequisicionAfectada?: string;   // FK - Requisición afectada
  idLineaRequisicionAfectada?: string; // FK - Línea requisición
  nota?: string;                    // Notas adicionales
  urlFoto?: string;                 // URL foto evidencia
  idAcarreoComplementario?: string; // FK - Auto-referencia
  estatusConciliado: boolean;       // NN - Estado conciliación
  
  // Metadatos de dispositivo
  dispositivoUtilizado: string;      // METADATO (NN) - Dispositivo
  latitudUbicacionCaptura?: number; // METADATO - Latitud
  longitudUbicacionCaptura?: number; // METADATO - Longitud
}
```

### 17. Requisición de Material
```typescript
interface RequisicionMaterial extends BaseDoc {
  fechaSolicitud: Timestamp;         // DATE (NN) - Fecha solicitud
  estatusAutorizado: boolean;        // BOOLEAN - Autorizado/pendiente
  idObra: string;                   // FK (NN) - Obra
  idProveedor: string;               // FK (NN) - Proveedor
  idTransportista: string;           // FK (NN) - Transportista
  descripcionCorta?: string;         // Descripción corta
  descripcionNotas?: string;         // Notas descriptivas
  facturaSerieFolio?: string;       // Factura serie/folio
  folioOrdenCompraExterno?: string; // Folio orden compra externo
  
  // Campos desnormalizados
  obraNombre?: string;               // Nombre obra
  proveedorNombre?: string;          // Nombre proveedor
  transportistaNombre?: string;      // Nombre transportista
}
```

### 18. Línea de Requisición de Material
```typescript
interface LineaRequisicionMaterial extends BaseDoc {
  idRequisicionMaterial: string;     // FK (NN) - Requisición padre
  idMaterial: string;               // FK (NN) - Material
  cantidad: number;                 // NN - Cantidad solicitada
  cantidadAutorizada?: number;       // Cantidad autorizada
  cantidadEntregada?: number;       // Cantidad entregada
  cantidadPendiente?: number;       // Cantidad pendiente
  precioUnitario?: number;           // Precio unitario
  subtotal?: number;                // Subtotal
  notas?: string;                   // Notas
  
  // Campos desnormalizados
  materialNombre?: string;           // Nombre material
  requisicionMaterialFolio?: string; // Folio requisición
}
```

## Entidades de Sistema

### 19. Usuario del Sistema
```typescript
interface UserProfile extends BaseDoc {
  email: string;                    // Correo electrónico
  username: string;                 // Nombre de usuario
  role: UserRole;                   // admin | operator
  isActive: boolean;                // Estado activo
  lastLogin?: Timestamp;             // Último login
  currentLocationId?: string;        // Ubicación actual
  currentLocationName?: string;      // Nombre ubicación (desnormalizado)
}
```

### 20. Proveedor (Supplier)
```typescript
interface Supplier extends BaseDoc {
  name: string;                     // Nombre del proveedor
  contact?: string;                 // Contacto
  phone?: string;                   // Teléfono
  email?: string;                   // Correo
  address?: string;                 // Dirección
}
```

### 21. Empresa (Company)
```typescript
interface Company extends BaseDoc {
  name: string;                     // Nombre empresa
  contact?: string;                 // Contacto
  phone?: string;                   // Teléfono
  email?: string;                   // Correo
  address?: string;                 // Dirección
}
```

## Entidades de Envíos (Shipping)

### 22. Shipment (Envío)
```typescript
interface Shipment {
  id: string;                       // Firestore document ID (folio)
  folio: string;                    // Número de folio
  truckId: string;                  // FK - Camión
  driverId: string;                 // FK - Conductor
  
  // Multi-material support
  materials: ShipmentItem[];         // Array de materiales
  
  // Legacy single material (backward compatibility)
  materialId?: string;
  weight?: number;
  
  dispatchLocationId: string;         // FK - Ubicación despacho
  deliveryLocationId: string | null;  // FK - Ubicación entrega
  dispatchTimestamp: Timestamp;       // Fecha/hora despacho
  deliveryTimestamp: Timestamp | null; // Fecha/hora entrega
  status: ShipmentStatus;            // EN_TRANSITO | COMPLETADO
  createdAt: Timestamp;              // Fecha creación
  
  // Datos desnormalizados
  truckPlate?: string;
  driverName?: string;
  materialName?: string;
  dispatchLocationName?: string;
  deliveryLocationName?: string;
  
  // Campos para recepciones
  isReception?: boolean;
  receptionId?: string;
  purchaseOrderNumber?: string;
  supplierName?: string;
}
```

### 23. Shipment Item (Ítem de Envío)
```typescript
interface ShipmentItem {
  materialId: string;               // FK - Material
  materialName: string;              // Nombre material (desnormalizado)
  materialUnit: string;             // Unidad (desnormalizado)
  weight: number;                   // Peso/cantidad
}
```

### 24. Ticket
```typescript
interface Ticket extends BaseDoc {
  shipmentId?: string;              // FK - Envío (opcional para recepciones)
  receptionId?: string;             // FK - Recepción (para tickets de recepción)
  type: TicketType;                 // dispatch | delivery | reception
  
  // Multi-material support
  materials?: ShipmentItem[];        // Array de materiales
  
  // Campos específicos de recepción
  receivedBy?: string;              // ID usuario que recibe
  receivedByName?: string;          // Nombre usuario que recibe
  receptionDate?: Timestamp;        // Fecha recepción
  purchaseOrderNumber?: string;      // Número orden compra
  supplierName?: string;            // Nombre proveedor
  
  // Campos específicos de despacho
  dispatchedBy?: string;            // ID usuario que despacha
  dispatchedByName?: string;        // Nombre usuario que despacha
  dispatchDate?: Timestamp;         // Fecha despacho
  
  // Datos desnormalizados del envío
  folio?: string;                  // Folio del envío
  truckPlate?: string;              // Placas camión
  driverName?: string;              // Nombre conductor
  dispatchLocationName?: string;     // Nombre lugar despacho
  deliveryLocationName?: string;    // Nombre lugar entrega
  dispatchTimestamp?: Timestamp;     // Fecha/hora despacho
  deliveryTimestamp?: Timestamp;    // Fecha/hora entrega
}
```

## Entidades de Compras

### 25. Purchase Order (Orden de Compra)
```typescript
interface PurchaseOrder extends BaseDoc {
  orderNumber: string;              // Número orden (auto-generado)
  supplierId: string;               // FK - Proveedor
  supplierName: string;             // Nombre proveedor (desnormalizado)
  deliveryLocationIds: string[];     // Array IDs ubicaciones entrega
  deliveryLocationNames: string;     // Nombres ubicaciones (desnormalizado)
  items: PurchaseOrderItem[];        // Ítems de la orden
  status: PurchaseOrderStatus;        // PENDING | PARTIAL | COMPLETED | CANCELLED
  orderDate: Timestamp;             // Fecha orden
  createdBy: string;                // ID usuario creador
  createdByName: string;            // Nombre usuario creador
}
```

### 26. Purchase Order Item
```typescript
interface PurchaseOrderItem {
  materialId: string;               // FK - Material
  materialName: string;             // Nombre material (desnormalizado)
  materialUnit: string;             // Unidad (desnormalizado)
  orderedQuantity: number;          // Cantidad ordenada
  receivedQuantity: number;          // Cantidad recibida
  pendingQuantity: number;           // Cantidad pendiente
}
```

### 27. Reception (Recepción)
```typescript
interface Reception extends BaseDoc {
  receptionNumber: string;           // Número recepción (auto-generado)
  purchaseOrderId: string;           // FK - Orden de compra
  purchaseOrderNumber: string;      // Número orden (desnormalizado)
  supplierId: string;               // FK - Proveedor
  supplierName: string;             // Nombre proveedor (desnormalizado)
  deliveryLocationId: string;        // FK - Ubicación entrega
  deliveryLocationName: string;     // Nombre ubicación (desnormalizado)
  truckId: string;                 // FK - Camión que entregó
  truckPlate: string;               // Placas camión (desnormalizado)
  truckVolume: number;              // Volumen camión (desnormalizado)
  items: ReceptionItem[];           // Ítems recibidos
  receptionDate: Timestamp;         // Fecha recepción
  receivedBy: string;               // ID usuario que recibe
  receivedByName: string;            // Nombre usuario que recibe
  notes?: string;                   // Notas
  isPartialReception: boolean;       // Indica si es recepción parcial
}
```

### 28. Reception Item
```typescript
interface ReceptionItem {
  materialId: string;               // FK - Material
  materialName: string;             // Nombre material (desnormalizado)
  materialUnit: string;             // Unidad (desnormalizado)
  orderedQuantity: number;          // Cantidad ordenada
  previouslyReceived: number;       // Cantidad recibida previamente
  currentReceived: number;          // Cantidad recibida ahora
  totalReceived: number;            // Total recibido
  pendingQuantity: number;          // Cantidad pendiente
  status: ReceptionItemStatus;       // PENDING | COMPLETED | OVER_RECEIVED
}
```

## Entidades de Soporte

### 29. Dispositivo
```typescript
interface Dispositivo extends BaseDoc {
  nombre: string;                   // Nombre dispositivo
  tipo: 'movil' | 'tablet' | 'escritorio'; // Tipo
  idUsuarioActual: string;          // FK - Usuario actual
  ultimaActividad: Timestamp;        // Última actividad
  ubicacion?: {                    // Ubicación actual
    latitud: number;
    longitud: number;
  };
}
```

## Tipos Enumerados

### TruckStatus
```typescript
type TruckStatus = "AVAILABLE" | "IN_SHIPMENT";
```

### DriverStatus
```typescript
type DriverStatus = "AVAILABLE" | "IN_SHIPMENT";
```

### UserRole
```typescript
type UserRole = "admin" | "operator";
```

### ShipmentStatus
```typescript
type ShipmentStatus = "EN_TRANSITO" | "COMPLETADO";
```

### TicketType
```typescript
type TicketType = "dispatch" | "delivery" | "reception";
```

### PurchaseOrderStatus
```typescript
type PurchaseOrderStatus = "PENDING" | "PARTIAL" | "COMPLETED" | "CANCELLED";
```

### ReceptionItemStatus
```typescript
type ReceptionItemStatus = "PENDING" | "COMPLETED" | "OVER_RECEIVED";
```

## Relaciones Principales

### Jerarquía de Obras
```
Cliente (1) → (N) Obra (1) → (N) Lugar
```

### Flota de Transporte
```
Transportista (1) → (N) Camión
Camión (1) → (N) TipoCamion
Camión (1) → (N) ClasificacionViaje
```

### Materiales
```
ClasificacionMaterial (1) → (N) Material
Material (1) → (N) Unidad
```

### Rutas y Acarreos
```
TipoAcarreo (1) → (N) Ruta
Lugar (1) → (N) Ruta (origen/destino)
Ruta (1) → (N) Acarreo
```

### Requisiciones
```
RequisicionMaterial (1) → (N) LineaRequisicionMaterial
LineaRequisicionMaterial (N) → (1) Material
```

### Envíos y Tickets
```
Shipment (1) → (N) ShipmentItem
Shipment (1) → (N) Ticket
Ticket (1) → (1) Shipment (opcional)
```

## Índices de Firestore Requeridos

### Consultas Comunes y sus Índices

1. **Acarreos por obra y fecha**
```
Collection: acarreos
Fields: [idObra, fechaHora]
Order: fechaHora DESC
```

2. **Camiones por transportista**
```
Collection: trucks
Fields: [idTransportista, estatusActivo]
```

3. **Materiales por clasificación**
```
Collection: materiales
Fields: [idClasificacionMaterial, nombreParaMostrar]
```

4. **Rutas por lugar origen**
```
Collection: rutas
Fields: [idLugarOrigen, estatusActivo]
```

5. **Requisiciones por obra y estado**
```
Collection: requisicionesMaterial
Fields: [idObra, estatusAutorizado, fechaSolicitud]
Order: fechaSolicitud DESC
```

## Consideraciones de Diseño

### 1. Desnormalización Estratégica
- Nombres desnormalizados para evitar consultas adicionales
- Datos de display repetidos para optimizar UI
- Balance entre normalización y performance

### 2. Compatibilidad Backward
- Modelo antiguo vs nuevo de camiones
- Soporte para single material y multi-material
- Migración gradual de datos

### 3. Timestamps
- Uso consistente de Timestamp de Firebase
- createdAt automático en todos los documentos
- Fechas de negocio explícitas (fechaHora, fechaSolicitud)

### 4. IDs y Referencias
- IDs como string (Firestore document IDs)
- FKs como string references
- Nombres desnormalizados para display

### 5. Estados y Status
- Enums tipados para consistencia
- Estados booleanos donde aplica
- Status objects para flujos complejos