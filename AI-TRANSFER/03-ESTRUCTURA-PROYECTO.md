# Estructura de Archivos y Carpetas

## Estructura General del Proyecto

```
Software Acarreos/
├── .env.example                    # Plantilla variables de entorno
├── .eslintrc.json                 # Configuración ESLint
├── .gitignore                      # Archivos ignorados por Git
├── eslint.config.mjs               # Configuración ESLint (moderna)
├── firestore.rules                  # Reglas de seguridad Firestore
├── FUNCIONALIDADES.md             # Documentación funcionalidades
├── next.config.ts                 # Configuración Next.js
├── package-lock.json              # Lock de dependencias
├── package.json                   # Dependencias y scripts
├── PATRONES_DISENO_ADMIN.md       # Patrones de diseño admin
├── PLAN_DISENO_OPERADOR.md       # Plan de diseño operador
├── postcss.config.mjs            # Configuración PostCSS
├── README.md                     # Documentación general
├── tsconfig.json                 # Configuración TypeScript
├── .claude/                     # Configuraciones Claude AI
├── Docs/                        # Documentación existente
├── AI-TRANSFER/                 # Documentación para transferencia (esta carpeta)
├── public/                      # Archivos estáticos
├── scripts/                     # Scripts de utilidad
├── src/                        # Código fuente principal
└── supabase/                   # Configuración Supabase (obsoleto)
```

## Estructura Detallada de src/

