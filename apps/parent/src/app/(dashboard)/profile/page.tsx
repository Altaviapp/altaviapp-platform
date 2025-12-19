'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * Profile page - Redirects to /students
 *
 * The profile page has been replaced by the students management page
 * which provides real data from Convex and allows editing.
 */
export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new students page
    router.replace('/students');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-500">Redirigiendo a Mis Hijos...</p>
      </div>
    </div>
  );
}
