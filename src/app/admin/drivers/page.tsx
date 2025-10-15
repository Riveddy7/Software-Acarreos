
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Driver } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import Modal from '@/components/ui/Modal';
import DriverForm from '@/components/admin/DriverForm';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const DRIVERS_COLLECTION = 'drivers';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Driver>(DRIVERS_COLLECTION);
      setDrivers(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los choferes. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleAddNew = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedDriver) return;
    
    try {
      setDeleting(true);
      await deleteDocument(DRIVERS_COLLECTION, selectedDriver.id);
      await fetchDrivers();
      setIsDeleteModalOpen(false);
      setSelectedDriver(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el chofer.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedDriver(null);
  };

  // Filter drivers based on search query
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (data: Omit<Driver, 'id' | 'createdAt'>) => {
    try {
      if (editingDriver) {
        await updateDocument(DRIVERS_COLLECTION, editingDriver.id, data);
      } else {
        await addDocument(DRIVERS_COLLECTION, data);
      }
      await fetchDrivers();
      setIsModalOpen(false);
      setEditingDriver(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el chofer.');
    }
  };

  // Define columns for the DataTable
  const columns: Column<Driver>[] = [
    {
      key: 'id',
      label: 'ID del Activo',
      render: (value) => (
        <Link href={`/admin/drivers/${value}`} className="font-mono text-sm text-green-600 hover:text-green-800">
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
      key: 'licenseNumber',
      label: 'Licencia'
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
      key: 'id' as keyof Driver,
      label: 'Acciones',
      render: (_, driver) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(driver)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(driver)}
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
            placeholder="Buscar por nombre, licencia o ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} className="w-full">
            Nuevo Chofer
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredDrivers}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay choferes que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? 'Editar Chofer' : 'Agregar Nuevo Chofer'}
      >
        <DriverForm
          driver={editingDriver}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Chofer"
        message={`¿Estás seguro de que quieres eliminar al chofer "${selectedDriver?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
