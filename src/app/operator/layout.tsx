'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import OperatorNavigation from '@/components/operator/OperatorNavigation';

export default function OperatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Check if we're on a main operator page (not login)
  const isMainOperatorPage = pathname?.startsWith('/operator') && 
    !pathname?.includes('/login') && 
    !pathname?.includes('/obra-selection') && 
    !pathname?.includes('/capture-acarreo');

  const handleLogout = () => {
    // Clear session
    localStorage.removeItem('selectedObra');
    localStorage.removeItem('selectedObra');
    
    // Redirect to login
    router.push('/login');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirigiendo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 bg-opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-4 bg-blue-600">
          <h1 className="text-xl font-semibold text-white">
            Operador
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-white hover:bg-blue-700 p-2 rounded-md"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7m7 6v6h7m-7-6v6h7" />
            </svg>
          </button>
        </div>

        <div className="flex-1 h-0 pt-4 overflow-y-auto">
          <OperatorNavigation />
          
          {/* User Info and Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.email}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {userProfile?.role === 'operator' ? 'Operador' : 'Administrador'}
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m4 4V7a2 2 0 01-2-2H5a2 2 0 00-2-2v9a2 2 0 002-2h2a2 2 0 002 2z" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64">
        {/* Top bar for mobile */}
        <div className="lg:hidden sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7m7 6v6h7m-7-6v6h7" />
            </svg>
          </button>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">
              Sistema de Acarreos
            </h1>
            
            {/* User menu for mobile */}
            <div className="relative">
              <button
                onClick={handleLogout}
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Open user menu</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {isMainOperatorPage && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36-1.36-2.009 0-2.009.545.545 0 1.363.009 1.363 2.009.545.545 2.009H4.909c-.447 0-.89-.445-1.98-.89-2.98H4.909c-.445 0-.89-.445-1.977-.89-1.977H2.75c-.447 0-.89-.445-2.473-.89-2.473C.273 5.983 0 6.727 0 2.473.727 2.473 6.727 2.473c.445 0 .89.445 1.98.89 2.98z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <strong>Modo Operador:</strong> Esta es la versión móvil optimizada para captura de acarreos en campo.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    Para acceder al panel de administración, cierre sesión y use la versión de escritorio.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
}
