'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Mail, CheckCircle, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, verifyEmail, resendVerificationEmail, isAuthenticated, isLoading: authLoading } = useAuth();

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Redirect if not authenticated or already verified
  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (user?.emailVerified) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, authLoading, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle input change
  const handleInputChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5) {
      const fullCode = newCode.join('');
      if (fullCode.length === 6) {
        handleVerify(fullCode);
      }
    }
  };

  // Handle backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setCode(newCode);
      handleVerify(pastedData);
    }
  };

  // Verify code
  const handleVerify = async (verificationCode: string) => {
    setIsLoading(true);
    setError('');

    const result = await verifyEmail(verificationCode);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } else {
      setError(result.error || 'Código incorrecto');
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    }

    setIsLoading(false);
  };

  // Resend code
  const handleResend = async () => {
    setIsResending(true);
    setError('');

    const result = await resendVerificationEmail();

    if (result.success) {
      setResendCooldown(60); // 60 second cooldown
    } else {
      setError(result.error || 'Error al reenviar código');
    }

    setIsResending(false);
  };

  // Submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length === 6) {
      handleVerify(fullCode);
    } else {
      setError('Ingresa el código completo de 6 dígitos');
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-2xl p-8 flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

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
            ¡Email Verificado!
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Tu cuenta ha sido verificada exitosamente. Redirigiendo al dashboard...
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
          <Mail className="w-9 h-9 text-primary" />
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Verifica tu Email
        </h1>
        <p className="text-sm text-gray-600">
          Hemos enviado un código de 6 dígitos a:
        </p>
        <p className="text-sm font-medium text-primary mt-1">
          {user?.email}
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-error-light border border-error rounded-lg text-sm text-error-dark flex items-center gap-2">
          <XCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Code Input Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Ingresa el código de verificación
          </label>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 text-center text-xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors"
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || code.join('').length !== 6}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              Verificando...
            </>
          ) : (
            <>
              Verificar Email
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      {/* Resend */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 mb-2">
          ¿No recibiste el código?
        </p>
        <button
          onClick={handleResend}
          disabled={isResending || resendCooldown > 0}
          className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline inline-flex items-center gap-1"
        >
          {isResending ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Reenviando...
            </>
          ) : resendCooldown > 0 ? (
            <>
              Reenviar en {resendCooldown}s
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Reenviar código
            </>
          )}
        </button>
      </div>

      {/* Help */}
      <div className="mt-6 p-3 bg-info-light rounded-lg">
        <p className="text-xs text-info-dark text-center">
          Revisa tu carpeta de spam si no ves el email. El código expira en 24 horas.
        </p>
      </div>
    </div>
  );
}
