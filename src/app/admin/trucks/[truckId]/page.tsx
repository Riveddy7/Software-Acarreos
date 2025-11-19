
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Truck, Driver, Transportista, TipoCamion, ClasificacionViaje } from '@/models/types';
import { TRUCKS_COLLECTION, DRIVERS_COLLECTION } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import { StatusBadge } from '@/components/ui/StatusBadge';

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
        
        // Fetch related data
        const [driverName, transportista, tipoCamion, clasificacionViaje, ultimoCamionero] = await Promise.all([
          // Fetch driver name if in shipment
          (async () => {
            if (fetchedTruck.status === 'IN_SHIPMENT' && fetchedTruck.currentDriverId) {
              const driverDocRef = doc(db, DRIVERS_COLLECTION, fetchedTruck.currentDriverId);
              const driverDocSnap = await getDoc(driverDocRef);
              return driverDocSnap.exists() ? (driverDocSnap.data() as Driver).name : undefined;
            }
            return undefined;
          })(),
          // Fetch transportista
          (async () => {
            if (fetchedTruck.idTransportista) {
              const docRef = doc(db, 'transportistas', fetchedTruck.idTransportista);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? (docSnap.data() as Transportista).nombre : undefined;
            }
            return undefined;
          })(),
          // Fetch tipo camion
          (async () => {
            if (fetchedTruck.idTipoCamion) {
              const docRef = doc(db, 'tiposCamion', fetchedTruck.idTipoCamion);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? (docSnap.data() as TipoCamion).nombre : undefined;
            }
            return undefined;
          })(),
          // Fetch clasificacion viaje
          (async () => {
            if (fetchedTruck.idClasificacionViaje) {
              const docRef = doc(db, 'clasificacionesViaje', fetchedTruck.idClasificacionViaje);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? (docSnap.data() as ClasificacionViaje).nombre : undefined;
            }
            return undefined;
          })(),
          // Fetch ultimo camionero
          (async () => {
            if (fetchedTruck.idUltimoCamionero) {
              const docRef = doc(db, DRIVERS_COLLECTION, fetchedTruck.idUltimoCamionero);
              const docSnap = await getDoc(docRef);
              return docSnap.exists() ? (docSnap.data() as Driver).name : undefined;
            }
            return undefined;
          })()
        ]);

        setTruck({
          ...fetchedTruck,
          currentDriverName: driverName,
          transportistaNombre: transportista,
          tipoCamionNombre: tipoCamion,
          clasificacionViajeNombre: clasificacionViaje,
          ultimoCamioneroNombre: ultimoCamionero
        });
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
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Detalle del Camión</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
        <div className="space-y-3">
          <p><strong>ID:</strong> <span className="font-mono text-sm text-gray-600">{truck.id}</span></p>
          <p><strong>Nombre para mostrar:</strong> {truck.nombreParaMostrar}</p>
          <p><strong>Placas:</strong> {truck.placas}</p>
          <p><strong>Marca:</strong> {truck.marca || 'N/A'}</p>
          <p><strong>Modelo:</strong> {truck.model || 'N/A'}</p>
          <p><strong>Número de serie:</strong> {truck.numeroSerie || 'N/A'}</p>
          <p><strong>Volumen:</strong> {truck.volume ? `${truck.volume} M³` : 'N/A'}</p>
        </div>
        
        <div className="space-y-3">
          <p><strong>Transportista:</strong> {truck.transportistaNombre || 'N/A'}</p>
          <p><strong>Tipo de camión:</strong> {truck.tipoCamionNombre || 'N/A'}</p>
          <p><strong>Clasificación de viaje:</strong> {truck.clasificacionViajeNombre || 'N/A'}</p>
          <p><strong>Último camionero:</strong> {truck.ultimoCamioneroNombre || 'N/A'}</p>
          <p><strong>Estatus activo:</strong> <StatusBadge status={truck.estatusActivo ? 'ACTIVO' : 'INACTIVO'} /></p>
          <p><strong>Estado:</strong> <StatusBadge status={truck.status === 'IN_SHIPMENT' ? 'EN_TRANSITO' : 'COMPLETED'} /></p>
          {truck.status === 'IN_SHIPMENT' && truck.currentShipmentId && (
            <p><strong>Acarreo Actual:</strong> <Link href={`/admin/shipments/${truck.currentShipmentId}`} className="text-blue-600 hover:underline">{truck.currentShipmentId}</Link></p>
          )}
          {truck.status === 'IN_SHIPMENT' && truck.currentDriverName && (
            <p><strong>Chofer Actual:</strong> {truck.currentDriverName}</p>
          )}
        </div>
      </div>

      {truck.descripcionNotas && (
        <div className="mt-4">
          <p><strong>Descripción o notas:</strong></p>
          <p className="mt-1 p-3 bg-gray-50 rounded-md border border-gray-200 text-gray-700">
            {truck.descripcionNotas}
          </p>
        </div>
      )}

      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">Código QR para Imprimir</p>
        <QrCodeDisplay value={truck.id} size={256} />
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
