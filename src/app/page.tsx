'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, userProfile, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login');
      } else if (userProfile) {
        // Authenticated, redirect based on role
        if (userProfile.role === 'admin') {
          router.push('/admin');
        } else if (userProfile.role === 'operator') {
          router.push('/operator');
        }
      }
    }
  }, [user, userProfile, loading, router]);

  // Show loading while checking authentication
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 mb-4">Software Acarreos</div>
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    </div>
  );
}