# Guía de Inicio Rápido para Nuevo Desarrollador

## Requisitos Previos

### Conocimientos Técnicos Requeridos
- **React**: Nivel intermedio-avanzado (Hooks, Context API)
- **Next.js**: Nivel intermedio (App Router, Server Components)
- **TypeScript**: Nivel intermedio-avanzado (tipado estricto)
- **Tailwind CSS**: Nivel básico-intermedio
- **Firebase**: Nivel básico-intermedio (Firestore, Auth, Storage)

### Herramientas Necesarias
```bash
# Node.js versión 18 o superior
node --version  # v18.x.x

# npm o yarn
npm --version  # 9.x.x

# Git
git --version  # 2.x.x

# Editor de código (recomendado VS Code)
code --version
```

## Configuración Inicial del Entorno

### 1. Clonar el Repositorio
```bash
# Clonar el repositorio principal
git clone https://github.com/usuario/acarreos-app.git
cd acarreos-app

# Verificar rama principal
git checkout main
git pull origin main
```

### 2. Instalar Dependencias
```bash
# Instalar dependencias de producción
npm install

# Verificar instalación exitosa
npm run build  # Debe completar sin errores críticos
```

### 3. Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar archivo .env.local con tus credenciales
# NO subir este archivo a Git
```

**Variables obligatorias en .env.local:**
```bash
# Configuración Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

### 4. Iniciar Servidor de Desarrollo
```bash
# Iniciar servidor local
npm run dev

# Acceder a aplicación
# http://localhost:3000
```

## Estructura del Proyecto - Puntos Clave

### Archivos Fundamentales que Debes Conocer

#### 1. Configuración Principal
```
src/lib/firebase-config.ts     # Configuración Firebase
src/lib/firebase.ts          # Inicialización Firebase
next.config.ts              # Configuración Next.js
tsconfig.json               # Configuración TypeScript
```

#### 2. Modelos de Datos
```
src/models/types.ts          # TODAS las interfaces TypeScript
```
**Importante**: Este archivo contiene TODOS los modelos de datos. Es tu referencia principal.

#### 3. Componentes Clave
```
src/components/ui/           # Componentes reutilizables
src/components/admin/        # Componentes admin
src/components/operator/     # Componentes operador móvil
```

#### 4. Lógica de Negocio
```
src/lib/operator/          # Lógica específica de operador
src/lib/firebase/          # Operaciones Firestore
```

## Flujo de Trabajo Típico

### 1. Para Desarrollar Nueva Funcionalidad

#### Paso 1: Definir Modelo de Datos
```typescript
// Agregar a src/models/types.ts
interface NuevaEntidad extends BaseDoc {
  nombre: string;           // NN
  descripcion?: string;      // Opcional
  activo: boolean;         // NN
}
```

#### Paso 2: Crear Componente UI
```typescript
// src/components/admin/NuevaEntidadForm.tsx
'use client';

import { useState } from 'react';
import { NuevaEntidad } from '@/models/types';
import { Button } from '@/components/ui';

export default function NuevaEntidadForm() {
  const [formData, setFormData] = useState<Partial<NuevaEntidad>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de guardado
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <Button type="submit">Guardar</Button>
    </form>
  );
}
```

#### Paso 3: Crear Página
```typescript
// src/app/admin/nueva-entidad/page.tsx
import NuevaEntidadForm from '@/components/admin/NuevaEntidadForm';

export default function NuevaEntidadPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Nueva Entidad</h1>
      <NuevaEntidadForm />
    </div>
  );
}
```

#### Paso 4: Agregar Navegación
```typescript
// src/components/admin/DesktopSidebar.tsx
const menuItems = [
  // ... items existentes
  {
    name: 'Nueva Entidad',
    href: '/admin/nueva-entidad',
    icon: 'icon-nueva-entidad'
  }
];
```

### 2. Para Modificar Funcionalidad Existente

#### Paso 1: Localizar Archivos Relevantes
```bash
# Buscar archivos relacionados con la funcionalidad
grep -r "nombreFuncionalidad" src/
grep -r "NombreFuncionalidad" src/
```

#### Paso 2: Entender Flujo de Datos
```typescript
// Seguir el flujo desde UI → Modelo → Firebase
Componente → Hook → Función Firestore → Database
```

#### Paso 3: Realizar Cambios
```typescript
// Modificar manteniendo consistencia
- Mantener patrones existentes
- Actualizar tipos si es necesario
- Probar todos los escenarios
```

## Buenas Prácticas del Proyecto

### 1. Patrones de Código

#### Componentes Funcionales
```typescript
// ✅ Correcto (React 19 compatible)
export default function MyComponent({ prop1, prop2 }: Props) {
  return <div>{prop1}</div>;
}

// ❌ Incorrecto (obsoleto)
const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
};
```

