import { useApiQuery, useApiMutation, invalidateQueries } from '@/lib/api/react-query-client';
import { api } from '@/lib/api/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import type {
  Country,
  State,
  City,
  StateListItem,
  StatesByCountryResponse,
  StatesByCountryApiResponse,
  CountriesListResponse,
  StatesListResponse,
  CitiesListResponse,
  CountriesStatsByContinentResponse,
  StatesStatsByCountryResponse,
  CitiesStatsByStateResponse,
  CreateCountryInput,
  UpdateCountryInput,
  CreateStateInput,
  UpdateStateInput,
  CreateCityInput,
  UpdateCityInput,
  SearchCountriesInput,
  SearchStatesInput,
  SearchCitiesInput,
  BulkImportResponse,
} from '../schemas/geography.schemas';

// Query Keys
export const geographyKeys = {
  all: ['geography'] as const,
  countries: () => [...geographyKeys.all, 'countries'] as const,
  countriesList: (params: SearchCountriesInput) => [...geographyKeys.countries(), 'list', params] as const,
  countryDetail: (id: number) => [...geographyKeys.countries(), 'detail', id] as const,
  countriesStats: () => [...geographyKeys.countries(), 'stats'] as const,

  states: () => [...geographyKeys.all, 'states'] as const,
  statesList: (params: SearchStatesInput) => [...geographyKeys.states(), 'list', params] as const,
  statesByCountry: (countryId: number, activeOnly?: boolean) => [...geographyKeys.states(), 'byCountry', countryId, activeOnly] as const,
  stateDetail: (id: number) => [...geographyKeys.states(), 'detail', id] as const,
  statesStats: () => [...geographyKeys.states(), 'stats'] as const,

  cities: () => [...geographyKeys.all, 'cities'] as const,
  citiesList: (params: SearchCitiesInput) => [...geographyKeys.cities(), 'list', params] as const,
  citiesByState: (stateId: number, activeOnly?: boolean) => [...geographyKeys.cities(), 'byState', stateId, activeOnly] as const,
  cityDetail: (id: number) => [...geographyKeys.cities(), 'detail', id] as const,
  citiesStats: () => [...geographyKeys.cities(), 'stats'] as const,
};

// ========== COUNTRIES HOOKS ==========

