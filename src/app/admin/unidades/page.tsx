'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Unidad } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const UNIDADES_COLLECTION = 'unidades';

interface UnidadFormProps {
  unidad?: Unidad | null;
  onSave: (data: Omit<Unidad, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function UnidadForm({ unidad, onSave, onCancel }: UnidadFormProps) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [activo, setActivo] = useState(true);

  useEffect(() => {
    if (unidad) {
      setNombre(unidad.nombre);
      setDescripcion(unidad.descripcion || '');
      setActivo(unidad.activo);
    } else {
      setNombre('');
      setDescripcion('');
      setActivo(true);
    }
  }, [unidad]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre) {
      alert('Por favor, ingrese el nombre de la unidad.');
      return;
    }
    onSave({ nombre, descripcion, activo });
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
            placeholder="Ej: Metro cúbico (m³)"
            required
          />
        </div>
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Descripción de la unidad..."
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

export default function UnidadesPage() {
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnidad, setEditingUnidad] = useState<Unidad | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUnidad, setSelectedUnidad] = useState<Unidad | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUnidades = useCallback(async () => {
    try {
      setIsLoading(true);
      const unidadesData = await getCollection<Unidad>(UNIDADES_COLLECTION);
      setUnidades(unidadesData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las unidades. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnidades();
  }, [fetchUnidades]);

  const handleAddNew = () => {
    setEditingUnidad(null);
    setIsModalOpen(true);
  };

  const handleEdit = (unidad: Unidad) => {
    setEditingUnidad(unidad);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedUnidad) return;
    
    try {
      setDeleting(true);
      await deleteDocument(UNIDADES_COLLECTION, selectedUnidad.id);
      await fetchUnidades();
      setIsDeleteModalOpen(false);
      setSelectedUnidad(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la unidad.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (unidad: Unidad) => {
    setSelectedUnidad(unidad);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedUnidad(null);
  };

  const filteredUnidades = unidades.filter(unidad =>
    unidad.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (unidad.descripcion?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSave = async (unidadData: Omit<Unidad, 'id' | 'createdAt'>) => {
    try {
      if (editingUnidad) {
        await updateDocument(UNIDADES_COLLECTION, editingUnidad.id, unidadData);
      } else {
        await addDocument(UNIDADES_COLLECTION, unidadData);
      }
      await fetchUnidades();
      setIsModalOpen(false);
      setEditingUnidad(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la unidad.');
    }
  };

  const columns: Column<Unidad>[] = [
    {
      key: 'nombre',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
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
      key: 'id' as keyof Unidad,
      label: 'Acciones',
      render: (_, unidad) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(unidad)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(unidad)}
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
            placeholder="Buscar por nombre o descripción..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nueva Unidad
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredUnidades}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay unidades que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUnidad ? 'Editar Unidad' : 'Agregar Nueva Unidad'}
      >
        <UnidadForm
          unidad={editingUnidad}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Unidad"
        message={`¿Estás seguro de que quieres eliminar la unidad "${selectedUnidad?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}