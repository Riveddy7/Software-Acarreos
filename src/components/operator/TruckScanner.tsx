'use client';

import { useState, useRef, useEffect } from 'react';
import { TruckScanInfo, ScanResult } from '@/models/types';
import { scanner } from '@/lib/operator/scanner';
import { Button } from '@/components/ui/Button';
import QRScanner from './QRScanner';

interface TruckScannerProps {
  onTruckScanned: (truckInfo: TruckScanInfo) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export default function TruckScanner({ 
  onTruckScanned, 
  onError, 
  disabled = false 
}: TruckScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [availableTechnologies, setAvailableTechnologies] = useState<string[]>([]);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('qr');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    detectTechnologies();
  }, []);

  const detectTechnologies = async () => {
    try {
      const config = await scanner.detectAvailableTechnologies();
      const technologies = [];
      
      if (config.qr) technologies.push('qr');
      if (config.nfc) technologies.push('nfc');
      if (config.rfid) technologies.push('rfid');
      if (config.camera) technologies.push('camera');
      
      setAvailableTechnologies(technologies);
      
      // Set default technology based on availability
      if (technologies.length > 0 && !technologies.includes(selectedTechnology)) {
        setSelectedTechnology(technologies[0]);
      }
    } catch (error) {
      console.error('Error detecting technologies:', error);
    }
  };

  const handleScan = async () => {
    if (disabled || isScanning) return;

    setIsScanning(true);
    
    try {
      let scanResult: ScanResult;

      switch (selectedTechnology) {
        case 'qr':
          // For QR scanning, we'll use the QRScanner component
          // The actual scanning will be handled by the QRScanner component
          return;
        case 'nfc':
          scanResult = await scanNFC();
          break;
        case 'rfid':
          scanResult = await scanRFID();
          break;
        case 'camera':
          scanResult = await scanCamera();
          break;
        default:
          throw new Error('Tecnología de escaneo no soportada');
      }

      // Add to history
      setScanHistory(prev => [scanResult, ...prev.slice(0, 4)]);

      // Process scan result
      const truckInfo = await scanner.processScanResult(scanResult);
      onTruckScanned(truckInfo);

    } catch (error: any) {
      console.error('Scan error:', error);
      onError?.(error.message || 'Error al escanear camión');
    } finally {
      setIsScanning(false);
    }
  };

  const handleQRScanSuccess = async (qrData: string) => {
    try {
      setIsScanning(true);
      
      // Create scan result from QR data
      const scanResult: ScanResult = {
        type: 'qr',
        data: qrData,
        timestamp: new Date()
      };

      // Add to history
      setScanHistory(prev => [scanResult, ...prev.slice(0, 4)]);

      // Process scan result
      const truckInfo = await scanner.processScanResult(scanResult);
      onTruckScanned(truckInfo);

    } catch (error: any) {
      console.error('QR scan processing error:', error);
      onError?.(error.message || 'Error al procesar código QR');
    } finally {
      setIsScanning(false);
    }
  };

  const scanQRCode = async (): Promise<ScanResult> => {
    // This method is no longer used directly
    // QR scanning is now handled by the QRScanner component
    throw new Error('Use QRScanner component for QR scanning');
  };

  const scanNFC = async (): Promise<ScanResult> => {
    return scanner.scanWithTechnology('nfc');
  };

  const scanRFID = async (): Promise<ScanResult> => {
    return scanner.scanWithTechnology('rfid');
  };

  const scanCamera = async (): Promise<ScanResult> => {
    return scanner.scanWithTechnology('camera');
  };

  const getTechnologyIcon = (tech: string) => {
    switch (tech) {
      case 'qr':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        );
      case 'nfc':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        );
      case 'rfid':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'camera':
        return (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0118.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTechnologyLabel = (tech: string) => {
    switch (tech) {
      case 'qr': return 'Código QR';
      case 'nfc': return 'NFC';
      case 'rfid': return 'RFID';
      case 'camera': return 'Cámara';
      default: return tech;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Escanear Camión
        </h3>
        <p className="text-sm text-gray-600">
          Seleccione una tecnología de escaneo y capture la información del camión
        </p>
      </div>

      {/* Technology Selection */}
      {availableTechnologies.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tecnología de Escaneo
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableTechnologies.map((tech) => (
              <button
                key={tech}
                onClick={() => setSelectedTechnology(tech)}
                className={`
                  flex items-center justify-center p-3 rounded-lg border-2 transition-all
                  ${selectedTechnology === tech
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                `}
              >
                {getTechnologyIcon(tech)}
                <span className="ml-2 text-sm font-medium">
                  {getTechnologyLabel(tech)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QR Scanner Component */}
      {selectedTechnology === 'qr' && (
        <div className="mb-6">
          <QRScanner
            onScanSuccess={handleQRScanSuccess}
            onError={onError}
            enabled={!disabled && !isScanning}
          />
        </div>
      )}

      {/* Scan Button for non-QR technologies */}
      {selectedTechnology !== 'qr' && (
        <div className="flex justify-center mb-6">
          <Button
            onClick={handleScan}
            disabled={disabled || isScanning}
            size="lg"
            className="relative"
          >
            {isScanning ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Escaneando...
              </>
            ) : (
              <>
                {getTechnologyIcon(selectedTechnology)}
                <span className="ml-2">
                  Escanear con {getTechnologyLabel(selectedTechnology)}
                </span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-900 mb-2">Instrucciones:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          {selectedTechnology === 'qr' && (
            <>
              <li>• Centre el código QR del camión en el marco de escaneo</li>
              <li>• Mantenga estable el dispositivo durante el escaneo</li>
              <li>• Asegúrese de tener buena iluminación</li>
              <li>• El escaneo se realizará automáticamente cuando detecte el código</li>
            </>
          )}
          {selectedTechnology === 'nfc' && (
            <>
              <li>• Acerque el dispositivo al tag NFC del camión</li>
              <li>• Mantenga el dispositivo cerca hasta escuchar una confirmación</li>
              <li>• No mueva el dispositivo durante el escaneo</li>
            </>
          )}
          {selectedTechnology === 'rfid' && (
            <>
              <li>• Active el lector RFID</li>
              <li>• Acerque el lector a la etiqueta RFID del camión</li>
              <li>• Espere la confirmación de lectura</li>
            </>
          )}
          {selectedTechnology === 'camera' && (
            <>
              <li>• Apunte la cámara al camión o placa</li>
              <li>• Asegúrese de tener buena iluminación</li>
              <li>• Mantenga estable el dispositivo</li>
            </>
          )}
        </ul>
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Escaneos Recientes:</h4>
          <div className="space-y-2">
            {scanHistory.slice(0, 3).map((scan, index) => (
              <div
                key={`${scan.timestamp.getTime()}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  {getTechnologyIcon(scan.type)}
                  <span className="ml-2 text-sm text-gray-700">
                    {getTechnologyLabel(scan.type)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {scan.timestamp.toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {scan.data.substring(0, 15)}...
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}