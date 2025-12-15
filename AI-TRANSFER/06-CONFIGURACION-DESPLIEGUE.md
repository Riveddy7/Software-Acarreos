# Configuración y Despliegue

## Entornos del Sistema

### 1. Desarrollo (Development)
- **URL**: localhost:3000
- **Base de Datos**: Firebase Project (dev)
- **Autenticación**: Firebase Auth (test users)
- **Storage**: Firebase Storage (dev bucket)
- **Propósito**: Desarrollo y pruebas locales

### 2. Staging (Opcional)
- **URL**: staging.acarreos-app.com
- **Base de Datos**: Firebase Project (staging)
- **Autenticación**: Firebase Auth (staging users)
- **Storage**: Firebase Storage (staging bucket)
- **Propósito**: Pruebas pre-producción

### 3. Producción (Production)
- **URL**: acarreos-app.com
- **Base de Datos**: Firebase Project (production)
- **Autenticación**: Firebase Auth (production users)
- **Storage**: Firebase Storage (prod bucket)
- **Propósito**: Sistema en uso real

## Configuración de Variables de Entorno

### Archivo .env.example
```bash
# Configuración Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Configuración Aplicación (futuro)
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_API_BASE_URL=https://api.acarreos-app.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@acarreos-app.com

# Configuración Despliegue
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Configuración Firebase en Código
```typescript
// src/lib/firebase-config.ts
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC0GonvZHuq263cS5bLrcmT9fPQNUQp5po",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "acarreos-23764.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "acarreos-23764",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "acarreos-23764.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "327390470215",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:327390470215:web:27d5d8d579fee919831162",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-ZKXSRPQB8E"
};
```

## Configuración de Next.js

### next.config.ts
```typescript
import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  // Configuración de salida
  outputFileTracingRoot: __dirname,
  
  // Configuración ESLint
  eslint: {
    ignoreDuringBuilds: true, // Temporal hasta corregir errores
  },
  
  // Variables de entorno
  env: {
    NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },
  
  // Configuración de imágenes
  images: {
    domains: ['firebasestorage.googleapis.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuración de headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

// Configuración PWA
const pwaConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: {
    urlPatterns: [
      /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
    ],
  },
})(nextConfig as any);

