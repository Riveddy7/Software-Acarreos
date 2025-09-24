
'use client';

import React, { useState, useEffect } from 'react';
import { Truck, TruckStatus } from '@/models/types';

interface TruckFormProps {
  truck?: Truck | null; // Truck to edit, or null for new truck
  onSave: (truckData: Omit<Truck, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function TruckForm({ truck, onSave, onCancel }: TruckFormProps) {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');

  useEffect(() => {
    if (truck) {
      setPlate(truck.plate);
      setModel(truck.model);
    } else {
      setPlate('');
      setModel('');
    }
  }, [truck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !model) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    onSave({ plate, model, status: truck?.status || 'AVAILABLE' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
          <input
            type="text"
            id="plate"
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: ABC-1234"
          />
        </div>
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
          <input
            type="text"
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: Volvo FMX"
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
