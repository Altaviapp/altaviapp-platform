'use client';

import { Calendar } from 'lucide-react';
import { Badge } from '@/components/core';
import { getGreeting, formatDate } from '@/lib/format';
import { ROLE_CONFIG } from '@/lib/constants';

interface GreetingHeaderProps {
  name: string;
  role: 'driver' | 'monitor';
}

export function GreetingHeader({ name, role }: GreetingHeaderProps) {
  const roleConfig = ROLE_CONFIG[role];

  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold text-gray-900">
        {getGreeting()}, {name}
      </h1>
      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
        <Calendar className="w-4 h-4" />
        <span>Hoy: {formatDate(new Date())}</span>
        <span className="text-gray-300">|</span>
        <Badge variant={roleConfig.variant} size="sm">
          {roleConfig.label}
        </Badge>
      </div>
    </div>
  );
}
