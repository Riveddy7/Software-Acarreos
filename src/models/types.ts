
import { Timestamp } from "firebase/firestore";

// The base for all master data documents
interface BaseDoc {
  id: string; // Firestore document ID
  createdAt: Timestamp;
}

export type TruckStatus = "AVAILABLE" | "IN_SHIPMENT";

export interface Truck extends BaseDoc {
  plate: string;
  model: string;
  status: TruckStatus;
  currentShipmentId?: string; // Optional, only if IN_SHIPMENT
  currentDriverId?: string;   // Optional, only if IN_SHIPMENT
  currentDriverName?: string; // Optional, denormalized driver name
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
  name: string;
  unit: string;
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
  items: ReceptionItem[];
  receptionDate: Timestamp;
  receivedBy: string; // User ID who received the order
  receivedByName: string; // Denormalized user name
  notes?: string;
  isPartialReception: boolean;
}
