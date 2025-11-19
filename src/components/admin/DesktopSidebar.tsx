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
      <div className={`p-6 border-b flex-shrink-0 ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
        <Link href="/admin" className={`text-xl tracking-wider transition-colors block`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
          <span style={{ color: '#2D3748', fontWeight: 900 }}>Acarreo</span><span style={{ color: '#38A169', fontWeight: 800 }}>.mx</span>
        </Link>
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
                        : 'bg-[#E6F4EA] text-[#38A169] border-l-2 border-[#38A169]'
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

    </aside>
  );
}
