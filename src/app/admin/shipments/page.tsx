'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shipment, Truck, Driver, Material, Location } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import Link from 'next/link';

const SHIPMENTS_COLLECTION = 'shipments';
const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all master data
      const [shipmentsData, trucksData, driversData, materialsData, locationsData] = await Promise.all([
        getCollection<Shipment>(SHIPMENTS_COLLECTION),
        getCollection<Truck>(TRUCKS_COLLECTION),
        getCollection<Driver>(DRIVERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION),
      ]);

      setTrucks(trucksData);
      setDrivers(driversData);
      setMaterials(materialsData);
      setLocations(locationsData);

      // Denormalize shipment data for display
      const denormalizedShipments = shipmentsData.map(shipment => {
        const truck = trucksData.find(t => t.id === shipment.truckId);
        const driver = driversData.find(d => d.id === shipment.driverId);
        const material = materialsData.find(m => m.id === shipment.materialId);
        const dispatchLocation = locationsData.find(l => l.id === shipment.dispatchLocationId);
        const deliveryLocation = locationsData.find(l => l.id === shipment.deliveryLocationId);

        return {
          ...shipment,
          truckPlate: truck?.plate || 'Desconocido',
          driverName: driver?.name || 'Desconocido',
          materialName: material?.name || 'Desconocido',
          dispatchLocationName: dispatchLocation?.name || 'Desconocido',
          deliveryLocationName: deliveryLocation?.name || 'N/A',
        };
      });

      setShipments(denormalizedShipments);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los acarreos. Asegúrate de que tu configuración de Firebase sea correcta y que las colecciones existan.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    // Firestore Timestamp object has to be converted to JS Date object
    const date = timestamp.toDate();
    return date.toLocaleString(); // Adjust format as needed
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Listado de Acarreos</h1>

      {isLoading && <p className="text-gray-700">Cargando acarreos...</p>}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md border border-red-200">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto border border-gray-200">
          <table className="w-full table-auto text-left min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Camión</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Origen</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Peso</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Despacho</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Entrega</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Tickets</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map((shipment) => (
                <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-mono text-sm text-gray-700">{shipment.folio}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${shipment.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-700">{shipment.truckPlate}</td>
                  <td className="py-4 px-4 text-gray-700">{shipment.driverName}</td>
                  <td className="py-4 px-4 text-gray-700">{shipment.materialName}</td>
                  <td className="py-4 px-4 text-gray-700">{shipment.dispatchLocationName}</td>
                  <td className="py-4 px-4 text-gray-700">{shipment.deliveryLocationName}</td>
                  <td className="py-4 px-4 text-gray-700">{shipment.weight}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{formatDate(shipment.dispatchTimestamp)}</td>
                  <td className="py-4 px-4 text-sm text-gray-700">{formatDate(shipment.deliveryTimestamp)}</td>
                  <td className="py-4 px-4 text-center">
                    <Link href={`/admin/shipments/${shipment.id}/ticket/dispatch`} className="text-blue-600 hover:underline text-sm mr-2">
                      Despacho
                    </Link>
                    {shipment.status === 'COMPLETADO' ? (
                      <Link href={`/admin/shipments/${shipment.id}/ticket/delivery`} className="text-blue-600 hover:underline text-sm">
                        Entrega
                      </Link>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}