'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getCollection, addDocument, updateDocument, deleteDocument } from '@/lib/firebase/firestore';
import { RequisicionMaterial, Acarreo } from '@/models/types';
import { REQUISICIONES_MATERIAL_COLLECTION, ACARREOS_COLLECTION } from '@/lib/firebase/firestore';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { DataTable } from '@/components/ui/DataTable';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { Column } from '@/components/ui/DataTable';
import { Timestamp } from 'firebase/firestore';

// Definir los posibles estados de una requisición
type RequisicionStatus = 'revision' | 'autorizada' | 'cancelada' | 'parcialmente_surtida' | 'cerrada_parcialmente_surtida' | 'cerrada_totalmente_surtida';

// Mapeo de estados a valores numéricos para la base de datos
const statusMap: Record<RequisicionStatus, number> = {
  'revision': 0,
  'autorizada': 1,
  'cancelada': 2,
  'parcialmente_surtida': 3,
  'cerrada_parcialmente_surtida': 4,
  'cerrada_totalmente_surtida': 5
};

// Mapeo inverso para mostrar en la tabla
const statusDisplayMap: Record<number, { text: string; color: string }> = {
  0: { text: 'En Revisión', color: 'bg-yellow-100 text-yellow-800' },
  1: { text: 'Autorizada', color: 'bg-green-100 text-green-800' },
  2: { text: 'Cancelada', color: 'bg-red-100 text-red-800' },
  3: { text: 'Parcialmente Surtida', color: 'bg-blue-100 text-blue-800' },
  4: { text: 'Cerrada Parcialmente', color: 'bg-indigo-100 text-indigo-800' },
  5: { text: 'Cerrada Totalmente', color: 'bg-purple-100 text-purple-800' }
};

interface RequisicionDetailModalProps {
  requisicion: RequisicionMaterial | null;
  acarreosLigados: Acarreo[];
  onClose: () => void;
  onLinkAcarreo: (requisicionId: string, acarreoId: string) => void;
  onUnlinkAcarreo: (requisicionId: string, acarreoId: string) => void;
}

