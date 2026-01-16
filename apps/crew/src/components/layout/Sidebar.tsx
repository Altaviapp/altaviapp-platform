'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Truck, User, LogOut, Route, Calendar, Bell, Clock, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';
import type { UserRole } from '@/types';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
}

// Simplified navigation - 6 main items
// Check-in, Map, Students, Incidents are now within active trip context
const navItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Calendar, label: 'Calendario', href: '/calendar' },
  { icon: Route, label: 'Rutas', href: '/routes' },
  { icon: Bell, label: 'Notificaciones', href: '/notifications' },
  { icon: User, label: 'Perfil', href: '/profile' },
  { icon: Clock, label: 'Historial', href: '/historial' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Use real auth
  const { user, isDriver, isMonitor, logout } = useConvexAuth();

  // Get user role display name
  const userRole = (user as { role?: UserRole })?.role ?? 'driver';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const roleDisplayName = isDriver ? 'Conductor' : isMonitor ? 'Monitor' : 'Admin';

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      // On error, still redirect to login
      router.push('/login');
    }
  };

  // Get user initials
  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
    : '??';

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50',
          'w-60 bg-primary min-h-screen flex flex-col',
          'transform transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">Altaviapp</span>
              <span className="text-white/70 text-xs">Crew App</span>
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="px-6 py-4 border-b border-primary-foreground/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <span className="text-primary font-semibold text-sm">
                {userInitials}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <div className="flex items-center gap-2">
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  isDriver && 'bg-blue-500/30 text-blue-200',
                  isMonitor && 'bg-green-500/30 text-green-200',
                  isAdmin && 'bg-purple-500/30 text-purple-200'
                )}>
                  {roleDisplayName}
                </span>
              </div>
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
                    ? 'bg-primary-foreground/20 text-white'
                    : 'text-white/80 hover:bg-primary-foreground/10 hover:text-white'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer - Settings and Logout */}
        <div className="px-3 py-4 border-t border-primary-foreground/10 safe-area-pb space-y-1">
          <Link
            href="/settings"
            onClick={onClose}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-sm font-medium',
              pathname === '/settings'
                ? 'bg-primary-foreground/20 text-white'
                : 'text-white/80 hover:bg-primary-foreground/10 hover:text-white'
            )}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span>Configuracion</span>
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
              'text-sm font-medium',
              'text-white/80 hover:bg-primary-foreground/10 hover:text-white'
            )}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>
    </>
  );
}
