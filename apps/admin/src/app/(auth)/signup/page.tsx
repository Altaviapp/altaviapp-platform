'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  User,
  Building2,
  Shield,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { LocationSelector, type LocationValue } from '@altaviapp/ui';

// ============================================
// STEP 1: ADMIN INFORMATION
// ============================================

const step1Schema = z.object({
  firstName: z.string().min(2, 'Minimo 2 caracteres'),
  lastName: z.string().min(2, 'Minimo 2 caracteres'),
  email: z.string().email('Email invalido'),
  password: z.string()
    .min(8, 'Minimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Debe incluir al menos una letra')
    .regex(/[0-9]/, 'Debe incluir al menos un numero'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

type Step1Data = z.infer<typeof step1Schema>;

// ============================================
// STEP 2: INSTITUTION INFORMATION
// ============================================

const step2Schema = z.object({
  institutionName: z.string().min(3, 'Minimo 3 caracteres'),
  institutionType: z.enum(['primary', 'secondary', 'k12', 'university', 'other'], {
    required_error: 'Selecciona un tipo de institucion',
  }),
  address: z.string().min(10, 'Direccion muy corta'),
  location: z.object({
    country: z.string().min(1, 'Selecciona un pais'),
    department: z.string().min(1, 'Selecciona una provincia/departamento'),
    city: z.string().min(1, 'Selecciona una ciudad'),
  }),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar los terminos y condiciones',
  }),
});

type Step2Data = z.infer<typeof step2Schema>;

// ============================================
// INSTITUTION TYPES
// ============================================

const institutionTypes = [
  { value: 'primary', label: 'Escuela Primaria' },
  { value: 'secondary', label: 'Colegio Secundario' },
  { value: 'k12', label: 'Unidad Educativa (K-12)' },
  { value: 'university', label: 'Universidad/Instituto' },
  { value: 'other', label: 'Otro' },
];

// ============================================
// MAIN CONTENT COMPONENT
// ============================================

function SignupContent() {
  const router = useRouter();
  const { registerInstitution } = useAuth();

  const [step, setStep] = useState<1 | 2 | 'success'>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);

  // ============================================
  // STEP 1 FORM
  // ============================================

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onStep1Submit = (data: Step1Data) => {
    setStep1Data(data);
    setStep(2);
    setError('');
  };

  // Go back to step 1 and restore form data
  const goBackToStep1 = () => {
    if (step1Data) {
      step1Form.reset(step1Data);
    }
    setStep(1);
  };

  // Password strength indicator
  const password = step1Form.watch('password');
  const passwordChecks = {
    length: password?.length >= 8,
    letter: /[a-zA-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  };

  // ============================================
  // STEP 2 FORM
  // ============================================

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      institutionName: '',
      institutionType: undefined,
      address: '',
      location: {
        country: 'EC',
        department: '',
        city: '',
      },
      acceptTerms: false,
    },
  });

  const onStep2Submit = async (data: Step2Data) => {
    if (!step1Data) return;

    setIsLoading(true);
    setError('');

    // Map institution type to simplified form (all educational = school)
    const institutionTypeMap: Record<string, 'school' | 'corporate'> = {
      primary: 'school',
      secondary: 'school',
      k12: 'school',
      university: 'school',
      other: 'corporate',
    };

    const result = await registerInstitution({
      // Admin info
      firstName: step1Data.firstName,
      lastName: step1Data.lastName,
      email: step1Data.email,
      password: step1Data.password,
      // Institution info
      institutionName: data.institutionName,
      institutionType: institutionTypeMap[data.institutionType] ?? 'school',
      institutionAddress: data.address,
      institutionCity: data.location.city,
      institutionCountry: data.location.country,
      institutionDepartment: data.location.department,
      // Plan (default to professional)
      plan: 'professional',
    });

    if (result.success) {
      setStep('success');
      setTimeout(() => {
        if (result.requiresEmailVerification) {
          router.push('/verify-email');
        } else {
          router.push('/dashboard');
        }
      }, 2000);
    } else {
      setError(result.error || 'Error al crear la cuenta');
    }

    setIsLoading(false);
  };

  // ============================================
  // RENDER STEP 1
  // ============================================

  if (step === 1) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.push('/login')}
              className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al inicio
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Crear tu Cuenta
            </h1>
            <p className="text-sm text-gray-600">
              Paso 1 de 2: Informacion del Administrador
            </p>
            <p className="text-xs text-green-600 mt-1">
              14 dias de prueba gratis
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre *
                </label>
                <input
                  {...step1Form.register('firstName')}
                  type="text"
                  autoComplete="given-name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Juan"
                />
                {step1Form.formState.errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">
                    {step1Form.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellido *
                </label>
                <input
                  {...step1Form.register('lastName')}
                  type="text"
                  autoComplete="family-name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="Perez"
                />
                {step1Form.formState.errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">
                    {step1Form.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                {...step1Form.register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="juan.perez@escuela.edu.ec"
              />
              {step1Form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {step1Form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contrasena *
              </label>
              <div className="relative">
                <input
                  {...step1Form.register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="********"
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
              {step1Form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {step1Form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Password Strength */}
            <div className="space-y-1">
              <p className="text-xs text-gray-600">Requisitos de contrasena:</p>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.length ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={passwordChecks.length ? 'text-green-600' : 'text-gray-500'}>
                  Minimo 8 caracteres
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.letter ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={passwordChecks.letter ? 'text-green-600' : 'text-gray-500'}>
                  Al menos una letra
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {passwordChecks.number ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                )}
                <span className={passwordChecks.number ? 'text-green-600' : 'text-gray-500'}>
                  Al menos un numero
                </span>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Contrasena *
              </label>
              <div className="relative">
                <input
                  {...step1Form.register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                  placeholder="********"
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
              {step1Form.formState.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {step1Form.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Continuar
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Ya tienes cuenta?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-primary hover:underline font-semibold"
              >
                Iniciar sesion
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER STEP 2
  // ============================================

  if (step === 2) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={goBackToStep1}
              className="text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Paso anterior
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Crear tu Cuenta
            </h1>
            <p className="text-sm text-gray-600">
              Paso 2 de 2: Informacion de la Institucion
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-4">
            {/* Institution Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Institucion *
              </label>
              <input
                {...step2Form.register('institutionName')}
                type="text"
                autoComplete="organization"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Colegio San Francisco"
              />
              {step2Form.formState.errors.institutionName && (
                <p className="mt-1 text-sm text-red-500">
                  {step2Form.formState.errors.institutionName.message}
                </p>
              )}
            </div>

            {/* Institution Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Institucion *
              </label>
              <select
                {...step2Form.register('institutionType')}
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors bg-white"
              >
                <option value="">Seleccionar...</option>
                {institutionTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {step2Form.formState.errors.institutionType && (
                <p className="mt-1 text-sm text-red-500">
                  {step2Form.formState.errors.institutionType.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direccion *
              </label>
              <input
                {...step2Form.register('address')}
                type="text"
                autoComplete="street-address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                placeholder="Av. 6 de Diciembre N23-45 y Colon"
              />
              {step2Form.formState.errors.address && (
                <p className="mt-1 text-sm text-red-500">
                  {step2Form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* Location (Country, Department, City) */}
            <Controller
              name="location"
              control={step2Form.control}
              render={({ field }) => (
                <LocationSelector
                  value={field.value as LocationValue}
                  onChange={field.onChange}
                  showCountry={true}
                  error={
                    step2Form.formState.errors.location?.city?.message ||
                    step2Form.formState.errors.location?.department?.message ||
                    step2Form.formState.errors.location?.country?.message
                  }
                />
              )}
            />

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                {...step2Form.register('acceptTerms')}
                type="checkbox"
                id="acceptTerms"
                className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary mt-0.5"
              />
              <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                Acepto los{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Terminos de Servicio
                </a>{' '}
                y la{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  Politica de Privacidad
                </a>
              </label>
            </div>
            {step2Form.formState.errors.acceptTerms && (
              <p className="text-sm text-red-500">
                {step2Form.formState.errors.acceptTerms.message}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
            >
              {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER SUCCESS
  // ============================================

  if (step === 'success') {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Cuenta Creada!
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Tu cuenta ha sido creada exitosamente. Revisa tu email para verificar tu cuenta.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Redirigiendo...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Main export
export default function SignupPage() {
  return <SignupContent />;
}