function RequisicionDetailModal({ requisicion, acarreosLigados, onClose, onLinkAcarreo, onUnlinkAcarreo }: RequisicionDetailModalProps) {
  const [linkingAcarreo, setLinkingAcarreo] = useState<string | null>(null);
  const [unlinkingAcarreo, setUnlinkingAcarreo] = useState<string | null>(null);

  const handleLinkAcarreo = async (acarreoId: string) => {
    if (!requisicion) return;
    
    setLinkingAcarreo(acarreoId);
    try {
      await updateDocument(ACARREOS_COLLECTION, acarreoId, {
        idRequisicionAfectada: requisicion.id
      });
      
      // Actualizar la lista de acarreos ligados
      await onLinkAcarreo(requisicion.id, acarreoId);
    } catch (error) {
      console.error('Error al ligar acarreo:', error);
      alert('Error al ligar el acarreo a la requisición.');
    } finally {
      setLinkingAcarreo(null);
    }
  };

  const handleUnlinkAcarreo = async (acarreoId: string) => {
    if (!requisicion) return;
    
    setUnlinkingAcarreo(acarreoId);
    try {
      await updateDocument(ACARREOS_COLLECTION, acarreoId, {
        idRequisicionAfectada: null
      });
      
      // Actualizar la lista de acarreos ligados
      await onUnlinkAcarreo(requisicion.id, acarreoId);
    } catch (error) {
      console.error('Error al desligar acarreo:', error);
      alert('Error al desligar el acarreo de la requisición.');
    } finally {
      setUnlinkingAcarreo(null);
    }
  };

  if (!requisicion) return null;

  return (
    <Modal isOpen={true} onClose={onClose} title={`Detalles de Requisición - ${requisicion.obraNombre}`}>
      <div className="space-y-6">
        {/* Información general de la requisición */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Información de la Requisición</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm font-medium text-gray-600">ID de Requisición:</span>
              <p className="font-mono text-sm text-gray-900">{requisicion.id}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Fecha de Solicitud:</span>
              <p className="text-sm text-gray-900">
                {requisicion.fechaSolicitud?.toDate().toLocaleDateString()}
              </p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Obra:</span>
              <p className="text-sm text-gray-900">{requisicion.obraNombre}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Proveedor:</span>
              <p className="text-sm text-gray-900">{requisicion.proveedorNombre}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Transportista:</span>
              <p className="text-sm text-gray-900">{requisicion.transportistaNombre}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Descripción Corta:</span>
              <p className="text-sm text-gray-900">{requisicion.descripcionCorta || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Orden de Compra Externo:</span>
              <p className="text-sm text-gray-900">{requisicion.folioOrdenCompraExterno || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Factura:</span>
              <p className="text-sm text-gray-900">{requisicion.facturaSerieFolio || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Descripción:</span>
              <p className="text-sm text-gray-900">{requisicion.descripcionNotas || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Acarreos ligados */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Acarreos Ligados</h3>
          {acarreosLigados.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay acarreos ligados a esta requisición</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Obra
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Camión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Material
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {acarreosLigados.map((acarreo) => (
                    <tr key={acarreo.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {acarreo.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acarreo.fechaHora?.toDate().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acarreo.nombreMostrarObra}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acarreo.nombreMostrarCamion}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acarreo.nombreMaterial}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {acarreo.cantidadCapturada}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnlinkAcarreo(acarreo.id)}
                            disabled={unlinkingAcarreo === acarreo.id}
                            className="text-red-600 hover:text-red-800"
                          >
                            {unlinkingAcarreo === acarreo.id ? 'Desligando...' : 'Desligar'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Botones de acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function RequisicionesMaterialVistaPage() {
  const [requisiciones, setRequisiciones] = useState<RequisicionMaterial[]>([]);
  const [acarreos, setAcarreos] = useState<Acarreo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequisiciones, setSelectedRequisiciones] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRequisicion, setSelectedRequisicion] = useState<RequisicionMaterial | null>(null);
  const [acarreosLigados, setAcarreosLigados] = useState<Acarreo[]>([]);
  
  // Estados para el formulario de nueva requisición
  const [formModalOpen, setFormModalOpen] = useState(false);
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
  
  // Datos para los dropdowns
  const [obras, setObras] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [transportistas, setTransportistas] = useState<any[]>([]);

  const fetchRequisiciones = useCallback(async () => {
    try {
      setIsLoading(true);
      const requisicionesData = await getCollection<RequisicionMaterial>(REQUISICIONES_MATERIAL_COLLECTION);
      setRequisiciones(requisicionesData);
      setError(null);
    } catch (e) {
      console.error(e);
      setError('No se pudieron cargar las requisiciones de material. Asegúrate de que tu configuración de Firebase sea correcta.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAcarreos = useCallback(async () => {
    try {
      const acarreosData = await getCollection<Acarreo>(ACARREOS_COLLECTION);
      setAcarreos(acarreosData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchObras = useCallback(async () => {
    try {
      const obrasData = await getCollection('obras');
      setObras(obrasData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchProveedores = useCallback(async () => {
    try {
      const proveedoresData = await getCollection('suppliers');
      setProveedores(proveedoresData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchTransportistas = useCallback(async () => {
    try {
      const transportistasData = await getCollection('transportistas');
      setTransportistas(transportistasData);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchRequisiciones();
    fetchAcarreos();
    fetchObras();
    fetchProveedores();
    fetchTransportistas();
  }, [fetchRequisiciones, fetchAcarreos, fetchObras, fetchProveedores, fetchTransportistas]);

  const handleSelectRequisicion = (requisicionId: string) => {
    if (selectedRequisiciones.includes(requisicionId)) {
      setSelectedRequisiciones(selectedRequisiciones.filter(id => id !== requisicionId));
    } else {
      setSelectedRequisiciones([...selectedRequisiciones, requisicionId]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRequisiciones([]);
    } else {
      setSelectedRequisiciones(requisiciones.map(r => r.id));
    }
    setSelectAll(!selectAll);
  };

  const openDetailModal = async (requisicionId: string) => {
    const requisicion = requisiciones.find(r => r.id === requisicionId);
    if (!requisicion) return;
    
    setSelectedRequisicion(requisicion);
    
    // Cargar acarreos ligados a esta requisición
    try {
      const acarreosLigadosData = acarreos.filter(acarreo => acarreo.idRequisicionAfectada === requisicionId);
      setAcarreosLigados(acarreosLigadosData);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Error al cargar acarreos ligados:', error);
    }
  };

  const closeDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedRequisicion(null);
    setAcarreosLigados([]);
  };

  const handleLinkAcarreo = async (requisicionId: string, acarreoId: string) => {
    try {
      await updateDocument(ACARREOS_COLLECTION, acarreoId, {
        idRequisicionAfectada: requisicionId
      });
      
      // Actualizar la lista de acarreos ligados
      const updatedAcarreosLigados = [...acarreosLigados, acarreos.find(a => a.id === acarreoId)!];
      setAcarreosLigados(updatedAcarreosLigados);
    } catch (error) {
      console.error('Error al ligar acarreo:', error);
      alert('Error al ligar el acarreo a la requisición.');
    }
  };

  const handleUnlinkAcarreo = async (requisicionId: string, acarreoId: string) => {
    try {
      await updateDocument(ACARREOS_COLLECTION, acarreoId, {
        idRequisicionAfectada: null
      });
      
      // Actualizar la lista de acarreos ligados
      setAcarreosLigados(acarreosLigados.filter(a => a.id !== acarreoId));
    } catch (error) {
      console.error('Error al desligar acarreo:', error);
      alert('Error al desligar el acarreo de la requisición.');
    }
  };

  const changeStatus = async (requisicionId: string, newStatus: RequisicionStatus) => {
    try {
      await updateDocument(REQUISICIONES_MATERIAL_COLLECTION, requisicionId, {
        estatusAutorizado: statusMap[newStatus]
      });
      
      // Actualizar la lista local
      setRequisiciones(requisiciones.map(r =>
        r.id === requisicionId
          ? { ...r, estatusAutorizado: statusMap[newStatus] as any }
          : r
      ));
    } catch (error) {
      console.error('Error al cambiar estatus:', error);
      alert('Error al cambiar el estatus de la requisición.');
    }
  };

  const handleSaveRequisicion = async () => {
    try {
      // Validar campos requeridos
      if (!formData.idObra || !formData.idProveedor || !formData.idTransportista) {
        alert('Por favor, complete todos los campos requeridos.');
        return;
      }

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

      await addDocument(REQUISICIONES_MATERIAL_COLLECTION, nuevaRequisicion);
      
      // Resetear formulario
      setFormData({
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
      
      setFormModalOpen(false);
      
      // Recargar la lista de requisiciones
      fetchRequisiciones();
      
      alert('Requisición creada correctamente.');
    } catch (error) {
      console.error('Error al crear requisición:', error);
      alert('Error al crear la requisición.');
    }
  };

  const filteredRequisiciones = requisiciones.filter(requisicion =>
    (requisicion.obraNombre && requisicion.obraNombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (requisicion.proveedorNombre && requisicion.proveedorNombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (requisicion.transportistaNombre && requisicion.transportistaNombre.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (requisicion.descripcionCorta && requisicion.descripcionCorta.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (requisicion.facturaSerieFolio && requisicion.facturaSerieFolio.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (requisicion.folioOrdenCompraExterno && requisicion.folioOrdenCompraExterno.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Definir columnas para la tabla
  const columns: Column<RequisicionMaterial>[] = [
    {
      key: 'id',
      label: "ID",
      render: (value, requisicion) => (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedRequisiciones.includes(requisicion.id)}
            onChange={() => handleSelectRequisicion(requisicion.id)}
            className="mr-2"
          />
          <span className="font-mono text-sm">{value}</span>
        </div>
      )
    },
    {
      key: 'fechaSolicitud',
      label: 'Fecha Solicitud',
      render: (value) => {
        if (!value) return 'N/A';
        const date = value.toDate();
        return date.toLocaleDateString();
      }
    },
    {
      key: 'obraNombre',
      label: 'Obra',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin obra'}</span>
      )
    },
    {
      key: 'proveedorNombre',
      label: 'Proveedor',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin proveedor'}</span>
      )
    },
    {
      key: 'transportistaNombre',
      label: 'Transportista',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin transportista'}</span>
      )
    },
    {
      key: 'descripcionCorta',
      label: 'Descripción Corta',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'Sin descripción'}</span>
      )
    },
    {
      key: 'estatusAutorizado',
      label: 'Estatus',
      render: (value) => {
        const statusInfo = statusDisplayMap[value] || { text: 'Desconocido', color: 'bg-gray-100 text-gray-800' };
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${statusInfo.color}`}>
            {statusInfo.text}
          </span>
        );
      }
    },
    {
      key: 'facturaSerieFolio',
      label: 'Factura',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'N/A'}</span>
      )
    },
    {
      key: 'folioOrdenCompraExterno',
      label: 'Folio OC Externo',
      render: (value) => (
        <span className="font-medium text-gray-900">{value || 'N/A'}</span>
      )
    },
    {
      key: 'id' as keyof RequisicionMaterial,
      label: 'Acciones',
      render: (_, requisicion) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => openDetailModal(requisicion.id)}
            className="text-blue-600 hover:text-blue-800"
          >
            Ver Detalles
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Requisiciones de Material</h1>
      </div>

      {/* Botones de acciones en la parte superior */}
      <div className="flex flex-wrap gap-2 mb-6 p-4 bg-gray-50 rounded-lg">
        <Button onClick={() => window.location.href = '/admin/requisiciones-material/nueva'}>
          Crear Nueva
        </Button>
        
        <Button
          variant="danger"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            if (confirm('¿Está seguro de que desea eliminar las requisiciones seleccionadas?')) {
              // Aquí iría la lógica de eliminación
              alert('Funcionalidad de eliminación no implementada aún.');
            }
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Eliminar Seleccionadas
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Cambiar estatus a "Autorizada"
            Promise.all(selectedRequisiciones.map(id => changeStatus(id, 'autorizada')))
              .then(() => {
                alert('Requisiciones autorizadas correctamente.');
                setSelectedRequisiciones([]);
                setSelectAll(false);
              })
              .catch(error => {
                console.error('Error al autorizar requisiciones:', error);
                alert('Error al autorizar las requisiciones.');
              });
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Autorizar Seleccionadas
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Cambiar estatus a "Cancelada"
            Promise.all(selectedRequisiciones.map(id => changeStatus(id, 'cancelada')))
              .then(() => {
                alert('Requisiciones canceladas correctamente.');
                setSelectedRequisiciones([]);
                setSelectAll(false);
              })
              .catch(error => {
                console.error('Error al cancelar requisiciones:', error);
                alert('Error al cancelar las requisiciones.');
              });
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Cancelar Seleccionadas
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Cambiar estatus a "Parcialmente Surtida"
            Promise.all(selectedRequisiciones.map(id => changeStatus(id, 'parcialmente_surtida')))
              .then(() => {
                alert('Requisiciones marcadas como parcialmente surtidas correctamente.');
                setSelectedRequisiciones([]);
                setSelectAll(false);
              })
              .catch(error => {
                console.error('Error al cambiar estatus de requisiciones:', error);
                alert('Error al cambiar estatus de las requisiciones.');
              });
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Parcialmente Surtida
        </Button>
        
        <Button
          variant="ghost"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Cambiar estatus a "Cerrada Parcialmente"
            Promise.all(selectedRequisiciones.map(id => changeStatus(id, 'cerrada_parcialmente_surtida')))
              .then(() => {
                alert('Requisiciones marcadas como cerradas parcialmente correctamente.');
                setSelectedRequisiciones([]);
                setSelectAll(false);
              })
              .catch(error => {
                console.error('Error al cambiar estatus de requisiciones:', error);
                alert('Error al cambiar estatus de las requisiciones.');
              });
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Cerrada Parcialmente
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Cambiar estatus a "Cerrada Totalmente"
            Promise.all(selectedRequisiciones.map(id => changeStatus(id, 'cerrada_totalmente_surtida')))
              .then(() => {
                alert('Requisiciones marcadas como cerradas totalmente correctamente.');
                setSelectedRequisiciones([]);
                setSelectAll(false);
              })
              .catch(error => {
                console.error('Error al cambiar estatus de requisiciones:', error);
                alert('Error al cambiar estatus de las requisiciones.');
              });
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Cerrada Totalmente
        </Button>
        
        <Button
          variant="secondary"
          onClick={() => {
            if (selectedRequisiciones.length === 0) {
              alert('Por favor, seleccione al menos una requisición.');
              return;
            }
            
            // Importar desde plantilla
            alert('Funcionalidad de importación desde plantilla no implementada aún.');
          }}
          disabled={selectedRequisiciones.length === 0}
        >
          Importar desde Plantilla
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="mb-4">
        <SearchInput
          placeholder="Buscar por obra, proveedor, transportista, descripción, factura o folio..."
          value={searchQuery}
          onChange={setSearchQuery}
        />
      </div>

      <DataTable
        data={filteredRequisiciones}
        columns={columns}
        loading={isLoading}
        emptyMessage="No hay requisiciones que coincidan con la búsqueda"
      />

      {/* Modal de detalles */}
      {detailModalOpen && (
        <RequisicionDetailModal
          requisicion={selectedRequisicion}
          acarreosLigados={acarreosLigados}
          onClose={closeDetailModal}
          onLinkAcarreo={handleLinkAcarreo}
          onUnlinkAcarreo={handleUnlinkAcarreo}
        />
      )}

      {/* Modal para crear nueva requisición */}
      {formModalOpen && (
        <Modal
          isOpen={formModalOpen}
          onClose={() => setFormModalOpen(false)}
          title="Crear Nueva Requisición de Material"
          size="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Solicitud *
                </label>
                <input
                  type="date"
                  value={formData.fechaSolicitud.toISOString().split('T')[0]}
                  onChange={(e) => setFormData({
                    ...formData,
                    fechaSolicitud: new Date(e.target.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estatus
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="estatusAutorizado"
                    checked={formData.estatusAutorizado}
                    onChange={(e) => setFormData({
                      ...formData,
                      estatusAutorizado: e.target.checked
                    })}
                    className="mr-2"
                  />
                  <label htmlFor="estatusAutorizado" className="text-sm text-gray-700">
                    Autorizada
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Obra *
                </label>
                <select
                  value={formData.idObra}
                  onChange={(e) => setFormData({
                    ...formData,
                    idObra: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({
                    ...formData,
                    idProveedor: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({
                    ...formData,
                    idTransportista: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción Corta
                </label>
                <input
                  type="text"
                  value={formData.descripcionCorta}
                  onChange={(e) => setFormData({
                    ...formData,
                    descripcionCorta: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  onChange={(e) => setFormData({
                    ...formData,
                    folioOrdenCompraExterno: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Folio OC externo"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Factura Serie Folio
                </label>
                <input
                  type="text"
                  value={formData.facturaSerieFolio}
                  onChange={(e) => setFormData({
                    ...formData,
                    facturaSerieFolio: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Factura serie y folio"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción y Notas
              </label>
              <textarea
                value={formData.descripcionNotas}
                onChange={(e) => setFormData({
                  ...formData,
                  descripcionNotas: e.target.value
                })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descripción detallada y notas adicionales"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={() => setFormModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSaveRequisicion}
                disabled={!formData.idObra || !formData.idProveedor || !formData.idTransportista}
              >
                Guardar Requisición
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}