'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '../../../../../../convex/_generated/api';

type VerifyState = 'loading' | 'success' | 'error';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const verifyEmailByUrl = useMutation(api.authApi.verifyEmailByUrl);

  useEffect(() => {
    const code = searchParams.get('code');
    const email = searchParams.get('email');

    if (!code || !email) {
      setState('error');
      setErrorMessage('Enlace de verificación inválido. Faltan parámetros.');
      return;
    }

    // Perform verification
    verifyEmailByUrl({ code, email })
      .then((result) => {
        if (result.success) {
          setState('success');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        } else {
          setState('error');
          setErrorMessage(result.message || 'Error al verificar el email');
        }
      })
      .catch((error) => {
        setState('error');
        setErrorMessage(error.message || 'Error al verificar el email');
      });
  }, [searchParams, verifyEmailByUrl, router]);

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <Shield className="w-9 h-9 text-primary" />
        </div>
      </div>

      {state === 'loading' && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verificando tu email...
          </h1>
          <p className="text-sm text-gray-600">
            Por favor espera mientras verificamos tu cuenta.
          </p>
        </div>
      )}

      {state === 'success' && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Email verificado!
          </h1>
          <p className="text-sm text-gray-600 mb-4">
            Tu cuenta ha sido verificada exitosamente.
          </p>
          <p className="text-sm text-gray-500">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Error de verificación
          </h1>
          <p className="text-sm text-red-600 mb-6">
            {errorMessage}
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Ir al inicio de sesión
          </button>
        </div>
      )}
    </div>
  );
}

function VerifyLoading() {
  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center">
          <Shield className="w-9 h-9 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Cargando...
        </h1>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<VerifyLoading />}>
      <VerifyContent />
    </Suspense>
  );
}
