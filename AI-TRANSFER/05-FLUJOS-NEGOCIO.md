# Flujos de Negocio y Casos de Uso

## Actores del Sistema

### 1. Administrador
- **Rol**: Gestión del sistema
- **Permisos**: Acceso completo a todas las funcionalidades
- **Objetivos**: Configurar sistema, gestionar maestros, supervisar operaciones

### 2. Operador de Campo
- **Rol**: Captura de eventos en tiempo real
- **Permisos**: Acceso limitado a funciones operativas
- **Objetivos**: Registrar acarreos, generar tickets, capturar evidencia

## Flujo Principal: Gestión de Acarreos

### Fase 1: Configuración del Sistema (Administrador)

#### 1.1 Configuración Inicial de Empresas
```
Actor: Administrador
Precondiciones: Usuario autenticado como admin
Pasos:
1. Ingresar a /admin/empresas-internas
2. Click en "Agregar Nueva Empresa"
3. Completar formulario:
   - nombreParaMostrar: "Constructora ABC"
   - razonSocial: "Constructora ABC S.A. de C.V."
   - logo: [Subir logo]
4. Guardar y confirmar
Postcondiciones: Empresa creada y disponible
```

#### 1.2 Registro de Clientes
```
Actor: Administrador
Precondiciones: Empresas internas configuradas
Pasos:
1. Navegar a /admin/clientes
2. Click en "Agregar Cliente"
3. Completar formulario:
   - nombreParaMostrar: "Desarrolladora XYZ"
4. Guardar
Postcondiciones: Cliente registrado
```

#### 1.3 Configuración de Obras
```
Actor: Administrador
Precondiciones: Clientes y empresas internas existentes
Pasos:
1. Ingresar a /admin/obras
2. Click en "Nueva Obra"
3. Completar formulario:
   - nombreParaMostrar: "Edificio Residencial Torre A"
   - idCliente: Seleccionar de lista
   - idEmpresaInterna: Seleccionar de lista
   - estatusActivo: true
   - descripcionNotas: "Obra de 20 niveles"
4. Guardar
Postcondiciones: Obra configurada y activa
```

#### 1.4 Configuración de Lugares
```
Actor: Administrador
Precondiciones: Obras existentes
Pasos:
1. Navegar a /admin/lugares
2. Seleccionar obra destino
3. Click en "Agregar Lugar"
4. Completar formulario:
   - nombreParaMostrar: "Bodega Principal"
   - idObra: Obra seleccionada
   - latitud: [coordenada]
   - longitud: [coordenada]
5. Guardar
Postcondiciones: Lugar georreferenciado
```

#### 1.5 Catálogo de Materiales
```
Actor: Administrador
Precondiciones: Clasificaciones y unidades existentes
Pasos:
1. Ingresar a /admin/materiales
2. Click en "Nuevo Material"
3. Completar formulario:
   - nombreParaMostrar: "Arena Gruesa"
   - idClasificacionMaterial: "Áridos"
   - idUnidad: "m³"
   - descripcionNotas: "Arena para concreto"
4. Guardar
Postcondiciones: Material disponible para uso
```

#### 1.6 Gestión de Camiones
```
Actor: Administrador
Precondiciones: Transportistas, tipos y clasificaciones existentes
Pasos:
1. Navegar a /admin/trucks
2. Click en "Agregar Camión"
3. Completar formulario:
   - nombreParaMostrar: "Volteo CAT-777"
   - idTransportista: Seleccionar
   - idTipoCamion: "Volteo"
   - idClasificacionViaje: "Corta Distancia"
   - placas: "ABC-1234"
   - marca: "Caterpillar"
   - modelo: "777"
   - estatusActivo: true
4. Generar QR code
5. Imprimir QR para camión
6. Guardar
Postcondiciones: Camión registrado con QR único
```

### Fase 2: Gestión de Requisiciones (Administrador)

#### 2.1 Creación de Requisición
```
Actor: Administrador
Precondiciones: Obras, materiales, proveedores y transportistas configurados
Pasos:
1. Ingresar a /admin/requisiciones-material-vista
2. Click en "Nueva Requisición"
3. Completar formulario principal:
   - idObra: Seleccionar obra
   - idProveedor: Seleccionar proveedor
   - idTransportista: Seleccionar transportista
   - descripcionCorta: "Materiales cimentación"
4. Agregar materiales:
   - Material: "Arena Gruesa"
   - Cantidad: 50 m³
   - Notas: "Para zapatas"
   - Click en "Agregar Material"
   - Repetir para otros materiales
5. Revisar resumen
6. Click en "Guardar Requisición"
Postcondiciones: Requisición creada con estado "Pendiente"
```

