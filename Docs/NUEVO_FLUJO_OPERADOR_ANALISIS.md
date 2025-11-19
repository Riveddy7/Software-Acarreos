# Análisis del Nuevo Flujo de Operador - Captura de Eventos de Acarreo

## Resumen Ejecutivo

El presente documento analiza el nuevo flujo de trabajo propuesto para el módulo de operador, enfocado en la captura de eventos de acarreo desde dispositivos móviles. Este flujo reemplaza el sistema actual de despacho/entrega/recepciones por un modelo más simplificado y optimizado para captura en tiempo real de eventos de carga y tiro.

## Flujo de Trabajo Propuesto

### 1. Pantalla de Bienvenida e Inicio de Sesión
**Estado Actual**: La aplicación ya tiene un sistema de autenticación funcional.
**Cambios Requeridos**:
- Implementar persistencia de sesión hasta cierre explícito o salida de memoria
- Adaptar UI específicamente para dispositivos móviles
- Simplificar el flujo de login para operadores

### 2. Selección de Obra
**Estado Actual**: No existe esta pantalla en el flujo actual.
**Cambios Requeridos**:
- Crear nueva pantalla de selección de obra
- Filtrar obras según permisos del usuario
- Mantener obra seleccionada en estado global
- Habilitar botón "Capturar Acarreo" solo después de seleccionar obra

### 3. Captura de Acarreo (Pantalla Principal)
**Estado Actual**: El flujo actual separa despacho, entrega y recepciones en pantallas diferentes.
**Cambios Requeridos**:
- Unificar en una sola pantalla de captura de eventos
- Implementar formulario optimizado para móvil
- Integrar todas las validaciones y reglas de negocio

## Componentes del Nuevo Flujo

### A. Captura de Fecha y Hora
- Mostrar fecha/hora actual por defecto
- Permitir modificación manual
- Capturar automáticamente fecha/hora de registro (no modificable)

### B. Selección de Ruta
- Filtrar rutas según obra seleccionada
- Validar tipo de acarreo según configuración de ruta
- Mostrar información relevante de la ruta (kilometraje, lugares)

### C. Tipo de Evento (Carga/Tiro)
**Lógica de Habilitación**:
- Si tipo de acarreo = "Material traído a obra" → Solo Carga habilitada
- Si tipo de acarreo = "Material sacado de obra" → Solo Tiro habilitado
- Si tipo de acarreo = "Movimiento Interno" → Ambas opciones habilitadas

**Regla Especial**:
- Para movimiento interno de tipo tiro: no afectar requisiciones (informativo)

### D. Escaneo de Camión
**Tecnologías a Soportar**:
- QR (actual)
- NFC
- RFID

**Datos Obtenidos al Escanear**:
- Nombre para mostrar del camión
- Transportista asociado
- Placas
- Capacidad máxima según clasificación
- Último camionero registrado

### E. Selección de Material
**Validaciones**:
- Solo materiales compatibles con tipo de camión
- Un volteo no puede acarrear agua
- Validar compatibilidad material-camión

### F. Captura de Volumen
**Opciones**:
- Porcentaje de carga (default: 50%)
- Volumen manual (no puede exceder capacidad máxima)

### G. Conciliación con Requisiciones
**Lógica Automática**:
1. Buscar requisiciones autorizadas o parcialmente surtidas
2. Validar saldo disponible del material
3. Verificar misma obra y transportista
4. Seleccionar requisición más antigua si hay múltiples opciones
5. No asignar requisición para tiro en movimientos internos

### H. Datos Adicionales
- Nombre del camionero (con valor por defecto)
- Notas opcionales
- Foto opcional con optimización automática

### I. Impresión de Ticket
**Detección de Impresora**:
- Detección automática al inicio
- Botón para redetectar si no está disponible
- Cambiar "Guardar e Imprimir" a "Guardar" si no hay impresora

**Contenido del Ticket**:
- Encabezado con logo de empresa
- Información completa del acarreo
- Indicador visual para tickets informativos (tiro en movimiento interno)
- QR con ID del acarreo

## Datos Capturados Automáticamente

### Datos del Sistema
- Fecha y hora de captura (inmutable)
- ID del usuario que captura
- Nombre del usuario
- ID del dispositivo
- Latitud y longitud
- ID de la obra seleccionada

### Datos Relacionados
- ID tipo de acarreo
- ID ruta
- ID lugar origen/destino
- Kilómetros totales de ruta
- ID requisición afectada (si aplica)
- ID línea de requisición afectada (si aplica)

## Análisis de Impacto en el Sistema Actual

### Componentes a Reutilizar
1. **Sistema de Autenticación**: Adaptar para persistencia
2. **Componente de Escaneo QR**: Extender para NFC/RFID
3. **Modelos de Datos**: Actualizar con nuevos campos
4. **UI Components**: Reutilizar con adaptaciones móviles

### Componentes a Reemplazar
1. **Pantallas de Despacho/Entrega/Recepciones**: Unificar en captura de eventos
2. **Navegación Actual**: Simplificar para nuevo flujo
3. **Lógica de Estados**: Adaptar para modelo unificado

### Nuevos Componentes Requeridos
1. **Selector de Obra**: Nuevo componente principal
2. **Formulario de Captura de Acarreo**: Optimizado para móvil
3. **Módulo de Impresión**: Detección y gestión de impresoras
4. **Gestión de Fotos**: Captura y optimización
5. **Geolocalización**: Captura automática de coordenadas

## Arquitectura Propuesta

### Estructura de Carpetas Sugerida
```
src/app/operator/
├── login/
│   └── page.tsx (adaptada)
├── obra-selection/
│   └── page.tsx (nueva)
├── capture-acarreo/
│   └── page.tsx (nueva principal)
└── layout.tsx (actualizado)

src/components/operator/
├── ObraSelector.tsx (nuevo)
├── AcarreoCaptureForm.tsx (nuevo)
├── TruckScanner.tsx (extendido)
├── TicketPrinter.tsx (nuevo)
├── PhotoCapture.tsx (nuevo)
└── LocationTracker.tsx (nuevo)
```

### Estado Global Requerido
```typescript
interface OperatorState {
  selectedObra: Obra | null;
  currentUser: User | null;
  printerStatus: PrinterStatus;
  lastScannedTruck: Camion | null;
  location: Location | null;
}
```

## Consideraciones Técnicas

### Optimización Móvil
- Diseño responsive优先
- Touch-friendly components
- Minimal data entry (maximize scanning)
- Offline capability consideration

### Integración con Backend
- Real-time updates to Firestore
- Efficient data synchronization
- Conflict resolution strategy

### Seguridad
- Validación de permisos por obra
- Trazabilidad completa de operaciones
- Validación de geolocalización (opcional)

## Próximos Pasos Recomendados

1. **Fase 1**: Diseño de arquitectura y actualización de modelos
2. **Fase 2**: Creación de componentes base
3. **Fase 3**: Implementación del flujo principal
4. **Fase 4**: Integración de periféricos (impresora, escáner)
5. **Fase 5**: Optimización móvil y pruebas
6. **Fase 6**: Documentación y despliegue

## Conclusiones

El nuevo flujo propuesto simplifica significativamente la operación actual, unificando tres procesos separados en una única interfaz de captura optimizada para móvil. La implementación requerirá una reestructuración importante del módulo operador, pero resultará en una experiencia más eficiente y intuitiva para los usuarios en campo.

La clave del éxito será la correcta implementación de las validaciones de negocio y la integración fluida con los sistemas de escaneo e impresión existentes.