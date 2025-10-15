
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Location } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Link from 'next/link';
import Modal from '@/components/ui/Modal';
import LocationForm from '@/components/admin/LocationForm';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const LOCATIONS_COLLECTION = 'locations';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Location>(LOCATIONS_COLLECTION);
      setLocations(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las ubicaciones. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleAddNew = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLocation) return;
    
    try {
      setDeleting(true);
      await deleteDocument(LOCATIONS_COLLECTION, selectedLocation.id);
      await fetchLocations();
      setIsDeleteModalOpen(false);
      setSelectedLocation(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la ubicación.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (location: Location) => {
    setSelectedLocation(location);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedLocation(null);
  };

  // Filter locations based on search query
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    location.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (data: Omit<Location, 'id' | 'createdAt'>) => {
    try {
      if (editingLocation) {
        await updateDocument(LOCATIONS_COLLECTION, editingLocation.id, data);
      } else {
        await addDocument(LOCATIONS_COLLECTION, data);
      }
      await fetchLocations();
      setIsModalOpen(false);
      setEditingLocation(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la ubicación.');
    }
  };

  // Define columns for the DataTable
  const columns: Column<Location>[] = [
    {
      key: 'id',
      label: 'ID',
      render: (value) => (
        <Link
          href={`/admin/locations/${value}`}
          className="font-mono text-sm text-green-600 hover:text-green-800"
        >
          {value}
        </Link>
      )
    },
    {
      key: 'name',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'address',
      label: 'Dirección'
    },
    {
      key: 'id' as keyof Location,
      label: 'Acciones',
      render: (_, location) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(location)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(location)}
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
            placeholder="Buscar por nombre, dirección o ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} className="w-full">
            Nueva Ubicación
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredLocations}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay ubicaciones que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLocation ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
      >
        <LocationForm
          location={editingLocation}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Ubicación"
        message={`¿Estás seguro de que quieres eliminar la ubicación "${selectedLocation?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
