'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Settings, Building, Bell, Shield, Globe, Clock, Save, Users, MapPin, Mail, Phone, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock institution data
const institution = {
  name: 'Escuela Altaviapp',
  address: 'Av. Principal 123, Quito',
  phone: '+593 2 123 4567',
  email: 'admin@escuela-altaviapp.ec',
  timezone: 'America/Guayaquil',
  logo: null,
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('institution');
  const [notifications, setNotifications] = useState({
    tripStart: true,
    tripEnd: true,
    delays: true,
    incidents: true,
    dailyReport: false,
  });

  const tabs = [
    { id: 'institution', label: 'Institución', icon: Building },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'general', label: 'General', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Administra la configuración de tu institución</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow p-2">
            {tabs.map((tab) => {
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
              <Link
                href="/settings/school"
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" />
                  <span className="font-medium">Ubicación del Colegio</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
              <Link
                href="/settings/users"
                className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-600 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">Usuarios</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Institution Settings */}
          {activeTab === 'institution' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Información de la Institución</h2>
                <p className="text-sm text-gray-500">Datos generales de tu institución</p>
              </div>
              <div className="p-6 space-y-6">
                {/* Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la Institución</label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                      <Building className="w-10 h-10 text-gray-400" />
                    </div>
                    <div>
                      <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        Subir Logo
                      </button>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG hasta 2MB</p>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Institución</label>
                    <input
                      type="text"
                      defaultValue={institution.name}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                    <input
                      type="text"
                      defaultValue={institution.address}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <input
                      type="tel"
                      defaultValue={institution.phone}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                    <input
                      type="email"
                      defaultValue={institution.email}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zona Horaria</label>
                    <select
                      defaultValue={institution.timezone}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="America/Guayaquil">Ecuador (Guayaquil) - GMT-5</option>
                      <option value="America/Bogota">Colombia (Bogotá) - GMT-5</option>
                      <option value="America/Lima">Perú (Lima) - GMT-5</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Configuración de Notificaciones</h2>
                <p className="text-sm text-gray-500">Administra qué notificaciones recibirás</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { key: 'tripStart', label: 'Inicio de viaje', description: 'Notificar cuando un viaje inicie' },
                  { key: 'tripEnd', label: 'Fin de viaje', description: 'Notificar cuando un viaje finalice' },
                  { key: 'delays', label: 'Retrasos', description: 'Alertar sobre retrasos en las rutas' },
                  { key: 'incidents', label: 'Incidentes', description: 'Notificar incidentes reportados' },
                  { key: 'dailyReport', label: 'Reporte diario', description: 'Recibir resumen diario por email' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
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
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Seguridad de la Cuenta</h2>
                  <p className="text-sm text-gray-500">Configuración de seguridad y acceso</p>
                </div>
                <div className="p-6 space-y-4">
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
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">Desactivado</span>
                  </button>
                  <button className="w-full p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sesiones Activas</p>
                      <p className="text-sm text-gray-500">Ver y gestionar dispositivos conectados</p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-success/10 text-success rounded-full">2 activas</span>
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Roles y Permisos</h2>
                  <p className="text-sm text-gray-500">Configura los permisos por rol</p>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {[
                      { role: 'Administrador', permissions: 'Acceso completo', users: 3 },
                      { role: 'Conductor', permissions: 'Viajes, Check-in', users: 18 },
                      { role: 'Monitor', permissions: 'Check-in, Incidentes', users: 7 },
                      { role: 'Padre', permissions: 'Solo lectura', users: 128 },
                    ].map((item) => (
                      <div key={item.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Configuración General</h2>
                <p className="text-sm text-gray-500">Preferencias generales del sistema</p>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
                  <select className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Fecha</label>
                  <select className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Formato de Hora</label>
                  <select className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="24h">24 horas (14:30)</option>
                    <option value="12h">12 horas (2:30 PM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Intervalo de Actualización GPS</label>
                  <select className="w-full sm:w-64 px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="10">Cada 10 segundos</option>
                    <option value="15">Cada 15 segundos</option>
                    <option value="30">Cada 30 segundos</option>
                    <option value="60">Cada minuto</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Save className="w-5 h-5" />
                    Guardar Cambios
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
