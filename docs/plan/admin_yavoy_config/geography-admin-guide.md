# Geography - Guía de Consumo para Administradores

Esta guía explica cómo consumir los endpoints de gestión de geografía desde el panel de administración.

## 📋 Información General

**Base URL:** `/admin/geography`

**Autenticación:** Requiere token JWT en el header `Authorization: Bearer <token>`

---

## 🌍 GESTIÓN DE PAÍSES (COUNTRIES)

### Crear un nuevo país

**MÉTODO:** `POST /admin/geography/countries`

**DESCRIPCIÓN:** Crea un nuevo país en el sistema de geografía con toda su información regional.

**ENVÍO:**
```json
{
  "name": "United States",
  "isoCode2": "US",
  "isoCode3": "USA",
  "numericCode": 840,
  "phoneCode": "+1",
  "currencyCode": "USD",
  "currencyName": "United States Dollar",
  "currencySymbol": "$",
  "timezone": "America/New_York",
  "continent": "North America",
  "region": "Americas",
  "subregion": "Northern America",
  "vatRate": 8.25,
  "corporateTaxRate": 21.0,
  "incomeTaxRate": 37.0,
  "isActive": true,
  "requiresVerification": false,
  "supportedLanguages": ["en", "es"],
  "flag": "🇺🇸",
  "capital": "Washington D.C.",
  "population": 331900000,
  "areaKm2": 9833517
}
```

**RECIBE:**
```json
{
  "id": 1,
  "name": "United States",
  "isoCode2": "US",
  "isoCode3": "USA",
  "numericCode": 840,
  "phoneCode": "+1",
  "currencyCode": "USD",
  "currencyName": "United States Dollar",
  "currencySymbol": "$",
  "timezone": "America/New_York",
  "continent": "North America",
  "region": "Americas",
  "subregion": "Northern America",
  "vatRate": 8.25,
  "corporateTaxRate": 21.0,
  "incomeTaxRate": 37.0,
  "isActive": true,
  "requiresVerification": false,
  "supportedLanguages": ["en", "es"],
  "flag": "🇺🇸",
  "capital": "Washington D.C.",
  "population": 331900000,
  "areaKm2": 9833517,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "statesCount": 0
}
```

**ERRORES POSIBLES:**
- `400`: Datos inválidos
- `409`: País ya existe (código ISO duplicado)

---

### Listar países con filtros

**MÉTODO:** `GET /admin/geography/countries`

**DESCRIPCIÓN:** Obtiene una lista paginada de países con opciones avanzadas de filtrado.

**PARÁMETROS DE CONSULTA (opcionales):**
```
?page=1&limit=20&continent=Europe&isActive=true&search=United&sortBy=name&sortOrder=asc
```

**RECIBE:**
```json
{
  "countries": [
    {
      "id": 1,
      "name": "United States",
      "isoCode2": "US",
      "continent": "North America",
      "isActive": true,
      "statesCount": 50
    }
  ],
  "total": 195,
  "page": 1,
  "limit": 20,
  "totalPages": 10
}
```

---

### Obtener detalles de un país

**MÉTODO:** `GET /admin/geography/countries/{id}`

**DESCRIPCIÓN:** Obtiene la información completa de un país específico.

**RECIBE:** La respuesta completa del país (mismo formato que creación)

**ERRORES POSIBLES:**
- `404`: País no encontrado

---

### Actualizar un país

**MÉTODO:** `PATCH /admin/geography/countries/{id}`

**DESCRIPCIÓN:** Modifica la información de un país existente.

**ENVÍO:** Los campos a actualizar (mismo formato que creación, todos opcionales)

**RECIBE:** El país actualizado

**ERRORES POSIBLES:**
- `404`: País no encontrado
- `409`: Conflicto de códigos únicos

---

### Eliminar un país

**MÉTODO:** `DELETE /admin/geography/countries/{id}`

**DESCRIPCIÓN:** Elimina un país del sistema (solo si no tiene estados asociados).

**RECIBE:** `200 OK` (sin respuesta body)

**ERRORES POSIBLES:**
- `404`: País no encontrado
- `409`: No se puede eliminar - tiene dependencias

---

### Cambiar estado activo/inactivo

**MÉTODO:** `PATCH /admin/geography/countries/{id}/toggle-status`

**DESCRIPCIÓN:** Alterna el estado operativo de un país.

**RECIBE:** El país con el estado actualizado

---

### Importar países desde CSV

**MÉTODO:** `POST /admin/geography/countries/bulk-import`

**DESCRIPCIÓN:** Carga masiva de países desde un archivo CSV con validación y manejo de errores.

**ENVÍO:** Form-data con archivo CSV

**RECIBE:**
```json
{
  "totalProcessed": 195,
  "successful": 180,
  "failed": 15,
  "skipped": 5,
  "errors": [
    {
      "row": 5,
      "field": "isoCode2",
      "value": "INVALID",
      "error": "Invalid ISO code format"
    }
  ],
  "skippedRecords": [
    {
      "row": 10,
      "reason": "Country already exists",
      "data": { "name": "United States", "isoCode2": "US" }
    }
  ],
  "duration": 2500
}
```

**ERRORES POSIBLES:**
- `400`: Archivo inválido o datos incorrectos

---

### Estadísticas por continente

**MÉTODO:** `GET /admin/geography/countries/stats/by-continent`

**DESCRIPCIÓN:** Obtiene el conteo de países activos por continente.

**RECIBE:**
```json
{
  "stats": [
    {
      "continent": "Europe",
      "totalCountries": 44,
      "activeCountries": 42
    },
    {
      "continent": "Asia",
      "totalCountries": 48,
      "activeCountries": 45
    }
  ]
}
```

---

## 🏛️ GESTIÓN DE ESTADOS/PROVINCIAS (STATES)

### Crear un nuevo estado/provincia

**MÉTODO:** `POST /admin/geography/states`

**DESCRIPCIÓN:** Crea un nuevo estado o provincia en el sistema de geografía.

**ENVÍO:**
```json
{
  "name": "California",
  "code": "CA",
  "countryId": 1,
  "latitude": 36.7783,
  "longitude": -119.4179,
  "timezone": "America/Los_Angeles",
  "isActive": true,
  "pricingMultiplier": 1.2,
  "serviceFee": 2.5,
  "capital": "Sacramento",
  "population": 39538223,
  "areaKm2": 423967
}
```

**RECIBE:**
```json
{
  "id": 1,
  "name": "California",
  "code": "CA",
  "countryId": 1,
  "latitude": 36.7783,
  "longitude": -119.4179,
  "timezone": "America/Los_Angeles",
  "isActive": true,
  "pricingMultiplier": 1.2,
  "serviceFee": 2.5,
  "capital": "Sacramento",
  "population": 39538223,
  "areaKm2": 423967,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "country": {
    "id": 1,
    "name": "United States",
    "isoCode2": "US"
  },
  "citiesCount": 0
}
```

**ERRORES POSIBLES:**
- `400`: Datos inválidos
- `404`: País no encontrado
- `409`: Estado ya existe (código duplicado en el país)

---

### Listar estados con filtros

**MÉTODO:** `GET /admin/geography/states`

**DESCRIPCIÓN:** Obtiene una lista paginada de estados con opciones de filtrado.

**PARÁMETROS DE CONSULTA (opcionales):**
```
?page=1&limit=20&countryId=1&isActive=true&search=California&sortBy=name&sortOrder=asc
```

**RECIBE:**
```json
{
  "states": [
    {
      "id": 1,
      "name": "California",
      "code": "CA",
      "countryName": "United States",
      "isActive": true,
      "citiesCount": 58
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "totalPages": 3
}
```

---

### Obtener estados por país

**MÉTODO:** `GET /admin/geography/states/by-country/{countryId}`

**DESCRIPCIÓN:** Lista todos los estados activos de un país específico.

**PARÁMETROS DE CONSULTA:**
```
?activeOnly=true
```

**RECIBE:** Array de estados (mismo formato que listar)

---

### Estadísticas de estados por país

**MÉTODO:** `GET /admin/geography/states/stats/by-country`

**DESCRIPCIÓN:** Obtiene el conteo de estados activos agrupados por país.

**RECIBE:**
```json
{
  "stats": [
    {
      "countryId": 1,
      "countryName": "United States",
      "totalStates": 50,
      "activeStates": 49
    }
  ]
}
```

---

## 🏙️ GESTIÓN DE CIUDADES (CITIES)

### Crear una nueva ciudad

**MÉTODO:** `POST /admin/geography/cities`

**DESCRIPCIÓN:** Crea una nueva ciudad con coordenadas GPS y límites geográficos.

**ENVÍO:**
```json
{
  "name": "Los Angeles",
  "stateId": 1,
  "latitude": 34.0522,
  "longitude": -118.2437,
  "timezone": "America/Los_Angeles",
  "isActive": true,
  "pricingMultiplier": 1.3,
  "serviceFee": 1.5,
  "serviceRadius": 50,
  "population": 3976322,
  "areaKm2": 1302,
  "elevation": 89,
  "postalCodes": ["90001", "90002", "90003"],
  "restrictedAreas": ["airport", "military_zone"],
  "premiumZones": ["downtown", "stadium"],
  "boundaries": {
    "type": "Polygon",
    "coordinates": [[[ ... ]]]
  }
}
```

