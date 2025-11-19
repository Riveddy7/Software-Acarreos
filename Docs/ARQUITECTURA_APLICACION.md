# Arquitectura de la Aplicación - Acarreo.mx

## Resumen

Acarreo.mx es una aplicación web construida con Next.js 15, TypeScript y Firebase Firestore, diseñada para gestionar acarreos y materiales en obras de construcción.

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 con App Router
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Componentes**: React con hooks personalizados
- **UI Library**: Componentes personalizados reutilizables

### Backend
- **Base de Datos**: Firebase Firestore (NoSQL)
- **Autenticación**: Firebase Authentication
- **Storage**: Firebase Storage (para archivos e imágenes)
- **Hosting**: Vercel (recomendado)

### Desarrollo
- **Package Manager**: npm
- **Control de Versiones**: Git
- **Entorno**: Node.js

## Estructura del Proyecto

```
src/
├── app/                          # App Router de Next.js
│   ├── admin/                    # Panel de administración
│   │   ├── layout.tsx           # Layout principal del admin
│   │   ├── [pagina]/            # Páginas del sistema
│   │   └── [pagina]/
│   │       └── [id]/           # Páginas dinámicas
│   │           └── print/       # Vistas de impresión
│   ├── operator/                # Interfaz para operadores
│   ├── login/                   # Autenticación
│   └── layout.tsx              # Layout raíz
├── components/                  # Componentes reutilizables
│   ├── ui/                     # Componentes UI genéricos
│   │   ├── Button.tsx
│   │   ├── DataTable.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   ├── admin/                  # Componentes específicos del admin
│   │   ├── DesktopSidebar.tsx
│   │   ├── MobileSidebar.tsx
│   │   └── ...
│   ├── auth/                   # Componentes de autenticación
│   └── operator/               # Componentes para operadores
├── lib/                        # Utilidades y configuración
│   ├── firebase/               # Configuración de Firebase
│   └── firebase.ts            # Instancia de Firebase
├── models/                      # Tipos de datos
│   └── types.ts               # Interfaces TypeScript
├── contexts/                    # Contextos de React
│   ├── AuthContext.tsx         # Contexto de autenticación
│   ├── CompanyContext.tsx      # Contexto de empresa
│   └── ThemeContext.tsx        # Contexto de tema
├── constants/                   # Constantes de la aplicación
│   └── colors.ts              # Colores del tema
└── types/                       # Tipos adicionales
    └── common.ts              # Tipos comunes
```

## Arquitectura de Componentes

### Jerarquía Principal

```
App
├── AuthContext (Proveedor de autenticación)
├── ThemeContext (Proveedor de tema)
└── ProtectedRoute (Protección de rutas)
    └── AdminLayout
        ├── DesktopSidebar
        ├── Header
        └── Main Content
            └── Page Components
```

### Componentes UI Reutilizables

1. **Button**: Botón con variantes (primary, secondary, danger, ghost, outline, success)
2. **DataTable**: Tabla con paginación, ordenamiento y filtrado
3. **Modal**: Diálogo modal con contenido personalizable
4. **ConfirmModal**: Modal para confirmaciones de eliminación
5. **SearchInput**: Campo de búsqueda con filtrado en tiempo real
6. **StatusBadge**: Indicadores de estado con colores
7. **PageHeader**: Encabezado estandarizado para páginas

## Flujo de Datos

### Gestión de Estado

1. **Estado Local**: useState para componentes individuales
2. **Estado Global**: Contextos de React para datos compartidos
   - AuthContext: Usuario autenticado y rol
   - CompanyContext: Empresa seleccionada
   - ThemeContext: Tema visual (light/dark)

### Flujo de Datos con Firebase

```
Componente → Hook Personalizado → Firebase Firestore
    ↓
Actualización de estado local
    ↓
Re-render del componente
```

### Patrones de Acceso a Datos

1. **getCollection<T>(collectionName)**: Obtiene todos los documentos
2. **addDocument(collectionName, data)**: Agrega un nuevo documento
3. **updateDocument(collectionName, id, data)**: Actualiza un documento
4. **deleteDocument(collectionName, id)**: Elimina un documento

## Sistema de Autenticación

### Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales
2. **Firebase Auth**: Verifica credenciales
3. **Context Update**: Actualiza AuthContext
4. **Route Protection**: ProtectedRoute verifica rol
5. **Redirect**: Redirige a página correspondiente

### Roles de Usuario

- **admin**: Acceso completo al panel de administración
- **operator**: Acceso limitado a funciones móviles

## Arquitectura de Navegación

### Estructura de Rutas

