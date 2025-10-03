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
  const [activeTab, setActiveTab] = useState<'receptions' | 'shipments'>('receptions');

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

      // Denormalize shipment data for display
      const denormalizedShipments = shipmentsData.map(shipment => {
        const truck = trucksData.find(t => t.id === shipment.truckId);
        const driver = driversData.find(d => d.id === shipment.driverId);
        const dispatchLocation = locationsData.find(l => l.id === shipment.dispatchLocationId);
        const deliveryLocation = locationsData.find(l => l.id === shipment.deliveryLocationId);

        // Handle both multi-material and legacy single material shipments
        let materialDisplay = 'Desconocido';
        let totalWeight = shipment.weight || 0;

        if (shipment.materials && shipment.materials.length > 0) {
          // Multi-material shipment
          if (shipment.materials.length === 1) {
            materialDisplay = shipment.materials[0].materialName;
          } else {
            materialDisplay = `${shipment.materials.length} materiales`;
          }
          totalWeight = shipment.materials.reduce((sum, mat) => sum + mat.weight, 0);
        } else if (shipment.materialId) {
          // Legacy single material shipment
          const material = materialsData.find(m => m.id === shipment.materialId);
          materialDisplay = material?.name || 'Desconocido';
        }

        return {
          ...shipment,
          truckPlate: truck?.plate || shipment.truckPlate || 'Desconocido',
          driverName: driver?.name || shipment.driverName || 'Desconocido',
          materialName: materialDisplay,
          dispatchLocationName: dispatchLocation?.name || shipment.dispatchLocationName || 'Desconocido',
          deliveryLocationName: deliveryLocation?.name || shipment.deliveryLocationName || 'N/A',
          weight: totalWeight
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

  const formatDate = (timestamp: { toDate: () => Date } | null | undefined) => {
    if (!timestamp) return 'N/A';
    // Firestore Timestamp object has to be converted to JS Date object
    const date = timestamp.toDate();
    return date.toLocaleString(); // Adjust format as needed
  };

  // Filter shipments based on active tab
  const receptions = shipments.filter(s => s.isReception === true);
  const regularShipments = shipments.filter(s => !s.isReception);
  const displayedShipments = activeTab === 'receptions' ? receptions : regularShipments;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Listado de Acarreos y Recepciones</h1>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('receptions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recepciones ({receptions.length})
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Acarreos ({regularShipments.length})
          </button>
        </nav>
      </div>

      {isLoading && <p className="text-gray-700">Cargando datos...</p>}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md border border-red-200">{error}</p>}

      {!isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto border border-gray-200">
          {displayedShipments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No hay {activeTab === 'receptions' ? 'recepciones' : 'acarreos'} registrados
            </p>
          ) : (
            <table className="w-full table-auto text-left min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Folio</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                  {activeTab === 'shipments' && (
                    <>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Camión</th>
                      <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Chofer</th>
                    </>
                  )}
                  {activeTab === 'receptions' && (
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Orden de Compra</th>
                  )}
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Material</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    {activeTab === 'receptions' ? 'Proveedor' : 'Origen'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Destino</th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Peso</th>
                  {activeTab === 'shipments' && (
                    <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Despacho</th>
                  )}
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    {activeTab === 'receptions' ? 'Fecha Recepción' : 'Entrega'}
                  </th>
                  <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {displayedShipments.map((shipment) => (
                  <tr key={shipment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 font-mono text-sm text-gray-700">{shipment.folio}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${shipment.status === 'COMPLETADO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {shipment.status}
                      </span>
                    </td>
                    {activeTab === 'shipments' && (
                      <>
                        <td className="py-4 px-4 text-gray-700">{shipment.truckPlate}</td>
                        <td className="py-4 px-4 text-gray-700">{shipment.driverName}</td>
                      </>
                    )}
                    {activeTab === 'receptions' && (
                      <td className="py-4 px-4 text-gray-700">
                        {shipment.purchaseOrderNumber || 'N/A'}
                      </td>
                    )}
                    <td className="py-4 px-4 text-gray-700">
                      {shipment.materials && shipment.materials.length > 1 ? (
                        <div>
                          <div className="font-medium">{shipment.materialName}</div>
                          <details className="mt-1">
                            <summary className="text-xs text-blue-600 cursor-pointer">Ver detalles</summary>
                            <div className="mt-2 space-y-1">
                              {shipment.materials.map((material, index) => (
                                <div key={index} className="text-xs text-gray-600">
                                  {material.materialName}: {material.weight} {material.materialUnit}
                                </div>
                              ))}
                            </div>
                          </details>
                        </div>
                      ) : (
                        shipment.materialName
                      )}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {activeTab === 'receptions' ? shipment.supplierName || shipment.dispatchLocationName : shipment.dispatchLocationName}
                    </td>
                    <td className="py-4 px-4 text-gray-700">{shipment.deliveryLocationName}</td>
                    <td className="py-4 px-4 text-gray-700">{shipment.weight}</td>
                    {activeTab === 'shipments' && (
                      <td className="py-4 px-4 text-sm text-gray-700">{formatDate(shipment.dispatchTimestamp)}</td>
                    )}
                    <td className="py-4 px-4 text-sm text-gray-700">{formatDate(shipment.deliveryTimestamp)}</td>
                    <td className="py-4 px-4 text-center">
                      {activeTab === 'receptions' ? (
                        <Link href={`/admin/shipments/${shipment.id}/ticket/delivery`} className="text-blue-600 hover:underline text-sm">
                          Ver Ticket
                        </Link>
                      ) : (
                        <>
                          <Link href={`/admin/shipments/${shipment.id}/ticket/dispatch`} className="text-blue-600 hover:underline text-sm mr-2">
                            Despacho
                          </Link>
                          {shipment.status === 'COMPLETADO' && (
                            <Link href={`/admin/shipments/${shipment.id}/ticket/delivery`} className="text-blue-600 hover:underline text-sm">
                              Entrega
                            </Link>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}