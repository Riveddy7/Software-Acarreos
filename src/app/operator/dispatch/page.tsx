
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { getCollection, addDocument, updateDocument, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
import { Truck, Driver, Material, Location, ShipmentStatus, TicketType } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
// Removed QrScanner import

const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';
const SHIPMENTS_COLLECTION = 'shipments';

export default function DispatchPage() {
  const router = useRouter();
  const { userProfile } = useAuth();

  const [step, setStep] = useState(1); // 1: Truck, 2: Driver, 3: Materials + Location, 4: Confirm
  const [scannedTruckId, setScannedTruckId] = useState<string | null>(null);
  const [scannedDriverId, setScannedDriverId] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<{materialId: string, quantity: number}[]>([]);
  const [showMaterialSelector, setShowMaterialSelector] = useState(false);
  const [dispatchLocationId, setDispatchLocationId] = useState<string | null>(null);

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const fetchMasterData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [trucksData, driversData, materialsData, locationsData] = await Promise.all([
        getCollection<Truck>(TRUCKS_COLLECTION),
        getCollection<Driver>(DRIVERS_COLLECTION),
        getCollection<Material>(MATERIALS_COLLECTION),
        getCollection<Location>(LOCATIONS_COLLECTION),
      ]);
      setTrucks(trucksData);
      setDrivers(driversData);
      setMaterials(materialsData);
      setLocations(locationsData);
      setError(null);
    } catch (e) {
      console.error("Error fetching master data:", e);
      setError('Error al cargar datos maestros. Verifique su configuración de Firebase.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMasterData();
  }, [fetchMasterData]);


  const getTruckPlate = (id: string | null) => trucks.find(t => t.id === id)?.plate || 'N/A';
  const getDriverName = (id: string | null) => drivers.find(d => d.id === id)?.name || 'N/A';

  const addMaterial = (materialId: string) => {
    const material = materials.find(m => m.id === materialId);
    if (material) {
      setSelectedMaterials(prev => [...prev, { materialId, quantity: 1 }]);
      setShowMaterialSelector(false);
    }
  };

  const updateMaterialQuantity = (index: number, quantity: number) => {
    setSelectedMaterials(prev =>
      prev.map((item, i) => i === index ? { ...item, quantity } : item)
    );
  };

  const removeMaterial = (index: number) => {
    setSelectedMaterials(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalWeight = () => {
    return selectedMaterials.reduce((total, item) => total + item.quantity, 0);
  };
  const getLocationName = (id: string | null) => locations.find(l => l.id === id)?.name || 'N/A';

  const handleConfirmDispatch = async () => {
    if (!scannedTruckId || !scannedDriverId || selectedMaterials.length === 0 || !dispatchLocationId) {
      alert('Por favor, complete todos los datos del despacho.');
      return;
    }

    try {
      // Create shipment with multi-material support
      const shipmentMaterials = selectedMaterials.map(item => {
        const material = materials.find(m => m.id === item.materialId);
        return {
          materialId: item.materialId,
          materialName: material?.name || '',
          materialUnit: material?.unit || '',
          weight: item.quantity
        };
      });

      const newShipment = {
        folio: '', // Will be set to doc.id by Firestore service
        truckId: scannedTruckId,
        driverId: scannedDriverId,
        materials: shipmentMaterials,
        dispatchLocationId: dispatchLocationId,
        deliveryLocationId: null,
        dispatchTimestamp: Timestamp.now(),
        deliveryTimestamp: null,
        status: 'EN_TRANSITO' as ShipmentStatus,
        createdAt: Timestamp.now(),
        // Legacy compatibility - use first material for single material fields
        materialId: selectedMaterials[0]?.materialId,
        weight: getTotalWeight()
      };

      const shipmentId = await addDocument(SHIPMENTS_COLLECTION, newShipment);
      // Update folio with docId after creation
      await updateDocument(SHIPMENTS_COLLECTION, shipmentId, { folio: shipmentId });

      // Update truck status
      await updateDocument(TRUCKS_COLLECTION, scannedTruckId, {
        status: 'IN_SHIPMENT',
        currentShipmentId: shipmentId,
        currentDriverId: scannedDriverId,
      });

      // Update driver status
      await updateDocument(DRIVERS_COLLECTION, scannedDriverId, {
        status: 'IN_SHIPMENT',
        currentShipmentId: shipmentId,
        currentTruckId: scannedTruckId,
      });

      // Create a comprehensive dispatch ticket
      const truck = trucks.find(t => t.id === scannedTruckId);
      const driver = drivers.find(d => d.id === scannedDriverId);
      const dispatchLocation = locations.find(l => l.id === dispatchLocationId);

      const newTicketData = {
        shipmentId: shipmentId,
        type: 'dispatch' as TicketType,

        // Multi-material support
        materials: shipmentMaterials,

        // Dispatch information
        dispatchedBy: userProfile?.id,
        dispatchedByName: userProfile?.username,
        dispatchDate: Timestamp.now(),

        // Denormalized shipment data for easy display
        folio: shipmentId,
        truckPlate: truck?.plate,
        driverName: driver?.name,
        dispatchLocationName: dispatchLocation?.name,
        deliveryLocationName: null, // Will be set on delivery
        dispatchTimestamp: Timestamp.now(),
        deliveryTimestamp: null,

        createdAt: Timestamp.now(),
      };
      const ticketId = await addDocument(TICKETS_COLLECTION, newTicketData);

      alert('Despacho registrado con éxito!');
      router.push(`/admin/tickets/${ticketId}`); // Navigate to the new ticket detail page
    } catch (e) {
      console.error("Error confirming dispatch:", e);
      alert('Error al registrar el despacho.');
    }
  };

  if (isLoading) {
    return <p className="text-center text-lg text-gray-700">Cargando datos maestros...</p>; {/* Added text color */}
  }

  if (error) {
    return <p className="text-center text-red-600 text-lg bg-red-100 p-4 rounded-md border border-red-200">Error: {error}</p>; {/* Adjusted error styles */}
  }

  const renderTruckSelector = () => (
    <div className="space-y-4">
      <p className="text-xl font-semibold mb-4 text-gray-800 text-center">Seleccione el CAMIÓN</p>
      <select
        value={scannedTruckId || ''}
        onChange={(e) => {
          setScannedTruckId(e.target.value);
          setScanError(null);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
        autoFocus
      >
        <option value="" disabled>Seleccione un camión</option>
        {trucks.map(truck => (
          <option key={truck.id} value={truck.id}>
            {truck.plate} - {truck.model}
          </option>
        ))}
      </select>
      {scannedTruckId && (
        <button
          onClick={() => setStep(2)}
          className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
        >
          Siguiente
        </button>
      )}
    </div>
  );

  const renderDriverSelector = () => (
    <div className="space-y-4">
      <p className="text-xl font-semibold mb-4 text-gray-800 text-center">Seleccione el CHOFER</p>
      <select
        value={scannedDriverId || ''}
        onChange={(e) => {
          setScannedDriverId(e.target.value);
          setScanError(null);
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
        autoFocus
      >
        <option value="" disabled>Seleccione un chofer</option>
        {drivers.map(driver => (
          <option key={driver.id} value={driver.id}>
            {driver.name}
          </option>
        ))}
      </select>
      {scannedDriverId && (
        <button
          onClick={() => setStep(3)}
          className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4"
        >
          Siguiente
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200"> {/* Added border */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Despacho</h2> {/* Added text color */}

      {scanError && <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded-md border border-red-200">{scanError}</p>} {/* Adjusted error styles */}

      {step === 1 && renderTruckSelector()}

      {step === 2 && renderDriverSelector()}

      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Seleccionar Materiales</h3>

          {/* Material Selector Dropdown */}
          {showMaterialSelector && (
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="py-2">
                {materials.filter(material =>
                  !selectedMaterials.some(selected => selected.materialId === material.id)
                ).map((material) => (
                  <button
                    key={material.id}
                    onClick={() => addMaterial(material.id)}
                    className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-sm">{material.name}</div>
                    <div className="text-xs text-gray-600">Unidad: {material.unit}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add Material Button */}
          {!showMaterialSelector && (
            <button
              onClick={() => setShowMaterialSelector(true)}
              className="w-full bg-green-600 text-white text-lg font-bold py-4 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
            >
              + Agregar Material
            </button>
          )}

          {/* Selected Materials List */}
          {selectedMaterials.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Materiales Seleccionados:</h4>
              {selectedMaterials.map((item, index) => {
                const material = materials.find(m => m.id === item.materialId);
                return (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{material?.name}</h5>
                        <p className="text-sm text-gray-600">Unidad: {material?.unit}</p>
                      </div>
                      <button
                        onClick={() => removeMaterial(index)}
                        className="text-red-600 hover:text-red-800 text-lg font-bold"
                      >
                        ×
                      </button>
                    </div>

                    <div className="flex items-center space-x-3">
                      <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateMaterialQuantity(index, Math.max(0.1, item.quantity - 0.5))}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-3 rounded"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateMaterialQuantity(index, Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                          className="w-20 px-2 py-2 border border-gray-300 rounded text-center"
                          step="0.1"
                          min="0.1"
                        />
                        <button
                          onClick={() => updateMaterialQuantity(index, item.quantity + 0.5)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-3 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-blue-800 font-medium">Total: {getTotalWeight()} unidades</p>
              </div>
            </div>
          )}

          {/* Location Selection */}
          <div>
            <label htmlFor="dispatchLocation" className="block text-lg font-medium text-gray-700 mb-2">Ubicación de Despacho</label>
            <select
              id="dispatchLocation"
              value={dispatchLocationId || ''}
              onChange={(e) => setDispatchLocationId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900"
            >
              <option value="" disabled>Seleccione una ubicación</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Next Button */}
          {selectedMaterials.length > 0 && dispatchLocationId && (
            <button
              onClick={() => setStep(4)}
              className="w-full bg-blue-600 text-white text-xl font-bold py-4 rounded-md shadow-lg hover:bg-blue-700 transition-colors"
            >
              Siguiente
            </button>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Confirmar Despacho</h3>
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 space-y-3">
            <p className="text-gray-700"><strong>Camión:</strong> {getTruckPlate(scannedTruckId)}</p>
            <p className="text-gray-700"><strong>Chofer:</strong> {getDriverName(scannedDriverId)}</p>
            <p className="text-gray-700"><strong>Origen:</strong> {getLocationName(dispatchLocationId)}</p>

            <div>
              <p className="text-gray-700 font-semibold mb-2">Materiales:</p>
              {selectedMaterials.map((item, index) => {
                const material = materials.find(m => m.id === item.materialId);
                return (
                  <div key={index} className="bg-white p-2 rounded border border-gray-200 mb-2">
                    <div className="flex justify-between">
                      <span className="text-gray-800">{material?.name}</span>
                      <span className="text-gray-600 font-medium">{item.quantity} {material?.unit}</span>
                    </div>
                  </div>
                );
              })}
              <div className="bg-blue-100 p-2 rounded mt-2">
                <p className="text-blue-800 font-medium">Total: {getTotalWeight()} unidades</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <button
              onClick={handleConfirmDispatch}
              className="w-full bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-md shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Confirmar Despacho
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setStep(3)}
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