// Fetch countries list
export function useCountries(params: SearchCountriesInput = {}) {
  return useApiQuery(
    geographyKeys.countriesList(params),
    async (): Promise<CountriesListResponse> => {
      const response = await api.get<CountriesListResponse>(ENDPOINTS.geography.countries, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          continent: params.continent,
          isActive: params.isActive,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Create country
export function useCreateCountry() {
  return useApiMutation(
    async (data: CreateCountryInput): Promise<Country> => {
      const response = await api.post<Country>(ENDPOINTS.geography.countries, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get single country
export function useCountry(id: number) {
  return useApiQuery(
    geographyKeys.countryDetail(id),
    async (): Promise<Country> => {
      const response = await api.get<Country>(ENDPOINTS.geography.countryById(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Update country
export function useUpdateCountry() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateCountryInput }): Promise<Country> => {
      const response = await api.patch<Country>(ENDPOINTS.geography.countryById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Delete country
export function useDeleteCountry() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.geography.countryById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Toggle country status
export function useToggleCountryStatus() {
  return useApiMutation(
    async (id: number): Promise<Country> => {
      const response = await api.patch<Country>(ENDPOINTS.geography.countryToggleStatus(id));
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get countries stats by continent
export function useCountriesStatsByContinent() {
  return useApiQuery(
    geographyKeys.countriesStats(),
    async (): Promise<CountriesStatsByContinentResponse> => {
      const response = await api.get<CountriesStatsByContinentResponse>(
        ENDPOINTS.geography.countriesStatsByContinent
      );
      // Si la respuesta ya tiene el wrapper data, retornarla directamente
      // Si no, asumir que response.data ya fue extraído por el interceptor
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Bulk import countries
export function useBulkImportCountries() {
  return useApiMutation(
    async (file: File): Promise<BulkImportResponse> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post<BulkImportResponse>(
        ENDPOINTS.geography.bulkImport.countries,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// ========== STATES HOOKS ==========

// Fetch states list
export function useStates(params: SearchStatesInput = {}) {
  return useApiQuery(
    geographyKeys.statesList(params),
    async (): Promise<StatesListResponse> => {
      const response = await api.get<StatesListResponse>(ENDPOINTS.geography.states, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          countryId: params.countryId,
          isActive: params.isActive,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get states by country
export function useStatesByCountry(countryId: number, activeOnly = false) {
  return useApiQuery(
    geographyKeys.statesByCountry(countryId, activeOnly),
    async (): Promise<StatesByCountryResponse> => {
      const response = await api.get<StatesByCountryResponse>(ENDPOINTS.geography.statesByCountry(countryId), {
        params: { activeOnly },
      });
      return response.data;
    },
    {
      enabled: !!countryId,
    }
  );
}

// Create state
export function useCreateState() {
  return useApiMutation(
    async (data: CreateStateInput): Promise<State> => {
      const response = await api.post<State>(ENDPOINTS.geography.states, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get single state
export function useState(id: number) {
  return useApiQuery(
    geographyKeys.stateDetail(id),
    async (): Promise<State> => {
      const response = await api.get<State>(ENDPOINTS.geography.stateById(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Update state
export function useUpdateState() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateStateInput }): Promise<State> => {
      const response = await api.patch<State>(ENDPOINTS.geography.stateById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Delete state
export function useDeleteState() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.geography.stateById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Toggle state status
export function useToggleStateStatus() {
  return useApiMutation(
    async (id: number): Promise<State> => {
      const response = await api.patch<State>(ENDPOINTS.geography.stateToggleStatus(id));
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get states stats by country
export function useStatesStatsByCountry() {
  return useApiQuery(
    geographyKeys.statesStats(),
    async (): Promise<StatesStatsByCountryResponse> => {
      const response = await api.get<StatesStatsByCountryResponse>(
        ENDPOINTS.geography.statesStatsByCountry
      );
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// ========== CITIES HOOKS ==========

// Fetch cities list
// NOTE: API limit is capped at 100 items maximum per request
// Do not use limits higher than 100 or requests will fail
export function useCities(params: SearchCitiesInput = {}) {
  return useApiQuery(
    geographyKeys.citiesList(params),
    async (): Promise<CitiesListResponse> => {
      const response = await api.get<CitiesListResponse>(ENDPOINTS.geography.cities, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          stateId: params.stateId,
          countryId: params.countryId,
          isActive: params.isActive,
          search: params.search,
          sortBy: params.sortBy,
          sortOrder: params.sortOrder,
        },
      });
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: true,
    }
  );
}

// Get cities by state
export function useCitiesByState(stateId: number, activeOnly = false) {
  return useApiQuery(
    geographyKeys.citiesByState(stateId, activeOnly),
    async (): Promise<City[]> => {
      const response = await api.get<City[]>(ENDPOINTS.geography.citiesByState(stateId), {
        params: { activeOnly },
      });
      return response.data;
    },
    {
      enabled: !!stateId,
    }
  );
}

// Create city
export function useCreateCity() {
  return useApiMutation(
    async (data: CreateCityInput): Promise<City> => {
      const response = await api.post<City>(ENDPOINTS.geography.cities, data);
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get single city
export function useCity(id: number) {
  return useApiQuery(
    geographyKeys.cityDetail(id),
    async (): Promise<City> => {
      const response = await api.get<City>(ENDPOINTS.geography.cityById(id));
      if (!response || !response.data) {
        throw new Error('Invalid API response: no data received');
      }
      return response.data;
    },
    {
      enabled: !!id,
    }
  );
}

// Update city
export function useUpdateCity() {
  return useApiMutation(
    async ({ id, data }: { id: number; data: UpdateCityInput }): Promise<City> => {
      const response = await api.patch<City>(ENDPOINTS.geography.cityById(id), data);
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Delete city
export function useDeleteCity() {
  return useApiMutation(
    async (id: number): Promise<void> => {
      await api.delete<void>(ENDPOINTS.geography.cityById(id));
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Toggle city status
export function useToggleCityStatus() {
  return useApiMutation(
    async (id: number): Promise<City> => {
      const response = await api.patch<City>(ENDPOINTS.geography.cityToggleStatus(id));
      return response.data;
    },
    {
      onSuccess: () => {
        invalidateQueries(['geography']);
      },
    }
  );
}

// Get cities stats by state
export function useCitiesStatsByState() {
  return useApiQuery(
    geographyKeys.citiesStats(),
    async (): Promise<CitiesStatsByStateResponse> => {
      const response = await api.get<CitiesStatsByStateResponse>(
        ENDPOINTS.geography.citiesStatsByState
      );
      return response.data;
    },
    {
      enabled: true,
    }
  );
}
