
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  name: string;
  href: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  theme: 'light' | 'dark';
}

export default function MobileSidebar({ isOpen, onClose, navItems, theme }: MobileSidebarProps) {
  const pathname = usePathname();
  const isDark = theme === 'dark';

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href) && href !== '#';
  };

  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div className={`fixed inset-0 transition-opacity ${isDark ? 'bg-[#000006]/80' : 'bg-gray-900/50'}`} aria-hidden="true" onClick={onClose}></div>

      <div className={`fixed inset-y-0 left-0 flex max-w-full pr-10 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition ease-in-out duration-300 sm:duration-700`}>
        <div className="w-screen max-w-xs">
          <div className={`h-full flex flex-col border-r ${isDark ? 'bg-[#313636] border-[#7a7282]/20' : 'bg-white border-gray-200'}`}>
            <div className={`px-6 py-4 flex items-center justify-between border-b ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`}>
              <Link href="/admin" className={`text-lg tracking-wider`} onClick={onClose} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                <span style={{ color: '#2D3748', fontWeight: 900 }}>Acarreo</span><span style={{ color: '#38A169', fontWeight: 800 }}>.mx</span>
              </Link>
              <button
                type="button"
                className={`flex items-center justify-center focus:outline-none ${isDark ? 'text-[#bebfd5] hover:text-[#f6eef6]' : 'text-gray-700 hover:text-gray-900'}`}
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 px-4 py-4 overflow-y-auto">
              <nav className="space-y-1">
                <ul>
                  {navItems.map((item, index) => (
                    <li key={index}>
                      {item.name === '---' ? (
                        <div className={`my-3 border-t ${isDark ? 'border-[#7a7282]/20' : 'border-gray-200'}`} />
                      ) : (
                        <Link
                          href={item.href}
                          onClick={onClose}
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
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
