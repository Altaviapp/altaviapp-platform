'use client';

import { Users, CheckCircle, Clock, Bus } from 'lucide-react';
import { StatsGrid, StatItem } from '@/components/shared';

interface TodayStatsProps {
  completed: number;
  scheduled: number;
  studentsTransported: number;
  isLoading?: boolean;
}

export function TodayStats({ completed, scheduled, studentsTransported, isLoading }: TodayStatsProps) {
  const stats: StatItem[] = [
    {
      label: 'Completados',
      value: completed,
      icon: CheckCircle,
      color: 'success',
    },
    {
      label: 'Programados',
      value: scheduled,
      icon: Clock,
      color: 'info',
    },
    {
      label: 'Transportados',
      value: studentsTransported,
      icon: Users,
      color: 'default',
    },
  ];

  return <StatsGrid stats={stats} columns={3} isLoading={isLoading} />;
}
