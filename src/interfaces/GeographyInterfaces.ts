/**
 * Geography Management interfaces
 */

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

// Service Zones
export interface Coordinate {
  lat: number;
  lng: number;
}

export interface ServiceZone {
  id: number;
  name: string;
  cityId: number;
  city?: City;
  coordinates: Coordinate[];
  isActive: boolean;
  baseFare: number;
  perMileRate: number;
  perMinuteRate: number;
  minimumFare: number;
  bookingFee: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceZoneRequest {
  name: string;
  cityId: number;
  coordinates: Coordinate[];
  isActive: boolean;
  baseFare: number;
  perMileRate: number;
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
