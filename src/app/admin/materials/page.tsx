
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Material } from '@/models/types';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import QrCodeDisplay from '@/components/admin/QrCodeDisplay';
import Modal from '@/components/ui/Modal';
import MaterialForm from '@/components/admin/MaterialForm';

const MATERIALS_COLLECTION = 'materials';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getCollection<Material>(MATERIALS_COLLECTION);
      setMaterials(data);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar los materiales. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleAddNew = () => {
    setEditingMaterial(null);
    setIsModalOpen(true);
  };

  const handleEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este material?')) {
      try {
        await deleteDocument(MATERIALS_COLLECTION, id);
        await fetchMaterials();
      } catch (e) {
        console.error(e);
        alert('Error al eliminar el material.');
      }
    }
  };

  const handleSave = async (data: Omit<Material, 'id' | 'createdAt'>) => {
    try {
      if (editingMaterial) {
        await updateDocument(MATERIALS_COLLECTION, editingMaterial.id, data);
      } else {
        await addDocument(MATERIALS_COLLECTION, data);
      }
      await fetchMaterials();
      setIsModalOpen(false);
      setEditingMaterial(null);
    } catch (e) {
      console.error(e);
      alert('Error al guardar el material.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Materiales</h1> {/* Added text color */}
        <button
          onClick={handleAddNew}
          className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
        >
          + Agregar Nuevo
        </button>
      </div>

      {isLoading && <p className="text-gray-700">Cargando materiales...</p>} {/* Added text color */}
      {error && <p className="text-red-600 bg-red-100 p-4 rounded-md border border-red-200">{error}</p>} {/* Adjusted error styles */}

      {!isLoading && !error && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"> {/* Added border */}
          <table className="w-full table-auto text-left">
            <thead className="bg-gray-50 border-b border-gray-200"> {/* Added background color to header */}
              <tr>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">ID del Activo</th> {/* Adjusted text styles */}
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Nombre</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Unidad</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider">Código QR</th>
                <th className="py-3 px-4 text-sm font-semibold text-gray-600 uppercase tracking-wider text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((material) => (
                <tr key={material.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-mono text-sm text-blue-600 hover:underline cursor-pointer">
                    <Link href={`/admin/materials/${material.id}`}>
                      {material.id}
                    </Link>
                  </td> {/* Adjusted text color and made it a link */}
                  <td className="py-4 px-4 font-medium text-gray-900">{material.name}</td> {/* Adjusted text color and weight */}
                  <td className="py-4 px-4 text-gray-700">{material.unit}</td> {/* Adjusted text color */}
                  <td className="py-4 px-4">
                    <QrCodeDisplay value={material.id} />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleEdit(material)}
                      className="px-3 py-1 rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors text-sm mr-2 focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(material.id)}
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
        title={editingMaterial ? 'Editar Material' : 'Agregar Nuevo Material'}
      >
        <MaterialForm 
          material={editingMaterial}
          onSave={handleSave}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
