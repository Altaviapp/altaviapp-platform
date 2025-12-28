'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Bus,
  Users,
  MapPin,
  GraduationCap,
  Settings,
  LogOut,
  Navigation,
  AlertTriangle,
  BarChart3,
  Building2,
  Bell,
  Satellite,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Navigation items for Admin app
 * Based on ADMIN_WIREFRAMES.md navigation structure
 */
const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Navigation, label: 'Viajes', href: '/trips' },
  { icon: Bell, label: 'Solicitudes', href: '/requests' },
  { icon: Bus, label: 'Flota', href: '/fleet' },
  { icon: Satellite, label: 'GPS Devices', href: '/fleet/gps-devices' },
  { icon: GraduationCap, label: 'Estudiantes', href: '/students' },
  { icon: MapPin, label: 'Rutas', href: '/routes' },
  { icon: Users, label: 'Usuarios', href: '/users' },
  { icon: AlertTriangle, label: 'Incidentes', href: '/incidents' },
  { icon: BarChart3, label: 'Reportes', href: '/reports' },
];

/**
 * Mock user for UI testing
 * TODO: Replace with actual auth context
 */
const mockUser = {
  name: 'Admin Demo',
  email: 'admin@altaviapp.ec',
  role: 'admin' as const,
};

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

/**
 * Admin Sidebar Component
 *
 * Based on ADMIN_WIREFRAMES.md and ALTAVIAPP-UI-PATTERNS.md:
 * - Logo at top with app name
 * - User profile below logo
 * - Main navigation items
 * - Settings + Logout in footer
 */
export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const user = mockUser;

  const userInitials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:fixed inset-y-0 left-0 z-50',
          'w-64 bg-primary min-h-screen flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl">Altaviapp</span>
              <span className="text-white/70 text-xs">Admin Dashboard</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">
                Administrador
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                  'text-sm font-medium',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-white/10 space-y-1">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-sm font-medium',
              pathname === '/settings'
                ? 'bg-white/20 text-white'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Configuración</span>
          </Link>

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-sm font-medium',
              'text-white/80 hover:bg-white/10 hover:text-white'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
