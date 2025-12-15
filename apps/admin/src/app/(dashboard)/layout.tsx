'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar, Header } from '@/components/layout';

/**
 * Page title mapping for Admin routes
 */
const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  trips: 'Viajes',
  fleet: 'Flota',
  students: 'Estudiantes',
  routes: 'Rutas',
  users: 'Usuarios',
  incidents: 'Incidentes',
  reports: 'Reportes',
  settings: 'Configuración',
};

/**
 * Admin Dashboard Layout
 *
 * Based on ADMIN_WIREFRAMES.md structure:
 * - Fixed sidebar on left (desktop)
 * - Collapsible sidebar (mobile)
 * - Sticky header with title and actions
 * - Main content area with padding
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract page title from pathname
  const getPageTitle = (): string => {
    if (!pathname) return 'Dashboard';
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return 'Dashboard';
    const currentPage = segments[segments.length - 1] ?? 'dashboard';
    return pageTitles[currentPage] ?? 'Dashboard';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - fixed on desktop */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area - offset by sidebar width on desktop */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Header */}
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
          notificationCount={3}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
