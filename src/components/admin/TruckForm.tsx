
'use client';

import React, { useState, useEffect } from 'react';
import { Truck, Transportista, TipoCamion, ClasificacionViaje } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';

interface TruckFormProps {
  truck?: Truck | null; // Truck to edit, or null for new truck
  onSave: (truckData: Omit<Truck, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function TruckForm({ truck, onSave, onCancel }: TruckFormProps) {
  const [placas, setPlacas] = useState('');
  const [nombreParaMostrar, setNombreParaMostrar] = useState('');
  const [estatusActivo, setEstatusActivo] = useState(true);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [numeroSerie, setNumeroSerie] = useState('');
  const [volume, setVolume] = useState('');
  const [descripcionNotas, setDescripcionNotas] = useState('');
  
  // Foreign keys
  const [idTransportista, setIdTransportista] = useState('');
  const [idTipoCamion, setIdTipoCamion] = useState('');
  const [idClasificacionViaje, setIdClasificacionViaje] = useState('');
  const [idUltimoCamionero, setIdUltimoCamionero] = useState('');
  
  // Options for dropdowns
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [tiposCamion, setTiposCamion] = useState<TipoCamion[]>([]);
  const [clasificacionesViaje, setClasificacionesViaje] = useState<ClasificacionViaje[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]); // Using any for now since we need to import Driver type
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transportistasData, tiposCamionData, clasificacionesViajeData, driversData] = await Promise.all([
          getCollection<Transportista>('transportistas'),
          getCollection<TipoCamion>('tiposCamion'),
          getCollection<ClasificacionViaje>('clasificacionesViaje'),
          getCollection<any>('drivers') // Using any for now
        ]);
        
        setTransportistas(transportistasData.filter(t => t.activo));
        setTiposCamion(tiposCamionData.filter(t => t.activo));
        setClasificacionesViaje(clasificacionesViajeData.filter(c => c.activo));
        setDrivers(driversData);
      } catch (error) {
        console.error('Error loading form data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  useEffect(() => {
    if (truck) {
      setPlacas(truck.placas || '');
      setNombreParaMostrar(truck.nombreParaMostrar || '');
      setEstatusActivo(truck.estatusActivo !== undefined ? truck.estatusActivo : true);
      setMarca(truck.marca || '');
      setModelo(truck.model || '');
      setNumeroSerie(truck.numeroSerie || '');
      setVolume(truck.volume?.toString() || '');
      setDescripcionNotas(truck.descripcionNotas || '');
      
      setIdTransportista(truck.idTransportista || '');
      setIdTipoCamion(truck.idTipoCamion || '');
      setIdClasificacionViaje(truck.idClasificacionViaje || '');
      setIdUltimoCamionero(truck.idUltimoCamionero || '');
    } else {
      // Reset form for new truck
      setPlacas('');
      setNombreParaMostrar('');
      setEstatusActivo(true);
      setMarca('');
      setModelo('');
      setNumeroSerie('');
      setVolume('');
      setDescripcionNotas('');
      
      setIdTransportista('');
      setIdTipoCamion('');
      setIdClasificacionViaje('');
      setIdUltimoCamionero('');
    }
  }, [truck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    if (!placas || !nombreParaMostrar || !idTransportista || !idTipoCamion || !idClasificacionViaje) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }
    
    const volumeNum = parseFloat(volume);
    if (volume && (isNaN(volumeNum) || volumeNum <= 0)) {
      alert('Por favor, ingrese un volumen válido.');
      return;
    }
    
    onSave({
      placas,
      nombreParaMostrar,
      estatusActivo,
      marca,
      model: modelo,
      numeroSerie,
      volume: volumeNum,
      descripcionNotas,
      idTransportista,
      idTipoCamion,
      idClasificacionViaje,
      idUltimoCamionero: idUltimoCamionero || undefined,
      status: truck?.status || 'AVAILABLE',
      currentShipmentId: truck?.currentShipmentId,
      currentDriverId: truck?.currentDriverId,
      currentDriverName: truck?.currentDriverName
    });
  };

  if (loading) {
    return <div className="p-4 text-center">Cargando datos del formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {/* Campos requeridos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="placas" className="block text-sm font-medium text-gray-700 mb-1">Placas *</label>
            <input
              type="text"
              id="placas"
              value={placas}
              onChange={(e) => setPlacas(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: ABC-1234"
              required
            />
          </div>
          <div>
            <label htmlFor="nombreParaMostrar" className="block text-sm font-medium text-gray-700 mb-1">Nombre para mostrar *</label>
            <input
              type="text"
              id="nombreParaMostrar"
              value={nombreParaMostrar}
              onChange={(e) => setNombreParaMostrar(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Camión Volteo 01"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div>
            <label htmlFor="idTipoCamion" className="block text-sm font-medium text-gray-700 mb-1">Tipo de camión *</label>
            <select
              id="idTipoCamion"
              value={idTipoCamion}
              onChange={(e) => setIdTipoCamion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione un tipo</option>
              {tiposCamion.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="idClasificacionViaje" className="block text-sm font-medium text-gray-700 mb-1">Clasificación para viajes *</label>
            <select
              id="idClasificacionViaje"
              value={idClasificacionViaje}
              onChange={(e) => setIdClasificacionViaje(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            >
              <option value="">Seleccione una clasificación</option>
              {clasificacionesViaje.map((clasificacion) => (
                <option key={clasificacion.id} value={clasificacion.id}>
                  {clasificacion.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Campos opcionales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="marca" className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input
              type="text"
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: Volvo"
            />
          </div>
          <div>
            <label htmlFor="modelo" className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input
              type="text"
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: FMX"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="numeroSerie" className="block text-sm font-medium text-gray-700 mb-1">Número de serie</label>
            <input
              type="text"
              id="numeroSerie"
              value={numeroSerie}
              onChange={(e) => setNumeroSerie(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: 1VKS12345"
            />
          </div>
          <div>
            <label htmlFor="volume" className="block text-sm font-medium text-gray-700 mb-1">Volumen (M³)</label>
            <input
              type="number"
              id="volume"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              placeholder="Ej: 20"
              step="0.1"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="idUltimoCamionero" className="block text-sm font-medium text-gray-700 mb-1">Último camionero</label>
            <select
              id="idUltimoCamionero"
              value={idUltimoCamionero}
              onChange={(e) => setIdUltimoCamionero(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccione un camionero</option>
              {drivers.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center pt-6">
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

        <div>
          <label htmlFor="descripcionNotas" className="block text-sm font-medium text-gray-700 mb-1">Descripción o notas</label>
          <textarea
            id="descripcionNotas"
            value={descripcionNotas}
            onChange={(e) => setDescripcionNotas(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            placeholder="Notas adicionales sobre el camión..."
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400" // Adjusted button styles
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
