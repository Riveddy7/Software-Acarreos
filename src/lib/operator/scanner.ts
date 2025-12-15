import { ScannerConfig, ScanResult, TruckScanInfo, Truck, Transportista } from '@/models/types';

export class UniversalScanner {
  private config: ScannerConfig;

  constructor() {
    this.config = {
      qr: true,
      nfc: false, // Will be detected
      rfid: false, // Will be detected
      camera: true
    };
  }

  /**
   * Detect available scanning technologies on device
   */
  async detectAvailableTechnologies(): Promise<ScannerConfig> {
    const detectedConfig = { ...this.config };

    // Detect NFC availability
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      try {
        // Test NFC availability
        const ndef = new (window as any).NDEFReader();
        detectedConfig.nfc = true;
      } catch {
        console.log('NFC not available');
        detectedConfig.nfc = false;
      }
    } else {
      detectedConfig.nfc = false;
    }

    // Detect RFID (usually requires external hardware)
    // For now, we'll assume it's not available unless specifically configured
    detectedConfig.rfid = false;

    // QR and Camera are generally available on modern devices
    detectedConfig.qr = 'mediaDevices' in navigator;
    detectedConfig.camera = 'mediaDevices' in navigator;

    this.config = detectedConfig;
    return detectedConfig;
  }

  /**
   * Scan using the specified technology
   */
  async scanWithTechnology(type: 'qr' | 'nfc' | 'rfid' | 'camera'): Promise<ScanResult> {
    switch (type) {
      case 'qr':
        return this.scanQR();
      case 'nfc':
        return this.scanNFC();
      case 'rfid':
        return this.scanRFID();
      case 'camera':
        return this.scanCamera();
      default:
        throw new Error(`Unsupported scan technology: ${type}`);
    }
  }

  /**
   * Scan QR code using camera
   */
  private async scanQR(): Promise<ScanResult> {
    // This method is now handled by the QRScanner component
    // The actual QR scanning is done in real-time using jsqr library
    throw new Error('QR scanning is now handled by QRScanner component. Use the component directly for real-time QR scanning.');
  }

  /**
   * Scan NFC tag
   */
  private async scanNFC(): Promise<ScanResult> {
    if (!this.config.nfc) {
      throw new Error('NFC not available on this device');
    }

    return new Promise((resolve, reject) => {
      try {
        const ndef = new (window as any).NDEFReader();

        ndef.scan()
          .then(() => {
            ndef.addEventListener("reading", ({ message, serialNumber }: { message: any; serialNumber: string }) => {
              const decoder = new TextDecoder();
              let truckId = '';

              for (const record of message.records) {
                truckId += decoder.decode(record.data);
              }

              resolve({
                type: 'nfc',
                data: truckId || serialNumber,
                timestamp: new Date()
              });
            });
          })
          .catch((error: unknown) => {
            reject(new Error('NFC scan failed: ' + (error as Error).message));
          });
      } catch (error: unknown) {
        reject(new Error('NFC initialization failed: ' + (error as Error).message));
      }
    });
  }

  /**
   * Scan RFID tag (requires external hardware)
   */
  private async scanRFID(): Promise<ScanResult> {
    // RFID scanning would require external hardware integration
    // This is a placeholder for future implementation
    throw new Error('RFID scanning not yet implemented');
  }

  /**
   * Scan using camera (generic camera scan)
   */
  private async scanCamera(): Promise<ScanResult> {
    return this.scanQR(); // For now, camera scan is the same as QR scan
  }

  /**
   * Process scan result to get truck information
   */
  async processScanResult(result: ScanResult): Promise<TruckScanInfo> {
    // Extract truck ID from scan data
    const truckId = this.extractTruckId(result.data);

    if (!truckId) {
      throw new Error('No truck ID found in scan result');
    }

    // Get truck information from Firestore
    const truckInfo = await this.getTruckInfo(truckId);

    return truckInfo;
  }

  /**
   * Extract truck ID from scan data
   */
  private extractTruckId(scanData: string): string | null {
    // Validate scanData first
    if (!scanData || typeof scanData !== 'string') {
      console.error('Invalid scan data:', scanData);
      return null;
    }

    // Try different patterns to extract truck ID
    const patterns = [
      /TRUCK_ID_([A-Z0-9]+)/i,
      /TRUCK:([A-Z0-9]+)/i,
      /^([A-Z0-9]+)$/i,
      /id=([A-Z0-9]+)/i
    ];

    for (const pattern of patterns) {
      const match = scanData.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    // If no pattern matches, return the raw data if it looks like an ID
    if (scanData.length > 3 && scanData.length < 50) {
      return scanData;
    }

    return null;
  }

  /**
   * Get truck information from Firestore
   */
  private async getTruckInfo(truckId: string): Promise<TruckScanInfo> {
    try {
      // Import Firestore functions dynamically to avoid SSR issues
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();

      // Get truck document
      const truckDoc = await getDoc(doc(db, 'trucks', truckId));

      if (!truckDoc.exists()) {
        throw new Error(`Truck with ID ${truckId} not found`);
      }

      const truck = truckDoc.data() as Truck;

      // Handle both old and new truck models for backward compatibility
      const truckData = truck as any;

      // Get transportista information (with fallback for old data)
      let transportista: Transportista | null = null;
      if (truckData.idTransportista) {
        const transportistaDoc = await getDoc(doc(db, 'transportistas', truckData.idTransportista));
        transportista = transportistaDoc.exists()
          ? transportistaDoc.data() as Transportista
          : null;
      } else {
        // Create a default transportista for old truck data
        transportista = {
          id: 'default',
          createdAt: truck.createdAt,
          nombre: 'Transportista no asignado',
          activo: true
        };
      }

      // Calculate capacity
      let capacity = 0;
      if (truckData.volume) {
        capacity = truckData.volume;
      } else if (truckData.idClasificacionViaje) {
        // Fallback to classification if volume is missing (though classification might not have it either)
        capacity = await this.getTruckCapacity(truckData.idClasificacionViaje);
      } else {
        // Default capacity
        capacity = 14; // Changed default to generic 14 or keep 10? User said 10 was wrong (it was a default). Let's stick to reading the volume.
      }

      // If capacity is effectively 0 after checks, default to 14 (or a reasonable standard) or 0. 
      // User complaint was about it being 10 when it should be 30. 30 came from volume.
      if (!capacity) capacity = 14;

      // Get last driver name (with fallback for old data)
      let lastDriverName = '';
      if (truckData.ultimoCamioneroNombre) {
        lastDriverName = truckData.ultimoCamioneroNombre;
      } else if (truckData.currentDriverName) {
        lastDriverName = truckData.currentDriverName;
      }

      // Create a complete truck object with all required fields
      const completeTruck: Truck = {
        ...truckData, // Use truckData which is 'truck' cast to any
        id: truckId, // Explicitly set the ID from the document reference
        idTransportista: truckData.idTransportista || 'default',
        idTipoCamion: truckData.idTipoCamion || 'default',
        idClasificacionViaje: truckData.idClasificacionViaje || 'default',
        idUltimoCamionero: truckData.idUltimoCamionero,
        nombreParaMostrar: truckData.nombreParaMostrar || truckData.placas || 'Camión sin nombre',
        estatusActivo: truckData.estatusActivo !== undefined ? truckData.estatusActivo : true,
        marca: truckData.marca,
        numeroSerie: truckData.numeroSerie,
        placas: truckData.placas || '',
        descripcionNotas: truckData.descripcionNotas,
        transportistaNombre: transportista?.nombre,
        tipoCamionNombre: truckData.tipoCamionNombre,
        clasificacionViajeNombre: truckData.clasificacionViajeNombre,
        ultimoCamioneroNombre: lastDriverName,
        volume: capacity // Ensure capacity is set in the truck object if missing (it's optional in interface but good to have)
      };

      return {
        truck: completeTruck,
        transportista: transportista!,
        capacity,
        lastDriverName
      };
    } catch (error) {
      console.error('Error in getTruckInfo:', error);
      console.error('Error type:', typeof error);
      console.error('Error instanceof Error:', error instanceof Error);

      let errorMessage: string;
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else {
        errorMessage = String(error);
      }

      console.error('Final error message:', errorMessage);
      console.error('Error message type:', typeof errorMessage);

      // Ensure errorMessage is a string before using in template
      const safeErrorMessage = typeof errorMessage === 'string' ? errorMessage : String(errorMessage);
      throw new Error(`Failed to get truck info: ${safeErrorMessage}`);
    }
  }

  /**
   * Get truck capacity based on classification
   */
  private async getTruckCapacity(clasificacionId: string): Promise<number> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();

      const clasificacionDoc = await getDoc(doc(db, 'clasificacionesViaje', clasificacionId));

      if (clasificacionDoc.exists()) {
        const clasificacion = clasificacionDoc.data();
        // Assuming capacity is stored in classification or related data
        return clasificacion.capacidadMaxima || 10; // Default capacity
      }

      return 10; // Default capacity if classification not found
    } catch (error) {
      console.error('Error getting truck capacity:', error);
      return 10; // Default capacity on error
    }
  }

  /**
   * Get current scanner configuration
   */
  getConfig(): ScannerConfig {
    return { ...this.config };
  }

  /**
   * Update scanner configuration
   */
  updateConfig(newConfig: Partial<ScannerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const scanner = new UniversalScanner();