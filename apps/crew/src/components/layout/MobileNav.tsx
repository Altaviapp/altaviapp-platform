'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Route, User, Users, QrCode, Map, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useActiveConvexTrip } from '@/hooks';

interface NavItem {
  icon: typeof Home;
  label: string;
  href: string;
}

// Default navigation - simplified to 4 items
const defaultNavItems: NavItem[] = [
  { icon: Home, label: 'Inicio', href: '/dashboard' },
  { icon: Calendar, label: 'Calendario', href: '/calendar' },
  { icon: Route, label: 'Rutas', href: '/routes' },
  { icon: User, label: 'Perfil', href: '/profile' },
];

// Trip action items - shown when on active trip page
// These will trigger sheets in the active trip view
const getTripActionItems = (tripId: string): NavItem[] => [
  { icon: Users, label: 'Lista', href: `/trips/${tripId}/students` },
  { icon: QrCode, label: 'Check-in', href: `/trips/${tripId}/checkin` },
  { icon: Map, label: 'Mapa', href: `/trips/${tripId}/map` },
  { icon: AlertTriangle, label: 'Incidente', href: `/trips/${tripId}/incidents` },
];

interface MobileNavProps {
  hidden?: boolean;
  // When on active trip page, these callbacks open sheets instead of navigating
  onTripAction?: (action: 'students' | 'checkin' | 'map' | 'incident') => void;
}

export function MobileNav({ hidden = false, onTripAction }: MobileNavProps) {
  const pathname = usePathname();
  const { activeTrip, hasActiveTrip } = useActiveConvexTrip();

  // Hide when sidebar is open to avoid overlapping navigation
  if (hidden) return null;

  // Check if we're on an active trip page
  const isOnActiveTripPage = pathname?.includes('/trips/') && pathname?.includes('/active');

  // Use trip actions if on active trip page AND we have callbacks
  const useTripActions = isOnActiveTripPage && hasActiveTrip && onTripAction;

  const navItems = useTripActions && activeTrip
    ? getTripActionItems(activeTrip._id)
    : defaultNavItems;

  const handleClick = (item: NavItem, e: React.MouseEvent) => {
    if (useTripActions && onTripAction) {
      e.preventDefault();
      // Extract action from href
      const action = item.href.split('/').pop() as 'students' | 'checkin' | 'map' | 'incidents';
      const actionMap: Record<string, 'students' | 'checkin' | 'map' | 'incident'> = {
        students: 'students',
        checkin: 'checkin',
        map: 'map',
        incidents: 'incident',
      };
      onTripAction(actionMap[action] || 'students');
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleClick(item, e)}
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
