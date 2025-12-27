'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { LoadingState } from '@/components/shared/LoadingState';
import { useConvexAuth } from '@/hooks';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Auth protection - redirect to login if not authenticated
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Get page title from pathname
  const getPageTitle = () => {
    if (!pathname) return 'Inicio';
    const path = pathname.split('/').filter(Boolean);
    if (path.length === 0) return 'Inicio';

    const titles: Record<string, string> = {
      'inicio': 'Inicio',
      'calendario': 'Calendario',
      'hijos': 'Mis Hijos',
      'historial': 'Historial',
      'notifications': 'Notificaciones',
      'profile': 'Perfil',
      'settings': 'Configuración',
      'novedades': 'Novedades',
    };

    // Get title from first segment
    const firstSegment = path[0] ?? '';
    return titles[firstSegment] ?? (firstSegment.charAt(0).toUpperCase() + firstSegment.slice(1));
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState variant="page" />
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingState variant="page" />
      </div>
    );
  }

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