```
/admin                          # Panel principal
├── /requisiciones-material-vista # Vista principal de requisiciones
├── /acarreos                   # Gestión de acarreos
├── /trucks                     # Gestión de camiones
├── /transportistas              # Gestión de transportistas
├── /tipos-camion              # Tipos de camión
├── /clasificaciones-viaje       # Clasificaciones de viaje
├── /obras                      # Gestión de obras
├── /lugares                    # Gestión de lugares
├── /rutas                      # Gestión de rutas
├── /tipos-acarreo              # Tipos de acarreo
├── /operadores                 # Gestión de operadores
├── /materials                  # Gestión de materiales
├── /clasificaciones-material    # Clasificaciones de material
├── /unidades                   # Gestión de unidades
├── /suppliers                  # Gestión de proveedores
├── /clientes                   # Gestión de clientes
├── /empresas-internas          # Empresas internas
├── /ticket-reader              # Lector de tickets
├── /tickets                   # Gestión de tickets
└── /users                     # Gestión de usuarios

/operator                        # Interfaz móvil
├── /dispatch                   # Despacho
├── /delivery                   # Entrega
├── /receptions                 # Recepciones
└── /ticket/[shipmentId]        # Tickets específicos
```

### Sistema de Navegación

1. **DesktopSidebar**: Navegación lateral para escritorio
2. **MobileSidebar**: Menú hamburguesa para móviles
3. **Breadcrumb**: Navegación jerárquica (opcional)

## Arquitectura de Base de Datos

### Modelo de Datos

1. **Documentos**: Cada entidad es un documento en Firestore
2. **Colecciones**: Agrupaciones lógicas de documentos
3. **Subcolecciones**: Documentos anidados (tickets en shipments)
4. **Referencias**: Relaciones entre documentos
5. **Desnormalización**: Datos duplicados para optimizar consultas

### Estrategia de Consultas

1. **Consultas Simples**: getCollection para datos maestros
2. **Consultas Compuestas**: Múltiples consultas con joins en cliente
3. **Consultas Paginadas**: Para grandes volúmenes de datos
4. **Consultas Indexadas**: Con índices compuestos para rendimiento

## Sistema de Componentes de Formularios

### Patrón de Formularios

1. **Form Component**: Componente dedicado por entidad
2. **State Management**: useState para cada campo
3. **Validation**: Validación en cliente antes de enviar
4. **Submission**: Función handleSave asíncrona
5. **Error Handling**: Manejo de errores con alertas

### Ejemplo de Estructura

```typescript
function EntityForm({ entity, onSave, onCancel }) {
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveData({ field1, field2 });
      onSave();
    } catch (error) {
      alert('Error al guardar');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

## Arquitectura de Estilos

### Sistema de Diseño

1. **Tailwind CSS**: Framework de utilidades
2. **Diseño Responsivo**: Mobile-first approach
3. **Colores Personalizados**: Definidos en constants/colors.ts
4. **Componentes Tematizados**: Soporte para light/dark theme

### Paleta de Colores

```typescript
COLORS = {
  primary: '#2D3748',    // Carbón
  accent: '#38A169',     // Verde Construcción
  success: '#38A169',    // Verde Construcción
  warning: '#D69E2E',    // Amarillo
  danger: '#E53E3E',     // Rojo
  info: '#3182CE',       // Azul
}
```

## Arquitectura de Seguridad

### Medidas de Seguridad

1. **Autenticación**: Firebase Authentication con roles
2. **Autorización**: ProtectedRoute por rol
3. **Reglas Firestore**: Seguridad a nivel de base de datos
4. **Validación**: Validación en cliente y servidor
5. **Sanitización**: Limpieza de datos de entrada

### Reglas de Firestore (firestore.rules)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer
    match /{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

## Arquitectura de Despliegue

### Entornos

1. **Development**: Local con Firebase Emulator
2. **Staging**: Vercel Preview con Firebase Test
3. **Production**: Vercel Production con Firebase Production

### Pipeline CI/CD

1. **Git Push**: Trigger automático en Vercel
2. **Build**: Next.js build optimization
3. **Deploy**: Despliegue automático a producción
4. **Rollback**: Reversión automática en caso de error

## Patrones de Optimización

### Rendimiento

1. **Code Splitting**: División automática por páginas
2. **Lazy Loading**: Carga diferida de componentes
3. **Image Optimization**: Optimización de imágenes con Next.js
4. **Cache Strategy**: Cache de Firestore y navegador
5. **Bundle Analysis**: Análisis de tamaño de bundle

### Experiencia de Usuario

1. **Loading States**: Indicadores de carga
2. **Error Boundaries**: Manejo de errores gracefully
3. **Skeleton Screens**: Esqueletos de carga
4. **Progressive Enhancement**: Mejora progresiva

## Arquitectura de Testing

### Estrategia de Pruebas

1. **Unit Tests**: Pruebas de componentes individuales
2. **Integration Tests**: Pruebas de flujo completo
3. **E2E Tests**: Pruebas end-to-end automatizadas
4. **Visual Regression**: Pruebas de regresión visual

## Monitoreo y Analytics

### Métricas

1. **Performance**: Core Web Vitals
2. **Errors**: Seguimiento de errores
3. **Usage**: Análisis de uso de la aplicación
4. **Firebase Analytics**: Eventos personalizados

## Futuras Mejoras Arquitectónicas

1. **Microservicios**: Separación de servicios críticos
2. **Caching Layer**: Redis para consultas frecuentes
3. **CDN**: Para assets estáticos
4. **PWA**: Progressive Web App para operadores
5. **Offline Support**: Funcionalidad sin conexión