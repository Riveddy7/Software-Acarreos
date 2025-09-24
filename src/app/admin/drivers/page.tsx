
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Driver } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import Modal from '@/components/ui/Modal';
import DriverForm from '@/components/admin/DriverForm';

const DRIVERS_COLLECTION = 'drivers';

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Driver>(DRIVERS_COLLECTION);
      setDrivers(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los choferes. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleAddNew = () => {
    setEditingDriver(null);
    setIsModalOpen(true);
  };

  const handleEdit = (driver: Driver) => {
    setEditingDriver(driver);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este chofer?')) {
      try {
        await deleteDocument(DRIVERS_COLLECTION, id);
        await fetchDrivers();
      } catch (e) {
        console.error(e);
        alert('Error al eliminar el chofer.');
      }
    }
  };

  const handleSave = async (data: Omit<Driver, 'id' | 'createdAt'>) => {
    try {
      if (editingDriver) {
        await updateDocument(DRIVERS_COLLECTION, editingDriver.id, data);
      } else {
        await addDocument(DRIVERS_COLLECTION, data);
      }
      await fetchDrivers();
      setIsModalOpen(false);
      setEditingDriver(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el chofer.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Choferes</h1> {/* Added text color */}
        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
        >
          + Agregar Nuevo
        </button>
      </div>

      {isLoading && <p className="text-gray-700">Cargando choferes...</p>} {/* Added text color */}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md border border-red-200">{error}</p>} {/* Adjusted error styles */}

      {!isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"> {/* Added border */}
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50 border-b border-gray-200"> {/* Added background color to header */}
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID del Activo</th> {/* Adjusted text styles */}
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Licencia</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Código QR</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-mono text-sm text-blue-600 hover:underline cursor-pointer">
                    <Link href={`/admin/drivers/${driver.id}`}>
                      {driver.id}
                    </Link>
                  </td> {/* Adjusted text color and made it a link */}
                  <td className="py-4 px-4 font-medium text-gray-900">{driver.name}</td> {/* Adjusted text color and weight */}
                  <td className="py-4 px-4 text-gray-700">{driver.licenseNumber}</td> {/* Adjusted text color */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${driver.status === 'IN_SHIPMENT' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {driver.status === 'IN_SHIPMENT' ? 'En Acarreo' : 'Disponible'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <QrCodeDisplay value={driver.id} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleEdit(driver)}
                      className="px-3 py-1 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(driver.id)}
                      className="px-3 py-1 rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500" // Adjusted button styles
                    >
                      Borrar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingDriver ? 'Editar Chofer' : 'Agregar Nuevo Chofer'}
      >
        <DriverForm 
          driver={editingDriver}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
