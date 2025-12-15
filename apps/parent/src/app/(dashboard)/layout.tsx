'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get page title from pathname
  const getPageTitle = () => {
    if (!pathname) return 'Inicio';
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 0 || path[0] === 'dashboard') return 'Inicio';

    const titles: Record<string, string> = {
      'tracking': 'Seguimiento',
      'history': 'Historial',
      'notifications': 'Notificaciones',
      'profile': 'Perfil',
      'settings': 'Configuración',
    };

    const lastSegment = path[path.length - 1] ?? '';
    return titles[lastSegment] ?? (lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1));
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Header */}
        <Header
          title={getPageTitle()}
          onMenuClick={() => setSidebarOpen(true)}
          notificationCount={3}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-20 lg:pb-6">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileNav />
      </div>
    </div>
  );
}
