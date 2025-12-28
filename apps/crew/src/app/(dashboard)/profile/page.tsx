'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User, Mail, Phone, Building, Award, Star, FileText, ChevronRight, Edit2, AlertCircle,
  // History tab
  Calendar, ChevronDown, Clock, Users, Sun, Moon,
  // Settings tab
  Bell, Map, Lock, Smartphone, HelpCircle, LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConvexAuth, useDriverProfile, useMonitorProfile, useTripHistory } from '@/hooks';
import { useRouter } from 'next/navigation';
import { LoadingState, EmptyState, Card, CardContent, Button, Badge, Switch } from '@/components/core';
import { PageHeader } from '@/components/shared';

type TabType = 'profile' | 'history' | 'settings';

const tabs: { id: TabType; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'history', label: 'Historial', icon: Calendar },
  { id: 'settings', label: 'Ajustes', icon: Bell },
];

// Mock stats for profile display
const mockStats = {
  tripsCompleted: 482,
  studentsTransported: 12850,
  punctuality: 98,
  rating: 4.9,
  checkinsCompleted: 3240,
  incidentsReported: 12,
};

// Mock documents for profile display
const mockDocuments = [
  { name: 'Licencia de conducir', status: 'valid', expiry: '15/08/2026' },
  { name: 'Certificado médico', status: 'valid', expiry: '20/03/2025' },
];

const LICENSE_TYPES: Record<string, string> = {
  'A': 'Tipo A - Motocicletas',
  'B': 'Tipo B - Vehículos livianos',
  'C': 'Tipo C - Taxis y camionetas',
  'D': 'Tipo D - Buses y busetas',
  'E': 'Tipo E - Camiones y tractomulas',
  'F': 'Tipo F - Especiales',
  'G': 'Tipo G - Maquinaria',
};

// History periods
const periods = [
  { value: 'week', label: 'Última semana', limit: 20 },
  { value: 'month', label: 'Último mes', limit: 50 },
  { value: 'quarter', label: 'Últimos 3 meses', limit: 100 },
];

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  if (dateStr === today) return `Hoy - ${formatDateStr(dateStr)}`;
  if (dateStr === yesterday) return `Ayer - ${formatDateStr(dateStr)}`;
  return formatDateStr(dateStr);
}

