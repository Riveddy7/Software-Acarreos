
'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  const { signOut, userProfile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="operator">
      <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-blue-700 text-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Operador de Acarreos</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {userProfile?.username}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </header>
        <main className="flex-1 flex flex-col justify-start items-center p-4 sm:p-6 md:p-8">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