#### 2.2 Autorización de Requisición
```
Actor: Administrador
Precondiciones: Requisición en estado "Pendiente"
Pasos:
1. Buscar requisición pendiente
2. Revisar materiales y cantidades
3. Click en "Autorizar"
4. Confirmar autorización
Postcondiciones: Requisición autorizada, lista para ejecución
```

### Fase 3: Operación de Campo (Operador)

#### 3.1 Inicio de Sesión y Configuración
```
Actor: Operador
Precondiciones: Usuario operativo creado y activo
Pasos:
1. Abrir aplicación en dispositivo móvil
2. Ingresar credenciales
3. Seleccionar empresa (si aplica)
4. Seleccionar obra actual:
   - Navegar a selección de obra
   - Seleccionar "Edificio Residencial Torre A"
5. Confirmar selección
Postcondiciones: Operador listo para capturar acarreos
```

#### 3.2 Captura de Acarreo - Carga
```
Actor: Operador
Precondiciones: Sesión iniciada, obra seleccionada
Pasos:
1. Click en "Capturar Acarreo"
2. Escanear camión:
   - Click en "Escanear Camión"
   - Apuntar cámara al QR del camión
   - Confirmar lectura: "Volteo CAT-777"
3. Seleccionar tipo de acarreo:
   - Opción: "Carga"
4. Seleccionar ruta:
   - Origen: "Bodega Principal"
   - Destino: "Zona de Obra"
5. Seleccionar material:
   - Material: "Arena Gruesa"
6. Capturar cantidad:
   - Ingresar volumen: 8.5 m³
   - % de carga: 85%
7. Tomar fotografía:
   - Click en "Capturar Foto"
   - Tomar foto del material cargado
   - Confirmar foto
8. Agregar notas (opcional):
   - Nota: "Material de buena calidad"
9. Generar ticket:
   - Click en "Generar Ticket"
   - Confirmar datos
   - Imprimir o enviar ticket
10. Confirmar registro
Postcondiciones: Acarreo registrado, ticket generado
```

#### 3.3 Captura de Acarreo - Tiro
```
Actor: Operador
Precondiciones: Camión ya cargado previamente
Pasos:
1. Click en "Capturar Acarreo"
2. Escanear mismo camión: "Volteo CAT-777"
3. Seleccionar tipo de acarreo:
   - Opción: "Tiro"
4. Seleccionar ruta:
   - Origen: "Bodega Principal"
   - Destino: "Zona de Obra"
5. Validar cantidad:
   - Sistema muestra: 8.5 m³ (carga previa)
   - Confirmar cantidad de tiro: 8.3 m³
6. Tomar fotografía:
   - Foto del material descargado
7. Generar ticket de tiro
8. Confirmar registro
Postcondiciones: Ciclo completo de acarreo registrado
```

### Fase 4: Seguimiento y Control (Administrador)

#### 4.1 Monitoreo en Tiempo Real
```
Actor: Administrador
Precondiciones: Acarreos siendo capturados
Pasos:
1. Ingresar a /admin/acarreos
2. Filtrar por obra: "Edificio Residencial Torre A"
3. Ver acarreos del día:
   - Lista con hora, camión, material, cantidad
   - Estados: Registrado, Conciliado
4. Click en acarreo para ver detalles:
   - Fotografía
   - Ubicación GPS
   - Ticket generado
5. Revisar métricas:
   - Total acarreos del día
   - Volumen total movido
   - Camiones activos
Postcondiciones: Visión completa de operaciones
```

#### 4.2 Conciliación contra Requisiciones
```
Actor: Administrador
Precondiciones: Acarreos registrados, requisiciones activas
Pasos:
1. Seleccionar requisición: "Materiales cimentación"
2. Ver estado de ejecución:
   - Material: "Arena Gruesa"
   - Solicitado: 50 m³
   - Entregado: 42.5 m³ (5 acarreos)
   - Pendiente: 7.5 m³
3. Analizar desviaciones:
   - Revisar tickets individuales
   - Validar cantidades
   - Verificar fotografías
4. Marcar como conciliado (parcial o total)
5. Generar reporte de conciliación
Postcondiciones: Requisición conciliada, inventario actualizado
```

