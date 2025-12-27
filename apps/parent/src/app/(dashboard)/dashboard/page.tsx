'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/LoadingState';

// Redirect old /dashboard to new /inicio
export default function DashboardRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/inicio');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingState variant="page" />
    </div>
  );
}
