'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getCollection, updateDocument } from '@/lib/firebase/firestore';
import { Location } from '@/models/types';
import { LOCATIONS_COLLECTION, USERS_COLLECTION } from '@/lib/firebase/firestore';

export default function LocationSelectionPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { user, userProfile } = useAuth();

  useEffect(() => {
    // Redirect if not authenticated
    if (!user || !userProfile) {
      router.push('/login');
      return;
    }

    // If user already has a location selected, redirect to their dashboard
    if (userProfile.currentLocationId) {
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else if (userProfile.role === 'operator') {
        router.push('/operator');
      }
      return;
    }

    loadLocations();
  }, [user, userProfile, router]);

  const loadLocations = async () => {
    try {
      const locationsData = await getCollection<Location>(LOCATIONS_COLLECTION);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error loading locations:', error);
      setError('Error al cargar las ubicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLocationId || !user || !userProfile) return;

    setSubmitting(true);
    setError('');

    try {
      const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
      if (!selectedLocation) {
        throw new Error('Ubicación no encontrada');
      }

      // Update user profile with selected location
      await updateDocument(USERS_COLLECTION, user.uid, {
        currentLocationId: selectedLocationId,
        currentLocationName: selectedLocation.name
      });

      // Redirect based on role
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else if (userProfile.role === 'operator') {
        router.push('/operator');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al seleccionar ubicación';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Cargando ubicaciones...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Selecciona tu ubicación
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Desde qué ubicación estarás trabajando hoy?
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Ubicación de trabajo
            </label>
            <select
              id="location"
              name="location"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
            >
              <option value="">Selecciona una ubicación</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} - {location.address}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting || !selectedLocationId}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Guardando...' : 'Continuar'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Puedes cambiar tu ubicación desde el menú principal
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}