## Casos de Uso Específicos

### UC-001: Gestión de Flota
```
Descripción: Administración completa de camiones y transportistas
Actor Principal: Administrador
Precondiciones: Sistema configurado
Flujo Principal:
1. Registro de transportistas
2. Configuración de tipos de camión
3. Registro de camiones con QR
4. Asignación de conductores
5. Monitoreo de disponibilidad
Flujos Alternativos:
- Camión en mantenimiento → Cambiar estatus
- Cambio de transportista → Actualizar datos
Excepciones:
- QR duplicado → Generar nuevo código
- Datos inválidos → Validar y corregir
```

### UC-002: Escaneo QR Múltiple
```
Descripción: Identificación de camiones mediante códigos QR
Actor Principal: Operador
Precondiciones: Camión con QR generado, dispositivo con cámara
Flujo Principal:
1. Abrir módulo de escaneo
2. Apuntar cámara al QR
3. Procesar código leído
4. Validar camión en sistema
5. Mostrar información del camión
Flujos Alternativos:
- QR dañado → Ingresar placas manualmente
- Cámara no disponible → Usar flashlight
- Mala iluminación → Sugerir mejor iluminación
Excepciones:
- Camión no encontrado → Alerta de error
- Camión inactivo → Bloquear operación
```

### UC-003: Generación de Tickets
```
Descripción: Creación de comprobantes de acarreo
Actor Principal: Operador
Precondiciones: Acarreo capturado y validado
Flujo Principal:
1. Validar datos completos
2. Generar PDF con:
   - Folio único
   - Datos del acarreo
   - Código QR de verificación
3. Opciones de salida:
   - Impresión directa
   - Envío por email
   - Guardado local
Flujos Alternativos:
- Sin impresora → Guardar digital
- Error de generación → Reintentar
Excepciones:
- Datos incompletos → Completar campos faltantes
- Sin conexión → Guardar local y sincronizar
```

### UC-004: Reportes y Análisis
```
Descripción: Generación de reportes operativos
Actor Principal: Administrador
Precondiciones: Datos de acarreos registrados
Flujo Principal:
1. Seleccionar tipo de reporte:
   - Por obra
   - Por material
   - Por transportista
   - Por período
2. Configurar filtros:
   - Fechas
   - Obras
   - Materiales
3. Generar reporte con:
   - Tablas resumen
   - Gráficos
   - Tendencias
4. Exportar opciones:
   - PDF
   - Excel
   - CSV
Flujos Alternativos:
- Sin datos → Mostrar mensaje informativo
- Datos inconsistentes → Alerta de validación
Excepciones:
- Error de generación → Reintentar con diferentes parámetros
- Timeout → Programar generación asíncrona
```

## Reglas de Negocio

### RN-001: Identificación Única de Camiones
- Todo camión debe tener un QR único
- Los QR no pueden reutilizarse
- En caso de pérdida, se debe generar nuevo QR y desactivar anterior

### RN-002: Validación de Rutas
- Todo acarreo debe tener una ruta válida configurada
- Los lugares de origen y destino deben existir
- La distancia debe estar dentro de límites aceptables

### RN-003: Conciliación de Cantidades
- Las cantidades de tiro no pueden superar las de carga
- Se permite una tolerancia del 5% por mermas
- Diferencias mayores requieren autorización

### RN-004: Estados de Acarreos
- Todo acarreo debe tener un evento de carga y uno de tiro
- No puede haber dos acarreos activos para mismo camión
- Los acarreos se concilian contra requisiciones

### RN-005: Permisos y Roles
- Solo administradores pueden configurar maestros
- Solo operadores pueden capturar acarreos
- Los datos son visibles según rol del usuario

## Validaciones de Sistema

### VL-001: Validación de Datos de Entrada
- Todos los campos obligatorios deben completarse
- Las cantidades deben ser numéricas y positivas
- Las fechas deben ser válidas y lógicas

### VL-002: Validación de Reglas de Negocio
- No se pueden eliminar entidades con dependencias
- Los estados deben seguir secuencias válidas
- Las referencias deben apuntar a entidades existentes

### VL-003: Validación de Integridad
- Los datos desnormalizados deben coincidir con originales
- Los timestamps deben ser consistentes
- Las relaciones FK deben mantener integridad

## Métricas KPI

