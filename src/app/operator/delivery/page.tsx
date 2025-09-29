
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Timestamp, query, collection, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Shipment, Truck, Driver, Material, Location, ShipmentStatus, TicketType } from '@/models/types';
import { getCollection, updateDocument, addDocument, TICKETS_COLLECTION } from '@/lib/firebase/firestore';
// Removed QrScanner import

const TRUCKS_COLLECTION = 'trucks';
const DRIVERS_COLLECTION = 'drivers';
const MATERIALS_COLLECTION = 'materials';
const LOCATIONS_COLLECTION = 'locations';
const SHIPMENTS_COLLECTION = 'shipments';

export default function DeliveryPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1: Scan Truck, 2: Confirm/Select Location
  const [scannedTruckId, setScannedTruckId] = useState<string | null>(null);
  const [foundShipment, setFoundShipment] = useState<Shipment | null>(null);
  const [deliveryLocationId, setDeliveryLocationId] = useState<string | null>(null);

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

  const handleIdInput = async (id: string) => { // Renamed from handleScan
    setScanError(null);
    const truck = trucks.find(t => t.id === id);

    if (!truck) {
      setScanError('Camión no encontrado. Ingrese un ID válido.');
      return;
    }

    setScannedTruckId(id);

    try {
      // Query for shipments with this truckId and status EN_TRANSITO
      const q = query(
        collection(db, SHIPMENTS_COLLECTION),
        where('truckId', '==', id),
        where('status', '==', 'EN_TRANSITO')
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setScanError('No se encontró ningún acarreo EN TRÁNSITO para este camión.');
        setFoundShipment(null);
        return;
      }

      // Assuming only one active shipment per truck at a time
      const shipmentData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() } as Shipment;
      setFoundShipment(shipmentData);
      setInputValue(''); // Clear input after successful scan
      setStep(2);
    } catch (e) {
      console.error("Error searching for shipment:", e);
      setScanError('Error al buscar el acarreo. Intente de nuevo.');
    }
  };


  const getTruckPlate = (id: string | null) => trucks.find(t => t.id === id)?.plate || 'N/A';
  const getDriverName = (id: string | null) => drivers.find(d => d.id === id)?.name || 'N/A';
  const getMaterialName = (id: string | null) => materials.find(m => m.id === id)?.name || 'N/A';
  const getLocationName = (id: string | null) => locations.find(l => l.id === id)?.name || 'N/A';

  const handleConfirmDelivery = async () => {
    if (!foundShipment || !deliveryLocationId) {
      alert('Por favor, seleccione la ubicación de descarga.');
      return;
    }

    try {
      await updateDocument(SHIPMENTS_COLLECTION, foundShipment.id, {
        status: 'COMPLETADO' as ShipmentStatus,
        deliveryTimestamp: Timestamp.now(),
        deliveryLocationId: deliveryLocationId,
      });

      // Update truck status
      await updateDocument(TRUCKS_COLLECTION, foundShipment.truckId, {
        status: 'AVAILABLE',
        currentShipmentId: null,
        currentDriverId: null,
      });

      // Update driver status
      await updateDocument(DRIVERS_COLLECTION, foundShipment.driverId, {
        status: 'AVAILABLE',
        currentShipmentId: null,
        currentTruckId: null,
      });

      // Create a delivery ticket
      const newTicketData = {
        shipmentId: foundShipment.id,
        type: 'delivery' as TicketType,
        createdAt: Timestamp.now(),
      };
      const ticketId = await addDocument(TICKETS_COLLECTION, newTicketData);

      alert('Descarga registrada con éxito!');
      router.push(`/admin/tickets/${ticketId}`); // Navigate to delivery ticket page
    } catch (e) {
      console.error("Error confirming delivery:", e);
      alert('Error al registrar la descarga.');
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
      {currentId && <p className="mt-4 text-gray-700">Camión escaneado: <span className="font-bold">{currentName}</span></p>} {/* Added text color */}
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-white rounded-lg shadow-md border border-gray-200"> {/* Added border */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Registrar Descarga</h2> {/* Added text color */}

      {scanError && <p className="text-red-600 text-center mb-4 bg-red-100 p-2 rounded-md border border-red-200">{scanError}</p>} {/* Adjusted error styles */}

      {step === 1 && renderScanInput('Escanee o Ingrese el ID del CAMIÓN para descargar', scannedTruckId, getTruckPlate(scannedTruckId))}

      {step === 2 && foundShipment && (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">Confirmar Descarga</h3> {/* Added text color */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-inner border border-gray-200 space-y-2"> {/* Added border */}
            <p className="text-gray-700"><strong>Folio:</strong> {foundShipment.folio}</p> {/* Added text color */}
            <p className="text-gray-700"><strong>Camión:</strong> {getTruckPlate(foundShipment.truckId)}</p>
            <p className="text-gray-700"><strong>Chofer:</strong> {getDriverName(foundShipment.driverId)}</p>
            <p className="text-gray-700"><strong>Material:</strong> {foundShipment.materialId ? getMaterialName(foundShipment.materialId) : 'N/A'}</p>
            <p className="text-gray-700"><strong>Peso:</strong> {foundShipment.weight}</p>
            <p className="text-gray-700"><strong>Origen:</strong> {getLocationName(foundShipment.dispatchLocationId)}</p>
          </div>
          <div>
            <label htmlFor="deliveryLocation" className="block text-lg font-medium text-gray-700 mb-2">Ubicación de Descarga</label>
            <select
              id="deliveryLocation"
              value={deliveryLocationId || ''}
              onChange={(e) => setDeliveryLocationId(e.target.value)}
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
              onClick={handleConfirmDelivery}
              className="w-full bg-green-600 text-white text-xl font-bold py-4 px-8 rounded-md shadow-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" // Adjusted button styles
            >
              Confirmar Descarga Completa
            </button>
          </div>
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setStep(1)} // Go back to scan truck
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500" // Added focus styles
            >
              Volver a escanear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
