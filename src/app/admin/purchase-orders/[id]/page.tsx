'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getDocument, updateDocument, deleteDocument, getCollection } from '@/lib/firebase/firestore';
import { PurchaseOrder, Supplier, Material, Location, PurchaseOrderItem } from '@/models/types';
import { PURCHASE_ORDERS_COLLECTION, SUPPLIERS_COLLECTION, MATERIALS_COLLECTION, LOCATIONS_COLLECTION } from '@/lib/firebase/firestore';

interface OrderItem {
  materialId: string;
  materialName: string;
  materialUnit: string;
  quantity: number;
}

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<PurchaseOrder | null>(null);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    supplierId: '',
    deliveryLocationIds: [] as string[]
  });

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [newItem, setNewItem] = useState({
    materialId: '',
    quantity: 0
  });

  useEffect(() => {
    loadData();
  }, [orderId]);

  const loadData = async () => {
    try {
      const [orderData, suppliersData, materialsData, locationsData] = await Promise.all([
        getDocument<PurchaseOrder>(PURCHASE_ORDERS_COLLECTION, orderId),
        getCollection<Supplier>(SUPPLIERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION)
      ]);

      if (!orderData) {
        alert('Orden de compra no encontrada');
        router.push('/admin/purchase-orders');
        return;
      }

      setOrder(orderData);
      setSuppliers(suppliersData);
      setMaterials(materialsData);
      setLocations(locationsData);

      // Initialize form data
      setFormData({
        supplierId: orderData.supplierId,
        deliveryLocationIds: orderData.deliveryLocationIds
      });

      // Initialize order items
      const items: OrderItem[] = orderData.items.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        materialUnit: item.materialUnit,
        quantity: item.orderedQuantity
      }));
      setOrderItems(items);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Error al cargar la orden de compra');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      supplierId: e.target.value
    }));
  };

  const toggleLocation = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryLocationIds: prev.deliveryLocationIds.includes(locationId)
        ? prev.deliveryLocationIds.filter(id => id !== locationId)
        : [...prev.deliveryLocationIds, locationId]
    }));
  };

  const addItem = () => {
    if (!newItem.materialId || newItem.quantity <= 0) return;

    const material = materials.find(m => m.id === newItem.materialId);
    if (!material) return;

    // Check if material already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.materialId === newItem.materialId);

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += newItem.quantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const orderItem: OrderItem = {
        materialId: newItem.materialId,
        materialName: material.name,
        materialUnit: material.unit,
        quantity: newItem.quantity
      };
      setOrderItems([...orderItems, orderItem]);
    }

    // Reset form
    setNewItem({ materialId: '', quantity: 0 });
  };

  const removeItem = (materialId: string) => {
    setOrderItems(orderItems.filter(item => item.materialId !== materialId));
  };

  const updateItemQuantity = (materialId: string, quantity: number) => {
    setOrderItems(orderItems.map(item =>
      item.materialId === materialId ? { ...item, quantity } : item
    ));
  };

  const handleUpdate = async () => {
    if (!order || !formData.supplierId || formData.deliveryLocationIds.length === 0 || orderItems.length === 0) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSubmitting(true);

    try {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      const selectedLocations = locations.filter(l => formData.deliveryLocationIds.includes(l.id));

      if (!supplier || selectedLocations.length === 0) {
        throw new Error('Proveedor o ubicaciones no encontrados');
      }

      const purchaseOrderItems: PurchaseOrderItem[] = orderItems.map(item => {
        // Find existing item to preserve received quantities
        const existingItem = order.items.find(oi => oi.materialId === item.materialId);
        const receivedQuantity = existingItem?.receivedQuantity || 0;

        return {
          materialId: item.materialId,
          materialName: item.materialName,
          materialUnit: item.materialUnit,
          orderedQuantity: item.quantity,
          receivedQuantity: receivedQuantity,
          pendingQuantity: item.quantity - receivedQuantity
        };
      });

      const deliveryLocationNames = selectedLocations.map(l => l.name).join(', ');

      await updateDocument(PURCHASE_ORDERS_COLLECTION, orderId, {
        supplierId: formData.supplierId,
        supplierName: supplier.name,
        deliveryLocationIds: formData.deliveryLocationIds,
        deliveryLocationNames: deliveryLocationNames,
        items: purchaseOrderItems
      });

      alert('Orden de compra actualizada exitosamente');
      setIsEditing(false);
      loadData(); // Reload to get fresh data
    } catch (error) {
      console.error('Error updating purchase order:', error);
      alert('Error al actualizar la orden de compra');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;

    const confirmed = confirm(`¿Está seguro de eliminar la orden ${order.orderNumber}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    setSubmitting(true);

    try {
      await deleteDocument(PURCHASE_ORDERS_COLLECTION, orderId);
      alert('Orden de compra eliminada exitosamente');
      router.push('/admin/purchase-orders');
    } catch (error) {
      console.error('Error deleting purchase order:', error);
      alert('Error al eliminar la orden de compra');
      setSubmitting(false);
    }
  };

  const cancelEdit = () => {
    if (!order) return;

    // Reset form data to original values
    setFormData({
      supplierId: order.supplierId,
      deliveryLocationIds: order.deliveryLocationIds
    });

    // Reset order items
    const items: OrderItem[] = order.items.map(item => ({
      materialId: item.materialId,
      materialName: item.materialName,
      materialUnit: item.materialUnit,
      quantity: item.orderedQuantity
    }));
    setOrderItems(items);

    setIsEditing(false);
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8">Cargando orden de compra...</div>;
  }

  if (!order) {
    return <div className="p-8">Orden de compra no encontrada</div>;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditing ? 'Editar Orden de Compra' : 'Detalles de Orden de Compra'}
          </h1>
          <div className="flex items-center space-x-3">
            <span className="text-lg text-gray-600">{order.orderNumber}</span>
            {getStatusBadge(order.status)}
          </div>
        </div>
        <button
          onClick={() => router.push('/admin/purchase-orders')}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Volver a Órdenes
        </button>
      </div>

      {!isEditing ? (
        // View Mode
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Proveedor</label>
                <p className="mt-1 text-lg text-gray-900">{order.supplierName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Fecha de Orden</label>
                <p className="mt-1 text-lg text-gray-900">{order.orderDate.toDate().toLocaleDateString()}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-500">Ubicaciones de Entrega</label>
                <p className="mt-1 text-lg text-gray-900">{order.deliveryLocationNames}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Creado por</label>
                <p className="mt-1 text-lg text-gray-900">{order.createdByName}</p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ordenado</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Recibido</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Progreso</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items.map((item) => {
                    const progress = (item.receivedQuantity / item.orderedQuantity) * 100;
                    return (
                      <tr key={item.materialId}>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">{item.materialName}</td>
                        <td className="px-4 py-4 text-sm text-gray-500">{item.materialUnit}</td>
                        <td className="px-4 py-4 text-sm text-gray-900 text-right">{item.orderedQuantity}</td>
                        <td className="px-4 py-4 text-sm text-green-600 text-right font-medium">{item.receivedQuantity}</td>
                        <td className="px-4 py-4 text-sm text-yellow-600 text-right font-medium">{item.pendingQuantity}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center">
                            <div className="w-full max-w-xs bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="ml-2 text-xs text-gray-600">{Math.round(progress)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center space-x-3">
            <button
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Eliminar Orden
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Editar Orden
            </button>
          </div>
        </div>
      ) : (
        // Edit Mode
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Información Básica</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="supplierId" className="block text-sm font-medium text-gray-700">
                  Proveedor *
                </label>
                <select
                  id="supplierId"
                  name="supplierId"
                  required
                  value={formData.supplierId}
                  onChange={handleSupplierChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                >
                  <option value="">Selecciona un proveedor</option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ubicaciones de Entrega * (Seleccione una o más)
              </label>
              <div className="border border-gray-300 rounded-md p-3 space-y-2 max-h-60 overflow-y-auto">
                {locations.map(location => (
                  <label key={location.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.deliveryLocationIds.includes(location.id)}
                      onChange={() => toggleLocation(location.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900">
                      {location.name} - {location.address}
                    </span>
                  </label>
                ))}
              </div>
              {formData.deliveryLocationIds.length > 0 && (
                <p className="mt-2 text-sm text-gray-600">
                  {formData.deliveryLocationIds.length} ubicación(es) seleccionada(s)
                </p>
              )}
            </div>
          </div>

          {/* Add/Edit Items */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Productos</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">
                  Material
                </label>
                <select
                  id="materialId"
                  value={newItem.materialId}
                  onChange={(e) => setNewItem(prev => ({ ...prev, materialId: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                >
                  <option value="">Selecciona un material</option>
                  {materials.map(material => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                  Cantidad
                </label>
                <input
                  type="number"
                  id="quantity"
                  min="0.01"
                  step="0.01"
                  value={newItem.quantity || ''}
                  onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) || 0 }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border px-3 py-2"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={addItem}
                  disabled={!newItem.materialId || newItem.quantity <= 0}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Agregar
                </button>
              </div>
            </div>

            {/* Items List */}
            {orderItems.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Productos en la Orden</h3>
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div key={item.materialId} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                      <div className="flex-1">
                        <span className="font-medium">{item.materialName}</span>
                        <span className="text-gray-500 ml-2">({item.materialUnit})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={item.quantity}
                          onChange={(e) => updateItemQuantity(item.materialId, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.materialId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Edit Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdate}
              disabled={submitting || orderItems.length === 0}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