#### Manejo de Estados
```typescript
// ✅ Correcto (useState con tipado)
const [loading, setLoading] = useState<boolean>(false);
const [data, setData] = useState<DataType[]>([]);

// ❌ Incorrecto (any types)
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
```

#### Llamadas a Firebase
```typescript
// ✅ Correcto (async/await con manejo de errores)
const saveData = async (data: DataType) => {
  try {
    const docRef = doc(db, 'collection', id);
    await setDoc(docRef, data);
    // Manejo éxito
  } catch (error) {
    console.error('Error saving data:', error);
    // Manejo error
  }
};

// ❌ Incorrecto (sin manejo de errores)
const saveData = (data: DataType) => {
  setDoc(doc(db, 'collection', id), data);
};
```

### 2. Estilos y UI

#### Tailwind CSS Patterns
```typescript
// ✅ Correcto (clases consistentes)
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-xl font-semibold text-gray-900">
    Título
  </h2>
</div>

// ❌ Incorrecto (estilos inline o inconsistentes)
<div style={{ backgroundColor: 'white', borderRadius: '8px' }}>
  <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
    Título
  </h2>
</div>
```

#### Componentes UI Reutilizables
```typescript
// ✅ Correcto (usar componentes existentes)
import { Button, Modal, SearchInput } from '@/components/ui';

// ❌ Incorrecto (recrear componentes existentes)
<button className="custom-button">Click</button>
```

### 3. TypeScript

#### Tipado Estricto
```typescript
// ✅ Correcto (tipado explícito)
const processData = (data: DataType[]): ProcessedType => {
  return data.map(item => ({ ...item, processed: true }));
};

// ❌ Incorrecto (any types)
const processData = (data: any[]): any => {
  return data.map(item => ({ ...item, processed: true }));
};
```

#### Interfaces Consistentes
```typescript
// ✅ Correcto (heredar de BaseDoc)
interface MyEntity extends BaseDoc {
  nombre: string;
  activo: boolean;
}

// ❌ Incorrecto (no usar BaseDoc)
interface MyEntity {
  id: string;
  createdAt: Timestamp;
  nombre: string;
  activo: boolean;
}
```

## Debugging y Troubleshooting

### 1. Herramientas de Debug

#### Console Logging Estructurado
```typescript
// ✅ Correcto (logs estructurados)
console.log({
  timestamp: new Date().toISOString(),
  level: 'INFO',
  component: 'MyComponent',
  action: 'handleSubmit',
  data: { formData }
});

// ❌ Incorrecto (logs no estructurados)
console.log('Form submitted:', formData);
```

#### React DevTools
- Instalar extensión de React DevTools
- Usar para inspeccionar componentes y estado
- Revisar props y context

#### Firebase Emulator (Opcional)
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Iniciar emuladores
firebase emulators:start
```

### 2. Problemas Comunes y Soluciones

#### Build Errors
```bash
# Limpiar cache
rm -rf .next
npm run build

# Verificar tipos
npm run type-check

# Verificar linting
npm run lint
```

#### Firebase Connection Issues
```typescript
// Verificar configuración
console.log('Firebase config:', firebaseConfig);

// Verificar inicialización
import { getApps } from 'firebase/app';
console.log('Firebase apps:', getApps());
```

#### State Management Issues
```typescript
// Debug de estado
useEffect(() => {
  console.log('State changed:', { myState });
}, [myState]);
```

## Testing Local

### 1. Escenarios de Testing Clave

#### Testing en Móvil
```bash
# Usar Chrome DevTools Device Mode
# Probar en dispositivos reales si es posible
# Verificar PWA functionality
```

#### Testing de Funcionalidades Críticas
```bash
# 1. Login y autenticación
# 2. Escaneo QR
# 3. Captura de acarreos
# 4. Generación de tickets
# 5. Navegación móvil
```

### 2. Herramientas de Testing

#### Browser DevTools
- Network tab para peticiones Firebase
- Console para errores
- Application tab para storage y PWA

#### Lighthouse
```bash
# Audit de performance y PWA
# En Chrome DevTools → Lighthouse
```

## Flujo de Trabajo con Git

### 1. Branch Strategy
```bash
# Rama principal (producción)
main

# Ramas de desarrollo
feature/nueva-funcionalidad
bugfix/arreglo-especifico
hotfix/critico-urgente
```

### 2. Proceso de Pull Request
```bash
# 1. Crear rama feature
git checkout -b feature/mi-nueva-funcionalidad

# 2. Desarrollar y commitear
git add .
git commit -m "feat: agregar nueva funcionalidad X"

# 3. Push a rama remota
git push origin feature/mi-nueva-funcionalidad

