import { z } from 'zod';

// API Keys schemas for operations and responses

// Create API key schema
export const createApiKeySchema = z.object({
  name: z.string().min(3, 'Nombre debe tener al menos 3 caracteres').max(100),
  service: z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics']),
  environment: z.enum(['development', 'staging', 'production']),
  keyType: z.enum(['secret', 'public', 'private_key', 'access_token', 'refresh_token', 'webhook_secret']),
  keyValue: z.string().min(10, 'El valor de la clave debe tener al menos 10 caracteres'),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
  isPrimary: z.boolean().optional(),
  accessLevel: z.enum(['read', 'write', 'admin', 'full']).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
});

// Update API key schema
export const updateApiKeySchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
  accessLevel: z.enum(['read', 'write', 'admin', 'full']).optional(),
  rateLimit: z.number().min(1).max(10000).optional(),
  tags: z.array(z.string()).optional(),
  isPrimary: z.boolean().optional(),
});

// Toggle API key schema
export const toggleApiKeySchema = z.object({
  active: z.boolean(),
});

// Rotate API key schema
export const rotateApiKeySchema = z.object({
  newKeyValue: z.string().min(10, 'El nuevo valor de la clave debe tener al menos 10 caracteres'),
  reason: z.string().optional(),
});

// Force rotate API key schema
export const forceRotateApiKeySchema = z.object({
  reason: z.string().min(1, 'Se requiere una razón para la rotación forzada'),
});

