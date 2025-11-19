'use client';

import React, { useState, useEffect } from 'react';
import { Material, ClasificacionMaterial, Unidad } from '@/models/types';

interface MaterialFormProps {
  material?: Material | null;
  onSave: (materialData: Omit<Material, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [descripcionNotas, setDescripcionNotas] = useState('');
  const [idClasificacionMaterial, setIdClasificacionMaterial] = useState('');
  const [idUnidad, setIdUnidad] = useState('');
  
  const [clasificacionesMaterial, setClasificacionesMaterial] = useState<ClasificacionMaterial[]>([]);
  const [unidades, setUnidades] = useState<Unidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clasificacionesData, unidadesData] = await Promise.all([
          // Importar getCollection dinámicamente para evitar dependencias circulares
          import('@/lib/firebase/firestore').then(({ getCollection }) => 
            getCollection<ClasificacionMaterial>('clasificacionesMaterial')
          ),
          import('@/lib/firebase/firestore').then(({ getCollection }) => 
            getCollection<Unidad>('unidades')
          )
        ]);
        
        setClasificacionesMaterial(clasificacionesData.filter(c => c.activo));
        setUnidades(unidadesData.filter(u => u.activo));
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (material) {
      setNombreParaMostrar(material.nombreParaMostrar);
      setDescripcionNotas(material.descripcionNotas || '');
      setIdClasificacionMaterial(material.idClasificacionMaterial);
      setIdUnidad(material.idUnidad);
    } else {
      setNombreParaMostrar('');
      setDescripcionNotas('');
      setIdClasificacionMaterial('');
      setIdUnidad('');
    }
  }, [material]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreParaMostrar || !idClasificacionMaterial || !idUnidad) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    onSave({ 
      nombreParaMostrar, 
      descripcionNotas, 
      idClasificacionMaterial, 
      idUnidad 
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
            placeholder="Ej: Arena Grava"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="idClasificacionMaterial" className="block text-sm font-medium text-gray-700 mb-1">Clasificación de Material *</label>
            <select
              id="idClasificacionMaterial"
              value={idClasificacionMaterial}
              onChange={(e) => setIdClasificacionMaterial(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione una clasificación</option>
              {clasificacionesMaterial.map((clasificacion) => (
                <option key={clasificacion.id} value={clasificacion.id}>
                  {clasificacion.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idUnidad" className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
            <select
              id="idUnidad"
              value={idUnidad}
              onChange={(e) => setIdUnidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione una unidad</option>
              {unidades.map((unidad) => (
                <option key={unidad.id} value={unidad.id}>
                  {unidad.nombre}
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
            placeholder="Notas adicionales sobre el material..."
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
