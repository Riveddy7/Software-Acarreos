'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function OperatorPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Redirect to obra selection if no obra is selected
    const selectedObra = localStorage.getItem('selectedObra');
    
    if (user && !selectedObra) {
      router.push('/operator/obra-selection');
      return;
    }

    // If obra is selected, redirect to capture acarreo
    if (user && selectedObra) {
      router.push('/operator/capture-acarreo');
    }
  }, [user, router]);

  // This page acts as a redirect based on session state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
}
