'use client';

import { Bus, CheckCircle, Clock, AlertTriangle, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type ActivityType = 'pickup' | 'dropoff' | 'eta' | 'alert' | 'notification';

interface Activity {
  id: number;
  student: string;
  action: string;
  time: string;
  type: ActivityType;
}

interface ActivityListProps {
  activities: Activity[];
  limit?: number;
  title?: string;
}

const activityConfig: Record<ActivityType, {
  bgColor: string;
  iconColor: string;
  icon: typeof Bus;
}> = {
  pickup: {
    bgColor: 'bg-blue-100',
    iconColor: 'text-blue-600',
    icon: Bus,
  },
  dropoff: {
    bgColor: 'bg-green-100',
    iconColor: 'text-green-600',
    icon: CheckCircle,
  },
  eta: {
    bgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
    icon: Clock,
  },
  alert: {
    bgColor: 'bg-red-100',
    iconColor: 'text-red-600',
    icon: AlertTriangle,
  },
  notification: {
    bgColor: 'bg-gray-100',
    iconColor: 'text-gray-600',
    icon: Bell,
  },
};

export function ActivityList({ activities, limit, title = 'Actividad Reciente' }: ActivityListProps) {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  if (displayActivities.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <p className="text-sm text-gray-500 text-center py-4">
          No hay actividad reciente
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-100">
        {displayActivities.map((activity) => {
          const config = activityConfig[activity.type] || activityConfig.notification;
          const Icon = config.icon;

          return (
            <div key={activity.id} className="p-4 flex items-center">
              <div className={cn('p-2 rounded-full', config.bgColor)}>
                <Icon className={cn('h-4 w-4', config.iconColor)} />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.student}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {activity.action}
                </p>
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                {activity.time}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