**RECIBE:**
```json
{
  "id": 1,
  "name": "Los Angeles",
  "stateId": 1,
  "latitude": 34.0522,
  "longitude": -118.2437,
  "timezone": "America/Los_Angeles",
  "isActive": true,
  "pricingMultiplier": 1.3,
  "serviceFee": 1.5,
  "serviceRadius": 50,
  "population": 3976322,
  "areaKm2": 1302,
  "elevation": 89,
  "postalCodes": ["90001", "90002", "90003"],
  "restrictedAreas": ["airport", "military_zone"],
  "premiumZones": ["downtown", "stadium"],
  "boundaries": { "type": "Polygon", "coordinates": [[[ ... ]]] },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "state": {
    "id": 1,
    "name": "California",
    "code": "CA",
    "country": {
      "id": 1,
      "name": "United States",
      "isoCode2": "US"
    }
  },
  "serviceZonesCount": 0
}
```

**ERRORES POSIBLES:**
- `400`: Datos inválidos
- `404`: Estado no encontrado
- `409`: Ciudad ya existe (conflicto de nombre en el estado)

---

### Listar ciudades con filtros

**MÉTODO:** `GET /admin/geography/cities`

**DESCRIPCIÓN:** Obtiene una lista paginada de ciudades con opciones avanzadas de filtrado.

**PARÁMETROS DE CONSULTA (opcionales):**
```
?page=1&limit=20&stateId=1&countryId=1&isActive=true&search=Los Angeles&sortBy=name&sortOrder=asc
```

**RECIBE:**
```json
{
  "cities": [
    {
      "id": 1,
      "name": "Los Angeles",
      "stateName": "California",
      "latitude": 34.0522,
      "longitude": -118.2437,
      "isActive": true,
      "population": 3976322
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "totalPages": 5
}
```

---

### Obtener ciudades por estado

**MÉTODO:** `GET /admin/geography/cities/by-state/{stateId}`

**DESCRIPCIÓN:** Lista todas las ciudades activas de un estado específico.

**PARÁMETROS DE CONSULTA:**
```
?activeOnly=true
```

**RECIBE:** Array de ciudades (mismo formato que listar)

---

### Estadísticas de ciudades por estado

**MÉTODO:** `GET /admin/geography/cities/stats/by-state`

**DESCRIPCIÓN:** Obtiene el conteo de ciudades activas agrupadas por estado y país.

**RECIBE:**
```json
{
  "stats": [
    {
      "stateId": 1,
      "stateName": "California",
      "countryName": "United States",
      "totalCities": 58,
      "activeCities": 57
    }
  ]
}
```

---

### Obtener detalles de una ciudad

**MÉTODO:** `GET /admin/geography/cities/{id}`

**DESCRIPCIÓN:** Obtiene la información completa de una ciudad específica incluyendo límites geográficos.

**RECIBE:** La respuesta completa de la ciudad (mismo formato que creación)

**ERRORES POSIBLES:**
- `404`: Ciudad no encontrada

---

### Actualizar una ciudad

**MÉTODO:** `PATCH /admin/geography/cities/{id}`

**DESCRIPCIÓN:** Actualiza la información de una ciudad existente incluyendo coordenadas y límites.

**ENVÍO:** Los campos a actualizar (mismo formato que creación, todos opcionales)

**RECIBE:** La ciudad actualizada

**ERRORES POSIBLES:**
- `404`: Ciudad no encontrada
- `409`: Conflicto de datos únicos

---

### Eliminar una ciudad

**MÉTODO:** `DELETE /admin/geography/cities/{id}`

**DESCRIPCIÓN:** Elimina una ciudad del sistema (solo si no tiene zonas de servicio asociadas).

**RECIBE:** `200 OK` (sin respuesta body)

**ERRORES POSIBLES:**
- `404`: Ciudad no encontrada
- `409`: No se puede eliminar - tiene dependencias

---

### Cambiar estado activo/inactivo

**MÉTODO:** `PATCH /admin/geography/cities/{id}/toggle-status`

**DESCRIPCIÓN:** Alterna el estado operativo de una ciudad.

**RECIBE:** La ciudad con el estado actualizado

---

## 📊 CAMPOS EN LISTAS (OPTIMIZADOS)

### Campos en lista de Países (6 campos):
- `id`: ID único del país
- `name`: Nombre completo del país
- `isoCode2`: Código ISO de 2 letras
- `continent`: Continente
- `isActive`: Estado operativo
- `statesCount`: Número de estados/provincias

### Campos en lista de Estados (6 campos):
- `id`: ID único del estado
- `name`: Nombre completo del estado
- `code`: Código del estado
- `countryName`: Nombre del país
- `isActive`: Estado operativo
- `citiesCount`: Número de ciudades

### Campos en lista de Ciudades (7 campos):
- `id`: ID único de la ciudad
- `name`: Nombre completo de la ciudad
- `stateName`: Nombre del estado
- `latitude`: Latitud del centro
- `longitude`: Longitud del centro
- `isActive`: Estado operativo
- `population`: Población

### Campos requeridos para crear País:
- `name`: 1-100 caracteres
- `isoCode2`: 2 caracteres (ISO 3166-1 alpha-2)
- `currencyCode`: 3 caracteres (ISO 4217)
- `timezone`: IANA timezone válido
- `continent`: Continente válido

### Campos requeridos para crear Estado:
- `name`: 1-100 caracteres
- `code`: 1-10 caracteres
- `countryId`: ID de país existente

### Campos requeridos para crear Ciudad:
- `name`: 1-100 caracteres
- `stateId`: ID de estado existente
- `latitude`: -90 a 90
- `longitude`: -180 a 180

### Continentes válidos:
- `Africa`, `Antarctica`, `Asia`, `Europe`, `North America`, `Oceania`, `South America`

### Tipos de zona de servicio:
- `regular`: Zona estándar
- `premium`: Zona de alta demanda/precio premium
- `restricted`: Zona con restricciones de acceso

### Validaciones geográficas:
- Coordenadas GPS válidas
- GeoJSON válido para límites
- Radio de servicio entre 1-500 km
- Elevación en metros (opcional)

---

## 🔧 USO PRÁCTICO

### 1. Configurar un nuevo país con estados y ciudades:

**Crear país:**
```json
POST /admin/geography/countries
{
  "name": "Mexico",
  "isoCode2": "MX",
  "isoCode3": "MEX",
  "phoneCode": "+52",
  "currencyCode": "MXN",
  "currencyName": "Mexican Peso",
  "currencySymbol": "$",
  "timezone": "America/Mexico_City",
  "continent": "North America",
  "isActive": true
}
```

**Crear estado:**
```json
POST /admin/geography/states
{
  "name": "Jalisco",
  "code": "JAL",
  "countryId": 2,
  "isActive": true,
  "pricingMultiplier": 1.1
}
```

**Crear ciudad:**
```json
POST /admin/geography/cities
{
  "name": "Guadalajara",
  "stateId": 3,
  "latitude": 20.6597,
  "longitude": -103.3496,
  "isActive": true,
  "serviceRadius": 40
}
```

### 2. Verificar cobertura geográfica:

**Estadísticas por continente:**
```json
GET /admin/geography/countries/stats/by-continent
```

**Ciudades por estado:**
```json
GET /admin/geography/cities/stats/by-state
```

### 3. Importar datos masivos:

**Subir archivo CSV de países:**
```json
POST /admin/geography/countries/bulk-import
Content-Type: multipart/form-data
// Archivo CSV con columnas: name,isoCode2,isoCode3,numericCode,phoneCode,currencyCode,timezone,continent
```

### 4. Gestionar zonas de servicio:

**Crear zona premium:**
```json
POST /admin/geography/service-zones
{
  "name": "Centro Histórico",
  "cityId": 1,
  "zoneType": "premium",
  "boundaries": { "type": "Polygon", "coordinates": [[[ ... ]]] },
  "centerLat": 20.6597,
  "centerLng": -103.3496,
  "pricingMultiplier": 1.5,
  "demandMultiplier": 2.0
}
```

### 5. Filtrar datos específicos:

**Ciudades activas de un estado:**
```json
GET /admin/geography/cities/by-state/1?activeOnly=true
```

**Estados de un país:**
```json
GET /admin/geography/states/by-country/1?activeOnly=true
```

---

## 🗺️ GESTIÓN DE ZONAS DE SERVICIO (SERVICE ZONES)

### Introducción

Las zonas de servicio (Service Zones) son áreas geográficas específicas dentro de una ciudad que tienen configuraciones particulares de pricing, límites de conductores y reglas operativas. Estas zonas permiten un control granular sobre el servicio en diferentes áreas de la ciudad.

**Tipos de zonas disponibles:**
- `regular`: Zona estándar con pricing normal
- `premium`: Zona de alta demanda con pricing premium
- `restricted`: Zona con restricciones de acceso o operación

**Campos principales:**
- **Geometría**: Polígono GeoJSON que define los límites de la zona
- **Pricing**: `pricingMultiplier` y `demandMultiplier` para ajustar tarifas
- **Límites de conductores**: `maxDrivers` y `minDrivers` para control operativo
- **Configuración**: Horarios pico, estado activo/inactivo

---

### Crear una nueva zona de servicio

**MÉTODO:** `POST /admin/geography/service-zones`

**DESCRIPCIÓN:** Crea una nueva zona de servicio con geometría GeoJSON y configuraciones de pricing.

