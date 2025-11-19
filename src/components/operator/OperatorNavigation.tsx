'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function OperatorNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  const navigation = [
    {
      name: 'Capturar Acarreo',
      path: '/operator/capture-acarreo',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 6v6m0 4l-4 4m4-4v6m0 0h4m-4 0v4" />
        </svg>
      ),
      description: 'Capturar eventos de acarreo en campo'
    },
    {
      name: 'Seleccionar Obra',
      path: '/operator/obra-selection',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21l-7 7m0 0l-7-7m14 0v3a2 2 0 00-2-2H5a2 2 0 00-2 2v3m14 0a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m0 0a2 2 0 002 2h2a2 2 0 002-2m-2 0h-2a2 2 0 00-2-2" />
        </svg>
      ),
      description: 'Cambiar de obra actual'
    }
  ];

  return (
    <nav className="bg-white shadow-lg">
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Menú Operador</h2>
        </div>
        
        <ul className="mt-4 space-y-2">
          {navigation.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => router.push(item.path)}
                className={`
                  w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-transparent'
                  }
                `}
              >
                <span className="w-5 h-5 mr-3 flex-shrink-0">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}