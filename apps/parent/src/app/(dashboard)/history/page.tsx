'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/LoadingState';

/**
 * History page - Redirects to /historial
 *
 * This is a legacy route. The canonical history page is /historial.
 */
export default function HistoryRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/historial');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <LoadingState variant="page" />
    </div>
  );
}
