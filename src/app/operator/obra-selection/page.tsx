'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Obra } from '@/models/types';
import ObraSelector from '@/components/operator/ObraSelector';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

export default function ObraSelectionPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [obras, setObras] = useState<Obra[]>([]);
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadObras();
  }, []);

  const loadObras = async () => {
    if (!user) {
      setError('Usuario no autenticado');
      setLoading(false);
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const db = getFirestore();
      const obrasQuery = query(
        collection(db, 'obras'),
        where('estatusActivo', '==', true)
      );

      const querySnapshot = await getDocs(obrasQuery);
      const obrasData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
      } as Obra));

      setObras(obrasData);

      // Load selected obra from localStorage if exists
      const savedObraId = localStorage.getItem('selectedObraId');
      if (savedObraId) {
        const savedObra = obrasData.find(obra => obra.id === savedObraId);
        if (savedObra) {
          setSelectedObra(savedObra);
        }
      }

    } catch (error) {
      console.error('Error loading obras:', error);
      setError('Error al cargar las obras. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleObraSelect = (obra: Obra) => {
    setSelectedObra(obra);
    
    // Save to localStorage for persistence
    localStorage.setItem('selectedObraId', obra.id);
    localStorage.setItem('selectedObra', JSON.stringify(obra));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando obras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-semibold">Error</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ObraSelector
        obras={obras}
        selectedObra={selectedObra}
        onObraSelect={handleObraSelect}
        loading={loading}
        error={error}
      />
    </div>
  );
}