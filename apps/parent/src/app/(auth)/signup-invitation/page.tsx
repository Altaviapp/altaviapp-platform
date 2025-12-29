'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, ArrowLeft, Eye, EyeOff, CheckCircle, XCircle, Building2, User, Mail, Lock, Shield } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

// ============================================
// STEP 1: ENTER CODE
// ============================================

const codeSchema = z.object({
  invitationCode: z.string()
    .length(6, 'El código debe tener 6 dígitos')
    .regex(/^\d{6}$/, 'El código debe contener solo números'),
});

type CodeFormData = z.infer<typeof codeSchema>;

// ============================================
// STEP 2: SET PASSWORD
// ============================================

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra')
    .regex(/[0-9]/, 'Debe incluir al menos un número'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

// ============================================
// MAIN CONTENT COMPONENT
// ============================================

function SignupInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { verifyInvitationCode, acceptInvitation } = useAuth();

  const [step, setStep] = useState<'code' | 'password' | 'success'>('code');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [invitation, setInvitation] = useState<{
    email: string;
    firstName?: string;
    lastName?: string;
    role: string;
    institutionName: string;
    code: string;
  } | null>(null);

  // Check for code in URL params
  useEffect(() => {
    const codeParam = searchParams?.get('code');
    if (codeParam && codeParam.length === 6) {
      handleVerifyCode(codeParam);
    }
  }, [searchParams]);

  // ============================================
  // STEP 1: CODE VERIFICATION
  // ============================================

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      invitationCode: searchParams?.get('code') || '',
    },
  });

  const handleVerifyCode = async (code: string) => {
    setIsLoading(true);
    setError('');

    const result = await verifyInvitationCode(code);

    if (result.success && result.valid && result.invitation) {
      setInvitation({
        ...result.invitation,
        code,
      });
      setStep('password');
    } else {
      setError(result.error || 'Código inválido o expirado');
    }

    setIsLoading(false);
  };

  const onCodeSubmit = async (data: CodeFormData) => {
    await handleVerifyCode(data.invitationCode);
  };

  // ============================================
  // STEP 2: PASSWORD SETUP
  // ============================================

  const passwordForm = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!invitation) return;

    setIsLoading(true);
    setError('');

    const result = await acceptInvitation(invitation.code, data.password);

    if (result.success) {
      setStep('success');
      // Redirect to verify email or dashboard after 2 seconds
      setTimeout(() => {
        if (result.requiresEmailVerification) {
          router.push('/verify-email');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } else {
      setError(result.error || 'Error al crear cuenta');
    }

    setIsLoading(false);
  };

  // ============================================
  // PASSWORD STRENGTH INDICATOR
  // ============================================

  const password = passwordForm.watch('password');
  const passwordChecks = {
    length: password.length >= 8,
    letter: /[a-zA-Z]/.test(password),
    number: /[0-9]/.test(password),
  };

  // ============================================
  // RENDER FUNCTIONS
  // ============================================

  const getRoleDisplay = (role: string) => {
    const roles: Record<string, string> = {
      parent: 'Padre/Madre de Familia',
      driver: 'Conductor',
      monitor: 'Auxiliar',
      admin: 'Administrador',
    };
    return roles[role] || role;
  };

  // Step 1: Enter Code
  if (step === 'code') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
            <GraduationCap className="w-9 h-9 text-primary" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Código de Invitación
          </h1>
          <p className="text-sm text-gray-600">
            Ingresa el código de 6 dígitos enviado a tu email
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light border border-error rounded-lg text-sm text-error-dark flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de Invitación
            </label>
            <input
              {...codeForm.register('invitationCode')}
              type="text"
              inputMode="numeric"
              maxLength={8}
              className="w-full px-4 py-3 text-center text-2xl font-mono tracking-[0.5em] border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="12345678"
            />
            {codeForm.formState.errors.invitationCode && (
              <p className="mt-1 text-sm text-error">
                {codeForm.formState.errors.invitationCode.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Verificando...' : 'Verificar Código'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Iniciar Sesión
          </button>
        </div>

        <div className="mt-6 p-3 bg-info-light rounded-lg">
          <p className="text-xs text-info-dark text-center">
            ¿No recibiste el código? Contacta al administrador de la escuela de tu hijo.
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Set Password
  if (step === 'password' && invitation) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-success-light rounded-xl flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Código Verificado!
          </h1>
          <p className="text-sm text-gray-600">
            Configura tu contraseña para completar el registro
          </p>
        </div>

        {/* Invitation Info Card */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Institución:</span>
              <span className="font-medium text-gray-900">{invitation.institutionName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Rol:</span>
              <span className="font-medium text-gray-900">{getRoleDisplay(invitation.role)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Email:</span>
              <span className="font-medium text-gray-900">{invitation.email}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-light border border-error rounded-lg text-sm text-error-dark flex items-center gap-2">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nueva Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...passwordForm.register('password')}
                type={showPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
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
            {passwordForm.formState.errors.password && (
              <p className="mt-1 text-sm text-error">
                {passwordForm.formState.errors.password.message}
              </p>
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
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                {...passwordForm.register('confirmPassword')}
                type={showConfirmPassword ? 'text' : 'password'}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
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
            {passwordForm.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-error">
                {passwordForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setStep('code');
              setInvitation(null);
              setError('');
            }}
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Usar otro código
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-success" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Cuenta Creada!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Tu cuenta ha sido creada exitosamente. Redirigiendo...
          </p>

          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Shield className="w-4 h-4 text-success" />
            <span>Conexión segura</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
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
export default function SignupInvitationPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SignupInvitationContent />
    </Suspense>
  );
}