**ENVÍO:**
```json
{
  "name": "Centro Histórico Premium",
  "cityId": 1,
  "zoneType": "premium",
  "boundaries": {
    "type": "Polygon",
    "coordinates": [
      [
        [-118.25, 34.05],
        [-118.24, 34.05],
        [-118.24, 34.04],
        [-118.25, 34.04],
        [-118.25, 34.05]
      ]
    ]
  },
  "centerLat": 34.045,
  "centerLng": -118.245,
  "pricingMultiplier": 1.5,
  "demandMultiplier": 1.8,
  "maxDrivers": 50,
  "minDrivers": 10,
  "isActive": true,
  "peakHours": {
    "weekdays": ["07:00-09:00", "17:00-19:00"],
    "weekends": ["10:00-22:00"]
  }
}
```

**RECIBE:**
```json
{
  "id": 1,
  "name": "Centro Histórico Premium",
  "cityId": 1,
  "zoneType": "premium",
  "boundaries": {
    "type": "Polygon",
    "coordinates": [
      [
        [-118.25, 34.05],
        [-118.24, 34.05],
        [-118.24, 34.04],
        [-118.25, 34.04],
        [-118.25, 34.05]
      ]
    ]
  },
  "centerLat": 34.045,
  "centerLng": -118.245,
  "isActive": true,
  "pricingMultiplier": 1.5,
  "demandMultiplier": 1.8,
  "maxDrivers": 50,
  "minDrivers": 10,
  "peakHours": {
    "weekdays": ["07:00-09:00", "17:00-19:00"],
    "weekends": ["10:00-22:00"]
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "city": {
    "id": 1,
    "name": "Los Angeles",
    "state": {
      "id": 1,
      "name": "California",
      "country": {
        "id": 1,
        "name": "United States"
      }
    }
  }
}
```

**ERRORES POSIBLES:**
- `400`: Datos inválidos o geometría malformada
- `404`: Ciudad no encontrada
- `409`: Conflicto - Zona ya existe o se solapa con otra

---

### Listar zonas con filtros

**MÉTODO:** `GET /admin/geography/service-zones`

**DESCRIPCIÓN:** Obtiene una lista paginada de zonas de servicio con opciones avanzadas de filtrado.

**PARÁMETROS DE CONSULTA (opcionales):**
```
?page=1&limit=20&cityId=1&stateId=1&countryId=1&zoneType=premium&isActive=true&search=Centro&sortBy=name&sortOrder=asc
```

**RECIBE:**
```json
{
  "zones": [
    {
      "id": 1,
      "name": "Centro Histórico Premium",
      "cityName": "Los Angeles",
      "stateName": "California",
      "zoneType": "premium",
      "isActive": true,
      "pricingMultiplier": 1.5,
      "demandMultiplier": 1.8
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "totalPages": 2
}
```

---

### Obtener zonas por ciudad

**MÉTODO:** `GET /admin/geography/service-zones/by-city/:cityId`

**DESCRIPCIÓN:** Obtiene todas las zonas activas de una ciudad específica para visualización en el mapa.

**PARÁMETROS DE CONSULTA:**
```
?activeOnly=true
```

**RECIBE:**
```json
[
  {
    "id": 1,
    "name": "Centro Histórico Premium",
    "zoneType": "premium",
    "boundaries": {
      "type": "Polygon",
      "coordinates": [[[ ... ]]]
    },
    "centerLat": 34.045,
    "centerLng": -118.245,
    "pricingMultiplier": 1.5,
    "demandMultiplier": 1.8,
    "isActive": true
  }
]
```

---

### Obtener detalles de una zona

**MÉTODO:** `GET /admin/geography/service-zones/:id`

**DESCRIPCIÓN:** Obtiene la información completa de una zona específica incluyendo geometría y configuraciones.

**RECIBE:** La respuesta completa de la zona (mismo formato que creación)

**ERRORES POSIBLES:**
- `404`: Zona no encontrada

---

### Actualizar una zona existente

**MÉTODO:** `PATCH /admin/geography/service-zones/:id`

**DESCRIPCIÓN:** Actualiza geometría, pricing y configuraciones de una zona existente.

**ENVÍO:** Los campos a actualizar (mismo formato que creación, todos opcionales)

**RECIBE:** La zona actualizada

**ERRORES POSIBLES:**
- `404`: Zona no encontrada
- `409`: Conflicto - Datos duplicados o geometría inválida

---

### Validar geometría antes de crear/actualizar

**MÉTODO:** `POST /admin/geography/service-zones/validate-geometry`

**DESCRIPCIÓN:** Valida geometría GeoJSON y verifica conflictos con zonas existentes.

**ENVÍO:**
```json
{
  "zoneData": {
    "name": "Nueva Zona Premium",
    "cityId": 1,
    "zoneType": "premium",
    "boundaries": {
      "type": "Polygon",
      "coordinates": [
        [
          [-118.25, 34.05],
          [-118.24, 34.05],
          [-118.24, 34.04],
          [-118.25, 34.04],
          [-118.25, 34.05]
        ]
      ]
    },
    "centerLat": 34.045,
    "centerLng": -118.245
  },
  "cityId": 1,
  "excludeZoneId": 1
}
```

**RECIBE:**
```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Zone overlaps with existing zone by 15%"],
  "analysis": {
    "areaKm2": 2.5,
    "overlapPercentage": 15.0,
    "gapPercentage": 0.0
  }
}
```

---

### Análisis de cobertura de ciudad

**MÉTODO:** `GET /admin/geography/service-zones/coverage-analysis/city/:cityId`

**DESCRIPCIÓN:** Analiza cobertura geográfica, solapamientos y áreas sin cobertura en una ciudad.

**RECIBE:**
```json
{
  "cityId": 1,
  "cityName": "Los Angeles",
  "totalCoverage": 85.5,
  "overlappingArea": 12.3,
  "uncoveredArea": 14.5,
  "coverageByType": {
    "regular": 60.2,
    "premium": 20.1,
    "restricted": 5.2
  },
  "issues": [
    "Significant overlap between zones 1 and 3",
    "Uncovered area in northwest sector"
  ],
  "recommendations": [
    "Adjust boundaries of zone 1 to reduce overlap",
    "Add zone for uncovered area in northwest"
  ]
}
```

---

### Matriz de pricing por ciudad

**MÉTODO:** `GET /admin/geography/service-zones/pricing-matrix/city/:cityId`

**DESCRIPCIÓN:** Obtiene todos los multiplicadores de pricing organizados por zona.

**RECIBE:**
```json
{
  "cityId": 1,
  "zones": [
    {
      "id": 1,
      "name": "Centro Histórico Premium",
      "type": "premium",
      "pricingMultiplier": 1.5,
      "demandMultiplier": 1.8,
      "maxDrivers": 50,
      "minDrivers": 10
    }
  ]
}
```

---

### Operaciones masivas

**MÉTODO:** `POST /admin/geography/service-zones/bulk-update-status`

**DESCRIPCIÓN:** Cambia el estado activo/inactivo de múltiples zonas.

**ENVÍO:**
```json
{
  "zoneIds": [1, 2, 3],
  "isActive": false
}
```

**RECIBE:**
```json
{
  "message": "Bulk status update completed",
  "results": [
    {
      "zoneId": 1,
      "success": true,
      "data": { /* zona actualizada */ }
    }
  ],
  "successful": 3,
  "failed": 0
}
```

---

### Eliminar una zona

**MÉTODO:** `DELETE /admin/geography/service-zones/:id`

**DESCRIPCIÓN:** Elimina una zona del sistema.

**RECIBE:** `200 OK` (sin respuesta body)

**ERRORES POSIBLES:**
- `404`: Zona no encontrada
- `409`: No se puede eliminar - tiene dependencias activas

---

### Cambiar estado activo/inactivo

**MÉTODO:** `PATCH /admin/geography/service-zones/:id/toggle-status`

**DESCRIPCIÓN:** Alterna el estado operativo de una zona de servicio.

**RECIBE:** La zona con el estado actualizado

**ERRORES POSIBLES:**
- `404`: Zona no encontrada

---

### 🎨 FLUJO COMPLETO DESDE EL FRONTEND

Esta sección explica paso a paso cómo implementar la creación y gestión de zonas de servicio desde el frontend, incluyendo dibujo en mapas, validación y persistencia.

#### Paso 1: Dibujar zona en el mapa

El usuario dibuja un polígono en el mapa usando las herramientas de dibujo de la biblioteca de mapas.

```typescript
// Función para calcular el centro de un polígono GeoJSON
function calculatePolygonCenter(polygon: any): { lat: number; lng: number } {
  const coordinates = polygon.coordinates[0];
  let latSum = 0;
  let lngSum = 0;
  
  coordinates.forEach((coord: number[]) => {
    lngSum += coord[0];
    latSum += coord[1];
  });
  
  return {
    lat: latSum / coordinates.length,
    lng: lngSum / coordinates.length
  };
}

// Función para crear zona desde polígono dibujado
async function createZoneFromPolygon(polygon: any, zoneConfig: any) {
  // 1. Calcular centro del polígono
  const center = calculatePolygonCenter(polygon);
  
  // 2. Preparar datos de la zona
  const zoneData = {
    name: zoneConfig.name,
    cityId: zoneConfig.cityId,
    zoneType: zoneConfig.zoneType,
    boundaries: polygon,
    centerLat: center.lat,
    centerLng: center.lng,
    pricingMultiplier: zoneConfig.pricingMultiplier || 1.0,
    demandMultiplier: zoneConfig.demandMultiplier || 1.0,
    maxDrivers: zoneConfig.maxDrivers,
    minDrivers: zoneConfig.minDrivers,
    isActive: true
  };
  
  return zoneData;
}
```

