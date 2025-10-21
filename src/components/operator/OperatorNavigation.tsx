'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OperatorNavigation() {
  const pathname = usePathname();

  const isActive = pathname === '/operator';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 z-50 safe-area-mobile">
      <div className="container-mobile mx-auto flex justify-center">
        <Link
          href="/operator"
          className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 ${
            isActive
              ? 'text-green-600 bg-green-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1 font-semibold">Inicio</span>
        </Link>
      </div>
    </nav>
  );
}