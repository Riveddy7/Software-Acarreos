'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/models/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({
  children,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user || !userProfile) {
    return null; // Will redirect in useEffect
  }

  // Check role access
  if (requiredRole) {
    const hasAccess = requiredRole === 'admin'
      ? userProfile.role === 'admin'
      : userProfile.role === requiredRole || userProfile.role === 'admin';

    if (!hasAccess) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
          <div className="max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Acceso Denegado
            </h2>
            <p className="text-gray-600 mb-6">
              No tienes permisos para acceder a esta sección.
            </p>
            <button
              onClick={() => router.back()}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Volver
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}