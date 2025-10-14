# Funcionalidades del Software de Acarreos

Este documento describe las funcionalidades clave del sistema de gestión de acarreos, diseñado para controlar el flujo de materiales desde la compra hasta la entrega final.

El sistema se divide principalmente en dos roles de usuario: **Administrador** y **Operador**.

---

## 1. Funcionalidades Generales

- **Autenticación de Usuarios**: Sistema de inicio de sesión seguro para controlar el acceso.
- **Gestión de Perfiles**: Los usuarios tienen perfiles con roles asignados (`admin`, `operator`).
- **Selección de Ubicación**: Los operadores deben seleccionar una ubicación de trabajo (patio, origen, destino) al iniciar su sesión para filtrar las operaciones relevantes.
- **Tema Oscuro/Claro**: Interfaz adaptable a preferencias de visualización.

---

## 2. Panel de Administración (`/admin`)

El administrador tiene acceso total al sistema para gestionar la configuración, supervisar operaciones y ver reportes.

### 2.1. Dashboard Principal

- **KPIs (Indicadores Clave de Rendimiento)**:
  - Órdenes de compra por recepcionar, parciales y completadas.
  - Total de recepciones de material (histórico y últimas 24h).
  - Acarreos (viajes) en tránsito y completados.
- **Resumen de Actividad Reciente**:
  - Muestra la información de la última recepción de material.
  - Lista las órdenes de compra más recientes con su estado.
- **Acciones Rápidas**:
  - Crear nueva orden de compra.
  - Acceso directo a las vistas de Recepcionar, Despachar y Ver Acarreos.

### 2.2. Gestión de Datos Maestros (CRUD)

El administrador puede crear, leer, actualizar y eliminar los siguientes registros:

- **Conductores**: Gestión de la información de los choferes.
- **Camiones**: Gestión de la flota de vehículos, incluyendo su capacidad volumétrica.
- **Materiales**: Catálogo de materiales que se transportan.
- **Proveedores**: Gestión de la información de los proveedores de materiales.
- **Ubicaciones**: Gestión de los puntos de origen y destino.
- **Usuarios**: Administración de los usuarios del sistema y sus roles.

### 2.3. Gestión de Operaciones

- **Órdenes de Compra**:
  - Crear, ver y gestionar órdenes de compra para los proveedores.
  - Asignar múltiples materiales y ubicaciones de entrega.
  - Seguimiento del estado (`PENDIENTE`, `PARCIAL`, `COMPLETADO`).
- **Viajes (Acarreos/Shipments)**:
  - Supervisar todos los viajes en curso y completados.
  - Ver el detalle de cada viaje: conductor, camión, material, origen, destino y timestamps.
- **Tickets**:
  - Visualizar todos los tickets generados por el sistema (despacho, entrega, recepción).
  - Imprimir tickets para respaldo físico.
- **Lector de Tickets**:
  - Herramienta para escanear códigos QR y validar la información de un ticket o entidad rápidamente.

---

## 3. Panel de Operador (`/operator`)

El operador es el usuario en campo que registra las operaciones diarias de movimiento de material.

### 3.1. Selección de Ubicación de Trabajo

- Antes de operar, el usuario debe seleccionar en qué patio o ubicación se encuentra para que el sistema filtre las acciones y datos relevantes.

### 3.2. Operaciones Principales

- **Recepciones**:
  - Registrar la recepción de material proveniente de una orden de compra.
  - Se asocia el camión que entrega y se detallan los materiales y cantidades recibidas.
  - El sistema valida las cantidades contra la orden de compra.
- **Iniciar Despacho**:
  - Registrar la salida de un camión desde un punto de origen.
  - Se asigna conductor, camión y los materiales que transporta.
  - Genera un ticket de despacho con un folio único.
- **Registrar Descarga (Entrega)**:
  - Registrar la llegada de un camión a su destino.
  - Confirma la entrega del material, completando el ciclo del viaje.
  - Actualiza el estado del viaje a `COMPLETADO`.
