
'use client';

import React, { useState, useCallback } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shipment, Truck, Driver, Material, Location, Ticket } from '@/models/types';
import { getCollection, TICKETS_COLLECTION, SHIPMENTS_COLLECTION, TRUCKS_COLLECTION, DRIVERS_COLLECTION, MATERIALS_COLLECTION, LOCATIONS_COLLECTION } from '@/lib/firebase/firestore';
import AdminQrReader from '@/components/admin/AdminQrReader';
import Link from 'next/link';



export default function AdminTicketReaderPage() {


  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [materials, setMaterials] = useState<Material[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (ticketId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setShipment(null);

      // Fetch master data (only once or cache it if needed)
      const [trucksData, driversData, materialsData, locationsData] = await Promise.all([
        getCollection<Truck>(TRUCKS_COLLECTION),
        getCollection<Driver>(DRIVERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION),
      ]);
      setMaterials(materialsData);

      // Fetch specific ticket
      const ticketDocRef = doc(db, TICKETS_COLLECTION, ticketId);
      const ticketDocSnap = await getDoc(ticketDocRef);

      if (!ticketDocSnap.exists()) {
        setError('Ticket no encontrado con ese ID.');
        setIsLoading(false);
        return;
      }

      const fetchedTicket = { id: ticketDocSnap.id, ...ticketDocSnap.data() } as Ticket;

      // Fetch specific shipment using shipmentId from ticket (if it exists)
      if (!fetchedTicket.shipmentId) {
        setError('Ticket no tiene shipment asociado.');
        setIsLoading(false);
        return;
      }

      const shipmentDocRef = doc(db, SHIPMENTS_COLLECTION, fetchedTicket.shipmentId);
      const shipmentDocSnap = await getDoc(shipmentDocRef);

      if (shipmentDocSnap.exists()) {
        const fetchedShipment = { id: shipmentDocSnap.id, ...shipmentDocSnap.data() } as Shipment;
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
      } else {
        setError('Acarreo asociado al ticket no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching ticket or shipment:", e);
      setError('Error al cargar los datos del ticket o acarreo. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleScan = (id: string) => {
    fetchData(id);
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <h1 className="text-2xl font-semibold text-[#2D3748] mb-2">Lector de Tickets</h1>
          <p className="text-gray-600 mb-6">Escanea el código QR del ticket para ver los detalles del acarreo</p>

          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <AdminQrReader label="" placeholder="Ingrese el ID del ticket" onScan={handleScan} />
            <p className="text-sm text-gray-500 mt-4 text-center">Posiciona el código QR del ticket frente a la cámara o ingresa el ID manualmente</p>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38A169]"></div>
              <p className="mt-4 text-gray-600">Buscando ticket...</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-md border border-red-200">
              <p className="font-medium">Error</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {shipment && !isLoading && !error && (
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-[#2D3748]">Información del Acarreo</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Folio</span>
                    <p className="font-mono text-sm text-[#2D3748]">{shipment.folio}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Estado</span>
                    <div className="mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${shipment.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {shipment.status}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Camión</span>
                    <p className="text-[#2D3748]">{shipment.truckPlate}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Chofer</span>
                    <p className="text-[#2D3748]">{shipment.driverName}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Material</span>
                    <p className="text-[#2D3748]">{shipment.materialName}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Peso</span>
                    <p className="text-[#2D3748]">{shipment.weight} {materials.find(m => m.id === shipment.materialId)?.unit || ''}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Origen</span>
                    <p className="text-[#2D3748]">{shipment.dispatchLocationName}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha Despacho</span>
                    <p className="text-[#2D3748]">{formatDate(shipment.dispatchTimestamp)}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Destino</span>
                    <p className="text-[#2D3748]">{shipment.deliveryLocationName}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-500">Fecha Entrega</span>
                    <p className="text-[#2D3748]">{formatDate(shipment.deliveryTimestamp)}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center space-x-4 pt-6 border-t border-gray-200">
                <Link
                  href={`/admin/shipments/${shipment.id}/ticket/dispatch`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  Ver Ticket Despacho
                </Link>
                
                {shipment.status === 'COMPLETADO' && (
                  <Link
                    href={`/admin/shipments/${shipment.id}/ticket/delivery`}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver Ticket Entrega
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
