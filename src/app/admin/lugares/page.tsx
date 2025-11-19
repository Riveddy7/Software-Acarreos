'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Lugar, Obra } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const LUGARES_COLLECTION = 'lugares';

interface LugarFormProps {
  lugar?: Lugar | null;
  onSave: (data: Omit<Lugar, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function LugarForm({ lugar, onSave, onCancel }: LugarFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [idObra, setIdObra] = useState('');
  const [estatusActivo, setEstatusActivo] = useState(true);
  const [descripcionNotas, setDescripcionNotas] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  
  const [obras, setObras] = useState<Obra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const obrasData = await getCollection<Obra>('obras');
        setObras(obrasData.filter(o => o.estatusActivo));
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (lugar) {
      setNombreParaMostrar(lugar.nombreParaMostrar);
      setIdObra(lugar.idObra);
      setEstatusActivo(lugar.estatusActivo);
      setDescripcionNotas(lugar.descripcionNotas || '');
      setLatitud(lugar.latitud?.toString() || '');
      setLongitud(lugar.longitud?.toString() || '');
    } else {
      setNombreParaMostrar('');
      setIdObra('');
      setEstatusActivo(true);
      setDescripcionNotas('');
      setLatitud('');
      setLongitud('');
    }
  }, [lugar]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar || !idObra) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    
    const latNum = latitud ? parseFloat(latitud) : undefined;
    const lonNum = longitud ? parseFloat(longitud) : undefined;
    
    if ((latitud && (latNum === undefined || isNaN(latNum))) || (longitud && (lonNum === undefined || isNaN(lonNum)))) {
      alert('Por favor, ingrese coordenadas válidas.');
      return;
    }
    
    onSave({ 
      nombreParaMostrar, 
      idObra, 
      estatusActivo, 
      descripcionNotas, 
      latitud: latNum, 
      longitud: lonNum 
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
              placeholder="Ej: Patio de Materiales"
              required
            />
          </div>
          <div>
            <label htmlFor="idObra" className="block text-sm font-medium text-gray-700 mb-1">Obra *</label>
            <select
              id="idObra"
              value={idObra}
              onChange={(e) => setIdObra(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione una obra</option>
              {obras.map((obra) => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="latitud" className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input
              type="number"
              id="latitud"
              value={latitud}
              onChange={(e) => setLatitud(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: 19.4326"
              step="any"
            />
          </div>
          <div>
            <label htmlFor="longitud" className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input
              type="number"
              id="longitud"
              value={longitud}
              onChange={(e) => setLongitud(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: -99.1332"
              step="any"
            />
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
            placeholder="Notas adicionales sobre el lugar..."
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

export default function LugaresPage() {
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLugar, setEditingLugar] = useState<Lugar | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLugar, setSelectedLugar] = useState<Lugar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchLugares = useCallback(async () => {
    try {
      setIsLoading(true);
      const lugaresData = await getCollection<Lugar>(LUGARES_COLLECTION);
      
      // Fetch related data for denormalization
      const lugaresWithRelatedData = await Promise.all(
        lugaresData.map(async (lugar) => {
          const obra = await getCollection<Obra>('obras').then(obras => 
            obras.find(o => o.id === lugar.idObra)
          );
          
          return {
            ...lugar,
            obraNombre: obra?.nombreParaMostrar
          };
        })
      );
      
      setLugares(lugaresWithRelatedData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los lugares. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLugares();
  }, [fetchLugares]);

  const handleAddNew = () => {
    setEditingLugar(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lugar: Lugar) => {
    setEditingLugar(lugar);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedLugar) return;
    
    try {
      setDeleting(true);
      await deleteDocument(LUGARES_COLLECTION, selectedLugar.id);
      await fetchLugares();
      setIsDeleteModalOpen(false);
      setSelectedLugar(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el lugar.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (lugar: Lugar) => {
    setSelectedLugar(lugar);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedLugar(null);
  };

  const filteredLugares = lugares.filter(lugar =>
    (lugar.nombreParaMostrar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (lugar.obraNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSave = async (lugarData: Omit<Lugar, 'id' | 'createdAt'>) => {
    try {
      if (editingLugar) {
        await updateDocument(LUGARES_COLLECTION, editingLugar.id, lugarData);
      } else {
        await addDocument(LUGARES_COLLECTION, lugarData);
      }
      await fetchLugares();
      setIsModalOpen(false);
      setEditingLugar(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el lugar.');
    }
  };

  const columns: Column<Lugar>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'obraNombre',
      label: 'Obra',
      render: (value) => value || 'N/A'
    },
    {
      key: 'latitud',
      label: 'Coordenadas',
      render: (_, lugar) => (
        <span className="text-gray-700">
          {lugar.latitud && lugar.longitud 
            ? `${lugar.latitud.toFixed(4)}, ${lugar.longitud.toFixed(4)}`
            : 'N/A'
          }
        </span>
      )
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
      key: 'id' as keyof Lugar,
      label: 'Acciones',
      render: (_, lugar) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(lugar)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(lugar)}
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
            placeholder="Buscar por nombre u obra..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nuevo Lugar
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredLugares}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay lugares que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingLugar ? 'Editar Lugar' : 'Agregar Nuevo Lugar'}
      >
        <LugarForm
          lugar={editingLugar}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Lugar"
        message={`¿Estás seguro de que quieres eliminar el lugar "${selectedLugar?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}