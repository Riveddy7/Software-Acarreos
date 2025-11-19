# Esquemas de Base de Datos - Acarreo.mx

## Resumen

El sistema utiliza Firebase Firestore como base de datos NoSQL con los siguientes esquemas definidos en TypeScript. Todos los documentos heredan de `BaseDoc` que incluye `id` y `createdAt`.

## Entidades Principales

### 1. BaseDoc
```typescript
interface BaseDoc {
  id: string; // Firestore document ID
  createdAt: Timestamp;
}
```

### 2. Transportista
```typescript
interface Transportista extends BaseDoc {
  nombre: string; // NN
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean; // NN
}
```

### 3. TipoCamion
```typescript
interface TipoCamion extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}
```

### 4. ClasificacionViaje
```typescript
interface ClasificacionViaje extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}
```

### 5. Truck (Camión)
```typescript
interface Truck extends BaseDoc {
  // Campos básicos
  model: string;
  volume?: number; // Volumetric capacity in M3
  status: TruckStatus; // "AVAILABLE" | "IN_SHIPMENT"
  currentShipmentId?: string;
  currentDriverId?: string;
  currentDriverName?: string;
  
  // Campos requeridos por el usuario
  idTransportista: string; // FK (NN)
  idTipoCamion: string; // FK (NN)
  idClasificacionViaje: string; // FK (NN)
  idUltimoCamionero?: string; // FK (opcional)
  nombreParaMostrar: string; // VARCHAR (NN)
  estatusActivo: boolean; // BOOLEAN (NN)
  marca?: string; // VARCHAR
  numeroSerie?: string; // VARCHAR
  placas: string; // VARCHAR (NN)
  descripcionNotas?: string; // TEXT
  
  // Campos desnormalizados
  transportistaNombre?: string;
  tipoCamionNombre?: string;
  clasificacionViajeNombre?: string;
  ultimoCamioneroNombre?: string;
}
```

### 6. Operador
```typescript
interface Operador extends BaseDoc {
  idTransportista: string; // FK (NN)
  apellidoPaterno: string; // NN
  apellidoMaterno?: string;
  nombres: string; // NN
  nombreParaMostrar?: string;
  
  // Campos desnormalizados
  transportistaNombre?: string;
}
```

## Gestión de Obras y Logística

### 7. Cliente
```typescript
interface Cliente extends BaseDoc {
  nombreParaMostrar: string; // NN
}
```

### 8. EmpresaInterna
```typescript
interface EmpresaInterna extends BaseDoc {
  nombreParaMostrar: string; // NN
  razonSocial: string;
  logo?: string; // BLOB (URL en Firebase Storage)
}
```

### 9. Obra
```typescript
interface Obra extends BaseDoc {
  nombreParaMostrar: string; // NN
  idCliente: string; // FK (NN)
  estatusActivo: boolean; // NN
  descripcionNotas?: string; // TEXT
  empresaContratante?: string; // VARCHAR
  idEmpresaInterna: string; // FK (NN)
  
  // Campos desnormalizados
  clienteNombre?: string;
  empresaInternaNombre?: string;
}
```

### 10. Lugar
```typescript
interface Lugar extends BaseDoc {
  nombreParaMostrar: string; // NN
  idObra: string; // FK (NN)
  estatusActivo: boolean; // NN
  descripcionNotas?: string; // TEXT
  latitud?: number;
  longitud?: number;
  
  // Campos desnormalizados
  obraNombre?: string;
}
```

### 11. TipoAcarreo
```typescript
interface TipoAcarreo extends BaseDoc {
  nombreParaMostrar: string; // NN
}
```

### 12. Ruta
```typescript
interface Ruta extends BaseDoc {
  nombreParaMostrar: string; // NN
  idLugarOrigen: string; // FK (NN)
  idLugarDestino: string; // FK (NN)
  idTipoAcarreo: string; // FK (NN)
  totalKilometrosReales?: number; // FLOAT
  totalKilometrosConciliados?: number; // FLOAT
  estatusActivo: boolean; // NN
  descripcionNotas?: string; // TEXT
  kmlTexto?: string; // TEXT
  
  // Campos desnormalizados
  lugarOrigenNombre?: string;
  lugarDestinoNombre?: string;
  tipoAcarreoNombre?: string;
}
```

## Gestión de Materiales

### 13. ClasificacionMaterial
```typescript
interface ClasificacionMaterial extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}
```

### 14. Unidad
```typescript
interface Unidad extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}
```

### 15. Material
```typescript
interface Material extends BaseDoc {
  nombreParaMostrar: string; // NN
  descripcionNotas?: string; // TEXT
  idClasificacionMaterial: string; // FK (NN)
  idUnidad: string; // FK (NN)
  
  // Campos desnormalizados
  clasificacionMaterialNombre?: string;
  unidadNombre?: string;
}
```

### 16. Proveedor
```typescript
interface Proveedor extends BaseDoc {
  nombreParaMostrar: string; // NN
}
```

## Operaciones del Sistema

