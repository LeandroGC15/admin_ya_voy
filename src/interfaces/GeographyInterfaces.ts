/**
 * Geography Management interfaces
 */

// Zone Types
export enum ZoneType {
  REGULAR = 'REGULAR',
  PREMIUM = 'PREMIUM',
  RESTRICTED = 'RESTRICTED'
}

// Countries
export interface Country {
  id: number;
  name: string;
  code: string;
  iso3: string;
  numericCode: string;
  phoneCode: string;
  capital?: string;
  currency: string;
  currencyName: string;
  currencySymbol: string;
  region: string;
  subregion: string;
  latitude: number;
  longitude: number;
  area: number;
  population: number;
  continent: string;
  timezones: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
  iso3: string;
  numericCode: string;
  phoneCode: string;
  capital?: string;
  currency: string;
  currencyName: string;
  currencySymbol: string;
  region: string;
  subregion: string;
  latitude: number;
  longitude: number;
  area: number;
  population: number;
  continent: string;
  timezones: string[];
}

export interface UpdateCountryRequest {
  name?: string;
  isActive?: boolean;
}

export interface CountryFilters {
  search?: string;
  continent?: string;
  region?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CountriesResponse {
  countries: Country[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// States/Provinces
export interface State {
  id: number;
  name: string;
  code: string;
  countryId: number;
  country?: Country;
  latitude: number;
  longitude: number;
  population: number;
  area: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStateRequest {
  name: string;
  code: string;
  countryId: number;
  latitude: number;
  longitude: number;
  population: number;
  area: number;
}

export interface StateFilters {
  countryId?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface StatesResponse {
  states: State[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Cities
export interface City {
  id: number;
  name: string;
  stateId: number;
  countryId: number;
  state?: State;
  country?: Country;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
  isCapital: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCityRequest {
  name: string;
  stateId: number;
  countryId: number;
  latitude: number;
  longitude: number;
  population: number;
  timezone: string;
  isCapital: boolean;
}

export interface CityFilters {
  countryId?: number;
  stateId?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CitiesResponse {
  cities: City[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Service Zones - Updated according to API documentation

// GeoJSON types
export interface GeoJSONPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

// Service Zone completo según API
export interface ServiceZone {
  id: number;
  name: string;
  cityId: number;
  zoneType: ZoneType;
  boundaries: GeoJSONPolygon;
  centerLat: number;
  centerLng: number;
  isActive: boolean;
  pricingMultiplier: number;
  demandMultiplier: number;
  maxDrivers?: number;
  minDrivers?: number;
  peakHours?: {
    weekdays: string[];
    weekends: string[];
  };
  createdAt: string;
  updatedAt: string;
  city?: {
    id: number;
    name: string;
    state: {
      id: number;
      name: string;
      country: {
        id: number;
        name: string;
      };
    };
  };
}

// Respuestas de API
export interface ServiceZonesListResponse {
  zones: ServiceZoneListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceZoneListItem {
  id: number;
  name: string;
  cityName: string;
  stateName: string;
  zoneType: ZoneType;
  isActive: boolean;
  pricingMultiplier: number;
  demandMultiplier: number;
}

// Validación de geometría
export interface GeometryValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  analysis: {
    areaKm2: number;
    overlapPercentage: number;
    gapPercentage: number;
  };
}

// Análisis de cobertura
export interface CoverageAnalysisResponse {
  cityId: number;
  cityName: string;
  totalCoverage: number;
  overlappingArea: number;
  uncoveredArea: number;
  coverageByType: {
    regular: number;
    premium: number;
    restricted: number;
  };
  issues: string[];
  recommendations: string[];
}

// Pricing
export interface PricingValidationResponse {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  comparison?: {
    existingZone: {
      id: number;
      name: string;
      pricingMultiplier: number;
      demandMultiplier: number;
    };
    differences: {
      pricingMultiplier: number;
      demandMultiplier: number;
    };
    competitiveness: string;
  };
}

export interface BulkPricingUpdateRequest {
  zoneIds?: number[];
  cityId?: number;
  zoneType?: ZoneType;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  field: 'pricingMultiplier' | 'demandMultiplier';
}

export interface PricingStatsResponse {
  totalZones: number;
  activeZones: number;
  averagePricingMultiplier: number;
  averageDemandMultiplier: number;
  highestPricingMultiplier: number;
  lowestPricingMultiplier: number;
  zonesByType: {
    regular: number;
    premium: number;
    restricted: number;
  };
  zonesByCity: Array<{
    cityId: number;
    cityName: string;
    totalZones: number;
    avgPricingMultiplier: number;
  }>;
}

// Legacy interfaces for backward compatibility
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface CreateServiceZoneRequest {
  name: string;
  cityId: number;
  coordinates: Coordinate[];
  isActive: boolean;
  baseFare: number;
  perKmRate: number;
  perMinuteRate: number;
  minimumFare: number;
  bookingFee: number;
}

export interface ServiceZoneFilters {
  cityId?: number;
  countryId?: number;
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface ServiceZonesResponse {
  zones: ServiceZone[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bulk operations
export interface BulkImportCountriesRequest {
  file: File;
}

// Filters comunes
export interface GeographyFilters {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}
