'use client';

import { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, TrendingUp, TrendingDown, Users, Bus, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth, useReportsDashboard, useTripReport, useIncidentReport } from '@/hooks';

const reportTypes = [
  { id: 'trips', name: 'Reporte de Viajes', description: 'Detalle de todos los viajes realizados', icon: Bus },
  { id: 'students', name: 'Reporte de Estudiantes', description: 'Asistencia y check-ins de estudiantes', icon: Users },
  { id: 'routes', name: 'Reporte de Rutas', description: 'Rendimiento y estadísticas por ruta', icon: MapPin },
  { id: 'incidents', name: 'Reporte de Incidentes', description: 'Histórico de incidentes reportados', icon: FileText },
];

// Helper to get period date range
function getPeriodDates(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0] ?? '';
  let startDate: string;

  switch (period) {
    case 'today':
      startDate = endDate;
      break;
    case 'week': {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      startDate = weekAgo.toISOString().split('T')[0] ?? '';
      break;
    }
    case 'month': {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      startDate = monthAgo.toISOString().split('T')[0] ?? '';
      break;
    }
    case 'quarter': {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      startDate = quarterAgo.toISOString().split('T')[0] ?? '';
      break;
    }
    default: {
      const defaultStart = new Date(now);
      defaultStart.setDate(defaultStart.getDate() - 7);
      startDate = defaultStart.toISOString().split('T')[0] ?? '';
    }
  }

  return { startDate, endDate };
}

