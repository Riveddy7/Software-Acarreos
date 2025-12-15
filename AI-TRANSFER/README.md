# Software de Acarreos - Documentación para Transferencia

## Propósito
Este documento contiene toda la información técnica necesaria para que un programador con IA pueda tomar el desarrollo del Software de Acarreos de manera eficiente.

## Estructura de Documentación
- `01-PROYECTO-OVERVIEW.md` - Visión general del proyecto y contexto de negocio
- `02-ARQUITECTURA-TECNICA.md` - Stack tecnológico y arquitectura del sistema
- `03-ESTRUCTURA-PROYECTO.md` - Estructura de archivos y carpetas
- `04-MODELOS-DATOS.md` - Modelos de datos y relaciones
- `05-FLUJOS-NEGOCIO.md` - Flujos de negocio y casos de uso
- `06-CONFIGURACION-DESPLIEGUE.md` - Configuración y despliegue
- `07-PROBLEMAS-CONOCIDOS.md` - Problemas conocidos y soluciones implementadas
- `08-GUIA-INICIO.md` - Guía de inicio rápido para nuevo desarrollador

## Información Crítica
- **Framework**: Next.js 15.5.4 con React 19.1.0
- **Base de Datos**: Firestore (Firebase)
- **Autenticación**: Firebase Auth
- **Lenguaje**: TypeScript con modo estricto
- **Estilos**: Tailwind CSS
- **Despliegue**: Vercel

## Estado Actual del Proyecto
El proyecto está funcional y en producción. Se han implementado todos los módulos principales de administración y operación. El sistema maneja acarreos de materiales en obras de construcción con seguimiento completo.

## Notas Importantes
1. El proyecto usa Firebase con configuración hardcoded como fallback
2. Existen dos modelos de datos para camiones (antiguo y nuevo) con compatibilidad
3. El escáner QR tiene múltiples fallbacks para iOS Safari
4. La aplicación está optimizada para dispositivos móviles
5. Se implementó PWA con service worker

## Próximos Pasos Recomendados
1. Revisar la documentación en orden numérico
2. Configurar entorno de desarrollo local
3. Analizar modelos de datos y flujos de negocio
4. Revisar problemas conocidos y soluciones
5. Iniciar con tareas de mantenimiento o nuevas funcionalidades