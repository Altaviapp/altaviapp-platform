'use client';

import { Info, Users, History, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TripDetailTab = 'general' | 'estudiantes' | 'paradas' | 'historial';

interface TripDetailTabsProps {
  activeTab: TripDetailTab;
  onTabChange: (tab: TripDetailTab) => void;
  studentsCount?: number;
  stopsCount?: number;
  eventCount?: number;
  className?: string;
}

const tabs: { id: TripDetailTab; label: string; icon: typeof Info }[] = [
  { id: 'general', label: 'General', icon: Info },
  { id: 'estudiantes', label: 'Estudiantes', icon: Users },
  { id: 'paradas', label: 'Paradas', icon: MapPin },
  { id: 'historial', label: 'Historial', icon: History },
];

export function TripDetailTabs({
  activeTab,
  onTabChange,
  studentsCount,
  stopsCount,
  eventCount,
  className,
}: TripDetailTabsProps) {
  const getCount = (tabId: TripDetailTab) => {
    switch (tabId) {
      case 'estudiantes':
        return studentsCount;
      case 'paradas':
        return stopsCount;
      case 'historial':
        return eventCount;
      default:
        return undefined;
    }
  };

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 p-1.5', className)}>
      <div className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {count !== undefined && count > 0 && (
                <span className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-600'
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
