
import { Timestamp } from "firebase/firestore";

// The base for all master data documents
interface BaseDoc {
  id: string; // Firestore document ID
  createdAt: Timestamp;
}

export type TruckStatus = "AVAILABLE" | "IN_SHIPMENT";

// Transportista (Carrier)
export interface Transportista extends BaseDoc {
  nombre: string; // NN
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  activo: boolean; // NN
}

// Tipo de Camión (Truck Type)
export interface TipoCamion extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}

// Clasificación para Viajes (Trip Classification)
export interface ClasificacionViaje extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}

export interface Truck extends BaseDoc {
  // Campos existentes que se mantienen
  id: string; // PK (ya existe en BaseDoc)
  model: string; // Modelo VARCHAR
  volume?: number; // Volumetric capacity in M3 (optional for backward compatibility)
  status: TruckStatus;
  currentShipmentId?: string; // Optional, only if IN_SHIPMENT
  currentDriverId?: string;   // Optional, only if IN_SHIPMENT
  currentDriverName?: string; // Optional, denormalized driver name
  
  // Nuevos campos requeridos
  idTransportista: string; // FK (NN)
  idTipoCamion: string; // FK (NN)
  idClasificacionViaje: string; // FK (NN)
  idUltimoCamionero?: string; // FK (opcional)
  nombreParaMostrar: string; // VARCHAR (NN)
  estatusActivo: boolean; // BOOLEAN (NN)
  marca?: string; // VARCHAR
  numeroSerie?: string; // VARCHAR
  placas: string; // VARCHAR (NN) - reemplaza a plate
  descripcionNotas?: string; // TEXT
  
  // Campos desnormalizados para mostrar en la tabla
  transportistaNombre?: string;
  tipoCamionNombre?: string;
  clasificacionViajeNombre?: string;
  ultimoCamioneroNombre?: string;
}

export type DriverStatus = "AVAILABLE" | "IN_SHIPMENT";

export interface Driver extends BaseDoc {
  name: string;
  licenseNumber: string;
  status: DriverStatus;
  currentShipmentId?: string; // Optional, only if IN_SHIPMENT
  currentTruckId?: string;    // Optional, only if IN_SHIPMENT
  currentTruckPlate?: string; // Optional, denormalized truck plate
}

export interface Material extends BaseDoc {
  nombreParaMostrar: string; // NN
  descripcionNotas?: string; // TEXT
  idClasificacionMaterial: string; // FK (NN)
  idUnidad: string; // FK (NN)
  
  // Campos desnormalizados
  clasificacionMaterialNombre?: string;
  unidadNombre?: string;
}

export interface Location extends BaseDoc {
  name: string;
  address: string;
}

export type ShipmentStatus = "EN_TRANSITO" | "COMPLETADO";

// Shipment Item for multi-material support
export interface ShipmentItem {
  materialId: string;
  materialName: string; // Denormalized
  materialUnit: string; // Denormalized
  weight: number;
}

export interface Shipment {
  id: string; // Firestore document ID, used as the main folio
  folio: string;
  truckId: string;
  driverId: string;

  // Multi-material support
  materials: ShipmentItem[]; // Array of materials

  // Legacy single material support (for backward compatibility)
  materialId?: string;
  weight?: number;

  dispatchLocationId: string;
  deliveryLocationId: string | null;
  dispatchTimestamp: Timestamp;
  deliveryTimestamp: Timestamp | null;
  status: ShipmentStatus;
  createdAt: Timestamp;

  // Optional: Denormalized data for easier display
  truckPlate?: string;
  driverName?: string;
  materialName?: string; // For single material backward compatibility
  dispatchLocationName?: string;
  deliveryLocationName?: string;

  // Additional fields for reception shipments
  isReception?: boolean; // Flag to identify reception shipments
  receptionId?: string; // Reference to reception record
  purchaseOrderNumber?: string; // Reference to purchase order
  supplierName?: string; // For reception shipments
}

