'use client';

import React, { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { Supplier } from '@/models/types';
import { SUPPLIERS_COLLECTION } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import SupplierForm from '@/components/admin/SupplierForm';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      const suppliersData = await getCollection<Supplier>(SUPPLIERS_COLLECTION);
      setSuppliers(suppliersData);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      await addDocument(SUPPLIERS_COLLECTION, supplierData);
      loadSuppliers();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding supplier:', error);
    }
  };

  const handleEditSupplier = async (supplierData: Omit<Supplier, 'id' | 'createdAt'>) => {
    if (!editingSupplier) return;

    try {
      await updateDocument(SUPPLIERS_COLLECTION, editingSupplier.id, supplierData);
      loadSuppliers();
      setIsModalOpen(false);
      setEditingSupplier(null);
    } catch (error) {
      console.error('Error updating supplier:', error);
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      try {
        await deleteDocument(SUPPLIERS_COLLECTION, id);
        loadSuppliers();
      } catch (error) {
        console.error('Error deleting supplier:', error);
      }
    }
  };

  const openEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  if (loading) {
    return <div className="p-8">Cargando proveedores...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
        <button
          onClick={openAddModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Agregar Proveedor
        </button>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {suppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay proveedores registrados
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teléfono
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {suppliers.map((supplier) => (
                <tr key={supplier.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{supplier.name}</div>
                    {supplier.address && (
                      <div className="text-sm text-gray-500">{supplier.address}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.contact || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {supplier.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => openEditModal(supplier)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingSupplier ? 'Editar Proveedor' : 'Agregar Proveedor'}
      >
        <SupplierForm
          supplier={editingSupplier}
          onSubmit={editingSupplier ? handleEditSupplier : handleAddSupplier}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  );
}