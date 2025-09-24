
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Truck, Driver } from '@/models/types';
import { TRUCKS_COLLECTION, DRIVERS_COLLECTION } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

export default function TruckDetailPage() {
  const router = useRouter();
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
        const fetchedTruck = { id: docSnap.id, ...docSnap.data() } as Truck;
        
        let driverName: string | undefined;
        if (fetchedTruck.status === 'IN_SHIPMENT' && fetchedTruck.currentDriverId) {
          const driverDocRef = doc(db, DRIVERS_COLLECTION, fetchedTruck.currentDriverId);
          const driverDocSnap = await getDoc(driverDocRef);
          if (driverDocSnap.exists()) {
            driverName = (driverDocSnap.data() as Driver).name;
          }
        }

        setTruck({ ...fetchedTruck, currentDriverName: driverName });
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
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando camión...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!truck) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del camión.</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Detalle del Camión</h2>

      <div className="space-y-3 text-gray-700">
        <p><strong>ID:</strong> <span className="font-mono text-sm text-gray-600">{truck.id}</span></p>
        <p><strong>Placa:</strong> {truck.plate}</p>
        <p><strong>Modelo:</strong> {truck.model}</p>
        <p><strong>Estado:</strong> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${truck.status === 'IN_SHIPMENT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>{truck.status === 'IN_SHIPMENT' ? 'En Acarreo' : 'Disponible'}</span></p>
        {truck.status === 'IN_SHIPMENT' && truck.currentShipmentId && (
          <p><strong>Acarreo Actual:</strong> <Link href={`/admin/shipments/${truck.currentShipmentId}`} className="text-blue-600 hover:underline">{truck.currentShipmentId}</Link></p>
        )}
        {truck.status === 'IN_SHIPMENT' && truck.currentDriverName && (
          <p><strong>Chofer Actual:</strong> {truck.currentDriverName}</p>
        )}
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">Código QR para Imprimir</p>
        <QrCodeDisplay value={truck.id} size={256} /> {/* Larger QR code */}
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Link
          href={`/admin/trucks/${truck.id}/print`}
          className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Imprimir Tarjeta QR
        </Link>
        <button
          onClick={() => router.push('/admin/trucks')}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Volver a Camiones
        </button>
      </div>
    </div>
  );
}
