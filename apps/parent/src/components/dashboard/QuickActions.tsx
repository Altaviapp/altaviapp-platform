'use client';

import Link from 'next/link';
import { MapPin, Clock, Bell, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: typeof MapPin;
  label: string;
  href: string;
  variant: 'primary' | 'secondary';
}

const quickActions: QuickAction[] = [
  { icon: MapPin, label: 'Ver en Mapa', href: '/tracking', variant: 'primary' },
  { icon: Clock, label: 'Historial', href: '/history', variant: 'secondary' },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {quickActions.map((action) => {
        const Icon = action.icon;

        return (
          <Link
            key={action.href}
            href={action.href}
            className={cn(
              'rounded-xl p-4 flex flex-col items-center justify-center',
              'transition-all hover:shadow-md',
              action.variant === 'primary'
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-white border border-gray-200 text-gray-900 hover:border-primary/30'
            )}
          >
            <Icon className={cn(
              'h-8 w-8 mb-2',
              action.variant === 'secondary' && 'text-gray-600'
            )} />
            <span className="font-medium text-sm">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
