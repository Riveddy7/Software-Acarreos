'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RequisicionMaterial, Obra, Proveedor, Transportista, Material } from '@/models/types';
import { getCollection, addDocument } from '@/lib/firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/Button';

interface RequisicionMaterialItem {
  idMaterial: string;
  cantidad: number;
  nombreMaterial?: string;
  unidadMaterial?: string;
}

export default function NuevaRequisicionMaterialPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fechaSolicitud: new Date(),
    estatusAutorizado: false,
    idObra: '',
    idProveedor: '',
    idTransportista: '',
    descripcionCorta: '',
    descripcionNotas: '',
    facturaSerieFolio: '',
    folioOrdenCompraExterno: ''
  });
  
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);
  const [obras, setObras] = useState<Obra[]>([]);
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [transportistas, setTransportistas] = useState<Transportista[]>([]);
  const [materialesRequisicion, setMaterialesRequisicion] = useState<RequisicionMaterialItem[]>([
    { idMaterial: '', cantidad: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Cargando datos del formulario...');
      
      const [materialesData, unidadesData, obrasData, proveedoresData, transportistasData] = await Promise.all([
        getCollection<Material>('materials'),
        getCollection('unidades'),
        getCollection<Obra>('obras'),
        getCollection<Proveedor>('suppliers'),
        getCollection<Transportista>('transportistas')
      ]);
      
      console.log('Materiales cargados:', materialesData);
      console.log('Unidades cargadas:', unidadesData);
      console.log('Obras cargadas:', obrasData);
      console.log('Proveedores cargados:', proveedoresData);
      console.log('Transportistas cargados:', transportistasData);
      
      setMateriales(materialesData);
      setUnidades(unidadesData);
      setObras(obrasData);
      setProveedores(proveedoresData);
      setTransportistas(transportistasData);
    } catch (error) {
      console.error('Error loading form data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMaterialChange = (index: number, field: string, value: any) => {
    const nuevosMateriales = [...materialesRequisicion];
    if (field === 'idMaterial') {
      const materialSeleccionado = materiales.find(m => m.id === value);
      // Buscar la unidad correspondiente
      const unidadSeleccionada = unidades.find((u: any) => u.id === materialSeleccionado?.idUnidad);
      
      nuevosMateriales[index] = {
        ...nuevosMateriales[index],
        idMaterial: value,
        nombreMaterial: materialSeleccionado?.nombreParaMostrar || '',
        unidadMaterial: unidadSeleccionada?.nombre || materialSeleccionado?.unidadNombre || ''
      };
    } else {
      nuevosMateriales[index] = {
        ...nuevosMateriales[index],
        [field]: value
      };
    }
    setMaterialesRequisicion(nuevosMateriales);
  };

  const agregarMaterial = () => {
    setMaterialesRequisicion([...materialesRequisicion, { idMaterial: '', cantidad: 0 }]);
  };

  const eliminarMaterial = (index: number) => {
    const nuevosMateriales = materialesRequisicion.filter((_, i) => i !== index);
    setMaterialesRequisicion(nuevosMateriales);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.idObra || !formData.idProveedor || !formData.idTransportista) {
      alert('Por favor, complete todos los campos requeridos.');
      return;
    }

    // Validar que todos los materiales tengan ID y cantidad válida
    const materialesValidos = materialesRequisicion.filter(m => m.idMaterial && m.cantidad > 0);
    
    // Verificar si hay materiales sin cantidad
    const materialesSinCantidad = materialesRequisicion.filter(m => m.idMaterial && (!m.cantidad || m.cantidad <= 0));
    
    if (materialesSinCantidad.length > 0) {
      alert('Por favor, ingrese una cantidad válida para todos los materiales seleccionados.');
      return;
    }
    
    if (materialesValidos.length === 0) {
      alert('Por favor, agregue al menos un material con cantidad válida.');
      return;
    }

    try {
      setSaving(true);
      
      // Obtener nombres desnormalizados
      const obraSeleccionada = obras.find(o => o.id === formData.idObra);
      const proveedorSeleccionado = proveedores.find(p => p.id === formData.idProveedor);
      const transportistaSeleccionado = transportistas.find(t => t.id === formData.idTransportista);

      const nuevaRequisicion = {
        fechaSolicitud: Timestamp.fromDate(formData.fechaSolicitud),
        estatusAutorizado: formData.estatusAutorizado,
        idObra: formData.idObra,
        idProveedor: formData.idProveedor,
        idTransportista: formData.idTransportista,
        descripcionCorta: formData.descripcionCorta || '',
        descripcionNotas: formData.descripcionNotas || '',
        facturaSerieFolio: formData.facturaSerieFolio || '',
        folioOrdenCompraExterno: formData.folioOrdenCompraExterno || '',
        obraNombre: obraSeleccionada?.nombreParaMostrar || '',
        proveedorNombre: proveedorSeleccionado?.nombreParaMostrar || '',
        transportistaNombre: transportistaSeleccionado?.nombre || ''
      };

      const requisicionId = await addDocument('requisiciones-material', nuevaRequisicion);
      
      console.log('ID de requisición creada:', requisicionId);
      
      // Agregar los materiales a la requisición
      for (const material of materialesValidos) {
        const materialInfo = materiales.find(m => m.id === material.idMaterial);
        await addDocument('requisiciones-materiales-items', {
          idRequisicion: requisicionId,
          idMaterial: material.idMaterial,
          cantidad: material.cantidad,
          nombreMaterial: materialInfo?.nombreParaMostrar || '',
          unidadMaterial: materialInfo?.unidadNombre || ''
        });
      }

      alert('Requisición creada correctamente.');
      router.push('/admin/requisiciones-material-vista');
    } catch (error) {
      console.error('Error al crear requisición:', error);
      alert('Error al crear la requisición. Por favor, inténtelo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">Nueva Requisición de Material</h1>
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/requisiciones-material-vista')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información General */}
              <div className="lg:col-span-3 space-y-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Información General</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Solicitud *
                    </label>
                    <input
                      type="date"
                      value={formData.fechaSolicitud.toISOString().split('T')[0]}
                      onChange={(e) => handleInputChange('fechaSolicitud', new Date(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Obra *
                    </label>
                    <select
                      value={formData.idObra}
                      onChange={(e) => handleInputChange('idObra', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccione una obra</option>
                      {obras.map((obra) => (
                        <option key={obra.id} value={obra.id}>
                          {obra.nombreParaMostrar}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Proveedor *
                    </label>
                    <select
                      value={formData.idProveedor}
                      onChange={(e) => handleInputChange('idProveedor', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccione un proveedor</option>
                      {proveedores.map((proveedor) => (
                        <option key={proveedor.id} value={proveedor.id}>
                          {proveedor.nombreParaMostrar}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Transportista *
                    </label>
                    <select
                      value={formData.idTransportista}
                      onChange={(e) => handleInputChange('idTransportista', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Seleccione un transportista</option>
                      {transportistas.map((transportista) => (
                        <option key={transportista.id} value={transportista.id}>
                          {transportista.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="estatusAutorizado"
                      checked={formData.estatusAutorizado}
                      onChange={(e) => handleInputChange('estatusAutorizado', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="estatusAutorizado" className="ml-2 block text-sm text-gray-700">
                      Autorizada
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="lg:col-span-3 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Información Adicional</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción Corta
                  </label>
                  <input
                    type="text"
                    value={formData.descripcionCorta}
                    onChange={(e) => handleInputChange('descripcionCorta', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Descripción breve"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Folio Orden de Compra Externo
                  </label>
                  <input
                    type="text"
                    value={formData.folioOrdenCompraExterno}
                    onChange={(e) => handleInputChange('folioOrdenCompraExterno', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Folio OC externo"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Factura Serie Folio
                  </label>
                  <input
                    type="text"
                    value={formData.facturaSerieFolio}
                    onChange={(e) => handleInputChange('facturaSerieFolio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Factura serie y folio"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción y Notas
                </label>
                <textarea
                  value={formData.descripcionNotas}
                  onChange={(e) => handleInputChange('descripcionNotas', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción detallada y notas adicionales"
                />
              </div>
            </div>
          </div>

          {/* Materiales */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Materiales Requeridos</h2>
                <p className="text-sm text-gray-500">
                  {materiales.length > 0
                    ? `${materiales.length} materiales disponibles`
                    : 'No hay materiales registrados en el sistema'}
                </p>
              </div>
              <Button
                type="button"
                onClick={agregarMaterial}
                variant="outline"
                className="text-green-600 hover:text-green-800 border-green-600"
              >
                + Agregar Material
              </Button>
            </div>
            
            <div className="space-y-4">
              {materialesRequisicion.map((material, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Material *
                      </label>
                      <select
                        value={material.idMaterial}
                        onChange={(e) => handleMaterialChange(index, 'idMaterial', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccione un material</option>
                        {materiales.length === 0 ? (
                          <option value="" disabled>No hay materiales disponibles</option>
                        ) : (
                          materiales.map((mat) => (
                            <option key={mat.id} value={mat.id}>
                              {mat.nombreParaMostrar}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <div className="flex">
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={material.cantidad || ''}
                          onChange={(e) => handleMaterialChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          required
                        />
                        <div className="inline-flex items-center px-3 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md text-gray-600 text-sm">
                          {material.unidadMaterial || 'Unidad'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <div className="text-sm text-gray-600">
                        {material.nombreMaterial && (
                          <p>Material: <span className="font-medium">{material.nombreMaterial}</span></p>
                        )}
                        {material.unidadMaterial && (
                          <p>Unidad: <span className="font-medium">{material.unidadMaterial}</span></p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      {materialesRequisicion.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => eliminarMaterial(index)}
                          variant="danger"
                          className="text-red-600 hover:text-red-800"
                        >
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.push('/admin/requisiciones-material-vista')}
              className="text-gray-600 hover:text-gray-900"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? 'Guardando...' : 'Crear Requisición'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}