### 17. Acarreo
```typescript
interface Acarreo extends BaseDoc {
  idEmpresaInterna: string; // FK (NN)
  fechaHora: Timestamp; // DATETIME (NN)
  fechaHoraCaptura: Timestamp; // METADATO
  idUsuario: string; // FK (NN)
  nombreMostrarUsuario: string; // NN
  idObra: string; // FK (NN)
  nombreMostrarObra: string; // NN
  idTipoAcarreo: string; // FK (NN)
  nombreMostrarTipoAcarreo: string; // NN
  esCarga: boolean; // NN
  esTiro: boolean; // NN
  idRuta: string; // FK (NN)
  nombreMostrarRuta: string; // NN
  idLugarOrigen: string; // FK (NN)
  nombreMostrarLugarOrigen: string; // NN
  idLugarDestino: string; // FK (NN)
  nombreMostrarLugarDestino: string; // NN
  idCamion: string; // FK (NN)
  nombreMostrarCamion: string; // NN
  idMaterial: string; // FK (NN)
  nombreMaterial: string; // NN
  nombreCamionero?: string; // VARCHAR
  porcentajeCargaCamion: number; // INTEGER (NN)
  cantidadCapturada: number; // NN
  cantidadConciliada?: number;
  dispositivoUtilizado: string; // METADATO (NN)
  latitudUbicacionCaptura?: number; // METADATO
  longitudUbicacionCaptura?: number; // METADATO
  kilometrosTotalesRuta: number; // NN
  idRequisicionAfectada?: string; // FK
  idLineaRequisicionAfectada?: string; // FK
  nota?: string; // VARCHAR
  urlFoto?: string; // VARCHAR o LONGBLOB
  idAcarreoComplementario?: string; // FK auto referenciada
  estatusConciliado: boolean; // NN
}
```

### 18. RequisicionMaterial
```typescript
interface RequisicionMaterial extends BaseDoc {
  fechaSolicitud: Timestamp; // DATE (NN)
  estatusAutorizado: boolean; // BOOLEAN (true=autorizado, false=pendiente)
  idObra: string; // FK (NN)
  idProveedor: string; // FK (NN)
  idTransportista: string; // FK (NN)
  descripcionCorta?: string; // VARCHAR
  descripcionNotas?: string; // TEXT
  facturaSerieFolio?: string; // VARCHAR
  folioOrdenCompraExterno?: string; // VARCHAR
  
  // Campos desnormalizados
  obraNombre?: string;
  proveedorNombre?: string;
  transportistaNombre?: string;
}
```

## Sistema de Usuarios y Autenticación

### 19. UserProfile
```typescript
interface UserProfile extends BaseDoc {
  email: string;
  username: string;
  role: UserRole; // "admin" | "operator"
  isActive: boolean;
  lastLogin?: Timestamp;
  currentLocationId?: string;
  currentLocationName?: string;
}
```

## Sistema de Tickets y Envíos

### 20. Shipment
```typescript
interface Shipment {
  id: string; // Firestore document ID, used as main folio
  folio: string;
  truckId: string;
  driverId: string;
  
  // Multi-material support
  materials: ShipmentItem[]; // Array of materials
  
  // Legacy single material support
  materialId?: string;
  weight?: number;
  
  dispatchLocationId: string;
  deliveryLocationId: string | null;
  dispatchTimestamp: Timestamp;
  deliveryTimestamp: Timestamp | null;
  status: ShipmentStatus; // "EN_TRANSITO" | "COMPLETADO"
  createdAt: Timestamp;
  
  // Optional: Denormalized data
  truckPlate?: string;
  driverName?: string;
  materialName?: string;
  dispatchLocationName?: string;
  deliveryLocationName?: string;
  
  // Additional fields for reception shipments
  isReception?: boolean;
  receptionId?: string;
  purchaseOrderNumber?: string;
  supplierName?: string;
}
```

### 21. Ticket
```typescript
interface Ticket extends BaseDoc {
  shipmentId?: string; // Optional for reception tickets
  receptionId?: string; // For reception tickets
  type: TicketType; // "dispatch" | "delivery" | "reception"
  
  // Multi-material support
  materials?: ShipmentItem[];
  
  // Reception-specific fields
  receivedBy?: string;
  receivedByName?: string;
  receptionDate?: Timestamp;
  purchaseOrderNumber?: string;
  supplierName?: string;
  
  // Dispatch-specific fields
  dispatchedBy?: string;
  dispatchedByName?: string;
  dispatchDate?: Timestamp;
  
  // Denormalized shipment data
  folio?: string;
  truckPlate?: string;
  driverName?: string;
  dispatchLocationName?: string;
  deliveryLocationName?: string;
  dispatchTimestamp?: Timestamp;
  deliveryTimestamp?: Timestamp;
}
```

## Relaciones entre Entidades

```
Cliente → Obra → Lugar → Ruta → Acarreo
    ↓         ↓       ↓       ↓
EmpresaInterna → Acarreo → Camion → Operador
    ↓                    ↓
Proveedor ← RequisicionMaterial → Material
    ↓                    ↓
ClasificacionMaterial → Material → Unidad
    ↓
Transportista → Camion → Operador
```

## Índices Recomendados

Para optimizar las consultas en Firestore, se recomiendan los siguientes índices:

1. **Acarreos**: Por fechaHora, idObra, idCamion
2. **Requisiciones**: Por fechaSolicitud, idObra, estatusAutorizado
3. **Camiones**: Por idTransportista, estatusActivo
4. **Operadores**: Por idTransportista
5. **Materiales**: Por idClasificacionMaterial, idUnidad
6. **Rutas**: Por idLugarOrigen, idLugarDestino, estatusActivo
7. **Tickets**: Por type, createdAt
8. **Shipments**: Por status, dispatchTimestamp

## Notas de Implementación

1. **Desnormalización**: Se utiliza desnormalización para optimizar consultas y reducir lecturas
2. **Timestamps**: Todos los documentos incluyen createdAt para auditoría
3. **IDs**: Se utilizan los IDs automáticos de Firestore como clave primaria
4. **Estados**: Se utilizan enums TypeScript para mantener consistencia en estados
5. **Opcionalidad**: Los campos opcionales se marcan con `?` en TypeScript