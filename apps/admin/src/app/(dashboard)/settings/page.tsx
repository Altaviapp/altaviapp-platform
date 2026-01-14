'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  GraduationCap,
  FileText,
  Lock,
  Smartphone,
  LogOut,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card, CardHeader, CardContent, Button } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { useAuth } from '@altaviapp/auth';
import { ChangePasswordModal } from '@/components/settings';

/**
 * Settings Page
 *
 * Hub for institution configuration linking to functional settings pages.
 * Simplified to show only features with working backend integration.
 */

const INSTITUTION_LINKS = [
  {
    href: '/settings/school',
    label: 'Ubicacion del Colegio',
    description: 'Configura la ubicacion geografica de la institucion',
    icon: MapPin,
  },
  {
    href: '/settings/grades',
    label: 'Grados Escolares',
    description: 'Administra los grados y niveles de tu institucion',
    icon: GraduationCap,
  },
];

const OPERATION_LINKS = [
  {
    href: '/settings/novedades',
    label: 'Tipos de Novedades',
    description: 'Configura los tipos de novedades disponibles',
    icon: FileText,
  },
];

export default function SettingsPage() {
  const { logout } = useAuth();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Configuracion"
        subtitle="Administra la configuracion de tu institucion"
      />

      {/* Institution Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Institucion</h2>
          <p className="text-sm text-gray-500">Configuracion de la institucion</p>
        </CardHeader>
        <CardContent className="p-0">
          {INSTITUTION_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index < INSTITUTION_LINKS.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{link.label}</p>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Operation Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Operacion</h2>
          <p className="text-sm text-gray-500">Configuracion operativa</p>
        </CardHeader>
        <CardContent className="p-0">
          {OPERATION_LINKS.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors ${
                  index < OPERATION_LINKS.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{link.label}</p>
                    <p className="text-sm text-gray-500">{link.description}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </Link>
            );
          })}
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Cuenta</h2>
          <p className="text-sm text-gray-500">Seguridad de tu cuenta</p>
        </CardHeader>
        <CardContent className="p-0">
          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Cambiar Contrasena</p>
                <p className="text-sm text-gray-500">Actualiza tu contrasena de acceso</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Informacion</h2>
          <p className="text-sm text-gray-500">Acerca de la aplicacion</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Version</p>
              <p className="text-sm text-gray-500">1.0.0</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <a
              href="https://altaviapp.com/terminos"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm text-gray-700">Terminos de servicio</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
            <a
              href="https://altaviapp.com/privacidad"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="text-sm text-gray-700">Politica de privacidad</span>
              <ExternalLink className="w-4 h-4 text-gray-400" />
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        className="w-full"
        onClick={handleLogout}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Cerrar sesion
      </Button>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
