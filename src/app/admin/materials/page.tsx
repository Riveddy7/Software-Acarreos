
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Material } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import Modal from '@/components/ui/Modal';
import MaterialForm from '@/components/admin/MaterialForm';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

const MATERIALS_COLLECTION = 'materials';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Material>(MATERIALS_COLLECTION);
      setMaterials(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los materiales. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleAddNew = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMaterial) return;
    
    try {
      setDeleting(true);
      await deleteDocument(MATERIALS_COLLECTION, selectedMaterial.id);
      await fetchMaterials();
      setIsDeleteModalOpen(false);
      setSelectedMaterial(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el material.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (material: Material) => {
    setSelectedMaterial(material);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedMaterial(null);
  };

  // Filter materials based on search query
  const filteredMaterials = materials.filter(material =>
    material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
    material.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (data: Omit<Material, 'id' | 'createdAt'>) => {
    try {
      if (editingMaterial) {
        await updateDocument(MATERIALS_COLLECTION, editingMaterial.id, data);
      } else {
        await addDocument(MATERIALS_COLLECTION, data);
      }
      await fetchMaterials();
      setIsModalOpen(false);
      setEditingMaterial(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el material.');
    }
  };

  // Define columns for the DataTable
  const columns: Column<Material>[] = [
    {
      key: 'id',
      label: 'ID del Activo',
      render: (value) => (
        <Link href={`/admin/materials/${value}`} className="font-mono text-sm text-green-600 hover:text-green-800">
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
      key: 'unit',
      label: 'Unidad'
    },
    {
      key: 'id',
      label: 'Código QR',
      render: (value) => (
        <QrCodeDisplay value={value} />
      )
    },
    {
      key: 'id' as keyof Material,
      label: 'Acciones',
      render: (_, material) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(material)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(material)}
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
            placeholder="Buscar por nombre, unidad o ID..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} className="w-full">
            Nuevo Material
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredMaterials}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay materiales que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Editar Material' : 'Agregar Nuevo Material'}
      >
        <MaterialForm
          material={editingMaterial}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Material"
        message={`¿Estás seguro de que quieres eliminar el material "${selectedMaterial?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