// Create standard API keys schema
export const createStandardApiKeysSchema = z.object({
  services: z.array(z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics'])),
  environments: z.array(z.enum(['development', 'staging', 'production'])),
  includeWebhooks: z.boolean().optional(),
  includePublic: z.boolean().optional(),
});

// Bulk update API keys schema
export const bulkUpdateApiKeysSchema = z.object({
  keyIds: z.array(z.number()),
  updates: z.object({
    isActive: z.boolean().optional(),
    environment: z.enum(['development', 'staging', 'production']).optional(),
    accessLevel: z.enum(['read', 'write', 'admin', 'full']).optional(),
    rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// Search API keys schema
export const searchApiKeysSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(100).optional(),
  service: z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics']).optional(),
  environment: z.enum(['development', 'staging', 'production']).optional(),
  keyType: z.enum(['secret', 'public', 'private_key', 'access_token', 'refresh_token', 'webhook_secret']).optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'service', 'environment', 'createdAt', 'usageCount']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Rotation audit history query schema
export const rotationAuditHistorySchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  service: z.enum(['stripe', 'twilio', 'firebase', 'google_maps', 'sendgrid', 'aws', 'azure', 'google_analytics']).optional(),
});

// API Key response schemas
export const apiKeySchema = z.object({
  id: z.number(),
  name: z.string(),
  service: z.string(),
  environment: z.string(),
  keyType: z.string(),
  description: z.string().optional(),
  expiresAt: z.string().optional(),
  lastRotated: z.string().optional(),
  rotationPolicy: z.enum(['manual', 'auto_30d', 'auto_90d', 'auto_1y']).optional(),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  accessLevel: z.enum(['read', 'write', 'admin', 'full']),
  usageCount: z.number(),
  rateLimit: z.number().optional(),
  tags: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// API Key list item schema (optimized for list views)
export const apiKeyListItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  service: z.string(),
  environment: z.string(),
  isActive: z.boolean(),
  isPrimary: z.boolean(),
  expiresAt: z.string().nullable().optional(),
  usageCount: z.number().optional(),
});

// API Keys list response schema (paginated)
export const apiKeysListResponseSchema = z.object({
  keys: z.array(apiKeyListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

// Decrypted API key response schema
export const decryptedApiKeyResponseSchema = z.object({
  decryptedKey: z.string(),
});

// API keys by service/environment response schema (array of API keys)
export const apiKeysByServiceResponseSchema = z.array(apiKeySchema);

// Rotation validation response schema
export const rotationValidationResponseSchema = z.object({
  needsRotation: z.boolean(),
  reason: z.string().optional(),
  recommendedAction: z.string().optional(),
});

// Rotation audit history response schema
export const rotationAuditHistoryResponseSchema = z.object({
  total: z.number(),
  logs: z.array(z.object({
    id: z.number(),
    keyName: z.string(),
    service: z.string(),
    environment: z.string(),
    action: z.string(),
    rotatedAt: z.string(),
    performedBy: z.string(),
    reason: z.string().optional(),
    autoRotated: z.boolean(),
  })),
});

// Bulk update response schema
export const bulkUpdateResponseSchema = z.object({
  updated: z.number(),
  failed: z.number(),
  errors: z.array(z.object({
    keyId: z.number(),
    error: z.string(),
  })).optional(),
});

// Standard keys response schema
export const standardKeysResponseSchema = z.object({
  created: z.number(),
  keys: z.array(apiKeySchema),
  skipped: z.array(z.object({
    service: z.string(),
    environment: z.string(),
    reason: z.string(),
  })),
});

// Analytics response schema
export const apiKeysAnalyticsResponseSchema = z.object({
  analytics: z.object({
    totalKeys: z.number(),
    activeKeys: z.number(),
    inactiveKeys: z.number(),
    expiringSoon: z.number(),
    expired: z.number(),
    byService: z.record(z.object({
      total: z.number(),
      active: z.number(),
      primary: z.number(),
    })),
    byEnvironment: z.record(z.object({
      total: z.number(),
      active: z.number(),
    })),
    byKeyType: z.record(z.object({
      total: z.number(),
      active: z.number(),
    })),
    usageStats: z.object({
      totalUsage: z.number(),
      averageUsage: z.number(),
      mostUsed: z.array(z.object({
        name: z.string(),
        usage: z.number(),
      })),
      leastUsed: z.array(z.object({
        name: z.string(),
        usage: z.number(),
      })),
    }),
    rotationStats: z.object({
      autoRotationEnabled: z.number(),
      keysNeedingRotation: z.number(),
    }),
  }),
});

// Rotation stats response schema
export const rotationStatsResponseSchema = z.object({
  totalKeys: z.number(),
  keysNeedingRotation: z.number(),
  autoRotationEnabled: z.number(),
  manualRotationOnly: z.number(),
  recentlyRotated: z.number(),
  rotationSchedule: z.array(z.object({
    keyId: z.number(),
    keyName: z.string(),
    nextRotation: z.string(),
    rotationType: z.enum(['auto', 'manual']),
  })),
  rotationHistory: z.array(z.object({
    keyId: z.number(),
    keyName: z.string(),
    rotatedAt: z.string(),
    rotationType: z.enum(['auto', 'manual']),
    reason: z.string().optional(),
  })),
});

// Bulk rotation response schema
export const bulkRotationResponseSchema = z.object({
  message: z.string(),
  totalKeys: z.number(),
  successful: z.number(),
  failed: z.number(),
  results: z.array(z.object({
    id: z.number(),
    name: z.string(),
    success: z.boolean(),
    error: z.string().optional(),
  })),
});

// Type exports
export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type ToggleApiKeyInput = z.infer<typeof toggleApiKeySchema>;
export type RotateApiKeyInput = z.infer<typeof rotateApiKeySchema>;
export type ForceRotateApiKeyInput = z.infer<typeof forceRotateApiKeySchema>;
export type CreateStandardApiKeysInput = z.infer<typeof createStandardApiKeysSchema>;
export type BulkUpdateApiKeysInput = z.infer<typeof bulkUpdateApiKeysSchema>;
export type SearchApiKeysInput = z.infer<typeof searchApiKeysSchema>;
export type RotationAuditHistoryInput = z.infer<typeof rotationAuditHistorySchema>;

export type ApiKey = z.infer<typeof apiKeySchema>;
export type ApiKeyListItem = z.infer<typeof apiKeyListItemSchema>;
export type ApiKeysListResponse = z.infer<typeof apiKeysListResponseSchema>;
export type DecryptedApiKeyResponse = z.infer<typeof decryptedApiKeyResponseSchema>;
export type ApiKeysByServiceResponse = z.infer<typeof apiKeysByServiceResponseSchema>;
export type RotationValidationResponse = z.infer<typeof rotationValidationResponseSchema>;
export type RotationAuditHistoryResponse = z.infer<typeof rotationAuditHistoryResponseSchema>;
export type BulkUpdateResponse = z.infer<typeof bulkUpdateResponseSchema>;
export type StandardKeysResponse = z.infer<typeof standardKeysResponseSchema>;
export type ApiKeysAnalyticsResponse = z.infer<typeof apiKeysAnalyticsResponseSchema>;
export type RotationStatsResponse = z.infer<typeof rotationStatsResponseSchema>;
export type BulkRotationResponse = z.infer<typeof bulkRotationResponseSchema>;
