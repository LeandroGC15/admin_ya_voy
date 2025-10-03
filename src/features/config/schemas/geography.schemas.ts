// Geography Schemas with Zod
import { z } from 'zod';

// ========== BASE ENTITY SCHEMAS ==========

// Country schema
export const countrySchema = z.object({
  id: z.number(),
  name: z.string(),
  isoCode2: z.string(),
  isoCode3: z.string().optional(),
  numericCode: z.number().optional(),
  phoneCode: z.string().optional(),
  currencyCode: z.string(),
  currencyName: z.string().optional(),
  currencySymbol: z.string().optional(),
  timezone: z.string(),
  continent: z.string(),
  region: z.string().optional(),
  subregion: z.string().optional(),
  vatRate: z.number().optional(),
  corporateTaxRate: z.number().optional(),
  incomeTaxRate: z.number().optional(),
  isActive: z.boolean(),
  requiresVerification: z.boolean().optional(),
  supportedLanguages: z.array(z.string()).optional(),
  flag: z.string().optional(),
  capital: z.string().optional(),
  population: z.number().optional(),
  areaKm2: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  statesCount: z.number().optional(),
});

// State schema
export const stateSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  countryId: z.number(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  timezone: z.string().optional(),
  isActive: z.boolean(),
  pricingMultiplier: z.number().optional(),
  serviceFee: z.number().optional(),
  capital: z.string().optional(),
  population: z.number().optional(),
  areaKm2: z.number().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  country: z.object({
    id: z.number(),
    name: z.string(),
    isoCode2: z.string(),
    flag: z.string().optional(),
  }).optional(),
  citiesCount: z.number().optional(),
});

// City schema
export const citySchema = z.object({
  id: z.number(),
  name: z.string(),
  stateId: z.number(),
  latitude: z.number(),
  longitude: z.number(),
  timezone: z.string().optional(),
  isActive: z.boolean(),
  pricingMultiplier: z.number().optional(),
  serviceFee: z.number().optional(),
  serviceRadius: z.number().optional(),
  population: z.number().optional(),
  areaKm2: z.number().optional(),
  elevation: z.number().optional(),
  postalCodes: z.array(z.string()).optional(),
  restrictedAreas: z.array(z.string()).optional(),
  premiumZones: z.array(z.string()).optional(),
  boundaries: z.any().optional(), // GeoJSON Polygon
  createdAt: z.string(),
  updatedAt: z.string(),
  state: z.object({
    id: z.number(),
    name: z.string(),
    code: z.string(),
    country: z.object({
      id: z.number(),
      name: z.string(),
      isoCode2: z.string(),
      flag: z.string().optional(),
    }),
  }).optional(),
  serviceZonesCount: z.number().optional(),
});

// ========== LIST RESPONSE SCHEMAS ==========

