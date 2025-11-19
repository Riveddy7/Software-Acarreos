'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Transportista } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const TRANSPORTISTAS_COLLECTION = 'transportistas';

interface TransportistaFormProps {
  transportista?: Transportista | null;
  onSave: (data: Omit<Transportista, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function TransportistaForm({ transportista, onSave, onCancel }: TransportistaFormProps) {
  const [nombre, setNombre] = useState('');
  const [contacto, setContacto] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [direccion, setDireccion] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (transportista) {
      setNombre(transportista.nombre);
      setContacto(transportista.contacto || '');
      setTelefono(transportista.telefono || '');
      setEmail(transportista.email || '');
      setDireccion(transportista.direccion || '');
      setActivo(transportista.activo);
    } else {
      setNombre('');
      setContacto('');
      setTelefono('');
      setEmail('');
      setDireccion('');
      setActivo(true);
    }
  }, [transportista]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      alert('Por favor, ingrese el nombre del transportista.');
      return;
    }
    onSave({ nombre, contacto, telefono, email, direccion, activo });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Transportes XYZ"
            required
          />
        </div>
        <div>
          <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
          <input
            type="text"
            id="contacto"
            value={contacto}
            onChange={(e) => setContacto(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            id="telefono"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: 555-123-4567"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: contacto@transportesxyz.com"
          />
        </div>
        <div>
          <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
          <textarea
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Calle Principal #123, Ciudad, Estado"
          />
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="activo"
            checked={activo}
            onChange={(e) => setActivo(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="activo" className="ml-2 block text-sm text-gray-900">
            Activo
          </label>
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

export default function TransportistasPage() {
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransportista, setEditingTransportista] = useState<Transportista | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTransportista, setSelectedTransportista] = useState<Transportista | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTransportistas = useCallback(async () => {
    try {
      setIsLoading(true);
      const transportistasData = await getCollection<Transportista>(TRANSPORTISTAS_COLLECTION);
      setTransportistas(transportistasData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los transportistas. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransportistas();
  }, [fetchTransportistas]);

  const handleAddNew = () => {
    setEditingTransportista(null);
    setIsModalOpen(true);
  };

  const handleEdit = (transportista: Transportista) => {
    setEditingTransportista(transportista);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTransportista) return;
    
    try {
      setDeleting(true);
      await deleteDocument(TRANSPORTISTAS_COLLECTION, selectedTransportista.id);
      await fetchTransportistas();
      setIsDeleteModalOpen(false);
      setSelectedTransportista(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el transportista.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (transportista: Transportista) => {
    setSelectedTransportista(transportista);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTransportista(null);
  };

  const filteredTransportistas = transportistas.filter(transportista =>
    transportista.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transportista.contacto?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transportista.telefono?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transportista.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (transportistaData: Omit<Transportista, 'id' | 'createdAt'>) => {
    try {
      if (editingTransportista) {
        await updateDocument(TRANSPORTISTAS_COLLECTION, editingTransportista.id, transportistaData);
      } else {
        await addDocument(TRANSPORTISTAS_COLLECTION, transportistaData);
      }
      await fetchTransportistas();
      setIsModalOpen(false);
      setEditingTransportista(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el transportista.');
    }
  };

  const columns: Column<Transportista>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'contacto',
      label: 'Contacto',
      render: (value) => value || 'N/A'
    },
    {
      key: 'telefono',
      label: 'Teléfono',
      render: (value) => value || 'N/A'
    },
    {
      key: 'email',
      label: 'Email',
      render: (value) => value || 'N/A'
    },
    {
      key: 'activo',
      label: 'Estatus',
      render: (value) => (
        <StatusBadge
          status={value ? 'ACTIVO' : 'INACTIVO'}
        />
      )
    },
    {
      key: 'id' as keyof Transportista,
      label: 'Acciones',
      render: (_, transportista) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(transportista)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(transportista)}
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
            placeholder="Buscar por nombre, contacto, teléfono o email..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nuevo Transportista
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredTransportistas}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay transportistas que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransportista ? 'Editar Transportista' : 'Agregar Nuevo Transportista'}
      >
        <TransportistaForm
          transportista={editingTransportista}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Transportista"
        message={`¿Estás seguro de que quieres eliminar el transportista "${selectedTransportista?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}