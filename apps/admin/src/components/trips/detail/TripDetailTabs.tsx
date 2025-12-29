'use client';

import { cn } from '@/lib/utils';
import { Info, Map, FileText, History, LucideIcon } from 'lucide-react';

export type TripDetailTab = 'general' | 'mapa' | 'novedades' | 'historial';

interface TabConfig {
  id: TripDetailTab;
  label: string;
  icon: LucideIcon;
  count?: number;
}

interface TripDetailTabsProps {
  activeTab: TripDetailTab;
  onTabChange: (tab: TripDetailTab) => void;
  novedadesCount?: number;
  eventCount?: number;
}

export function TripDetailTabs({
  activeTab,
  onTabChange,
  novedadesCount = 0,
  eventCount = 0,
}: TripDetailTabsProps) {
  const tabs: TabConfig[] = [
    { id: 'general', label: 'General', icon: Info },
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'novedades', label: 'Novedades', icon: FileText, count: novedadesCount },
    { id: 'historial', label: 'Historial', icon: History, count: eventCount },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 inline-flex gap-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
            )}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-bold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-200 text-gray-700'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
