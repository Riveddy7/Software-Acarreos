'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCollection } from '@/lib/firebase/firestore';
import { PurchaseOrder } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION } from '@/lib/firebase/firestore';

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

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PARTIAL: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      PENDING: 'Pendiente',
      PARTIAL: 'Parcial',
      COMPLETED: 'Completado',
      CANCELLED: 'Cancelado'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
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

  if (loading) {
    return <div className="p-8">Cargando órdenes de compra...</div>;
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-3 gap-4 mb-4 items-center">
        <div className="col-span-1">
          <input
            type="text"
            placeholder="Buscar por número de orden..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md shadow-[#2D3748]/30"
          />
        </div>
        <div className="col-span-1 flex justify-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md shadow-[#2D3748]/30"
          >
            <option value="ALL">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="PARTIAL">Parcial</option>
            <option value="COMPLETED">Completado</option>
          </select>
        </div>
        <div className="col-span-1 flex justify-end">
          <button
            onClick={() => router.push('/admin/purchase-orders/new')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center shadow-md shadow-[#2D3748]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Nueva Orden
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md shadow-[#2D3748]/30 rounded-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay órdenes de compra que coincidan con la búsqueda
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ubicaciones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progreso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const progress = calculateOrderProgress(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{order.orderNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.supplierName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{order.deliveryLocationNames}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {progress.completed}/{progress.total} productos
                      </div>
                      {progress.partial > 0 && (
                        <div className="text-xs text-green-600">
                          {progress.partial} parciales
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderDate.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => router.push(`/admin/purchase-orders/${order.id}`)}
                        className="text-green-600 hover:text-green-900"
                      >
                        Ver Detalles
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}