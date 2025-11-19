'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import MobileSidebar from '@/components/admin/MobileSidebar';
import DesktopSidebar from '@/components/admin/DesktopSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userProfile } = useAuth();
  const { setTheme } = useTheme();
  const pathname = usePathname();

  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const navItems = [
    // OPERACIONES PRINCIPALES (más usado)
    { name: 'Vista de Requisiciones', href: '/admin/requisiciones-material-vista' },
    { name: 'Acarreos', href: '/admin/acarreos' },
    { name: '---', href: '#' },
    
    // GESTIÓN DE CAMIONES Y TRANSPORTE
    { name: 'Camiones', href: '/admin/trucks' },
    { name: 'Transportistas', href: '/admin/transportistas' },
    { name: 'Tipos de Camión', href: '/admin/tipos-camion' },
    { name: 'Clasificaciones de Viaje', href: '/admin/clasificaciones-viaje' },
    { name: '---', href: '#' },
    
    // GESTIÓN DE OBRAS Y LOGÍSTICA
    { name: 'Obras', href: '/admin/obras' },
    { name: 'Lugares', href: '/admin/lugares' },
    { name: 'Rutas', href: '/admin/rutas' },
    { name: 'Tipos de Acarreos', href: '/admin/tipos-acarreo' },
    { name: 'Operadores', href: '/admin/operadores' },
    { name: '---', href: '#' },
    
    // GESTIÓN DE MATERIALES Y PROVEEDORES
    { name: 'Materiales', href: '/admin/materials' },
    { name: 'Clasificaciones de Material', href: '/admin/clasificaciones-material' },
    { name: 'Unidades', href: '/admin/unidades' },
    { name: 'Proveedores', href: '/admin/suppliers' },
    { name: '---', href: '#' },
    
    // GESTIÓN ADMINISTRATIVA (menos usado)
    { name: 'Clientes', href: '/admin/clientes' },
    { name: 'Empresas Internas', href: '/admin/empresas-internas' },
    { name: '---', href: '#' },
    
    // SISTEMA Y OPERACIONES
    { name: 'Lector de Tickets', href: '/admin/ticket-reader' },
    { name: 'Tickets', href: '/admin/tickets' },
    { name: 'Usuarios', href: '/admin/users' },
    { name: '---', href: '#' },
    
    // ACCESO MÓVIL
    { name: 'Operador Móvil', href: '/operator' },
  ];

  const getPageTitle = () => {
    const sortedNavItems = [...navItems]
      .filter(item => item.href !== '#')
      .sort((a, b) => b.href.length - a.href.length);

    const activeItem = sortedNavItems.find(item => pathname.startsWith(item.href));
    return activeItem ? activeItem.name : 'Dashboard';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900">
      <DesktopSidebar navItems={navItems} theme="light" />

      <div className="flex-1 flex flex-col min-h-0">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white border-gray-200 flex-shrink-0">
          <Link href="/admin" className="text-xl tracking-wider transition-colors block" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <span style={{ color: '#2D3748', fontWeight: 900 }}>Acarreo</span><span style={{ color: '#38A169', fontWeight: 800 }}>.mx</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/admin/ticket-reader" className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-2 rounded-sm text-sm font-medium transition-colors">
              Lector
            </Link>
            <button onClick={() => setIsSidebarOpen(true)} className="focus:outline-none text-gray-900">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b bg-white border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-extrabold tracking-wide" style={{ color: '#2D3748' }}>{getPageTitle()}</h1>
          </div>
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600">
              {userProfile?.username}
            </span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-sm text-sm font-medium transition-colors border bg-white text-gray-700 hover:bg-gray-100 border-gray-300"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-100">
          {children}
        </main>
      </div>

      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navItems={navItems} theme="light" />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requiredRole="admin">
      <ThemeProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ThemeProvider>
    </ProtectedRoute>
  );
}