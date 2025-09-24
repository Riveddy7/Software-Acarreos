
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Location } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import LocationForm from '@/components/admin/LocationForm';

const LOCATIONS_COLLECTION = 'locations';

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Location>(LOCATIONS_COLLECTION);
      setLocations(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las ubicaciones. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleAddNew = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    // Note: Locations are not meant to have QR codes displayed in the admin panel per requirements
    if (confirm('¿Estás seguro de que quieres eliminar esta ubicación?')) {
      try {
        await deleteDocument(LOCATIONS_COLLECTION, id);
        await fetchLocations();
      } catch (e) {
        console.error(e);
        alert('Error al eliminar la ubicación.');
      }
    }
  };

  const handleSave = async (data: Omit<Location, 'id' | 'createdAt'>) => {
    try {
      if (editingLocation) {
        await updateDocument(LOCATIONS_COLLECTION, editingLocation.id, data);
      } else {
        await addDocument(LOCATIONS_COLLECTION, data);
      }
      await fetchLocations();
      setIsModalOpen(false);
      setEditingLocation(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar la ubicación.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Ubicaciones</h1> {/* Added text color */}
        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
        >
          + Agregar Nuevo
        </button>
      </div>

      {isLoading && <p className="text-gray-700">Cargando ubicaciones...</p>} {/* Added text color */}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md border border-red-200">{error}</p>} {/* Adjusted error styles */}

      {!isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"> {/* Added border */}
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50 border-b border-gray-200"> {/* Added background color to header */}
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID</th> {/* Adjusted text styles */}
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Dirección</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-mono text-sm text-gray-700">{location.id}</td> {/* Adjusted text color */}
                  <td className="py-4 px-4 font-medium text-gray-900">{location.name}</td> {/* Adjusted text color and weight */}
                  <td className="py-4 px-4 text-gray-700">{location.address}</td> {/* Adjusted text color */}
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleEdit(location)}
                      className="px-3 py-1 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(location.id)}
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
        title={editingLocation ? 'Editar Ubicación' : 'Agregar Nueva Ubicación'}
      >
        <LocationForm 
          location={editingLocation}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
