/**
 * Centralizado de endpoints de la API
 * Todas las rutas de la API se definen aquí para evitar duplicación y facilitar mantenimiento
 */


export const ENDPOINTS = {
  // Authentication
  auth: {
    login: 'admin/auth/login',
    refresh: 'admin/auth/refresh',
  },

  // Dashboard
  dashboard: {
    base: 'admin/dashboard',
    metrics: 'admin/dashboard/metrics',
    recentRides: 'admin/dashboard/recent-rides',
    alerts: 'admin/dashboard/alerts',
  },

  // User Management
  users: {
    base: 'admin/users',
    byId: (id: string | number) => `admin/users/${id}`,
    delete: 'admin/users/delete', // Endpoint específico para eliminación
    restore: (id: string | number) => `admin/users/${id}/restore`,
    search: 'admin/users/search',
    status: (id: string | number) => `admin/users/${id}/status`,
    wallet: (id: string | number) => `admin/users/${id}/wallet`,
    adjust: (id: string | number) => `admin/users/${id}/wallet/adjust`,
    emergencyContacts: (id: string | number) => `admin/users/${id}/emergency-contacts`,
<<<<<<< Updated upstream
    identityVerifications: {
      pending: 'admin/users/identity-verifications/pending',
      stats: 'admin/users/identity-verifications/stats',
      byUserId: (id: string | number) => `admin/users/${id}/identity-verification`,
      approve: (id: string | number) => `admin/users/${id}/identity-verification/approve`,
      reject: (id: string | number) => `admin/users/${id}/identity-verification/reject`,
    },
=======
    bulkStatus: 'admin/users/bulk/status', // Operaciones masivas de estado
>>>>>>> Stashed changes
  },

  // Driver Management
  drivers: {
    base: 'admin/drivers',
    register: 'admin/drivers/register',
    export: 'admin/drivers/export',
    byId: (id: string | number) => `admin/drivers/${id}`,
    status: (id: string | number) => `admin/drivers/${id}/status`,
    verification: (id: string | number) => `admin/drivers/${id}/verification`,
    workZones: (id: string | number) => `admin/drivers/${id}/work-zones`,
    bulkStatus: 'admin/drivers/bulk/status',
    notifications: (id: string | number) => `admin/drivers/${id}/notifications`,
    reassignRides: (id: string | number) => `admin/drivers/${id}/reassign-rides`,
    auditHistory: (id: string | number) => `admin/drivers/${id}/audit-history`,
    documents: {
      base: (id: string | number) => `admin/drivers/${id}/documents`,
      byId: (id: string | number, docId: string | number) => `admin/drivers/${id}/documents/${docId}`,
    },
    vehicles: {
      base: (id: string | number) => `admin/drivers/${id}/vehicles`,
      byId: (id: string | number, vehicleId: string | number) => `admin/drivers/${id}/vehicles/${vehicleId}`,
      setDefault: (id: string | number, vehicleId: string | number) => `admin/drivers/${id}/vehicles/${vehicleId}/set-default`,
      documents: {
        base: (id: string | number, vehicleId: string | number) => `admin/drivers/${id}/vehicles/${vehicleId}/documents`,
        byId: (id: string | number, vehicleId: string | number, docId: string | number) => `admin/drivers/${id}/vehicles/${vehicleId}/documents/${docId}`,
      },
    },
  },

  // Driver Verifications
  driversVerifications: {
    onboarding: 'admin/drivers-verifications/onboarding',
    onboardingById: (id: string | number) => `admin/drivers-verifications/onboarding/${id}`,
    stats: 'admin/drivers-verifications/stats',
    statsByStage: 'admin/drivers-verifications/stats/by-stage',
    statsByVehicleType: 'admin/drivers-verifications/stats/by-vehicle-type',
    documents: {
      all: 'admin/drivers-verifications/documents',
      pending: 'admin/drivers-verifications/documents/pending',
      byId: (id: string | number) => `admin/drivers-verifications/documents/${id}`,
      verify: (id: string | number) => `admin/drivers-verifications/documents/${id}/verify`,
      reject: (id: string | number) => `admin/drivers-verifications/documents/${id}/reject`,
      bulkVerify: 'admin/drivers-verifications/documents/bulk/verify',
    },
    vehicles: {
      pending: 'admin/drivers-verifications/vehicles/pending',
      byId: (id: string | number) => `admin/drivers-verifications/vehicles/${id}`,
      verify: (id: string | number) => `admin/drivers-verifications/vehicles/${id}/verify`,
      reject: (id: string | number) => `admin/drivers-verifications/vehicles/${id}/reject`,
      verifyDocument: (vehicleId: string | number, docId: string | number) =>
        `admin/drivers-verifications/vehicles/${vehicleId}/documents/${docId}/verify`,
      bulkVerify: 'admin/drivers-verifications/vehicles/bulk/verify',
    },
    approve: (id: string | number) => `admin/drivers-verifications/drivers/${id}/approve`,
    history: (id: string | number) => `admin/drivers-verifications/drivers/${id}/history`,
  },

  // Ride Management
  rides: {
    base: 'admin/rides',
    byId: (id: string | number) => `admin/rides/${id}`,
    reassign: (id: string | number) => `admin/rides/${id}/reassign`,
    cancel: (id: string | number) => `admin/rides/${id}/cancel`,
    complete: (id: string | number) => `admin/rides/${id}/complete`,
    // Legacy API endpoints (used in components)
    rideByUser: (userId: string | number) => `/api/ride/${userId}`,
    driverRides: (driverId: string | number) => `/api/driver/${driverId}/rides`,
  },

  // Geography Management
  geography: {
    // Countries
    countries: 'admin/geography/countries',
    countryById: (id: string | number) => `admin/geography/countries/${id}`,
    countryToggleStatus: (id: string | number) => `admin/geography/countries/${id}/toggle-status`,
    countriesStatsByContinent: 'admin/geography/countries/stats/by-continent',

    // States
    states: 'admin/geography/states',
    stateById: (id: string | number) => `admin/geography/states/${id}`,
    statesByCountry: (countryId: string | number) => `admin/geography/states/by-country/${countryId}`,
    stateToggleStatus: (id: string | number) => `admin/geography/states/${id}/toggle-status`,
    statesStatsByCountry: 'admin/geography/states/stats/by-country',

    // Cities
    cities: 'admin/geography/cities',
    cityById: (id: string | number) => `admin/geography/cities/${id}`,
    citiesByState: (stateId: string | number) => `admin/geography/cities/by-state/${stateId}`,
    cityToggleStatus: (id: string | number) => `admin/geography/cities/${id}/toggle-status`,
    citiesStatsByState: 'admin/geography/cities/stats/by-state',

    // Service Zones
    serviceZones: 'admin/geography/service-zones',
    serviceZoneById: (id: string | number) => `admin/geography/service-zones/${id}`,
    serviceZonesByCity: (cityId: string | number) => `admin/geography/service-zones/by-city/${cityId}`,
    serviceZoneToggleStatus: (id: string | number) => `admin/geography/service-zones/${id}/toggle-status`,
    validateGeometry: 'admin/geography/service-zones/validate-geometry',
    coverageAnalysis: (cityId: string | number) => `admin/geography/service-zones/coverage-analysis/city/${cityId}`,
    pricingMatrix: (cityId: string | number) => `admin/geography/service-zones/pricing-matrix/city/${cityId}`,
    bulkUpdateStatus: 'admin/geography/service-zones/bulk-update-status',
    bulkUpdatePricing: 'admin/geography/service-zones/bulk-update-pricing',
    validatePricing: 'admin/geography/service-zones/validate-pricing',
    pricingStats: 'admin/geography/service-zones/pricing/stats',

    // Bulk Import
    bulkImport: {
      countries: 'admin/geography/countries/bulk-import',
    },
  },

  // Pricing Management
  pricing: {
    rideTiers: 'admin/pricing/ride-tiers',
    rideTierById: (id: string | number) => `admin/pricing/ride-tiers/${id}`,
    rideTierToggleStatus: (id: string | number) => `admin/pricing/ride-tiers/${id}/toggle-status`,
    calculatePricing: 'admin/pricing/ride-tiers/calculate-pricing',
    validatePricing: 'admin/pricing/ride-tiers/validate-pricing',
    standardTiers: 'admin/pricing/ride-tiers/create-standard-tiers',
    bulkUpdateTiers: 'admin/pricing/ride-tiers/bulk-update',
    rideTiersSummary: 'admin/pricing/ride-tiers/summary/overview',
    vehicleTypes: 'admin/pricing/ride-tiers/vehicle-types',
    temporalRules: 'admin/pricing/temporal-rules',
    temporalRuleById: (id: string | number) => `admin/pricing/temporal-rules/${id}`,
    temporalRuleToggleStatus: (id: string | number) => `admin/pricing/temporal-rules/${id}/toggle-status`,
    evaluateRules: 'admin/pricing/temporal-rules/evaluate',
    standardRules: 'admin/pricing/temporal-rules/create-standard-rules',
    bulkUpdateRules: 'admin/pricing/temporal-rules/bulk-update',
    temporalRulesSummary: 'admin/pricing/temporal-rules/summary/overview',
    simulatePricing: 'admin/pricing/temporal-rules/simulate-pricing',
  },

  // Configuration Management
  config: {
    apiKeys: 'admin/config/api-keys',
    apiKeyById: (id: string | number) => `admin/config/api-keys/${id}`,
    apiKeyDecrypt: (id: string | number) => `admin/config/api-keys/${id}/decrypt`,
    apiKeyService: (service: string, environment: string) =>
      `admin/config/api-keys/service/${service}/${environment}`,
    apiKeyToggle: (id: string | number) => `admin/config/api-keys/${id}/toggle`,
    apiKeyRotate: (id: string | number) => `admin/config/api-keys/${id}/rotate`,
    apiKeyForceRotate: (id: string | number) => `admin/config/api-keys/${id}/force-rotate`,
    apiKeyRotationValidation: (id: string | number) => `admin/config/api-keys/${id}/rotation-validation`,
    bulkUpdateKeys: 'admin/config/api-keys/bulk-update',
    standardKeys: 'admin/config/api-keys/create-standard-keys',
    analytics: {
      overview: 'admin/config/api-keys/analytics/overview',
      rotationStats: 'admin/config/api-keys/rotation/stats',
      bulkRotate: 'admin/config/api-keys/rotation/bulk-rotate',
      auditHistory: 'admin/config/api-keys/rotation/audit-history',
    },
    featureFlags: 'admin/config/feature-flags',
    featureFlagById: (id: string | number) => `admin/config/feature-flags/${id}`,
    featureFlagByKey: (key: string) => `admin/config/feature-flags/key/${key}`,
    featureFlagToggle: (id: string | number) => `admin/config/feature-flags/${id}/toggle`,
    evaluateFlag: 'admin/config/feature-flags/evaluate',
    createStandardFlags: 'admin/config/feature-flags/create-standard-flags',
    bulkUpdateFlags: 'admin/config/feature-flags/bulk-update',
    categoriesOverview: 'admin/config/feature-flags/categories/overview',
    rolloutStatus: 'admin/config/feature-flags/rollout/status',
    cache: {
      stats: 'admin/config/feature-flags/cache/stats',
      warmup: 'admin/config/feature-flags/cache/warmup',
      clear: 'admin/config/feature-flags/cache/clear',
      clearKey: (key: string) => `admin/config/feature-flags/cache/clear/${key}`,
      cleanup: 'admin/config/feature-flags/cache/cleanup',
    },
    public: {
      evaluate: 'admin/config/feature-flags/public/evaluate',
    },
  },

  // Reports & Analytics
  reports: {
    generate: 'admin/reports/generate',
    export: 'admin/reports/export',
    sales: 'admin/reports-analytics/analytics/financial',
    dashboard: {
      widgets: 'admin/reports/dashboard/widgets',
      custom: 'admin/reports/dashboard/custom',
    },
    scheduled: 'admin/reports/scheduled',
    quick: {
      rides: 'admin/reports/quick/rides',
      financial: 'admin/reports/quick/financial',
      drivers: 'admin/reports/quick/drivers',
      users: 'admin/reports/quick/users',
    },
    metrics: {
      overview: 'admin/reports/metrics/overview',
    },
  },

  // Notifications Management
  notifications: {
    base: 'admin/notifications',
    send: 'admin/notifications/send',
    bulkSend: 'admin/notifications/bulk-send',
    templates: 'admin/notifications/templates',
    templateById: (id: string | number) => `admin/notifications/templates/${id}`,
    analytics: 'admin/notifications/analytics',
  },

  // Exchange Rates
  exchangeRates: {
    latest: 'exchange-rates/latest',
    history: 'exchange-rates/history',
    stats: 'exchange-rates/stats',
    testFetch: 'exchange-rates/test-fetch',
    update: 'exchange-rates/update',
    reset: 'exchange-rates/reset',
    health: 'exchange-rates/health',
  },

  // Transcription
  transcription: {
    base: '/api/transcription',
  },

  // Programa Yavoy Training Modules
  programaYavoy: {
    modules: 'admin/programa-yavoy/modules',
    moduleById: (id: string | number) => `admin/programa-yavoy/modules/${id}`,
    toggleStatus: (id: string | number) => `admin/programa-yavoy/modules/${id}/toggle-status`,
  },

  // Legacy API endpoints (used in older components)
  legacy: {
    users: 'api/user',
    userById: (id: string | number) => `api/user/${id}`,
    drivers: 'api/driver',
    driverById: (id: string | number) => `api/driver/${id}`,
    driverStatus: (id: string | number) => `api/driver/${id}/status`,
  },
} as const;

