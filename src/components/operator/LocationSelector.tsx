'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCollection } from '@/lib/firebase/firestore';
import { updateUserProfile } from '@/lib/auth';
import { Location } from '@/models/types';

const LOCATIONS_COLLECTION = 'locations';

export default function LocationSelector() {
  const { userProfile, refreshUserProfile } = useAuth();
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      const locationsData = await getCollection<Location>(LOCATIONS_COLLECTION);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations:', error);
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

  if (isLoading) {
    return (
      <div className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm">
        📍 Cargando ubicaciones...
      </div>
    );
  }

  const currentLocation = userProfile?.currentLocationName || 'Sin ubicación';

  return (
    <div className="w-full max-w-sm mb-6">
      {/* Current location display */}
      <div
        className="bg-blue-100 text-blue-800 px-4 py-3 rounded-lg text-sm cursor-pointer hover:bg-blue-200 transition-colors"
        onClick={() => setShowSelector(!showSelector)}
      >
        <div className="flex items-center justify-between">
          <div>
            <span className="font-medium">📍 Ubicación actual:</span>
            <div className="font-bold">{currentLocation}</div>
          </div>
          <div className="text-lg">
            {showSelector ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Location selector dropdown */}
      {showSelector && (
        <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {locations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No hay ubicaciones disponibles
            </div>
          ) : (
            <div className="py-2">
              {locations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => handleLocationChange(location.id)}
                  disabled={isUpdating}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    location.id === userProfile?.currentLocationId
                      ? 'bg-blue-50 text-blue-800 font-medium'
                      : 'text-gray-800'
                  }`}
                >
                  <div className="font-medium text-sm">{location.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{location.address}</div>
                  {location.id === userProfile?.currentLocationId && (
                    <div className="text-xs text-blue-600 mt-1">✓ Ubicación actual</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status indicator */}
      {isUpdating && (
        <div className="mt-2 bg-yellow-100 text-yellow-800 px-3 py-2 rounded text-sm text-center">
          ⏳ Cambiando ubicación...
        </div>
      )}
    </div>
  );
}