// Day name mapping
const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Get auth context
  const { institutionId } = useConvexAuth();

  // Fetch dashboard data
  const { metrics: dashboardMetrics, dailyStats, topRoutes, isLoading } = useReportsDashboard(institutionId);

  // Get period dates for reports preview
  const { startDate, endDate } = useMemo(() => getPeriodDates(selectedPeriod), [selectedPeriod]);

  // Fetch trip report (for preview)
  const { trips: tripReportData, isLoading: tripsLoading } = useTripReport(
    institutionId,
    { startDate, endDate }
  );

  // Fetch incident report (for preview)
  const { incidents: incidentReportData, isLoading: incidentsLoading } = useIncidentReport(
    institutionId,
    { startDate, endDate }
  );

  // Build metrics array from real data
  const metrics = useMemo(() => {
    if (!dashboardMetrics) {
      return [
        { label: 'Viajes Completados', value: '-', change: 0, trend: 'up' as const, icon: Bus, color: 'bg-primary' },
        { label: 'Estudiantes Transportados', value: '-', change: 0, trend: 'up' as const, icon: Users, color: 'bg-success' },
        { label: 'Puntualidad Promedio', value: '-', change: 0, trend: 'up' as const, icon: Clock, color: 'bg-info' },
        { label: 'Incidentes Reportados', value: '-', change: 0, trend: 'up' as const, icon: BarChart3, color: 'bg-warning' },
      ];
    }

    return [
      {
        label: 'Viajes Completados',
        value: dashboardMetrics.trips.total.toLocaleString(),
        change: 12, // TODO: Calculate change from previous period
        trend: 'up' as const,
        icon: Bus,
        color: 'bg-primary',
      },
      {
        label: 'Estudiantes Transportados',
        value: dashboardMetrics.students.transported.toLocaleString(),
        change: 8,
        trend: 'up' as const,
        icon: Users,
        color: 'bg-success',
      },
      {
        label: 'Puntualidad Promedio',
        value: `${dashboardMetrics.punctuality}%`,
        change: dashboardMetrics.punctuality >= 95 ? 2 : -2,
        trend: dashboardMetrics.punctuality >= 95 ? 'up' as const : 'down' as const,
        icon: Clock,
        color: 'bg-info',
      },
      {
        label: 'Incidentes Reportados',
        value: dashboardMetrics.incidents.total.toLocaleString(),
        change: -25,
        trend: 'up' as const, // Less incidents is good
        icon: BarChart3,
        color: 'bg-warning',
      },
    ];
  }, [dashboardMetrics]);

  // Format daily stats for display
  const formattedDailyStats = useMemo(() => {
    if (!dailyStats || dailyStats.length === 0) {
      // Return mock data when no real data
      return [
        { day: 'Lun', trips: 0, completed: 0 },
        { day: 'Mar', trips: 0, completed: 0 },
        { day: 'Mié', trips: 0, completed: 0 },
        { day: 'Jue', trips: 0, completed: 0 },
        { day: 'Vie', trips: 0, completed: 0 },
      ];
    }

    return dailyStats.map((stat: { date: string; dayOfWeek: string; total: number; completed: number; cancelled: number; inProgress: number }) => {
      const date = new Date(stat.date);
      return {
        day: dayNames[date.getDay()] ?? 'N/A',
        trips: stat.total,
        completed: stat.completed,
      };
    });
  }, [dailyStats]);

  // Get max trips for chart scaling
  const maxTrips = Math.max(...formattedDailyStats.map(s => s.trips), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes y Análisis</h1>
          <p className="text-gray-500">Métricas y estadísticas de operación</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Último Trimestre</option>
          </select>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Download className="w-5 h-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-2 text-gray-500">Cargando métricas...</span>
        </div>
      )}

      {/* Key Metrics */}
      {!isLoading && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', metric.color)}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={cn(
                    'flex items-center gap-1 text-sm font-medium',
                    metric.trend === 'up' && metric.change > 0 ? 'text-success' :
                    metric.trend === 'down' && metric.change < 0 ? 'text-error' : 'text-success'
                  )}>
                    {metric.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isLoading && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily Stats Chart */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Viajes por Día</h2>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {formattedDailyStats.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Sin datos disponibles</p>
              ) : (
                formattedDailyStats.map((day: { day: string; trips: number; completed: number }, index: number) => (
                  <div key={`${day.day}-${index}`} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-medium text-gray-600">{day.day}</span>
                    <div className="flex-1">
                      <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                        <div
                          className="h-full bg-primary rounded-lg flex items-center justify-end pr-2"
                          style={{ width: `${(day.trips / maxTrips) * 100}%` }}
                        >
                          {day.trips > 0 && (
                            <span className="text-xs text-white font-medium">{day.trips}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 w-20 text-right">{day.completed} comp.</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Routes */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Rutas Más Activas</h2>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {(!topRoutes || topRoutes.length === 0) ? (
                <p className="text-gray-500 text-center py-4">Sin rutas registradas</p>
              ) : (
                topRoutes.map((route: { id: string; name: string; type: string; totalTrips: number; completedTrips: number; studentsAssigned: number; punctuality: number }, index: number) => (
                  <div key={route.id} className="flex items-center gap-4">
                    <span className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    )}>
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{route.name}</p>
                      <p className="text-xs text-gray-500">{route.totalTrips} viajes • {route.studentsAssigned} estudiantes</p>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        'text-sm font-medium',
                        route.punctuality >= 95 ? 'text-success' : route.punctuality >= 90 ? 'text-warning' : 'text-error'
                      )}>
                        {route.punctuality}%
                      </p>
                      <p className="text-xs text-gray-500">puntualidad</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Generate Reports */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Generar Reportes</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-colors',
                  selectedReport === report.id
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <Icon className={cn(
                  'w-8 h-8 mb-3',
                  selectedReport === report.id ? 'text-primary' : 'text-gray-400'
                )} />
                <p className="font-medium text-gray-900">{report.name}</p>
                <p className="text-sm text-gray-500 mt-1">{report.description}</p>
              </button>
            );
          })}
        </div>
        {selectedReport && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                <input
                  type="date"
                  value={reportStartDate}
                  onChange={(e) => setReportStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                <input
                  type="date"
                  value={reportEndDate}
                  onChange={(e) => setReportEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Formato</label>
                <select className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Download className="w-5 h-5" />
                Generar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Preview - Trips */}
      {selectedReport === 'trips' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa: Reporte de Viajes</h2>
            {tripsLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>
          {tripReportData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay viajes en el período seleccionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Ruta</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-2 text-right font-medium text-gray-700">Estudiantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tripReportData.slice(0, 10).map((trip: { id: string; date: string; status: string; routeName: string; routeType?: string; driverName: string; vehiclePlate: string; startTime?: number; endTime?: number; duration?: number | null; studentsCheckedIn: number }) => (
                    <tr key={trip.id}>
                      <td className="px-4 py-2 text-gray-900">
                        {new Date(trip.date).toLocaleDateString('es-EC')}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{trip.routeName || 'Sin ruta'}</td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          trip.routeType === 'pickup' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                        )}>
                          {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          trip.status === 'completed' ? 'bg-green-100 text-green-700' :
                          trip.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          trip.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {trip.status === 'completed' ? 'Completado' :
                           trip.status === 'in_progress' ? 'En progreso' :
                           trip.status === 'cancelled' ? 'Cancelado' :
                           'Programado'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right text-gray-600">{trip.studentsCheckedIn || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tripReportData.length > 10 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Mostrando 10 de {tripReportData.length} viajes
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Report Preview - Incidents */}
      {selectedReport === 'incidents' && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Vista Previa: Reporte de Incidentes</h2>
            {incidentsLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
          </div>
          {incidentReportData.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No hay incidentes en el período seleccionado</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Fecha</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Tipo</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Severidad</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Estado</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Descripción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {incidentReportData.slice(0, 10).map((incident: { id: string; date?: string; time: string; type: string; severity: string; status: string; description: string; reportedBy: string; routeName: string; location: string }) => (
                    <tr key={incident.id}>
                      <td className="px-4 py-2 text-gray-900">
                        {incident.date ? new Date(incident.date).toLocaleDateString('es-EC') : '-'}
                      </td>
                      <td className="px-4 py-2">
                        <span className="capitalize">{incident.type}</span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                          incident.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        )}>
                          {incident.severity === 'critical' ? 'Crítico' :
                           incident.severity === 'high' ? 'Alto' :
                           incident.severity === 'medium' ? 'Medio' :
                           'Bajo'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                          incident.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        )}>
                          {incident.status === 'resolved' ? 'Resuelto' :
                           incident.status === 'investigating' ? 'Investigando' :
                           'Pendiente'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-gray-600 max-w-xs truncate">{incident.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {incidentReportData.length > 10 && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Mostrando 10 de {incidentReportData.length} incidentes
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