export default pwaConfig;
```

## Configuración de TypeScript

### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true
  },
  "include": [
    "next-env.d.ts", 
    "**/*.ts", 
    "**/*.tsx", 
    ".next/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

## Configuración de Tailwind CSS

### tailwind.config.js (futuro)
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f8fafc',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

## Configuración de PWA

### public/manifest.json
```json
{
  "name": "Software de Acarreos",
  "short_name": "Acarreos",
  "description": "Sistema de gestión de acarreos para obras de construcción",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

## Configuración de Firebase

### Reglas de Seguridad (Firestore)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Reglas para usuarios
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || request.auth.token.role == 'admin');
    }
    
    // Reglas para acarreos
    match /acarreos/{acarreoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'operator'];
    }
    
    // Reglas para maestros (solo admin)
    match /{document}/{docId} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'admin' &&
        document in [
          'trucks', 'transportistas', 'obras', 'materiales',
          'clientes', 'empresasInternas', 'lugares', 'rutas',
          'tiposAcarreo', 'clasificacionesMaterial', 'unidades',
          'operadores', 'requisicionesMaterial'
        ];
    }
    
    // Reglas para storage
    match /{document}/{docId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['admin', 'operator'];
    }
  }
}
```

### Índices de Firestore
```json
{
  "indexes": [
    {
      "collectionGroup": "acarreos",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "idObra",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fechaHora",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "trucks",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "idTransportista",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "estatusActivo",
          "order": "ASCENDING"
        }
      ]
    },
    {
      "collectionGroup": "requisicionesMaterial",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "idObra",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "estatusAutorizado",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "fechaSolicitud",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Configuración de Despliegue (Vercel)

### vercel.json
```json
{
  "version": 2,
  "name": "acarreos-app",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN": "@firebase-auth-domain",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID": "@firebase-project-id",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET": "@firebase-storage-bucket",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "@firebase-messaging-sender-id",
    "NEXT_PUBLIC_FIREBASE_APP_ID": "@firebase-app-id",
    "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID": "@firebase-measurement-id"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_FIREBASE_API_KEY": "@firebase-api-key"
    }
  },
  "functions": {
    "src/*.ts": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## Proceso de Despliegue

### 1. Despliegue Local (Development)
```bash
# 1. Clonar repositorio
git clone https://github.com/user/acarreos-app.git
cd acarreos-app

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con valores de desarrollo

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Acceder a aplicación
# http://localhost:3000
```

### 2. Despliegue en Vercel (Producción)
```bash
# 1. Preparar código
git checkout main
git pull origin main
npm install

# 2. Ejecutar pruebas
npm run lint
npm run build

# 3. Desplegar (automático con push a main)
git add .
git commit -m "Release v1.0.0"
git push origin main

# 4. Monitorear despliegue en Vercel Dashboard
# https://vercel.com/dashboard
```

### 3. Despliegue Manual en Vercel
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login en Vercel
vercel login

# 3. Desplegar proyecto
vercel --prod

# 4. Configurar variables de entorno en Vercel Dashboard
# Settings → Environment Variables
```

## Configuración de Dominio

### 1. Configuración DNS
```
Tipo: A
Nombre: @
Valor: 76.76.19.19 (Vercel IP)
TTL: 300

Tipo: CNAME
Nombre: www
Valor: cname.vercel-dns.com
TTL: 300
```

### 2. Configuración SSL
- Automático mediante Vercel
- Certificado wildcard incluido
- Renovación automática

## Monitoreo y Logging

### 1. Firebase Analytics
```typescript
// Configuración en src/lib/firebase.ts
import { getAnalytics } from "firebase/analytics";

const analytics = getAnalytics(app);
```

### 2. Vercel Analytics
- Acceso vía Vercel Dashboard
- Métricas de rendimiento
- Error tracking

### 3. Console Logging
```typescript
// Estructura de logs
console.log({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'QRScanner',
  action: 'scanSuccess',
  data: { truckId: 'TRUCK-123' }
});
```

## Configuración de Seguridad

### 1. Variables de Entorno
- Todas las variables sensibles en .env
- No incluir .env en Git
- Usar variables de Vercel para producción

### 2. Firebase Security Rules
- Validación de autenticación
- Control de acceso por rol
- Validación de datos de entrada

### 3. HTTPS
- Forzado en producción
- Certificado SSL automático
- Redirección HTTP → HTTPS

## Configuración de Performance

### 1. Optimización de Build
```json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build",
    "build:static": "next build && next export"
  }
}
```

### 2. Caching Strategy
```typescript
// Configuración de headers en next.config.ts
async headers() {
  return [
    {
      source: '/_next/static/(.*)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ];
}
```

### 3. Image Optimization
```typescript
// next.config.ts
images: {
  domains: ['firebasestorage.googleapis.com'],
  formats: ['image/webp', 'image/avif'],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

## Configuración de Backup

### 1. Firebase Backup
- Export diario automático
- Retención de 30 días
- Backup a Google Cloud Storage

### 2. Código Source
- Git repository (GitHub)
- Branch protection para main
- Tags por versión

## Troubleshooting Común

### 1. Build Errors
```bash
# Limpiar cache
rm -rf .next
npm run build

# Verificar TypeScript
npm run type-check

# Verificar ESLint
npm run lint
```

### 2. Firebase Connection Issues
```typescript
// Verificar configuración
console.log('Firebase Config:', firebaseConfig);

// Verificar inicialización
import { getApps } from "firebase/app";
console.log('Firebase Apps:', getApps());
```

### 3. Environment Variables
```bash
# Verificar variables en producción
vercel env ls

# Agregar variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
```

## Checklist de Despliegue

### Pre-Despliegue
- [ ] Tests pasando
- [ ] Build exitoso localmente
- [ ] Variables de entorno configuradas
- [ ] Firebase rules actualizadas
- [ ] Índices de Firestore creados
- [ ] Versión actualizada en package.json

### Post-Despliegue
- [ ] Sitio accesible
- [ ] Login funcional
- [ ] Funcionalidades principales operativas
- [ ] Mobile PWA instalable
- [ ] Analytics recolectando datos
- [ ] Logs sin errores críticos

### Monitoreo Continuo
- [ ] Performance metrics
- [ ] Error rates
- [ ] User feedback
- [ ] Uso de storage
- [ ] Costos de Firebase

## Configuración de Desarrollo Avanzado

### 1. Docker (Opcional)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### 2. GitHub Actions (CI/CD)
```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build project
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### 3. Testing Setup
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "@testing-library/react": "^13.0.0",
    "@testing-library/jest-dom": "^5.0.0",
    "jest": "^29.0.0"
  }
}