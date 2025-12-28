'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Building,
  Bell,
  Shield,
  ChevronRight,
  GraduationCap,
  Users,
  MapPin,
  Save,
  FileText,
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Select, Switch } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';

/**
 * Settings Page
 *
 * Institution configuration and preferences.
 * Features: institution info, notifications, security, general settings.
 *
 * PRD Reference: Settings Module
 */

// Mock institution data - will be connected to Convex
const institution = {
  name: 'Escuela Altaviapp',
  address: 'Av. Principal 123, Quito',
  phone: '+593 2 123 4567',
  email: 'admin@escuela-altaviapp.ec',
  timezone: 'America/Guayaquil',
};

type SettingsTab = 'institution' | 'notifications' | 'security' | 'general';

const TABS = [
  { id: 'institution' as const, label: 'Institución', icon: Building },
  { id: 'notifications' as const, label: 'Notificaciones', icon: Bell },
  { id: 'security' as const, label: 'Seguridad', icon: Shield },
  { id: 'general' as const, label: 'General', icon: Settings },
];

const QUICK_LINKS = [
  { href: '/settings/school', label: 'Ubicación del Colegio', icon: MapPin },
  { href: '/settings/grades', label: 'Grados', icon: GraduationCap },
  { href: '/settings/users', label: 'Usuarios', icon: Users },
  { href: '/settings/novedades', label: 'Tipos de Novedades', icon: FileText },
];

const NOTIFICATION_OPTIONS = [
  { key: 'tripStart', label: 'Inicio de viaje', description: 'Notificar cuando un viaje inicie' },
  { key: 'tripEnd', label: 'Fin de viaje', description: 'Notificar cuando un viaje finalice' },
  { key: 'delays', label: 'Retrasos', description: 'Alertar sobre retrasos en las rutas' },
  { key: 'incidents', label: 'Incidentes', description: 'Notificar incidentes reportados' },
  { key: 'dailyReport', label: 'Reporte diario', description: 'Recibir resumen diario por email' },
];

const ROLE_PERMISSIONS = [
  { role: 'Administrador', permissions: 'Acceso completo', users: 3 },
  { role: 'Conductor', permissions: 'Viajes, Check-in', users: 18 },
  { role: 'Monitor', permissions: 'Check-in, Incidentes', users: 7 },
  { role: 'Padre', permissions: 'Solo lectura', users: 128 },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('institution');
  const [notifications, setNotifications] = useState({
    tripStart: true,
    tripEnd: true,
    delays: true,
    incidents: true,
    dailyReport: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Configuración"
        subtitle="Administra la configuración de tu institución"
      />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <Card>
            <CardContent className="p-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors',
                      activeTab === tab.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}

              <div className="border-t border-gray-100 mt-2 pt-2">
                {QUICK_LINKS.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{link.label}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Institution Settings */}
          {activeTab === 'institution' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Información de la Institución</h2>
                <p className="text-sm text-gray-500">Datos generales de tu institución</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de la Institución
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <Button variant="secondary">Subir Logo</Button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input
                    label="Nombre de la Institución"
                    defaultValue={institution.name}
                  />
                  <Input
                    label="Dirección"
                    defaultValue={institution.address}
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    defaultValue={institution.phone}
                  />
                  <Input
                    label="Email de Contacto"
                    type="email"
                    defaultValue={institution.email}
                  />
                  <Select
                    label="Zona Horaria"
                    defaultValue={institution.timezone}
                    options={[
                      { value: 'America/Guayaquil', label: 'Ecuador (Guayaquil) - GMT-5' },
                      { value: 'America/Bogota', label: 'Colombia (Bogotá) - GMT-5' },
                      { value: 'America/Lima', label: 'Perú (Lima) - GMT-5' },
                    ]}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <Button variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h2>
                <p className="text-sm text-gray-500">Administra qué notificaciones recibirás</p>
              </CardHeader>
              <CardContent className="space-y-1">
                {NOTIFICATION_OPTIONS.map((item) => (
                  <Switch
                    key={item.key}
                    label={item.label}
                    description={item.description}
                    checked={notifications[item.key as keyof typeof notifications]}
                    onChange={() => toggleNotification(item.key as keyof typeof notifications)}
                  />
                ))}
              </CardContent>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Seguridad de la Cuenta</h2>
                  <p className="text-sm text-gray-500">Configuración de seguridad y acceso</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Cambiar Contraseña</p>
                      <p className="text-sm text-gray-500">Actualiza tu contraseña de acceso</p>
                    </div>
                    <Shield className="w-5 h-5 text-gray-400" />
                  </button>
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                      <p className="text-sm text-gray-500">Añade una capa extra de seguridad</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                      Desactivado
                    </span>
                  </button>
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sesiones Activas</p>
                      <p className="text-sm text-gray-500">Ver y gestionar dispositivos conectados</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">
                      2 activas
                    </span>
                  </button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h2 className="text-lg font-semibold text-gray-900">Roles y Permisos</h2>
                  <p className="text-sm text-gray-500">Configura los permisos por rol</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ROLE_PERMISSIONS.map((item) => (
                    <div
                      key={item.role}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-900">{item.role}</p>
                        <p className="text-sm text-gray-500">{item.permissions}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{item.users}</p>
                        <p className="text-xs text-gray-500">usuarios</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Configuración General</h2>
                <p className="text-sm text-gray-500">Preferencias generales del sistema</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <Select
                  label="Idioma"
                  defaultValue="es"
                  options={[
                    { value: 'es', label: 'Español' },
                    { value: 'en', label: 'English' },
                  ]}
                  className="sm:w-64"
                />
                <Select
                  label="Formato de Fecha"
                  defaultValue="dd/mm/yyyy"
                  options={[
                    { value: 'dd/mm/yyyy', label: 'DD/MM/YYYY' },
                    { value: 'mm/dd/yyyy', label: 'MM/DD/YYYY' },
                    { value: 'yyyy-mm-dd', label: 'YYYY-MM-DD' },
                  ]}
                  className="sm:w-64"
                />
                <Select
                  label="Formato de Hora"
                  defaultValue="24h"
                  options={[
                    { value: '24h', label: '24 horas (14:30)' },
                    { value: '12h', label: '12 horas (2:30 PM)' },
                  ]}
                  className="sm:w-64"
                />
                <Select
                  label="Intervalo de Actualización GPS"
                  defaultValue="15"
                  options={[
                    { value: '10', label: 'Cada 10 segundos' },
                    { value: '15', label: 'Cada 15 segundos' },
                    { value: '30', label: 'Cada 30 segundos' },
                    { value: '60', label: 'Cada minuto' },
                  ]}
                  className="sm:w-64"
                />

                <div className="pt-4 border-t border-gray-200">
                  <Button variant="primary">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar Cambios
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
