'use client';

import { useState } from 'react';
import { User, Bell, Map, Globe, Lock, Smartphone, HelpCircle, FileText, LogOut, ChevronRight, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock user for UI testing
const mockUser = {
  name: 'Carlos Pérez',
  email: 'carlos.perez@altaviapp.ec',
  role: 'driver' as const,
};

export default function SettingsPage() {
  const user = mockUser;

  // Settings state
  const [notifications, setNotifications] = useState({
    newTrips: true,
    routeChanges: true,
    adminMessages: true,
    systemAlerts: true,
  });
  const [sound, setSound] = useState('default');
  const [vibration, setVibration] = useState(true);
  const [mapView, setMapView] = useState('satellite');
  const [autoCenter, setAutoCenter] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [language, setLanguage] = useState('es');
  const [autoUpdate, setAutoUpdate] = useState(true);

  const handleLogout = () => {
    window.location.href = '/login';
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
      </div>

      {/* Account */}
      <Link
        href="/profile"
        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-semibold">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">Ver perfil</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Link>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notificaciones
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {[
            { key: 'newTrips', label: 'Nuevos viajes asignados' },
            { key: 'routeChanges', label: 'Cambios en la ruta' },
            { key: 'adminMessages', label: 'Mensajes de administrador' },
            { key: 'systemAlerts', label: 'Alertas del sistema' },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <span className="text-sm text-gray-700">{item.label}</span>
              <button
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                className={cn(
                  'w-12 h-6 rounded-full transition-colors relative',
                  notifications[item.key as keyof typeof notifications] ? 'bg-success' : 'bg-gray-300'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-6' : 'translate-x-0.5'
                  )}
                />
              </button>
            </div>
          ))}

          <div className="pt-4 border-t border-gray-100">
            <label className="text-sm text-gray-700 block mb-2">Sonido de notificación</label>
            <select
              value={sound}
              onChange={(e) => setSound(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="default">Predeterminado</option>
              <option value="chime">Chime</option>
              <option value="bell">Campana</option>
              <option value="none">Sin sonido</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Vibración</span>
            <button
              onClick={() => setVibration(!vibration)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                vibration ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  vibration ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Map Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Map className="w-5 h-5 text-primary" />
            Mapas
          </h3>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-sm text-gray-700 block mb-2">Vista predeterminada</label>
            <div className="flex gap-2">
              {['satellite', 'streets', 'terrain'].map((view) => (
                <button
                  key={view}
                  onClick={() => setMapView(view)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-colors',
                    mapView === view
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {view === 'satellite' ? 'Satélite' : view === 'streets' ? 'Calles' : 'Terreno'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Centrar automáticamente</span>
            <button
              onClick={() => setAutoCenter(!autoCenter)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                autoCenter ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  autoCenter ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Mostrar tráfico</span>
            <button
              onClick={() => setShowTraffic(!showTraffic)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                showTraffic ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  showTraffic ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Idioma y Región
          </h3>
        </div>

        <div className="p-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="es">Español (Ecuador)</option>
            <option value="en">English (United States)</option>
          </select>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Seguridad
          </h3>
        </div>

        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm text-gray-700">Cambiar contraseña</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-700">Cerrar sesión en otros dispositivos</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* App Info */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-primary" />
            Aplicación
          </h3>
        </div>

        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Versión</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Actualizar automáticamente</span>
            <button
              onClick={() => setAutoUpdate(!autoUpdate)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                autoUpdate ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  autoUpdate ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
          <button className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
            Buscar actualizaciones
          </button>
        </div>
      </div>

      {/* Help */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">Ayuda y soporte</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">Términos y condiciones</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">Política de privacidad</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center gap-2 text-error hover:bg-error/5 transition-colors"
      >
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Cerrar sesión</span>
      </button>
    </div>
  );
}
