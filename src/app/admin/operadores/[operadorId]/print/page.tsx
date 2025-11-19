'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Operador, Transportista } from '@/models/types';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';

export default function OperadorPrintPage() {
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
    return <p className="text-center text-lg text-gray-700 mt-8">Cargando operador para imprimir...</p>;
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200 mt-8">Error: {error}</p>;
  }

  if (!operador) {
    return <p className="text-center text-gray-700 mt-8">No se pudo cargar la información del operador.</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 print:bg-white print:min-h-0">
      <div className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6 text-center print:shadow-none print:border print:border-gray-300">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Tarjeta de Operador</h1>
        
        <div className="mb-4">
          <p className="text-lg font-semibold text-gray-700">Nombre: {operador.nombreParaMostrar}</p>
          <p className="text-md text-gray-600">Transportista: {transportista?.nombre || 'N/A'}</p>
        </div>

        <div className="flex justify-center mb-4">
          <QrCodeDisplay value={operador.id} size={200} /> {/* Prominent QR code */}
        </div>

        <p className="text-sm text-gray-500">ID del Operador: <span className="font-mono text-gray-700">{operador.id}</span></p>

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