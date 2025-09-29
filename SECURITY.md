# Guía de Seguridad - Software Acarreos

## Configuración de Seguridad Implementada

### 1. Variables de Entorno
- ✅ **Credenciales de Firebase** movidas a `.env.local`
- ✅ **Configuración robusta** con fallbacks en `firebase-config.ts`
- ✅ **Validación** de variables de entorno requeridas
- ✅ **Archivo .env.example** como plantilla para desarrolladores
- ✅ **Gitignore actualizado** para excluir archivos sensibles

### 2. Reglas de Firestore
- ✅ **Archivo firestore.rules** creado con estructura básica
- ⚠️ **Reglas permisivas** para desarrollo (requiere actualización para producción)
- 📝 **TODOs documentados** para implementar autenticación

### 3. Validaciones de Código
- ✅ **Sin vulnerabilidades XSS** detectadas (no se usa innerHTML, eval, etc.)
- ✅ **Console.log presente** pero solo para debugging (eliminar en producción)

## Acciones Requeridas para Producción

### 1. Implementar Autenticación
```typescript
// Ejemplo de reglas de Firestore con autenticación
match /trucks/{truckId} {
  allow read, write: if request.auth != null;
}
```

### 2. Configurar Dominio de Autorización
En Firebase Console:
- Ir a Authentication > Settings
- Agregar tu dominio de producción a "Authorized domains"

### 3. Configurar CORS
Si usas un dominio personalizado, configura CORS en Firebase Storage.

### 4. Limpiar Console.log
Antes de desplegar a producción, remover todos los `console.log` del código.

### 5. Validación de Entradas
Agregar validación del lado del servidor para todos los inputs de formularios.

### 6. Rate Limiting
Implementar rate limiting en las operaciones de Firestore para prevenir abuso.

## Variables de Entorno Requeridas

Copia `.env.example` a `.env.local` y configura:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## Checklist de Seguridad para Producción

- [ ] Implementar autenticación de usuarios
- [ ] Actualizar reglas de Firestore con autenticación
- [ ] Remover console.log del código
- [ ] Configurar dominios autorizados en Firebase
- [ ] Implementar validación de entradas del servidor
- [ ] Configurar rate limiting
- [ ] Revisar y actualizar dependencias
- [ ] Configurar HTTPS en el dominio de producción
- [ ] Implementar logs de auditoría
- [ ] Configurar monitoreo de seguridad

## Contacto de Seguridad

Si encuentras una vulnerabilidad de seguridad, por favor reporta el problema de manera responsable.