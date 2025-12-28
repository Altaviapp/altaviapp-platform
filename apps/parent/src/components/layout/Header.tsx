'use client';

import Link from 'next/link';
import { Menu, Bell } from 'lucide-react';
import { useConvexAuth } from '@/hooks';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
  notificationCount?: number;
}

export function Header({
  title,
  onMenuClick,
  notificationCount = 0,
}: HeaderProps) {
  const { user } = useConvexAuth();

  // Get user initials
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : '??';

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left: Menu button (mobile) + Title */}
        <div className="flex items-center gap-4">
          {/* Hamburger menu - mobile only */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          {/* Page Title */}
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
            {title}
          </h1>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <Link
            href="/notifications"
            className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Notificaciones"
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </Link>

          {/* User Avatar (mobile only) */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-primary font-semibold text-xs">{userInitials}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