### Operativas
- **Tiempo promedio de captura**: < 2 minutos por acarreo
- **Precisión de escaneo QR**: > 95%
- **Disponibilidad del sistema**: > 99.5%
- **Tasa de error de datos**: < 1%

### de Negocio
- **Reducción de papel**: 80% menos documentos físicos
- **Velocidad de conciliación**: 60% más rápido
- **Visibilidad de inventario**: 100% en tiempo real
- **Productividad operativa**: +40%

## Integraciones Externas

### IE-001: Firebase
- **Firestore**: Base de datos principal
- **Authentication**: Gestión de usuarios
- **Storage**: Archivos e imágenes
- **Analytics**: Métricas de uso

### IE-002: Impresión Móvil
- **Impresoras Bluetooth**: Conexión directa
- **Impresoras WiFi**: Impresión en red
- **PDF Generation**: jsPDF para tickets

### IE-003: GPS y Geolocalización
- **HTML5 Geolocation API**: Posición actual
- **Geocoding**: Conversión coordenadas → direcciones
- **Geo-fencing**: Validación de ubicaciones

## Escenarios de Error y Recuperación

### ER-001: Pérdida de Conectividad
```
Escenario: Operador sin conexión durante captura
Recuperación:
1. Detectar pérdida de conexión
2. Guardar datos localmente (localStorage)
3. Mostrar indicador "Modo Offline"
4. Reintentar sincronización periódicamente
5. Al restaurar conexión, sincronizar datos pendientes
```

### ER-002: Error en Escaneo QR
```
Escenario: QR no puede leerse o está dañado
Recuperación:
1. Intentar escaneo múltiple (3 intentos)
2. Sugerir limpieza de lente
3. Ofrecer entrada manual de placas
4. Validar camión por placas
5. Generar alerta para reemplazo QR
```

### ER-003: Conflicto de Conciliación
```
Escenario: Cantidades no concilian entre carga y tiro
Recuperación:
1. Detectar diferencia > 5%
2. Solicitar autorización administrativa
3. Registrar motivo de diferencia
4. Permitir continuar con observación
5. Generar reporte de incidencia
```

## Optimización de Procesos

### OP-001: caching inteligente
- Caché de datos maestros en dispositivo
- Actualización incremental de datos
- Sincronización selectiva por relevancia

### OP-002: predicción de datos
- Autocompletar basado en historial
- Sugerir rutas frecuentes
- Preseleccionar materiales comunes

### OP-003: validación en tiempo real
- Feedback inmediato de errores
- Validación progresiva de formulario
- Indicadores visuales de estado

## Consideraciones de UX/UI

### UX-001: Mobile-First Design
- Interfaz optimizada para táctil
- Botones grandes y accesibles
- Flujo lineal y simple

### UX-002: Feedback Visual
- Indicadores de progreso claros
- Confirmaciones de acciones
- Estados de carga explícitos

### UX-003: Accesibilidad
- Contraste de colores adecuado
- Tamaños de fuente legibles
- Navegación por voz (futuro)

## Flujo de Datos Típicos

### FD-001: Registro de Acarreo Completo
```
1. Operador escanea camión
   → QR Scanner → Truck ID
2. Sistema valida camión
   → Firestore Query → Truck Data
3. Operador selecciona ruta
   → Route Selection → Route ID
4. Sistema calcula distancia
   → Distance Calculation → KM
5. Operador captura cantidad
   → Form Input → Volume
6. Sistema valida contra capacidad
   → Capacity Validation → OK/Error
7. Operador toma foto
   → Camera API → Image URL
8. Sistema genera ticket
   → PDF Generation → Ticket URL
9. Sistema guarda acarreo
   → Firestore Save → Acarreo Record
10. Sistema actualiza inventario
   → Inventory Update → New Balance
```

### FD-002: Conciliación de Requisición
```
1. Administrador selecciona requisición
   → Requisition Query → Requisition Data
2. Sistema busca acarreos relacionados
   → Acarreos Query → Acarreos List
3. Sistema suma cantidades por material
   → Aggregation → Material Totals
4. Sistema compara vs solicitado
   → Comparison → Differences
5. Sistema calcula pendientes
   → Calculation → Pending Amounts
6. Administrador aprueba conciliación
   → User Action → Approval
7. Sistema actualiza estados
   → Status Update → Reconciliation Complete
8. Sistema genera reporte
   → Report Generation → PDF Report