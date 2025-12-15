'use client';

import { useState, useCallback, useEffect } from 'react';
import { X, Loader2, Mail, UserPlus, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type InviteRole = 'admin' | 'driver' | 'monitor' | 'parent';

const roleOptions: { value: InviteRole; label: string; description: string }[] = [
  { value: 'admin', label: 'Administrador', description: 'Acceso completo al sistema' },
  { value: 'driver', label: 'Conductor', description: 'Puede operar viajes y ver rutas' },
  { value: 'monitor', label: 'Monitor', description: 'Check-in de estudiantes e incidentes' },
  { value: 'parent', label: 'Padre/Tutor', description: 'Ver ubicacion y recibir notificaciones' },
];

/**
 * InviteUserModal Component
 *
 * Modal for sending invitations to new users.
 * Creates an invitation code that the user will use to sign up.
 */
export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const { user, token } = useAuth();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+593');
  const [role, setRole] = useState<InviteRole>('parent');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [invitationCode, setInvitationCode] = useState('');

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEmail('');
      setFirstName('');
      setLastName('');
      setPhone('+593');
      setRole('parent');
      setError('');
      setSuccess(false);
      setInvitationCode('');
    }
  }, [isOpen]);

  // Handle ESC key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) {
        onClose();
      }
    },
    [onClose, isLoading]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('El email es requerido');
      return;
    }

    if (!user?.institutionId) {
      setError('No se encontro la institucion');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Get API base URL
      const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || '';
      const apiBaseUrl = convexUrl.replace('.convex.cloud', '.convex.site');

      const response = await fetch(`${apiBaseUrl}/invitations/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          institutionId: user.institutionId,
          email: email.toLowerCase(),
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          phone: phone !== '+593' ? phone : undefined,
          role,
        }),
      });

      const data = await response.json();

      if (data.success && data.invitationCode) {
        setSuccess(true);
        setInvitationCode(data.invitationCode);
        onSuccess?.();
      } else {
        setError(data.error || 'Error al crear la invitacion');
      }
    } catch (err) {
      setError('Error de conexion. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isLoading ? undefined : onClose}
      />

      {/* Dialog */}
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {success ? 'Invitacion Enviada' : 'Invitar Usuario'}
              </h3>
              {!success && (
                <p className="text-sm text-gray-500">
                  Enviar invitacion por email
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            // Success state
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                Invitacion Creada
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                El codigo de invitacion es:
              </p>
              <div className="bg-gray-100 rounded-lg px-4 py-3 font-mono text-2xl tracking-wider text-primary font-bold mb-4">
                {invitationCode}
              </div>
              <p className="text-xs text-gray-500 mb-6">
                Comparte este codigo con {email}. El codigo expira en 7 dias.
              </p>
              <button
                onClick={onClose}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          ) : (
            // Form
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                </div>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Juan"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    placeholder="Perez"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="+593999123456"
                />
                <p className="text-xs text-gray-500 mt-1">Formato Ecuador: +593XXXXXXXXX</p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rol *
                </label>
                <div className="space-y-2">
                  {roleOptions.map((option) => (
                    <label
                      key={option.value}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors',
                        role === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={option.value}
                        checked={role === option.value}
                        onChange={() => setRole(option.value)}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg font-medium text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg font-medium text-sm bg-primary text-white hover:bg-primary/90 transition-colors flex items-center justify-center gap-2',
                    isLoading && 'opacity-60 cursor-not-allowed'
                  )}
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar Invitacion
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
