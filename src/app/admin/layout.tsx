'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import MobileSidebar from '@/components/admin/MobileSidebar';
import DesktopSidebar from '@/components/admin/DesktopSidebar';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { signOut, userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();

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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen ${isDark ? 'bg-[#000006] text-[#f6eef6]' : 'bg-gray-100 text-gray-900'}`}>
      {/* Desktop Sidebar */}
      <DesktopSidebar navItems={navItems} theme={theme} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className={`lg:hidden flex items-center justify-between p-4 border-b ${isDark ? 'bg-[#313636] border-[#7a7282]/20' : 'bg-white border-gray-200'}`}>
          <Link href="/" className={`text-xl font-light ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>Acarreos App</Link>
          <div className="flex items-center space-x-4">
            <Link href="/admin/ticket-reader" className={`px-3 py-2 rounded-sm text-sm font-medium transition-colors ${isDark ? 'bg-[#bebfd5] text-[#000006] hover:bg-[#f6eef6]' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
              Lector
            </Link>
            <button onClick={() => setIsSidebarOpen(true)} className={`focus:outline-none ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className={`hidden lg:flex items-center justify-between px-6 py-4 border-b ${isDark ? 'bg-[#313636] border-[#7a7282]/20' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center space-x-4">
            <h1 className={`text-lg font-light tracking-wide ${isDark ? 'text-[#f6eef6]' : 'text-gray-900'}`}>PANEL DE ADMINISTRACIÓN</h1>
          </div>
          <div className="flex items-center space-x-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-colors ${isDark ? 'bg-[#7a7282]/20 text-[#bebfd5] hover:bg-[#7a7282]/30 hover:text-[#f6eef6]' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
              title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <span className={`text-sm ${isDark ? 'text-[#bebfd5]' : 'text-gray-600'}`}>
              {userProfile?.username}
            </span>
            <button
              onClick={handleSignOut}
              className={`px-4 py-2 rounded-sm text-sm font-medium transition-colors border ${isDark ? 'bg-[#7a7282]/20 text-[#bebfd5] hover:bg-[#7a7282]/30 hover:text-[#f6eef6] border-[#7a7282]/30' : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'}`}
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        <main className={`flex-1 p-6 lg:p-8 overflow-y-auto ${isDark ? 'bg-[#000006]' : 'bg-gray-100'}`}>
          {children}
        </main>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} navItems={navItems} theme={theme} />
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