// Countries list response schema
export const countriesListResponseSchema = z.object({
  countries: z.array(countrySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

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

// States list response schema
export const statesListResponseSchema = z.object({
  states: z.array(stateSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Cities list response schema
export const citiesListResponseSchema = z.object({
  cities: z.array(citySchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// ========== STATISTICS RESPONSE SCHEMAS ==========

// Countries stats by continent response schema
export const countriesStatsByContinentResponseSchema = z.object({
  stats: z.array(z.object({
    continent: z.string(),
    count: z.number(),
  })),
});

// States stats by country response schema
export const statesStatsByCountryResponseSchema = z.object({
  stats: z.array(z.object({
    countryId: z.number(),
    countryName: z.string(),
    countryCode: z.string(),
    statesCount: z.number(),
  })),
});

// Cities stats by state response schema
export const citiesStatsByStateResponseSchema = z.object({
  stats: z.array(z.object({
    stateId: z.number(),
    stateName: z.string(),
    stateCode: z.string(),
    countryName: z.string(),
    countryCode: z.string(),
    citiesCount: z.number(),
  })),
});

// ========== VALIDATION SCHEMAS ==========

// Create country schema with validation
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
  isActive: z.boolean().default(true),
  requiresVerification: z.boolean().optional(),
  supportedLanguages: z.array(z.string()).optional(),
  flag: z.string().max(10).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

// Update country schema (all fields optional)
export const updateCountrySchema = createCountrySchema.partial();

// Create state schema with validation
export const createStateSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  code: z.string().min(1, 'Código es requerido').max(10),
  countryId: z.number().int().positive('País es requerido'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
  pricingMultiplier: z.number().min(0.1).max(10).optional(),
  serviceFee: z.number().min(0).optional(),
  capital: z.string().max(100).optional(),
  population: z.number().int().min(0).optional(),
  areaKm2: z.number().min(0).optional(),
});

// Update state schema (all fields optional)
export const updateStateSchema = createStateSchema.partial();

// Create city schema with validation
export const createCitySchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  stateId: z.number().int().positive('Estado es requerido'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
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

// Update city schema (all fields optional)
export const updateCitySchema = createCitySchema.partial();

// ========== SEARCH/FILTER SCHEMAS ==========

// Search countries schema
export const searchCountriesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  continent: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Search states schema
export const searchStatesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  countryId: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Search cities schema
export const searchCitiesSchema = z.object({
  page: z.number().min(1).default(1).optional(),
  limit: z.number().min(1).max(100).default(20).optional(),
  stateId: z.number().positive().optional(),
  countryId: z.number().positive().optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(100).optional().or(z.literal('')),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ========== BULK IMPORT SCHEMA ==========

// Bulk import response schema
export const bulkImportResponseSchema = z.object({
  totalProcessed: z.number(),
  successful: z.number(),
  failed: z.number(),
  skipped: z.number(),
  errors: z.array(z.object({
    row: z.number(),
    field: z.string(),
    value: z.string(),
    error: z.string(),
  })),
  skippedRecords: z.array(z.object({
    row: z.number(),
    reason: z.string(),
    data: z.record(z.unknown()),
  })),
  duration: z.number(),
});

// ========== TYPE EXPORTS ==========

// Entity types
export type Country = z.infer<typeof countrySchema>;
export type State = z.infer<typeof stateSchema>;
export type City = z.infer<typeof citySchema>;

// Response types
export type CountriesListResponse = z.infer<typeof countriesListResponseSchema>;
export type StateListItem = z.infer<typeof stateListItemSchema>;
export type StatesByCountryResponse = z.infer<typeof statesByCountryResponseSchema>;
export type StatesByCountryApiResponse = z.infer<typeof statesByCountryApiResponseSchema>;
export type StatesListResponse = z.infer<typeof statesListResponseSchema>;
export type CitiesListResponse = z.infer<typeof citiesListResponseSchema>;

// Statistics types
export type CountriesStatsByContinentResponse = z.infer<typeof countriesStatsByContinentResponseSchema>;
export type StatesStatsByCountryResponse = z.infer<typeof statesStatsByCountryResponseSchema>;
export type CitiesStatsByStateResponse = z.infer<typeof citiesStatsByStateResponseSchema>;

// Input types for mutations
export type CreateCountryInput = z.infer<typeof createCountrySchema>;
export type UpdateCountryInput = z.infer<typeof updateCountrySchema>;
export type CreateStateInput = z.infer<typeof createStateSchema>;
export type UpdateStateInput = z.infer<typeof updateStateSchema>;
export type CreateCityInput = z.infer<typeof createCitySchema>;
export type UpdateCityInput = z.infer<typeof updateCitySchema>;

// Search/Filter input types
export type SearchCountriesInput = z.infer<typeof searchCountriesSchema>;
export type SearchStatesInput = z.infer<typeof searchStatesSchema>;
export type SearchCitiesInput = z.infer<typeof searchCitiesSchema>;

// Bulk import types
export type BulkImportResponse = z.infer<typeof bulkImportResponseSchema>;
