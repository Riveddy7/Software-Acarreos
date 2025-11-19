'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { Acarreo } from '@/models/types';
import { ACARREOS_COLLECTION } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';
import { Timestamp } from 'firebase/firestore';

interface AcarreoFormProps {
  acarreo?: Acarreo | null;
  onSave: (data: Omit<Acarreo, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

function AcarreoForm({ acarreo, onSave, onCancel }: AcarreoFormProps) {
  const [formData, setFormData] = useState({
    idEmpresaInterna: '',
    fechaHora: new Date(),
    idUsuario: '',
    nombreMostrarUsuario: '',
    idObra: '',
    nombreMostrarObra: '',
    idTipoAcarreo: '',
    nombreMostrarTipoAcarreo: '',
    esCarga: false,
    esTiro: false,
    idRuta: '',
    nombreMostrarRuta: '',
    idLugarOrigen: '',
    nombreMostrarLugarOrigen: '',
    idLugarDestino: '',
    nombreMostrarLugarDestino: '',
    idCamion: '',
    nombreMostrarCamion: '',
    idMaterial: '',
    nombreMaterial: '',
    nombreCamionero: '',
    porcentajeCargaCamion: 0,
    cantidadCapturada: 0,
    cantidadConciliada: 0,
    dispositivoUtilizado: '',
    latitudUbicacionCaptura: 0,
    longitudUbicacionCaptura: 0,
    kilometrosTotalesRuta: 0,
    idRequisicionAfectada: '',
    idLineaRequisicionAfectada: '',
    nota: '',
    urlFoto: '',
    idAcarreoComplementario: '',
    estatusConciliado: false,
  });

  useEffect(() => {
    if (acarreo) {
      setFormData({
        idEmpresaInterna: acarreo.idEmpresaInterna || '',
        fechaHora: acarreo.fechaHora?.toDate() || new Date(),
        idUsuario: acarreo.idUsuario || '',
        nombreMostrarUsuario: acarreo.nombreMostrarUsuario || '',
        idObra: acarreo.idObra || '',
        nombreMostrarObra: acarreo.nombreMostrarObra || '',
        idTipoAcarreo: acarreo.idTipoAcarreo || '',
        nombreMostrarTipoAcarreo: acarreo.nombreMostrarTipoAcarreo || '',
        esCarga: acarreo.esCarga || false,
        esTiro: acarreo.esTiro || false,
        idRuta: acarreo.idRuta || '',
        nombreMostrarRuta: acarreo.nombreMostrarRuta || '',
        idLugarOrigen: acarreo.idLugarOrigen || '',
        nombreMostrarLugarOrigen: acarreo.nombreMostrarLugarOrigen || '',
        idLugarDestino: acarreo.idLugarDestino || '',
        nombreMostrarLugarDestino: acarreo.nombreMostrarLugarDestino || '',
        idCamion: acarreo.idCamion || '',
        nombreMostrarCamion: acarreo.nombreMostrarCamion || '',
        idMaterial: acarreo.idMaterial || '',
        nombreMaterial: acarreo.nombreMaterial || '',
        nombreCamionero: acarreo.nombreCamionero || '',
        porcentajeCargaCamion: acarreo.porcentajeCargaCamion || 0,
        cantidadCapturada: acarreo.cantidadCapturada || 0,
        cantidadConciliada: acarreo.cantidadConciliada || 0,
        dispositivoUtilizado: acarreo.dispositivoUtilizado || '',
        latitudUbicacionCaptura: acarreo.latitudUbicacionCaptura || 0,
        longitudUbicacionCaptura: acarreo.longitudUbicacionCaptura || 0,
        kilometrosTotalesRuta: acarreo.kilometrosTotalesRuta || 0,
        idRequisicionAfectada: acarreo.idRequisicionAfectada || '',
        idLineaRequisicionAfectada: acarreo.idLineaRequisicionAfectada || '',
        nota: acarreo.nota || '',
        urlFoto: acarreo.urlFoto || '',
        idAcarreoComplementario: acarreo.idAcarreoComplementario || '',
        estatusConciliado: acarreo.estatusConciliado || false,
      });
    }
  }, [acarreo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.idEmpresaInterna || !formData.idUsuario || !formData.idObra || 
        !formData.idTipoAcarreo || !formData.idRuta || !formData.idLugarOrigen || 
        !formData.idLugarDestino || !formData.idCamion || !formData.idMaterial) {
      alert('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const acarreoData = {
      ...formData,
      fechaHora: Timestamp.fromDate(formData.fechaHora),
      fechaHoraCaptura: Timestamp.now(),
    };

    onSave(acarreoData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'fechaHora') {
      setFormData(prev => ({ ...prev, [name]: new Date(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-96 overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Empresa Interna *</label>
          <input
            type="text"
            name="idEmpresaInterna"
            value={formData.idEmpresaInterna}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora *</label>
          <input
            type="datetime-local"
            name="fechaHora"
            value={formData.fechaHora.toISOString().slice(0, 16)}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Usuario *</label>
          <input
            type="text"
            name="idUsuario"
            value={formData.idUsuario}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Usuario *</label>
          <input
            type="text"
            name="nombreMostrarUsuario"
            value={formData.nombreMostrarUsuario}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Obra *</label>
          <input
            type="text"
            name="idObra"
            value={formData.idObra}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Obra *</label>
          <input
            type="text"
            name="nombreMostrarObra"
            value={formData.nombreMostrarObra}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Tipo Acarreo *</label>
          <input
            type="text"
            name="idTipoAcarreo"
            value={formData.idTipoAcarreo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Tipo Acarreo *</label>
          <input
            type="text"
            name="nombreMostrarTipoAcarreo"
            value={formData.nombreMostrarTipoAcarreo}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="esCarga"
              checked={formData.esCarga}
              onChange={handleChange}
              className="mr-2"
            />
            Es Carga
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              name="esTiro"
              checked={formData.esTiro}
              onChange={handleChange}
              className="mr-2"
            />
            Es Tiro
          </label>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Ruta *</label>
          <input
            type="text"
            name="idRuta"
            value={formData.idRuta}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Ruta *</label>
          <input
            type="text"
            name="nombreMostrarRuta"
            value={formData.nombreMostrarRuta}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Lugar Origen *</label>
          <input
            type="text"
            name="idLugarOrigen"
            value={formData.idLugarOrigen}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Lugar Origen *</label>
          <input
            type="text"
            name="nombreMostrarLugarOrigen"
            value={formData.nombreMostrarLugarOrigen}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Lugar Destino *</label>
          <input
            type="text"
            name="idLugarDestino"
            value={formData.idLugarDestino}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Lugar Destino *</label>
          <input
            type="text"
            name="nombreMostrarLugarDestino"
            value={formData.nombreMostrarLugarDestino}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Camión *</label>
          <input
            type="text"
            name="idCamion"
            value={formData.idCamion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Camión *</label>
          <input
            type="text"
            name="nombreMostrarCamion"
            value={formData.nombreMostrarCamion}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Material *</label>
          <input
            type="text"
            name="idMaterial"
            value={formData.idMaterial}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Material *</label>
          <input
            type="text"
            name="nombreMaterial"
            value={formData.nombreMaterial}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Camionero</label>
          <input
            type="text"
            name="nombreCamionero"
            value={formData.nombreCamionero}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Porcentaje Carga Camión *</label>
          <input
            type="number"
            name="porcentajeCargaCamion"
            value={formData.porcentajeCargaCamion}
            onChange={handleChange}
            min="0"
            max="100"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Capturada *</label>
          <input
            type="number"
            name="cantidadCapturada"
            value={formData.cantidadCapturada}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Conciliada</label>
          <input
            type="number"
            name="cantidadConciliada"
            value={formData.cantidadConciliada}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dispositivo Utilizado *</label>
          <input
            type="text"
            name="dispositivoUtilizado"
            value={formData.dispositivoUtilizado}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kilómetros Totales Ruta *</label>
          <input
            type="number"
            name="kilometrosTotalesRuta"
            value={formData.kilometrosTotalesRuta}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Requisición Afectada</label>
          <input
            type="text"
            name="idRequisicionAfectada"
            value={formData.idRequisicionAfectada}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Línea Requisición Afectada</label>
          <input
            type="text"
            name="idLineaRequisicionAfectada"
            value={formData.idLineaRequisicionAfectada}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota</label>
          <textarea
            name="nota"
            value={formData.nota}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Foto</label>
          <input
            type="text"
            name="urlFoto"
            value={formData.urlFoto}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID Acarreo Complementario</label>
          <input
            type="text"
            name="idAcarreoComplementario"
            value={formData.idAcarreoComplementario}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>
        
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="estatusConciliado"
              checked={formData.estatusConciliado}
              onChange={handleChange}
              className="mr-2"
            />
            Estatus Conciliado
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

export default function AcarreosPage() {
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAcarreo, setEditingAcarreo] = useState<Acarreo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAcarreo, setSelectedAcarreo] = useState<Acarreo | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAcarreos = useCallback(async () => {
    try {
      setIsLoading(true);
      const acarreosData = await getCollection<Acarreo>(ACARREOS_COLLECTION);
      setAcarreos(acarreosData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los acarreos. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAcarreos();
  }, [fetchAcarreos]);

  const handleAddNew = () => {
    setEditingAcarreo(null);
    setIsModalOpen(true);
  };

  const handleEdit = (acarreo: Acarreo) => {
    setEditingAcarreo(acarreo);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedAcarreo) return;
    
    try {
      setDeleting(true);
      await deleteDocument(ACARREOS_COLLECTION, selectedAcarreo.id);
      await fetchAcarreos();
      setIsDeleteModalOpen(false);
      setSelectedAcarreo(null);
    } catch (e) {
      console.error(e);
      alert('Error al eliminar el acarreo.');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (acarreo: Acarreo) => {
    setSelectedAcarreo(acarreo);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedAcarreo(null);
  };

  const filteredAcarreos = acarreos.filter(acarreo =>
    (acarreo.nombreMostrarObra && acarreo.nombreMostrarObra.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (acarreo.nombreMostrarCamion && acarreo.nombreMostrarCamion.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (acarreo.nombreMaterial && acarreo.nombreMaterial.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSave = async (acarreoData: Omit<Acarreo, 'id' | 'createdAt'>) => {
    try {
      if (editingAcarreo) {
        await updateDocument(ACARREOS_COLLECTION, editingAcarreo.id, acarreoData);
      } else {
        await addDocument(ACARREOS_COLLECTION, acarreoData);
      }
      await fetchAcarreos();
      setIsModalOpen(false);
      setEditingAcarreo(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el acarreo.');
    }
  };

  // Definir columnas para la tabla
  const columns: Column<Acarreo>[] = [
    {
      key: 'fechaHora',
      label: 'Fecha y Hora',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value.toDate();
        return date.toLocaleString();
      }
    },
    {
      key: 'nombreMostrarObra',
      label: 'Obra',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin obra'}</span>
      )
    },
    {
      key: 'nombreMostrarCamion',
      label: 'Camión',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin camión'}</span>
      )
    },
    {
      key: 'nombreMaterial',
      label: 'Material',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin material'}</span>
      )
    },
    {
      key: 'cantidadCapturada',
      label: 'Cantidad',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 0}</span>
      )
    },
    {
      key: 'esCarga',
      label: 'Tipo',
      render: (_, acarreo) => (
        <div className="flex space-x-2">
          {acarreo.esCarga && <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Carga</span>}
          {acarreo.esTiro && <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Tiro</span>}
        </div>
      )
    },
    {
      key: 'estatusConciliado',
      label: 'Estatus',
      render: (value) => (
        <span className={`px-2 py-1 text-xs rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {value ? 'Conciliado' : 'Pendiente'}
        </span>
      )
    },
    {
      key: 'id' as keyof Acarreo,
      label: 'Acciones',
      render: (_, acarreo) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleEdit(acarreo)}
            className="text-green-600 hover:text-green-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDeleteModal(acarreo)}
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
            placeholder="Buscar por obra, camión o material..."
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <div className="md:col-span-1">
          <Button onClick={handleAddNew} variant="success" className="w-full">
            Nuevo Acarreo
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <DataTable
        data={filteredAcarreos}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay acarreos que coincidan con la búsqueda"
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAcarreo ? 'Editar Acarreo' : 'Agregar Nuevo Acarreo'}
      >
        <AcarreoForm
          acarreo={editingAcarreo}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Eliminar Acarreo"
        message={`¿Estás seguro de que quieres eliminar el acarreo de "${selectedAcarreo?.nombreMostrarObra || 'Sin obra'}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        danger={true}
        loading={deleting}
      />
    </div>
  );
}