import { PrinterStatus, TicketAcarreoData } from '@/models/types';

export interface Printer {
  id: string;
  name: string;
  type: 'bluetooth' | 'usb' | 'network';
  connected: boolean;
  paperLevel?: number;
}

export class PrinterManager {
  private printers: Printer[] = [];
  private currentPrinter: Printer | null = null;

  /**
   * Detect available printers
   */
  async detectPrinters(): Promise<Printer[]> {
    const detectedPrinters: Printer[] = [];

    try {
      // Detect Bluetooth printers
      const bluetoothPrinters = await this.detectBluetoothPrinters();
      detectedPrinters.push(...bluetoothPrinters);

      // Detect USB printers (limited in web environment)
      const usbPrinters = await this.detectUSBPrinters();
      detectedPrinters.push(...usbPrinters);

      // Detect network printers
      const networkPrinters = await this.detectNetworkPrinters();
      detectedPrinters.push(...networkPrinters);

      this.printers = detectedPrinters;
      return detectedPrinters;
    } catch (error) {
      console.error('Error detecting printers:', error);
      return [];
    }
  }

  /**
   * Detect Bluetooth printers
   */
  private async detectBluetoothPrinters(): Promise<Printer[]> {
    const printers: Printer[] = [];

    try {
      if ('bluetooth' in navigator) {
        const bluetooth = (navigator as any).bluetooth;
        
        try {
          const device = await bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['printer_service']
          });

          printers.push({
            id: device.id,
            name: device.name || 'Bluetooth Printer',
            type: 'bluetooth',
            connected: false
          });
        } catch (error) {
          console.log('No Bluetooth printers found or permission denied');
        }
      }
    } catch (error) {
      console.log('Bluetooth not available');
    }

    return printers;
  }

  /**
   * Detect USB printers (limited in web environment)
   */
  private async detectUSBPrinters(): Promise<Printer[]> {
    const printers: Printer[] = [];

    try {
      if ('usb' in navigator) {
        const usb = (navigator as any).usb;
        
        try {
          const devices = await usb.getDevices();
          
          devices.forEach((device: any) => {
            if (device.deviceClass === 7) { // Printer class
              printers.push({
                id: device.deviceId,
                name: device.productName || 'USB Printer',
                type: 'usb',
                connected: device.opened
              });
            }
          });
        } catch (error) {
          console.log('No USB printers found');
        }
      }
    } catch (error) {
      console.log('USB API not available');
    }

    return printers;
  }

  /**
   * Detect network printers
   */
  private async detectNetworkPrinters(): Promise<Printer[]> {
    const printers: Printer[] = [];

    try {
      // Try to detect common network printer ports
      const commonPorts = [9100, 9101, 9102];
      const localIP = await this.getLocalIP();
      
      if (localIP) {
        const networkPrefix = localIP.substring(0, localIP.lastIndexOf('.'));
        
        for (let i = 1; i <= 254; i++) {
          const testIP = `${networkPrefix}.${i}`;
          
          for (const port of commonPorts) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 1000);
              
              const response = await fetch(`http://${testIP}:${port}`, {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-cache',
                signal: controller.signal
              });
              
              clearTimeout(timeoutId);
              
              printers.push({
                id: `${testIP}:${port}`,
                name: `Network Printer (${testIP})`,
                type: 'network',
                connected: true
              });
            } catch (error) {
              // Ignore connection errors
            }
          }
        }
      }
    } catch (error) {
      console.log('Network printer detection failed');
    }

    return printers;
  }

  /**
   * Get local IP address
   */
  private async getLocalIP(): Promise<string | null> {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.log('Could not get local IP');
      return null;
    }
  }

  /**
   * Connect to a specific printer
   */
  async connectToPrinter(printerId: string): Promise<boolean> {
    try {
      const printer = this.printers.find(p => p.id === printerId);
      
      if (!printer) {
        throw new Error(`Printer with ID ${printerId} not found`);
      }

      switch (printer.type) {
        case 'bluetooth':
          return await this.connectBluetoothPrinter(printer);
        case 'usb':
          return await this.connectUSBPrinter(printer);
        case 'network':
          return await this.connectNetworkPrinter(printer);
        default:
          throw new Error(`Unsupported printer type: ${printer.type}`);
      }
    } catch (error) {
      console.error('Failed to connect to printer:', error);
      return false;
    }
  }

  /**
   * Connect to Bluetooth printer
   */
  private async connectBluetoothPrinter(printer: Printer): Promise<boolean> {
    try {
      if ('bluetooth' in navigator) {
        const bluetooth = (navigator as any).bluetooth;
        const device = await bluetooth.requestDevice({
          filters: [{ name: printer.name }]
        });

        // Connect to the GATT server
        const server = await device.gatt.connect();
        
        this.currentPrinter = {
          ...printer,
          connected: true
        };

        return true;
      }
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
    }

    return false;
  }

  /**
   * Connect to USB printer
   */
  private async connectUSBPrinter(printer: Printer): Promise<boolean> {
    try {
      if ('usb' in navigator) {
        const usb = (navigator as any).usb;
        const device = await usb.requestDevice({
          filters: [{ deviceId: printer.id }]
        });

        await device.open();
        
        this.currentPrinter = {
          ...printer,
          connected: true
        };

        return true;
      }
    } catch (error) {
      console.error('USB connection failed:', error);
    }

    return false;
  }

  /**
   * Connect to network printer
   */
  private async connectNetworkPrinter(printer: Printer): Promise<boolean> {
    try {
      // Test connection to network printer
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`http://${printer.id.replace(':', ':')}/status`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        this.currentPrinter = {
          ...printer,
          connected: true
        };

        return true;
      }
    } catch (error) {
      console.error('Network connection failed:', error);
    }

    return false;
  }

  /**
   * Print ticket data
   */
  async printTicket(ticketData: TicketAcarreoData): Promise<boolean> {
    if (!this.currentPrinter || !this.currentPrinter.connected) {
      throw new Error('No printer connected');
    }

    try {
      const printContent = this.formatTicketForPrinting(ticketData);
      
      switch (this.currentPrinter.type) {
        case 'bluetooth':
          return await this.printBluetooth(printContent);
        case 'usb':
          return await this.printUSB(printContent);
        case 'network':
          return await this.printNetwork(printContent);
        default:
          throw new Error(`Unsupported printer type: ${this.currentPrinter.type}`);
      }
    } catch (error) {
      console.error('Print failed:', error);
      return false;
    }
  }

  /**
   * Format ticket data for printing
   */
  private formatTicketForPrinting(ticketData: TicketAcarreoData): string {
    const lines = [
      '================================',
      '           TICKET DE ACARREO',
      '================================',
      '',
      `Fecha: ${ticketData.fechaHora.toLocaleString()}`,
      `Obra: ${ticketData.obraNombre}`,
      `Ruta: ${ticketData.rutaNombre}`,
      '',
      '--------------------------------',
      `Material: ${ticketData.materialNombre}`,
      `Camión: ${ticketData.camionNombre}`,
      `Placas: ${ticketData.camionPlacas}`,
      `Capacidad: ${ticketData.camionCapacidad} m³`,
      `Volumen: ${ticketData.volumenCapturado} m³`,
      '',
      'Tipo:',
      `  Carga: ${ticketData.esCarga ? '[X]' : '[ ]'}`,
      `  Tiro: ${ticketData.esTiro ? '[X]' : '[ ]'}`,
      '',
      `Lugar: ${ticketData.lugarNombre}`,
      `Kilómetros: ${ticketData.kilometrosRuta}`,
      '',
      `ID: ${ticketData.id}`,
      `Usuario: ${ticketData.usuarioNombre}`,
      '',
    ];

    if (ticketData.esInformativo) {
      lines.push('*** TICKET INFORMATIVO ***');
      lines.push('USAR EL TICKET DE CARGA');
      lines.push('PARA CONCILIACIÓN');
      lines.push('');
    }

    if (ticketData.nota) {
      lines.push('Notas:');
      lines.push(ticketData.nota);
      lines.push('');
    }

    lines.push('================================');
    lines.push('');

    return lines.join('\n');
  }

  /**
   * Print to Bluetooth printer
   */
  private async printBluetooth(content: string): Promise<boolean> {
    try {
      if (!this.currentPrinter) return false;

      // Convert content to bytes (ESC/POS commands would go here)
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content);

      // Send to Bluetooth printer
      // This would require specific printer implementation
      console.log('Printing to Bluetooth:', content);

      return true;
    } catch (error) {
      console.error('Bluetooth print failed:', error);
      return false;
    }
  }

  /**
   * Print to USB printer
   */
  private async printUSB(content: string): Promise<boolean> {
    try {
      if (!this.currentPrinter) return false;

      // Convert content to bytes
      const encoder = new TextEncoder();
      const bytes = encoder.encode(content);

      // Send to USB printer
      console.log('Printing to USB:', content);

      return true;
    } catch (error) {
      console.error('USB print failed:', error);
      return false;
    }
  }

  /**
   * Print to network printer
   */
  private async printNetwork(content: string): Promise<boolean> {
    try {
      if (!this.currentPrinter) return false;

      const printerUrl = `http://${this.currentPrinter.id}/print`;
      
      const response = await fetch(printerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: content
      });

      return response.ok;
    } catch (error) {
      console.error('Network print failed:', error);
      return false;
    }
  }

  /**
   * Get printer status
   */
  async getPrinterStatus(): Promise<PrinterStatus> {
    if (!this.currentPrinter) {
      return {
        available: false,
        connected: false
      };
    }

    try {
      // Check if printer is still responsive
      const isResponsive = await this.checkPrinterResponsiveness();
      
      return {
        available: true,
        name: this.currentPrinter.name,
        connected: this.currentPrinter.connected && isResponsive,
        paperLevel: this.currentPrinter.paperLevel
      };
    } catch (error) {
      return {
        available: true,
        name: this.currentPrinter.name,
        connected: false
      };
    }
  }

  /**
   * Check if printer is responsive
   */
  private async checkPrinterResponsiveness(): Promise<boolean> {
    if (!this.currentPrinter) return false;

    try {
      switch (this.currentPrinter.type) {
        case 'bluetooth':
          // Check Bluetooth connection
          return true; // Simplified
        case 'usb':
          // Check USB connection
          return true; // Simplified
        case 'network':
          // Ping network printer
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
          const response = await fetch(`http://${this.currentPrinter.id}/status`, {
            method: 'GET',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          return response.ok;
        default:
          return false;
      }
    } catch (error) {
      return false;
    }
  }

  /**
   * Disconnect current printer
   */
  disconnectPrinter(): void {
    if (this.currentPrinter) {
      this.currentPrinter.connected = false;
      this.currentPrinter = null;
    }
  }

  /**
   * Get current printer
   */
  getCurrentPrinter(): Printer | null {
    return this.currentPrinter;
  }

  /**
   * Get available printers
   */
  getAvailablePrinters(): Printer[] {
    return [...this.printers];
  }
}

// Export singleton instance
export const printerManager = new PrinterManager();