```
src/
├── app/                        # App Router (Next.js 13+)
│   ├── favicon.ico             # Favicon
│   ├── globals.css             # Estilos globales
│   ├── layout.tsx             # Layout principal
│   ├── page.tsx               # Página principal
│   ├── admin/                 # Sección administrativa
│   │   ├── layout.tsx         # Layout admin
│   │   ├── page.tsx           # Dashboard admin
│   │   ├── acarreos/          # Gestión de acarreos
│   │   ├── clasificaciones-material/ # Clasificaciones de materiales
│   │   ├── clasificaciones-viaje/   # Clasificaciones de viaje
│   │   ├── clientes/          # Gestión de clientes
│   │   ├── companies/         # Gestión de empresas
│   │   ├── empresas-internas/ # Empresas internas
│   │   ├── lugares/           # Gestión de lugares
│   │   ├── materials/         # Gestión de materiales
│   │   │   └── [materialId]/ # Detalle de material
│   │   ├── obras/             # Gestión de obras
│   │   ├── operadores/        # Gestión de operadores
│   │   │   └── [operadorId]/ # Detalle de operador
│   │   │       └── print/    # Impresión QR operador
│   │   ├── purchase-orders/    # Órdenes de compra
│   │   ├── requisiciones-material/ # Requisiciones (obsoleto)
│   │   ├── requisiciones-material-vista/ # Vista de requisiciones
│   │   │   └── page.tsx      # Vista principal con formulario
│   │   ├── rutas/             # Gestión de rutas
│   │   ├── shipments/          # Envíos
│   │   │   └── [shipmentId]/  # Detalle de envío
│   │   │       └── ticket/    # Tickets de envío
│   │   ├── suppliers/          # Gestión de proveedores
│   │   ├── ticket-reader/      # Lector de tickets
│   │   ├── tickets/           # Gestión de tickets
│   │   ├── tipos-acarreo/     # Tipos de acarreo
│   │   ├── tipos-camion/      # Tipos de camión
│   │   ├── transportistas/     # Transportistas
│   │   ├── trucks/            # Gestión de camiones
│   │   │   └── [truckId]/    # Detalle de camión
│   │   │       └── print/    # Impresión QR camión
│   │   ├── unidades/          # Unidades de medida
│   │   └── users/            # Gestión de usuarios
│   ├── company-selection/       # Selección de empresa
│   ├── location-selection/     # Selección de ubicación
│   ├── login/                # Login de usuarios
│   └── operator/             # Sección operativa móvil
│       ├── layout.tsx          # Layout operador
│       ├── page.tsx            # Dashboard operador
│       ├── capture-acarreo/    # Captura de acarreos
│       ├── delivery/           # Entregas
│       ├── dispatch/           # Despachos
│       ├── obra-selection/     # Selección de obra
│       ├── receptions/         # Recepciones
│       └── ticket/            # Tickets de operador
│           └── [shipmentId]/  # Ticket específico
├── components/                # Componentes React
│   ├── admin/                # Componentes admin
│   │   ├── AdminQrReader.tsx # Lector QR admin
│   │   ├── CompanyForm.tsx    # Formulario empresa
│   │   ├── DesktopSidebar.tsx # Sidebar escritorio
│   │   ├── DriverForm.tsx     # Formulario conductor
│   │   ├── LocationForm.tsx   # Formulario ubicación
│   │   ├── MaterialForm.tsx   # Formulario material
│   │   ├── MobileSidebar.tsx   # Sidebar móvil
│   │   ├── QrCodeDisplay.tsx  # Display QR
│   │   ├── QrCodeDisplayPrintable.tsx # QR imprimible
│   │   ├── SupplierForm.tsx    # Formulario proveedor
│   │   ├── TicketPrintable.tsx # Ticket imprimible
│   │   └── TruckForm.tsx      # Formulario camión
│   ├── auth/                 # Componentes autenticación
│   │   └── ProtectedRoute.tsx  # Ruta protegida
│   ├── operator/             # Componentes operador
│   │   ├── AcarreoCaptureForm.tsx # Formulario captura
│   │   ├── LocationSelector.tsx    # Selector ubicación
│   │   ├── ObraSelector.tsx         # Selector obra
│   │   ├── OperatorNavigation.tsx    # Navegación operador
│   │   ├── QRScanner.tsx           # Escáner QR
│   │   ├── TruckScanner.tsx         # Escáner camión
│   │   └── TruckScannerSimple.tsx   # Escáner simple
│   └── ui/                   # Componentes UI genéricos
│       ├── Button.tsx          # Botón
│       ├── ConfirmModal.tsx    # Modal confirmación
│       ├── DataTable.tsx       # Tabla de datos
│       ├── LoadingSkeleton.tsx  # Skeleton loading
│       ├── Modal.tsx           # Modal genérico
│       ├── PageHeader.tsx      # Header de página
│       ├── SearchInput.tsx     # Input búsqueda
│       ├── StatusBadge.tsx     # Badge de estado
│       └── index.ts           # Exportaciones UI
├── constants/                # Constantes de la aplicación
│   └── colors.ts            # Colores del tema
├── contexts/                # React Context
│   ├── AuthContext.tsx      # Contexto autenticación
│   ├── CompanyContext.tsx   # Contexto empresa
│   └── ThemeContext.tsx     # Contexto tema
├── lib/                     # Librerías y utilidades
│   ├── auth.ts              # Utilidades autenticación
│   ├── firebase-config.ts    # Configuración Firebase
│   ├── firebase.ts          # Inicialización Firebase
│   ├── theme-classes.ts     # Clases de tema
│   ├── firebase/           # Utilidades Firebase
│   │   └── firestore.ts    # Operaciones Firestore
│   └── operator/           # Utilidades operador
│       ├── location.ts       # Geolocalización
│       ├── photo.ts         # Manejo de fotos
│       ├── printer.ts       # Impresión
│       ├── scanner.ts       # Escaneo QR/NFC/RFID
│       └── validation.ts    # Validaciones
├── models/                  # Modelos de datos TypeScript
│   └── types.ts           # Definiciones de tipos
└── types/                   # Tipos adicionales
    └── common.ts           # Tipos comunes
```

## Archivos de Configuración Clave

### package.json
```json
{
  "name": "acarreos-app",
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "firebase": "^12.3.0",
    "next": "15.5.4",
    "react": "19.1.0",
    "jsqr": "^1.4.0",
    "jspdf": "^3.0.3"
  }
}
```

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### next.config.ts
```typescript
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    // Variables Firebase
  },
};

export default withPWA(nextConfig);
```

## Estructura de Componentes por Funcionalidad

### Componentes de Administración
- **Formularios**: CompanyForm, MaterialForm, TruckForm, etc.
- **Tablas**: DataTable con configuraciones específicas
- **Modales**: ConfirmModal, Modal genéricos
- **QR**: AdminQrReader, QrCodeDisplay

### Componentes de Operador
- **Escaneo**: QRScanner, TruckScanner, TruckScannerSimple
- **Formularios**: AcarreoCaptureForm
- **Navegación**: OperatorNavigation
- **Selección**: LocationSelector, ObraSelector

### Componentes UI Reutilizables
- **Botones**: Button con variantes
- **Entradas**: SearchInput, form inputs
- **Display**: LoadingSkeleton, StatusBadge
- **Layout**: PageHeader, Modal

