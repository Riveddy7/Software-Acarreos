
'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shipment, Truck, Driver, Material, Location } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import AdminQrReader from '@/components/admin/AdminQrReader';
import Link from 'next/link';

const SHIPMENTS_COLLECTION = 'shipments';
const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';

export default function AdminTicketReaderPage() {
  const router = useRouter();

  const [scannedShipmentId, setScannedShipmentId] = useState<string | null>(null);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setShipment(null);

      // Fetch master data (only once or cache it if needed)
      if (trucks.length === 0 || drivers.length === 0 || materials.length === 0 || locations.length === 0) {
        const [trucksData, driversData, materialsData, locationsData] = await Promise.all([
          getCollection<Truck>(TRUCKS_COLLECTION),
          getCollection<Driver>(DRIVERS_COLLECTION),
          getCollection<Material>(MATERIALS_COLLECTION),
          getCollection<Location>(LOCATIONS_COLLECTION),
        ]);
        setTrucks(trucksData);
        setDrivers(driversData);
        setMaterials(materialsData);
        setLocations(locationsData);
      }

      // Fetch specific shipment
      const docRef = doc(db, SHIPMENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedShipment = { id: docSnap.id, ...docSnap.data() } as Shipment;
        // Denormalize for display
        const truck = trucks.find(t => t.id === fetchedShipment.truckId) || trucksData.find(t => t.id === fetchedShipment.truckId);
        const driver = drivers.find(d => d.id === fetchedShipment.driverId) || driversData.find(d => d.id === fetchedShipment.driverId);
        const material = materials.find(m => m.id === fetchedShipment.materialId) || materialsData.find(m => m.id === fetchedShipment.materialId);
        const dispatchLocation = locations.find(l => l.id === fetchedShipment.dispatchLocationId) || locationsData.find(l => l.id === fetchedShipment.dispatchLocationId);
        const deliveryLocation = locations.find(l => l.id === fetchedShipment.deliveryLocationId) || locationsData.find(l => l.id === fetchedShipment.deliveryLocationId);

        setShipment({
          ...fetchedShipment,
          truckPlate: truck?.plate || 'Desconocido',
          driverName: driver?.name || 'Desconocido',
          materialName: material?.name || 'Desconocido',
          dispatchLocationName: dispatchLocation?.name || 'Desconocido',
          deliveryLocationName: deliveryLocation?.name || 'N/A',
        });
      } else {
        setError('Acarreo no encontrado con ese ID.');
      }
    } catch (e) {
      console.error("Error fetching shipment:", e);
      setError('Error al cargar los datos del acarreo. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [trucks, drivers, materials, locations]); // Added master data to dependencies

  const handleScan = (id: string) => {
    setScannedShipmentId(id);
    fetchData(id);
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Lector de Tickets de Acarreo</h2>

      <AdminQrReader label="ID del Acarreo" placeholder="Ingrese el ID del acarreo" onScan={handleScan} />

      {isLoading && <p className="text-center text-lg text-gray-700 mt-4">Buscando acarreo...</p>}
      {error && <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-4">Error: {error}</p>}

      {shipment && !isLoading && !error && (
        <div className="space-y-4 mt-6">
          <h3 className="text-xl font-semibold text-gray-800">Detalles del Acarreo</h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 space-y-2 text-gray-700">
            <p><strong>Folio:</strong> <span className="font-mono text-sm text-gray-600">{shipment.folio}</span></p>
            <p><strong>Estado:</strong> 
              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${shipment.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {shipment.status}
              </span>
            </p>
            <p><strong>Camión:</strong> {shipment.truckPlate}</p>
            <p><strong>Chofer:</strong> {shipment.driverName}</p>
            <p><strong>Material:</strong> {shipment.materialName}</p>
            <p><strong>Peso:</strong> {shipment.weight} {materials.find(m => m.id === shipment.materialId)?.unit || ''}</p>
            <p><strong>Origen:</strong> {shipment.dispatchLocationName}</p>
            <p><strong>Fecha Despacho:</strong> {formatDate(shipment.dispatchTimestamp)}</p>
            <p><strong>Destino:</strong> {shipment.deliveryLocationName}</p>
            <p><strong>Fecha Entrega:</strong> {formatDate(shipment.deliveryTimestamp)}</p>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <Link href={`/admin/shipments/${shipment.id}/ticket/dispatch`} className="px-4 py-2 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              Ver Ticket Despacho
            </Link>
            {shipment.status === 'COMPLETADO' && (
              <Link href={`/admin/shipments/${shipment.id}/ticket/delivery`} className="px-4 py-2 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                Ver Ticket Entrega
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
