import Link from 'next/link';
import { TrendingUp, Users, Clock, FileText } from 'lucide-react';
import { formatNumber, formatPercentage } from '@/lib/utils/formatters';

interface WeeklyStatsProps {
  stats: {
    tripsCompleted: number;
    studentsTransported: number;
    punctuality: number;
  };
}

export function WeeklyStats({ stats }: WeeklyStatsProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Resumen</h3>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-gray-600 mb-4">Esta semana:</p>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Trips Completed */}
        <div className="flex items-start gap-2">
          <span className="text-gray-600">•</span>
          <div className="flex-1">
            <span className="text-sm text-gray-600">Viajes completados: </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(stats.tripsCompleted)}
            </span>
          </div>
        </div>

        {/* Students Transported */}
        <div className="flex items-start gap-2">
          <span className="text-gray-600">•</span>
          <div className="flex-1">
            <span className="text-sm text-gray-600">Estudiantes transportados: </span>
            <span className="text-sm font-semibold text-gray-900">
              {formatNumber(stats.studentsTransported)}
            </span>
          </div>
        </div>

        {/* Punctuality */}
        <div className="flex items-start gap-2">
          <span className="text-gray-600">•</span>
          <div className="flex-1">
            <span className="text-sm text-gray-600">Puntualidad: </span>
            <span className="text-sm font-semibold text-success-dark">
              {formatPercentage(stats.punctuality)}
            </span>
          </div>
        </div>
      </div>

      {/* Link to History */}
      <Link
        href="/history"
        className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        <FileText className="w-4 h-4" />
        Ver historial completo
      </Link>
    </div>
  );
}
