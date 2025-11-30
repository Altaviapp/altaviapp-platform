'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, QrCode, History, User, Map, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  roles?: ('driver' | 'monitor' | 'admin')[]; // If undefined, show for all roles
}

// Bottom nav shows only the most important items per role
// Driver: Inicio, Viajes, Mapa, Historial, Perfil
// Monitor: Inicio, Viajes, Check-in, Estudiantes, Perfil
const allNavItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Truck, label: 'Viajes', href: '/trips' },
  { icon: Map, label: 'Mapa', href: '/map', roles: ['driver', 'admin'] },
  { icon: QrCode, label: 'Check-in', href: '/checkin', roles: ['monitor', 'admin'] },
  { icon: Users, label: 'Estudiantes', href: '/students', roles: ['monitor'] },
  { icon: History, label: 'Historial', href: '/history', roles: ['driver'] },
  { icon: User, label: 'Perfil', href: '/profile' },
];

export function MobileNav() {
  const pathname = usePathname();
  const { user, isAdmin } = useAuth();

  // Filter nav items based on user role, limit to 5 items for mobile
  const navItems = allNavItems
    .filter((item) => {
      if (!item.roles) return true;
      if (!user?.role) return false;
      if (isAdmin) return true;
      return item.roles.includes(user.role as 'driver' | 'monitor' | 'admin');
    })
    .slice(0, 5); // Max 5 items for mobile nav

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg min-w-[60px]',
                'transition-colors duration-200',
                isActive
                  ? 'text-primary'
                  : 'text-gray-600 hover:text-primary hover:bg-gray-50'
              )}
            >
              <Icon
                className={cn(
                  'w-5 h-5',
                  isActive && 'text-accent'
                )}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
