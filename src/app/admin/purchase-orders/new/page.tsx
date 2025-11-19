'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCollection, addDocument } from '@/lib/firebase/firestore';
import { Supplier, Material, Location, PurchaseOrder, PurchaseOrderItem } from '@/models/types';
import { SUPPLIERS_COLLECTION, MATERIALS_COLLECTION, LOCATIONS_COLLECTION, PURCHASE_ORDERS_COLLECTION } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';

interface OrderItem {
  materialId: string;
  materialName: string;
  materialUnit: string;
  quantity: number;
}

export default function NewPurchaseOrderPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { userProfile } = useAuth();

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
  }, []);

  const loadData = async () => {
    try {
      const [suppliersData, materialsData, locationsData] = await Promise.all([
        getCollection<Supplier>(SUPPLIERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION)
      ]);

      setSuppliers(suppliersData);
      setMaterials(materialsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading data:', error);
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
        materialName: material.nombreParaMostrar,
        materialUnit: material.unidadNombre || '',
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

  const generateOrderNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `PO-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierId || formData.deliveryLocationIds.length === 0 || orderItems.length === 0 || !userProfile) {
      alert('Por favor completa todos los campos requeridos y agrega al menos un producto y una ubicación');
      return;
    }

    setSubmitting(true);

    try {
      const supplier = suppliers.find(s => s.id === formData.supplierId);
      const selectedLocations = locations.filter(l => formData.deliveryLocationIds.includes(l.id));

      if (!supplier || selectedLocations.length === 0) {
        throw new Error('Proveedor o ubicaciones no encontrados');
      }

      const purchaseOrderItems: PurchaseOrderItem[] = orderItems.map(item => ({
        materialId: item.materialId,
        materialName: item.materialName,
        materialUnit: item.materialUnit,
        orderedQuantity: item.quantity,
        receivedQuantity: 0,
        pendingQuantity: item.quantity
      }));

      const deliveryLocationNames = selectedLocations.map(l => l.name).join(', ');

      const purchaseOrder: Omit<PurchaseOrder, 'id' | 'createdAt'> = {
        orderNumber: generateOrderNumber(),
        supplierId: formData.supplierId,
        supplierName: supplier.name,
        deliveryLocationIds: formData.deliveryLocationIds,
        deliveryLocationNames: deliveryLocationNames,
        items: purchaseOrderItems,
        status: 'PENDING',
        orderDate: Timestamp.now(),
        createdBy: userProfile.id,
        createdByName: userProfile.username
      };

      await addDocument(PURCHASE_ORDERS_COLLECTION, purchaseOrder);
      router.push('/admin/purchase-orders');
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('Error al crear la orden de compra');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8">Cargando datos...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Nueva Orden de Compra</h2>
        <Button
          variant="ghost"
          onClick={() => router.push('/admin/purchase-orders')}
        >
          ← Volver a Órdenes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#38A169] focus:ring-[#38A169] sm:text-sm border px-3 py-2"
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

        {/* Add Items */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Agregar Productos</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label htmlFor="materialId" className="block text-sm font-medium text-gray-700">
                Material
              </label>
              <select
                id="materialId"
                value={newItem.materialId}
                onChange={(e) => setNewItem(prev => ({ ...prev, materialId: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#38A169] focus:ring-[#38A169] sm:text-sm border px-3 py-2"
              >
                <option value="">Selecciona un material</option>
                {materials.map(material => (
                  <option key={material.id} value={material.id}>
                    {material.nombreParaMostrar} ({material.unidadNombre})
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#38A169] focus:ring-[#38A169] sm:text-sm border px-3 py-2"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={addItem}
                disabled={!newItem.materialId || newItem.quantity <= 0}
                className="w-full"
              >
                Agregar
              </Button>
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
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:border-[#38A169] focus:ring-[#38A169]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.materialId)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push('/admin/purchase-orders')}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={submitting}
            disabled={orderItems.length === 0}
          >
            Crear Orden de Compra
          </Button>
        </div>
      </form>
    </div>
  );
}