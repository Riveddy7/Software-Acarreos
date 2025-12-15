'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Acarreo,
  Obra,
  Ruta,
  Truck,
  Material,
  RequisicionMaterial,
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
import { getCollection } from '@/lib/firebase/firestore';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

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
  const { userProfile } = useAuth();
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
  const [showScanner, setShowScanner] = useState(true);

  // New state for refactored workflow
  const [requisiciones, setRequisiciones] = useState<RequisicionMaterial[]>([]);
  const [selectedRequisicion, setSelectedRequisicion] = useState<RequisicionMaterial | null>(null);
  // Fix date initialization to use local time
  const [customDate, setCustomDate] = useState<string>(() => {
    const now = new Date();
    const localNow = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
    return localNow.toISOString().slice(0, 16);
  });

  // Refs
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    loadData();
    initializeServices();
  }, [obra]);

  // Update formData when date changes
  useEffect(() => {
    if (customDate) {
      setFormData(prev => ({
        ...prev,
        fechaHora: new Date(customDate) as any
      }));
    }
  }, [customDate]);

  const loadData = async () => {
    try {
      // Load rutas for this obra
      const rutasData = await loadRutasForObra(obra.id);
      setRutas(rutasData);

      // Load requisitions
      const requisicionesData = await loadRequisicionesForObra(obra.id);
      setRequisiciones(requisicionesData);

      // Load materials
      const materialesData = await loadMateriales();
      setMateriales(materialesData);

      // Get current location
      try {
        const currentLocation = await locationTracker.getCurrentLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.warn('Could not get location:', error);
        // Don't block loading, just continue without location
      }

      // Get printer status
      try {
        const status = await printerManager.getPrinterStatus();
        setPrinterStatus(status);
      } catch (error) {
        console.warn('Could not get printer status:', error);
      }
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
    // Ideally this should use getCollection filter logic too or a dedicated query
    // For now we assume this function (mocked or real elsewhere) is doing its job or needs refactor too.
    // Given the prompt didn't ask to rewrite this func's logic entirely but the flow, I'll keep it as placeholder 
    // or if I see it's mocked, I should implement it better if possible.
    // The previous code had it as a mock returning empty array. I should probably try to fetch them.
    try {
      const allRutas = await getCollection<Ruta>('rutas');
      const allObraRutas = allRutas.filter(r => r.idsObras?.includes(obraId) && r.estatusActivo);
      // Filter by 'rutas' collection actually having 'idObra'
      return allObraRutas;
    } catch (e) {
      console.error("Error loading routes", e);
      return [];
    }
  };

  const loadMateriales = async (): Promise<Material[]> => {
    try {
      return await getCollection<Material>('materials');
    } catch (e) {
      console.error("Error loading materials", e);
      return [];
    }
  };

  const loadRequisicionesForObra = async (obraId: string) => {
    try {
      const allRequisiciones = await getCollection<RequisicionMaterial>('requisiciones-material');
      // Filter by obra
      // Also potentially filter by status (e.g., authorized only)
      return allRequisiciones.filter(req => req.idObra === obraId);
    } catch (error) {
      console.error('Error loading requisitions:', error);
      return [];
    }
  };

  const handleRequisicionChange = (reqId: string) => {
    const req = requisiciones.find(r => r.id === reqId) || null;
    setSelectedRequisicion(req);
    if (req) {
      setFormData(prev => ({
        ...prev,
        idRequisicionAfectada: req.id
      }));
    }
  };

  const handleTruckScan = async (truckInfo: TruckScanInfo) => {
    console.log('handleTruckScan called with:', truckInfo);
    setScannedTruck(truckInfo);
    setShowScanner(false);

    // NEW logic: Set driver name from last driver
    const lastDriver = truckInfo.lastDriverName || '';

    setFormData(prev => ({
      ...prev,
      idCamion: truckInfo.truck.id,
      nombreMostrarCamion: truckInfo.truck.nombreParaMostrar,
      idTransportista: truckInfo.truck.idTransportista,
      // Calculate volume based on 50% default
      cantidadCapturada: acarreoValidator.calcularVolumenDesdePorcentaje(50, truckInfo.capacity),
      nombreCamionero: lastDriver
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

  const validateAndSave = async () => {
    // Debug info
    console.log('--- VALIDATE AND SAVE START ---');
    console.log('Current scannedTruck:', scannedTruck);
    console.log('Current formData:', formData);
    console.log('Check conditions:', {
      hasRuta: !!selectedRuta,
      hasTruck: !!scannedTruck,
      hasIdCamion: !!formData.idCamion,
      hasMaterial: !!selectedMaterial
    });

    // Modified check: allow if scannedTruck is missing BUT formData has idCamion
    if (!selectedRuta || (!scannedTruck && !formData.idCamion) || !selectedMaterial) {
      console.error('Validation failed: Missing required fields');
      setErrors(['Complete todos los campos requeridos (Ruta, Camión, Material)']);
      return;
    }

    setLoading(true);
    setErrors([]);
    setWarnings([]);

    try {
      // Complete form data
      const completeFormData: Partial<Acarreo> = {
        ...formData,
        idUsuario: userProfile?.id,
        nombreMostrarUsuario: userProfile?.username || 'Operador',
        // Priority: 1. scannedTruck.id, 2. formData.idCamion
        idCamion: scannedTruck?.truck?.id || formData.idCamion,
        nombreMostrarCamion: scannedTruck?.truck?.nombreParaMostrar || formData.nombreMostrarCamion || '',
        fechaHoraCaptura: new Date() as any,
        latitudUbicacionCaptura: location?.latitude,
        longitudUbicacionCaptura: location?.longitude,
      };

      console.log('completeFormData constructed:', completeFormData);

      // Construct a temporary truck object if scannedTruck is missing but ID is present
      const truckForValidation: Truck = scannedTruck?.truck || {
        id: formData.idCamion!,
        nombreParaMostrar: formData.nombreMostrarCamion || 'Camión',
        placas: '',
        estatusActivo: true,
        // Add other required fields with defaults if necessary for validation
        idTransportista: (formData as any).idTransportista || '',
        idTipoCamion: '',
        idClasificacionViaje: '',
        status: 'AVAILABLE'
      } as Truck;

      // Validate complete form
      // Note: We might want to pass empty arrays for requisition checks if not enforcing matching logic yet
      const validation = await acarreoValidator.validarAcarreoCompleto(
        completeFormData,
        selectedRuta,
        truckForValidation, // Use the fallback truck object
        selectedMaterial,
        [], // requisitions
        [] // lines
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
    try {
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const db = getFirestore();

      // Prepare data for saving
      const dataToSave = {
        ...acarreo,
        createdAt: serverTimestamp(),
        estatusConciliado: false,
        // Link to requisition if matched
        idRequisicion: requisitionMatch?.requisicion?.id || null,
        idLineaRequisicion: requisitionMatch?.linea?.id || null,
        folioRequisicion: (requisitionMatch?.requisicion as any)?.folio || (requisitionMatch?.requisicion as any)?.folioPublico || null
      };

      // Clean undefined fields to avoid Firestore errors
      Object.keys(dataToSave).forEach(key => {
        if ((dataToSave as any)[key] === undefined) {
          delete (dataToSave as any)[key];
        }
      });

      console.log('Saving acarreo to Firestore:', dataToSave);

      const docRef = await addDoc(collection(db, 'acarreos'), dataToSave);

      console.log('Acarreo saved with ID:', docRef.id);

      return {
        ...acarreo,
        id: docRef.id
      } as Acarreo;
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      throw error;
    }
  };

  const generateAndPrintTicket = async () => {
    if (!scannedTruck || !selectedRuta || !selectedMaterial) return;

    try {
      const ticketData: TicketAcarreoData = {
        id: 'TEMP_ID', // Would be generated
        fechaHora: (formData.fechaHora as any)?.toDate?.() || new Date(customDate),
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
        esInformativo: (selectedRuta.tipoAcarreoNombre?.toLowerCase().includes('movimiento interno') || false) && (formData.esTiro || false),
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
            <p className="text-sm text-gray-800">{obra.nombreParaMostrar}</p>
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

        {/* 1. Selección de Requisición */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">1. Requisición</h3>
          <select
            value={selectedRequisicion?.id || ''}
            onChange={(e) => handleRequisicionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
          >
            <option value="">Seleccionar requisición (Opcional)...</option>
            {requisiciones.map(req => (
              <option key={req.id} value={req.id}>
                {req.folioOrdenCompraExterno || req.descripcionCorta || `Requisición del ${(req.fechaSolicitud as any)?.toDate?.().toLocaleDateString() || req.createdAt}`}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-700 mt-2">
            Selecciona la requisición a la que pertenece este acarreo.
          </p>
        </div>

        {/* 2. Fecha y Hora */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">2. Fecha y Hora</h3>
          <input
            type="datetime-local"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
          />
        </div>

        {/* 3. Selección de Ruta */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">3. Seleccionar Ruta</h3>
          <select
            value={selectedRuta?.id || ''}
            onChange={(e) => {
              const ruta = rutas.find(r => r.id === e.target.value);
              if (ruta) handleRutaChange(ruta);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
          >
            <option value="">Seleccionar ruta...</option>
            {rutas.map(ruta => (
              <option key={ruta.id} value={ruta.id}>
                {ruta.nombreParaMostrar}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Tipo de Acarreo */}
        {selectedRuta && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">4. Tipo de Acarreo</h3>
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

        {/* 5. Escanear Camión (Mostrar info después de escanear) */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex justify-between items-center">
            <span>5. Escanear Camión</span>
            {!showScanner && scannedTruck && (
              <Button
                onClick={() => {
                  setShowScanner(true);
                  setScannedTruck(null);
                  setFormData(prev => ({
                    ...prev,
                    idCamion: '',
                    cantidadCapturada: 0,
                    porcentajeCargaCamion: 0
                  }));
                }}
                variant="secondary"
                size="sm"
              >
                Volver a escanear
              </Button>
            )}
          </h3>

          {showScanner ? (
            <TruckScanner
              onTruckScanned={handleTruckScan}
              onError={(error: any) => setErrors([error])}
            />
          ) : (
            scannedTruck && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg bg-green-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-bold text-green-900 text-lg">
                      {scannedTruck.truck.nombreParaMostrar}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      <span className="font-medium">Transportista:</span> {scannedTruck.truck.transportistaNombre || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
                  <div>
                    <span className="font-medium block">Placas:</span>
                    {scannedTruck.truck.placas}
                  </div>
                  <div>
                    <span className="font-medium block">Capacidad:</span>
                    {scannedTruck.capacity} m³
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium block">Último Conductor:</span>
                    {scannedTruck.lastDriverName || 'No registrado'}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* 6. Seleccionar Material */}
        {scannedTruck && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">6. Seleccionar Material</h3>
            <select
              value={selectedMaterial?.id || ''}
              onChange={(e) => {
                const material = materiales.find(m => m.id === e.target.value);
                if (material) handleMaterialChange(material);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
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

        {/* 7. Porcentaje y Volumen */}
        {scannedTruck && selectedMaterial && (
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-4">7. Volumen</h3>

            <label className="block text-sm font-bold text-gray-900 mb-2">
              Porcentaje de Carga: {formData.porcentajeCargaCamion}%
            </label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[25, 50, 75, 100].map(p => (
                <Button
                  key={p}
                  // Using a variation of the button style or custom class if variant doesn't match exactly
                  className={`border ${formData.porcentajeCargaCamion === p ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  onClick={() => handlePorcentajeChange(p)}
                  size="sm"
                >
                  {p}%
                </Button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Volumen Calculado (m³)
              </label>
              <input
                type="number"
                min="0"
                max={scannedTruck.capacity}
                step="0.1"
                value={formData.cantidadCapturada}
                onChange={(e) => handleVolumenChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
              />
              <div className="text-xs text-gray-700 mt-1">
                Capacidad Máxima: {scannedTruck.capacity} m³
              </div>
            </div>
          </div>
        )}

        {/* 8. Información Adicional */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">8. Información Adicional</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Nombre del Camionero
              </label>
              <input
                type="text"
                value={formData.nombreCamionero || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nombreCamionero: e.target.value }))}
                placeholder={scannedTruck?.lastDriverName || 'Nombre del camionero'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.nota || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, nota: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-600"
                placeholder="Notas adicionales..."
              />
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
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
          <div className="text-sm text-gray-800">
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