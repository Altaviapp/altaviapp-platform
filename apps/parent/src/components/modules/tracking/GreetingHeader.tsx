'use client';

import { Calendar } from 'lucide-react';
import { getGreeting } from '@/lib/format';

interface GreetingHeaderProps {
  name?: string;
}

export function GreetingHeader({ name }: GreetingHeaderProps) {
  const greeting = getGreeting();
  const today = new Date().toLocaleDateString('es-EC', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="mb-4">
      <h1 className="text-xl font-bold text-gray-900">
        {greeting}{name ? `, ${name}` : ''}
      </h1>
      <div className="flex items-center gap-2 text-gray-500 mt-1">
        <Calendar className="w-4 h-4" />
        <span className="text-sm capitalize">{today}</span>
      </div>
    </div>
  );
}
