
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Truck } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import Modal from '@/components/ui/Modal';
import TruckForm from '@/components/admin/TruckForm';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const TRUCKS_COLLECTION = 'trucks';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState<Truck | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTrucks = useCallback(async () => {
    try {
      setIsLoading(true);
      const trucksData = await getCollection<Truck>(TRUCKS_COLLECTION);
      setTrucks(trucksData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los camiones. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  const handleAddNew = () => {
    setEditingTruck(null);
    setIsModalOpen(true);
  };

  const handleEdit = (truck: Truck) => {
    setEditingTruck(truck);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedTruck) return;
    
    try {
      setDeleting(true);
      await deleteDocument(TRUCKS_COLLECTION, selectedTruck.id);
      await fetchTrucks(); // Refetch data
      setIsDeleteModalOpen(false);
      setSelectedTruck(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el camión.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (truck: Truck) => {
    setSelectedTruck(truck);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedTruck(null);
  };

  // Filter trucks based on search query
  const filteredTrucks = trucks.filter(truck =>
    truck.plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    truck.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    truck.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (truckData: Omit<Truck, 'id' | 'createdAt'>) => {
    try {
      if (editingTruck) {
        await updateDocument(TRUCKS_COLLECTION, editingTruck.id, truckData);
      } else {
        await addDocument(TRUCKS_COLLECTION, truckData);
      }
      await fetchTrucks(); // Refetch data
      setIsModalOpen(false);
      setEditingTruck(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el camión.');
    }
  };

  // Define columns for the DataTable
  const columns: Column<Truck>[] = [
    {
      key: 'id',
      label: 'ID del Activo',
      render: (value) => (
        <Link href={`/admin/trucks/${value}`} className="font-mono text-sm text-green-600 hover:text-green-800 hover:underline">
          {value}
        </Link>
      )
    },
    {
      key: 'plate',
      label: 'Placa',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'model',
      label: 'Modelo'
    },
    {
      key: 'volume',
      label: 'Volumen (M³)',
      render: (value) => value || 'N/A'
    },
    {
      key: 'status',
      label: 'Estado',
      render: (value) => (
        <StatusBadge
          status={value === 'IN_SHIPMENT' ? 'EN_TRANSITO' : 'COMPLETED'}
        />
      )
    },
    {
      key: 'id',
      label: 'Código QR',
      render: (value) => (
        <QrCodeDisplay value={value} />
      )
    },
    {
      key: 'id' as keyof Truck,
      label: 'Acciones',
      render: (_, truck) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(truck)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(truck)}
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
            placeholder="Buscar por placa, modelo o ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} className="w-full">
            Nuevo Camión
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredTrucks}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay camiones que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTruck ? 'Editar Camión' : 'Agregar Nuevo Camión'}
      >
        <TruckForm
          truck={editingTruck}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Camión"
        message={`¿Estás seguro de que quieres eliminar el camión con placa "${selectedTruck?.plate}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
