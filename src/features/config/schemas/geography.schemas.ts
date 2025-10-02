// Geography Schemas
import { z } from 'zod';
import type { Polygon } from 'geojson';

// GeoJSON type for boundaries
type GeoJSONPolygon = Polygon;
export interface Country {
  id: number;
  name: string;
  isoCode2: string;
  isoCode3?: string;
  numericCode?: number;
  phoneCode?: string;
  currencyCode: string;
  currencyName?: string;
  currencySymbol?: string;
  timezone: string;
  continent: string;
  region?: string;
  subregion?: string;
  vatRate?: number;
  corporateTaxRate?: number;
  incomeTaxRate?: number;
  isActive: boolean;
  requiresVerification?: boolean;
  supportedLanguages?: string[];
  flag?: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
  createdAt: string;
  updatedAt: string;
  statesCount?: number;
}

export interface State {
  id: number;
  name: string;
  code: string;
  countryId: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isActive: boolean;
  pricingMultiplier?: number;
  serviceFee?: number;
  capital?: string;
  population?: number;
  areaKm2?: number;
  createdAt: string;
  updatedAt: string;
  country?: {
    id: number;
    name: string;
    isoCode2: string;
    flag?: string;
  };
  citiesCount?: number;
}

export interface City {
  id: number;
  name: string;
  stateId: number;
  latitude: number;
  longitude: number;
  timezone?: string;
  isActive: boolean;
  pricingMultiplier?: number;
  serviceFee?: number;
  serviceRadius?: number;
  population?: number;
  areaKm2?: number;
  elevation?: number;
  postalCodes?: string[];
  restrictedAreas?: string[];
  premiumZones?: string[];
  boundaries?: GeoJSONPolygon;
  createdAt: string;
  updatedAt: string;
  state?: {
    id: number;
    name: string;
    code: string;
    country: {
      id: number;
      name: string;
      isoCode2: string;
      flag?: string;
    };
  };
  serviceZonesCount?: number;
}

// List Response Types
export interface CountriesListResponse {
  countries: Country[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// State list item schema (optimized for states by country response)
export const stateListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  countryName: z.string(),
  isActive: z.boolean(),
  citiesCount: z.number().optional(),
});

