'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Operador, Transportista } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

const OPERADORES_COLLECTION = 'operadores';

interface OperadorFormProps {
  operador?: Operador | null;
  onSave: (data: Omit<Operador, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function OperadorForm({ operador, onSave, onCancel }: OperadorFormProps) {
  const [idTransportista, setIdTransportista] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [nombres, setNombres] = useState('');
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const transportistasData = await getCollection<Transportista>('transportistas');
        setTransportistas(transportistasData.filter(t => t.activo));
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (operador) {
      setIdTransportista(operador.idTransportista);
      setApellidoPaterno(operador.apellidoPaterno);
      setApellidoMaterno(operador.apellidoMaterno || '');
      setNombres(operador.nombres);
      setNombreParaMostrar(operador.nombreParaMostrar || '');
    } else {
      setIdTransportista('');
      setApellidoPaterno('');
      setApellidoMaterno('');
      setNombres('');
      setNombreParaMostrar('');
    }
  }, [operador]);

  useEffect(() => {
    // Auto-generate nombreParaMostrar when name parts change
    if (apellidoPaterno || nombres) {
      const fullName = `${apellidoPaterno} ${apellidoMaterno ? apellidoMaterno + ' ' : ''}${nombres}`.trim();
      setNombreParaMostrar(fullName);
    }
  }, [apellidoPaterno, apellidoMaterno, nombres]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idTransportista || !apellidoPaterno || !nombres) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    onSave({ 
      idTransportista, 
      apellidoPaterno, 
      apellidoMaterno, 
      nombres, 
      nombreParaMostrar 
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando datos del formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <div>
          <label htmlFor="idTransportista" className="block text-sm font-medium text-gray-700 mb-1">Transportista *</label>
          <select
            id="idTransportista"
            value={idTransportista}
            onChange={(e) => setIdTransportista(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          >
            <option value="">Seleccione un transportista</option>
            {transportistas.map((transportista) => (
              <option key={transportista.id} value={transportista.id}>
                {transportista.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="apellidoPaterno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Paterno *</label>
            <input
              type="text"
              id="apellidoPaterno"
              value={apellidoPaterno}
              onChange={(e) => setApellidoPaterno(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Pérez"
              required
            />
          </div>
          <div>
            <label htmlFor="apellidoMaterno" className="block text-sm font-medium text-gray-700 mb-1">Apellido Materno</label>
            <input
              type="text"
              id="apellidoMaterno"
              value={apellidoMaterno}
              onChange={(e) => setApellidoMaterno(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: López"
            />
          </div>
          <div>
            <label htmlFor="nombres" className="block text-sm font-medium text-gray-700 mb-1">Nombres *</label>
            <input
              type="text"
              id="nombres"
              value={nombres}
              onChange={(e) => setNombres(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Juan Carlos"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="nombreParaMostrar" className="block text-sm font-medium text-gray-700 mb-1">Nombre para mostrar</label>
          <input
            type="text"
            id="nombreParaMostrar"
            value={nombreParaMostrar}
            onChange={(e) => setNombreParaMostrar(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Se genera automáticamente"
            readOnly
          />
          <p className="text-xs text-gray-500 mt-1">Este campo se genera automáticamente a partir de los nombres</p>
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

export default function OperadoresPage() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOperador, setEditingOperador] = useState<Operador | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedOperador, setSelectedOperador] = useState<Operador | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchOperadores = useCallback(async () => {
    try {
      setIsLoading(true);
      const operadoresData = await getCollection<Operador>(OPERADORES_COLLECTION);
      
      // Fetch related data for denormalization
      const operadoresWithRelatedData = await Promise.all(
        operadoresData.map(async (operador) => {
          const transportista = await getCollection<Transportista>('transportistas').then(transportistas => 
            transportistas.find(t => t.id === operador.idTransportista)
          );
          
          return {
            ...operador,
            transportistaNombre: transportista?.nombre
          };
        })
      );
      
      setOperadores(operadoresWithRelatedData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los operadores. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperadores();
  }, [fetchOperadores]);

  const handleAddNew = () => {
    setEditingOperador(null);
    setIsModalOpen(true);
  };

  const handleEdit = (operador: Operador) => {
    setEditingOperador(operador);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOperador) return;
    
    try {
      setDeleting(true);
      await deleteDocument(OPERADORES_COLLECTION, selectedOperador.id);
      await fetchOperadores();
      setIsDeleteModalOpen(false);
      setSelectedOperador(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el operador.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (operador: Operador) => {
    setSelectedOperador(operador);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedOperador(null);
  };

  const filteredOperadores = operadores.filter(operador =>
    (operador.nombreParaMostrar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (operador.apellidoPaterno?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (operador.apellidoMaterno?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (operador.nombres?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (operador.transportistaNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSave = async (operadorData: Omit<Operador, 'id' | 'createdAt'>) => {
    try {
      if (editingOperador) {
        await updateDocument(OPERADORES_COLLECTION, editingOperador.id, operadorData);
      } else {
        await addDocument(OPERADORES_COLLECTION, operadorData);
      }
      await fetchOperadores();
      setIsModalOpen(false);
      setEditingOperador(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el operador.');
    }
  };

  const columns: Column<Operador>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre Completo',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'transportistaNombre',
      label: 'Transportista',
      render: (value) => value || 'N/A'
    },
    {
      key: 'id',
      label: 'Código QR',
      render: (value) => (
        <Link href={`/admin/operadores/${value}/print`} className="inline-block">
          <QrCodeDisplay value={value} />
        </Link>
      )
    },
    {
      key: 'id' as keyof Operador,
      label: 'Acciones',
      render: (_, operador) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(operador)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(operador)}
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
            placeholder="Buscar por nombre, apellidos o transportista..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nuevo Operador
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredOperadores}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay operadores que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOperador ? 'Editar Operador' : 'Agregar Nuevo Operador'}
      >
        <OperadorForm
          operador={editingOperador}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Operador"
        message={`¿Estás seguro de que quieres eliminar al operador "${selectedOperador?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}