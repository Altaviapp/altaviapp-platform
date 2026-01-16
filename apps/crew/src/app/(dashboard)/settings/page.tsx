'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Smartphone, FileText, LogOut, ChevronRight, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, Button, Input } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { useConvexAuth, useUserProfile } from '@/hooks';
import { ChangePasswordSheet } from '@/components/profile/ChangePasswordSheet';

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useConvexAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useUserProfile();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sheet state
  const [showChangePassword, setShowChangePassword] = useState(false);

  // Sync form with profile data
  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  // Track changes
  useEffect(() => {
    if (profile) {
      const changed = name !== (profile.name || '') || phone !== (profile.phone || '');
      setHasChanges(changed);
    }
  }, [name, phone, profile]);

  const handleSaveProfile = async () => {
    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      await updateProfile({ name, phone });
      setSaveSuccess(true);
      setHasChanges(false);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar';
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Configuracion"
        subtitle="Ajusta tus preferencias"
      />

      {/* Account Info */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Mi Cuenta</h3>
          </div>

          {profileLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <Input
                label="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
              <Input
                type="email"
                label="Email"
                value={user?.email || ''}
                disabled
                className="bg-gray-50"
              />
              <Input
                type="tel"
                label="Telefono"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+593 99 999 9999"
              />

              {/* Error message */}
              {saveError && (
                <div className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                  <p className="text-sm text-error">{saveError}</p>
                </div>
              )}

              {/* Save button */}
              <Button
                onClick={handleSaveProfile}
                disabled={!hasChanges || isSaving}
                className={cn(
                  "w-full",
                  saveSuccess && "bg-success hover:bg-success"
                )}
              >
                {isSaving ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando...</span>
                  </div>
                ) : saveSuccess ? (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Guardado</span>
                  </div>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Lock className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Seguridad</h3>
          </div>

          <button
            onClick={() => setShowChangePassword(true)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
          >
            <span className="text-sm text-gray-700">Cambiar contrasena</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Aplicacion</h3>
          </div>

          <div className="flex items-center justify-between text-sm py-2">
            <span className="text-gray-600">Version</span>
            <span className="text-gray-900">1.0.0</span>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Informacion Legal</h3>
          </div>
        </div>
        <a
          href="https://altaviapp.com/terminos"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100 min-h-[44px]"
        >
          <span className="text-sm text-gray-700">Terminos de servicio</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </a>
        <a
          href="https://altaviapp.com/privacidad"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors min-h-[44px]"
        >
          <span className="text-sm text-gray-700">Politica de privacidad</span>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </a>
      </Card>

      {/* Logout */}
      <Button
        variant="danger"
        leftIcon={LogOut}
        className="w-full"
        onClick={handleLogout}
      >
        Cerrar sesion
      </Button>

      {/* Change Password Sheet */}
      <ChangePasswordSheet
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </div>
  );
}
