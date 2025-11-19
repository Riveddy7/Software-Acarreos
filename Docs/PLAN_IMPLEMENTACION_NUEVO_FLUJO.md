# Plan de Implementación - Nuevo Flujo de Operador

## Visión General

Este documento detalla el plan de implementación para el nuevo flujo de trabajo del módulo operador, enfocado en la captura de eventos de acarreo desde dispositivos móviles. El plan está estructurado en fases secuenciales para garantizar una implementación ordenada y probada.

## Fase 1: Diseño de Arquitectura y Actualización de Modelos

### 1.1 Actualización de Modelos de Datos

#### Modelo Extendido de Acarreo
```typescript
interface Acarreo {
  // Campos existentes
  id: string;
  idRequisicion: string;
  idMaterial: string;
  idCamion: string;
  idOperador: string;
  volumen: number;
  fechaHora: Date;
  tipo: 'carga' | 'tiro';
  estatus: 'pendiente' | 'en_proceso' | 'completado';
  createdAt: Date;
  updatedAt: Date;
  
  // Nuevos campos para el flujo
  idObra: string;
  idRuta: string;
  idTransportista: string;
  idTipoAcarreo: string;
  idLugarOrigen: string;
  idLugarDestino: string;
  idLineaRequisicion: string;
  idUsuarioCaptura: string;
  idDispositivo: string;
  latitud: number;
  longitud: number;
  porcentajeCarga: number;
  nombreCamionero: string;
  notas: string;
  fotoUrl?: string;
  kilometrosRuta: number;
  esInformativo: boolean; // Para tiro en movimiento interno
}
```

#### Nuevo Modelo de Estado de Operador
```typescript
interface OperatorState {
  selectedObra: Obra | null;
  currentUser: User | null;
  printerStatus: PrinterStatus;
  lastScannedTruck: Camion | null;
  currentLocation: Location | null;
  sessionActive: boolean;
}
```

#### Modelo de Dispositivo
```typescript
interface Dispositivo {
  id: string;
  nombre: string;
  tipo: 'movil' | 'tablet' | 'escritorio';
  idUsuarioActual: string;
  ultimaActividad: Date;
  ubicacion?: {
    latitud: number;
    longitud: number;
  };
}
```

### 1.2 Estructura de Carpetas y Componentes

#### Nueva Estructura para Módulo Operador
```
src/app/operator/
├── login/
│   └── page.tsx (adaptar existente)
├── obra-selection/
│   └── page.tsx (nueva)
├── capture-acarreo/
│   └── page.tsx (nueva - reemplaza dispatch/delivery/receptions)
├── settings/
│   └── page.tsx (nueva para configuración)
└── layout.tsx (actualizar)

src/components/operator/
├── ObraSelector.tsx (nuevo)
├── AcarreoCaptureForm.tsx (nuevo principal)
├── TruckScanner.tsx (extender existente)
├── TicketPrinter.tsx (nuevo)
├── PhotoCapture.tsx (nuevo)
├── LocationTracker.tsx (nuevo)
├── VolumeCalculator.tsx (nuevo)
├── RequisitionMatcher.tsx (nuevo)
└── OperatorNavigation.tsx (actualizar existente)

src/lib/operator/
├── scanner.ts (nuevo - QR/NFC/RFID)
├── printer.ts (nuevo - detección e impresión)
├── location.ts (nuevo - geolocalización)
├── photo.ts (nuevo - captura y optimización)
└── validation.ts (nuevo - reglas de negocio)
```

## Fase 2: Creación de Componentes Base

### 2.1 Componentes de UI Especializados

#### ObraSelector.tsx
- Listado de obras con permisos del usuario
- Búsqueda y filtrado rápido
- Selección con confirmación
- Persistencia de selección

#### AcarreoCaptureForm.tsx
- Formulario principal de captura
- Secciones: Datos básicos, Camión, Material, Volumen, Adicionales
- Validaciones en tiempo real
- Guardado automático de progreso

#### TruckScanner.tsx (Extendido)
- Soporte para QR, NFC, RFID
- Detección automática de tecnología disponible
- Vista previa de datos escaneados
- Historial de escaneos recientes

### 2.2 Componentes de Servicios

#### TicketPrinter.tsx
- Detección automática de impresoras
- Vista previa de ticket antes de imprimir
- Opciones de reimpresión
- Manejo de errores de impresión

#### PhotoCapture.tsx
- Captura desde cámara
- Optimización automática de tamaño
- Vista previa con opción de retake
- Almacenamiento temporal

#### LocationTracker.tsx
- Obtención automática de coordenadas
- Indicador visual de precisión
- Manejo de errores de GPS
- Actualización periódica

## Fase 3: Implementación del Flujo Principal

### 3.1 Pantalla de Selección de Obra

#### Funcionalidades
- Cargar obras permitidas para el usuario
- Mostrar información relevante de cada obra
- Selección con confirmación
- Almacenar selección en estado global

#### Validaciones
- Verificar permisos del usuario
- Validar que la obra esté activa
- Confirmar selección antes de continuar

### 3.2 Pantalla de Captura de Acarreo

#### Secciones del Formulario

**1. Datos Básicos**
- Fecha y hora (con valor actual por defecto)
- Selector de ruta (filtrado por obra)
- Tipo de evento (carga/tiro) con validaciones

**2. Información del Camión**
- Botón de escaneo (QR/NFC/RFID)
- Display de información escaneada
- Validación de compatibilidad

**3. Material y Volumen**
- Selector de material (filtrado por camión)
- Calculadora de volumen (porcentaje/manual)
- Validación de capacidad máxima

**4. Información Adicional**
- Nombre del camionero (con valor por defecto)
- Campo de notas opcional
- Captura de foto opcional

