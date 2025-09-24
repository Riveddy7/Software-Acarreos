
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { Shipment, Truck, Driver, Material, Location } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

const SHIPMENTS_COLLECTION = 'shipments';
const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';

export default function AdminShipmentTicketPage() {
  const router = useRouter();
  const params = useParams();

  const ticketType = params.type as string; // 'dispatch' or 'delivery'
  const shipmentId = params.shipmentId as string;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!shipmentId || !ticketType) {
      setError('ID de acarreo o tipo de ticket no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Fetch master data
      const [trucksData, driversData, materialsData, locationsData] = await Promise.all([
        getCollection<Truck>(TRUCKS_COLLECTION),
        getCollection<Driver>(DRIVERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION),
      ]);
      setMaterials(materialsData);

      // Fetch specific shipment
      const docRef = doc(db, SHIPMENTS_COLLECTION, shipmentId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedShipment = { id: docSnap.id, ...docSnap.data() } as Shipment;
        // Denormalize for display
        const truck = trucksData.find(t => t.id === fetchedShipment.truckId);
        const driver = driversData.find(d => d.id === fetchedShipment.driverId);
        const material = materialsData.find(m => m.id === fetchedShipment.materialId);
        const dispatchLocation = locationsData.find(l => l.id === fetchedShipment.dispatchLocationId);
        const deliveryLocation = locationsData.find(l => l.id === fetchedShipment.deliveryLocationId);

        setShipment({
          ...fetchedShipment,
          truckPlate: truck?.plate || 'Desconocido',
          driverName: driver?.name || 'Desconocido',
          materialName: material?.name || 'Desconocido',
          dispatchLocationName: dispatchLocation?.name || 'Desconocido',
          deliveryLocationName: deliveryLocation?.name || 'N/A',
        });
        setError(null);
      } else {
        setError('Acarreo no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching ticket data:", e);
      setError('Error al cargar los datos del ticket. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [shipmentId, ticketType]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando ticket...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!shipment) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del ticket.</p>;
  }

  const materialUnit = materials.find(m => m.id === shipment.materialId)?.unit || '';

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
        Ticket de {ticketType === 'dispatch' ? 'Despacho' : 'Entrega'}
      </h2>

      <div className="space-y-3 text-gray-700">
        <p><strong>Folio:</strong> <span className="font-mono text-sm text-gray-600">{shipment.folio}</span></p>
        <p><strong>Estado:</strong> 
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${shipment.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {shipment.status}
          </span>
        </p>
        <p><strong>Camión:</strong> {shipment.truckPlate}</p>
        <p><strong>Chofer:</strong> {shipment.driverName}</p>
        <p><strong>Material:</strong> {shipment.materialName}</p>
        <p><strong>Peso:</strong> {shipment.weight} {materialUnit}</p>

        {ticketType === 'dispatch' && (
          <>
            <p><strong>Origen:</strong> {shipment.dispatchLocationName}</p>
            <p><strong>Fecha Despacho:</strong> {formatDate(shipment.dispatchTimestamp)}</p>
          </>
        )}

        {ticketType === 'delivery' && shipment.status === 'COMPLETADO' && (
          <>
            <p><strong>Destino:</strong> {shipment.deliveryLocationName}</p>
            <p><strong>Fecha Entrega:</strong> {formatDate(shipment.deliveryTimestamp)}</p>
          </>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">Código QR del Acarreo</p>
        <QrCodeDisplay value={shipment.id} size={256} /> {/* Larger QR code */}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.push('/admin/shipments')}
          className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Volver a Acarreos
        </button>
      </div>
    </div>
  );
}
