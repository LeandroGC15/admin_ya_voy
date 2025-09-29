/**
 * Notifications Management interfaces
 */

// Notification Filters
export interface NotificationFilters {
  type?: string;
  status?: 'sent' | 'delivered' | 'read' | 'failed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  userId?: number;
  driverId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Base Notification
export interface Notification {
  id: string;
  type: 'system' | 'ride_request' | 'ride_update' | 'payment' | 'promotion' | 'announcement';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'scheduled' | 'sent' | 'delivered' | 'read' | 'failed';
  recipientType: 'user' | 'driver' | 'all';
  recipientId?: number;
  scheduledFor?: string;
  sentAt?: string;
  readAt?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Notification List Response
export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Send Notification
export interface SendNotificationRequest {
  title: string;
  message: string;
  type: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: {
    userType?: 'passenger' | 'driver' | 'all';
    countries?: number[];
    userIds?: number[];
    driverIds?: number[];
    segments?: string[];
  };
  channels: ('push' | 'email' | 'sms')[];
  scheduledFor?: string;
  expiresAt?: string;
  metadata?: Record<string, any>;
}

export interface SendNotificationResponse {
  notificationId: string;
  scheduledFor?: string;
  estimatedRecipients: number;
}

// Bulk Send Notifications
export interface BulkSendNotificationsRequest {
  notifications: Array<{
    title: string;
    message: string;
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    userId?: number;
    driverId?: number;
    channels: ('push' | 'email' | 'sms')[];
    metadata?: Record<string, any>;
  }>;
}

export interface BulkSendResponse {
  sent: number;
  failed: number;
  errors?: string[];
}

// Notification Templates
export interface NotificationTemplate {
  id: string;
  name: string;
  description?: string;
  type: string;
  subject?: string;
  messageTemplate: string;
  channels: ('push' | 'email' | 'sms')[];
  variables: string[];
  placeholders: Record<string, string>;
  isActive: boolean;
  category: string;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationTemplateRequest {
  name: string;
  description?: string;
  type: string;
  subject?: string;
  messageTemplate: string;
  channels: ('push' | 'email' | 'sms')[];
  variables: string[];
  placeholders: Record<string, string>;
  category: string;
  language: string;
}

export interface UpdateNotificationTemplateRequest {
  name?: string;
  description?: string;
  subject?: string;
  messageTemplate?: string;
  channels?: ('push' | 'email' | 'sms')[];
  variables?: string[];
  placeholders?: Record<string, string>;
  isActive?: boolean;
}

export interface NotificationTemplatesResponse {
  templates: NotificationTemplate[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Notification Analytics
export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  deliveryRate: number;
  readRate: number;
  averageDeliveryTime: number;
  averageReadTime: number;
  byType: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  byChannel: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  byPriority: Record<string, {
    sent: number;
    delivered: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  byTimeOfDay: Array<{
    hour: number;
    sent: number;
    delivered: number;
    deliveryRate: number;
  }>;
  byDayOfWeek: Array<{
    day: number;
    sent: number;
    delivered: number;
    deliveryRate: number;
  }>;
  topPerformingTemplates: Array<{
    templateId: string;
    templateName: string;
    sent: number;
    deliveryRate: number;
    readRate: number;
  }>;
  failureReasons: Record<string, number>;
}

// Analytics Filters
export interface NotificationAnalyticsFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: string;
  channel?: string;
  priority?: string;
}

// Quick Notification Actions
export interface MarkAsReadRequest {
  notificationIds: string[];
}

export interface ArchiveNotificationsRequest {
  notificationIds: string[];
  archiveReason?: string;
}

export interface RetryFailedNotificationsRequest {
  notificationIds: string[];
}

// Notification Preferences
export interface NotificationPreferences {
  userId?: number;
  driverId?: number;
  preferences: {
    push: {
      enabled: boolean;
      types: string[];
      quietHours: {
        enabled: boolean;
        startTime: string;
        endTime: string;
      };
    };
    email: {
      enabled: boolean;
      types: string[];
      frequency: 'immediate' | 'daily' | 'weekly';
    };
    sms: {
      enabled: boolean;
      types: string[];
    };
  };
  updatedAt: string;
}

export interface UpdateNotificationPreferencesRequest {
  preferences: NotificationPreferences['preferences'];
}

// Notification Categories and Types
export const NOTIFICATION_TYPES = [
  'system',
  'ride_request',
  'ride_update',
  'ride_completed',
  'ride_cancelled',
  'payment_received',
  'payment_failed',
  'payment_refunded',
  'promotion',
  'announcement',
  'driver_assigned',
  'pickup_reminder',
  'rating_reminder',
  'account_verification',
  'password_reset',
  'profile_update'
] as const;

export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;

export const NOTIFICATION_CHANNELS = ['push', 'email', 'sms'] as const;

export const NOTIFICATION_STATUSES = ['draft', 'scheduled', 'sent', 'delivered', 'read', 'failed'] as const;

// Type definitions
export type NotificationType = typeof NOTIFICATION_TYPES[number];
export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[number];
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[number];
export type NotificationStatus = typeof NOTIFICATION_STATUSES[number];
