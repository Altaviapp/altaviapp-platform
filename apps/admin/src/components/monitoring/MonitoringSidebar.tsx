'use client';

import { ReactNode } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MonitoringSidebarProps {
  title: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  children: ReactNode;
}

export function MonitoringSidebar({
  title,
  isCollapsed,
  onToggleCollapse,
  children,
}: MonitoringSidebarProps) {
  return (
    <div
      className={cn(
        'fixed right-0 top-0 h-screen bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-40 flex flex-col',
        isCollapsed ? 'w-12' : 'w-[400px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-gray-900 flex-1 ml-2 truncate">
            {title}
          </h2>
        )}
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}
