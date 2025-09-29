'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addDocument, updateDocument } from '@/lib/firebase/firestore';
import { PurchaseOrder, Reception, ReceptionItem, Shipment, Ticket, ShipmentItem } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION, RECEPTIONS_COLLECTION, SHIPMENTS_COLLECTION, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

export default function ReceptionsPage() {
  const [pendingOrders, setPendingOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { userProfile } = useAuth();

  const loadPendingOrders = useCallback(async () => {
    if (!userProfile?.currentLocationId) return;

    try {
      const q = query(
        collection(db, PURCHASE_ORDERS_COLLECTION),
        where('deliveryLocationId', '==', userProfile.currentLocationId),
        where('status', 'in', ['PENDING', 'PARTIAL'])
      );

      const querySnapshot = await getDocs(q);
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PurchaseOrder[];

      setPendingOrders(orders);
    } catch (error) {
      console.error('Error loading pending orders:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile?.currentLocationId]);

  useEffect(() => {
    if (userProfile?.currentLocationId) {
      loadPendingOrders();
    }
  }, [userProfile?.currentLocationId, loadPendingOrders]);

  const selectOrder = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setExpandedItems(new Set());

    const items: ReceptionItem[] = order.items.map(item => ({
      materialId: item.materialId,
      materialName: item.materialName,
      materialUnit: item.materialUnit,
      orderedQuantity: item.orderedQuantity,
      previouslyReceived: item.receivedQuantity,
      currentReceived: 0,
      totalReceived: item.receivedQuantity,
      pendingQuantity: item.pendingQuantity,
      status: item.receivedQuantity >= item.orderedQuantity ? 'COMPLETED' : 'PENDING'
    }));

    setReceptionItems(items);
  };

  const toggleExpanded = (materialId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId);
    } else {
      newExpanded.add(materialId);
    }
    setExpandedItems(newExpanded);
  };

  const receiveAll = (materialId: string) => {
    setReceptionItems(items => items.map(item => {
      if (item.materialId === materialId) {
        const currentReceived = item.pendingQuantity;
        const totalReceived = item.previouslyReceived + currentReceived;

        return {
          ...item,
          currentReceived,
          totalReceived,
          pendingQuantity: 0,
          status: 'COMPLETED' as const
        };
      }
      return item;
    }));
  };

  const updateCurrentReceived = (materialId: string, amount: number) => {
    setReceptionItems(items => items.map(item => {
      if (item.materialId === materialId) {
        const currentReceived = Math.max(0, amount);
        const totalReceived = item.previouslyReceived + currentReceived;
        const pendingQuantity = item.orderedQuantity - totalReceived;

        let status: 'PENDING' | 'COMPLETED' | 'OVER_RECEIVED' = 'PENDING';
        if (totalReceived >= item.orderedQuantity) {
          status = totalReceived > item.orderedQuantity ? 'OVER_RECEIVED' : 'COMPLETED';
        }

        return {
          ...item,
          currentReceived,
          totalReceived,
          pendingQuantity,
          status
        };
      }
      return item;
    }));
  };

  const generateReceptionNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `REC-${year}${month}${day}-${random}`;
  };

  const generateShipmentFolio = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `RCP-${year}${month}${day}-${random}`;
  };

  const handleReception = async () => {
    if (!selectedOrder || !userProfile) return;

    const hasItemsToReceive = receptionItems.some(item => item.currentReceived > 0);
    if (!hasItemsToReceive) {
      alert('Selecciona las cantidades a recibir antes de confirmar');
      return;
    }

    setSubmitting(true);

    try {
      const receptionNumber = generateReceptionNumber();
      const shipmentFolio = generateShipmentFolio();

      // Create reception record
      const reception: Omit<Reception, 'id' | 'createdAt'> = {
        receptionNumber,
        purchaseOrderId: selectedOrder.id,
        purchaseOrderNumber: selectedOrder.orderNumber,
        supplierId: selectedOrder.supplierId,
        supplierName: selectedOrder.supplierName,
        deliveryLocationId: selectedOrder.deliveryLocationId,
        deliveryLocationName: selectedOrder.deliveryLocationName,
        items: receptionItems.filter(item => item.currentReceived > 0),
        receptionDate: Timestamp.now(),
        receivedBy: userProfile.id,
        receivedByName: userProfile.username,
        isPartialReception: receptionItems.some(item => item.currentReceived > 0 && item.status === 'PENDING')
      };

      const receptionId = await addDocument(RECEPTIONS_COLLECTION, reception);

      // Create a single shipment with all received materials
      const receivedItems = receptionItems.filter(item => item.currentReceived > 0);

      if (receivedItems.length > 0) {
        // Prepare materials array for the shipment
        const shipmentMaterials: ShipmentItem[] = receivedItems.map(item => ({
          materialId: item.materialId,
          materialName: item.materialName,
          materialUnit: item.materialUnit,
          weight: item.currentReceived
        }));

        // Calculate total weight
        const totalWeight = receivedItems.reduce((sum, item) => sum + item.currentReceived, 0);

        // Create single multi-material shipment
        const shipment: Omit<Shipment, 'id'> = {
          folio: shipmentFolio,
          truckId: '',
          driverId: '',
          materials: shipmentMaterials,
          dispatchLocationId: '',
          deliveryLocationId: selectedOrder.deliveryLocationId,
          dispatchTimestamp: Timestamp.now(),
          deliveryTimestamp: Timestamp.now(),
          status: 'COMPLETADO',
          createdAt: Timestamp.now(),
          // Denormalized data
          truckPlate: 'RECEPCIÓN',
          driverName: 'RECEPCIÓN',
          dispatchLocationName: selectedOrder.supplierName,
          deliveryLocationName: selectedOrder.deliveryLocationName,
          // Reception-specific fields
          isReception: true,
          receptionId,
          purchaseOrderNumber: selectedOrder.orderNumber,
          supplierName: selectedOrder.supplierName,
          // Legacy compatibility (use first material)
          materialId: shipmentMaterials[0].materialId,
          materialName: shipmentMaterials.length === 1 ? shipmentMaterials[0].materialName : `${shipmentMaterials.length} materiales`,
          weight: totalWeight
        };

        const shipmentId = await addDocument(SHIPMENTS_COLLECTION, shipment);

        // Create single ticket for the multi-material reception
        const ticket: Omit<Ticket, 'id' | 'createdAt'> = {
          shipmentId,
          receptionId,
          type: 'reception',
          materials: shipmentMaterials,
          receivedBy: userProfile.id,
          receivedByName: userProfile.username,
          receptionDate: Timestamp.now(),
          purchaseOrderNumber: selectedOrder.orderNumber,
          supplierName: selectedOrder.supplierName,
          // Denormalized shipment data
          folio: shipmentFolio,
          truckPlate: 'RECEPCIÓN',
          driverName: 'RECEPCIÓN',
          dispatchLocationName: selectedOrder.supplierName,
          deliveryLocationName: selectedOrder.deliveryLocationName,
          dispatchTimestamp: Timestamp.now(),
          deliveryTimestamp: Timestamp.now()
        };

        const ticketId = await addDocument(TICKETS_COLLECTION, ticket);

        // Update purchase order
        const updatedItems = selectedOrder.items.map(orderItem => {
          const receptionItem = receptionItems.find(item => item.materialId === orderItem.materialId);
          if (receptionItem && receptionItem.currentReceived > 0) {
            const newReceivedQuantity = orderItem.receivedQuantity + receptionItem.currentReceived;
            return {
              ...orderItem,
              receivedQuantity: newReceivedQuantity,
              pendingQuantity: orderItem.orderedQuantity - newReceivedQuantity
            };
          }
          return orderItem;
        });

        const allCompleted = updatedItems.every(item => item.receivedQuantity >= item.orderedQuantity);
        const anyPartial = updatedItems.some(item => item.receivedQuantity > 0 && item.receivedQuantity < item.orderedQuantity);

        let newStatus = selectedOrder.status;
        if (allCompleted) {
          newStatus = 'COMPLETED';
        } else if (anyPartial || updatedItems.some(item => item.receivedQuantity > 0)) {
          newStatus = 'PARTIAL';
        }

        await updateDocument(PURCHASE_ORDERS_COLLECTION, selectedOrder.id, {
          items: updatedItems,
          status: newStatus
        });

        // Redirect to ticket page instead of showing alert
        window.location.href = `/admin/tickets/${ticketId}`;
      } else {
        alert('Recepción registrada exitosamente, pero no se pudo crear el ticket');
        setSelectedOrder(null);
        setReceptionItems([]);
        loadPendingOrders();
      }

    } catch (error) {
      console.error('Error creating reception:', error);
      alert('Error al registrar la recepción');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'PARTIAL': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-green-500';
      case 'OVER_RECEIVED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'PARTIAL': return 'Parcial';
      case 'COMPLETED': return 'Completo';
      case 'OVER_RECEIVED': return 'Exceso';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Cargando órdenes...</div>
      </div>
    );
  }

  if (!userProfile?.currentLocationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-4">Sin ubicación asignada</div>
          <div className="text-gray-600">Contacta al administrador</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {!selectedOrder ? (
        // Order selection - Mobile optimized
        <div className="p-4">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Recepciones</h1>
            <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm">
              📍 {userProfile.currentLocationName}
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-2">No hay órdenes pendientes</div>
              <div className="text-gray-400 text-sm">en esta ubicación</div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 active:bg-gray-50"
                  onClick={() => selectOrder(order)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{order.orderNumber}</h3>
                      <p className="text-gray-600 text-sm">{order.supplierName}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-gray-500">Productos:</span>
                      <div className="font-medium">{order.items.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Pendientes:</span>
                      <div className="font-medium text-yellow-600">
                        {order.items.filter(item => item.pendingQuantity > 0).length}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      {order.orderDate.toDate().toLocaleDateString()}
                    </div>
                    <div className="text-blue-600 font-medium text-sm">
                      Seleccionar →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Reception form - Mobile optimized
        <div className="flex flex-col h-screen">
          {/* Fixed header */}
          <div className="bg-white shadow-sm border-b border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-blue-600 font-medium text-sm"
              >
                ← Volver
              </button>
              <div className="text-xs text-gray-500">
                {selectedOrder.orderDate.toDate().toLocaleDateString()}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-lg text-gray-900">{selectedOrder.orderNumber}</h2>
              <p className="text-gray-600 text-sm">{selectedOrder.supplierName}</p>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {receptionItems.map((item) => (
                <div key={item.materialId} className="bg-white rounded-xl shadow-sm border border-gray-200">
                  {/* Item header - always visible */}
                  <div
                    className="p-4 cursor-pointer active:bg-gray-50"
                    onClick={() => toggleExpanded(item.materialId)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 pr-3">
                        <h3 className="font-medium text-gray-900 text-sm leading-tight">{item.materialName}</h3>
                        <p className="text-gray-500 text-xs">{item.materialUnit}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block">Ordenado</span>
                        <span className="font-medium text-gray-900">{item.orderedQuantity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Recibido</span>
                        <span className="font-medium text-gray-900">{item.previouslyReceived}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block">Pendiente</span>
                        <span className="font-medium text-yellow-600">{item.pendingQuantity}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-xs text-gray-500">
                        {expandedItems.has(item.materialId) ? 'Ocultar opciones' : 'Ver opciones'}
                      </div>
                      <div className="text-gray-400">
                        {expandedItems.has(item.materialId) ? '▲' : '▼'}
                      </div>
                    </div>
                  </div>

                  {/* Expanded options */}
                  {expandedItems.has(item.materialId) && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                      <div className="space-y-3">
                        {/* Quick actions */}
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => receiveAll(item.materialId)}
                            disabled={item.pendingQuantity <= 0}
                            className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-green-700"
                          >
                            Recibir Todo
                            <div className="text-xs opacity-90">({item.pendingQuantity})</div>
                          </button>
                          <button
                            onClick={() => updateCurrentReceived(item.materialId, 0)}
                            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium text-sm active:bg-gray-300"
                          >
                            Limpiar
                          </button>
                        </div>

                        {/* Manual input */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Cantidad a recibir ahora:
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.currentReceived || ''}
                            onChange={(e) => updateCurrentReceived(item.materialId, parseFloat(e.target.value) || 0)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base text-center font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>

                        {/* Result preview */}
                        {item.currentReceived > 0 && (
                          <div className="bg-blue-50 rounded-lg p-3">
                            <div className="text-xs text-blue-800 font-medium mb-1">Resultado:</div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-blue-600">Total recibido:</span>
                                <div className="font-medium">{item.totalReceived}</div>
                              </div>
                              <div>
                                <span className="text-blue-600">Quedará pendiente:</span>
                                <div className="font-medium">{item.pendingQuantity}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Fixed footer with action button */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedOrder(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-4 rounded-xl font-medium text-base active:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleReception}
                disabled={submitting || !receptionItems.some(item => item.currentReceived > 0)}
                className="flex-2 bg-blue-600 text-white px-6 py-4 rounded-xl font-medium text-base disabled:bg-gray-300 disabled:cursor-not-allowed active:bg-blue-700"
              >
                {submitting ? 'Registrando...' : 'Confirmar Recepción'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}