/**
 * Type-safe endpoint keys for better IntelliSense
 */
export type EndpointKeys = typeof ENDPOINTS;

/**
 * API version type - type-safe versioning for endpoints
 */
export type ApiVersion = 'v1' | 'v2';

/**
 * Helper function to get full endpoint URL with base URL and versioning
 * Prioriza NEXT_PUBLIC_EXTERNAL_API_URL para usar la URL del VPS externo
 * en lugar del host local (localhost)
 * 
 * @param endpoint - The endpoint path (e.g., 'admin/auth/login')
 * @param version - Optional API version ('v1' | 'v2'). Defaults to 'v1'
 * @returns Full URL with version (e.g., 'https://api.example.com/v1/admin/auth/login')
 */
export function getFullEndpoint(endpoint: string, version: ApiVersion = 'v1'): string {
  // Priorizar la URL externa del backend (VPS)
  const baseUrl = 
    process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 
    process.env.NEXT_PUBLIC_BACKEND_URL || 
    process.env.NEXT_PUBLIC_API_URL || 
    '';
  
  // Limpiar la URL base (remover barra final si existe)
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  
  // Limpiar el endpoint (agregar barra inicial si no existe)
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construir la URL con la versión: baseUrl/v1/endpoint
  const fullUrl = `${cleanBaseUrl}/${version}${cleanEndpoint}`;
  
  // Log para debugging
  console.log('[getFullEndpoint]', {
    endpoint,
    version,
    baseUrl,
    cleanBaseUrl,
    cleanEndpoint,
    fullUrl,
    envVars: {
      NEXT_PUBLIC_EXTERNAL_API_URL: process.env.NEXT_PUBLIC_EXTERNAL_API_URL || 'not set',
      NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'not set',
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'not set',
    }
  });
  
  return fullUrl;
}

/**
 * Helper function to replace path parameters in endpoints
 */
export function buildEndpoint(template: string, params: Record<string, string | number>): string {
  let result = template;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
}
