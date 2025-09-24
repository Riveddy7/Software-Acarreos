'use client';

import Link from 'next/link';
import React from 'react';

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900 p-4">
      <h1 className="text-5xl font-extrabold text-blue-600 mb-6 animate-fade-in-down">
        Bienvenido a Acarreos App
      </h1>
      <p className="text-xl text-gray-700 mb-10 text-center animate-fade-in-up">
        Por favor, selecciona tu rol para continuar.
      </p>

      <div className="flex flex-col sm:flex-row gap-6">
        <Link href="/admin/shipments">
          <button className="w-full sm:w-64 px-8 py-4 bg-blue-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300">
            Administración
          </button>
        </Link>
        <Link href="/operator">
          <button className="w-full sm:w-64 px-8 py-4 bg-green-600 text-white text-xl font-bold rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300">
            Operador
          </button>
        </Link>
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.8s ease-out forwards; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out forwards; animation-delay: 0.2s; }
      `}</style>
    </div>
  );
}