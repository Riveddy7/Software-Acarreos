
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Company } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { Column } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useCompany } from '@/contexts/CompanyContext';

import CompanyForm from '@/components/admin/CompanyForm';

const COMPANIES_COLLECTION = 'companies';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { companyId } = useCompany();

  const fetchCompanies = useCallback(async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const data = await getCollection<Company>(COMPANIES_COLLECTION, companyId);
      setCompanies(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las empresas. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (companyId) {
      fetchCompanies();
    }
  }, [companyId, fetchCompanies]);

  const handleAddNew = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCompany) return;
    
    try {
      setDeleting(true);
      await deleteDocument(COMPANIES_COLLECTION, selectedCompany.id);
      await fetchCompanies();
      setIsDeleteModalOpen(false);
      setSelectedCompany(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la empresa.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCompany(null);
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = async (data: Omit<Company, 'id' | 'createdAt'>) => {
    if (!companyId) return;
    try {
      if (editingCompany) {
        await updateDocument(COMPANIES_COLLECTION, editingCompany.id, data);
      } else {
        await addDocument(COMPANIES_COLLECTION, data, companyId);
      }
      await fetchCompanies();
      setIsModalOpen(false);
      setEditingCompany(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la empresa.');
    }
  };

  const columns: Column<Company>[] = [
    {
      key: 'name',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'id' as keyof Company,
      label: 'Acciones',
      render: (_, company) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(company)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(company)}
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
          <Button onClick={handleAddNew} className="w-full">
            Nueva Empresa
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredCompanies}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay empresas que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCompany ? 'Editar Empresa' : 'Agregar Nueva Empresa'}
      >
        <CompanyForm
          company={editingCompany}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Empresa"
        message={`¿Estás seguro de que quieres eliminar la empresa "${selectedCompany?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}