## Estructura de Datos (Firestore)

### Colecciones Principales
```
/trucks/                    # Camiones
/transportistas/           # Transportistas
/tiposCamion/            # Tipos de camión
/clasificacionesViaje/    # Clasificaciones de viaje
/obras/                   # Obras
/clientes/                # Clientes
/empresasInternas/        # Empresas internas
/lugares/                 # Lugares
/rutas/                   # Rutas
/materiales/              # Materiales
/clasificacionesMaterial/ # Clasificaciones de materiales
/unidades/                # Unidades
/tiposAcarreo/           # Tipos de acarreo
/operadores/              # Operadores
/acarreos/               # Acarreos (eventos)
/requisicionesMaterial/    # Requisiciones de material
/lineasRequisicion/       # Líneas de requisición
/users/                  # Usuarios de sistema
```

### Subcolecciones
```
/obras/{obraId}/lugares/          # Lugares por obra
/requisicionesMaterial/{id}/lineas/ # Líneas por requisición
/acarreos/{id}/fotos/             # Fotos por acarreo
```

## Patrones de Nomenclatura

### Archivos
- **Componentes**: PascalCase (Button.tsx, Modal.tsx)
- **Páginas**: kebab-case para carpetas, page.tsx para archivos
- **Utilidades**: camelCase (firebase.ts, auth.ts)
- **Tipos**: camelCase (types.ts, common.ts)

### Carpetas
- **Secciones**: kebab-case (admin/, operator/)
- **Componentes**: kebab-case (ui/, auth/)
- **Features**: kebab-case (requisiciones-material/)

### Variables y Funciones
- **Variables**: camelCase (userName, isActive)
- **Constantes**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Funciones**: camelCase (getUserData, handleSubmit)
- **Componentes**: PascalCase (CustomButton, ModalDialog)

## Import/Export Patterns

### Imports
```typescript
// React y Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Componentes internos
import { Button } from '@/components/ui';
import { QRScanner } from '@/components/operator';

// Utilidades
import { getTruckById } from '@/lib/firebase/firestore';
import { Truck } from '@/models/types';

// Contextos
import { useAuth } from '@/contexts/AuthContext';
```

### Exports
```typescript
// Export default para componente principal
export default function TruckPage() { ... }

// Export nombrados para utilidades
export { getTruckById, saveTruck };
export type { Truck, Transportista };
```

## Configuración de Rutas Next.js

### App Router Structure
```
app/
├── layout.tsx              # Layout raíz
├── page.tsx                # Home (/)
├── admin/
│   ├── layout.tsx          # Layout admin
│   └── page.tsx            # Dashboard (/admin)
├── admin/trucks/
│   └── page.tsx            # Lista camiones (/admin/trucks)
├── admin/trucks/[id]/
│   └── page.tsx            # Detalle camión (/admin/trucks/123)
└── operator/
    ├── layout.tsx          # Layout operador
    └── page.tsx            # Dashboard operador (/operator)
```

## Archivos Estáticos

### public/ Structure
```
public/
├── manifest.json           # PWA manifest
├── sw.js                 # Service worker
├── icons/                # Iconos PWA
│   ├── android-chrome-192x192.png
│   └── android-chrome-512x512.png
├── *.svg                 # Iconos SVG
└── workbox-*.js          # Workbox files (PWA)
```

## Scripts y Automatización

### package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",           # Desarrollo
    "build": "next build",       # Build producción
    "start": "next start",       # Servir producción
    "lint": "eslint",           # Linting
    "type-check": "tsc --noEmit" # Type checking
  }
}
```

## Configuración de Desarrollo

### Variables de Entorno
```bash
# .env.example
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Firebase Config
```typescript
// src/lib/firebase-config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "fallback",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "fallback",
  // ... más configuración
};
```

## Consideraciones Importantes

### 1. Path Aliases
- `@/` apunta a `src/`
- Configurado en `tsconfig.json` y `next.config.ts`

### 2. Component Architecture
- Componentes atómicos y reutilizables
- Composición sobre herencia
- Props typing estricto

### 3. State Management
- React Context para estado global
- useState para estado local
- Firestore listeners para datos remotos

### 4. Styling
- Tailwind CSS para estilos
- Componentes UI consistentes
- Mobile-first approach

### 5. TypeScript
- Modo estricto habilitado
- Tipos explícitos requeridos
- Interfaces bien definidas