#### Paso 2: Validar geometría

Antes de crear la zona, es recomendable validar la geometría para detectar problemas.

```typescript
async function validateZoneGeometry(zoneData: any, cityId: number, excludeZoneId?: number) {
  try {
    const response = await fetch('/admin/geography/service-zones/validate-geometry', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        zoneData,
        cityId,
        excludeZoneId
      })
    });
    
    if (!response.ok) {
      throw new Error(`Validation failed: ${response.statusText}`);
    }
    
    const validation = await response.json();
    
    // Mostrar warnings al usuario
    if (validation.warnings && validation.warnings.length > 0) {
      showWarnings(validation.warnings);
    }
    
    return validation;
  } catch (error) {
    console.error('Error validating geometry:', error);
    throw error;
  }
}

function showWarnings(warnings: string[]) {
  warnings.forEach(warning => {
    console.warn('Zone validation warning:', warning);
    // Mostrar en UI: toast, modal, etc.
  });
}
```

#### Paso 3: Crear zona

Si la validación es exitosa, proceder a crear la zona.

```typescript
async function createServiceZone(zoneData: any) {
  try {
    const response = await fetch('/admin/geography/service-zones', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(zoneData)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create zone');
    }
    
    const newZone = await response.json();
    console.log('Zone created successfully:', newZone);
    
    return newZone;
  } catch (error) {
    console.error('Error creating zone:', error);
    throw error;
  }
}
```

#### Paso 4: Actualizar visualización del mapa

Una vez creada la zona, actualizar el mapa para mostrar la nueva zona.

```typescript
function updateMapWithZone(zone: any) {
  // Agregar polígono al mapa
  const polygon = L.polygon(
    zone.boundaries.coordinates[0].map((coord: number[]) => [coord[1], coord[0]]),
    {
      color: getZoneColor(zone.zoneType),
      fillColor: getZoneFillColor(zone.zoneType),
      fillOpacity: 0.3,
      weight: 2
    }
  );
  
  // Agregar popup con información de la zona
  polygon.bindPopup(`
    <div>
      <h4>${zone.name}</h4>
      <p><strong>Tipo:</strong> ${zone.zoneType}</p>
      <p><strong>Pricing:</strong> ${zone.pricingMultiplier}x</p>
      <p><strong>Demand:</strong> ${zone.demandMultiplier}x</p>
      <p><strong>Estado:</strong> ${zone.isActive ? 'Activo' : 'Inactivo'}</p>
    </div>
  `);
  
  // Agregar al mapa
  map.addLayer(polygon);
  
  // Guardar referencia para futuras operaciones
  zonePolygons.set(zone.id, polygon);
}

function getZoneColor(zoneType: string): string {
  switch (zoneType) {
    case 'premium': return '#ff6b35';
    case 'restricted': return '#dc3545';
    default: return '#28a745';
  }
}

function getZoneFillColor(zoneType: string): string {
  switch (zoneType) {
    case 'premium': return '#ff6b35';
    case 'restricted': return '#dc3545';
    default: return '#28a745';
  }
}
```

#### Flujo completo integrado

```typescript
// Función principal que orquesta todo el flujo
async function handleZoneCreation(polygon: any, zoneConfig: any) {
  try {
    // 1. Preparar datos de la zona
    const zoneData = await createZoneFromPolygon(polygon, zoneConfig);
    
    // 2. Validar geometría
    const validation = await validateZoneGeometry(zoneData, zoneConfig.cityId);
    
    if (!validation.isValid) {
      throw new Error(`Invalid geometry: ${validation.errors.join(', ')}`);
    }
    
    // 3. Mostrar confirmación al usuario si hay warnings
    if (validation.warnings && validation.warnings.length > 0) {
      const confirmed = await showConfirmationDialog(
        'Advertencias detectadas',
        validation.warnings.join('\n') + '\n\n¿Desea continuar?'
      );
      
      if (!confirmed) {
        return;
      }
    }
    
    // 4. Crear la zona
    const newZone = await createServiceZone(zoneData);
    
    // 5. Actualizar mapa
    updateMapWithZone(newZone);
    
    // 6. Mostrar mensaje de éxito
    showSuccessMessage(`Zona "${newZone.name}" creada exitosamente`);
    
    return newZone;
  } catch (error) {
    console.error('Error in zone creation flow:', error);
    showErrorMessage(`Error al crear zona: ${error.message}`);
    throw error;
  }
}

// Función auxiliar para obtener token de autenticación
function getAuthToken(): string {
  return localStorage.getItem('authToken') || '';
}

// Función auxiliar para mostrar diálogo de confirmación
async function showConfirmationDialog(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Implementar según tu UI framework (React, Vue, etc.)
    const confirmed = confirm(`${title}\n\n${message}`);
    resolve(confirmed);
  });
}

// Funciones auxiliares para mostrar mensajes
function showSuccessMessage(message: string) {
  console.log('Success:', message);
  // Implementar toast/notification según tu UI framework
}

function showErrorMessage(message: string) {
  console.error('Error:', message);
  // Implementar toast/notification según tu UI framework
}
```

#### Manejo de errores y validaciones

```typescript
// Función para manejar errores de la API
function handleApiError(error: any) {
  if (error.status === 400) {
    return 'Datos inválidos. Verifique la información ingresada.';
  } else if (error.status === 404) {
    return 'Ciudad no encontrada.';
  } else if (error.status === 409) {
    return 'Conflicto: La zona se solapa con una existente o ya existe.';
  } else if (error.status === 401) {
    return 'No autorizado. Inicie sesión nuevamente.';
  } else {
    return 'Error del servidor. Intente nuevamente.';
  }
}

// Función para validar datos antes de enviar
function validateZoneData(zoneData: any): string[] {
  const errors: string[] = [];
  
  if (!zoneData.name || zoneData.name.trim().length === 0) {
    errors.push('El nombre de la zona es requerido');
  }
  
  if (!zoneData.cityId) {
    errors.push('La ciudad es requerida');
  }
  
  if (!zoneData.zoneType || !['regular', 'premium', 'restricted'].includes(zoneData.zoneType)) {
    errors.push('Tipo de zona inválido');
  }
  
  if (!zoneData.boundaries || !zoneData.boundaries.coordinates) {
    errors.push('Geometría de la zona es requerida');
  }
  
  if (zoneData.pricingMultiplier && (zoneData.pricingMultiplier < 0.5 || zoneData.pricingMultiplier > 10)) {
    errors.push('Multiplicador de pricing debe estar entre 0.5 y 10');
  }
  
  if (zoneData.demandMultiplier && (zoneData.demandMultiplier < 0.5 || zoneData.demandMultiplier > 10)) {
    errors.push('Multiplicador de demanda debe estar entre 0.5 y 10');
  }
  
  return errors;
}
```

---

### 📚 EJEMPLOS CON BIBLIOTECAS DE MAPAS

Esta sección proporciona ejemplos específicos de cómo implementar el dibujo de zonas usando las bibliotecas de mapas más populares.

#### Usando Leaflet

Leaflet es una biblioteca de mapas open source muy popular y ligera.

```javascript
// Configuración inicial del mapa
const map = L.map('map').setView([34.0522, -118.2437], 13);

// Agregar capa de tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Configurar herramientas de dibujo
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

const drawControl = new L.Control.Draw({
  draw: {
    polygon: {
      allowIntersection: false,
      showArea: true,
      drawError: {
        color: '#e1e100',
        message: '<strong>Error:</strong> El polígono no puede intersectarse consigo mismo!'
      },
      shapeOptions: {
        color: '#bada55'
      }
    },
    circle: false,
    marker: false,
    polyline: false,
    rectangle: false,
    circlemarker: false
  },
  edit: {
    featureGroup: drawnItems,
    remove: true
  }
});

map.addControl(drawControl);

// Evento cuando se crea un polígono
map.on(L.Draw.Event.CREATED, function (event) {
  const layer = event.layer;
  const geoJSON = layer.toGeoJSON();
  
  // Agregar a la capa de elementos dibujados
  drawnItems.addLayer(layer);
  
  // Procesar el polígono creado
  handlePolygonCreated(geoJSON.geometry);
});

// Evento cuando se edita un polígono
map.on(L.Draw.Event.EDITED, function (event) {
  const layers = event.layers;
  layers.eachLayer(function (layer) {
    const geoJSON = layer.toGeoJSON();
    handlePolygonEdited(geoJSON.geometry, layer);
  });
});

// Función para manejar polígono creado
function handlePolygonCreated(geometry) {
  // Mostrar formulario para configurar la zona
  showZoneConfigurationForm(geometry);
}

// Función para mostrar formulario de configuración
function showZoneConfigurationForm(geometry) {
  const form = document.createElement('div');
  form.innerHTML = `
    <div class="zone-config-form">
      <h3>Configurar Nueva Zona</h3>
      <input type="text" id="zoneName" placeholder="Nombre de la zona" required>
      <select id="zoneType" required>
        <option value="regular">Regular</option>
        <option value="premium">Premium</option>
        <option value="restricted">Restricted</option>
      </select>
      <input type="number" id="pricingMultiplier" placeholder="Multiplicador de pricing" min="0.5" max="10" step="0.1" value="1.0">
      <input type="number" id="demandMultiplier" placeholder="Multiplicador de demanda" min="0.5" max="10" step="0.1" value="1.0">
      <input type="number" id="maxDrivers" placeholder="Máximo conductores" min="1">
      <input type="number" id="minDrivers" placeholder="Mínimo conductores" min="0">
      <button onclick="createZoneFromForm()">Crear Zona</button>
      <button onclick="cancelZoneCreation()">Cancelar</button>
    </div>
  `;
  
  document.body.appendChild(form);
}

// Función para crear zona desde formulario
async function createZoneFromForm() {
  const zoneConfig = {
    name: document.getElementById('zoneName').value,
    zoneType: document.getElementById('zoneType').value,
    pricingMultiplier: parseFloat(document.getElementById('pricingMultiplier').value),
    demandMultiplier: parseFloat(document.getElementById('demandMultiplier').value),
    maxDrivers: parseInt(document.getElementById('maxDrivers').value),
    minDrivers: parseInt(document.getElementById('minDrivers').value),
    cityId: getCurrentCityId() // Función para obtener ID de ciudad actual
  };
  
  try {
    const newZone = await handleZoneCreation(currentPolygon, zoneConfig);
    console.log('Zona creada:', newZone);
    closeZoneConfigurationForm();
  } catch (error) {
    console.error('Error creando zona:', error);
    alert('Error al crear zona: ' + error.message);
  }
}

// Variable para almacenar el polígono actual
let currentPolygon = null;

function handlePolygonCreated(geometry) {
  currentPolygon = geometry;
  showZoneConfigurationForm(geometry);
}

function closeZoneConfigurationForm() {
  const form = document.querySelector('.zone-config-form');
  if (form) {
    form.remove();
  }
  currentPolygon = null;
}

function cancelZoneCreation() {
  // Remover el polígono dibujado
  drawnItems.clearLayers();
  closeZoneConfigurationForm();
}
```

