
import Link from 'next/link';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { name: 'Acarreos', href: '/admin/shipments' },
    { name: 'Camiones', href: '/admin/trucks' },
    { name: 'Choferes', href: '/admin/drivers' },
    { name: 'Materiales', href: '/admin/materials' },
    { name: 'Ubicaciones', href: '/admin/locations' },
    { name: 'Lector de Tickets', href: '/admin/ticket-reader' }, // New item
    { name: '---', href: '#' }, // Separator
    { name: 'Operador Móvil', href: '/operator' },
  ];

  return (
    <div className="flex h-screen bg-gray-100 text-gray-900"> {/* Changed main background and default text color */}
      <aside className="w-64 flex-shrink-0 bg-gray-900 text-gray-100 p-5 shadow-lg"> {/* Darker sidebar, lighter text, shadow */}
        <Link href="/" className="text-2xl font-bold mb-6 block text-blue-400 hover:text-blue-300 transition-colors">Acarreos App</Link> {/* Brighter link for app title */}
        <nav>
          <ul>
            {navItems.map((item, index) => (
              <li key={index} className="mb-3">
                {item.name === '---' ? (
                  <hr className="my-3 border-t border-gray-700" />
                ) : (
                  <Link href={item.href} className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white transition-colors"> {/* Improved link contrast */}
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-gray-100"> {/* Ensure main content background is light */}
        {children}
      </main>
    </div>
  );
}
