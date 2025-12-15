'use client';

import { useState } from 'react';
import { User, Lock, Globe, Bell, Map, Smartphone, FileText, HelpCircle, LogOut, ChevronRight, Check, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Mock user data
const mockUser = {
  name: 'María García',
  email: 'maria.garcia@ejemplo.com',
  phone: '+593 99 987 6543',
  phoneAlt: '+593 98 765 4321',
};

const languages = [
  { value: 'es', label: 'Español (Ecuador)' },
  { value: 'en', label: 'English (United States)' },
];

const timezones = [
  { value: 'America/Guayaquil', label: 'America/Guayaquil (ECT)' },
  { value: 'America/Bogota', label: 'America/Bogota (COT)' },
];

export default function SettingsPage() {
  const [user, setUser] = useState(mockUser);
  const [language, setLanguage] = useState('es');
  const [timezone, setTimezone] = useState('America/Guayaquil');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [mapView, setMapView] = useState('satellite');
  const [autoCenterMap, setAutoCenterMap] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  return (
    <div className="space-y-4 pb-8">
      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Información de Cuenta</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nombre completo</label>
            <input
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Teléfono principal</label>
            <input
              type="tel"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Teléfono alternativo</label>
            <input
              type="tel"
              value={user.phoneAlt}
              onChange={(e) => setUser({ ...user, phoneAlt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
          <button className="w-full py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Seguridad</h3>
        </div>

        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <span className="text-sm text-gray-700">Cambiar contraseña</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Autenticación de dos factores</p>
              <p className="text-xs text-gray-500">{twoFactor ? 'Activado' : 'Desactivado'}</p>
            </div>
            <button
              onClick={() => setTwoFactor(!twoFactor)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                twoFactor ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  twoFactor ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Sesiones activas</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Navegador Chrome (Este dispositivo)</span>
                <span className="text-xs text-success">Ahora</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">App móvil iOS</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Hace 2h</span>
                  <button className="text-xs text-error hover:underline">Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Preferencias</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Idioma</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              {languages.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Zona horaria</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Formato de fecha</label>
            <div className="flex gap-2">
              {['MM/DD/YYYY', 'DD/MM/YYYY'].map((format) => (
                <button
                  key={format}
                  onClick={() => setDateFormat(format)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm transition-colors',
                    dateFormat === format
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {format}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-2">Formato de hora</label>
            <div className="flex gap-2">
              {[
                { value: '12h', label: '12 horas (AM/PM)' },
                { value: '24h', label: '24 horas' },
              ].map((format) => (
                <button
                  key={format.value}
                  onClick={() => setTimeFormat(format.value)}
                  className={cn(
                    'flex-1 py-2 px-3 rounded-lg text-sm transition-colors',
                    timeFormat === format.value
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {format.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Link */}
      <Link
        href="/notifications"
        className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <span className="font-semibold text-gray-900">Configurar Notificaciones</span>
        </div>
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </Link>

      {/* Map Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Mapas</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-2">Vista predeterminada</label>
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
            <span className="text-sm text-gray-700">Centrar automáticamente en el bus</span>
            <button
              onClick={() => setAutoCenterMap(!autoCenterMap)}
              className={cn(
                'w-12 h-6 rounded-full transition-colors relative',
                autoCenterMap ? 'bg-success' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                  autoCenterMap ? 'translate-x-6' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Mostrar tráfico en tiempo real</span>
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

      {/* App Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Aplicación</h3>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Versión</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Última actualización</span>
            <span className="text-gray-900">03/12/2024</span>
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

      {/* Legal */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Información Legal</h3>
          </div>
        </div>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm text-gray-700">Términos de servicio</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm text-gray-700">Política de privacidad</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-700">Política de cookies</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Help */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Ayuda y Soporte</h3>
          </div>
        </div>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm text-gray-700">Preguntas frecuentes</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100">
          <span className="text-sm text-gray-700">Contactar soporte</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <span className="text-sm text-gray-700">Guía de uso</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Logout */}
      <button className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-center gap-2 text-error hover:bg-error/5 transition-colors">
        <LogOut className="w-5 h-5" />
        <span className="font-medium">Cerrar sesión</span>
      </button>
    </div>
  );
}
