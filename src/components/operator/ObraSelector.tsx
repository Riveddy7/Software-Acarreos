'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Obra } from '@/models/types';
import { Button } from '@/components/ui/Button';

interface ObraSelectorProps {
  obras: Obra[];
  selectedObra: Obra | null;
  onObraSelect: (obra: Obra) => void;
  loading?: boolean;
  error?: string | null;
}

export default function ObraSelector({
  obras,
  selectedObra,
  onObraSelect,
  loading = false,
  error = null
}: ObraSelectorProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredObras, setFilteredObras] = useState<Obra[]>(obras);

  useEffect(() => {
    const filtered = obras.filter(obra =>
      obra.nombreParaMostrar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra.clienteNombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      obra.descripcionNotas?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredObras(filtered);
  }, [obras, searchQuery]);

  const handleObraSelect = (obra: Obra) => {
    onObraSelect(obra);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Cargando obras...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-4">
        <div className="text-red-500 text-center">
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold">Error al cargar obras</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="secondary"
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900">Seleccionar Obra</h1>
        <p className="text-sm text-gray-600 mt-1">
          {selectedObra 
            ? `Obra seleccionada: ${selectedObra.nombreParaMostrar}`
            : 'Seleccione una obra para continuar'
          }
        </p>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar obra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
          />
          <svg
            className="absolute right-3 top-3.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Obras List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredObras.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-gray-500">No se encontraron obras</p>
            <p className="text-sm text-gray-400 mt-1">
              {searchQuery ? 'Intente con otra búsqueda' : 'No hay obras disponibles'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredObras.map((obra) => (
              <div
                key={obra.id}
                onClick={() => handleObraSelect(obra)}
                className={`
                  bg-white rounded-lg border p-4 cursor-pointer transition-all duration-200
                  hover:shadow-md hover:border-blue-300 active:scale-[0.98]
                  ${selectedObra?.id === obra.id 
                    ? 'border-blue-500 shadow-sm ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {obra.nombreParaMostrar}
                    </h3>
                    
                    {obra.clienteNombre && (
                      <p className="text-sm text-gray-600 mt-1">
                        Cliente: {obra.clienteNombre}
                      </p>
                    )}
                    
                    {obra.empresaInternaNombre && (
                      <p className="text-sm text-gray-600">
                        Empresa: {obra.empresaInternaNombre}
                      </p>
                    )}
                    
                    {obra.descripcionNotas && (
                      <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                        {obra.descripcionNotas}
                      </p>
                    )}
                  </div>
                  
                  <div className="ml-4">
                    {selectedObra?.id === obra.id ? (
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-full">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status indicator */}
                <div className="mt-3 flex items-center">
                  <div className={`
                    w-2 h-2 rounded-full mr-2
                    ${obra.estatusActivo ? 'bg-green-500' : 'bg-red-500'}
                  `} />
                  <span className="text-xs text-gray-600">
                    {obra.estatusActivo ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Continue Button */}
      {selectedObra && (
        <div className="p-4 bg-white border-t border-gray-200">
          <Button
            onClick={() => {
              // Navigate to capture acarreo page using Next.js router
              router.push('/operator/capture-acarreo');
            }}
            className="w-full py-3 text-base font-semibold"
            size="lg"
          >
            Continuar con {selectedObra.nombreParaMostrar}
          </Button>
        </div>
      )}
    </div>
  );
}