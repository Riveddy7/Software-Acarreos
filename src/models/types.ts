
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

export interface Shipment {
  id: string; // Firestore document ID, used as the main folio
  folio: string;
  truckId: string;
  driverId: string;
  materialId: string;
  dispatchLocationId: string;
  deliveryLocationId: string | null;
  weight: number;
  dispatchTimestamp: Timestamp;
  deliveryTimestamp: Timestamp | null;
  status: ShipmentStatus;
  createdAt: Timestamp;

  // Optional: Denormalized data for easier display
  truckPlate?: string;
  driverName?: string;
  materialName?: string;
  dispatchLocationName?: string;
  deliveryLocationName?: string;
}

export type TicketType = "dispatch" | "delivery";

export interface Ticket extends BaseDoc {
  shipmentId: string;
  type: TicketType;
  // Add any other relevant ticket-specific fields here
}
