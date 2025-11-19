'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Obra } from '@/models/types';
import AcarreoCaptureForm from '@/components/operator/AcarreoCaptureForm';

export default function CaptureAcarreoPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedObra, setSelectedObra] = useState<Obra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      router.push('/login');
      return;
    }

    // Load selected obra from localStorage
    const savedObraData = localStorage.getItem('selectedObra');
    if (savedObraData) {
      try {
        const obra = JSON.parse(savedObraData);
        setSelectedObra(obra);
      } catch (parseError) {
        console.error('Error parsing saved obra:', parseError);
        localStorage.removeItem('selectedObra');
      }
    }

    setLoading(false);
  }, [user, router]);

  const handleAcarreoSaved = (acarreo: any) => {
    // Show success message
    alert('Acarreo guardado exitosamente');
    
    // Option: Go back to obra selection or continue with new acarreo
    // For now, we'll go back to obra selection
    router.push('/operator/obra-selection');
  };

  const handleCancel = () => {
    // Go back to obra selection
    router.push('/operator/obra-selection');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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

  if (!selectedObra) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-yellow-500">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M15 13l-3-3m0 0l-3 3m14 0v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3m0 0a2 2 0 002 2h2a2 2 0 002 2m-2 0h-2a2 2 0 00-2-2" />
            </svg>
            <p className="text-lg font-semibold">Sin Obra Seleccionada</p>
            <p className="text-sm mt-2 text-gray-600">
              Por favor, seleccione una obra antes de continuar
            </p>
          </div>
          <button
            onClick={() => router.push('/operator/obra-selection')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Seleccionar Obra
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Captura de Acarreo
              </h1>
              <p className="text-sm text-gray-600 ml-4">
                Obra: {selectedObra.nombreParaMostrar}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/operator/obra-selection')}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cambiar Obra
              </button>
              
              <button
                onClick={() => {
                  // Clear session and go to login
                  localStorage.removeItem('selectedObra');
                  router.push('/login');
                }}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AcarreoCaptureForm
            obra={selectedObra}
            onAcarreoSaved={handleAcarreoSaved}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}