export type TicketType = "dispatch" | "delivery" | "reception";

export interface Ticket extends BaseDoc {
  shipmentId?: string; // Optional for reception tickets
  receptionId?: string; // For reception tickets
  type: TicketType;

  // Multi-material support - denormalized for display
  materials?: ShipmentItem[]; // Array of materials in this ticket

  // Reception-specific fields
  receivedBy?: string; // User ID who received (for reception tickets)
  receivedByName?: string; // User name who received (for reception tickets)
  receptionDate?: Timestamp; // When the reception occurred
  purchaseOrderNumber?: string; // Reference to purchase order
  supplierName?: string; // Supplier name for reception tickets

  // Dispatch-specific fields
  dispatchedBy?: string; // User ID who dispatched (for dispatch tickets)
  dispatchedByName?: string; // User name who dispatched (for dispatch tickets)
  dispatchDate?: Timestamp; // When the dispatch occurred

  // Denormalized shipment data for easy display
  folio?: string; // Shipment folio
  truckPlate?: string;
  driverName?: string;
  dispatchLocationName?: string;
  deliveryLocationName?: string;
  dispatchTimestamp?: Timestamp;
  deliveryTimestamp?: Timestamp;
}

// User roles for authentication
export type UserRole = "admin" | "operator";

export interface UserProfile extends BaseDoc {
  email: string;
  username: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: Timestamp;
  currentLocationId?: string; // Location where user is currently working
  currentLocationName?: string; // Denormalized location name
}

// Supplier entity
export interface Supplier extends BaseDoc {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Company entity
export interface Company extends BaseDoc {
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  address?: string;
}

// Purchase Order status
export type PurchaseOrderStatus = "PENDING" | "PARTIAL" | "COMPLETED" | "CANCELLED";

// Purchase Order Item
export interface PurchaseOrderItem {
  materialId: string;
  materialName: string; // Denormalized
  materialUnit: string; // Denormalized
  orderedQuantity: number;
  receivedQuantity: number;
  pendingQuantity: number; // orderedQuantity - receivedQuantity
}

// Purchase Order
export interface PurchaseOrder extends BaseDoc {
  orderNumber: string; // Auto-generated order number
  supplierId: string;
  supplierName: string; // Denormalized
  deliveryLocationIds: string[]; // Multiple delivery locations
  deliveryLocationNames: string; // Denormalized, comma-separated names
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  orderDate: Timestamp;
  createdBy: string; // User ID who created the order
  createdByName: string; // Denormalized user name
}

// Reception status for individual items
export type ReceptionItemStatus = "PENDING" | "COMPLETED" | "OVER_RECEIVED";

// Reception Item (for partial receptions)
export interface ReceptionItem {
  materialId: string;
  materialName: string; // Denormalized
  materialUnit: string; // Denormalized
  orderedQuantity: number;
  previouslyReceived: number;
  currentReceived: number;
  totalReceived: number; // previouslyReceived + currentReceived
  pendingQuantity: number; // orderedQuantity - totalReceived
  status: ReceptionItemStatus;
}

// Reception record
export interface Reception extends BaseDoc {
  receptionNumber: string; // Auto-generated reception number
  purchaseOrderId: string;
  purchaseOrderNumber: string; // Denormalized
  supplierId: string;
  supplierName: string; // Denormalized
  deliveryLocationId: string;
  deliveryLocationName: string; // Denormalized
  truckId: string; // Truck ID that delivered the materials
  truckPlate: string; // Denormalized truck plate
  truckVolume: number; // Denormalized truck volume in M3
  items: ReceptionItem[];
  receptionDate: Timestamp;
  receivedBy: string; // User ID who received the order
  receivedByName: string; // Denormalized user name
  notes?: string;
  isPartialReception: boolean;
}

// Clasificación de Material
export interface ClasificacionMaterial extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}

