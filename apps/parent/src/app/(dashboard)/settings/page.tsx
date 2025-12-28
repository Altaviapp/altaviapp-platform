'use client';

import { useState } from 'react';
import { User, Lock, Globe, Bell, Map, Smartphone, FileText, HelpCircle, LogOut, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Card, CardContent, Button, Input, Select, Switch } from '@/components/core';
import { PageHeader } from '@/components/shared';

// Mock user data
const mockUser = {
  name: 'María García',
  email: 'maria.garcia@ejemplo.com',
  phone: '+593 99 987 6543',
  phoneAlt: '+593 98 765 4321',
};

const languageOptions = [
  { value: 'es', label: 'Español (Ecuador)' },
  { value: 'en', label: 'English (United States)' },
];

const timezoneOptions = [
  { value: 'America/Guayaquil', label: 'America/Guayaquil (ECT)' },
  { value: 'America/Bogota', label: 'America/Bogota (COT)' },
];

export default function SettingsPage() {
  const [user, setUser] = useState(mockUser);
  const [language, setLanguage] = useState('es');
  const [timezone, setTimezone] = useState('America/Guayaquil');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [twoFactor, setTwoFactor] = useState(false);
  const [mapView, setMapView] = useState('satellite');
  const [autoCenterMap, setAutoCenterMap] = useState(true);
  const [showTraffic, setShowTraffic] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Configuración"
        subtitle="Ajusta tus preferencias de la aplicación"
      />

      {/* Account Info */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Información de Cuenta</h3>
          </div>

          <div className="space-y-4">
            <Input
              label="Nombre completo"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
            <Input
              type="email"
              label="Email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
            <Input
              type="tel"
              label="Teléfono principal"
              value={user.phone}
              onChange={(e) => setUser({ ...user, phone: e.target.value })}
            />
            <Input
              type="tel"
              label="Teléfono alternativo"
              value={user.phoneAlt}
              onChange={(e) => setUser({ ...user, phoneAlt: e.target.value })}
            />
            <Button className="w-full">
              Guardar cambios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Seguridad</h3>
          </div>

          <div className="space-y-4">
            <button className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]">
              <span className="text-sm text-gray-700">Cambiar contraseña</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <Switch
              label="Autenticación de dos factores"
              description={twoFactor ? 'Activado' : 'Desactivado'}
              checked={twoFactor}
              onChange={(e) => setTwoFactor(e.target.checked)}
            />

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
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Preferencias</h3>
          </div>

          <div className="space-y-4">
            <Select
              label="Idioma"
              options={languageOptions}
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            />

            <Select
              label="Zona horaria"
              options={timezoneOptions}
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            />

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Formato de fecha</label>
              <div className="flex gap-2">
                {['MM/DD/YYYY', 'DD/MM/YYYY'].map((format) => (
                  <Button
                    key={format}
                    type="button"
                    variant={dateFormat === format ? 'primary' : 'secondary'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setDateFormat(format)}
                  >
                    {format}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Formato de hora</label>
              <div className="flex gap-2">
                {[
                  { value: '12h', label: '12h (AM/PM)' },
                  { value: '24h', label: '24 horas' },
                ].map((format) => (
                  <Button
                    key={format.value}
                    type="button"
                    variant={timeFormat === format.value ? 'primary' : 'secondary'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTimeFormat(format.value)}
                  >
                    {format.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Link */}
      <Link href="/notifications">
        <Card className="hover:bg-gray-50 transition-colors">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                <span className="font-semibold text-gray-900">Configurar Notificaciones</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Map Settings */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Map className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Mapas</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Vista predeterminada</label>
              <div className="flex gap-2">
                {[
                  { value: 'satellite', label: 'Satélite' },
                  { value: 'streets', label: 'Calles' },
                  { value: 'terrain', label: 'Terreno' },
                ].map((view) => (
                  <Button
                    key={view.value}
                    type="button"
                    variant={mapView === view.value ? 'primary' : 'secondary'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setMapView(view.value)}
                  >
                    {view.label}
                  </Button>
                ))}
              </div>
            </div>

            <Switch
              label="Centrar automáticamente en el bus"
              checked={autoCenterMap}
              onChange={(e) => setAutoCenterMap(e.target.checked)}
            />

            <Switch
              label="Mostrar tráfico en tiempo real"
              checked={showTraffic}
              onChange={(e) => setShowTraffic(e.target.checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent>
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
            <Switch
              label="Actualizar automáticamente"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            <Button variant="secondary" className="w-full">
              Buscar actualizaciones
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Información Legal</h3>
          </div>
        </div>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[44px]">
          <span className="text-sm text-gray-700">Términos de servicio</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[44px]">
          <span className="text-sm text-gray-700">Política de privacidad</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]">
          <span className="text-sm text-gray-700">Política de cookies</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </Card>

      {/* Help */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Ayuda y Soporte</h3>
          </div>
        </div>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[44px]">
          <span className="text-sm text-gray-700">Preguntas frecuentes</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[44px]">
          <span className="text-sm text-gray-700">Contactar soporte</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]">
          <span className="text-sm text-gray-700">Guía de uso</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </button>
      </Card>

      {/* Logout */}
      <Button variant="danger" leftIcon={LogOut} className="w-full">
        Cerrar sesión
      </Button>
    </div>
  );
}
