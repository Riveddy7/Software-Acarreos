'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Acarreo,
  Obra,
  Ruta,
  Truck,
  Material,
  TruckScanInfo,
  TicketAcarreoData
} from '@/models/types';
import { ValidationResult, RequisitionMatchResult } from '@/lib/operator/validation';
import TruckScanner from './TruckScanner';
import { acarreoValidator } from '@/lib/operator/validation';
import { scanner } from '@/lib/operator/scanner';
import { photoCapture } from '@/lib/operator/photo';
import { printerManager } from '@/lib/operator/printer';
import { locationTracker } from '@/lib/operator/location';
import { Button } from '@/components/ui/Button';

interface AcarreoCaptureFormProps {
  obra: Obra;
  onAcarreoSaved: (acarreo: Acarreo) => void;
  onCancel: () => void;
}

export default function AcarreoCaptureForm({ 
  obra, 
  onAcarreoSaved, 
  onCancel 
}: AcarreoCaptureFormProps) {
  // Form state
  const [formData, setFormData] = useState<Partial<Acarreo>>({
    idObra: obra.id,
    nombreMostrarObra: obra.nombreParaMostrar,
    fechaHora: new Date() as any,
    esCarga: false,
    esTiro: false,
    porcentajeCargaCamion: 50,
    cantidadCapturada: 0,
    idUsuario: '', // Will be set from auth context
    nombreMostrarUsuario: '', // Will be set from auth context
    dispositivoUtilizado: navigator.userAgent,
    estatusConciliado: false
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [scannedTruck, setScannedTruck] = useState<TruckScanInfo | null>(null);
  const [selectedRuta, setSelectedRuta] = useState<Ruta | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [requisitionMatch, setRequisitionMatch] = useState<RequisitionMatchResult | null>(null);
  const [photoResult, setPhotoResult] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const [printerStatus, setPrinterStatus] = useState<any>(null);

  // Data lists
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showTicketPreview, setShowTicketPreview] = useState(false);

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadData();
    initializeServices();
  }, [obra]);

  const loadData = async () => {
    try {
      // Load rutas for this obra
      const rutasData = await loadRutasForObra(obra.id);
      setRutas(rutasData);

      // Load materials
      const materialesData = await loadMateriales();
      setMateriales(materialesData);

      // Get current location
      const currentLocation = await locationTracker.getCurrentLocation();
      setLocation(currentLocation);

      // Get printer status
      const status = await printerManager.getPrinterStatus();
      setPrinterStatus(status);
    } catch (error) {
      console.error('Error loading data:', error);
      setErrors(['Error al cargar los datos iniciales']);
    }
  };

  const initializeServices = async () => {
    try {
      // Initialize scanner
      await scanner.detectAvailableTechnologies();
      
      // Initialize location tracking
      await locationTracker.validateLocationPermission();
      
      // Detect printers
      await printerManager.detectPrinters();
    } catch (error) {
      console.error('Error initializing services:', error);
    }
  };

  const loadRutasForObra = async (obraId: string): Promise<Ruta[]> => {
    // Mock implementation - would load from Firestore
    return [];
  };

  const loadMateriales = async (): Promise<Material[]> => {
    // Mock implementation - would load from Firestore
    return [];
  };

  const handleTruckScan = async (truckInfo: TruckScanInfo) => {
    setScannedTruck(truckInfo);
    setFormData(prev => ({
      ...prev,
      idCamion: truckInfo.truck.id,
      nombreMostrarCamion: truckInfo.truck.nombreParaMostrar,
      idTransportista: truckInfo.truck.idTransportista,
      // Calculate volume based on 50% default
      cantidadCapturada: acarreoValidator.calcularVolumenDesdePorcentaje(50, truckInfo.capacity)
    }));

    // Validate material compatibility
    if (selectedMaterial) {
      const validation = acarreoValidator.validarCompatibilidadMaterialCamion(selectedMaterial, truckInfo.truck);
      setWarnings(validation.warnings);
    }
  };

  const handleRutaChange = (ruta: Ruta) => {
    setSelectedRuta(ruta);
    setFormData(prev => ({
      ...prev,
      idRuta: ruta.id,
      nombreMostrarRuta: ruta.nombreParaMostrar,
      idLugarOrigen: ruta.idLugarOrigen,
      nombreMostrarLugarOrigen: ruta.lugarOrigenNombre,
      idLugarDestino: ruta.idLugarDestino,
      nombreMostrarLugarDestino: ruta.lugarDestinoNombre,
      idTipoAcarreo: ruta.idTipoAcarreo,
      nombreMostrarTipoAcarreo: ruta.tipoAcarreoNombre,
      kilometrosTotalesRuta: ruta.totalKilometrosReales || 0
    }));

    // Validate tipo de acarreo
    const validation = acarreoValidator.validarTipoAcarreo(ruta, formData.esCarga ? 'carga' : 'tiro');
    setErrors(validation.errors);
    setWarnings(validation.warnings);
  };

  const handleMaterialChange = (material: Material) => {
    setSelectedMaterial(material);
    setFormData(prev => ({
      ...prev,
      idMaterial: material.id,
      nombreMaterial: material.nombreParaMostrar
    }));

    // Validate compatibility with scanned truck
    if (scannedTruck) {
      const validation = acarreoValidator.validarCompatibilidadMaterialCamion(material, scannedTruck.truck);
      setWarnings(prev => [...prev.filter(w => !w.includes('compatibilidad')), ...validation.warnings]);
    }
  };

  const handleTipoChange = (tipo: 'carga' | 'tiro', valor: boolean) => {
    setFormData(prev => ({
      ...prev,
      [`es${tipo.charAt(0).toUpperCase() + tipo.slice(1)}`]: valor
    }));

    // Validate against selected route
    if (selectedRuta) {
      const validation = acarreoValidator.validarTipoAcarreo(selectedRuta, valor ? tipo : (tipo === 'carga' ? 'tiro' : 'carga'));
      setErrors(validation.errors);
      setWarnings(validation.warnings);
    }
  };

  const handlePorcentajeChange = (porcentaje: number) => {
    const volumen = scannedTruck 
      ? acarreoValidator.calcularVolumenDesdePorcentaje(porcentaje, scannedTruck.capacity)
      : 0;

    setFormData(prev => ({
      ...prev,
      porcentajeCargaCamion: porcentaje,
      cantidadCapturada: volumen
    }));

    // Validate volume
    if (scannedTruck) {
      const validation = acarreoValidator.validarVolumen(volumen, scannedTruck.capacity);
      setErrors(prev => [...prev.filter(e => !e.includes('volumen')), ...validation.errors]);
      setWarnings(prev => [...prev.filter(w => !w.includes('volumen')), ...validation.warnings]);
    }
  };

  const handleVolumenChange = (volumen: number) => {
    const porcentaje = scannedTruck
      ? acarreoValidator.calcularPorcentajeDesdeVolumen(volumen, scannedTruck.capacity)
      : 0;

    setFormData(prev => ({
      ...prev,
      cantidadCapturada: volumen,
      porcentajeCargaCamion: porcentaje
    }));

    // Validate volume
    if (scannedTruck) {
      const validation = acarreoValidator.validarVolumen(volumen, scannedTruck.capacity);
      setErrors(prev => [...prev.filter(e => !e.includes('volumen')), ...validation.errors]);
      setWarnings(prev => [...prev.filter(w => !w.includes('volumen')), ...validation.warnings]);
    }
  };

  const handlePhotoCapture = async () => {
    try {
      const result = await photoCapture.captureFromCamera();
      setPhotoResult(result);
      setShowPhotoModal(false);
      
      // Upload photo
      const filename = photoCapture.generateFilename('acarreo');
      const photoUrl = await photoCapture.uploadPhoto(
        result.compressedFile,
        `acarreos/${obra.id}/${filename}`
      );
      
      setFormData(prev => ({
        ...prev,
        urlFoto: photoUrl
      }));
    } catch (error) {
      console.error('Error capturing photo:', error);
      setErrors(prev => [...prev, 'Error al capturar la foto']);
    }
  };

  const handlePhotoSelect = async () => {
    try {
      const result = await photoCapture.selectFromGallery();
      setPhotoResult(result);
      setShowPhotoModal(false);
      
      // Upload photo
      const filename = photoCapture.generateFilename('acarreo');
      const photoUrl = await photoCapture.uploadPhoto(
        result.compressedFile,
        `acarreos/${obra.id}/${filename}`
      );
      
      setFormData(prev => ({
        ...prev,
        urlFoto: photoUrl
      }));
    } catch (error) {
      console.error('Error selecting photo:', error);
      setErrors(prev => [...prev, 'Error al seleccionar la foto']);
    }
  };

  const findRequisitionMatch = async () => {
    if (!formData.idMaterial || !scannedTruck) return;

    try {
      // Load requisitions and lines
      const requisitions = await loadRequisicionesForObra(obra.id);
      const lines = await loadLineasRequisicion();
      
      const match = await acarreoValidator.encontrarRequisicionAdecuada(
        formData,
        requisitions,
        lines
      );
      
      setRequisitionMatch(match);
      
      if (match.requisicion) {
        setFormData(prev => ({
          ...prev,
          idRequisicionAfectada: match.requisicion.id,
          idLineaRequisicionAfectada: match.linea?.id
        }));
      }
    } catch (error) {
      console.error('Error finding requisition match:', error);
    }
  };

  const loadRequisicionesForObra = async (obraId: string) => {
    // Mock implementation
    return [];
  };

  const loadLineasRequisicion = async () => {
    // Mock implementation
    return [];
  };

  const validateAndSave = async () => {
    if (!selectedRuta || !scannedTruck || !selectedMaterial) {
      setErrors(['Complete todos los campos requeridos']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      // Complete form data
      const completeFormData: Partial<Acarreo> = {
        ...formData,
        fechaHoraCaptura: new Date() as any,
        latitudUbicacionCaptura: location?.latitude,
        longitudUbicacionCaptura: location?.longitude,
        esInformativo: (selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('movimiento interno') || false) && (formData.esTiro || false)
      };

      // Validate complete form
      const validation = await acarreoValidator.validarAcarreoCompleto(
        completeFormData,
        selectedRuta,
        scannedTruck.truck,
        selectedMaterial,
        [],
        []
      );

      if (!validation.isValid) {
        setErrors(validation.errors);
        setWarnings(validation.warnings);
        return;
      }

      // Save acarreo
      const savedAcarreo = await saveAcarreo(completeFormData as Acarreo);
      onAcarreoSaved(savedAcarreo);

    } catch (error) {
      console.error('Error saving acarreo:', error);
      setErrors(['Error al guardar el acarreo']);
    } finally {
      setLoading(false);
    }
  };

  const saveAcarreo = async (acarreo: Acarreo): Promise<Acarreo> => {
    // Mock implementation - would save to Firestore
    return acarreo;
  };

  const generateAndPrintTicket = async () => {
    if (!scannedTruck || !selectedRuta || !selectedMaterial) return;

    try {
      const ticketData: TicketAcarreoData = {
        id: 'TEMP_ID', // Would be generated
        fechaHora: (formData.fechaHora as any)?.toDate?.() || new Date(),
        obraNombre: obra.nombreParaMostrar,
        rutaNombre: selectedRuta.nombreParaMostrar,
        materialNombre: selectedMaterial.nombreParaMostrar,
        camionNombre: scannedTruck.truck.nombreParaMostrar,
        camionPlacas: scannedTruck.truck.placas,
        camionCapacidad: scannedTruck.capacity,
        volumenCapturado: formData.cantidadCapturada || 0,
        esCarga: formData.esCarga || false,
        esTiro: formData.esTiro || false,
        lugarNombre: formData.esCarga ? (selectedRuta.lugarOrigenNombre || '') : (selectedRuta.lugarDestinoNombre || ''),
        kilometrosRuta: selectedRuta.totalKilometrosReales || 0,
        esInformativo: selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('movimiento interno') && formData.esTiro,
        usuarioNombre: formData.nombreMostrarUsuario || 'Operador',
        nota: formData.nota,
        empresaInternaLogo: obra.empresaInternaNombre, // Would be populated
        empresaInternaNombre: obra.empresaInternaNombre
      };

      // Print ticket
      const printed = await printerManager.printTicket(ticketData);
      
      if (printed) {
        // Save and continue
        await validateAndSave();
      } else {
        setErrors(['Error al imprimir el ticket']);
      }
    } catch (error) {
      console.error('Error printing ticket:', error);
      setErrors(['Error al generar el ticket']);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Capturar Acarreo</h1>
            <p className="text-sm text-gray-600">{obra.nombreParaMostrar}</p>
          </div>
          <Button onClick={onCancel} variant="secondary" size="sm">
            Cancelar
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Errors and Warnings */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Errores:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">Advertencias:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              {warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Truck Scanner */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">1. Escanear Camión</h3>
          <TruckScanner
            onTruckScanned={handleTruckScan}
            onError={(error: any) => setErrors([error])}
          />
          
          {scannedTruck && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                Camión escaneado: {scannedTruck.truck.nombreParaMostrar}
              </p>
              <p className="text-xs text-green-600">
                Placas: {scannedTruck.truck.placas} | 
                Capacidad: {scannedTruck.capacity} m³
              </p>
            </div>
          )}
        </div>

        {/* Route Selection */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">2. Seleccionar Ruta</h3>
          <select
            value={selectedRuta?.id || ''}
            onChange={(e) => {
              const ruta = rutas.find(r => r.id === e.target.value);
              if (ruta) handleRutaChange(ruta);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!scannedTruck}
          >
            <option value="">Seleccionar ruta...</option>
            {rutas.map(ruta => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.nombreParaMostrar}
              </option>
            ))}
          </select>
        </div>

        {/* Type Selection */}
        {selectedRuta && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">3. Tipo de Acarreo</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTipoChange('carga', !formData.esCarga)}
                className={`
                  p-4 rounded-lg border-2 font-medium transition-all
                  ${formData.esCarga 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                  ${selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('material traído a obra') && !formData.esCarga
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }
                `}
                disabled={selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('material traído a obra') && !formData.esCarga}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4 8l4-8m0 0v12m0 0h4m-4 0h-2v4m0 0v4" />
                  </svg>
                  <div>CARGA</div>
                  <div className="text-xs mt-1">Sacar material</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTipoChange('tiro', !formData.esTiro)}
                className={`
                  p-4 rounded-lg border-2 font-medium transition-all
                  ${formData.esTiro 
                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                    : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }
                  ${selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('material sacado de obra') && !formData.esTiro
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                  }
                `}
                disabled={selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('material sacado de obra') && !formData.esTiro}
              >
                <div className="text-center">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m14 0v-3a2 2 0 00-2-2H5a2 2 0 00-2 2v3m14 0a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v3m0 0a2 2 0 002 2h2a2 2 0 002-2m-2 0h-2a2 2 0 00-2-2" />
                  </svg>
                  <div>TIRO</div>
                  <div className="text-xs mt-1">Poner material</div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Material Selection */}
        {scannedTruck && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">4. Seleccionar Material</h3>
            <select
              value={selectedMaterial?.id || ''}
              onChange={(e) => {
                const material = materiales.find(m => m.id === e.target.value);
                if (material) handleMaterialChange(material);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Seleccionar material...</option>
              {materiales.map(material => (
                <option key={material.id} value={material.id}>
                  {material.nombreParaMostrar}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Volume Input */}
        {scannedTruck && selectedMaterial && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">5. Volumen</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de Carga
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.porcentajeCargaCamion}
                  onChange={(e) => handlePorcentajeChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">%</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Volumen (m³)
                </label>
                <input
                  type="number"
                  min="0"
                  max={scannedTruck.capacity}
                  step="0.1"
                  value={formData.cantidadCapturada}
                  onChange={(e) => handleVolumenChange(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Capacidad: {scannedTruck.capacity} m³
                </div>
              </div>
            </div>

            {/* Requisition Match */}
            {requisitionMatch && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  Requisición afectada: {requisitionMatch.requisicion?.fechaSolicitud ? `Requisición del ${requisitionMatch.requisicion.fechaSolicitud.toDate().toLocaleDateString()}` : 'Requisición'}
                </p>
                <p className="text-xs text-blue-600">
                  {requisitionMatch.motivo}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Additional Fields */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">6. Información Adicional</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Camionero
              </label>
              <input
                type="text"
                value={formData.nombreCamionero || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreCamionero: e.target.value }))}
                placeholder={scannedTruck?.lastDriverName || 'Nombre del camionero'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.nota || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto (opcional)
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  onClick={() => setShowPhotoModal(true)}
                  variant="secondary"
                  size="sm"
                >
                  {photoResult ? 'Cambiar Foto' : 'Tomar Foto'}
                </Button>
                
                {photoResult && (
                  <div className="flex items-center">
                    <img 
                      src={photoResult.compressedUrl} 
                      alt="Foto del acarreo"
                      className="w-16 h-16 object-cover rounded border border-gray-200"
                    />
                    <span className="ml-2 text-sm text-green-600">
                      ✓ Foto capturada
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {printerStatus?.connected ? (
              <span className="text-green-600">✓ Impresora conectada</span>
            ) : (
              <span className="text-red-600">⚠ Sin impresora</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button
              onClick={validateAndSave}
              disabled={loading || !selectedRuta || !scannedTruck || !selectedMaterial}
              size="lg"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
            
            {printerStatus?.connected && (
              <Button
                onClick={generateAndPrintTicket}
                disabled={loading || !selectedRuta || !scannedTruck || !selectedMaterial}
                variant="primary"
                size="lg"
              >
                {loading ? 'Procesando...' : 'Guardar e Imprimir'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Capturar Foto</h3>
            <div className="space-y-3">
              <Button
                onClick={handlePhotoCapture}
                className="w-full"
              >
                📷 Tomar Foto con Cámara
              </Button>
              <Button
                onClick={handlePhotoSelect}
                variant="secondary"
                className="w-full"
              >
                🖼️ Seleccionar de Galería
              </Button>
              <Button
                onClick={() => setShowPhotoModal(false)}
                variant="secondary"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}