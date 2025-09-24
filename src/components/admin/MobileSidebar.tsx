
'use client';

import React from 'react';
import Link from 'next/link';

interface NavItem {
  name: string;
  href: string;
}

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
}

export default function MobileSidebar({ isOpen, onClose, navItems }: MobileSidebarProps) {
  return (
    <div
      className={`fixed inset-0 z-50 lg:hidden ${isOpen ? 'block' : 'hidden'}`}
      aria-labelledby="slide-over-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

      <div className={`fixed inset-y-0 left-0 flex max-w-full pr-10 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition ease-in-out duration-300 sm:duration-700`}>
        <div className="w-screen max-w-xs">
          <div className="h-full flex flex-col py-6 bg-gray-900 shadow-xl">
            <div className="px-4 sm:px-6 flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-blue-400" onClick={onClose}>Acarreos App</Link>
              <button
                type="button"
                className="-mr-2 flex items-center justify-center rounded-md text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                onClick={onClose}
              >
                <span className="sr-only">Close panel</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-5 flex-1 px-4 sm:px-6">
              <nav className="flex-1 space-y-1">
                <ul>
                  {navItems.map((item, index) => (
                    <li key={index} className="mb-3">
                      {item.name === '---' ? (
                        <hr className="my-3 border-t border-gray-700" />
                      ) : (
                        <Link href={item.href} onClick={onClose} className="block py-2 px-3 rounded-md text-gray-200 hover:bg-gray-700 hover:text-white transition-colors">
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
