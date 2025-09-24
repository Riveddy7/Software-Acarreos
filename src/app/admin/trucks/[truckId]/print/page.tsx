
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Truck } from '@/models/types';
import { TRUCKS_COLLECTION } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

export default function TruckPrintPage() {
  const params = useParams();
  const truckId = params.truckId as string;

  const [truck, setTruck] = useState<Truck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTruck = useCallback(async () => {
    if (!truckId) {
      setError('ID de camión no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docRef = doc(db, TRUCKS_COLLECTION, truckId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTruck({ id: docSnap.id, ...docSnap.data() } as Truck);
        setError(null);
      } else {
        setError('Camión no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching truck:", e);
      setError('Error al cargar los datos del camión. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [truckId]);

  useEffect(() => {
    fetchTruck();
  }, [fetchTruck]);

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando camión para imprimir...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!truck) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del camión.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 print:bg-white print:min-h-0">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 text-center print:shadow-none print:border print:border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tarjeta de Camión</h1>
        
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-700">Placa: {truck.plate}</p>
          <p className="text-md text-gray-600">Modelo: {truck.model}</p>
        </div>

        <div className="flex justify-center mb-4">
          <QrCodeDisplay value={truck.id} size={200} /> {/* Prominent QR code */}
        </div>

        <p className="text-sm text-gray-500">ID del Camión: <span className="font-mono text-gray-700">{truck.id}</span></p>

        <div className="mt-6 print:hidden">
          <button
            onClick={() => window.print()}
            className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Imprimir Tarjeta
          </button>
        </div>
      </div>
    </div>
  );
}
