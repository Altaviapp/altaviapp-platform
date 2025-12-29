'use client';

import { cn } from '@/lib/utils';
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react';

export type CalendarView = 'day' | 'week' | 'month';

interface TripCalendarTabsProps {
  activeView: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

const TABS: { view: CalendarView; label: string; icon: typeof Calendar }[] = [
  { view: 'day', label: 'Dia', icon: Calendar },
  { view: 'week', label: 'Semana', icon: CalendarDays },
  { view: 'month', label: 'Mes', icon: CalendarRange },
];

export function TripCalendarTabs({ activeView, onViewChange }: TripCalendarTabsProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {TABS.map(({ view, label, icon: Icon }) => (
        <button
          key={view}
          onClick={() => onViewChange(view)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors',
            activeView === view
              ? 'bg-white text-primary shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  );
}
