'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Shipment, Truck, Driver, Material, Location } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Column } from '@/components/ui/DataTable';

const SHIPMENTS_COLLECTION = 'shipments';
const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';
const PURCHASE_ORDERS_COLLECTION = 'purchaseOrders';

export default function ShipmentsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [activeTab, setActiveTab] = useState<'receptions' | 'shipments'>('receptions');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch all master data including purchase orders
      const [shipmentsData, trucksData, driversData, materialsData, locationsData, purchaseOrdersData] = await Promise.all([
        getCollection<Shipment>(SHIPMENTS_COLLECTION),
        getCollection<Truck>(TRUCKS_COLLECTION),
        getCollection<Driver>(DRIVERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION),
        getCollection<any>(PURCHASE_ORDERS_COLLECTION),
      ]);

      // Create a map of purchase order numbers to IDs
      const purchaseOrderMap = new Map();
      purchaseOrdersData.forEach(po => {
        purchaseOrderMap.set(po.orderNumber, po.id);
      });

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

        // Find the purchase order ID
        const purchaseOrderId = shipment.purchaseOrderNumber
          ? purchaseOrderMap.get(shipment.purchaseOrderNumber)
          : undefined;

        return {
          ...shipment,
          truckPlate: truck?.plate || shipment.truckPlate || 'Desconocido',
          driverName: driver?.name || shipment.driverName || 'Desconocido',
          materialName: materialDisplay,
          dispatchLocationName: dispatchLocation?.name || shipment.dispatchLocationName || 'Desconocido',
          deliveryLocationName: deliveryLocation?.name || shipment.deliveryLocationName || 'N/A',
          weight: totalWeight,
          purchaseOrderId
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
    return date.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: '2-digit' }); // Format: DD/MM/YY
  };

  // Function to get last 3 digits of a string
  const getLast3Digits = (value: string | undefined) => {
    if (!value) return 'N/A';
    return value.length > 3 ? value.slice(-3) : value;
  };

  // Filter shipments based on active tab
  const receptions = shipments.filter(s => s.isReception === true);
  const regularShipments = shipments.filter(s => !s.isReception);
  const displayedShipments = activeTab === 'receptions' ? receptions : regularShipments;
  
  // Filter shipments based on search query
  const filteredShipments = displayedShipments.filter(shipment =>
    shipment.folio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.truckPlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.materialName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.dispatchLocationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shipment.deliveryLocationName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Define columns for the DataTable
  const getColumns = (): Column<any>[] => {
    const baseColumns: Column<any>[] = [
      {
        key: 'folio',
        label: 'Folio',
        render: (value) => (
          <span className="font-mono text-sm text-gray-700">{getLast3Digits(value)}</span>
        )
      },
      {
        key: 'materialName',
        label: 'Material',
        render: (_, shipment) => (
          <div>
            <div className="font-medium text-gray-700">{shipment.materialName}</div>
            {shipment.materials && shipment.materials.length > 1 && (
              <details className="mt-1">
                <summary className="text-xs text-green-600 cursor-pointer">Ver detalles</summary>
                <div className="mt-2 space-y-1">
                  {shipment.materials.map((material: any, index: number) => (
                    <div key={index} className="text-xs text-gray-600">
                      {material.materialName}: {material.weight} {material.materialUnit}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )
      },
      {
        key: activeTab === 'receptions' ? 'supplierName' : 'dispatchLocationName',
        label: activeTab === 'receptions' ? 'Proveedor' : 'Origen',
        render: (value, shipment) => (
          <span className="text-gray-700">
            {activeTab === 'receptions' ? shipment.supplierName || value : value}
          </span>
        )
      },
      {
        key: 'deliveryLocationName',
        label: 'Destino',
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      },
      {
        key: 'weight',
        label: 'Peso',
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      },
      {
        key: 'deliveryTimestamp',
        label: activeTab === 'receptions' ? 'Fecha' : 'Entrega',
        render: (value) => (
          <span className="text-sm text-gray-700">{formatDate(value)}</span>
        )
      },
      {
        key: 'id' as keyof any,
        label: 'Tickets',
        render: (_, shipment) => (
          <div className="flex flex-col space-y-1">
            {activeTab === 'receptions' ? (
              <Link
                href={`/admin/shipments/${shipment.id}/ticket/delivery`}
                className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
            ) : (
              <>
                <Link
                  href={`/admin/shipments/${shipment.id}/ticket/dispatch`}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </Link>
                {shipment.status === 'COMPLETADO' && (
                  <Link
                    href={`/admin/shipments/${shipment.id}/ticket/delivery`}
                    className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </Link>
                )}
              </>
            )}
          </div>
        )
      }
    ];

    // Add tab-specific columns
    if (activeTab === 'shipments') {
      baseColumns.splice(2, 0, {
        key: 'truckPlate',
        label: 'Camión',
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      });
      
      baseColumns.splice(3, 0, {
        key: 'driverName',
        label: 'Chofer',
        render: (value) => (
          <span className="text-gray-700">{value}</span>
        )
      });
    } else {
      baseColumns.splice(2, 0, {
        key: 'purchaseOrderNumber',
        label: 'Pedido',
        render: (value, shipment) => (
          value && shipment.purchaseOrderId ? (
            <Link
              href={`/admin/purchase-orders/${shipment.purchaseOrderId}`}
              className="text-green-600 hover:text-green-800 text-sm font-mono"
            >
              {getLast3Digits(value)}
            </Link>
          ) : (
            <span className="text-gray-700">N/A</span>
          )
        )
      });
    }

    return baseColumns;
  };

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <SearchInput
            placeholder="Buscar por folio, camión, chofer, material..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          {/* Shipments no tienen botón de creación, se generan automáticamente */}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('receptions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receptions'
                ? 'border-[#38A169] text-[#38A169]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recepciones ({receptions.length})
          </button>
          <button
            onClick={() => setActiveTab('shipments')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'shipments'
                ? 'border-[#38A169] text-[#38A169]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Acarreos ({regularShipments.length})
          </button>
        </nav>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredShipments}
        columns={getColumns()}
        loading={isLoading}
        emptyMessage={`No hay ${activeTab === 'receptions' ? 'recepciones' : 'acarreos'} que coincidan con la búsqueda`}
      />
    </div>
  );
}