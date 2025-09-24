
import React from 'react';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900"> {/* Lighter background, strong text contrast */}
      <header className="bg-blue-700 text-white p-4 shadow-lg"> {/* Darker blue header, more prominent shadow */}
        <h1 className="text-2xl font-bold text-center">Operador de Acarreos</h1> {/* Larger, bolder title */}
      </header>
      <main className="flex-1 flex flex-col justify-start items-center p-4 sm:p-6 md:p-8"> {/* Adjusted padding for mobile-first, justify-start for content flow */}
        {children}
      </main>
    </div>
  );
}
