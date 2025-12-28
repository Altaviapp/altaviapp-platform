'use client';

import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';

interface HeaderProps {
  title: string;
  breadcrumbs?: string[];
  onMenuClick?: () => void;
}

export function Header({
  title,
  breadcrumbs,
  onMenuClick,
}: HeaderProps) {
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

          <div>
            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                {breadcrumbs.map((crumb, index) => (
                  <span key={index} className="flex items-center gap-2">
                    {index > 0 && <span>/</span>}
                    <span>{crumb}</span>
                  </span>
                ))}
              </div>
            )}

            {/* Page Title */}
            <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
              {title}
            </h1>
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center gap-3">
          {/* Notification Dropdown */}
          <NotificationDropdown />

          {/* User Avatar (mobile only) */}
          <div className="lg:hidden w-8 h-8 rounded-full bg-accent flex items-center justify-center">
            <span className="text-primary font-semibold text-xs">JP</span>
          </div>
        </div>
      </div>
    </header>
  );
}
