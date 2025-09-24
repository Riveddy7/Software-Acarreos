
import React from 'react';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
}

interface DesktopSidebarProps {
  navItems: NavItem[];
}

export default function DesktopSidebar({ navItems }: DesktopSidebarProps) {
  return (
    <aside className="hidden lg:flex flex-shrink-0 w-64 bg-gray-900 text-gray-100 p-5 shadow-lg h-screen flex-col">
      <Link href="/" className="text-2xl font-bold mb-6 block text-blue-400 hover:text-blue-300 transition-colors">Acarreos App</Link>
      <nav className="flex-1">
        <ul>
          {navItems.map((item, index) => (
            <li key={index} className="mb-3">
              {item.name === '---' ? (
                <hr className="my-3 border-t border-gray-700" />
              ) : (
                <Link href={item.href} className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
