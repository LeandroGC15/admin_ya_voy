/**
 * Configuration Management interfaces
 */

// API Keys
export interface ApiKey {
  id: number;
  name: string;
  service: string;
  environment: 'development' | 'staging' | 'production';
  keyType: 'secret' | 'public';
  description?: string;
  isActive: boolean;
  isPrimary: boolean;
  expiresAt?: string;
  permissions: string[];
  tags: string[];
  lastUsed?: string;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  service: string;
  environment: 'development' | 'staging' | 'production';
  keyType: 'secret' | 'public';
  description?: string;
  expiresAt?: string;
  isPrimary: boolean;
  permissions: string[];
  tags: string[];
}

export interface UpdateApiKeyRequest {
  description?: string;
  isActive?: boolean;
  permissions?: string[];
  tags?: string[];
  expiresAt?: string;
}

export interface ApiKeyFilters {
  service?: string;
  environment?: string;
  keyType?: string;
  isActive?: boolean;
  isPrimary?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiKeysResponse {
  keys: ApiKey[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DecryptApiKeyResponse {
  decryptedKey: string;
}

export interface ToggleApiKeyRequest {
  active: boolean;
}

export interface RotateApiKeyRequest {
  reason?: string;
}

export interface BulkUpdateApiKeysRequest {
  keyIds: number[];
  updates: Partial<UpdateApiKeyRequest>;
}

export interface CreateStandardApiKeysRequest {
  services: string[];
  environments: ('development' | 'staging' | 'production')[];
}

// Feature Flags
export interface FeatureFlag {
  id: number;
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
  targetCountries: number[];
  conditions: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CreateFeatureFlagRequest {
  name: string;
  description?: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
  targetCountries: number[];
  conditions: Record<string, any>;
  expiresAt?: string;
}

export interface UpdateFeatureFlagRequest {
  description?: string;
  rolloutPercentage?: number;
  isEnabled?: boolean;
  targetUsers?: string[];
  targetCountries?: number[];
  conditions?: Record<string, any>;
  expiresAt?: string;
}

export interface FeatureFlagFilters {
  isEnabled?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FeatureFlagsResponse {
  flags: FeatureFlag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ToggleFeatureFlagRequest {
  enabled: boolean;
}

export interface EvaluateFeatureFlagRequest {
  userId?: number;
  countryId?: number;
  appVersion?: string;
  userType?: string;
}

export interface FeatureFlagEvaluationResult {
  flagName: string;
  isEnabled: boolean;
  rolloutPercentage: number;
  userIncluded: boolean;
  conditionsMet: boolean;
  reason: string;
}

// API Keys Analytics
export interface ApiKeysAnalytics {
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
}

// Rotation Statistics
export interface ApiKeyRotationStats {
  totalRotations: number;
  pendingRotations: number;
  completedRotations: number;
  failedRotations: number;
  averageRotationAge: number;
  oldestKey: {
    id: number;
    name: string;
    age: number;
  };
  keysNeedingRotation: Array<{
    id: number;
    name: string;
    age: number;
    lastRotated?: string;
  }>;
}

// Bulk Operations
export interface BulkRotateApiKeysRequest {
  criteria?: {
    environment?: string;
    service?: string;
    ageGreaterThan?: number;
  };
  reason?: string;
}
