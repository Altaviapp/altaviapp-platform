'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Root page - Redirects to dashboard for UI testing
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    // Skip auth for UI testing - go directly to dashboard
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground/5 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary font-medium">Cargando...</p>
      </div>
    </div>
  );
}
