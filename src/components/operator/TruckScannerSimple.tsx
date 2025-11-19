'use client';

import { useState } from 'react';
import QRScanner from './QRScanner';
import { TruckScanInfo, Truck, Transportista } from '@/models/types';

interface TruckScannerSimpleProps {
  onTruckScanned?: (truckInfo: TruckScanInfo) => void;
  onError?: (error: string) => void;
}

export default function TruckScannerSimple({ 
  onTruckScanned, 
  onError 
}: TruckScannerSimpleProps) {
  const [scannedTruck, setScannedTruck] = useState<TruckScanInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTruckScanned = (qrData: string) => {
    // Parse QR data to extract truck information
    try {
      // Create a basic truck object from QR data
      const truck: Truck = {
        id: qrData,
        createdAt: new Date() as any,
        model: '',
        placas: qrData,
        status: 'AVAILABLE',
        idTransportista: '',
        idTipoCamion: '',
        idClasificacionViaje: '',
        nombreParaMostrar: qrData,
        estatusActivo: true
      };
      
      // Create a basic transportista object
      const transportista: Transportista = {
        id: '',
        createdAt: new Date() as any,
        nombre: 'Transportista por defecto',
        activo: true
      };
      
      const truckInfo: TruckScanInfo = {
        truck,
        transportista,
        capacity: 0, // Default capacity
        lastDriverName: undefined
      };
      
      setScannedTruck(truckInfo);
      setError(null);
      onTruckScanned?.(truckInfo);
      console.log('Camión escaneado:', truckInfo);
    } catch (parseError) {
      const errorMessage = 'Error al procesar el código QR del camión';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setScannedTruck(null);
    onError?.(errorMessage);
  };

  return (
    <div className="space-y-4">
      {/* QR Scanner */}
      <QRScanner
        onScanSuccess={handleTruckScanned}
        onError={handleError}
        enabled={true}
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800 mb-2">Error de Escaneo</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {scannedTruck && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-800 mb-2">Camión Escaneado Exitosamente:</h3>
          <div className="text-sm text-green-700 space-y-1">
            <p><strong>ID:</strong> {scannedTruck.truck.id}</p>
            <p><strong>Nombre:</strong> {scannedTruck.truck.nombreParaMostrar}</p>
            <p><strong>Placas:</strong> {scannedTruck.truck.placas}</p>
            <p><strong>Capacidad:</strong> {scannedTruck.capacity} m³</p>
            <p><strong>Transportista:</strong> {scannedTruck.truck.idTransportista}</p>
          </div>
        </div>
      )}
    </div>
  );
}