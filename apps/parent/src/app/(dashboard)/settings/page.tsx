'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Smartphone, FileText, LogOut, ChevronRight, Loader2, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, Button, Input } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { useAuth } from '@altaviapp/auth';
import { useProfile, useMyStudents } from '@/hooks';
import { ChangePasswordSheet, AlertPreferencesSheet } from '@/components/settings';
import { Id } from '../../../../../../convex/_generated/dataModel';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const { students, isLoading: studentsLoading } = useMyStudents();

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Sheet states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [alertStudentId, setAlertStudentId] = useState<Id<"students"> | null>(null);
  const [alertStudentName, setAlertStudentName] = useState('');

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
    } catch (error: any) {
      setSaveError(error.message || 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const openAlertPreferences = (studentId: Id<"students">, studentName: string) => {
    setAlertStudentId(studentId);
    setAlertStudentName(studentName);
  };

  const closeAlertPreferences = () => {
    setAlertStudentId(null);
    setAlertStudentName('');
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

      {/* Alert Preferences */}
      <Card>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Alertas de Proximidad</h3>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Configura las alertas para cada estudiante
          </p>

          {studentsLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : students.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No tienes estudiantes registrados
            </p>
          ) : (
            <div className="space-y-2">
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => openAlertPreferences(student._id, `${student.firstName} ${student.lastName}`)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors min-h-[44px]"
                >
                  <span className="text-sm text-gray-700">
                    {student.firstName} {student.lastName}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>
          )}
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

      {/* Alert Preferences Sheet */}
      {alertStudentId && (
        <AlertPreferencesSheet
          isOpen={!!alertStudentId}
          onClose={closeAlertPreferences}
          studentId={alertStudentId}
          studentName={alertStudentName}
        />
      )}
    </div>
  );
}
