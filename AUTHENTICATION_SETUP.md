# Configuración de Autenticación - Pasos Requeridos

## 1. Configurar Firebase Authentication

### Habilitar Authentication en Firebase Console:
1. Ve a tu proyecto Firebase en https://console.firebase.google.com/
2. En el menú lateral, selecciona "Authentication"
3. Ve a la pestaña "Sign-in method"
4. Habilita "Email/Password" como proveedor
5. Guarda los cambios

### Configurar dominios autorizados:
1. En la misma sección "Sign-in method"
2. En "Authorized domains", agrega tu dominio local y de producción:
   - `localhost` (para desarrollo)
   - Tu dominio de producción cuando lo tengas

## 2. Desplegar Reglas de Firestore

### Subir las reglas actualizadas:
```bash
# Si tienes Firebase CLI instalado
firebase deploy --only firestore:rules

# O copia manualmente el contenido de firestore.rules
# al editor de reglas en Firebase Console > Firestore > Rules
```

## 3. Crear Usuario Administrador Inicial

### Opción A: Temporalmente permitir registro público
1. Modifica temporalmente las reglas de Firestore para permitir crear usuarios
2. Crea el primer usuario admin desde la aplicación
3. Restaura las reglas de seguridad

### Opción B: Crear usuario directamente en Firebase Console
1. Ve a Firebase Console > Authentication > Users
2. Agrega un usuario manualmente
3. Luego ve a Firestore > users collection
4. Crea un documento con el UID del usuario y los datos:
```json
{
  "email": "admin@ejemplo.com",
  "username": "admin",
  "role": "admin",
  "isActive": true,
  "createdAt": "timestamp"
}
```

### Opción C: Script de configuración inicial
Ejecuta este script una vez para crear el administrador inicial:

```javascript
// Script para crear usuario admin inicial
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from './src/lib/firebase';

async function createInitialAdmin() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      'admin@tusitio.com',
      'contraseña_segura'
    );

    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email: 'admin@tusitio.com',
      username: 'Administrador',
      role: 'admin',
      isActive: true,
      createdAt: Timestamp.now()
    });

    console.log('Usuario administrador creado exitosamente');
  } catch (error) {
    console.error('Error:', error);
  }
}

createInitialAdmin();
```

## 4. Verificar Funcionamiento

### Pruebas a realizar:
1. ✅ Acceder a `/` debe redirigir a `/login`
2. ✅ Login con credenciales correctas debe funcionar
3. ✅ Admin debe poder acceder a `/admin` y todas sus rutas
4. ✅ Operador debe poder acceder solo a `/operator`
5. ✅ Operador NO debe poder acceder a `/admin`
6. ✅ Admin debe poder crear nuevos usuarios en `/admin/users`
7. ✅ Cerrar sesión debe funcionar correctamente

## 5. Variables de Entorno

Asegúrate de que tu `.env.local` esté configurado correctamente:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

## 6. Notas de Seguridad

- ✅ **Credenciales protegidas**: Movidas a variables de entorno
- ✅ **Autenticación implementada**: Firebase Auth configurado
- ✅ **Autorización por roles**: Admin/Operador separados
- ✅ **Rutas protegidas**: Middleware de protección activo
- ✅ **Reglas de Firestore**: Acceso basado en roles y autenticación
- ✅ **Solo admin puede crear usuarios**: Sin registro público

## 7. Próximos Pasos

1. Configurar Firebase Authentication (Paso 1)
2. Subir reglas de Firestore (Paso 2)
3. Crear usuario administrador inicial (Paso 3)
4. Probar toda la funcionalidad (Paso 4)
5. ¡Listo para usar el sistema con autenticación completa!

## Credenciales de Prueba (cambiar después)

Después de crear el usuario admin inicial, puedes crear usuarios operadores desde el panel de administración en `/admin/users`.