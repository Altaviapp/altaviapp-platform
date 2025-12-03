'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

/**
 * Root page - Redirects based on authentication status
 */
export default function RootPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, redirect to welcome
        router.push('/welcome');
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking auth
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground/5 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-primary font-medium">Cargando...</p>
      </div>
    </div>
  );
}
