import {
  Acarreo,
  Ruta,
  Truck,
  Material,
  RequisicionMaterial,
  LineaRequisicionMaterial
} from '@/models/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RequisitionMatchResult {
  requisicion: RequisicionMaterial | null;
  linea: LineaRequisicionMaterial | null;
  motivo: string;
}

export class AcarreoValidator {
  /**
   * Validate tipo de acarreo vs ruta
   */
  validarTipoAcarreo(ruta: Ruta, tipoEvento: 'carga' | 'tiro'): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get tipo de acarreo from route (would need to be populated from Firestore)
    // For now, we'll assume the route has a tipoAcarreoNombre property
    const tipoAcarreoNombre = ruta.tipoAcarreoNombre?.toLowerCase() || '';

    switch (tipoAcarreoNombre) {
      case 'material traído a obra':
        if (tipoEvento === 'carga') {
          errors.push('Para "Material traído a obra" solo se permite CARGA');
        }
        break;
      
      case 'material sacado de obra':
        if (tipoEvento === 'tiro') {
          errors.push('Para "Material sacado de obra" solo se permite TIRO');
        }
        break;
      
      case 'movimiento interno de material':
        // Both options are allowed for movimiento interno
        warnings.push('Para "Movimiento interno" ambos tipos están permitidos, pero solo la CARGA se considera para conciliación');
        break;
      
      default:
        warnings.push(`Tipo de acarreo no reconocido: ${tipoAcarreoNombre}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validar compatibilidad material-camión
   */
  validarCompatibilidadMaterialCamion(material: Material, camion: Truck): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Get truck type and classification
    const tipoCamionNombre = camion.tipoCamionNombre?.toLowerCase() || '';
    const clasificacionNombre = camion.clasificacionViajeNombre?.toLowerCase() || '';

    // Basic compatibility rules
    if (material.nombreParaMostrar.toLowerCase().includes('agua') || 
        material.nombreParaMostrar.toLowerCase().includes('water')) {
      
      if (tipoCamionNombre.includes('volteo') || 
          tipoCamionNombre.includes('dump') ||
          clasificacionNombre.includes('volteo')) {
        errors.push('Un camión volteo no puede acarrear agua');
      }
    }

    // Check if material is compatible with truck type
    if (material.idClasificacionMaterial && camion.idTipoCamion) {
      // This would require additional lookup in Firestore
      // For now, we'll add a warning
      warnings.push('Verificar compatibilidad específica entre material y tipo de camión');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validar volumen vs capacidad del camión
   */
  validarVolumen(volumen: number, capacidadCamion: number): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (volumen <= 0) {
      errors.push('El volumen debe ser mayor a 0');
    }

    if (volumen > capacidadCamion) {
      errors.push(`El volumen (${volumen} m³) excede la capacidad máxima del camión (${capacidadCamion} m³)`);
    }

    if (volumen > capacidadCamion * 0.95) {
      warnings.push('El volumen está muy cerca de la capacidad máxima del camión');
    }

    if (volumen < capacidadCamion * 0.1) {
      warnings.push('El volumen es muy bajo respecto a la capacidad del camión');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Encontrar requisición adecuada para el acarreo
   */
  async encontrarRequisicionAdecuada(
    acarreoData: Partial<Acarreo>,
    requisiciones: RequisicionMaterial[],
    lineasRequisicion: LineaRequisicionMaterial[]
  ): Promise<RequisitionMatchResult> {
    // Filter authorized or partially fulfilled requisitions
    const requisicionesValidas = requisiciones.filter((req: RequisicionMaterial) =>
      req.estatusAutorizado &&
      req.idObra === acarreoData.idObra
      // Note: idTransportista is not in Acarreo interface, would need to be added
      // req.idTransportista === acarreoData.idTransportista
    );

    if (requisicionesValidas.length === 0) {
      return {
        requisicion: null,
        linea: null,
        motivo: 'No hay requisiciones autorizadas para esta obra y transportista'
      };
    }

    // Get lines for these requisitions
    const lineasValidas = lineasRequisicion.filter((linea: LineaRequisicionMaterial) =>
      requisicionesValidas.some((req: RequisicionMaterial) => req.id === linea.idRequisicionMaterial) &&
      linea.idMaterial === acarreoData.idMaterial &&
      (linea.cantidadAutorizada || linea.cantidad) > (linea.cantidadEntregada || 0)
    );

    if (lineasValidas.length === 0) {
      return {
        requisicion: null,
        linea: null,
        motivo: 'No hay líneas de requisición con saldo disponible para este material'
      };
    }

    // Sort by requisition date (oldest first)
    lineasValidas.sort((a: LineaRequisicionMaterial, b: LineaRequisicionMaterial) => {
      const reqA = requisicionesValidas.find((req: RequisicionMaterial) => req.id === a.idRequisicionMaterial);
      const reqB = requisicionesValidas.find((req: RequisicionMaterial) => req.id === b.idRequisicionMaterial);
      
      if (!reqA || !reqB) return 0;
      
      return reqA.fechaSolicitud.toMillis() - reqB.fechaSolicitud.toMillis();
    });

    // Get the first (oldest) valid line
    const lineaSeleccionada = lineasValidas[0];
    const requisicionSeleccionada = requisicionesValidas.find(
      (req: RequisicionMaterial) => req.id === lineaSeleccionada.idRequisicionMaterial
    );

    if (!requisicionSeleccionada) {
      return {
        requisicion: null,
        linea: null,
        motivo: 'Error al encontrar la requisición asociada'
      };
    }

    // Check if the current volume fits in the available balance
    const saldoDisponible = (lineaSeleccionada.cantidadAutorizada || lineaSeleccionada.cantidad) - 
                         (lineaSeleccionada.cantidadEntregada || 0);

    if (acarreoData.cantidadCapturada && acarreoData.cantidadCapturada > saldoDisponible) {
      return {
        requisicion: null,
        linea: null,
        motivo: `El volumen del acarreo (${acarreoData.cantidadCapturada}) excede el saldo disponible (${saldoDisponible})`
      };
    }

    return {
      requisicion: requisicionSeleccionada,
      linea: lineaSeleccionada,
      motivo: 'Requisición encontrada y válida'
    };
  }

  /**
   * Validar que el acarreo no sea informativo
   */
  validarAcarreoInformativo(acarreoData: Partial<Acarreo>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if it's an informative acarreo (tiro in movimiento interno)
    const esMovimientoInterno = acarreoData.nombreMostrarTipoAcarreo?.toLowerCase().includes('movimiento interno');
    const esTiro = acarreoData.esTiro;

    if (esMovimientoInterno && esTiro) {
      warnings.push('Este es un acarreo informativo (tiro en movimiento interno). No afectará la conciliación.');
    }

    return {
      isValid: true, // Informative acarreos are always valid
      errors,
      warnings
    };
  }

  /**
   * Validar datos completos del acarreo
   */
  validarDatosCompletos(acarreoData: Partial<Acarreo>): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    const requiredFields = [
      { field: 'idObra', name: 'Obra' },
      { field: 'idRuta', name: 'Ruta' },
      { field: 'idCamion', name: 'Camión' },
      { field: 'idMaterial', name: 'Material' },
      { field: 'cantidadCapturada', name: 'Cantidad capturada' },
      { field: 'porcentajeCargaCamion', name: 'Porcentaje de carga' },
      { field: 'idUsuario', name: 'Usuario' },
      { field: 'fechaHora', name: 'Fecha y hora' }
    ];

    requiredFields.forEach(({ field, name }) => {
      if (!acarreoData[field as keyof Acarreo]) {
        errors.push(`El campo ${name} es requerido`);
      }
    });

    // Validate at least one type is selected
    if (!acarreoData.esCarga && !acarreoData.esTiro) {
      errors.push('Debe seleccionar al menos un tipo: Carga o Tiro');
    }

    // Validate percentage
    if (acarreoData.porcentajeCargaCamion) {
      if (acarreoData.porcentajeCargaCamion < 0 || acarreoData.porcentajeCargaCamion > 100) {
        errors.push('El porcentaje de carga debe estar entre 0 y 100');
      }
    }

    // Validate date
    if (acarreoData.fechaHora) {
      const now = new Date();
      const acarreoDate = acarreoData.fechaHora.toDate();
      
      if (acarreoDate > now) {
        warnings.push('La fecha del acarreo es futura');
      }

      // Check if date is too old (more than 24 hours)
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      if (acarreoDate < oneDayAgo) {
        warnings.push('La fecha del acarreo es de hace más de 24 horas');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validar reglas de negocio completas
   */
  async validarAcarreoCompleto(
    acarreoData: Partial<Acarreo>,
    ruta: Ruta,
    camion: Truck,
    material: Material,
    requisiciones: RequisicionMaterial[],
    lineasRequisicion: LineaRequisicionMaterial[]
  ): Promise<ValidationResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate basic data
    const datosValidacion = this.validarDatosCompletos(acarreoData);
    allErrors.push(...datosValidacion.errors);
    allWarnings.push(...datosValidacion.warnings);

    // Validate type vs route
    const tipoValidacion = this.validarTipoAcarreo(ruta, acarreoData.esCarga ? 'carga' : 'tiro');
    allErrors.push(...tipoValidacion.errors);
    allWarnings.push(...tipoValidacion.warnings);

    // Validate material-truck compatibility
    const compatibilidadValidacion = this.validarCompatibilidadMaterialCamion(material, camion);
    allErrors.push(...compatibilidadValidacion.errors);
    allWarnings.push(...compatibilidadValidacion.warnings);

    // Validate volume vs capacity
    if (acarreoData.cantidadCapturada && camion.idClasificacionViaje) {
      // Get capacity from classification (would need to be populated)
      const capacidad = await this.getCapacidadCamion(camion.idClasificacionViaje);
      const volumenValidacion = this.validarVolumen(acarreoData.cantidadCapturada, capacidad);
      allErrors.push(...volumenValidacion.errors);
      allWarnings.push(...volumenValidacion.warnings);
    }

    // Validate informative acarreo
    const informativoValidacion = this.validarAcarreoInformativo(acarreoData);
    allWarnings.push(...informativoValidacion.warnings);

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  /**
   * Get truck capacity from classification
   */
  private async getCapacidadCamion(clasificacionId: string): Promise<number> {
    try {
      const { getFirestore, doc, getDoc } = await import('firebase/firestore');
      const db = getFirestore();
      
      const clasificacionDoc = await getDoc(doc(db, 'clasificacionesViaje', clasificacionId));
      
      if (clasificacionDoc.exists()) {
        const clasificacion = clasificacionDoc.data();
        return clasificacion.capacidadMaxima || 10; // Default capacity
      }
      
      return 10; // Default capacity if classification not found
    } catch (error) {
      console.error('Error getting truck capacity:', error);
      return 10; // Default capacity on error
    }
  }

  /**
   * Calculate volume from percentage
   */
  calcularVolumenDesdePorcentaje(porcentaje: number, capacidadMaxima: number): number {
    return Math.round((porcentaje / 100) * capacidadMaxima * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Calculate percentage from volume
   */
  calcularPorcentajeDesdeVolumen(volumen: number, capacidadMaxima: number): number {
    return Math.round((volumen / capacidadMaxima) * 100);
  }
}

// Export singleton instance
export const acarreoValidator = new AcarreoValidator();