'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Mail,
  User,
  Shield,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import { useInvitationMutations } from '@/hooks';
import type { InvitationRole } from '@/hooks';

// ============================================
// SCHEMAS
// ============================================

const invitationSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['parent', 'driver', 'monitor', 'admin'], {
    required_error: 'Selecciona un rol',
  }),
});

type InvitationFormData = z.infer<typeof invitationSchema>;

// ============================================
// ROLE OPTIONS
// ============================================

const roleOptions = [
  {
    value: 'parent',
    label: 'Padre/Madre',
    description: 'Seguimiento de hijos en tiempo real',
  },
  {
    value: 'driver',
    label: 'Conductor',
    description: 'Operación de vehículos y viajes',
  },
  {
    value: 'monitor',
    label: 'Auxiliar',
    description: 'Asistente de ruta, check-in de estudiantes',
  },
  {
    value: 'admin',
    label: 'Administrador',
    description: 'Gestión completa de la institución',
  },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function NewInvitationPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<{
    email: string;
    role: string;
    code: string;
    emailSent: boolean;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Real data from Convex
  const { createInvitation } = useInvitationMutations();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<InvitationFormData>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: undefined,
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: InvitationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await createInvitation({
        email: data.email,
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        phone: data.phone || undefined,
        role: data.role as InvitationRole,
      });

      setSuccess({
        email: data.email,
        role: roleOptions.find(r => r.value === data.role)?.label || data.role,
        code: result.invitationCode,
        emailSent: result.emailSent,
      });
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError(err instanceof Error ? err.message : 'Error al crear la invitación');
    }

    setIsLoading(false);
  };

  const handleCopyCode = async () => {
    if (success) {
      await navigator.clipboard.writeText(success.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleCreateAnother = () => {
    setSuccess(null);
    reset();
  };

  // ============================================
  // SUCCESS STATE
  // ============================================

  if (success) {
    return (
      <div className="p-6 lg:p-8 max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Invitación Creada!
            </h1>
            <p className="text-gray-600">
              Se ha creado la invitación exitosamente
            </p>
          </div>

          {/* Invitation Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{success.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Rol</p>
                  <p className="font-medium text-gray-900">{success.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Code Display */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2 text-center">
              Código de invitación:
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="bg-primary/5 border-2 border-primary/20 rounded-lg px-6 py-3">
                <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                  {success.code}
                </code>
              </div>
              <button
                onClick={handleCopyCode}
                className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                title="Copiar código"
              >
                {copiedCode ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Expiration */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-6">
            <Clock className="w-4 h-4" />
            <span>El código expira en 7 días</span>
          </div>

          {/* Email Status */}
          {success.emailSent && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-6">
              <CheckCircle className="w-4 h-4" />
              <span>Email enviado automáticamente</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCreateAnother}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Crear otra invitación
            </button>
            <button
              onClick={() => router.push('/settings/invitations')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Ver todas las invitaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // FORM STATE
  // ============================================

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/settings/invitations')}
          className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Invitaciones
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Nueva Invitación</h1>
        <p className="text-gray-600 text-sm mt-1">
          Invita a un nuevo usuario a unirse a tu institución
        </p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
        {/* Error */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email del invitado *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...register('email')}
                type="email"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="usuario@email.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre (opcional)
              </label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="María"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apellido (opcional)
              </label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="García"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono (opcional)
            </label>
            <input
              {...register('phone')}
              type="tel"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="+593XXXXXXXXX"
            />
            <p className="mt-1 text-xs text-gray-500">Formato Ecuador: +593XXXXXXXXX</p>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rol asignado *
            </label>
            <div className="space-y-2">
              {roleOptions.map((role) => (
                <label
                  key={role.value}
                  className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === role.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    {...register('role')}
                    type="radio"
                    value={role.value}
                    className="mt-1 w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{role.label}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push('/settings/invitations')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Creando...' : 'Crear Invitación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
