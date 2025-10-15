'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { getDocument, updateDocument } from '@/lib/firebase/firestore';
import { PurchaseOrder, PurchaseOrderItem } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PurchaseOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState<PurchaseOrderItem[]>([]);

  const loadData = useCallback(async () => {
    if (typeof id !== 'string') return;
    try {
      setLoading(true);
      const data = await getDocument<PurchaseOrder>(PURCHASE_ORDERS_COLLECTION, id);
      if (data) {
        setOrder(data);
        setEditedItems(JSON.parse(JSON.stringify(data.items))); // Deep copy
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error loading purchase order:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleItemChange = (index: number, field: keyof PurchaseOrderItem, value: string | number) => {
    const newItems = [...editedItems];
    const item = { ...newItems[index] };

    if (field === 'orderedQuantity' || field === 'receivedQuantity') {
      const numValue = Number(value);
      if (!isNaN(numValue)) {
        item[field] = numValue;
        item.pendingQuantity = item.orderedQuantity - item.receivedQuantity;
      }
    }
    newItems[index] = item;
    setEditedItems(newItems);
  };

  const handleSaveChanges = async () => {
    if (typeof id !== 'string') return;
    try {
      const updatedItems = editedItems.map(item => ({
        ...item,
        pendingQuantity: item.orderedQuantity - item.receivedQuantity
      }));

      const allCompleted = updatedItems.every(item => item.receivedQuantity >= item.orderedQuantity);
      const anyPartial = updatedItems.some(item => item.receivedQuantity > 0 && item.receivedQuantity < item.orderedQuantity);

      let newStatus = 'PENDING';
      if (allCompleted) {
        newStatus = 'COMPLETED';
      } else if (anyPartial || updatedItems.some(item => item.receivedQuantity > 0)) {
        newStatus = 'PARTIAL';
      }

      await updateDocument(PURCHASE_ORDERS_COLLECTION, id, {
        items: updatedItems,
        status: newStatus
      });
      setIsEditing(false);
      loadData(); // Reload data to show saved state
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };


  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!order) {
    return <div>Orden de compra no encontrada.</div>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Orden {order.orderNumber}</h2>
            <p className="text-sm text-gray-500">
              Fecha: {order.orderDate instanceof Timestamp ? order.orderDate.toDate().toLocaleDateString() : 'Fecha inválida'}
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <StatusBadge status={order.status as any} />
            {!isEditing ? (
              <Button
                onClick={() => setIsEditing(true)}
              >
                Editar Cantidades
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveChanges}
                >
                  Guardar Cambios
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedItems(JSON.parse(JSON.stringify(order.items))); // Revert changes
                  }}
                >
                  Cancelar
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-600">Proveedor:</p>
            <p className="text-gray-800">{order.supplierName}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold text-gray-600">Ubicaciones de Entrega:</p>
            <ul className="list-disc list-inside text-gray-800">
              {order.deliveryLocationNames.split(', ').map((name, index) => (
                <li key={index}>{name}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Material</th>
                  <th scope="col" className="px-6 py-3 text-right">Ordenado</th>
                  <th scope="col" className="px-6 py-3 text-right">Recibido</th>
                  <th scope="col" className="px-6 py-3 text-right">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {isEditing ? (
                  editedItems.map((item, index) => (
                    <tr key={item.materialId} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={item.orderedQuantity}
                          onChange={(e) => handleItemChange(index, 'orderedQuantity', e.target.value)}
                          className="w-24 text-right bg-gray-100 rounded-md border-gray-300 focus:border-[#38A169] focus:ring-[#38A169]"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          value={item.receivedQuantity}
                          onChange={(e) => handleItemChange(index, 'receivedQuantity', e.target.value)}
                          className="w-24 text-right bg-gray-100 rounded-md border-gray-300 focus:border-[#38A169] focus:ring-[#38A169]"
                        />
                      </td>
                      <td className="px-6 py-4 text-right font-medium">{item.pendingQuantity}</td>
                    </tr>
                  ))
                ) : (
                  order.items.map(item => (
                    <tr key={item.materialId} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900">{item.materialName}</td>
                      <td className="px-6 py-4 text-right">{item.orderedQuantity}</td>
                      <td className="px-6 py-4 text-right">{item.receivedQuantity}</td>
                      <td className="px-6 py-4 text-right font-medium text-yellow-600">{item.pendingQuantity}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
