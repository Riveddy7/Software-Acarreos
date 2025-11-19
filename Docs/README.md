# Documentación - Acarreo.mx

Esta carpeta contiene la documentación técnica del sistema Acarreo.mx.

## Documentos Disponibles

### 1. [Estado Actual de la Aplicación](./ESTADO_ACTUAL_APLICACION.md)
- Resumen ejecutivo del sistema
- Pantallas activas y su funcionalidad
- Componentes UI principales
- Estructura de navegación
- Estado de implementación
- Próximos pasos recomendados

### 2. [Esquemas de Base de Datos](./ESQUEMAS_BASE_DATOS.md)
- Entidades principales y sus relaciones
- Definiciones completas de interfaces TypeScript
- Diagrama de relaciones entre entidades
- Índices recomendados para Firestore
- Notas de implementación

### 3. [Arquitectura de la Aplicación](./ARQUITECTURA_APLICACION.md)
- Stack tecnológico utilizado
- Estructura del proyecto
- Arquitectura de componentes
- Flujo de datos y gestión de estado
- Sistema de autenticación
- Estrategias de optimización
- Medidas de seguridad

### 4. [Análisis del Flujo de Operador](./FLUJO_OPERADOR_ANALISIS.md)
- Análisis completo del módulo /operator
- Flujo detallado de cada operación (despacho, entrega, recepciones)
- Componentes UI específicos para móviles
- Datos utilizados y su relación con Firestore
- Características móviles y validaciones

### 5. [Comparación de Flujos: Admin vs Operador](./COMPARACION_FLUJOS_ADMIN_OPERADOR.md)
- Comparación detallada entre panel admin y módulo operador
- Análisis de consistencia de datos y entidades
- Identificación de incongruencias críticas
- Matriz de consistencia y recomendaciones de mejora
- Mapeo completo de flujos de datos

### 6. [Análisis del Nuevo Flujo de Operador](./NUEVO_FLUJO_OPERADOR_ANALISIS.md)
- Análisis detallado del nuevo flujo de captura de eventos de acarreo
- Componentes y funcionalidades requeridas
- Impacto en el sistema actual
- Consideraciones técnicas y de optimización móvil
- Arquitectura propuesta para el nuevo diseño

### 7. [Plan de Implementación - Nuevo Flujo de Operador](./PLAN_IMPLEMENTACION_NUEVO_FLUJO.md)
- Plan detallado por fases para la implementación
- Actualización de modelos de datos y estructura de carpetas
- Especificaciones de componentes y servicios
- Cronograma estimado y métricas de éxito
- Gestión de riesgos y estrategias de mitigación

## Resumen del Sistema

Acarreo.mx es una aplicación web para la gestión de acarreos y materiales en obras de construcción, construida con:

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore, Authentication, Storage
- **Arquitectura**: Componentes reutilizables, diseño responsive
- **Funcionalidades**: Gestión completa de acarreos, materiales, camiones y operadores

## Estado Actual

✅ **Completado**: 
- 21 pantallas principales implementadas
- Todos los esquemas de base de datos definidos
- Sistema de autenticación con roles
- UI consistente y responsive
- Navegación organizada por categorías

## Próximos Pasos

1. **Testing**: Implementar pruebas unitarias y de integración
2. **Optimización**: Mejorar rendimiento de consultas
3. **Reportes**: Desarrollar módulo de análisis
4. **Auditoría**: Sistema de auditoría de cambios

## Contacto

Para preguntas o sugerencias sobre la documentación, contactar al equipo de desarrollo.