
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { getCollection, addDocument, updateDocument, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
import { Truck, Driver, Material, Location, ShipmentStatus, TicketType } from '@/models/types';
// Removed QrScanner import

const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';
const SHIPMENTS_COLLECTION = 'shipments';

export default function DispatchPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Truck, 2: Driver, 3: Material, 4: Weight/Location, 5: Confirm
  const [scannedTruckId, setScannedTruckId] = useState<string | null>(null);
  const [scannedDriverId, setScannedDriverId] = useState<string | null>(null);
  const [scannedMaterialId, setScannedMaterialId] = useState<string | null>(null);
  const [weight, setWeight] = useState<number | ''>('');
  const [dispatchLocationId, setDispatchLocationId] = useState<string | null>(null);

  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>(''); // New state for input field

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

  const handleIdInput = (id: string) => { // Renamed from handleScan
    setScanError(null);
    let isValid = false;
    let foundItem: Truck | Driver | Material | null = null;

    switch (step) {
      case 1: // Scan Truck
        foundItem = trucks.find(t => t.id === id) ?? null;
        if (foundItem) {
          setScannedTruckId(id);
          isValid = true;
        } else {
          setScanError('Camión no encontrado. Ingrese un ID válido.');
        }
        break;
      case 2: // Scan Driver
        foundItem = drivers.find(d => d.id === id) ?? null;
        if (foundItem) {
          setScannedDriverId(id);
          isValid = true;
        } else {
          setScanError('Chofer no encontrado. Ingrese un ID válido.');
        }
        break;
      case 3: // Scan Material
        foundItem = materials.find(m => m.id === id) ?? null;
        if (foundItem) {
          setScannedMaterialId(id);
          isValid = true;
        } else {
          setScanError('Material no encontrado. Ingrese un ID válido.');
        }
        break;
      default:
        break;
    }

    if (isValid) {
      setInputValue(''); // Clear input after successful scan
      setStep(prev => prev + 1);
    }
  };


  const getTruckPlate = (id: string | null) => trucks.find(t => t.id === id)?.plate || 'N/A';
  const getDriverName = (id: string | null) => drivers.find(d => d.id === id)?.name || 'N/A';
  const getMaterialName = (id: string | null) => materials.find(m => m.id === id)?.name || 'N/A';
  const getLocationName = (id: string | null) => locations.find(l => l.id === id)?.name || 'N/A';

  const handleConfirmDispatch = async () => {
    if (!scannedTruckId || !scannedDriverId || !scannedMaterialId || !weight || !dispatchLocationId) {
      alert('Por favor, complete todos los datos del despacho.');
      return;
    }

    try {
      const newShipment = {
        folio: '', // Will be set to doc.id by Firestore service
        truckId: scannedTruckId,
        driverId: scannedDriverId,
        materialId: scannedMaterialId,
        dispatchLocationId: dispatchLocationId,
        deliveryLocationId: null,
        weight: Number(weight),
        dispatchTimestamp: Timestamp.now(),
        deliveryTimestamp: null,
        status: 'EN_TRANSITO' as ShipmentStatus,
        createdAt: Timestamp.now(),
      };

      const shipmentId = await addDocument(SHIPMENTS_COLLECTION, newShipment);
      // Update folio with docId after creation
      await updateDocument(SHIPMENTS_COLLECTION, shipmentId, { folio: shipmentId });

      // Create a dispatch ticket
      const newTicketData = {
        shipmentId: shipmentId,
        type: 'dispatch' as TicketType,
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

  const renderScanInput = (label: string, currentId: string | null, currentName: string | null) => (
    <div className="text-center space-y-4">
      <p className="text-xl font-semibold mb-4 text-gray-800">{label}</p> {/* Added text color */}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleIdInput(inputValue);
          }
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900" // Adjusted rounded and text color
        placeholder="Escanee o ingrese el ID"
        autoFocus // Keep focus for quick scanning
      />
      <button
        onClick={() => handleIdInput(inputValue)}
        className="w-full bg-blue-600 text-white text-lg font-bold py-3 px-6 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 mt-4" // Adjusted button styles
      >
        Confirmar ID
      </button>
      {currentId && <p className="mt-4 text-gray-700">ID escaneado: <span className="font-bold">{currentName}</span></p>} {/* Added text color */}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200"> {/* Added border */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Iniciar Despacho</h2> {/* Added text color */}

      {scanError && <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded-md border border-red-200">{scanError}</p>} {/* Adjusted error styles */}

      {step === 1 && renderScanInput('Escanee o Ingrese el ID del CAMIÓN', scannedTruckId, getTruckPlate(scannedTruckId))}

      {step === 2 && renderScanInput('Escanee o Ingrese el ID del CHOFER', scannedDriverId, getDriverName(scannedDriverId))}

      {step === 3 && renderScanInput('Escanee o Ingrese el ID del MATERIAL', scannedMaterialId, getMaterialName(scannedMaterialId))}

      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Detalles del Despacho</h3> {/* Added text color */}
          <div>
            <label htmlFor="weight" className="block text-lg font-medium text-gray-700 mb-2">Peso del Material ({getMaterialName(scannedMaterialId) ? materials.find(m => m.id === scannedMaterialId)?.unit : 'unidad'})</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900" // Adjusted rounded and text color
              placeholder="Ej: 15.5"
              step="0.1"
            />
          </div>
          <div>
            <label htmlFor="dispatchLocation" className="block text-lg font-medium text-gray-700 mb-2">Ubicación de Despacho</label>
            <select
              id="dispatchLocation"
              value={dispatchLocationId || ''}
              onChange={(e) => setDispatchLocationId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-900" // Adjusted rounded and text color
            >
              <option value="" disabled>Seleccione una ubicación</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="w-full bg-blue-600 text-white text-xl font-bold py-4 px-8 rounded-md shadow-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500" // Adjusted button styles
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Confirmar Despacho</h3> {/* Added text color */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 space-y-2"> {/* Added border */}
            <p className="text-gray-700"><strong>Camión:</strong> {getTruckPlate(scannedTruckId)}</p> {/* Added text color */}
            <p className="text-gray-700"><strong>Chofer:</strong> {getDriverName(scannedDriverId)}</p>
            <p className="text-gray-700"><strong>Material:</strong> {getMaterialName(scannedMaterialId)}</p>
            <p className="text-gray-700"><strong>Peso:</strong> {weight} {getMaterialName(scannedMaterialId) ? materials.find(m => m.id === scannedMaterialId)?.unit : ''}</p>
            <p className="text-gray-700"><strong>Origen:</strong> {getLocationName(dispatchLocationId)}</p>
          </div>
          <div className="flex justify-center mt-8">
            <button
              onClick={handleConfirmDispatch}
              className="w-full bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-md shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" // Adjusted button styles
            >
              Confirmar Despacho
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setStep(4)}
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500" // Added focus styles
            >
              Volver
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
