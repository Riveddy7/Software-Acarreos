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
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8">Cargando proveedores...</div>;
  }

  return (
    <div className="p-8">
      <div className="grid grid-cols-4 gap-4 mb-4 items-center">
        <div className="col-span-3">
          <input
            type="text"
            placeholder="Buscar por nombre de proveedor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 shadow-md shadow-[#2D3748]/30"
          />
        </div>
        <div className="col-span-1 flex justify-end">
          <button
            onClick={openAddModal}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center shadow-md shadow-[#2D3748]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md shadow-[#2D3748]/30 rounded-lg overflow-hidden">
        {filteredSuppliers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay proveedores que coincidan con la búsqueda
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
              {filteredSuppliers.map((supplier) => (
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
                      className="text-green-600 hover:text-green-900 p-1 rounded-full hover:bg-green-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
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