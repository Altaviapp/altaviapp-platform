'use client';

import { ReactNode } from 'react';
import { ChevronRight, ChevronLeft, X, List } from 'lucide-react';
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
    <>
      {/* Mobile overlay backdrop */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onToggleCollapse}
        />
      )}

      {/* Mobile FAB to open sidebar */}
      {isCollapsed && (
        <button
          onClick={onToggleCollapse}
          className="fixed bottom-20 right-4 z-40 md:hidden w-14 h-14 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
          aria-label="Ver lista de viajes"
        >
          <List className="w-6 h-6" />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 h-screen bg-white border-l border-gray-200 shadow-lg transition-all duration-300 ease-in-out z-40 flex flex-col',
          // Mobile: full screen overlay, slides from right
          'w-full right-0 md:w-auto',
          // Desktop: fixed width sidebar
          isCollapsed
            ? '-right-full md:right-0 md:w-12'
            : 'right-0 md:w-[400px]'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          {/* Mobile: X button to close */}
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors md:hidden"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>

          {/* Desktop: Collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex p-2 hover:bg-gray-200 rounded-lg transition-colors"
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
    </>
  );
}
