'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addDocument, updateDocument, getDocument } from '@/lib/firebase/firestore';
import { PurchaseOrder, Reception, ReceptionItem, Shipment, Ticket, ShipmentItem, Truck } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION, RECEPTIONS_COLLECTION, SHIPMENTS_COLLECTION, TICKETS_COLLECTION, TRUCKS_COLLECTION } from '@/lib/firebase/firestore';
import { query, where, getDocs, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Timestamp } from 'firebase/firestore';

export default function ReceptionsPage() {
  const [pendingOrders, setPendingOrders] = useState<PurchaseOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [receptionItems, setReceptionItems] = useState<ReceptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [truckCode, setTruckCode] = useState('');
  const [truck, setTruck] = useState<Truck | null>(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const { userProfile } = useAuth();

  const loadPendingOrders = useCallback(async () => {
    if (!userProfile?.currentLocationId) return;

    try {
      const q = query(
        collection(db, PURCHASE_ORDERS_COLLECTION),
        where('deliveryLocationIds', 'array-contains', userProfile.currentLocationId),
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
    setTruckCode('');
    setTruck(null);
    setSelectedMaterialId('');

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

  const handleTruckCodeSubmit = async () => {
    if (!truckCode) {
      alert('Ingrese el código del camión');
      return;
    }

    try {
      const truckData = await getDocument<Truck>(TRUCKS_COLLECTION, truckCode);
      if (!truckData) {
        alert('Camión no encontrado');
        return;
      }
      if (!truckData.volume || truckData.volume <= 0) {
        alert('Este camión no tiene un volumen configurado. Por favor, edita el camión y agrega el volumen.');
        return;
      }
      setTruck(truckData);
    } catch (error) {
      console.error('Error loading truck:', error);
      alert('Error al cargar el camión');
    }
  };

  const handleMaterialSelection = (materialId: string) => {
    if (!truck || !truck.volume) return;

    setSelectedMaterialId(materialId);

    // Auto-calculate based on truck volume
    setReceptionItems(items => items.map(item => {
      if (item.materialId === materialId) {
        const currentReceived = truck.volume!;
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
    if (!selectedOrder || !userProfile || !truck) return;

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
        deliveryLocationId: userProfile.currentLocationId || '',
        deliveryLocationName: userProfile.currentLocationName || '',
        truckId: truck.id,
        truckPlate: truck.placas,
        truckVolume: truck.volume ?? 0,
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
          truckId: truck.id,
          driverId: '',
          materials: shipmentMaterials,
          dispatchLocationId: '',
          deliveryLocationId: userProfile.currentLocationId || '',
          dispatchTimestamp: Timestamp.now(),
          deliveryTimestamp: Timestamp.now(),
          status: 'COMPLETADO',
          createdAt: Timestamp.now(),
          // Denormalized data
          truckPlate: truck.placas,
          driverName: 'RECEPCIÓN',
          dispatchLocationName: selectedOrder.supplierName,
          deliveryLocationName: userProfile.currentLocationName || '',
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
          truckPlate: truck.placas,
          driverName: 'RECEPCIÓN',
          dispatchLocationName: selectedOrder.supplierName,
          deliveryLocationName: userProfile.currentLocationName || '',
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
    <>
      {!selectedOrder ? (
        // Order selection - Exact same structure as main page
        <div className="container-mobile mx-auto py-6">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>Recepciones</h1>
            <div className="flex items-center text-gray-600 text-sm">
              <svg className="w-4 h-4 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{userProfile?.currentLocationName}</span>
            </div>
          </div>

          {pendingOrders.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg mb-2">No hay órdenes pendientes</div>
              <div className="text-gray-400 text-sm">en esta ubicación</div>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingOrders.map((order) => (
                <div
                  key={order.id}
                  className="card-mobile cursor-pointer hover:shadow-md transition-all duration-200 active:scale-[0.99] w-full"
                  onClick={() => selectOrder(order)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{order.orderNumber}</h3>
                      <p className="text-gray-600 text-sm">{order.supplierName}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <span className="text-gray-500 text-xs block">Productos</span>
                        <div className="font-semibold">{order.items.length}</div>
                      </div>
                      <div className="text-center">
                        <span className="text-gray-500 text-xs block">Pendientes</span>
                        <div className="font-semibold text-yellow-600">
                          {order.items.filter(item => item.pendingQuantity > 0).length}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="text-xs text-gray-500">
                        {order.orderDate.toDate().toLocaleDateString()}
                      </div>
                      <button className="text-green-600 font-semibold flex items-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Reception form - Same structure as main page
        <div className="container-mobile mx-auto py-6">
          {/* Header - Only show when not in step 2 or 3 */}
          {(!truck || (truck && selectedMaterialId)) && (
            <div className="card-mobile mb-4">
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setTruck(null);
                    setTruckCode('');
                    setSelectedMaterialId('');
                  }}
                  className="flex items-center text-green-600 font-semibold"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver
                </button>
                <div className="text-sm text-gray-500">
                  {selectedOrder?.orderDate.toDate().toLocaleDateString()}
                </div>
              </div>
              <div>
                <h2 className="font-semibold text-xl text-gray-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>{selectedOrder?.orderNumber}</h2>
                <p className="text-gray-600">{selectedOrder?.supplierName}</p>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="pb-16">
            {/* Step 1: Scan truck */}
            {!truck && (
              <>
                <div className="card-mobile mb-6 h-[240px] flex flex-col">
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold text-sm">1</span>
                    </div>
                    <h3 className="font-semibold text-xl text-gray-900">Escanear Camión</h3>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Código del Camión
                    </label>
                    <input
                      type="text"
                      value={truckCode}
                      onChange={(e) => setTruckCode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleTruckCodeSubmit();
                        }
                      }}
                      className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg text-xl font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                      placeholder="Escanea o ingresa el código"
                      style={{ height: '60px' }}
                    />
                  </div>
                </div>

                {/* Button below card */}
                <div className="mb-6">
                  <button
                    onClick={handleTruckCodeSubmit}
                    disabled={!truckCode}
                    className="btn-mobile btn-purple-500 w-full text-lg py-4 disabled:bg-gray-200 disabled:border-gray-300 disabled:text-gray-400"
                  >
                    Confirmar Camión
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Select material */}
            {truck && !selectedMaterialId && (
              <div className="space-y-4">
                {/* Truck card with back button */}
                <div className="card-mobile bg-green-50 border-green-200 relative">
                  <button
                    onClick={() => {
                      setTruck(null);
                      setTruckCode('');
                    }}
                    className="absolute top-4 right-4 text-green-600 p-2 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-green-800">Camión {truck?.placas}</div>
                      <div className="text-sm text-green-600">Volumen: {truck?.volume || 'N/A'} M³</div>
                    </div>
                  </div>
                </div>

                {/* Material selection table */}
                <div className="card-mobile">
                  <div className="flex items-center mb-4">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-purple-600 font-bold text-sm">2</span>
                    </div>
                    <h3 className="font-semibold text-xl text-gray-900">Seleccionar Material</h3>
                  </div>
                  
                  {/* Table header */}
                  <div className="grid grid-cols-2 gap-2 mb-2 pb-2 border-b border-gray-200">
                    <div className="text-sm font-semibold text-gray-700">Nombre del material</div>
                    <div className="text-sm font-semibold text-gray-700 text-right">Pendiente</div>
                  </div>
                  
                  {/* Table rows */}
                  <div className="space-y-2">
                    {receptionItems
                      .filter(item => item.pendingQuantity > 0)
                      .map((item) => (
                        <button
                          key={item.materialId}
                          onClick={() => handleMaterialSelection(item.materialId)}
                          className="grid grid-cols-2 gap-2 w-full text-left hover:bg-purple-50 active:bg-purple-100 rounded-lg p-3 transition-all duration-200 active:scale-[0.99] min-h-[44px]"
                        >
                          <div className="font-medium text-gray-900 truncate pr-2">{item.materialName}</div>
                          <div className="font-semibold text-yellow-600 text-right">{item.pendingQuantity} {item.materialUnit}</div>
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Confirm reception */}
            {truck && selectedMaterialId && (
              <div className="space-y-4">
                {/* Truck card with back button */}
                <div className="card-mobile bg-green-50 border-green-200 relative">
                  <button
                    onClick={() => {
                      setSelectedMaterialId('');
                    }}
                    className="absolute top-4 right-4 text-green-600 p-2 rounded-full hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-semibold text-green-800">Camión {truck?.placas}</div>
                      <div className="text-sm text-green-600">Volumen: {truck?.volume || 'N/A'} M³</div>
                    </div>
                  </div>
                </div>

                {receptionItems.filter(item => item.materialId === selectedMaterialId).map((item) => (
                  <div key={item.materialId} className="card-mobile">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-purple-600 font-bold text-sm">3</span>
                      </div>
                      <h3 className="font-semibold text-xl text-gray-900">Confirmar Recepción</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <div className="font-semibold text-lg text-gray-900 mb-3">{item.materialName}</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-gray-600 text-xs mb-1">Volumen Camión:</div>
                            <div className="font-bold text-lg text-blue-600">{truck?.volume || 'N/A'} {item.materialUnit}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3">
                            <div className="text-gray-600 text-xs mb-1">Pendiente:</div>
                            <div className="font-bold text-lg text-gray-900">{item.pendingQuantity} {item.materialUnit}</div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-gray-200 pt-4">
                        <div className="font-semibold text-gray-700 mb-3">Cantidad a Recibir:</div>
                        <div className="text-3xl font-bold text-green-600 mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {item.currentReceived} {item.materialUnit}
                        </div>

                        {item.currentReceived > 0 && (
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-sm font-semibold text-gray-700 mb-3">Después de esta recepción:</div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-gray-500 text-xs mb-1">Total Recibido:</div>
                                <div className="font-bold text-lg">{item.totalReceived}</div>
                              </div>
                              <div className="bg-white rounded-lg p-3">
                                <div className="text-gray-500 text-xs mb-1">Quedará Pendiente:</div>
                                <div className="font-bold text-lg text-yellow-600">{item.pendingQuantity}</div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setSelectedMaterialId('');
                          setTruck(null);
                          setTruckCode('');
                        }}
                        className="btn-mobile btn-secondary w-full text-lg py-4"
                      >
                        Cambiar Material
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fixed footer with action button - only show when ready to submit */}
          {truck && selectedMaterialId && (
            <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-mobile">
              <div className="container-mobile mx-auto flex space-x-4">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setTruck(null);
                    setTruckCode('');
                    setSelectedMaterialId('');
                  }}
                  className="btn-mobile btn-secondary flex-1 text-lg py-4"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleReception}
                  disabled={submitting || !receptionItems.some(item => item.currentReceived > 0)}
                  className="btn-mobile btn-green-500 flex-1 text-lg py-4 disabled:opacity-50"
                >
                  {submitting ? 'Registrando...' : 'Confirmar Recepción'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}