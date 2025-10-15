'use client';

import React, { useState, useEffect } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { Supplier } from '@/models/types';
import { SUPPLIERS_COLLECTION } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import SupplierForm from '@/components/admin/SupplierForm';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteSupplier = async () => {
    if (!selectedSupplier) return;
    
    try {
      setDeleting(true);
      await deleteDocument(SUPPLIERS_COLLECTION, selectedSupplier.id);
      loadSuppliers();
      setIsDeleteModalOpen(false);
      setSelectedSupplier(null);
    } catch (error) {
      console.error('Error deleting supplier:', error);
    } finally {
      setDeleting(false);
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

  const openDeleteModal = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedSupplier(null);
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Definir columnas para la tabla
  const columns: Column<Supplier>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value, supplier) => (
        <div>
          <div className="font-medium text-gray-900">{value}</div>
          {supplier.address && (
            <div className="text-sm text-gray-500">{supplier.address}</div>
          )}
        </div>
      )
    },
    {
      key: 'contact',
      label: 'Contacto',
      render: (value) => value || '-'
    },
    {
      key: 'phone',
      label: 'Teléfono',
      render: (value) => value || '-'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || '-'
    },
    {
      key: 'id' as keyof Supplier,
      label: 'Acciones',
      render: (_, supplier) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openEditModal(supplier)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(supplier)}
            className="text-red-600 hover:text-red-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </div>
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
        <div className="md:col-span-3">
          <SearchInput
            placeholder="Buscar por nombre de proveedor..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={openAddModal} className="w-full">
            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />
            </svg>
            Nuevo Proveedor
          </Button>
        </div>
      </div>
      
      <DataTable
        data={filteredSuppliers}
        columns={columns}
        loading={loading}
        emptyMessage="No hay proveedores que coincidan con la búsqueda"
      />
      
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

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteSupplier}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que quieres eliminar el proveedor "${selectedSupplier?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}