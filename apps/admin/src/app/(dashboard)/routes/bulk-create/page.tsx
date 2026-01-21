'use client';

/**
 * Bulk Route Creation Page
 *
 * 6-step wizard for bulk route creation during institution onboarding.
 * Uses Google Maps optimization for route calculation.
 *
 * PRD Reference: Rutas - Creación Masiva
 */

import { PageHeader } from '@/components/shared';
import { BulkRouteWizard } from '@/components/routes/bulk-wizard';

export default function BulkCreateRoutesPage() {
  return (
    <div>
      <PageHeader
        title="Creación Masiva de Rutas"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rutas', href: '/routes' },
          { label: 'Creación Masiva' },
        ]}
        backHref="/routes"
      />

      <BulkRouteWizard />
    </div>
  );
}
