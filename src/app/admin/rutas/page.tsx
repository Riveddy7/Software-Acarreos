'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Ruta, Lugar, TipoAcarreo } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';

const RUTAS_COLLECTION = 'rutas';

interface RutaFormProps {
  ruta?: Ruta | null;
  onSave: (data: Omit<Ruta, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function RutaForm({ ruta, onSave, onCancel }: RutaFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [idLugarOrigen, setIdLugarOrigen] = useState('');
  const [idLugarDestino, setIdLugarDestino] = useState('');
  const [idTipoAcarreo, setIdTipoAcarreo] = useState('');
  const [totalKilometrosReales, setTotalKilometrosReales] = useState('');
  const [totalKilometrosConciliados, setTotalKilometrosConciliados] = useState('');
  const [estatusActivo, setEstatusActivo] = useState(true);
  const [descripcionNotas, setDescripcionNotas] = useState('');
  const [kmlTexto, setKmlTexto] = useState('');
  
  const [lugares, setLugares] = useState<Lugar[]>([]);
  const [tiposAcarreo, setTiposAcarreo] = useState<TipoAcarreo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lugaresData, tiposAcarreoData] = await Promise.all([
          getCollection<Lugar>('lugares'),
          getCollection<TipoAcarreo>('tiposAcarreo')
        ]);
        
        setLugares(lugaresData.filter(l => l.estatusActivo));
        setTiposAcarreo(tiposAcarreoData);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (ruta) {
      setNombreParaMostrar(ruta.nombreParaMostrar);
      setIdLugarOrigen(ruta.idLugarOrigen);
      setIdLugarDestino(ruta.idLugarDestino);
      setIdTipoAcarreo(ruta.idTipoAcarreo);
      setTotalKilometrosReales(ruta.totalKilometrosReales?.toString() || '');
      setTotalKilometrosConciliados(ruta.totalKilometrosConciliados?.toString() || '');
      setEstatusActivo(ruta.estatusActivo);
      setDescripcionNotas(ruta.descripcionNotas || '');
      setKmlTexto(ruta.kmlTexto || '');
    } else {
      setNombreParaMostrar('');
      setIdLugarOrigen('');
      setIdLugarDestino('');
      setIdTipoAcarreo('');
      setTotalKilometrosReales('');
      setTotalKilometrosConciliados('');
      setEstatusActivo(true);
      setDescripcionNotas('');
      setKmlTexto('');
    }
  }, [ruta]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar || !idLugarOrigen || !idLugarDestino || !idTipoAcarreo) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    
    const kmRealesNum = totalKilometrosReales ? parseFloat(totalKilometrosReales) : undefined;
    const kmConciliadosNum = totalKilometrosConciliados ? parseFloat(totalKilometrosConciliados) : undefined;
    
    if ((totalKilometrosReales && (kmRealesNum === undefined || isNaN(kmRealesNum))) || 
        (totalKilometrosConciliados && (kmConciliadosNum === undefined || isNaN(kmConciliadosNum)))) {
      alert('Por favor, ingrese valores válidos para los kilómetros.');
      return;
    }
    
    onSave({ 
      nombreParaMostrar, 
      idLugarOrigen, 
      idLugarDestino, 
      idTipoAcarreo, 
      totalKilometrosReales: kmRealesNum, 
      totalKilometrosConciliados: kmConciliadosNum, 
      estatusActivo, 
      descripcionNotas, 
      kmlTexto 
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando datos del formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        <div>
          <label htmlFor="nombreParaMostrar" className="block text-sm font-medium text-gray-700 mb-1">Nombre para mostrar *</label>
          <input
            type="text"
            id="nombreParaMostrar"
            value={nombreParaMostrar}
            onChange={(e) => setNombreParaMostrar(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Ej: Ruta Patio - Obra Principal"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="idLugarOrigen" className="block text-sm font-medium text-gray-700 mb-1">Lugar Origen *</label>
            <select
              id="idLugarOrigen"
              value={idLugarOrigen}
              onChange={(e) => setIdLugarOrigen(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione un lugar</option>
              {lugares.map((lugar) => (
                <option key={lugar.id} value={lugar.id}>
                  {lugar.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idLugarDestino" className="block text-sm font-medium text-gray-700 mb-1">Lugar Destino *</label>
            <select
              id="idLugarDestino"
              value={idLugarDestino}
              onChange={(e) => setIdLugarDestino(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione un lugar</option>
              {lugares.map((lugar) => (
                <option key={lugar.id} value={lugar.id}>
                  {lugar.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idTipoAcarreo" className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acarreo *</label>
            <select
              id="idTipoAcarreo"
              value={idTipoAcarreo}
              onChange={(e) => setIdTipoAcarreo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione un tipo</option>
              {tiposAcarreo.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="totalKilometrosReales" className="block text-sm font-medium text-gray-700 mb-1">Total kilómetros reales</label>
            <input
              type="number"
              id="totalKilometrosReales"
              value={totalKilometrosReales}
              onChange={(e) => setTotalKilometrosReales(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: 25.5"
              step="0.1"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="totalKilometrosConciliados" className="block text-sm font-medium text-gray-700 mb-1">Total kilómetros conciliados</label>
            <input
              type="number"
              id="totalKilometrosConciliados"
              value={totalKilometrosConciliados}
              onChange={(e) => setTotalKilometrosConciliados(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: 24.8"
              step="0.1"
              min="0"
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
            placeholder="Notas adicionales sobre la ruta..."
          />
        </div>

        <div>
          <label htmlFor="kmlTexto" className="block text-sm font-medium text-gray-700 mb-1">KML (texto)</label>
          <textarea
            id="kmlTexto"
            value={kmlTexto}
            onChange={(e) => setKmlTexto(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-mono text-xs"
            placeholder="<kml>...</kml>"
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

export default function RutasPage() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRuta, setEditingRuta] = useState<Ruta | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchRutas = useCallback(async () => {
    try {
      setIsLoading(true);
      const rutasData = await getCollection<Ruta>(RUTAS_COLLECTION);
      
      // Fetch related data for denormalization
      const rutasWithRelatedData = await Promise.all(
        rutasData.map(async (ruta) => {
          const [lugarOrigen, lugarDestino, tipoAcarreo] = await Promise.all([
            getCollection<Lugar>('lugares').then(lugares => 
              lugares.find(l => l.id === ruta.idLugarOrigen)
            ),
            getCollection<Lugar>('lugares').then(lugares => 
              lugares.find(l => l.id === ruta.idLugarDestino)
            ),
            getCollection<TipoAcarreo>('tiposAcarreo').then(tipos => 
              tipos.find(t => t.id === ruta.idTipoAcarreo)
            )
          ]);
          
          return {
            ...ruta,
            lugarOrigenNombre: lugarOrigen?.nombreParaMostrar,
            lugarDestinoNombre: lugarDestino?.nombreParaMostrar,
            tipoAcarreoNombre: tipoAcarreo?.nombreParaMostrar
          };
        })
      );
      
      setRutas(rutasWithRelatedData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las rutas. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRutas();
  }, [fetchRutas]);

  const handleAddNew = () => {
    setEditingRuta(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ruta: Ruta) => {
    setEditingRuta(ruta);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedRuta) return;
    
    try {
      setDeleting(true);
      await deleteDocument(RUTAS_COLLECTION, selectedRuta.id);
      await fetchRutas();
      setIsDeleteModalOpen(false);
      setSelectedRuta(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar la ruta.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (ruta: Ruta) => {
    setSelectedRuta(ruta);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRuta(null);
  };

  const filteredRutas = rutas.filter(ruta =>
    (ruta.nombreParaMostrar?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (ruta.lugarOrigenNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (ruta.lugarDestinoNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (ruta.tipoAcarreoNombre?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  const handleSave = async (rutaData: Omit<Ruta, 'id' | 'createdAt'>) => {
    try {
      if (editingRuta) {
        await updateDocument(RUTAS_COLLECTION, editingRuta.id, rutaData);
      } else {
        await addDocument(RUTAS_COLLECTION, rutaData);
      }
      await fetchRutas();
      setIsModalOpen(false);
      setEditingRuta(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la ruta.');
    }
  };

  const columns: Column<Ruta>[] = [
    {
      key: 'nombreParaMostrar',
      label: 'Nombre',
      render: (value) => (
        <span className="font-medium text-gray-900">{value}</span>
      )
    },
    {
      key: 'lugarOrigenNombre',
      label: 'Origen',
      render: (value) => value || 'N/A'
    },
    {
      key: 'lugarDestinoNombre',
      label: 'Destino',
      render: (value) => value || 'N/A'
    },
    {
      key: 'tipoAcarreoNombre',
      label: 'Tipo Acarreo',
      render: (value) => value || 'N/A'
    },
    {
      key: 'totalKilometrosReales',
      label: 'Km Reales',
      render: (value) => value ? `${value} km` : 'N/A'
    },
    {
      key: 'totalKilometrosConciliados',
      label: 'Km Conciliados',
      render: (value) => value ? `${value} km` : 'N/A'
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
      key: 'id' as keyof Ruta,
      label: 'Acciones',
      render: (_, ruta) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(ruta)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(ruta)}
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
            placeholder="Buscar por nombre, origen, destino o tipo de acarreo..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nueva Ruta
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredRutas}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay rutas que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRuta ? 'Editar Ruta' : 'Agregar Nueva Ruta'}
      >
        <RutaForm
          ruta={editingRuta}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Ruta"
        message={`¿Estás seguro de que quieres eliminar la ruta "${selectedRuta?.nombreParaMostrar}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}