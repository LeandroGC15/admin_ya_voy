# Geography Module - API Endpoints Reference

Frontend reference documentation for Geography module endpoints (Countries, States, Cities, Zones).

## Common Types and Schemas

### PeakHoursConfig
Configuration for high-demand time periods that affect dynamic pricing and driver allocation algorithms.

**Purpose:**
- **Pricing Impact:** During peak hours, fares are multiplied by `pricingMultiplier` and `demandMultiplier`
- **Driver Allocation:** Systems can prioritize more drivers in zones during peak periods
- **Demand Forecasting:** Helps predict high-demand periods for better resource planning
- **User Experience:** Provides transparency about surge pricing periods

```typescript
interface PeakHoursConfig {
  weekdays: string[];  // Time ranges for weekdays: ["08:00-12:00", "14:00-18:00"]
  weekends: string[];  // Time ranges for weekends: ["10:00-20:00"]
}
```
**Time Format:** `HH:MM-HH:MM` (24-hour format, e.g., "08:00-18:00" means 8:00 AM to 6:00 PM)
**Examples:**
```typescript
// Morning and afternoon rush hours on weekdays
{
  weekdays: ["07:00-09:00", "17:00-19:00"],
  weekends: ["12:00-15:00", "18:00-22:00"]
}

// No peak hours configuration
null

// Empty configuration (same as null)
{
  weekdays: [],
  weekends: []
}
```
**Note:** Can be `null`, `undefined`, or a valid configuration object. Empty arrays mean no peak hours for that day type.

### Peak Hours Validation Rules
- **Time Format:** Each time range must follow `HH:MM-HH:MM` format (24-hour clock)
- **Valid Hours:** Hours must be between 00:00 and 23:59
- **Valid Minutes:** Minutes must be between 00 and 59
- **Range Logic:** Start time must be before end time
- **Frontend Validation:** Invalid time formats are rejected with descriptive error messages

## Countries Endpoints

### `GET /admin/geography/countries`

**Purpose:** List countries with pagination and filters

**Query Parameters:**
```typescript
interface CountriesQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  isActive?: boolean;
  search?: string;      // Search in name, code, or capital
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface CountriesListResponse {
  countries: Country[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Country {
  id: number;
  name: string;
  code: string;                    // ISO 3166-1 alpha-2 (e.g., "US", "MX")
  code3: string;                   // ISO 3166-1 alpha-3 (e.g., "USA", "MEX")
  capital?: string;
  currency?: string;               // ISO 4217 currency code
  currencySymbol?: string;
  phoneCode?: string;              // International dialing code
  flag?: string;                   // Flag emoji or URL
  region: string;                  // Continent/region
  subregion?: string;              // Sub-region
  languages: string[];             // Array of language codes
  timezones: string[];             // Array of timezone names
  latitude?: number;               // Centroid latitude
  longitude?: number;              // Centroid longitude
  area?: number;                   // Area in square kilometers
  population?: number;
  isActive: boolean;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/countries`

**Purpose:** Create a new country

**Request Body:**
```typescript
interface CreateCountryDto {
  name: string;                    // Required: 2-100 chars
  code: string;                    // Required: 2 chars, uppercase
  code3: string;                   // Required: 3 chars, uppercase
  capital?: string;                // Optional
  currency?: string;               // Optional: 3 chars
  currencySymbol?: string;         // Optional
  phoneCode?: string;              // Optional: e.g., "+1"
  flag?: string;                   // Optional: emoji or URL
  region: string;                  // Required: continent/region
  subregion?: string;              // Optional
  languages?: string[];            // Optional: language codes array
  timezones?: string[];            // Optional: timezone names array
  latitude?: number;               // Optional: -90 to 90
  longitude?: number;              // Optional: -180 to 180
  area?: number;                   // Optional: positive number
  population?: number;             // Optional: positive number
  isActive?: boolean;              // Optional, default: true
}
```

**Response:**
```typescript
interface CountryResponse extends Country {
  // Same as Country interface above
}
```

**Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/countries/:id`

**Purpose:** Get details of a specific country

**Path Parameters:**
```typescript
interface CountryPathParams {
  id: number;  // Country ID
}
```

**Response:**
```typescript
interface CountryResponse extends Country {
  // Same as Country interface above
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `PATCH /admin/geography/countries/:id`

**Purpose:** Update an existing country

**Path Parameters:**
```typescript
interface CountryPathParams {
  id: number;  // Country ID
}
```

**Request Body:**
```typescript
interface UpdateCountryDto {
  name?: string;                   // Optional: 2-100 chars
  code?: string;                   // Optional: 2 chars, uppercase
  code3?: string;                  // Optional: 3 chars, uppercase
  capital?: string;
  currency?: string;               // Optional: 3 chars
  currencySymbol?: string;
  phoneCode?: string;
  flag?: string;
  region?: string;
  subregion?: string;
  languages?: string[];
  timezones?: string[];
  latitude?: number;               // -90 to 90
  longitude?: number;              // -180 to 180
  area?: number;                   // Positive number
  population?: number;             // Positive number
  isActive?: boolean;
}
```

**Response:**
```typescript
interface CountryResponse extends Country {
  // Same as Country interface above
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `DELETE /admin/geography/countries/:id`

**Purpose:** Delete a country

**Path Parameters:**
```typescript
interface CountryPathParams {
  id: number;  // Country ID
}
```

**Response:** `204 No Content`

**Status Codes:** `200 OK`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/countries/active`

**Purpose:** Get all active countries

**Response:**
```typescript
interface ActiveCountriesResponse extends Array<Country> {
  // Array of active Country objects
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/countries/bulk-import`

**Purpose:** Bulk import countries from standard data

**Request Body:**
```typescript
interface BulkImportCountriesDto {
  countries: Array<{
    name: string;
    code: string;
    code3: string;
    capital?: string;
    currency?: string;
    currencySymbol?: string;
    phoneCode?: string;
    region: string;
    subregion?: string;
    languages?: string[];
    timezones?: string[];
    latitude?: number;
    longitude?: number;
    area?: number;
    population?: number;
  }>;
  updateExisting?: boolean;       // Default: false
  skipDuplicates?: boolean;       // Default: true
}
```

**Response:**
```typescript
interface BulkImportCountriesResponse {
  imported: number;        // Number of countries imported
  updated: number;         // Number of countries updated
  skipped: number;         // Number of countries skipped
  errors: Array<{          // Errors for failed imports
    index: number;
    country: string;
    error: string;
  }>;
  countries: Country[];    // Array of imported/updated countries
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

## States/Provinces Endpoints

### `GET /admin/geography/states`

**Purpose:** List states/provinces with pagination and filters

**Query Parameters:**
```typescript
interface StatesQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  countryId?: number;   // Filter by country
  isActive?: boolean;
  search?: string;      // Search in name or code
  sortBy?: 'name' | 'code' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface StatesListResponse {
  states: State[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface State {
  id: number;
  name: string;
  code: string;                    // State/province code
  countryId: number;
  country: {
    id: number;
    name: string;
    code: string;
  };
  type: 'state' | 'province' | 'territory' | 'region';
  capital?: string;
  latitude?: number;
  longitude?: number;
  area?: number;                   // Area in square kilometers
  population?: number;
  timezones: string[];
  isActive: boolean;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/states`

**Purpose:** Create a new state/province

**Request Body:**
```typescript
interface CreateStateDto {
  name: string;                    // Required: 2-100 chars
  code: string;                    // Required: 2-5 chars
  countryId: number;               // Required: valid country ID
  type?: 'state' | 'province' | 'territory' | 'region';  // Default: 'state'
  capital?: string;
  latitude?: number;               // -90 to 90
  longitude?: number;              // -180 to 180
  area?: number;                   // Positive number
  population?: number;             // Positive number
  timezones?: string[];            // Array of timezone names
  isActive?: boolean;              // Default: true
}
```

**Response:**
```typescript
interface StateResponse extends State {
  // Same as State interface above
}
```

**Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/states/:id`

**Purpose:** Get details of a specific state

**Path Parameters:**
```typescript
interface StatePathParams {
  id: number;  // State ID
}
```

**Response:**
```typescript
interface StateResponse extends State {
  // Same as State interface above
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `PATCH /admin/geography/states/:id`

**Purpose:** Update an existing state

**Path Parameters:**
```typescript
interface StatePathParams {
  id: number;  // State ID
}
```

**Request Body:**
```typescript
interface UpdateStateDto {
  name?: string;                   // 2-100 chars
  code?: string;                   // 2-5 chars
  countryId?: number;              // Valid country ID
  type?: 'state' | 'province' | 'territory' | 'region';
  capital?: string;
  latitude?: number;               // -90 to 90
  longitude?: number;              // -180 to 180
  area?: number;                   // Positive number
  population?: number;             // Positive number
  timezones?: string[];
  isActive?: boolean;
}
```

**Response:**
```typescript
interface StateResponse extends State {
  // Same as State interface above
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `DELETE /admin/geography/states/:id`

**Purpose:** Delete a state

**Path Parameters:**
```typescript
interface StatePathParams {
  id: number;  // State ID
}
```

**Response:** `204 No Content`

**Status Codes:** `200 OK`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/countries/:countryId/states`

**Purpose:** Get all states for a specific country

**Path Parameters:**
```typescript
interface CountryStatesParams {
  countryId: number;  // Country ID
}
```

**Query Parameters:**
```typescript
interface CountryStatesQueryParams {
  isActive?: boolean;
  type?: 'state' | 'province' | 'territory' | 'region';
}
```

**Response:**
```typescript
interface CountryStatesResponse extends Array<State> {
  // Array of State objects for the country
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

## Cities Endpoints

### `GET /admin/geography/cities`

**Purpose:** List cities with pagination and filters

**Query Parameters:**
```typescript
interface CitiesQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  countryId?: number;   // Filter by country
  stateId?: number;     // Filter by state
  isActive?: boolean;
  search?: string;      // Search in name
  sortBy?: 'name' | 'population' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface CitiesListResponse {
  cities: City[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface City {
  id: number;
  name: string;
  stateId: number;
  state: {
    id: number;
    name: string;
    code: string;
    country: {
      id: number;
      name: string;
      code: string;
    };
  };
  latitude: number;               // Required: -90 to 90
  longitude: number;              // Required: -180 to 180
  timezone: string;               // Required: timezone name
  population?: number;
  area?: number;                  // Area in square kilometers
  elevation?: number;             // Elevation in meters
  isCapital?: boolean;            // Is capital of state/country
  isActive: boolean;
  createdAt: string;              // ISO date string
  updatedAt: string;              // ISO date string
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/cities`

**Purpose:** Create a new city

**Request Body:**
```typescript
interface CreateCityDto {
  name: string;                    // Required: 2-100 chars
  stateId: number;                 // Required: valid state ID
  latitude: number;                // Required: -90 to 90
  longitude: number;               // Required: -180 to 180
  timezone: string;                // Required: valid timezone name
  population?: number;             // Optional: positive number
  area?: number;                   // Optional: positive number
  elevation?: number;              // Optional: elevation in meters
  isCapital?: boolean;             // Optional: default false
  isActive?: boolean;              // Optional: default true
}
```

**Response:**
```typescript
interface CityResponse extends City {
  // Same as City interface above
}
```

**Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/cities/:id`

**Purpose:** Get details of a specific city

**Path Parameters:**
```typescript
interface CityPathParams {
  id: number;  // City ID
}
```

**Response:**
```typescript
interface CityResponse extends City {
  // Same as City interface above
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `PATCH /admin/geography/cities/:id`

**Purpose:** Update an existing city

**Path Parameters:**
```typescript
interface CityPathParams {
  id: number;  // City ID
}
```

**Request Body:**
```typescript
interface UpdateCityDto {
  name?: string;                   // 2-100 chars
  stateId?: number;                // Valid state ID
  latitude?: number;               // -90 to 90
  longitude?: number;              // -180 to 180
  timezone?: string;               // Valid timezone name
  population?: number;             // Positive number
  area?: number;                   // Positive number
  elevation?: number;              // Elevation in meters
  isCapital?: boolean;
  isActive?: boolean;
}
```

**Response:**
```typescript
interface CityResponse extends City {
  // Same as City interface above
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `DELETE /admin/geography/cities/:id`

**Purpose:** Delete a city

**Path Parameters:**
```typescript
interface CityPathParams {
  id: number;  // City ID
}
```

**Response:** `204 No Content`

**Status Codes:** `200 OK`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/states/:stateId/cities`

**Purpose:** Get all cities for a specific state

**Path Parameters:**
```typescript
interface StateCitiesParams {
  stateId: number;  // State ID
}
```

**Query Parameters:**
```typescript
interface StateCitiesQueryParams {
  isActive?: boolean;
  isCapital?: boolean;
}
```

**Response:**
```typescript
interface StateCitiesResponse extends Array<City> {
  // Array of City objects for the state
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

## Service Zones Endpoints

### `GET /admin/geography/service-zones`

**Purpose:** List service zones with pagination and filters (optimized for performance)

**Query Parameters:**
```typescript
interface ServiceZonesQueryParams {
  page?: number;        // Default: 1
  limit?: number;       // Default: 20, Max: 100
  cityId?: number;      // Filter by city
  stateId?: number;     // Filter by state
  zoneType?: 'regular' | 'premium' | 'restricted';
  isActive?: boolean;
  search?: string;      // Search in zone name
  sortBy?: 'id' | 'zoneType' | 'pricingMultiplier' | 'demandMultiplier';
  sortOrder?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface ServiceZoneListResponse {
  zones: ServiceZoneListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ServiceZoneListItem {
  id: number;
  zoneType: 'regular' | 'premium' | 'restricted';
  pricingMultiplier: number;      // Price multiplier for the zone (e.g., 1.2 = 20% more expensive)
  demandMultiplier: number;       // Demand multiplier for dynamic pricing
  isActive: boolean;
}
```

**Status Codes:** `200 OK`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/service-zones`

**Purpose:** Create a new service zone

**Peak Hours Impact:** When `peakHours` is configured, the system will apply `pricingMultiplier` and `demandMultiplier` during specified time ranges, enabling dynamic pricing based on demand patterns.

**Request Body:**
```typescript
interface CreateServiceZoneDto {
  name: string;                    // Required: 2-100 chars, unique within city
  cityId: number;                  // Required: valid city ID
  zoneType?: 'regular' | 'premium' | 'restricted';  // Optional: default 'regular'
  boundaries: any;                 // Required: GeoJSON Polygon geometry
  centerLat: number;               // Required: zone center latitude (-90 to 90)
  centerLng: number;               // Required: zone center longitude (-180 to 180)
  isActive?: boolean;              // Optional: default true
  pricingMultiplier?: number;      // Optional: price multiplier (0.1-5.0), default 1.0
  maxDrivers?: number;             // Optional: maximum drivers allowed in zone
  minDrivers?: number;             // Optional: minimum drivers required in zone
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing  // Optional: peak hours for dynamic pricing (see PeakHoursConfig above)
  demandMultiplier?: number;       // Optional: demand multiplier (0.1-5.0), default 1.0
}
```

**Response:**
```typescript
interface ServiceZoneResponse {
  id: number;
  name: string;
  cityId: number;
  zoneType: 'regular' | 'premium' | 'restricted';
  boundaries: any;                 // GeoJSON Polygon
  centerLat: number;
  centerLng: number;
  isActive: boolean;
  pricingMultiplier: number;
  maxDrivers?: number;
  minDrivers?: number;
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing
  demandMultiplier: number;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
  city: {
    id: number;
    name: string;
    state: {
      id: number;
      name: string;
      code: string;
      country: {
        id: number;
        name: string;
        code: string;
        isoCode2: string;
      };
    };
  };
}
```

**Status Codes:** `201 Created`, `400 Bad Request`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/service-zones/:id`

**Purpose:** Get complete details of a specific service zone

**Path Parameters:**
```typescript
interface ServiceZonePathParams {
  id: number;  // Service zone ID
}
```

**Response:**
```typescript
interface ServiceZoneResponse {
  id: number;
  name: string;
  cityId: number;
  zoneType: 'regular' | 'premium' | 'restricted';
  boundaries: any;                 // GeoJSON Polygon geometry
  centerLat: number;
  centerLng: number;
  isActive: boolean;
  pricingMultiplier: number;
  maxDrivers?: number;
  minDrivers?: number;
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing
  demandMultiplier: number;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
  city: {
    id: number;
    name: string;
    state: {
      id: number;
      name: string;
      code: string;
      country: {
        id: number;
        name: string;
        code: string;
        isoCode2: string;
      };
    };
  };
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `PATCH /admin/geography/service-zones/:id`

**Purpose:** Update an existing service zone

**Peak Hours Impact:** Changes to `peakHours` configuration will immediately affect dynamic pricing calculations for the zone.

**Path Parameters:**
```typescript
interface ServiceZonePathParams {
  id: number;  // Service zone ID
}
```

**Request Body:**
```typescript
interface UpdateServiceZoneDto {
  name?: string;                   // 2-100 chars, unique within city
  cityId?: number;                 // Valid city ID
  zoneType?: 'regular' | 'premium' | 'restricted';
  boundaries?: any;                // GeoJSON Polygon geometry
  centerLat?: number;              // -90 to 90
  centerLng?: number;              // -180 to 180
  isActive?: boolean;
  pricingMultiplier?: number;      // 0.1-5.0
  maxDrivers?: number;             // Maximum drivers allowed
  minDrivers?: number;             // Minimum drivers required
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing                 // Peak hours configuration
  demandMultiplier?: number;       // 0.1-5.0
}
```

**Response:**
```typescript
interface ServiceZoneResponse {
  id: number;
  name: string;
  cityId: number;
  zoneType: 'regular' | 'premium' | 'restricted';
  boundaries: any;                 // GeoJSON Polygon
  centerLat: number;
  centerLng: number;
  isActive: boolean;
  pricingMultiplier: number;
  maxDrivers?: number;
  minDrivers?: number;
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing
  demandMultiplier: number;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
  city: {
    id: number;
    name: string;
    state: {
      id: number;
      name: string;
      code: string;
      country: {
        id: number;
        name: string;
        code: string;
        isoCode2: string;
      };
    };
  };
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `DELETE /admin/geography/service-zones/:id`

**Purpose:** Delete a service zone

**Path Parameters:**
```typescript
interface ServiceZonePathParams {
  id: number;  // Service zone ID
}
```

**Response:** `204 No Content`

**Status Codes:** `200 OK`, `404 Not Found`, `409 Conflict`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/service-zones/by-city/:cityId`

**Purpose:** Get all active service zones for a specific city with pagination

**Path Parameters:**
```typescript
interface CityServiceZonesParams {
  cityId: number;  // City ID
}
```

**Query Parameters:**
```typescript
interface CityServiceZonesQueryParams {
  activeOnly?: boolean;  // Default: true - Only return active zones
  page?: number;         // Default: 1
  limit?: number;        // Default: 20, Max: 100
}
```

**Response:**
```typescript
interface CityServiceZonesListResponse {
  zones: Array<{
    id: number;
    name: string;
    zoneType: 'regular' | 'premium' | 'restricted';
    boundaries: any;                 // GeoJSON Polygon
    centerLat: number;
    centerLng: number;
    isActive: boolean;
    pricingMultiplier: number;
    demandMultiplier: number;
    maxDrivers?: number;
    minDrivers?: number;
  }>;
  total: number;        // Total number of zones
  page: number;         // Current page
  limit: number;        // Items per page
  totalPages: number;   // Total pages
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `PATCH /admin/geography/service-zones/:id/toggle-status`

**Purpose:** Toggle the active status of a service zone

**Path Parameters:**
```typescript
interface ServiceZonePathParams {
  id: number;  // Service zone ID
}
```

**Response:**
```typescript
interface ServiceZoneResponse {
  id: number;
  name: string;
  cityId: number;
  zoneType: 'regular' | 'premium' | 'restricted';
  boundaries: any;                 // GeoJSON Polygon
  centerLat: number;
  centerLng: number;
  isActive: boolean;
  pricingMultiplier: number;
  maxDrivers?: number;
  minDrivers?: number;
  peakHours?: PeakHoursConfig | null;  // Peak hours configuration for dynamic pricing
  demandMultiplier: number;
  createdAt: string;               // ISO date string
  updatedAt: string;               // ISO date string
  city: {
    id: number;
    name: string;
    state: {
      id: number;
      name: string;
      code: string;
      country: {
        id: number;
        name: string;
        code: string;
        isoCode2: string;
      };
    };
  };
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/service-zones/validate-geometry`

**Purpose:** Validate service zone geometry and boundaries

**Request Body:**
```typescript
interface ValidateZoneGeometryDto {
  boundaries: any;                // GeoJSON Polygon to validate
  cityId: number;                 // City ID for validation context
  excludeZoneId?: number;         // Optional: exclude this zone from overlap checks
}
```

**Response:**
```typescript
interface ZoneValidationResult {
  isValid: boolean;
  errors: string[];               // Validation errors
  warnings: string[];             // Validation warnings
  coverage?: {
    areaKm2: number;              // Calculated area in square kilometers
    overlapPercentage: number;    // Percentage of overlap with existing zones
    gapPercentage: number;        // Percentage of uncovered area
  };
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/service-zones/coverage-analysis/city/:cityId`

**Purpose:** Analyze coverage and statistics for all zones in a city

**Path Parameters:**
```typescript
interface CityCoverageAnalysisParams {
  cityId: number;  // City ID
}
```

**Response:**
```typescript
interface CityCoverageAnalysis {
  cityId: number;
  cityName: string;
  totalCoverage: number;           // Percentage of city covered (0-100)
  overlappingArea: number;         // Percentage of overlapping zones
  uncoveredArea: number;           // Percentage of uncovered area
  coverageByType: {
    regular: number;               // Coverage percentage by regular zones
    premium: number;               // Coverage percentage by premium zones
    restricted: number;            // Coverage percentage by restricted zones
  };
  issues: string[];                // List of geometry issues found
  recommendations: string[];       // Suggested improvements
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

### `POST /admin/geography/service-zones/bulk-update-status`

**Purpose:** Bulk update active status for multiple service zones

**Request Body:**
```typescript
interface BulkUpdateZoneStatusDto {
  zoneIds: number[];              // Array of zone IDs to update
  isActive: boolean;              // New active status for all zones
}
```

**Response:**
```typescript
interface BulkUpdateZoneStatusResponse {
  updated: number;                // Number of zones updated
  skipped: number;                // Number of zones skipped
  zones: Array<{
    id: number;
    name: string;
    previousStatus: boolean;
    newStatus: boolean;
  }>;
}
```

**Status Codes:** `200 OK`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`

---

### `GET /admin/geography/service-zones/pricing-matrix/city/:cityId`

**Purpose:** Get pricing matrix for all active zones in a city with pagination

**Path Parameters:**
```typescript
interface CityPricingMatrixParams {
  cityId: number;  // City ID
}
```

**Query Parameters:**
```typescript
interface CityPricingMatrixQueryParams {
  page?: number;   // Default: 1
  limit?: number;  // Default: 20, Max: 100
}
```

**Response:**
```typescript
interface CityPricingMatrixResponse {
  cityId: number;
  zones: Array<{
    id: number;
    name: string;
    type: 'regular' | 'premium' | 'restricted';  // Note: 'type' instead of 'zoneType'
    pricingMultiplier: number;
    demandMultiplier: number;
    maxDrivers?: number;
    minDrivers?: number;
  }>;
  total: number;      // Total number of zones
  page: number;       // Current page
  limit: number;      // Items per page
  totalPages: number; // Total pages
}
```

**Status Codes:** `200 OK`, `404 Not Found`, `401 Unauthorized`, `403 Forbidden`

---

## Error Response Format

All endpoints follow consistent error response format:

```typescript
interface ErrorResponse {
  statusCode: number;
  message: string | string[];  // Error message(s)
  error: string;               // Error type
  timestamp?: string;          // ISO date string
  path?: string;               // Request path
  method?: string;             // HTTP method
}
```

## Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (duplicate, constraint violation)
- `500 Internal Server Error` - Server error

## Authentication

All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

## Rate Limiting

Geography endpoints are rate limited:
- Read operations: 100 requests per minute
- Write operations: 50 requests per minute
- Bulk operations: 10 requests per minute
- Analytics endpoints: 50 requests per minute</content>
</xai:function_call















