
'use client';

import React, { useState, useEffect } from 'react';
import { Location } from '@/models/types';

interface LocationFormProps {
  location?: Location | null;
  onSave: (data: Omit<Location, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function LocationForm({ location, onSave, onCancel }: LocationFormProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (location) {
      setName(location.name);
      setAddress(location.address);
    } else {
      setName('');
      setAddress('');
    }
  }, [location]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert('Por favor, asigne un nombre a la ubicación.');
      return;
    }
    onSave({ name, address });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Ubicación</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: Mina El Tule"
          />
        </div>
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Dirección (Opcional)</label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: Carretera a Colima, Km 15"
          />
        </div>
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400" // Adjusted button styles
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
