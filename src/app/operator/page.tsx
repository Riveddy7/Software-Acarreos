
'use client';

import Link from 'next/link';
import React from 'react';
import LocationSelector from '@/components/operator/LocationSelector';

export default function OperatorHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full space-y-6 p-4">
      {/* Location Selector */}
      <LocationSelector />

      {/* Operation Buttons */}
      <Link href="/operator/receptions" className="w-full max-w-sm">
        <button className="w-full bg-purple-600 text-white text-2xl font-bold py-6 rounded-md shadow-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500">
          Recepciones
        </button>
      </Link>
      <Link href="/operator/dispatch" className="w-full max-w-sm">
        <button className="w-full bg-green-600 text-white text-2xl font-bold py-6 rounded-md shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500">
          Iniciar Despacho
        </button>
      </Link>
      <Link href="/operator/delivery" className="w-full max-w-sm">
        <button className="w-full bg-blue-600 text-white text-2xl font-bold py-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
          Registrar Descarga
        </button>
      </Link>
    </div>
  );
}
