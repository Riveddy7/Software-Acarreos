'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { EmpresaInterna } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const EMPRESAS_INTERNAS_COLLECTION = 'empresasInternas';

interface EmpresaInternaFormProps {
  empresa?: EmpresaInterna | null;
  onSave: (data: Omit<EmpresaInterna, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function EmpresaInternaForm({ empresa, onSave, onCancel }: EmpresaInternaFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [razonSocial, setRazonSocial] = useState('');
  const [logo, setLogo] = useState('');

  useEffect(() => {
    if (empresa) {
      setNombreParaMostrar(empresa.nombreParaMostrar);
      setRazonSocial(empresa.razonSocial);
      setLogo(empresa.logo || '');
    } else {
      setNombreParaMostrar('');
      setRazonSocial('');
      setLogo('');
    }
  }, [empresa]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar || !razonSocial) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    onSave({ nombreParaMostrar, razonSocial, logo });
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
            placeholder="Ej: URCONSA"
            required
          />
        </div>
        <div>
          <label htmlFor="razonSocial" className="block text-sm font-medium text-gray-700 mb-1">Razón Social *</label>
          <input
            type="text"
            id="razonSocial"
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: URCONSA S.A. de C.V."
            required
          />
        </div>
        <div>
          <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">Logo (URL)</label>
          <input
            type="url"
            id="logo"
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="https://ejemplo.com/logo.png"
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

export default function EmpresasInternasPage() {
  const [empresas, setEmpresas] = useState<EmpresaInterna[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpresa, setEditingEmpresa] = useState<EmpresaInterna | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaInterna | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmpresas = useCallback(async () => {
    try {
      setIsLoading(true);
      const empresasData = await getCollection<EmpresaInterna>(EMPRESAS_INTERNAS_COLLECTION);
      setEmpresas(empresasData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las empresas internas. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  const handleAddNew = () => {
    setEditingEmpresa(null);
    setIsModalOpen(true);
  };

  const handleEdit = (empresa: EmpresaInterna) => {
    setEditingEmpresa(empresa);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedEmpresa) return;
    
    try {
      setDeleting(true);
      await deleteDocument(EMPRESAS_INTERNAS_COLLECTION, selectedEmpresa.id);
      await fetchEmpresas();
      setIsDeleteModalOpen(false);
      setSelectedEmpresa(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la empresa interna.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (empresa: EmpresaInterna) => {
    setSelectedEmpresa(empresa);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedEmpresa(null);
  };

  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombreParaMostrar.toLowerCase().includes(searchQuery.toLowerCase()) ||
    empresa.razonSocial.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (empresaData: Omit<EmpresaInterna, 'id' | 'createdAt'>) => {
    try {
      if (editingEmpresa) {
        await updateDocument(EMPRESAS_INTERNAS_COLLECTION, editingEmpresa.id, empresaData);
      } else {
        await addDocument(EMPRESAS_INTERNAS_COLLECTION, empresaData);
      }
      await fetchEmpresas();
      setIsModalOpen(false);
      setEditingEmpresa(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la empresa interna.');
    }
  };

  const columns: Column<EmpresaInterna>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'razonSocial',
      label: 'Razón Social',
      render: (value) => (
        <span className="text-gray-700">{value}</span>
      )
    },
    {
      key: 'logo',
      label: 'Logo',
      render: (value) => value ? (
        <img 
          src={value} 
          alt="Logo" 
          className="h-8 w-8 object-contain rounded"
          onError={(e) => {
            e.currentTarget.src = '';
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="text-gray-400">Sin logo</span>
      )
    },
    {
      key: 'id' as keyof EmpresaInterna,
      label: 'Acciones',
      render: (_, empresa) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(empresa)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(empresa)}
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
            placeholder="Buscar por nombre o razón social..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nueva Empresa Interna
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredEmpresas}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay empresas internas que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmpresa ? 'Editar Empresa Interna' : 'Agregar Nueva Empresa Interna'}
      >
        <EmpresaInternaForm
          empresa={editingEmpresa}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Empresa Interna"
        message={`¿Estás seguro de que quieres eliminar la empresa interna "${selectedEmpresa?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}