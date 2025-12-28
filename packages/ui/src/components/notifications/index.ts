/**
 * Notification Components
 *
 * Shared notification UI components for all Altaviapp apps.
 */

// Types
export type {
  NotificationType,
  NotificationCategory,
  RelatedEntityType,
  Notification,
  DeepLinkConfig,
} from './types';

// Components
export { NotificationItem, type NotificationItemProps } from './notification-item';
export { NotificationDropdown, type NotificationDropdownProps } from './notification-dropdown';
export { NotificationList, type NotificationListProps } from './notification-list';

// Utilities
export {
  CATEGORY_CONFIG,
  TYPE_CONFIG,
  getNotificationConfig,
  type CategoryConfig,
} from '../../lib/notifications/category-config';
export { formatRelativeTime } from '../../lib/notifications/format-time';
