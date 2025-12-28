'use client';

import { Bus, UserCheck, Users, Radio } from 'lucide-react';
import { Tabs, TabsList, Tab } from '@/components/core';
import { cn } from '@/lib/utils';

export type FleetTabId = 'vehicles' | 'drivers' | 'monitors' | 'gps-devices';

interface FleetTabsProps {
  activeTab: FleetTabId;
  onTabChange: (tab: FleetTabId) => void;
  vehicleCount: number;
  driverCount: number;
  monitorCount: number;
  gpsDeviceCount?: number;
}

export function FleetTabs({
  activeTab,
  onTabChange,
  vehicleCount,
  driverCount,
  monitorCount,
  gpsDeviceCount = 0,
}: FleetTabsProps) {
  const tabs = [
    { id: 'vehicles' as const, label: 'Vehículos', icon: Bus, count: vehicleCount },
    { id: 'drivers' as const, label: 'Conductores', icon: UserCheck, count: driverCount },
    { id: 'monitors' as const, label: 'Monitores', icon: Users, count: monitorCount },
    { id: 'gps-devices' as const, label: 'GPS', icon: Radio, count: gpsDeviceCount },
  ];

  return (
    <Tabs value={activeTab} onChange={(value) => onTabChange(value as FleetTabId)}>
      <TabsList className="flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Tab key={tab.id} value={tab.id}>
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'bg-gray-100 text-gray-600'
                  )}
                >
                  {tab.count}
                </span>
              </div>
            </Tab>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