#### Usando Mapbox GL

Mapbox GL es una biblioteca moderna que utiliza WebGL para renderizado de mapas.

```javascript
// Configuración inicial del mapa
mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [-118.2437, 34.0522],
  zoom: 13
});

// Agregar control de dibujo
const draw = new MapboxDraw({
  displayControlsDefault: false,
  controls: {
    polygon: true,
    trash: true
  },
  defaultMode: 'draw_polygon',
  styles: [
    {
      'id': 'gl-draw-polygon-fill-inactive',
      'type': 'fill',
      'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'paint': {
        'fill-color': '#3fb1ce',
        'fill-outline-color': '#3fb1ce',
        'fill-opacity': 0.1
      }
    },
    {
      'id': 'gl-draw-polygon-stroke-inactive',
      'type': 'line',
      'filter': ['all', ['==', 'active', 'false'], ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      'layout': {
        'line-cap': 'round',
        'line-join': 'round'
      },
      'paint': {
        'line-color': '#3fb1ce',
        'line-width': 2
      }
    }
  ]
});

map.addControl(draw);

// Evento cuando se crea un polígono
map.on('draw.create', function(e) {
  const data = draw.getAll();
  const polygon = data.features[0].geometry;
  
  // Procesar el polígono creado
  handlePolygonCreated(polygon);
});

// Evento cuando se actualiza un polígono
map.on('draw.update', function(e) {
  const data = draw.getAll();
  const polygon = data.features[0].geometry;
  
  // Procesar el polígono actualizado
  handlePolygonUpdated(polygon);
});

// Función para manejar polígono creado
function handlePolygonCreated(geometry) {
  // Mostrar modal de configuración
  showMapboxZoneModal(geometry);
}

// Función para mostrar modal de configuración
function showMapboxZoneModal(geometry) {
  const modal = document.createElement('div');
  modal.className = 'mapbox-zone-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-header">
        <h3>Configurar Nueva Zona</h3>
        <span class="close" onclick="closeMapboxModal()">&times;</span>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label>Nombre de la zona:</label>
          <input type="text" id="mapboxZoneName" placeholder="Ej: Centro Premium" required>
        </div>
        <div class="form-group">
          <label>Tipo de zona:</label>
          <select id="mapboxZoneType" required>
            <option value="regular">Regular</option>
            <option value="premium">Premium</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Multiplicador de pricing:</label>
            <input type="number" id="mapboxPricingMultiplier" min="0.5" max="10" step="0.1" value="1.0">
          </div>
          <div class="form-group">
            <label>Multiplicador de demanda:</label>
            <input type="number" id="mapboxDemandMultiplier" min="0.5" max="10" step="0.1" value="1.0">
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Máximo conductores:</label>
            <input type="number" id="mapboxMaxDrivers" min="1">
          </div>
          <div class="form-group">
            <label>Mínimo conductores:</label>
            <input type="number" id="mapboxMinDrivers" min="0">
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="createMapboxZone()">Crear Zona</button>
        <button class="btn btn-secondary" onclick="cancelMapboxZone()">Cancelar</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// Función para crear zona desde modal de Mapbox
async function createMapboxZone() {
  const zoneConfig = {
    name: document.getElementById('mapboxZoneName').value,
    zoneType: document.getElementById('mapboxZoneType').value,
    pricingMultiplier: parseFloat(document.getElementById('mapboxPricingMultiplier').value),
    demandMultiplier: parseFloat(document.getElementById('mapboxDemandMultiplier').value),
    maxDrivers: parseInt(document.getElementById('mapboxMaxDrivers').value),
    minDrivers: parseInt(document.getElementById('mapboxMinDrivers').value),
    cityId: getCurrentCityId()
  };
  
  try {
    const newZone = await handleZoneCreation(currentMapboxPolygon, zoneConfig);
    console.log('Zona creada:', newZone);
    closeMapboxModal();
    draw.deleteAll(); // Limpiar dibujo
  } catch (error) {
    console.error('Error creando zona:', error);
    alert('Error al crear zona: ' + error.message);
  }
}

// Variable para almacenar el polígono actual de Mapbox
let currentMapboxPolygon = null;

function handlePolygonCreated(geometry) {
  currentMapboxPolygon = geometry;
  showMapboxZoneModal(geometry);
}

function closeMapboxModal() {
  const modal = document.querySelector('.mapbox-zone-modal');
  if (modal) {
    modal.remove();
  }
  currentMapboxPolygon = null;
}

function cancelMapboxZone() {
  draw.deleteAll();
  closeMapboxModal();
}
```

#### Usando Google Maps

Google Maps es una de las bibliotecas de mapas más utilizadas.

```javascript
// Configuración inicial del mapa
function initGoogleMap() {
  const map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 34.0522, lng: -118.2437 },
    zoom: 13
  });

  // Configurar herramientas de dibujo
  const drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: [google.maps.drawing.OverlayType.POLYGON]
    },
    polygonOptions: {
      fillColor: '#3fb1ce',
      fillOpacity: 0.1,
      strokeColor: '#3fb1ce',
      strokeWeight: 2,
      clickable: false,
      editable: true,
      zIndex: 1
    }
  });

  drawingManager.setMap(map);

  // Evento cuando se completa el dibujo
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
    // Convertir a GeoJSON
    const geoJSON = googleMapsPolygonToGeoJSON(polygon);
    
    // Procesar el polígono creado
    handleGoogleMapsPolygonCreated(geoJSON, polygon);
  });
}

// Función para convertir polígono de Google Maps a GeoJSON
function googleMapsPolygonToGeoJSON(polygon) {
  const path = polygon.getPath();
  const coordinates = [];
  
  for (let i = 0; i < path.getLength(); i++) {
    const point = path.getAt(i);
    coordinates.push([point.lng(), point.lat()]);
  }
  
  // Cerrar el polígono
  coordinates.push(coordinates[0]);
  
  return {
    type: 'Polygon',
    coordinates: [coordinates]
  };
}

// Función para manejar polígono creado en Google Maps
function handleGoogleMapsPolygonCreated(geoJSON, polygon) {
  // Mostrar formulario de configuración
  showGoogleMapsZoneForm(geoJSON, polygon);
}

// Función para mostrar formulario de configuración
function showGoogleMapsZoneForm(geoJSON, polygon) {
  const form = document.createElement('div');
  form.className = 'google-maps-zone-form';
  form.innerHTML = `
    <div class="form-container">
      <h3>Configurar Nueva Zona</h3>
      <form id="googleMapsZoneForm">
        <div class="form-group">
          <label>Nombre de la zona:</label>
          <input type="text" id="googleZoneName" required>
        </div>
        <div class="form-group">
          <label>Tipo de zona:</label>
          <select id="googleZoneType" required>
            <option value="regular">Regular</option>
            <option value="premium">Premium</option>
            <option value="restricted">Restricted</option>
          </select>
        </div>
        <div class="form-group">
          <label>Multiplicador de pricing:</label>
          <input type="number" id="googlePricingMultiplier" min="0.5" max="10" step="0.1" value="1.0">
        </div>
        <div class="form-group">
          <label>Multiplicador de demanda:</label>
          <input type="number" id="googleDemandMultiplier" min="0.5" max="10" step="0.1" value="1.0">
        </div>
        <div class="form-group">
          <label>Máximo conductores:</label>
          <input type="number" id="googleMaxDrivers" min="1">
        </div>
        <div class="form-group">
          <label>Mínimo conductores:</label>
          <input type="number" id="googleMinDrivers" min="0">
        </div>
        <div class="form-actions">
          <button type="button" onclick="createGoogleMapsZone()">Crear Zona</button>
          <button type="button" onclick="cancelGoogleMapsZone()">Cancelar</button>
        </div>
      </form>
    </div>
  `;
  
  document.body.appendChild(form);
}

// Función para crear zona desde formulario de Google Maps
async function createGoogleMapsZone() {
  const zoneConfig = {
    name: document.getElementById('googleZoneName').value,
    zoneType: document.getElementById('googleZoneType').value,
    pricingMultiplier: parseFloat(document.getElementById('googlePricingMultiplier').value),
    demandMultiplier: parseFloat(document.getElementById('googleDemandMultiplier').value),
    maxDrivers: parseInt(document.getElementById('googleMaxDrivers').value),
    minDrivers: parseInt(document.getElementById('googleMinDrivers').value),
    cityId: getCurrentCityId()
  };
  
  try {
    const newZone = await handleZoneCreation(currentGooglePolygon, zoneConfig);
    console.log('Zona creada:', newZone);
    closeGoogleMapsForm();
    
    // Agregar la zona al mapa con estilo personalizado
    addGoogleMapsZoneToMap(newZone);
  } catch (error) {
    console.error('Error creando zona:', error);
    alert('Error al crear zona: ' + error.message);
  }
}

// Función para agregar zona al mapa de Google Maps
function addGoogleMapsZoneToMap(zone) {
  const coordinates = zone.boundaries.coordinates[0].map(coord => ({
    lat: coord[1],
    lng: coord[0]
  }));
  
  const polygon = new google.maps.Polygon({
    paths: coordinates,
    strokeColor: getZoneColor(zone.zoneType),
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: getZoneColor(zone.zoneType),
    fillOpacity: 0.3
  });
  
  // Agregar información al polígono
  const infoWindow = new google.maps.InfoWindow({
    content: `
      <div>
        <h4>${zone.name}</h4>
        <p><strong>Tipo:</strong> ${zone.zoneType}</p>
        <p><strong>Pricing:</strong> ${zone.pricingMultiplier}x</p>
        <p><strong>Demand:</strong> ${zone.demandMultiplier}x</p>
        <p><strong>Estado:</strong> ${zone.isActive ? 'Activo' : 'Inactivo'}</p>
      </div>
    `
  });
  
  polygon.addListener('click', function() {
    infoWindow.setPosition(polygon.getCenter());
    infoWindow.open(map);
  });
  
  polygon.setMap(map);
  
  // Guardar referencia
  if (!window.googleMapsZones) {
    window.googleMapsZones = new Map();
  }
  window.googleMapsZones.set(zone.id, polygon);
}

// Variables globales para Google Maps
let currentGooglePolygon = null;
let currentGooglePolygonObject = null;

function handleGoogleMapsPolygonCreated(geoJSON, polygon) {
  currentGooglePolygon = geoJSON;
  currentGooglePolygonObject = polygon;
  showGoogleMapsZoneForm(geoJSON, polygon);
}

function closeGoogleMapsForm() {
  const form = document.querySelector('.google-maps-zone-form');
  if (form) {
    form.remove();
  }
  
  // Remover polígono temporal
  if (currentGooglePolygonObject) {
    currentGooglePolygonObject.setMap(null);
  }
  
  currentGooglePolygon = null;
  currentGooglePolygonObject = null;
}

function cancelGoogleMapsZone() {
  closeGoogleMapsForm();
}
```

