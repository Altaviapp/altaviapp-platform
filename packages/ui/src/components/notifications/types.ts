/**
 * Notification Types
 *
 * Shared types for notification components across all apps.
 */

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export type NotificationCategory =
  | 'checkin'
  | 'trip_update'
  | 'eta'
  | 'novedad'
  | 'incident'
  | 'relay'
  | 'approval_request'
  | 'system';

export type RelatedEntityType =
  | 'trip'
  | 'student'
  | 'novedad'
  | 'incident'
  | 'vehicle'
  | 'route_change_request';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
  read: boolean;
  createdAt: number;
  relatedEntityType?: RelatedEntityType;
  relatedEntityId?: string;
}

export interface DeepLinkConfig {
  incident?: (id: string) => string;
  novedad?: (id: string) => string;
  trip?: (id: string) => string;
  student?: (id: string) => string;
  vehicle?: (id: string) => string;
}
