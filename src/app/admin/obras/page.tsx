'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Obra, Cliente, EmpresaInterna } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const OBRAS_COLLECTION = 'obras';

interface ObraFormProps {
  obra?: Obra | null;
  onSave: (data: Omit<Obra, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function ObraForm({ obra, onSave, onCancel }: ObraFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [idCliente, setIdCliente] = useState('');
  const [estatusActivo, setEstatusActivo] = useState(true);
  const [descripcionNotas, setDescripcionNotas] = useState('');
  const [empresaContratante, setEmpresaContratante] = useState('');
  const [idEmpresaInterna, setIdEmpresaInterna] = useState('');
  
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empresasInternas, setEmpresasInternas] = useState<EmpresaInterna[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesData, empresasInternasData] = await Promise.all([
          getCollection<Cliente>('clientes'),
          getCollection<EmpresaInterna>('empresasInternas')
        ]);
        
        setClientes(clientesData);
        setEmpresasInternas(empresasInternasData);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (obra) {
      setNombreParaMostrar(obra.nombreParaMostrar);
      setIdCliente(obra.idCliente);
      setEstatusActivo(obra.estatusActivo);
      setDescripcionNotas(obra.descripcionNotas || '');
      setEmpresaContratante(obra.empresaContratante || '');
      setIdEmpresaInterna(obra.idEmpresaInterna);
    } else {
      setNombreParaMostrar('');
      setIdCliente('');
      setEstatusActivo(true);
      setDescripcionNotas('');
      setEmpresaContratante('');
      setIdEmpresaInterna('');
    }
  }, [obra]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar || !idCliente || !idEmpresaInterna) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    onSave({ 
      nombreParaMostrar, 
      idCliente, 
      estatusActivo, 
      descripcionNotas, 
      empresaContratante, 
      idEmpresaInterna 
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando datos del formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombreParaMostrar" className="block text-sm font-medium text-gray-700 mb-1">Nombre para mostrar *</label>
            <input
              type="text"
              id="nombreParaMostrar"
              value={nombreParaMostrar}
              onChange={(e) => setNombreParaMostrar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Obra Centro Comercial Plaza Mayor"
              required
            />
          </div>
          <div>
            <label htmlFor="empresaContratante" className="block text-sm font-medium text-gray-700 mb-1">Empresa contratante</label>
            <input
              type="text"
              id="empresaContratante"
              value={empresaContratante}
              onChange={(e) => setEmpresaContratante(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Constructora ABC S.A. de C.V."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="idCliente" className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
            <select
              id="idCliente"
              value={idCliente}
              onChange={(e) => setIdCliente(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione un cliente</option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idEmpresaInterna" className="block text-sm font-medium text-gray-700 mb-1">Empresa Interna *</label>
            <select
              id="idEmpresaInterna"
              value={idEmpresaInterna}
              onChange={(e) => setIdEmpresaInterna(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione una empresa interna</option>
              {empresasInternas.map((empresa) => (
                <option key={empresa.id} value={empresa.id}>
                  {empresa.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="descripcionNotas" className="block text-sm font-medium text-gray-700 mb-1">Descripción o notas</label>
          <textarea
            id="descripcionNotas"
            value={descripcionNotas}
            onChange={(e) => setDescripcionNotas(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Notas adicionales sobre la obra..."
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="estatusActivo"
            checked={estatusActivo}
            onChange={(e) => setEstatusActivo(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="estatusActivo" className="ml-2 block text-sm text-gray-900">
            Estatus activo
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

export default function ObrasPage() {
  const [obras, setObras] = useState<Obra[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<Obra | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchObras = useCallback(async () => {
    try {
      setIsLoading(true);
      const obrasData = await getCollection<Obra>(OBRAS_COLLECTION);
      
      // Fetch related data for denormalization
      const obrasWithRelatedData = await Promise.all(
        obrasData.map(async (obra) => {
          const [cliente, empresaInterna] = await Promise.all([
            getCollection<Cliente>('clientes').then(clientes => 
              clientes.find(c => c.id === obra.idCliente)
            ),
            getCollection<EmpresaInterna>('empresasInternas').then(empresas => 
              empresas.find(e => e.id === obra.idEmpresaInterna)
            )
          ]);
          
          return {
            ...obra,
            clienteNombre: cliente?.nombreParaMostrar,
            empresaInternaNombre: empresaInterna?.nombreParaMostrar
          };
        })
      );
      
      setObras(obrasWithRelatedData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las obras. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchObras();
  }, [fetchObras]);

  const handleAddNew = () => {
    setEditingObra(null);
    setIsModalOpen(true);
  };

  const handleEdit = (obra: Obra) => {
    setEditingObra(obra);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedObra) return;
    
    try {
      setDeleting(true);
      await deleteDocument(OBRAS_COLLECTION, selectedObra.id);
      await fetchObras();
      setIsDeleteModalOpen(false);
      setSelectedObra(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la obra.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (obra: Obra) => {
    setSelectedObra(obra);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedObra(null);
  };

  const filteredObras = obras.filter(obra =>
    (obra.nombreParaMostrar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (obra.empresaContratante?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (obra.clienteNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (obra.empresaInternaNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSave = async (obraData: Omit<Obra, 'id' | 'createdAt'>) => {
    try {
      if (editingObra) {
        await updateDocument(OBRAS_COLLECTION, editingObra.id, obraData);
      } else {
        await addDocument(OBRAS_COLLECTION, obraData);
      }
      await fetchObras();
      setIsModalOpen(false);
      setEditingObra(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la obra.');
    }
  };

  const columns: Column<Obra>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'clienteNombre',
      label: 'Cliente',
      render: (value) => value || 'N/A'
    },
    {
      key: 'empresaInternaNombre',
      label: 'Empresa Interna',
      render: (value) => value || 'N/A'
    },
    {
      key: 'empresaContratante',
      label: 'Empresa Contratante',
      render: (value) => value || 'N/A'
    },
    {
      key: 'estatusActivo',
      label: 'Estatus',
      render: (value) => (
        <StatusBadge
          status={value ? 'ACTIVO' : 'INACTIVO'}
        />
      )
    },
    {
      key: 'id' as keyof Obra,
      label: 'Acciones',
      render: (_, obra) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(obra)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(obra)}
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
            placeholder="Buscar por nombre, cliente, empresa contratante o empresa interna..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nueva Obra
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredObras}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay obras que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingObra ? 'Editar Obra' : 'Agregar Nueva Obra'}
      >
        <ObraForm
          obra={editingObra}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Obra"
        message={`¿Estás seguro de que quieres eliminar la obra "${selectedObra?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}