#### Estilos CSS para los formularios

```css
/* Estilos para formularios de configuración de zonas */
.zone-config-form,
.mapbox-zone-modal,
.google-maps-zone-form {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  min-width: 400px;
}

.mapbox-zone-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.close {
  font-size: 24px;
  cursor: pointer;
  color: #999;
}

.close:hover {
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions,
.modal-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
```

---

### 💡 CASOS DE USO PRÁCTICOS

Esta sección presenta escenarios reales de negocio donde las zonas de servicio son fundamentales para optimizar la operación.

#### 1. Crear zona de aeropuerto con restricciones

**Escenario:** Aeropuerto internacional con alta demanda, restricciones de acceso y pricing premium.

```typescript
async function createAirportZone() {
  const airportZone = {
    name: "Aeropuerto Internacional LAX",
    cityId: 1, // Los Angeles
    zoneType: "restricted",
    boundaries: {
      type: "Polygon",
      coordinates: [[
        [-118.4081, 33.9425],
        [-118.4071, 33.9425],
        [-118.4071, 33.9415],
        [-118.4081, 33.9415],
        [-118.4081, 33.9425]
      ]]
    },
    centerLat: 33.9420,
    centerLng: -118.4076,
    pricingMultiplier: 2.5, // 150% más caro
    demandMultiplier: 3.0,   // Alta demanda
    maxDrivers: 100,         // Límite alto para aeropuerto
    minDrivers: 20,          // Mínimo para garantizar servicio
    isActive: true,
    peakHours: {
      weekdays: ["05:00-09:00", "15:00-19:00", "21:00-23:00"],
      weekends: ["06:00-10:00", "14:00-18:00", "20:00-24:00"]
    }
  };

  try {
    const newZone = await createServiceZone(airportZone);
    console.log('Zona de aeropuerto creada:', newZone);
    
    // Configurar reglas temporales específicas para aeropuerto
    await createAirportTemporalRules(newZone.id);
    
    return newZone;
  } catch (error) {
    console.error('Error creando zona de aeropuerto:', error);
    throw error;
  }
}

async function createAirportTemporalRules(zoneId: number) {
  const temporalRules = [
    {
      name: "Horario Pico Aeropuerto - Mañana",
      ruleType: "TIME_RANGE",
      timeStart: "05:00",
      timeEnd: "09:00",
      multiplier: 1.5,
      priority: 10,
      zoneId: zoneId,
      isActive: true
    },
    {
      name: "Horario Pico Aeropuerto - Tarde",
      ruleType: "TIME_RANGE", 
      timeStart: "15:00",
      timeEnd: "19:00",
      multiplier: 1.5,
      priority: 10,
      zoneId: zoneId,
      isActive: true
    }
  ];

  for (const rule of temporalRules) {
    await createTemporalPricingRule(rule);
  }
}
```

#### 2. Gestionar zonas premium en centro de ciudad

**Escenario:** Centro financiero con alta demanda y pricing premium durante horarios comerciales.

```typescript
async function createDowntownPremiumZone() {
  const downtownZone = {
    name: "Centro Financiero Premium",
    cityId: 1,
    zoneType: "premium",
    boundaries: {
      type: "Polygon",
      coordinates: [[
        [-118.2500, 34.0500],
        [-118.2400, 34.0500],
        [-118.2400, 34.0400],
        [-118.2500, 34.0400],
        [-118.2500, 34.0500]
      ]]
    },
    centerLat: 34.0450,
    centerLng: -118.2450,
    pricingMultiplier: 1.8,
    demandMultiplier: 2.2,
    maxDrivers: 75,
    minDrivers: 15,
    isActive: true,
    peakHours: {
      weekdays: ["07:00-09:00", "17:00-19:00"],
      weekends: ["10:00-22:00"]
    }
  };

  try {
    const newZone = await createServiceZone(downtownZone);
    
    // Crear reglas temporales para horarios comerciales
    await createBusinessHoursRules(newZone.id);
    
    return newZone;
  } catch (error) {
    console.error('Error creando zona premium:', error);
    throw error;
  }
}

async function createBusinessHoursRules(zoneId: number) {
  const businessRules = [
    {
      name: "Horario Comercial - Mañana",
      ruleType: "TIME_RANGE",
      timeStart: "07:00",
      timeEnd: "09:00",
      multiplier: 1.3,
      priority: 8,
      zoneId: zoneId,
      isActive: true
    },
    {
      name: "Horario Comercial - Tarde",
      ruleType: "TIME_RANGE",
      timeStart: "17:00", 
      timeEnd: "19:00",
      multiplier: 1.3,
      priority: 8,
      zoneId: zoneId,
      isActive: true
    }
  ];

  for (const rule of businessRules) {
    await createTemporalPricingRule(rule);
  }
}
```

#### 3. Análisis de cobertura de ciudad

**Escenario:** Analizar la cobertura actual de zonas y identificar áreas sin servicio.

```typescript
async function analyzeCityCoverage(cityId: number) {
  try {
    // Obtener análisis de cobertura
    const coverageAnalysis = await fetch(`/admin/geography/service-zones/coverage-analysis/city/${cityId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const analysis = await coverageAnalysis.json();
    
    console.log('Análisis de cobertura:', analysis);
    
    // Procesar recomendaciones
    if (analysis.issues && analysis.issues.length > 0) {
      console.warn('Problemas detectados:', analysis.issues);
      
      // Mostrar recomendaciones al usuario
      analysis.recommendations.forEach(recommendation => {
        console.log('Recomendación:', recommendation);
      });
    }
    
    // Si hay área sin cobertura, sugerir crear nueva zona
    if (analysis.uncoveredArea > 10) { // Más de 10% sin cobertura
      console.log(`Área sin cobertura: ${analysis.uncoveredArea}%`);
      console.log('Considerar crear nuevas zonas para mejorar cobertura');
    }
    
    return analysis;
  } catch (error) {
    console.error('Error analizando cobertura:', error);
    throw error;
  }
}

