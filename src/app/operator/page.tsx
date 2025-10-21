
'use client';

import Link from 'next/link';
import React from 'react';
import LocationSelector from '@/components/operator/LocationSelector';

export default function OperatorHomePage() {
  return (
    <div className="container-mobile mx-auto py-6">
      {/* Location Selector */}
      <div className="mb-8">
        <LocationSelector />
      </div>

      {/* Operation Buttons */}
      <div className="space-y-4">
        <Link href="/operator/receptions" className="block">
          <button className="btn-mobile btn-reception w-full transition-all duration-200">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span className="text-xl font-semibold">Recepciones</span>
          </button>
        </Link>
        
        <Link href="/operator/dispatch" className="block">
          <button className="btn-mobile btn-dispatch w-full transition-all duration-200">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            <span className="text-xl font-semibold">Iniciar Despacho</span>
          </button>
        </Link>
        
        <Link href="/operator/delivery" className="block">
          <button className="btn-mobile btn-delivery w-full transition-all duration-200">
            <svg className="w-6 h-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xl font-semibold">Registrar Descarga</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
