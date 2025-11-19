'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Cliente } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const CLIENTES_COLLECTION = 'clientes';

interface ClienteFormProps {
  cliente?: Cliente | null;
  onSave: (data: Omit<Cliente, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function ClienteForm({ cliente, onSave, onCancel }: ClienteFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');

  useEffect(() => {
    if (cliente) {
      setNombreParaMostrar(cliente.nombreParaMostrar);
    } else {
      setNombreParaMostrar('');
    }
  }, [cliente]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar) {
      alert('Por favor, ingrese el nombre del cliente.');
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchClientes = useCallback(async () => {
    try {
      setIsLoading(true);
      const clientesData = await getCollection<Cliente>(CLIENTES_COLLECTION);
      setClientes(clientesData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los clientes. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  const handleAddNew = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCliente) return;
    
    try {
      setDeleting(true);
      await deleteDocument(CLIENTES_COLLECTION, selectedCliente.id);
      await fetchClientes();
      setIsDeleteModalOpen(false);
      setSelectedCliente(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el cliente.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCliente(null);
  };

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombreParaMostrar.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (clienteData: Omit<Cliente, 'id' | 'createdAt'>) => {
    try {
      if (editingCliente) {
        await updateDocument(CLIENTES_COLLECTION, editingCliente.id, clienteData);
      } else {
        await addDocument(CLIENTES_COLLECTION, clienteData);
      }
      await fetchClientes();
      setIsModalOpen(false);
      setEditingCliente(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el cliente.');
    }
  };

  const columns: Column<Cliente>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'id' as keyof Cliente,
      label: 'Acciones',
      render: (_, cliente) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(cliente)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(cliente)}
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
            Nuevo Cliente
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredClientes}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay clientes que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCliente ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
      >
        <ClienteForm
          cliente={editingCliente}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que quieres eliminar el cliente "${selectedCliente?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}