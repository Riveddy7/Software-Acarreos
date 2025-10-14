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
    { name: 'Dashboard', href: '/admin' },
    { name: '---', href: '#' },
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

      <div className="flex-1 flex flex-col">
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white border-gray-200">
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

        <header className="hidden lg:flex items-center justify-between px-6 py-4 border-b bg-white border-gray-200">
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