function formatDateStr(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('profile');

  // Auth and profile hooks
  const { user: authUser, isAuthenticated, isDriver, isMonitor, isLoading: authLoading, logout } = useConvexAuth();
  const driverProfile = useDriverProfile();
  const monitorProfile = useMonitorProfile();

  const profile = isDriver ? driverProfile.profile : isMonitor ? monitorProfile.profile : null;
  const profileCompleted = isDriver ? driverProfile.profileCompleted : isMonitor ? monitorProfile.profileCompleted : false;
  const isLoading = authLoading || (isDriver ? driverProfile.isLoading : monitorProfile.isLoading);

  const userName = authUser?.name || 'Usuario';
  const userEmail = authUser?.email || '';
  const userPhone = profile?.phone || profile?.user?.phone;

  // History state
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]!);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const { tripsByDate, stats: historyStats, isLoading: historyLoading, isEmpty: historyEmpty } = useTripHistory(selectedPeriod.limit);

  // Settings state
  const [notifications, setNotifications] = useState({
    newTrips: true,
    routeChanges: true,
    adminMessages: true,
    systemAlerts: true,
  });
  const [vibration, setVibration] = useState(true);
  const [mapView, setMapView] = useState('satellite');

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-1 flex gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-4">
          {/* Profile completion alert */}
          {!isLoading && !profileCompleted && (
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-warning">Perfil incompleto</p>
                  <p className="text-xs text-warning/80 mt-1">
                    Completa tu información profesional para poder operar viajes.
                  </p>
                  <Link
                    href="/profile/edit"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-medium text-warning hover:underline"
                  >
                    <Edit2 className="w-4 h-4" />
                    Completar perfil
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <Card>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {userName.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <h1 className="text-xl font-semibold text-gray-900">{userName}</h1>
                  <Badge variant={isDriver ? 'info' : 'success'} className="mt-1">
                    {isDriver ? 'Conductor' : isMonitor ? 'Auxiliar' : 'Usuario'}
                  </Badge>
                </div>
                <Link
                  href="/profile/edit"
                  className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </Link>
              </div>

              {/* Contact Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{userEmail || 'No configurado'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className={cn('text-gray-600', !userPhone && 'italic text-gray-400')}>
                    {userPhone || 'No configurado'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Info */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" />
                Información Profesional
              </h3>

              <div className="space-y-3">
                {isDriver && driverProfile.profile && (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Licencia de conducir</p>
                      {driverProfile.profile.licenseNumber ? (
                        <>
                          <p className="text-sm font-medium text-gray-900">{driverProfile.profile.licenseNumber}</p>
                          {driverProfile.profile.licenseType && (
                            <p className="text-xs text-gray-600">
                              {LICENSE_TYPES[driverProfile.profile.licenseType] || driverProfile.profile.licenseType}
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No configurado</p>
                      )}
                    </div>
                  </>
                )}

                {isMonitor && monitorProfile.profile && (
                  <div>
                    <p className="text-xs text-gray-500">Certificaciones</p>
                    <div className="mt-1 space-y-1">
                      <p className={cn('text-sm', monitorProfile.profile.firstAidCertified ? 'text-success' : 'text-gray-400')}>
                        {monitorProfile.profile.firstAidCertified ? '✓' : '○'} Primeros auxilios
                      </p>
                      <p className={cn('text-sm', monitorProfile.profile.childCareCertified ? 'text-success' : 'text-gray-400')}>
                        {monitorProfile.profile.childCareCertified ? '✓' : '○'} Cuidado infantil
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Estadísticas
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-primary">{mockStats.tripsCompleted}</p>
                  <p className="text-xs text-gray-500">Viajes completados</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-success">{mockStats.studentsTransported.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Estudiantes</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-info">{mockStats.punctuality}%</p>
                  <p className="text-xs text-gray-500">Puntualidad</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-2xl font-bold text-warning">{mockStats.rating}</p>
                    <Star className="w-5 h-5 text-warning fill-warning" />
                  </div>
                  <p className="text-xs text-gray-500">Calificación</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Period Selector */}
          <Card>
            <CardContent className="p-0">
              <div className="relative">
                <button
                  onClick={() => setShowPeriodSelector(!showPeriodSelector)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <span className="text-sm text-gray-900">{selectedPeriod.label}</span>
                  <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform', showPeriodSelector && 'rotate-180')} />
                </button>

                {showPeriodSelector && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-10 overflow-hidden">
                    {periods.map((period) => (
                      <button
                        key={period.value}
                        onClick={() => {
                          setSelectedPeriod(period);
                          setShowPeriodSelector(false);
                        }}
                        className={cn(
                          'w-full p-3 text-left text-sm hover:bg-gray-50 transition-colors',
                          selectedPeriod.value === period.value && 'bg-primary/5 text-primary'
                        )}
                      >
                        {period.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Summary */}
          <Card>
            <CardContent>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Resumen del período</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div>
                  <p className="text-xl font-bold text-primary">{historyStats.totalTrips}</p>
                  <p className="text-xs text-gray-500">Viajes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-success">{historyStats.totalStudents}</p>
                  <p className="text-xs text-gray-500">Estudiantes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-info">{historyStats.avgDuration}m</p>
                  <p className="text-xs text-gray-500">Promedio</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-warning">{historyStats.totalIncidents}</p>
                  <p className="text-xs text-gray-500">Incidentes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {historyLoading && (
            <LoadingState message="Cargando historial..." />
          )}

          {!historyLoading && historyEmpty && (
            <EmptyState
              icon={Calendar}
              title="No hay viajes completados"
              description="Tus viajes completados aparecerán aquí."
            />
          )}

          {/* Trip History List */}
          {!historyLoading && tripsByDate.map((day) => (
            <div key={day.date}>
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  {formatDateLabel(day.date)}
                </span>
              </div>

              <div className="space-y-3">
                {day.trips.map((trip) => {
                  const isIda = trip.type === 'ida';
                  return (
                    <div key={trip._id} className="bg-white rounded-xl border border-gray-200 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', isIda ? 'bg-warning/10' : 'bg-primary/10')}>
                            {isIda ? <Sun className="w-4 h-4 text-warning" /> : <Moon className="w-4 h-4 text-primary" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-sm">Viaje de {isIda ? 'Ida' : 'Vuelta'}</h3>
                            <p className="text-xs text-gray-500">{trip.route}</p>
                          </div>
                        </div>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
                          Completado
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {trip.startTime} - {trip.endTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {trip.studentsTransported}
                        </span>
                        <span>{trip.duration} min</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notificaciones
              </h3>

              <div className="space-y-4">
                {[
                  { key: 'newTrips', label: 'Nuevos viajes asignados' },
                  { key: 'routeChanges', label: 'Cambios en la ruta' },
                  { key: 'adminMessages', label: 'Mensajes de administrador' },
                  { key: 'systemAlerts', label: 'Alertas del sistema' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{item.label}</span>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={(e) => setNotifications({ ...notifications, [item.key]: e.target.checked })}
                    />
                  </div>
                ))}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-sm text-gray-700">Vibración</span>
                  <Switch
                    checked={vibration}
                    onChange={(e) => setVibration(e.target.checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Settings */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Map className="w-5 h-5 text-primary" />
                Mapas
              </h3>

              <label className="text-sm text-gray-700 block mb-2">Vista predeterminada</label>
              <div className="flex gap-2">
                {['satellite', 'streets', 'terrain'].map((view) => (
                  <Button
                    key={view}
                    variant={mapView === view ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setMapView(view)}
                    className="flex-1"
                  >
                    {view === 'satellite' ? 'Satélite' : view === 'streets' ? 'Calles' : 'Terreno'}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                Seguridad
              </h3>

              <button className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2">
                <span className="text-sm text-gray-700">Cambiar contraseña</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* App Info */}
          <Card>
            <CardContent>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-primary" />
                Aplicación
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Versión</span>
                <span className="text-gray-900">1.0.0</span>
              </div>
            </CardContent>
          </Card>

          {/* Help Links */}
          <Card>
            <CardContent className="p-0">
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Ayuda y soporte</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700">Términos y privacidad</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </CardContent>
          </Card>

          {/* Logout */}
          <Button
            variant="danger"
            onClick={handleLogout}
            leftIcon={LogOut}
            className="w-full"
          >
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  );
}
