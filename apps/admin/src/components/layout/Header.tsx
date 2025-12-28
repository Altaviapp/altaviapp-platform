'use client';

import { Menu, Settings, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { NotificationDropdown } from './NotificationDropdown';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface HeaderProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  onMenuClick?: () => void;
}

/**
 * Admin Header Component
 *
 * Based on ADMIN_WIREFRAMES.md header structure:
 * - Hamburger menu (mobile only)
 * - Breadcrumb navigation (optional)
 * - Page title
 * - Date display
 * - Notifications bell
 * - Settings icon
 */
export function Header({
  title,
  breadcrumbs,
  onMenuClick,
}: HeaderProps) {
  const today = new Date().toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      {/* Main Header Row */}
      <div className="px-4 lg:px-6 py-4">
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
              {/* Breadcrumb */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 text-sm text-gray-500 mb-1">
                  {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.label} className="flex items-center gap-1">
                      {index > 0 && <ChevronRight className="w-3 h-3" />}
                      {crumb.href ? (
                        <Link
                          href={crumb.href}
                          className="hover:text-gray-700 transition-colors"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span>{crumb.label}</span>
                      )}
                    </span>
                  ))}
                </nav>
              )}

              {/* Page Title */}
              <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                {title}
              </h1>
            </div>
          </div>

          {/* Right: Date + Actions */}
          <div className="flex items-center gap-4">
            {/* Date Display - desktop only */}
            <span className="hidden md:block text-sm text-gray-500">
              Hoy: {today}
            </span>

            {/* Notification Dropdown */}
            <NotificationDropdown />

            {/* Settings - desktop only */}
            <Link
              href="/settings"
              className="hidden sm:flex p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Configuración"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
