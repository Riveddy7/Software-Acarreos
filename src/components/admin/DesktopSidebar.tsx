'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

interface DesktopSidebarProps {
  navItems: NavItem[];
  theme: 'light' | 'dark';
}

export default function DesktopSidebar({ navItems, theme }: DesktopSidebarProps) {
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href) && href !== '#';
  };

  return (
    <aside className={`hidden lg:flex flex-shrink-0 w-64 border-r h-screen flex-col ${isDark ? 'bg-[#313636] border-[#7a7282]/20' : 'bg-white border-gray-200'}`}>
      <div className={`p-6 border-b ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
        <Link href="/admin" className={`text-xl font-light tracking-wider transition-colors block ${isDark ? 'text-[#f6eef6] hover:text-[#bebfd5]' : 'text-gray-900 hover:text-blue-600'}`}>
          ACARREOS
        </Link>
        <p className={`text-xs mt-1 tracking-wide ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>SISTEMA DE GESTIÓN</p>
      </div>
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              {item.name === '---' ? (
                <div className={`my-3 border-t ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`} />
              ) : (
                <Link
                  href={item.href}
                  className={`block py-2.5 px-4 text-sm font-medium transition-colors rounded-sm ${
                    isActive(item.href)
                      ? isDark
                        ? 'bg-[#7a7282]/20 text-[#f6eef6] border-l-2 border-[#bebfd5]'
                        : 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                      : isDark
                        ? 'text-[#bebfd5] hover:bg-[#7a7282]/10 hover:text-[#f6eef6]'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <div className={`p-4 border-t ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
        <div className={`text-xs text-center ${isDark ? 'text-[#7a7282]' : 'text-gray-500'}`}>
          <p>v2.04</p>
          <p className="mt-1">IBM Carbon Design</p>
        </div>
      </div>
    </aside>
  );
}
