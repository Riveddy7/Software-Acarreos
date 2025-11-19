'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Operador, Transportista } from '@/models/types';
import { getCollection } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

export default function OperadorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const operadorId = params.operadorId as string;

  const [operador, setOperador] = useState<Operador | null>(null);
  const [transportista, setTransportista] = useState<Transportista | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperador = useCallback(async () => {
    if (!operadorId) {
      setError('ID de operador no proporcionado.');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const docRef = doc(db, 'operadores', operadorId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedOperador = { id: docSnap.id, ...docSnap.data() } as Operador;
        setOperador(fetchedOperador);
        
        // Fetch transportista data
        if (fetchedOperador.idTransportista) {
          const transportistaDocRef = doc(db, 'transportistas', fetchedOperador.idTransportista);
          const transportistaDocSnap = await getDoc(transportistaDocRef);
          if (transportistaDocSnap.exists()) {
            setTransportista({ id: transportistaDocSnap.id, ...transportistaDocSnap.data() } as Transportista);
          }
        }
        
        setError(null);
      } else {
        setError('Operador no encontrado.');
      }
    } catch (e) {
      console.error("Error fetching operador:", e);
      setError('Error al cargar los datos del operador. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, [operadorId]);

  useEffect(() => {
    fetchOperador();
  }, [fetchOperador]);

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando operador...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!operador) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del operador.</p>;
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-6">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Detalle del Operador</h2>

      <div className="space-y-3 text-gray-700">
        <p><strong>ID:</strong> <span className="font-mono text-sm text-gray-600">{operador.id}</span></p>
        <p><strong>Nombre Completo:</strong> {operador.nombreParaMostrar}</p>
        <p><strong>Apellido Paterno:</strong> {operador.apellidoPaterno}</p>
        <p><strong>Apellido Materno:</strong> {operador.apellidoMaterno || 'N/A'}</p>
        <p><strong>Nombres:</strong> {operador.nombres}</p>
        <p><strong>Transportista:</strong> {transportista?.nombre || 'N/A'}</p>
      </div>

      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-md border border-gray-200">
        <p className="text-lg font-semibold text-gray-800 mb-4">Código QR para Imprimir</p>
        <QrCodeDisplay value={operador.id} size={256} /> {/* Larger QR code */}
      </div>

      <div className="flex justify-center mt-8 space-x-4">
        <Link
          href={`/admin/operadores/${operador.id}/print`}
          className="px-4 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          Imprimir Tarjeta QR
        </Link>
        <button
          onClick={() => router.push('/admin/operadores')}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Volver a Operadores
        </button>
      </div>
    </div>
  );
}