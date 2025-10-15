'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Location } from '@/models/types';
import { getDocument } from '@/lib/firebase/firestore';
import { LOCATIONS_COLLECTION } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';

export default function LocationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      if (!params.locationId) return;

      try {
        const locationData = await getDocument<Location>(LOCATIONS_COLLECTION, params.locationId as string);
        if (locationData) {
          setLocation(locationData);
        } else {
          setError('Ubicación no encontrada');
        }
      } catch (err) {
        console.error('Error fetching location:', err);
        setError('Error al cargar la ubicación');
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [params.locationId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
          {error || 'Ubicación no encontrada'}
        </div>
        <div className="mt-4">
          <Button onClick={() => router.back()}>
            Volver
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detalles de Ubicación</h1>
        <Button onClick={() => router.back()}>
          Volver
        </Button>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Información General</h3>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-500">Nombre:</span>
                <p className="text-gray-900">{location.name}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Dirección:</span>
                <p className="text-gray-900">{location.address}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">ID:</span>
                <p className="text-gray-900 font-mono text-sm">{location.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Fecha de Creación:</span>
                <p className="text-gray-900">{location.createdAt.toDate().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}