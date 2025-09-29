'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import MobileSidebar from '@/components/admin/MobileSidebar';
import DesktopSidebar from '@/components/admin/DesktopSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userProfile } = useAuth();

  const navItems = [
    { name: 'Órdenes de Compra', href: '/admin/purchase-orders' },
    { name: 'Proveedores', href: '/admin/suppliers' },
    { name: '---', href: '#' },
    { name: 'Acarreos', href: '/admin/shipments' },
    { name: 'Camiones', href: '/admin/trucks' },
    { name: 'Choferes', href: '/admin/drivers' },
    { name: 'Materiales', href: '/admin/materials' },
    { name: 'Ubicaciones', href: '/admin/locations' },
    { name: 'Lector de Tickets', href: '/admin/ticket-reader' },
    { name: 'Tickets', href: '/admin/tickets' },
    { name: 'Usuarios', href: '/admin/users' },
    { name: '---', href: '#' },
    { name: 'Operador Móvil', href: '/operator' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="flex h-screen bg-gray-100 text-gray-900">
        {/* Desktop Sidebar */}
        <DesktopSidebar navItems={navItems} />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="lg:hidden flex items-center justify-between bg-gray-900 p-4 shadow-lg">
            <Link href="/" className="text-2xl font-bold text-blue-400">Acarreos App</Link>
            <div className="flex items-center space-x-4">
              <Link href="/admin/ticket-reader" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Lector de Tickets
              </Link>
              <button onClick={() => setIsSidebarOpen(true)} className="text-gray-100 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:flex items-center justify-between bg-white p-4 shadow-sm">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Panel de Administración</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bienvenido, {userProfile?.username}
              </span>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </header>

          <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-100">
            {children}
          </main>
        </div>

        {/* Mobile Sidebar */}
        <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navItems={navItems} />
      </div>
    </ProtectedRoute>
  );
}