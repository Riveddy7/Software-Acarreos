# Estado Actual del Proyecto "Software Acarreos"

## Objetivo del Proyecto (MVP)
Crear una aplicación web para la gestión y control de acarreos de material de construcción. La aplicación debe funcionar en un navegador web con dos interfaces principales: un Panel de Administrador (escritorio) y una Interfaz de Operador (móvil). Se ignoran autenticación, generación de PDFs y reportes.

## Stack Tecnológico
*   **Framework:** Next.js 13+ (actualmente 15.5.4 con App Router)
*   **Base de Datos:** Google Firestore
*   **Estilos:** Tailwind CSS
*   **Librerías:**
    *   `firebase` (para Firestore)
    *   `qr-code-styling` (para generación de QR en Admin Panel)

## Estado Actual

### 1. Configuración Inicial
*   Proyecto Next.js inicializado en el subdirectorio `acarreos-app`.
*   Dependencias principales instaladas (`firebase`, `qr-code-styling`).
*   Archivo de configuración de Firebase (`src/lib/firebase.ts`) creado (requiere credenciales del usuario).
*   Modelos de datos (interfaces TypeScript en `src/models/types.ts`) definidos.
*   Servicio de Firestore (`src/lib/firebase/firestore.ts`) con funciones CRUD genéricas implementado.

### 2. Panel de Administrador (Vista de Escritorio)
*   **Diseño:** Actualizado para mejorar el contraste y seguir principios de diseño inspirados en Carbon de IBM.
*   **Layout:** Implementado con navegación lateral (`src/app/admin/layout.tsx`).
*   **Página de Inicio:** (`src/app/admin/page.tsx`) implementada.
*   **CRUD de Datos Maestros:**
    *   **Camiones (`/admin/trucks`):** CRUD completo y conectado a Firestore. Utiliza `Modal`, `TruckForm` y `QrCodeDisplay`.
        *   **Vista Individual:** `src/app/admin/trucks/[truckId]/page.tsx` creada para mostrar detalles y QR grande. Enlace desde la tabla CRUD.
    *   **Choferes (`/admin/drivers`):** CRUD completo y conectado a Firestore. Utiliza `Modal`, `DriverForm` y `QrCodeDisplay`.
        *   **Vista Individual:** `src/app/admin/drivers/[driverId]/page.tsx` creada para mostrar detalles y QR grande. Enlace desde la tabla CRUD.
    *   **Materiales (`/admin/materials`):** CRUD completo y conectado a Firestore. Utiliza `Modal`, `MaterialForm` y `QrCodeDisplay`.
        *   **Vista Individual:** `src/app/admin/materials/[materialId]/page.tsx` creada para mostrar detalles y QR grande. Enlace desde la tabla CRUD.
    *   **Ubicaciones (`/admin/locations`):** CRUD completo y conectado a Firestore. Utiliza `Modal` y `LocationForm`. (No requiere QR).
*   **Vista de Acarreos (`/admin/shipments`):** Implementada como tabla de solo lectura, mostrando datos denormalizados de Firestore.
    *   **Visualización de Tickets:** Enlaces a tickets de despacho y entrega (`/admin/shipments/[shipmentId]/ticket/[type]/page.tsx`) añadidos a la tabla.
*   **Módulo Lector de Tickets:**
    *   Componente `src/components/admin/AdminQrReader.tsx` creado (campo de texto para ID).
    *   Página `src/app/admin/ticket-reader/page.tsx` creada para leer IDs de acarreo y mostrar detalles.
    *   Enlace en la navegación lateral del administrador.

### 3. Interfaz de Operador (Vista Móvil)
*   **Diseño:** Actualizado para mejorar el contraste y seguir principios de diseño inspirados en Carbon de IBM, con enfoque mobile-first.
*   **Layout:** Implementado (`src/app/operator/layout.tsx`).
*   **Página de Inicio:** Implementada con botones "Iniciar Despacho" y "Registrar Descarga" (`src/app/operator/page.tsx`).
*   **Escaneo de QR (Texto):**
    *   **Decisión clave:** El usuario ha indicado que su dispositivo de escaneo de QR funciona como un teclado (introduce el ID como texto). Por lo tanto, se ha eliminado la necesidad de un componente de escaneo de cámara.
    *   El archivo `src/components/operator/QrScanner.tsx` ha sido **eliminado**.
    *   La librería `@yudiel/react-qr-scanner` ha sido **desinstalada**.
    *   Las páginas `dispatch/page.tsx` y `delivery/page.tsx` han sido modificadas para usar campos de texto para la entrada de IDs.
*   **Flujo "Iniciar Despacho" (`src/app/operator/dispatch/page.tsx`):**
    *   Funcionalidad completa con entrada de texto para IDs.
    *   Redirecciona a la página de ticket de despacho (`/operator/ticket/[shipmentId]?type=dispatch`) tras el registro exitoso.
*   **Flujo "Registrar Descarga" (`src/app/operator/delivery/page.tsx`):**
    *   Funcionalidad completa con entrada de texto para IDs.
    *   Redirecciona a la página de ticket de entrega (`/operator/ticket/[shipmentId]?type=delivery`) tras el registro exitoso.
*   **Página de Ticket (`src/app/operator/ticket/[shipmentId]/page.tsx`):**
    *   Creada para mostrar detalles de un acarreo específico.
    *   Muestra información relevante solo para "Despacho" o "Entrega" según el parámetro `type` en la URL.
    *   Genera un código QR grande con el ID del acarreo.

## Contexto y Problemas Conocidos

*   **Permisos de Firebase:** El usuario tuvo un error de permisos. Se le instruyó para establecer reglas de seguridad permisivas (`allow read, write: if true;`) en Firestore para desarrollo. Esto es crucial para que la aplicación funcione.
*   **Problemas con Librerías de Escaneo QR:** Hubo problemas persistentes con `qrcode.react`, `html5-qrcode` y `@yudiel/react-qr-scanner` debido a errores de compatibilidad y resolución de módulos en Next.js 15.5.4. La decisión de usar entrada de texto directa es una solución a estos problemas.
*   **Versión de Next.js:** 15.5.4 (con Webpack). Esta versión es relativamente nueva y ha presentado algunos desafíos con la resolución de módulos de librerías externas.

---
**Instrucciones para la siguiente IA:**
El proyecto está **completo** según las funcionalidades solicitadas hasta ahora. No hay tareas pendientes.