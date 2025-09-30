/**
 * Config Module TypeScript Interfaces
 *
 * These interfaces represent the data structures used within ApiResponse<T>.data
 * The api-client automatically extracts the 'data' property from ApiResponse<T>,
 * so these interfaces represent what you get when calling api methods.
 *
 * Usage examples:
 * - api.get<ApiKeysListResponse>(url) - returns ApiKeysListResponse directly
 * - api.post<ApiKey>(url, payload) - returns ApiKey directly
 */

// Pagination interface (used within response data)
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// API Keys interfaces
export interface ApiKey {
  id: number;
  name: string;
  service: string;
  environment: string;
  keyType: string;
  description?: string;
  expiresAt?: string;
  lastRotated?: string;
  rotationPolicy?: 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y';
  isActive: boolean;
  isPrimary: boolean;
  accessLevel: 'read' | 'write' | 'admin' | 'full';
  usageCount: number;
  rateLimit?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// API Keys list response data (content of ApiResponse.data)
export interface ApiKeysListResponse {
  keys: ApiKey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// API Keys query parameters
export interface ApiKeysQueryParams {
  page?: number;
  limit?: number;
  service?: 'stripe' | 'twilio' | 'firebase' | 'google_maps' | 'sendgrid' | 'aws' | 'azure' | 'google_analytics';
  environment?: 'development' | 'staging' | 'production';
  keyType?: 'secret' | 'public' | 'private_key' | 'access_token' | 'refresh_token' | 'webhook_secret';
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'service' | 'environment' | 'createdAt' | 'usageCount';
  sortOrder?: 'asc' | 'desc';
}

// Create API key payload
export interface CreateApiKeyDto {
  name: string;
  service: 'stripe' | 'twilio' | 'firebase' | 'google_maps' | 'sendgrid' | 'aws' | 'azure' | 'google_analytics';
  environment: 'development' | 'staging' | 'production';
  keyType: 'secret' | 'public' | 'private_key' | 'access_token' | 'refresh_token' | 'webhook_secret';
  keyValue: string;
  description?: string;
  expiresAt?: string;
  rotationPolicy?: 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y';
  isPrimary?: boolean;
  accessLevel?: 'read' | 'write' | 'admin' | 'full';
  rateLimit?: number;
  tags?: string[];
}

// Update API key payload
export interface UpdateApiKeyDto {
  name?: string;
  description?: string;
  expiresAt?: string;
  rotationPolicy?: 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y';
  accessLevel?: 'read' | 'write' | 'admin' | 'full';
  rateLimit?: number;
  tags?: string[];
  isPrimary?: boolean;
}

// Toggle API key payload
export interface ToggleApiKeyDto {
  active: boolean;
}

// Rotate API key payload
export interface RotateApiKeyDto {
  reason?: string;
}

// Path parameters
export interface ApiKeyPathParams {
  id: number;
}

export interface ServiceEnvironmentParams {
  service: string;
  environment: string;
}

// API key response (single)
export interface ApiKeyResponse extends ApiKey {}

// Decrypted API key response
export interface DecryptedApiKeyResponse {
  decryptedKey: string;
}

// API keys by service/environment response
export interface ApiKeysResponse extends Array<ApiKey> {}

// Bulk update API keys payload
export interface BulkApiKeyUpdateDto {
  keyIds: number[];
  updates: {
    isActive?: boolean;
    environment?: 'development' | 'staging' | 'production';
    accessLevel?: 'read' | 'write' | 'admin' | 'full';
    rotationPolicy?: 'manual' | 'auto_30d' | 'auto_90d' | 'auto_1y';
    tags?: string[];
  };
}

// Bulk update response
export interface BulkUpdateResponse {
  updated: number;
  failed: number;
  errors?: Array<{
    keyId: number;
    error: string;
  }>;
}

// Create standard API keys payload
export interface CreateStandardApiKeysDto {
  services: Array<'stripe' | 'twilio' | 'firebase' | 'google_maps' | 'sendgrid' | 'aws' | 'azure' | 'google_analytics'>;
  environments: Array<'development' | 'staging' | 'production'>;
  includeWebhooks?: boolean;
  includePublic?: boolean;
}

// Standard keys response
export interface StandardKeysResponse {
  created: number;
  keys: ApiKey[];
  skipped: Array<{
    service: string;
    environment: string;
    reason: string;
  }>;
}

// API keys analytics response
export interface ApiKeysAnalyticsResponse {
  analytics: {
    totalKeys: number;
    activeKeys: number;
    inactiveKeys: number;
    expiringSoon: number;
    expired: number;
    byService: Record<string, {
      total: number;
      active: number;
      primary: number;
    }>;
    byEnvironment: Record<string, {
      total: number;
      active: number;
    }>;
    byKeyType: Record<string, {
      total: number;
      active: number;
    }>;
    usageStats: {
      totalUsage: number;
      averageUsage: number;
      mostUsed: Array<{
        name: string;
        usage: number;
      }>;
      leastUsed: Array<{
        name: string;
        usage: number;
      }>;
    };
    rotationStats: {
      autoRotationEnabled: number;
      keysNeedingRotation: number;
    };
  };
}

// Rotation stats response
export interface RotationStatsResponse {
  totalKeys: number;
  keysNeedingRotation: number;
  autoRotationEnabled: number;
  manualRotationOnly: number;
  recentlyRotated: number;
  rotationSchedule: Array<{
    keyId: number;
    keyName: string;
    nextRotation: string;
    rotationType: 'auto' | 'manual';
  }>;
  rotationHistory: Array<{
    keyId: number;
    keyName: string;
    rotatedAt: string;
    rotationType: 'auto' | 'manual';
    reason?: string;
  }>;
}

// Bulk rotation response
export interface BulkRotationResponse {
  message: string;
  totalKeys: number;
  successful: number;
  failed: number;
  results: Array<{
    id: number;
    name: string;
    success: boolean;
    error?: string;
  }>;
}

// Feature Flags interfaces
export interface FeatureFlag {
  id: number;
  name: string;
  key: string;
  description?: string;
  category: 'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system';
  isEnabled: boolean;
  isActive: boolean;
  rolloutPercentage: number;
  config?: any;
  userRoles?: string[];
  userIds?: string[];
  environments?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

// Feature flags list response data (content of ApiResponse.data)
export interface FeatureFlagsListResponse {
  flags: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Feature flags query parameters
export interface FeatureFlagsQueryParams {
  page?: number;
  limit?: number;
  category?: 'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system';
  isEnabled?: boolean;
  isActive?: boolean;
  search?: string;
  sortBy?: 'name' | 'category' | 'rolloutPercentage' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Create feature flag payload
export interface CreateFeatureFlagDto {
  name: string;
  key: string;
  description?: string;
  category: 'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system';
  isEnabled?: boolean;
  rolloutPercentage?: number;
  config?: any;
  userRoles?: string[];
  userIds?: string[];
  environments?: string[];
}

// Update feature flag payload
export interface UpdateFeatureFlagDto {
  name?: string;
  description?: string;
  category?: 'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system';
  isEnabled?: boolean;
  rolloutPercentage?: number;
  config?: any;
  userRoles?: string[];
  userIds?: string[];
  environments?: string[];
}

// Toggle feature flag payload
export interface ToggleFeatureFlagDto {
  enabled: boolean;
}

// Feature flag evaluation payload
export interface FeatureFlagEvaluationDto {
  key: string;
  userId?: string;
  userRole?: string;
  environment?: string;
  attributes?: Record<string, any>;
}

// Feature flag evaluation result
export interface FeatureFlagEvaluationResultDto {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  reason: string;
}

// Path parameters for feature flags
export interface FeatureFlagPathParams {
  id: number;
}

export interface FeatureFlagKeyParams {
  key: string;
}

// Feature flag response (single)
export interface FeatureFlagResponse extends FeatureFlag {}

// Create standard feature flags payload
export interface CreateStandardFeatureFlagsDto {
  categories: Array<'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system'>;
  environments?: Array<'development' | 'staging' | 'production'>;
  rolloutPercentage?: number;
  includeAdminFlags?: boolean;
  includeNotificationFlags?: boolean;
}

// Standard flags response
export interface StandardFlagsResponse {
  created: number;
  flags: FeatureFlag[];
  skipped: Array<{
    key: string;
    reason: string;
  }>;
}

// Bulk update feature flags payload
export interface BulkFeatureFlagUpdateDto {
  flagIds: number[];
  updates: {
    category?: 'payments' | 'rides' | 'admin' | 'notifications' | 'geography' | 'pricing' | 'system';
    isEnabled?: boolean;
    rolloutPercentage?: number;
    userRoles?: string[];
    userIds?: string[];
    environments?: string[];
  };
}

// Bulk flag update response
export interface BulkFlagUpdateResponse {
  updated: number;
  failed: number;
  errors?: Array<{
    flagId: number;
    error: string;
  }>;
}

// Categories overview response
export interface CategoriesOverviewResponse {
  overview: Record<string, {
    total: number;
    enabled: number;
    disabled: number;
    active: number;
    averageRollout: number;
  }>;
  totalFlags: number;
}

// Rollout status response
export interface RolloutStatusResponse {
  rolloutStatus: {
    totalEnabled: number;
    fullRollout: number;
    partialRollout: number;
    zeroRollout: number;
    averageRolloutPercentage: number;
    rolloutDistribution: Record<string, number>;
  };
}

// Cache stats response
export interface CacheStatsResponse {
  cacheStats: {
    totalEvaluations: number;
    cacheHits: number;
    cacheMisses: number;
    hitRate: number;
    averageResponseTime: number;
    cacheSize: number;
    lastCleanup: string;
    expiredEntries: number;
  };
}

// Cache warmup response
export interface CacheWarmupResponse {
  message: string;
  flagsLoaded: number;
  cacheSize: number;
  duration: number;
}

// Cache clear response
export interface CacheClearResponse {
  message: string;
  entriesCleared: number;
}

// Cache clear key response
export interface CacheClearKeyResponse {
  message: string;
  key: string;
  cleared: boolean;
}

// Cache cleanup response
export interface CacheCleanupResponse {
  message: string;
  expiredEntriesRemoved: number;
  activeEntriesRemaining: number;
}
