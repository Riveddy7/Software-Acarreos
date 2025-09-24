
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Driver } from '@/models/types';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

const DRIVERS_COLLECTION = 'drivers';

export default function DriverDetailPage() {
  const router = useRouter();
  const params = useParams();
  const driverId = params.driverId as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDriver = useCallback(async () => {
    if (!driverId) {
      setError('ID de chofer no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docRef = doc(db, DRIVERS_COLLECTION, driverId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDriver({ id: docSnap.id, ...docSnap.data() } as Driver);
        setError(null);
      } else {
        setError('Chofer no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching driver:", e);
      setError('Error al cargar los datos del chofer. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [driverId]);

  useEffect(() => {
    fetchDriver();
  }, [fetchDriver]);

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando chofer...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!driver) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del chofer.</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Detalle del Chofer</h2>

      <div className="space-y-3 text-gray-700">
        <p><strong>ID:</strong> <span className="font-mono text-sm text-gray-600">{driver.id}</span></p>
        <p><strong>Nombre:</strong> {driver.name}</p>
        <p><strong>Número de Licencia:</strong> {driver.licenseNumber}</p>
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">Código QR para Imprimir</p>
        <QrCodeDisplay value={driver.id} size={256} /> {/* Larger QR code */}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => router.push('/admin/drivers')}
          className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Volver a Choferes
        </button>
      </div>
    </div>
  );
}
