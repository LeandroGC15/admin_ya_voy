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
    search: 'admin/users/search',
    status: (id: string | number) => `admin/users/${id}/status`,
    wallet: (id: string | number) => `admin/users/${id}/wallet`,
    adjust: (id: string | number) => `admin/users/${id}/wallet/adjust`,
    emergencyContacts: (id: string | number) => `admin/users/${id}/emergency-contacts`,
  },

  // Driver Management
  drivers: {
    base: 'admin/drivers',
    register: 'admin/drivers/register',
    byId: (id: string | number) => `admin/drivers/${id}`,
    status: (id: string | number) => `admin/drivers/${id}/status`,
    verification: (id: string | number) => `admin/drivers/${id}/verification`,
    workZones: (id: string | number) => `admin/drivers/${id}/work-zones`,
    bulkStatus: 'admin/drivers/bulk/status',
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
    countries: 'admin/geography/countries',
    countryById: (id: string | number) => `admin/geography/countries/${id}`,
    states: 'admin/geography/states',
    cities: 'admin/geography/cities',
    serviceZones: 'admin/geography/service-zones',
    bulkImport: {
      countries: 'admin/geography/countries/bulk-import',
    },
  },

  // Pricing Management
  pricing: {
    rideTiers: 'admin/pricing/ride-tiers',
    rideTierById: (id: string | number) => `admin/pricing/ride-tiers/${id}`,
    calculatePricing: 'admin/pricing/ride-tiers/calculate-pricing',
    validatePricing: 'admin/pricing/ride-tiers/validate-pricing',
    standardTiers: 'admin/pricing/ride-tiers/create-standard-tiers',
    bulkUpdateTiers: 'admin/pricing/ride-tiers/bulk-update',
    temporalRules: 'admin/pricing/temporal-rules',
    temporalRuleById: (id: string | number) => `admin/pricing/temporal-rules/${id}`,
    evaluateRules: 'admin/pricing/temporal-rules/evaluate',
    standardRules: 'admin/pricing/temporal-rules/create-standard-rules',
    bulkUpdateRules: 'admin/pricing/temporal-rules/bulk-update',
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
 * Helper function to get full endpoint URL with base URL
 */
export function getFullEndpoint(endpoint: string): string {
  return `${process.env.NEXT_PUBLIC_API_URL || ''}${endpoint}`;
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
