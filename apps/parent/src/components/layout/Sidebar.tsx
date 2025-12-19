'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, MapPin, Clock, Settings, LogOut, Bell, GraduationCap, FileText, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Users, label: 'Mis Hijos', href: '/students' },
  { icon: MapPin, label: 'Seguimiento', href: '/tracking' },
  { icon: FileText, label: 'Novedades', href: '/novedades' },
  { icon: Clock, label: 'Historial', href: '/history' },
  { icon: Bell, label: 'Notificaciones', href: '/notifications' },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Use real auth - no more mock fallback
  const { user, logout } = useConvexAuth();

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
              <GraduationCap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-lg">Altaviapp</span>
              <span className="text-white/70 text-xs">Portal Padres</span>
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
              <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200">
                Padre/Madre
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

        {/* Footer Actions */}
        <div className="px-3 py-4 border-t border-primary-foreground/10 space-y-1">
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
            <span>Configuración</span>
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
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