// Unidad
export interface Unidad extends BaseDoc {
  nombre: string; // NN
  descripcion?: string;
  activo: boolean; // NN
}

// Cliente
export interface Cliente extends BaseDoc {
  nombreParaMostrar: string; // NN
}

// Proveedor
export interface Proveedor extends BaseDoc {
  nombreParaMostrar: string; // NN
}

// Empresa Interna
export interface EmpresaInterna extends BaseDoc {
  nombreParaMostrar: string; // NN
  razonSocial: string;
  logo?: string; // BLOB (URL en Firebase Storage)
}

// Obra
export interface Obra extends BaseDoc {
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

// Lugar
export interface Lugar extends BaseDoc {
  nombreParaMostrar: string; // NN
  idObra: string; // FK (NN)
  estatusActivo: boolean; // NN
  descripcionNotas?: string; // TEXT
  latitud?: number;
  longitud?: number;
  
  // Campos desnormalizados
  obraNombre?: string;
}

// Tipo de Acarreo
export interface TipoAcarreo extends BaseDoc {
  nombreParaMostrar: string; // NN
}

// Ruta
export interface Ruta extends BaseDoc {
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

// Operador
export interface Operador extends BaseDoc {
  idTransportista: string; // FK (NN)
  apellidoPaterno: string; // NN
  apellidoMaterno?: string;
  nombres: string; // NN
  nombreParaMostrar?: string;
  
  // Campos desnormalizados
  transportistaNombre?: string;
}

// Acarreo
export interface Acarreo extends BaseDoc {
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

// Requisición de Material
export interface RequisicionMaterial extends BaseDoc {
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

// Línea de Requisición de Material
export interface LineaRequisicionMaterial extends BaseDoc {
  idRequisicionMaterial: string; // FK (NN)
  idMaterial: string; // FK (NN)
  cantidad: number; // NN
  cantidadAutorizada?: number;
  cantidadEntregada?: number;
  cantidadPendiente?: number;
  precioUnitario?: number;
  subtotal?: number;
  notas?: string;
  
  // Campos desnormalizados
  materialNombre?: string;
  requisicionMaterialFolio?: string;
}

// Estado del Operador para gestión de sesión
export interface OperatorState {
  selectedObra: Obra | null;
  currentUser: UserProfile | null;
  printerStatus: PrinterStatus;
  lastScannedTruck: Truck | null;
  currentLocation: LocationData | null;
  sessionActive: boolean;
}

// Estado de Impresora
export interface PrinterStatus {
  available: boolean;
  name?: string;
  connected: boolean;
  paperLevel?: number;
}

// Datos de Ubicación
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

// Configuración de Escáner
export interface ScannerConfig {
  qr: boolean;
  nfc: boolean;
  rfid: boolean;
  camera: boolean;
}

// Resultado de Escaneo
export interface ScanResult {
  type: 'qr' | 'nfc' | 'rfid' | 'camera';
  data: string;
  timestamp: Date;
}

// Información del Camión después del escaneo
export interface TruckScanInfo {
  truck: Truck;
  transportista: Transportista;
  capacity: number;
  lastDriverName?: string;
}

// Datos para Ticket de Acarreo
export interface TicketAcarreoData {
  id: string;
  fechaHora: Date;
  obraNombre: string;
  rutaNombre: string;
  materialNombre: string;
  camionNombre: string;
  camionPlacas: string;
  camionCapacidad: number;
  volumenCapturado: number;
  esCarga: boolean;
  esTiro: boolean;
  lugarNombre: string;
  kilometrosRuta: number;
  esInformativo: boolean;
  usuarioNombre: string;
  nota?: string;
  empresaInternaLogo?: string;
  empresaInternaNombre?: string;
}

// Dispositivo
export interface Dispositivo extends BaseDoc {
  nombre: string;
  tipo: 'movil' | 'tablet' | 'escritorio';
  idUsuarioActual: string;
  ultimaActividad: Timestamp;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
}
