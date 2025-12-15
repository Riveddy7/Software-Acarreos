# Software de Acarreos - Visión General del Proyecto

## Contexto de Negocio
El Software de Acarreos es una aplicación web diseñada para gestionar el transporte de materiales en obras de construcción. Permite el seguimiento completo de acarreos desde la requisición hasta la entrega final.

## Objetivo Principal
Automatizar y digitalizar el proceso de gestión de acarreos de materiales en proyectos de construcción, proporcionando:
- Trazabilidad completa de materiales
- Control de inventario en tiempo real
- Generación de tickets y comprobantes
- Gestión de flota de camiones
- Control de operadores y conductores

## Usuarios del Sistema
### 1. Administradores
- Gestión de maestros (materiales, camiones, obras, etc.)
- Configuración del sistema
- Reportes y análisis
- Gestión de usuarios

### 2. Operadores de Campo
- Captura de acarreos en tiempo real
- Escaneo de códigos QR de camiones
- Generación de tickets
- Registro fotográfico
- Geolocalización

## Módulos Principales

### Módulo de Administración
- **Obras**: Gestión de proyectos de construcción
- **Empresas Internas**: Administración de empresas contratistas
- **Clientes**: Gestión de clientes dueños de obras
- **Materiales**: Catálogo de materiales con clasificaciones
- **Camiones**: Gestión de flota con tipos y clasificaciones
- **Operadores**: Administración de operadores de campo
- **Transportistas**: Gestión de empresas de transporte
- **Rutas**: Definición de rutas de acarreo
- **Requisiciones**: Gestión de solicitudes de materiales

### Módulo de Operación
- **Captura de Acarreos**: Registro en tiempo real de eventos
- **Escaneo QR**: Identificación de camiones
- **Generación de Tickets**: Comprobantes de acarreo
- **Selección de Obras**: Contexto de trabajo actual
- **Recepciones**: Recepción de materiales

## Flujo de Negocio Típico

### 1. Configuración Inicial (Admin)
1. Dar de alta empresas internas y clientes
2. Registrar obras y sus lugares
3. Configurar materiales y clasificaciones
4. Registrar camiones y transportistas
5. Definir rutas de acarreo

### 2. Requisición de Materiales (Admin)
1. Crear requisición para una obra
2. Especificar materiales y cantidades
3. Asignar transportista
4. Autorizar requisición

### 3. Ejecución de Acarreos (Operador)
1. Seleccionar obra actual
2. Escanear camión (QR)
3. Seleccionar ruta y material
4. Capturar cantidad y fotografía
5. Generar ticket

### 4. Seguimiento y Control (Admin)
1. Monitorear acarreos en tiempo real
2. Conciliar contra requisiciones
3. Generar reportes
4. Control de inventario

## Características Técnicas Destacadas

### Mobile-First
- Diseño optimizado para dispositivos móviles
- Interfaz táctil amigable
- PWA (Progressive Web App)

### Escaneo Múltiple
- Códigos QR (principal)
- NFC (futuro)
- RFID (futuro)

### Geolocalización
- Registro automático de ubicación
- Validación de rutas
- Control de presencia

### Integración Fotográfica
- Captura de fotos como evidencia
- Optimización automática
- Almacenamiento en cloud

### Tickets Digitales
- Generación en PDF
- Impresión móvil
- QR de verificación

## Estado Actual del Proyecto

### Funcionalidades Implementadas ✅
- Todos los módulos de administración
- Sistema completo de operador móvil
- Escaneo QR con cámara en tiempo real
- Generación de tickets
- Geolocalización
- Captura fotográfica
- PWA funcional

### Integraciones
- Firebase (Firestore, Auth, Storage)
- Vercel (despliegue)
- jsQR (escaneo QR)
- jsPDF (generación PDF)
- html2canvas (captura de pantalla)

### Datos en Producción
- Esquema de datos completo y funcional
- Migración de modelo antiguo a nuevo para camiones
- Datos reales en producción

## Arquitectura de Negocio

### Entidades Principales
1. **Empresas**: Clientes e internas
2. **Obras**: Proyectos de construcción
3. **Lugares**: Ubicaciones específicas dentro de obras
4. **Materiales**: Catálogo con clasificaciones
5. **Camiones**: Flota con transportistas asignados
6. **Operadores**: Personal de campo
7. **Rutas**: Trayectos entre lugares
8. **Acarreos**: Eventos de transporte registrados

### Relaciones Clave
- Obras pertenecen a Clientes
- Lugares pertenecen a Obras
- Camiones pertenecen a Transportistas
- Rutas conectan Lugares
- Acarreos usan Camiones, Materiales, Rutas

## Indicadores de Éxito
- Reducción del 80% en papel físico
- Trazabilidad 100% de materiales
- Reducción del 60% en tiempos de captura
- Disponibilidad 99.9% del sistema
- Adopción del 95% por operadores

## Consideraciones Importantes
1. El sistema maneja volúmenes altos de datos
2. La conectividad en campo puede ser limitada
3. Los operadores requieren formación mínima
4. La integridad de datos es crítica
5. El tiempo de respuesta debe ser < 2 segundos