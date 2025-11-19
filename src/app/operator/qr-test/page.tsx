'use client';

import { useState } from 'react';
import { TruckScanInfo } from '@/models/types';
import TruckScannerSimple from '@/components/operator/TruckScannerSimple';

export default function QRTestPage() {
  const [scannedTruck, setScannedTruck] = useState<TruckScanInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTruckScanned = (truckInfo: TruckScanInfo) => {
    setScannedTruck(truckInfo);
    setError(null);
    console.log('Camión escaneado:', truckInfo);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setScannedTruck(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 p-4 mb-6 rounded-lg">
          <h1 className="text-2xl font-bold text-gray-900">Prueba de Escáner QR</h1>
          <p className="text-sm text-gray-600 mt-1">
            Página de prueba para el escáner de códigos QR sin geolocalización
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-red-800 mb-2">Error:</h3>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Display */}
        {scannedTruck && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
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

        {/* QR Scanner */}
        <TruckScannerSimple
          onTruckScanned={handleTruckScanned}
          onError={handleError}
        />

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Notas de Depuración:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Esta página NO solicita permisos de geolocalización</li>
            <li>• Solo usa el escáner QR con cámara</li>
            <li>• Compatible con Safari móvil (versión 11+)</li>
            <li>• Requiere conexión HTTPS para acceso a la cámara</li>
            <li>• Si falla en Safari, verifique los permisos en Configuración - Safari - Configuración del sitio web</li>
          </ul>
        </div>
      </div>
    </div>
  );
}