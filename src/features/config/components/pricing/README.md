# Módulo de Pricing - Documentación

## 📋 Resumen

El módulo de pricing es un sistema completo para gestionar tarifas, precios y políticas de cobro del sistema de transporte YaVoy. Está dividido en 4 secciones principales:

- **Niveles de Tarifa (Ride Tiers)**: Configuración de niveles de servicio y precios base
- **Reglas Temporales (Temporal Rules)**: Multiplicadores basados en tiempo y condiciones
- **Calculadora**: Herramienta para calcular precios en tiempo real
- **Resumen**: Dashboard con estadísticas y métricas

## 🏗️ Arquitectura

### Componentes Principales

#### 1. **RideTiersTable** - Tabla de Niveles de Tarifa
- **Props**: `data`, `loading`, callbacks para acciones
- **Funcionalidad**: Listado paginado, filtros, acciones CRUD
- **Columnas**: ID, Nombre, Precios, Prioridad, Estado, Alcance

#### 2. **TemporalRulesTable** - Tabla de Reglas Temporales
- **Props**: `data`, `loading`, callbacks para acciones
- **Funcionalidad**: Listado especializado para reglas por tipo
- **Columnas**: ID, Nombre, Tipo, Multiplicador, Configuración, Alcance

#### 3. **PricingCalculator** - Calculadora Interactiva
- **Props**: `onResult` callback opcional
- **Funcionalidad**: Cálculo en tiempo real con selección geográfica
- **Características**: Validación automática, resultados detallados

#### 4. **PricingSummary** - Dashboard de Estadísticas
- **Sin props requeridas**
- **Funcionalidad**: Métricas en tiempo real de ride tiers y reglas
- **Secciones**: Estadísticas de niveles, distribución por tipo, resumen de reglas

### Modales CRUD

#### Ride Tiers Modals
- **RideTiersCreateModal**: Creación con validaciones completas
- **RideTiersEditModal**: Edición con carga de datos existente
- **RideTiersDeleteModal**: Eliminación con confirmación detallada

#### Temporal Rules Modals
- **TemporalRulesCreateModal**: Creación inteligente con configuración condicional
- **TemporalRulesEditModal**: Edición con restricciones de tipo
- **TemporalRulesDeleteModal**: Eliminación con impacto detallado

## 🔧 Hooks Disponibles

### Ride Tiers Hooks
```typescript
useRideTiers(params)           // Lista paginada con filtros
useCreateRideTier()           // Crear nuevo nivel
useRideTier(id)               // Obtener nivel individual
useUpdateRideTier()           // Actualizar nivel existente
useDeleteRideTier()           // Eliminar nivel
useRideTiersSummary()         // Estadísticas de niveles
```

### Temporal Rules Hooks
```typescript
useTemporalRules(params)      // Lista paginada con filtros
useCreateTemporalRule()      // Crear nueva regla
useTemporalRule(id)          // Obtener regla individual
useUpdateTemporalRule()      // Actualizar regla existente
useDeleteTemporalRule()      // Eliminar regla
useTemporalRulesSummary()    // Estadísticas de reglas
```

### Calculation Hooks
```typescript
useCalculatePricing()         // Calcular precio de viaje
useValidatePricing()          // Validar configuración
useSimulatePricing()          // Simulación completa
```

### Bulk Operations
```typescript
useBulkUpdateRideTiers()      // Actualización masiva de niveles
useBulkUpdateTemporalRules()  // Actualización masiva de reglas
useCreateStandardTiers()      // Crear niveles estándar
useCreateStandardTemporalRules() // Crear reglas estándar
```

## 🎨 Interfaz de Usuario

### Página Principal (`/dashboard/config/pricing`)

La página está organizada en **4 tabs principales**:

#### 1. **Niveles de Tarifa**
- Tabla completa con filtros y búsqueda
- Botón "Nuevo Nivel" para creación
- Acciones: Editar, Eliminar, Activar/Desactivar

#### 2. **Reglas Temporales**
- Tabla especializada por tipo de regla
- Botón "Nueva Regla" para creación
- Acciones contextuales por tipo de regla

#### 3. **Calculadora**
- Formulario interactivo para cálculo de precios
- Selección geográfica en cascada
- Resultados detallados con desglose

#### 4. **Resumen**
- Dashboard con métricas en tiempo real
- Gráficos de distribución
- Estadísticas comparativas

### Estados de Carga
- **Skeletons animados** durante carga inicial
- **Spinners** durante operaciones
- **Mensajes informativos** para estados vacíos

### Validaciones
- **Validación en tiempo real** en formularios
- **Mensajes de error** en español
- **Feedback visual** para estados inválidos

## 🔄 Flujo de Trabajo

### Gestión de Niveles de Tarifa
1. **Visualizar** → Tabla con filtros
2. **Crear** → Modal con validaciones
3. **Editar** → Modal con datos precargados
4. **Eliminar** → Confirmación con impacto
5. **Monitorear** → Dashboard de estadísticas

### Gestión de Reglas Temporales
1. **Seleccionar Tipo** → Rango horario, día de semana, etc.
2. **Configurar** → Parámetros específicos por tipo
3. **Definir Alcance** → Geográfico (global, país, estado, ciudad)
4. **Establecer Multiplicador** → Incremento/decremento de precio
5. **Activar** → Regla lista para aplicación automática

### Cálculo de Precios
1. **Seleccionar Nivel** → Ride tier base
2. **Definir Viaje** → Distancia, duración, ubicación
3. **Aplicar Condiciones** → Surge, demanda, tráfico
4. **Calcular** → Resultado con reglas aplicadas
5. **Revisar Desglose** → Componentes del precio final

## 🛠️ Tecnologías Utilizadas

- **React** con hooks personalizados
- **TypeScript** para type safety
- **Zod** para validaciones y schemas
- **React Hook Form** para formularios
- **React Query** para gestión de estado servidor
- **Tailwind CSS** para estilos
- **Lucide React** para iconografía

## 🚀 Características Avanzadas

### Validación Inteligente
- **Schemas Zod** con validaciones contextuales
- **Mensajes de error** específicos por campo
- **Validación condicional** (reglas temporales por tipo)

### Experiencia de Usuario
- **Navegación intuitiva** con tabs organizados
- **Feedback visual** consistente
- **Estados de carga** apropiados
- **Confirmaciones** para operaciones destructivas

### Performance
- **Cache inteligente** con React Query
- **Invalidación automática** después de mutaciones
- **Lazy loading** para datos relacionados
- **Optimización de re-renders**

### Escalabilidad
- **Arquitectura modular** con componentes reutilizables
- **Separación clara** entre lógica de negocio y UI
- **Type safety** completo con TypeScript
- **Documentación integrada** en schemas Zod

## 📚 Guía de Uso

### Para Desarrolladores
1. **Importar componentes** desde `@/features/config/components/pricing`
2. **Usar hooks** desde `@/features/config/hooks`
3. **Referenciar tipos** desde los schemas correspondientes
4. **Seguir patrones** establecidos para nuevos componentes

### Para Administradores
1. **Navegar** a Configuración → Pricing
2. **Seleccionar tab** según necesidad
3. **Usar filtros** para encontrar elementos específicos
4. **Crear/editar** usando los modales intuitivos
5. **Monitorear** métricas en el tab de resumen

Este módulo proporciona una solución completa y profesional para la gestión de pricing en sistemas de transporte, con todas las funcionalidades necesarias para una operación eficiente y escalable.
