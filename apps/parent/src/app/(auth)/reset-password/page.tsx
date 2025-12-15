'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, ArrowLeft, CheckCircle, XCircle, Eye, EyeOff, GraduationCap } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const schema = z.object({
  email: z.string().email('Email inválido'),
  resetCode: z.string()
    .length(8, 'El código debe tener 8 dígitos')
    .regex(/^\d{8}$/, 'El código debe contener solo números'),
  newPassword: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

// Wrapped component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: searchParams?.get('email') || '',
      resetCode: searchParams?.get('code') || '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    const result = await resetPassword(data.email, data.resetCode, data.newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      setError(result.error || 'Error al restablecer contraseña');
    }

    setIsLoading(false);
  };

  // Password strength indicator
  const password = watch('newPassword');
  const passwordChecks = {
    length: password?.length >= 8,
    letter: /[a-zA-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  };

  // Success state
  if (success) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Contraseña Restablecida!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Tu contraseña ha sido actualizada exitosamente. Redirigiendo a iniciar sesión...
          </p>

          <button
            onClick={() => router.push('/login')}
            className="text-sm text-primary hover:underline"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <Lock className="w-9 h-9 text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Nueva Contraseña
        </h1>
        <p className="text-sm text-gray-600">
          Ingresa el código y tu nueva contraseña
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-error-light border border-error rounded-lg text-sm text-error-dark flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email (pre-filled) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            {...register('email')}
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-gray-50"
            placeholder="tu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        {/* Reset Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código de Verificación
          </label>
          <input
            {...register('resetCode')}
            type="text"
            inputMode="numeric"
            maxLength={8}
            className="w-full px-4 py-3 text-center text-xl font-mono tracking-[0.3em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
            placeholder="12345678"
          />
          {errors.resetCode && (
            <p className="mt-1 text-sm text-error">{errors.resetCode.message}</p>
          )}
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nueva Contraseña
          </label>
          <div className="relative">
            <input
              {...register('newPassword')}
              type={showPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="mt-1 text-sm text-error">{errors.newPassword.message}</p>
          )}
        </div>

        {/* Password Strength */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Requisitos de contraseña:</p>
          <div className="flex items-center gap-2 text-xs">
            {passwordChecks.length ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            <span className={passwordChecks.length ? 'text-success' : 'text-gray-500'}>
              Mínimo 8 caracteres
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {passwordChecks.letter ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            <span className={passwordChecks.letter ? 'text-success' : 'text-gray-500'}>
              Al menos una letra
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {passwordChecks.number ? (
              <CheckCircle className="w-4 h-4 text-success" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
            )}
            <span className={passwordChecks.number ? 'text-success' : 'text-gray-500'}>
              Al menos un número
            </span>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              {...register('confirmPassword')}
              type={showConfirmPassword ? 'text' : 'password'}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-error">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => router.push('/forgot-password')}
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Solicitar nuevo código
        </button>
      </div>

      <div className="mt-4 text-center">
        <button
          onClick={() => router.push('/login')}
          className="text-sm text-gray-500 hover:underline"
        >
          Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center min-h-[300px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}

// Main export with Suspense boundary
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
