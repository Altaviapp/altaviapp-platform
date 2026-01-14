'use client';

/**
 * NotificationDropdown Component
 *
 * Bell icon with badge that opens a dropdown panel of notifications.
 * Supports both desktop and mobile variants with appropriate touch targets.
 * Enhanced UI/UX with animations and improved empty state.
 */

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, Loader2, BellOff, CheckCheck } from 'lucide-react';
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
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle open/close with animation
  const handleToggle = () => {
    if (isOpen) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsAnimating(false);
      }, 150);
    } else {
      setIsOpen(true);
    }
  };

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsAnimating(true);
        setTimeout(() => {
          setIsOpen(false);
          setIsAnimating(false);
        }, 150);
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
        onClick={handleToggle}
        className={`
          relative flex items-center justify-center rounded-full
          transition-all duration-200 ease-out
          hover:bg-gray-100 active:scale-95
          ${isMobile ? 'w-11 h-11' : 'w-10 h-10'}
          ${isOpen ? 'bg-gray-100' : ''}
        `}
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <Bell
          className={`
            ${isMobile ? 'w-6 h-6' : 'w-5 h-5'}
            ${unreadCount > 0 ? 'text-gray-700' : 'text-gray-500'}
            transition-colors duration-200
          `}
        />
        {unreadCount > 0 && (
          <span
            className={`
              absolute flex items-center justify-center
              bg-error text-white text-xs font-bold rounded-full
              animate-in zoom-in-50 duration-200
              ${isMobile ? 'top-0 right-0 min-w-[20px] h-5 px-1' : '-top-1 -right-1 min-w-[18px] h-[18px] px-1'}
            `}
          >
            <span className="animate-pulse">{unreadCount > 99 ? '99+' : unreadCount}</span>
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={`
            absolute right-0 mt-2 bg-white rounded-2xl z-50
            shadow-[0_4px_24px_-4px_rgba(0,0,0,0.12),0_8px_32px_-8px_rgba(0,0,0,0.08)]
            border border-gray-100
            ${isMobile ? 'w-[calc(100vw-32px)] max-w-[360px] -right-2 max-h-[70vh]' : 'w-[380px] max-h-[480px]'}
            overflow-hidden flex flex-col
            ${isAnimating
              ? 'animate-out fade-out-0 zoom-out-95 duration-150'
              : 'animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200'
            }
          `}
          style={{ transformOrigin: 'top right' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 bg-gradient-to-b from-gray-50/80 to-transparent">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors duration-150"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar todas
              </button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3">Cargando...</p>
              </div>
            ) : displayedNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                {/* Empty state illustration */}
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                    <BellOff className="w-9 h-9 text-gray-300" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                </div>
                <h4 className="text-base font-medium text-gray-700 mb-1">
                  Todo al día
                </h4>
                <p className="text-sm text-gray-500 text-center max-w-[200px]">
                  No tienes notificaciones pendientes por revisar
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {displayedNotifications.map((notification, index) => (
                  <div
                    key={notification._id}
                    className="animate-in fade-in-0 slide-in-from-top-1"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <NotificationItem
                      notification={notification}
                      onMarkAsRead={onMarkAsRead}
                      onNavigate={handleNavigate}
                      variant={isMobile ? 'default' : 'compact'}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - show if there are more notifications */}
          {notifications.length > maxItems && (
            <div className="border-t border-gray-100 px-4 py-3 bg-gradient-to-t from-gray-50/80 to-transparent">
              <p className="text-xs text-center text-gray-500">
                +{notifications.length - maxItems} notificaciones más
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
