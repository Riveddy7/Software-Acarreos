'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { Proveedor } from '@/models/types';
import { SUPPLIERS_COLLECTION } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

interface ProveedorFormProps {
  proveedor?: Proveedor | null;
  onSave: (data: Omit<Proveedor, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function ProveedorForm({ proveedor, onSave, onCancel }: ProveedorFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');

  useEffect(() => {
    if (proveedor) {
      setNombreParaMostrar(proveedor.nombreParaMostrar || '');
    } else {
      setNombreParaMostrar('');
    }
  }, [proveedor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar) {
      alert('Por favor, ingrese el nombre del proveedor.');
      return;
    }
    onSave({ nombreParaMostrar });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="nombreParaMostrar" className="block text-sm font-medium text-gray-700 mb-1">Nombre para mostrar *</label>
          <input
            type="text"
            id="nombreParaMostrar"
            value={nombreParaMostrar}
            onChange={(e) => setNombreParaMostrar(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Constructora ABC S.A. de C.V."
            required
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState<Proveedor | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProveedores = useCallback(async () => {
    try {
      setIsLoading(true);
      const proveedoresData = await getCollection<Proveedor>(SUPPLIERS_COLLECTION);
      setProveedores(proveedoresData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los proveedores. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProveedores();
  }, [fetchProveedores]);

  const handleAddNew = () => {
    setEditingProveedor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (proveedor: Proveedor) => {
    setEditingProveedor(proveedor);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedProveedor) return;
    
    try {
      setDeleting(true);
      await deleteDocument(SUPPLIERS_COLLECTION, selectedProveedor.id);
      await fetchProveedores();
      setIsDeleteModalOpen(false);
      setSelectedProveedor(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el proveedor.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedProveedor(null);
  };

  const filteredProveedores = proveedores.filter(proveedor =>
    proveedor.nombreParaMostrar && proveedor.nombreParaMostrar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (proveedorData: Omit<Proveedor, 'id' | 'createdAt'>) => {
    try {
      if (editingProveedor) {
        await updateDocument(SUPPLIERS_COLLECTION, editingProveedor.id, proveedorData);
      } else {
        await addDocument(SUPPLIERS_COLLECTION, proveedorData);
      }
      await fetchProveedores();
      setIsModalOpen(false);
      setEditingProveedor(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el proveedor.');
    }
  };

  // Definir columnas para la tabla
  const columns: Column<Proveedor>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin nombre'}</span>
      )
    },
    {
      key: 'id' as keyof Proveedor,
      label: 'Acciones',
      render: (_, proveedor) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(proveedor)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(proveedor)}
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

  return (
    <div className="p-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-3">
          <SearchInput
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nuevo Proveedor
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredProveedores}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay proveedores que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProveedor ? 'Editar Proveedor' : 'Agregar Nuevo Proveedor'}
      >
        <ProveedorForm
          proveedor={editingProveedor}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que quieres eliminar el proveedor "${selectedProveedor?.nombreParaMostrar || 'Sin nombre'}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}