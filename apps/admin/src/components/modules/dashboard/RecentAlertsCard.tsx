'use client';

import Link from 'next/link';
import { AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, LoadingState, EmptyState } from '@/components/core';
import { SEVERITY_CONFIG, INCIDENT_TYPE_CONFIG } from '@/lib/constants';
import { formatTimeAgo } from '@/lib/format';
import { cn } from '@/lib/utils';

interface Incident {
  _id: string;
  type: string;
  severity: string;
  status: string;
  description?: string;
  _creationTime: number;
}

interface RecentAlertsCardProps {
  incidents: Incident[];
  isLoading: boolean;
}

export function RecentAlertsCard({ incidents, isLoading }: RecentAlertsCardProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'medium':
        return Info;
      default:
        return CheckCircle2;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-green-600 bg-green-100';
    }
  };

  const getIncidentLabel = (incident: Incident) => {
    const typeConfig = INCIDENT_TYPE_CONFIG[incident.type as keyof typeof INCIDENT_TYPE_CONFIG];
    if (incident.description) {
      return incident.description;
    }
    return typeConfig?.label || `Incidente: ${incident.type}`;
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900">
          Alertas Recientes
        </h2>
        <Link
          href="/incidents"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Ver todas
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando alertas..." size="sm" />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin alertas"
          description="No hay alertas recientes"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {incidents.slice(0, 3).map((incident) => {
            const Icon = getSeverityIcon(incident.severity);
            const colorClass = getSeverityColor(incident.severity);
            const isOpen = incident.status === 'open';

            return (
              <Link
                key={incident._id}
                href={`/incidents/${incident._id}`}
                className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors block"
              >
                <div className={cn('p-2 rounded-full', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {getIncidentLabel(incident)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {SEVERITY_CONFIG[incident.severity as keyof typeof SEVERITY_CONFIG]?.label || incident.severity}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatTimeAgo(incident._creationTime)}
                  </span>
                  {isOpen && (
                    <span className="w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}