**5. Conciliación con Requisiciones**
- Display automático de requisición afectada
- Validaciones de saldo y compatibilidad
- Opción de modificar selección manualmente

### 3.3 Lógica de Validación

#### Validaciones de Negocio
```typescript
const validations = {
  // Validación de tipo de acarreo vs ruta
  validarTipoAcarreo: (ruta, tipoEvento) => {
    // Implementar lógica de habilitación/deshabilitación
  },
  
  // Validación de compatibilidad material-camión
  validarCompatibilidadMaterialCamion: (material, camion) => {
    // Implementar reglas de compatibilidad
  },
  
  // Validación de volumen vs capacidad
  validarVolumen: (volumen, capacidadCamion) => {
    // Implementar validación de capacidad
  },
  
  // Conciliación con requisiciones
  encontrarRequisicionAdecuada: (acarreoData) => {
    // Implementar lógica de matching
  }
};
```

## Fase 4: Integración de Periféricos

### 4.1 Sistema de Escaneo Extendido

#### Implementación Multitecnología
```typescript
interface ScannerConfig {
  qr: boolean;
  nfc: boolean;
  rfid: boolean;
  camera: boolean;
}

class UniversalScanner {
  async detectAvailableTechnologies(): Promise<ScannerConfig>
  async scanWithTechnology(type: string): Promise<ScanResult>
  async processScanResult(result: ScanResult): Promise<TruckInfo>
}
```

### 4.2 Sistema de Impresión

#### Detección y Gestión de Impresoras
```typescript
interface PrinterStatus {
  available: boolean;
  name?: string;
  connected: boolean;
  paperLevel?: number;
}

class PrinterManager {
  async detectPrinters(): Promise<Printer[]>
  async connectToPrinter(printerId: string): Promise<boolean>
  async printTicket(ticketData: TicketData): Promise<boolean>
  async getPrinterStatus(): Promise<PrinterStatus>
}
```

### 4.3 Sistema de Geolocalización

#### Captura y Validación de Ubicación
```typescript
interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

class LocationTracker {
  async getCurrentLocation(): Promise<LocationData>
  async startLocationTracking(): Promise<void>
  async validateLocationPermission(): Promise<boolean>
  async isLocationWithinBounds(location: LocationData, obra: Obra): Promise<boolean>
}
```

## Fase 5: Optimización Móvil

### 5.1 Adaptaciones UI para Móvil

#### Diseño Responsive
- Layout optimizado para pantallas pequeñas
- Touch-friendly components
- Minimal scrolling
- Quick action buttons

#### Performance
- Lazy loading de componentes
- Optimización de imágenes
- Caching inteligente
- Offline mode consideration

### 5.2 Experiencia de Usuario

#### Flujo Optimizado
- Minimizar entrada de datos manual
- Maximizar uso de escaneo
- Autocompletar donde sea posible
- Feedback visual inmediato

#### Accesibilidad
- Contraste adecuado para exteriores
- Botones grandes para fácil toque
- Navegación intuitiva
- Indicadores claros de estado

## Fase 6: Integración y Pruebas

### 6.1 Pruebas Unitarias

#### Componentes Críticos
- Formulario de captura
- Validaciones de negocio
- Integración con Firestore
- Manejo de errores

### 6.2 Pruebas de Integración

#### Flujo Completo
- Login → Selección de obra → Captura → Impresión
- Escenarios con y sin periféricos
- Casos límite y edge cases
- Performance con grandes volúmenes de datos

### 6.3 Pruebas de Usuario

#### Escenarios Reales
- Pruebas en campo
- Diferentes condiciones de iluminación
- Conectividad variable
- Diferentes dispositivos móviles

## Fase 7: Documentación y Despliegue

### 7.1 Documentación Técnica

#### Guías de Implementación
- Arquitectura detallada
- API documentation
- Guía de configuración
- Troubleshooting guide

### 7.2 Documentación de Usuario

#### Manuales de Operación
- Guía rápida de uso
- Video tutoriales
- FAQ
- Soporte técnico

## Cronograma Sugerido

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Fase 1: Arquitectura y Modelos | 3 días | - |
| Fase 2: Componentes Base | 5 días | Fase 1 |
| Fase 3: Flujo Principal | 7 días | Fase 2 |
| Fase 4: Periféricos | 4 días | Fase 3 |
| Fase 5: Optimización Móvil | 3 días | Fase 4 |
| Fase 6: Pruebas | 5 días | Fase 5 |
| Fase 7: Documentación | 2 días | Fase 6 |

**Total estimado: 29 días hábiles**

## Riesgos y Mitigación

### Riesgos Técnicos
- **Compatibilidad con periféricos**: Mitigación con pruebas tempranas
- **Performance en dispositivos bajos**: Mitigación con optimización progresiva
- **Conectividad variable**: Mitigación con modo offline

### Riesgos de Proyecto
- **Cambios en requisitos**: Mitigación con arquitectura flexible
- **Tiempo limitado**: Mitigación con priorización de features críticas
- **Adopción por usuarios**: Mitigación con capacitación y soporte

## Métricas de Éxito

### Métricas Técnicas
- Tiempo de captura < 2 minutos por acarreo
- 99.9% uptime del sistema
- < 500ms tiempo de respuesta promedio
- Soporte offline para 24 horas

### Métricas de Usuario
- > 90% tasa de adopción
- < 5% tasa de errores
- > 4.5/5 satisfacción del usuario
- Reducción del 50% en tiempo de captura vs sistema actual

## Conclusión

Este plan proporciona una roadmap detallada para la implementación del nuevo flujo de operador, asegurando una transición ordenada desde el sistema actual hacia una solución móvil optimizada. La estructura por fases permite validación progresiva y ajustes según el feedback del desarrollo y las pruebas.