# 4. Crear Pull Request en GitHub
# 5. Esperar revisión y aprobación
# 6. Merge a main
```

### 3. Convención de Commits
```bash
# Features
feat: agregar nueva funcionalidad de escaneo
feat: implementar módulo de reportes

# Bug fixes
fix: corregir error en escaneo QR
fix: resolver problema de visualización móvil

# Otros
docs: actualizar documentación
refactor: optimizar componente de tabla
test: agregar tests para módulo X
```

## Despliegue

### 1. Despliegue Local
```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Acceder en http://localhost:3000
```

### 2. Despliegue en Vercel
```bash
# Despliegue automático con push a main
git push origin main

# Monitorear en Vercel Dashboard
# https://vercel.com/username/acarreos-app
```

## Recursos y Referencias

### 1. Documentación Interna
```
AI-TRANSFER/                 # Documentación completa
Docs/                       # Documentación existente
src/models/types.ts          # Referencia de modelos
```

### 2. Documentación Externa
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### 3. Herramientas Útiles
- [Firebase Console](https://console.firebase.google.com)
- [Vercel Dashboard](https://vercel.com/dashboard)
- [GitHub Repository](https://github.com/usuario/acarreos-app)

## Checklist de Onboarding

### Primer Día
- [ ] Entorno configurado y funcionando
- [ ] Aplicación corre localmente
- [ ] Acceso a repositorio GitHub
- [ ] Credenciales Firebase obtenidas

### Primera Semana
- [ ] Revisión completa del código base
- [ ] Entendimiento de modelos de datos
- [ ] Testing de funcionalidades principales
- [ ] Setup de herramientas de desarrollo

### Segunda Semana
- [ ] Implementar primer cambio pequeño
- [ ] Completar flujo de PR completo
- [ ] Desplegar cambios a staging/producción
- [ ] Documentar cambios realizados

## Preguntas Frecuentes

### Q: ¿Cómo acceso a los datos de producción?
A: Contacta al administrador del proyecto para obtener credenciales Firebase de producción. NUNCA uses datos de producción en desarrollo.

### Q: ¿Qué hago si el build falla?
A: 
1. Revisa el error específico en la consola
2. Verifica que todas las dependencias estén instaladas
3. Limpia el cache (.next)
4. Revisa variables de entorno

### Q: ¿Cómo pruebo funcionalidades móviles?
A: 
1. Usa Chrome DevTools Device Mode
2. Prueba en dispositivos reales si es posible
3. Verifica PWA functionality
4. Testea offline behavior

### Q: ¿Dónde encuentro documentación de APIs?
A: Revisa `src/lib/firebase/` para operaciones Firestore y `src/models/types.ts` para modelos de datos.

### Q: ¿Cómo reporto un problema?
A: 
1. Revisa `AI-TRANSFER/07-PROBLEMAS-CONOCIDOS.md`
2. Si no está documentado, crea un issue en GitHub
3. Incluye screenshots, logs y pasos para reproducir

## Contacto y Soporte

### Canales de Comunicación
- **GitHub Issues**: Para bugs y feature requests
- **Email técnico**: Para problemas críticos de producción
- **Documentation**: AI-TRANSFER/ para referencia completa

### Escalation Path
1. **Nivel 1**: Revisar documentación y problemas conocidos
2. **Nivel 2**: Contactar desarrollador principal
3. **Nivel 3**: Escalar a equipo de arquitectura

## Tips de Productividad

### 1. Atajos de VS Code
```json
// .vscode/settings.json recomendados
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

### 2. Extensiones Recomendadas
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- Firebase Extension
- GitLens
- PWA Builder

### 3. Snippets Útiles
```typescript
// Componente básico
rafce → React Arrow Function Component Export

// Hook básico
rafh → React Arrow Function Hook

// Console log estructurado
clg → console.log({ timestamp: new Date().toISOString(), ... })
```

## Próximos Pasos Recomendados

### Después del Onboarding
1. **Familiarización**: Explora todo el código base
2. **Práctica**: Implementa cambios pequeños
3. **Mentoring**: Trabaja junto con desarrollador senior
4. **Independencia**: Toma responsabilidad de un módulo
5. **Mejora**: Propone mejoras al sistema

### Desarrollo Continuo
1. **Aprende**: Mantente actualizado con nuevas tecnologías
2. **Contribuye**: Comparte conocimiento con el equipo
3. **Documenta**: Documenta tus cambios y decisiones
4. **Testing**: Siempre prueba antes de desplegar
5. **Feedback**: Pide y da feedback constructivo

---

**¡Bienvenido al equipo!** Esta guía está diseñada para ayudarte a ser productivo rápidamente. No dudes en hacer preguntas y contribuir al mejoramiento continuo del proyecto.