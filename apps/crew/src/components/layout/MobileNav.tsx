'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Truck, QrCode, History, User, Map, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth } from '@/hooks';
import type { UserRole } from '@/types';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
  roles?: ('driver' | 'monitor' | 'admin')[]; // If undefined, show for all roles
}

// Bottom nav shows important items for all crew members
// Both drivers and monitors have access to core functionality:
// - Check-in: Both can scan QR and register students
// - Mapa: Both can see route and vehicle location
// - Historial: Both can see trip history
// Driver-specific: Vehicle management (shown in dashboard)
const allNavItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Truck, label: 'Viajes', href: '/trips' },
  { icon: QrCode, label: 'Check-in', href: '/checkin' }, // Both driver and monitor
  { icon: Map, label: 'Mapa', href: '/map' }, // Both driver and monitor
  { icon: User, label: 'Perfil', href: '/profile' },
];

// Mock user for UI testing (fallback)
const mockUser: { name: string; email: string; role: UserRole } = {
  name: 'Carlos Pérez',
  email: 'carlos@test.com',
  role: 'driver',
};

export function MobileNav() {
  const pathname = usePathname();

  // Use real auth with fallback to mock for UI testing
  const { user: authUser, isAuthenticated } = useConvexAuth();

  // Auth state - prefer real auth, fallback to mock for UI testing
  const user = isAuthenticated && authUser ? authUser : mockUser;
  const userRole = (user as { role?: UserRole })?.role ?? 'driver';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';

  // Filter nav items based on user role, limit to 5 items for mobile
  const navItems = allNavItems
    .filter((item) => {
      if (!item.roles) return true;
      if (!userRole) return false;
      if (isAdmin) return true;
      return item.roles.includes(userRole as 'driver' | 'monitor' | 'admin');
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
