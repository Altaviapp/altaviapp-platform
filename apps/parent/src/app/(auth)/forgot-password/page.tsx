'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { GraduationCap, Mail, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const schema = z.object({
  email: z.string().email('Email inválido'),
});

type FormData = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { requestPasswordReset } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError('');

    const result = await requestPasswordReset(data.email);

    // Always show success to prevent email enumeration
    setSubmittedEmail(data.email);
    setEmailSent(true);

    setIsLoading(false);
  };

  // Email sent confirmation
  if (emailSent) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-success-light rounded-xl flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-success" />
          </div>
        </div>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Revisa tu Email
          </h1>
          <p className="text-sm text-gray-600">
            Si existe una cuenta con el email:
          </p>
          <p className="text-sm font-medium text-primary mt-1">
            {submittedEmail}
          </p>
          <p className="text-sm text-gray-600 mt-2">
            recibirás un código para restablecer tu contraseña.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push(`/reset-password?email=${encodeURIComponent(submittedEmail)}`)}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Tengo el código
          </button>

          <button
            onClick={() => {
              setEmailSent(false);
              setSubmittedEmail('');
            }}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Usar otro email
          </button>
        </div>

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
            El código expira en 1 hora. Revisa tu carpeta de spam.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <GraduationCap className="w-9 h-9 text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="text-sm text-gray-600">
          Ingresa tu email y te enviaremos un código para restablecerla
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
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              {...register('email')}
              id="email"
              type="email"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
              placeholder="tu@email.com"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Enviando...' : 'Enviar Código'}
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
    </div>
  );
}