// States by country response schema
export const statesByCountryResponseSchema = z.object({
  states: z.array(stateListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Full response with data wrapper
export const statesByCountryApiResponseSchema = z.object({
  data: statesByCountryResponseSchema,
});

export interface StatesListResponse {
  states: State[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StateListItem {
  id: number;
  name: string;
  code: string;
  countryName: string;
  isActive: boolean;
  citiesCount?: number;
}

export interface StatesByCountryResponse {
  states: StateListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatesByCountryApiResponse {
  data: StatesByCountryResponse;
}

export interface CitiesListResponse {
  cities: City[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Statistics Response Types
export interface CountriesStatsByContinentResponse {
  stats: {
    continent: string;
    totalCountries: number;
    activeCountries: number;
  }[];
}

export interface StatesStatsByCountryResponse {
  stats: {
    countryId: number;
    countryName: string;
    totalStates: number;
    activeStates: number;
  }[];
}

export interface CitiesStatsByStateResponse {
  stats: {
    stateId: number;
    stateName: string;
    countryName: string;
    totalCities: number;
    activeCities: number;
  }[];
}

// Validation Schemas
export const createCountrySchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  isoCode2: z.string().length(2, 'Código ISO 2 debe tener exactamente 2 caracteres').toUpperCase(),
  isoCode3: z.string().length(3, 'Código ISO 3 debe tener exactamente 3 caracteres').toUpperCase().optional(),
  numericCode: z.number().int().min(1).max(999).optional(),
  phoneCode: z.string().max(10).optional(),
  currencyCode: z.string().length(3, 'Código de moneda debe tener exactamente 3 caracteres').toUpperCase(),
  currencyName: z.string().max(100).optional(),
  currencySymbol: z.string().max(10).optional(),
  timezone: z.string().min(1, 'Zona horaria es requerida'),
  continent: z.enum(['africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania', 'antarctica']),
  region: z.string().max(100).optional(),
  subregion: z.string().max(100).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  corporateTaxRate: z.number().min(0).max(100).optional(),
  incomeTaxRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  requiresVerification: z.boolean().optional(),
  supportedLanguages: z.array(z.string()).optional(),
  flag: z.string().max(10).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

export const updateCountrySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  isoCode3: z.string().length(3).toUpperCase().optional(),
  numericCode: z.number().int().min(1).max(999).optional(),
  phoneCode: z.string().max(10).optional(),
  currencyName: z.string().max(100).optional(),
  currencySymbol: z.string().max(10).optional(),
  timezone: z.string().min(1).optional(),
  region: z.string().max(100).optional(),
  subregion: z.string().max(100).optional(),
  vatRate: z.number().min(0).max(100).optional(),
  corporateTaxRate: z.number().min(0).max(100).optional(),
  incomeTaxRate: z.number().min(0).max(100).optional(),
  isActive: z.boolean().optional(),
  requiresVerification: z.boolean().optional(),
  supportedLanguages: z.array(z.string()).optional(),
  flag: z.string().max(10).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

export const createStateSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  code: z.string().min(1, 'Código es requerido').max(10),
  countryId: z.number().int().positive('País es requerido'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  pricingMultiplier: z.number().min(0.1).max(10).optional(),
  serviceFee: z.number().min(0).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

export const updateStateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  code: z.string().min(1).max(10).optional(),
  countryId: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  pricingMultiplier: z.number().min(0.1).max(10).optional(),
  serviceFee: z.number().min(0).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

export const createCitySchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  stateId: z.number().int().positive('Estado es requerido'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  pricingMultiplier: z.number().min(0.1).max(10).optional(),
  serviceFee: z.number().min(0).optional(),
  serviceRadius: z.number().min(0).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
  elevation: z.number().optional(),
  postalCodes: z.array(z.string()).optional(),
  restrictedAreas: z.array(z.string()).optional(),
  premiumZones: z.array(z.string()).optional(),
  boundaries: z.any().optional(), // GeoJSON Polygon
});

export const updateCitySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  stateId: z.number().int().positive().optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().optional(),
  pricingMultiplier: z.number().min(0.1).max(10).optional(),
  serviceFee: z.number().min(0).optional(),
  serviceRadius: z.number().min(0).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
  elevation: z.number().optional(),
  postalCodes: z.array(z.string()).optional(),
  restrictedAreas: z.array(z.string()).optional(),
  premiumZones: z.array(z.string()).optional(),
  boundaries: z.any().optional(), // GeoJSON Polygon
});

// Input Types for Mutations
export interface CreateCountryInput {
  name: string;
  isoCode2: string;
  isoCode3?: string;
  numericCode?: number;
  phoneCode?: string;
  currencyCode: string;
  currencyName?: string;
  currencySymbol?: string;
  timezone: string;
  continent: string;
  region?: string;
  subregion?: string;
  vatRate?: number;
  corporateTaxRate?: number;
  incomeTaxRate?: number;
  isActive?: boolean;
  requiresVerification?: boolean;
  supportedLanguages?: string[];
  flag?: string;
  capital?: string;
  population?: number;
  areaKm2?: number;
}

export type UpdateCountryInput = Partial<CreateCountryInput>;

export interface CreateStateInput {
  name: string;
  code: string;
  countryId: number;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isActive?: boolean;
  pricingMultiplier?: number;
  serviceFee?: number;
  capital?: string;
  population?: number;
  areaKm2?: number;
}

export type UpdateStateInput = Partial<CreateStateInput>;

export interface CreateCityInput {
  name: string;
  stateId: number;
  latitude: number;
  longitude: number;
  timezone?: string;
  isActive?: boolean;
  pricingMultiplier?: number;
  serviceFee?: number;
  serviceRadius?: number;
  population?: number;
  areaKm2?: number;
  elevation?: number;
  postalCodes?: string[];
  restrictedAreas?: string[];
  premiumZones?: string[];
  boundaries?: GeoJSONPolygon;
}

export type UpdateCityInput = Partial<CreateCityInput>;

// Search/Filter Input Types
export interface SearchCountriesInput {
  page?: number;
  limit?: number;
  continent?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchStatesInput {
  page?: number;
  limit?: number;
  countryId?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchCitiesInput {
  page?: number;
  limit?: number;
  stateId?: number;
  countryId?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Bulk Import Response Types
export interface BulkImportResponse {
  totalProcessed: number;
  successful: number;
  failed: number;
  skipped: number;
  errors: {
    row: number;
    field: string;
    value: string;
    error: string;
  }[];
  skippedRecords: {
    row: number;
    reason: string;
    data: Record<string, unknown>;
  }[];
  duration: number;
}
