'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCollection } from '@/lib/firebase/firestore';
import { updateUserProfile } from '@/lib/auth';
import { Location, Acarreo, Obra } from '@/models/types';

const LOCATIONS_COLLECTION = 'locations';
const ACARREOS_COLLECTION = 'acarreos';
const OBRAS_COLLECTION = 'obras';

export default function LocationSelector() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [filteredAcarreos, setFilteredAcarreos] = useState<Acarreo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [selectedObra, setSelectedObra] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Filtrar acarreos por obra seleccionada
    if (selectedObra) {
      const filtered = acarreos.filter(acarreo => acarreo.idObra === selectedObra);
      setFilteredAcarreos(filtered);
    } else {
      setFilteredAcarreos([]);
    }
  }, [selectedObra, acarreos]);

  const loadData = async () => {
    try {
      const [locationsData, obrasData, acarreosData] = await Promise.all([
        getCollection<Location>(LOCATIONS_COLLECTION),
        getCollection<Obra>(OBRAS_COLLECTION),
        getCollection<Acarreo>(ACARREOS_COLLECTION)
      ]);
      
      setLocations(locationsData);
      setObras(obrasData);
      setAcarreos(acarreosData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationChange = async (locationId: string) => {
    if (!userProfile) return;

    setIsUpdating(true);
    try {
      const selectedLocation = locations.find(loc => loc.id === locationId);

      await updateUserProfile(userProfile.id, {
        currentLocationId: locationId,
        currentLocationName: selectedLocation?.name || ''
      });

      // Refresh the user profile in the auth context
      await refreshUserProfile();
    } catch (error) {
      console.error('Error updating location:', error);
      alert('Error al cambiar la ubicación. Inténtalo de nuevo.');
    } finally {
      setIsUpdating(false);
      setShowSelector(false);
    }
  };

  const handleObraChange = (obraId: string) => {
    setSelectedObra(obraId);
  };

  if (isLoading) {
    return (
      <div className="card-mobile text-gray-700 text-sm">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Cargando ubicaciones...</span>
        </div>
      </div>
    );
  }

  const currentLocation = userProfile?.currentLocationName || 'Sin ubicación';

  return (
    <div className="w-full mb-6">
      {/* Current location display */}
      <div
        className="card-mobile cursor-pointer hover:bg-gray-50 active:scale-[0.99] transition-all duration-200"
        onClick={() => setShowSelector(!showSelector)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <span className="text-sm font-medium text-gray-600">Ubicación actual:</span>
              <div className="font-semibold text-gray-900">{currentLocation}</div>
            </div>
          </div>
          <div className="text-gray-400 transition-transform duration-200" style={{ transform: showSelector ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Location selector dropdown */}
      {showSelector && (
        <div className="mt-2 bg-white rounded-lg shadow-md border border-gray-200 max-h-60 overflow-y-auto slide-up">
          {/* Obra selector */}
          <div className="p-4 border-b border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Obra:</label>
            <select
              value={selectedObra}
              onChange={(e) => handleObraChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            >
              <option value="">Seleccione una obra</option>
              {obras.map(obra => (
                <option key={obra.id} value={obra.id}>
                  {obra.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>

          {/* Acarreos list */}
          {selectedObra ? (
            filteredAcarreos.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No hay acarreos registrados para esta obra
              </div>
            ) : (
              <div className="py-2">
                {filteredAcarreos.map((acarreo) => (
                  <button
                    key={acarreo.id}
                    onClick={() => handleLocationChange(acarreo.id)}
                    disabled={isUpdating}
                    className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                      acarreo.id === userProfile?.currentLocationId
                        ? 'bg-green-50 text-green-800 font-medium'
                        : 'text-gray-800'
                    }`}
                  >
                    <div className="font-medium text-sm">{acarreo.nombreMostrarObra}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {acarreo.nombreMostrarRuta} - {acarreo.nombreMostrarCamion}
                    </div>
                    <div className="text-xs text-gray-600">
                      Material: {acarreo.nombreMaterial}
                    </div>
                    {acarreo.id === userProfile?.currentLocationId && (
                      <div className="text-xs text-green-600 mt-1 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Ubicación actual
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              Seleccione una obra para ver los acarreos disponibles
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {isUpdating && (
        <div className="mt-2 bg-yellow-50 text-yellow-800 px-3 py-2 rounded-lg text-sm text-center border border-yellow-200">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-4 w-4 mr-2 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Cambiando ubicación...</span>
          </div>
        </div>
      )}
    </div>
  );
}