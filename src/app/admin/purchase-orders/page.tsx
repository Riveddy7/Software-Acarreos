'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCollection } from '@/lib/firebase/firestore';
import { PurchaseOrder } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Column } from '@/components/ui/DataTable';

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const router = useRouter();

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  const loadPurchaseOrders = async () => {
    try {
      const ordersData = await getCollection<PurchaseOrder>(PURCHASE_ORDERS_COLLECTION);
      setPurchaseOrders(ordersData);
    } catch (error) {
      console.error('Error loading purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };


  const calculateOrderProgress = (order: PurchaseOrder) => {
    const totalItems = order.items.length;
    const completedItems = order.items.filter(item => item.receivedQuantity >= item.orderedQuantity).length;
    const partialItems = order.items.filter(item => item.receivedQuantity > 0 && item.receivedQuantity < item.orderedQuantity).length;

    return {
      total: totalItems,
      completed: completedItems,
      partial: partialItems,
      pending: totalItems - completedItems - partialItems
    };
  };

  const filteredOrders = purchaseOrders
    .filter(order =>
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(order =>
      statusFilter === 'ALL' ? true : order.status === statusFilter
    );

  // Definir columnas para la tabla
  const columns: Column<PurchaseOrder>[] = [
    {
      key: 'orderNumber',
      label: 'Orden #',
      render: (value) => (
        <div className="font-medium text-gray-900">{value}</div>
      )
    },
    {
      key: 'supplierName',
      label: 'Proveedor'
    },
    {
      key: 'deliveryLocationNames',
      label: 'Ubicaciones'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (
        <StatusBadge status={value as any} />
      )
    },
    {
      key: 'id',
      label: 'Progreso',
      render: (_, order) => {
        const progress = calculateOrderProgress(order);
        return (
          <div>
            <div className="text-sm text-gray-900">
              {progress.completed}/{progress.total} productos
            </div>
            {progress.partial > 0 && (
              <div className="text-xs text-green-600">
                {progress.partial} parciales
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'orderDate',
      label: 'Fecha',
      render: (value) => value.toDate().toLocaleDateString()
    },
    {
      key: 'id',
      label: 'Acciones',
      render: (_, order) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => router.push(`/admin/purchase-orders/${order.id}`)}
        >
          Ver Detalles
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <div className="p-8">
        <DataTable
          data={[]}
          columns={columns}
          loading={true}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2">
          <SearchInput
            placeholder="Buscar por número de orden..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#38A169] shadow-md"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PARTIAL">Parcial</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </div>
        <div>
          <Button onClick={() => router.push('/admin/purchase-orders/new')} className="w-full">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Nueva Orden
          </Button>
        </div>
      </div>
      
      <DataTable
        data={filteredOrders}
        columns={columns}
        loading={loading}
        emptyMessage="No hay órdenes de compra que coincidan con la búsqueda"
      />
    </div>
  );
}