// Función para visualizar análisis en el mapa
function visualizeCoverageAnalysis(analysis: any) {
  // Crear capa de visualización de cobertura
  const coverageLayer = {
    id: 'coverage-analysis',
    type: 'fill',
    source: {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {
              coverage: analysis.totalCoverage,
              uncovered: analysis.uncoveredArea,
              overlapping: analysis.overlappingArea
            },
            geometry: {
              type: 'Polygon',
              coordinates: [/* coordenadas de la ciudad */]
            }
          }
        ]
      }
    },
    paint: {
      'fill-color': [
        'interpolate',
        ['linear'],
        ['get', 'coverage'],
        0, '#ff0000',    // Rojo para sin cobertura
        50, '#ffff00',   // Amarillo para cobertura parcial
        100, '#00ff00'   // Verde para cobertura completa
      ],
      'fill-opacity': 0.3
    }
  };
  
  map.addLayer(coverageLayer);
}
```

#### 4. Actualizar múltiples zonas simultáneamente

**Escenario:** Ajustar pricing de todas las zonas premium de una ciudad por temporada alta.

```typescript
async function updatePremiumZonesForHighSeason(cityId: number) {
  try {
    // Actualización masiva de zonas premium
    const bulkUpdate = {
      cityId: cityId,
      zoneType: "premium",
      adjustmentType: "percentage",
      adjustmentValue: 20, // Aumentar 20%
      field: "pricingMultiplier"
    };

    const response = await fetch('/admin/geography/service-zones/bulk-update-pricing', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bulkUpdate)
    });

    const result = await response.json();
    
    console.log('Actualización masiva completada:', result);
    console.log(`Zonas actualizadas: ${result.successful}/${result.totalProcessed}`);
    
    // Mostrar resultados al usuario
    if (result.failed > 0) {
      console.warn(`${result.failed} zonas no pudieron ser actualizadas`);
      result.results.forEach(r => {
        if (!r.success) {
          console.error(`Zona ${r.zoneId}: ${r.error}`);
        }
      });
    }
    
    return result;
  } catch (error) {
    console.error('Error en actualización masiva:', error);
    throw error;
  }
}

