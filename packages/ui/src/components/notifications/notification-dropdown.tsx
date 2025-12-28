'use client';

/**
 * NotificationDropdown Component
 *
 * Bell icon with badge that opens a dropdown panel of notifications.
 * Supports both desktop and mobile variants with appropriate touch targets.
 */

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2 } from 'lucide-react';
import { NotificationItem } from './notification-item';
import type { Notification } from './types';

export interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading?: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onNavigate?: (entityType: string, entityId: string) => void;
  variant?: 'desktop' | 'mobile';
  maxItems?: number;
}

export function NotificationDropdown({
  notifications,
  unreadCount,
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
  onNavigate,
  variant = 'desktop',
  maxItems = 10,
}: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const isMobile = variant === 'mobile';
  const displayedNotifications = notifications.slice(0, maxItems);

  const handleNavigate = (entityType: string, entityId: string) => {
    setIsOpen(false);
    onNavigate?.(entityType, entityId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          relative flex items-center justify-center rounded-full
          hover:bg-gray-100 transition-colors
          ${isMobile ? 'w-11 h-11' : 'w-10 h-10'}
        `}
        aria-label="Notificaciones"
      >
        <Bell className={isMobile ? 'w-6 h-6' : 'w-5 h-5'} />
        {unreadCount > 0 && (
          <span
            className={`
              absolute flex items-center justify-center
              bg-error text-white text-xs font-bold rounded-full
              ${isMobile ? 'top-0 right-0 min-w-[20px] h-5 px-1' : '-top-1 -right-1 min-w-[18px] h-[18px] px-1'}
            `}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`
            absolute right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50
            ${isMobile ? 'w-80 max-h-[70vh]' : 'w-96 max-h-[500px]'}
            overflow-hidden flex flex-col
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
              >
                <Check className="w-3 h-3" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <Bell className="w-10 h-10 mb-2 text-gray-300" />
                <p className="text-sm">No hay notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onNavigate={handleNavigate}
                    variant={isMobile ? 'default' : 'compact'}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer - show if there are more notifications */}
          {notifications.length > maxItems && (
            <div className="border-t border-gray-200 p-3">
              <p className="text-xs text-center text-gray-500">
                {notifications.length - maxItems} notificaciones más
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
