
'use client';

import React, { useState, useEffect } from 'react';
import { Driver, DriverStatus } from '@/models/types';

interface DriverFormProps {
  driver?: Driver | null;
  onSave: (driverData: Omit<Driver, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function DriverForm({ driver, onSave, onCancel }: DriverFormProps) {
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  useEffect(() => {
    if (driver) {
      setName(driver.name);
      setLicenseNumber(driver.licenseNumber);
    } else {
      setName('');
      setLicenseNumber('');
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !licenseNumber) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    onSave({ name, licenseNumber, status: driver?.status || 'AVAILABLE' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: Juan Pérez"
          />
        </div>
        <div>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700 mb-1">ID Chofer (4 letras mayúsculas)</label>
          <input
            type="text"
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => {
              const value = e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase().substring(0, 4);
              setLicenseNumber(value);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" // Adjusted border-radius and text color
            placeholder="Ej: ABCD"
            maxLength={4}
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