// Función para validar antes de actualización masiva
async function validateBulkUpdate(updateConfig: any) {
  try {
    // Obtener estadísticas actuales
    const stats = await fetch('/admin/geography/service-zones/pricing/stats', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const currentStats = await stats.json();
    
    // Calcular impacto de la actualización
    const impact = calculateUpdateImpact(updateConfig, currentStats);
    
    console.log('Impacto de la actualización:', impact);
    
    // Mostrar advertencias si es necesario
    if (impact.maxPricingMultiplier > 5.0) {
      console.warn('Advertencia: Algunas zonas tendrán multiplicadores muy altos');
    }
    
    if (impact.affectedZones > 10) {
      console.warn('Advertencia: Muchas zonas serán afectadas');
    }
    
    return impact;
  } catch (error) {
    console.error('Error validando actualización:', error);
    throw error;
  }
}

function calculateUpdateImpact(updateConfig: any, currentStats: any) {
  const { adjustmentType, adjustmentValue, field } = updateConfig;
  
  let newMaxValue: number;
  let newMinValue: number;
  
  if (adjustmentType === 'percentage') {
    newMaxValue = currentStats.highestPricingMultiplier * (1 + adjustmentValue / 100);
    newMinValue = currentStats.lowestPricingMultiplier * (1 + adjustmentValue / 100);
  } else {
    newMaxValue = currentStats.highestPricingMultiplier + adjustmentValue;
    newMinValue = currentStats.lowestPricingMultiplier + adjustmentValue;
  }
  
  return {
    maxPricingMultiplier: newMaxValue,
    minPricingMultiplier: newMinValue,
    affectedZones: currentStats.zonesByType.premium || 0,
    averageIncrease: adjustmentType === 'percentage' ? adjustmentValue : 
      (adjustmentValue / currentStats.averagePricingMultiplier) * 100
  };
}
```

#### 5. Crear zona de evento especial

**Escenario:** Zona temporal para un evento masivo (concierto, festival, etc.) con pricing dinámico.

```typescript
async function createEventZone(eventDetails: any) {
  const eventZone = {
    name: `Zona Evento: ${eventDetails.name}`,
    cityId: eventDetails.cityId,
    zoneType: "premium",
    boundaries: eventDetails.boundaries, // GeoJSON del área del evento
    centerLat: eventDetails.centerLat,
    centerLng: eventDetails.centerLng,
    pricingMultiplier: 2.0, // Doble precio por alta demanda
    demandMultiplier: 3.0,  // Muy alta demanda
    maxDrivers: eventDetails.expectedAttendance / 50, // 1 conductor por 50 personas
    minDrivers: 10,
    isActive: true,
    peakHours: {
      weekdays: eventDetails.eventHours,
      weekends: eventDetails.eventHours
    }
  };

  try {
    const newZone = await createServiceZone(eventZone);
    
    // Crear reglas temporales específicas para el evento
    await createEventTemporalRules(newZone.id, eventDetails);
    
    // Programar desactivación automática después del evento
    scheduleZoneDeactivation(newZone.id, eventDetails.endDate);
    
    return newZone;
  } catch (error) {
    console.error('Error creando zona de evento:', error);
    throw error;
  }
}

async function createEventTemporalRules(zoneId: number, eventDetails: any) {
  const eventRules = [
    {
      name: `Pre-Evento: ${eventDetails.name}`,
      ruleType: "DATE_RANGE",
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate,
      timeStart: "00:00",
      timeEnd: "23:59",
      multiplier: 1.5,
      priority: 15,
      zoneId: zoneId,
      isActive: true
    },
    {
      name: `Durante Evento: ${eventDetails.name}`,
      ruleType: "DATE_RANGE",
      startDate: eventDetails.startDate,
      endDate: eventDetails.endDate,
      timeStart: eventDetails.eventStartTime,
      timeEnd: eventDetails.eventEndTime,
      multiplier: 2.5,
      priority: 20,
      zoneId: zoneId,
      isActive: true
    }
  ];

  for (const rule of eventRules) {
    await createTemporalPricingRule(rule);
  }
}

function scheduleZoneDeactivation(zoneId: number, endDate: string) {
  const endDateTime = new Date(endDate);
  const now = new Date();
  const timeUntilEnd = endDateTime.getTime() - now.getTime();
  
  if (timeUntilEnd > 0) {
    setTimeout(async () => {
      try {
        await fetch(`/admin/geography/service-zones/${zoneId}/toggle-status`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        console.log(`Zona ${zoneId} desactivada automáticamente después del evento`);
      } catch (error) {
        console.error('Error desactivando zona automáticamente:', error);
      }
    }, timeUntilEnd);
  }
}
```

#### 6. Gestión de zonas residenciales

**Escenario:** Crear y gestionar zonas residenciales con pricing diferenciado por horarios.

```typescript
async function createResidentialZone(residentialData: any) {
  const residentialZone = {
    name: `Zona Residencial: ${residentialData.neighborhood}`,
    cityId: residentialData.cityId,
    zoneType: "regular",
    boundaries: residentialData.boundaries,
    centerLat: residentialData.centerLat,
    centerLng: residentialData.centerLng,
    pricingMultiplier: 0.9, // 10% más barato que zonas comerciales
    demandMultiplier: 1.2,  // Demanda moderada
    maxDrivers: residentialData.population / 100, // 1 conductor por 100 habitantes
    minDrivers: 5,
    isActive: true,
    peakHours: {
      weekdays: ["07:00-09:00", "17:00-19:00"], // Horarios de trabajo
      weekends: ["10:00-12:00", "18:00-22:00"]  // Horarios de ocio
    }
  };

  try {
    const newZone = await createServiceZone(residentialZone);
    
    // Crear reglas temporales para horarios residenciales
    await createResidentialTemporalRules(newZone.id, residentialData);
    
    return newZone;
  } catch (error) {
    console.error('Error creando zona residencial:', error);
    throw error;
  }
}

async function createResidentialTemporalRules(zoneId: number, residentialData: any) {
  const residentialRules = [
    {
      name: "Horario Residencial - Mañana",
      ruleType: "TIME_RANGE",
      timeStart: "07:00",
      timeEnd: "09:00",
      multiplier: 1.1, // Ligeramente más caro en horario pico
      priority: 5,
      zoneId: zoneId,
      isActive: true
    },
    {
      name: "Horario Residencial - Tarde",
      ruleType: "TIME_RANGE",
      timeStart: "17:00",
      timeEnd: "19:00", 
      multiplier: 1.1,
      priority: 5,
      zoneId: zoneId,
      isActive: true
    },
    {
      name: "Horario Residencial - Noche",
      ruleType: "TIME_RANGE",
      timeStart: "22:00",
      timeEnd: "06:00",
      multiplier: 0.8, // Más barato en horario nocturno
      priority: 3,
      zoneId: zoneId,
      isActive: true
    }
  ];

  for (const rule of residentialRules) {
    await createTemporalPricingRule(rule);
  }
}

// Función para analizar patrones de uso en zonas residenciales
async function analyzeResidentialZoneUsage(zoneId: number, days: number = 30) {
  try {
    // Obtener estadísticas de uso de la zona
    const usageStats = await fetch(`/admin/analytics/zone-usage/${zoneId}?days=${days}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const stats = await usageStats.json();
    
    // Analizar patrones
    const patterns = {
      peakHours: findPeakHours(stats.hourlyUsage),
      averageDemand: calculateAverageDemand(stats.dailyUsage),
      recommendations: generateResidentialRecommendations(stats)
    };
    
    console.log('Patrones de uso residencial:', patterns);
    
    return patterns;
  } catch (error) {
    console.error('Error analizando uso residencial:', error);
    throw error;
  }
}

function findPeakHours(hourlyUsage: any[]) {
  return hourlyUsage
    .sort((a, b) => b.rides - a.rides)
    .slice(0, 3)
    .map(hour => hour.hour);
}

function calculateAverageDemand(dailyUsage: any[]) {
  const totalRides = dailyUsage.reduce((sum, day) => sum + day.rides, 0);
  return totalRides / dailyUsage.length;
}

function generateResidentialRecommendations(stats: any) {
  const recommendations = [];
  
  if (stats.averageDemand > 50) {
    recommendations.push("Considerar aumentar multiplicador de demanda");
  }
  
  if (stats.peakHours.includes('22') || stats.peakHours.includes('23')) {
    recommendations.push("Ajustar reglas nocturnas para horarios pico tardíos");
  }
  
  return recommendations;
}
```

#### 7. Monitoreo y alertas de zonas

**Escenario:** Sistema de monitoreo automático para detectar problemas en zonas.

```typescript
// Función para monitorear estado de todas las zonas
async function monitorAllZones() {
  try {
    // Obtener todas las zonas activas
    const zones = await fetch('/admin/geography/service-zones?isActive=true', {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const zonesData = await zones.json();
    
    // Monitorear cada zona
    const alerts = [];
    
    for (const zone of zonesData.zones) {
      const zoneAlerts = await monitorZone(zone);
      alerts.push(...zoneAlerts);
    }
    
    // Procesar alertas
    if (alerts.length > 0) {
      await processAlerts(alerts);
    }
    
    return alerts;
  } catch (error) {
    console.error('Error monitoreando zonas:', error);
    throw error;
  }
}

async function monitorZone(zone: any) {
  const alerts = [];
  
  try {
    // Verificar si la zona tiene suficientes conductores
    const driverCount = await getZoneDriverCount(zone.id);
    
    if (driverCount < zone.minDrivers) {
      alerts.push({
        type: 'LOW_DRIVERS',
        zoneId: zone.id,
        zoneName: zone.name,
        message: `Zona ${zone.name} tiene solo ${driverCount} conductores (mínimo: ${zone.minDrivers})`,
        severity: 'HIGH',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar si la zona está sobrecargada
    if (driverCount > zone.maxDrivers) {
      alerts.push({
        type: 'OVERLOADED',
        zoneId: zone.id,
        zoneName: zone.name,
        message: `Zona ${zone.name} tiene ${driverCount} conductores (máximo: ${zone.maxDrivers})`,
        severity: 'MEDIUM',
        timestamp: new Date().toISOString()
      });
    }
    
    // Verificar pricing extremo
    if (zone.pricingMultiplier > 3.0) {
      alerts.push({
        type: 'HIGH_PRICING',
        zoneId: zone.id,
        zoneName: zone.name,
        message: `Zona ${zone.name} tiene pricing muy alto (${zone.pricingMultiplier}x)`,
        severity: 'MEDIUM',
        timestamp: new Date().toISOString()
      });
    }
    
    return alerts;
  } catch (error) {
    console.error(`Error monitoreando zona ${zone.id}:`, error);
    return [];
  }
}

async function processAlerts(alerts: any[]) {
  // Agrupar alertas por severidad
  const highSeverity = alerts.filter(a => a.severity === 'HIGH');
  const mediumSeverity = alerts.filter(a => a.severity === 'MEDIUM');
  
  // Enviar notificaciones
  if (highSeverity.length > 0) {
    await sendHighPriorityNotification(highSeverity);
  }
  
  if (mediumSeverity.length > 0) {
    await sendMediumPriorityNotification(mediumSeverity);
  }
  
  // Log de alertas
  console.log(`Procesadas ${alerts.length} alertas: ${highSeverity.length} alta prioridad, ${mediumSeverity.length} media prioridad`);
}

async function sendHighPriorityNotification(alerts: any[]) {
  // Implementar notificación de alta prioridad (email, SMS, etc.)
  console.log('ALERTA ALTA PRIORIDAD:', alerts);
}

async function sendMediumPriorityNotification(alerts: any[]) {
  // Implementar notificación de media prioridad
  console.log('Alerta media prioridad:', alerts);
}

// Función para obtener conteo de conductores en zona
async function getZoneDriverCount(zoneId: number) {
  try {
    const response = await fetch(`/admin/realtime/zone-drivers/${zoneId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    });
    
    const data = await response.json();
    return data.driverCount;
  } catch (error) {
    console.error('Error obteniendo conteo de conductores:', error);
    return 0;
  }
}
```

---

## 💰 GESTIÓN DE PRICING DE ZONAS

### Actualización masiva de pricing

**MÉTODO:** `POST /admin/geography/service-zones/bulk-update-pricing`

**DESCRIPCIÓN:** Actualiza multiplicadores de pricing de múltiples zonas con filtros combinados.

**FILTROS DISPONIBLES:**
- Por IDs específicos de zonas
- Por ciudad (todas las zonas de una ciudad)
- Por tipo de zona (regular, premium, restricted)
- Combinación de filtros

**ENVÍO (Por IDs específicos):**
```json
{
  "zoneIds": [1, 2, 3],
  "adjustmentType": "percentage",
  "adjustmentValue": 15,
  "field": "pricingMultiplier"
}
```

**ENVÍO (Por ciudad y tipo):**

```json
{
  "cityId": 1,
  "zoneType": "premium",
  "adjustmentType": "fixed",
  "adjustmentValue": 0.5,
  "field": "demandMultiplier"
}
```

**RECIBE:**

```json
{
  "message": "Bulk pricing update completed",
  "results": [
    {
      "zoneId": 1,
      "success": true,
      "data": { /* zona actualizada */ }
    }
  ],
  "successful": 3,
  "failed": 0,
  "totalProcessed": 3
}
```

---

### Validar configuración de pricing

**MÉTODO:** `POST /admin/geography/service-zones/validate-pricing`

**DESCRIPCIÓN:** Valida multiplicadores antes de aplicarlos.

**ENVÍO:**

```json
{
  "pricingMultiplier": 1.8,
  "demandMultiplier": 2.0,
  "compareWithZoneId": 1
}
```

**RECIBE:**

```json
{
  "isValid": true,
  "errors": [],
  "warnings": ["Combined multiplier is very high, may reduce demand significantly"],
  "comparison": {
    "existingZone": {
      "id": 1,
      "name": "Downtown LA",
      "pricingMultiplier": 1.5,
      "demandMultiplier": 1.5
    },
    "differences": {
      "pricingMultiplier": 0.3,
      "demandMultiplier": 0.5
    },
    "competitiveness": "more_expensive"
  }
}
```

---

### Estadísticas de pricing

**MÉTODO:** `GET /admin/geography/service-zones/pricing/stats`

**DESCRIPCIÓN:** Obtiene estadísticas generales de pricing de todas las zonas.

**RECIBE:**

```json
{
  "totalZones": 25,
  "activeZones": 23,
  "averagePricingMultiplier": 1.35,
  "averageDemandMultiplier": 1.42,
  "highestPricingMultiplier": 2.5,
  "lowestPricingMultiplier": 0.8,
  "zonesByType": {
    "regular": 15,
    "premium": 8,
    "restricted": 2
  },
  "zonesByCity": [
    {
      "cityId": 1,
      "cityName": "Los Angeles",
      "totalZones": 12,
      "avgPricingMultiplier": 1.45
    }
  ]
}
```

---

### Ejemplos de uso práctico

**1. Aumentar precios en zonas premium de una ciudad:**

```bash
POST /admin/geography/service-zones/bulk-update-pricing
{
  "cityId": 1,
  "zoneType": "premium",
  "adjustmentType": "percentage",
  "adjustmentValue": 20,
  "field": "pricingMultiplier"
}
```

**2. Ajustar demanda en zonas específicas:**

```bash
POST /admin/geography/service-zones/bulk-update-pricing
{
  "zoneIds": [5, 8, 12],
  "adjustmentType": "fixed",
  "adjustmentValue": -0.3,
  "field": "demandMultiplier"
}
```

**3. Validar antes de aplicar cambios:**

```bash
POST /admin/geography/service-zones/validate-pricing
{
  "pricingMultiplier": 2.5,
  "demandMultiplier": 2.0,
  "compareWithZoneId": 1
}
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Jerarquía geográfica**: Los datos siguen una jerarquía estricta: País → Estado → Ciudad → Zona de Servicio

2. **Dependencias**: No se puede eliminar un elemento si tiene elementos hijos activos

3. **Coordenadas GPS**: Las coordenadas son críticas para el funcionamiento del sistema de matching y rutas

4. **Límites geográficos**: Los límites en formato GeoJSON son opcionales pero recomendados para zonas de servicio precisas

5. **Multiplicadores de precio**: Estos afectan directamente los cálculos de tarifa en tiempo real

6. **Importación masiva**: Los archivos CSV deben tener codificación UTF-8 y separadores de coma

7. **Zonas restringidas**: Las áreas marcadas como restringidas no permitirán operaciones de servicio

8. **Horarios de negocio**: Los países pueden tener configuraciones de horario que afectan la disponibilidad del servicio

9. **Verificación requerida**: Algunos países pueden requerir verificación adicional para usuarios o conductores

10. **Auditoría**: Todas las operaciones quedan registradas para seguimiento de cambios

11. **Optimización Máxima**: Los endpoints de listas paginadas retornan solo 6-8 campos esenciales para máxima velocidad y mínimo uso de recursos. Para información completa (configuraciones, límites geográficos, etc.), utiliza los endpoints de detalles por ID.

Esta documentación cubre todas las operaciones necesarias para gestionar la geografía desde el panel de administración.

