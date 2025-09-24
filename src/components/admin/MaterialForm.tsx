
'use client';

import React, { useState, useEffect } from 'react';
import { Material } from '@/models/types';

interface MaterialFormProps {
  material?: Material | null;
  onSave: (data: Omit<Material, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function MaterialForm({ material, onSave, onCancel }: MaterialFormProps) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('toneladas');

  useEffect(() => {
    if (material) {
      setName(material.name);
      setUnit(material.unit);
    } else {
      setName('');
      setUnit('toneladas');
    }
  }, [material]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    onSave({ name, unit });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre del Material</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: Arena Fina Grado 3"
          />
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida</label>
          <input
            type="text"
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: toneladas, m3"
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
