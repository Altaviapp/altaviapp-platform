'use client';

/**
 * Fleet Summary Component
 *
 * Displays summary cards showing available resources for bulk route creation:
 * - Active vehicles with capacity
 * - Active drivers with valid licenses
 * - Active monitors
 * - Students without route assignment
 *
 * PRD Reference: US-003 - Step 1 - Fleet and student summary display
 */

import { Bus, User, Users, GraduationCap, MapPin, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FleetSummaryData {
  vehicles: {
    count: number;
    totalCapacity: number;
  };
  drivers: {
    count: number;
    withValidLicense: number;
  };
  monitors: {
    count: number;
  };
  students: {
    totalWithoutRoute: number;
    withGps: number;
    withoutGps: number;
  };
}

interface FleetSummaryProps {
  data: FleetSummaryData | undefined;
  isLoading: boolean;
  routeType: 'pickup' | 'dropoff' | '';
}

interface SummaryCardProps {
  icon: React.ElementType;
  title: string;
  count: number;
  subtitle?: string;
  warning?: boolean;
  success?: boolean;
  iconColor?: string;
}

function SummaryCard({
  icon: Icon,
  title,
  count,
  subtitle,
  warning,
  success,
  iconColor = 'text-primary',
}: SummaryCardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border p-4 transition-colors',
        warning && 'border-warning bg-warning/5',
        success && 'border-success bg-success/5',
        !warning && !success && 'border-gray-200'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            warning && 'bg-warning/20',
            success && 'bg-success/20',
            !warning && !success && 'bg-primary/10'
          )}
        >
          <Icon
            className={cn(
              'w-5 h-5',
              warning && 'text-warning',
              success && 'text-success',
              !warning && !success && iconColor
            )}
          />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{count}</p>
          <p className="text-sm text-gray-500">{title}</p>
          {subtitle && (
            <p
              className={cn(
                'text-xs mt-0.5',
                warning ? 'text-warning' : 'text-gray-400'
              )}
            >
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gray-200" />
        <div>
          <div className="h-8 w-12 bg-gray-200 rounded mb-1" />
          <div className="h-4 w-20 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

export function FleetSummary({
  data,
  isLoading,
  routeType,
}: FleetSummaryProps) {
  // Show skeleton while loading or no route type selected
  if (isLoading || !routeType || !data) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-medium text-gray-600">
            Resumen de Recursos Disponibles
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  const routeTypeLabel = routeType === 'pickup' ? 'recogida' : 'entrega';
  const hasNoStudents = data.students.totalWithoutRoute === 0;
  const hasNoVehicles = data.vehicles.count === 0;
  const hasNoDrivers = data.drivers.withValidLicense === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-gray-500" />
        <p className="text-sm font-medium text-gray-700">
          Resumen de Recursos Disponibles
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          icon={Bus}
          title="Vehículos"
          count={data.vehicles.count}
          subtitle={`${data.vehicles.totalCapacity} asientos`}
          warning={hasNoVehicles}
        />

        <SummaryCard
          icon={User}
          title="Conductores"
          count={data.drivers.withValidLicense}
          subtitle={
            data.drivers.count > data.drivers.withValidLicense
              ? `${data.drivers.count - data.drivers.withValidLicense} sin licencia válida`
              : 'Con licencia vigente'
          }
          warning={hasNoDrivers}
        />

        <SummaryCard
          icon={Users}
          title="Monitores"
          count={data.monitors.count}
          subtitle="Disponibles"
        />

        <SummaryCard
          icon={GraduationCap}
          title="Estudiantes sin ruta"
          count={data.students.totalWithoutRoute}
          subtitle={`Para ${routeTypeLabel}`}
          warning={hasNoStudents}
          success={!hasNoStudents && data.students.withGps === data.students.totalWithoutRoute}
        />
      </div>

      {/* Warning for students without GPS */}
      {data.students.withoutGps > 0 && data.students.totalWithoutRoute > 0 && (
        <div className="flex items-start gap-2 bg-warning/10 border border-warning/20 rounded-lg p-3">
          <MapPin className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-warning font-medium">
              {data.students.withoutGps} estudiante(s) sin ubicación GPS
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Estos estudiantes no podrán ser incluidos en rutas optimizadas
              hasta que se configure su ubicación.
            </p>
          </div>
        </div>
      )}

      {/* Warning for no students */}
      {hasNoStudents && (
        <div className="flex items-start gap-2 bg-error/10 border border-error/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-error font-medium">
              No hay estudiantes disponibles para asignar
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Todos los estudiantes activos ya tienen una ruta de {routeTypeLabel}{' '}
              asignada, o no hay estudiantes registrados.
            </p>
          </div>
        </div>
      )}

      {/* Warning for no vehicles */}
      {hasNoVehicles && (
        <div className="flex items-start gap-2 bg-error/10 border border-error/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-error font-medium">
              No hay vehículos activos disponibles
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Registra al menos un vehículo activo antes de crear rutas.
            </p>
          </div>
        </div>
      )}

      {/* Warning for no drivers */}
      {hasNoDrivers && !hasNoVehicles && (
        <div className="flex items-start gap-2 bg-error/10 border border-error/20 rounded-lg p-3">
          <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-error font-medium">
              No hay conductores con licencia válida
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Verifica que los conductores tengan licencias vigentes antes de crear rutas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
