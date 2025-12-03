'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Camera, Bell, Radio, AlertCircle, Check } from 'lucide-react';

interface Permission {
  icon: typeof MapPin;
  title: string;
  description: string;
}

const permissions: Permission[] = [
  {
    icon: MapPin,
    title: 'Ubicación (GPS)',
    description: 'Seguimiento en tiempo real durante los viajes',
  },
  {
    icon: Camera,
    title: 'Cámara',
    description: 'Escanear códigos QR de los estudiantes',
  },
  {
    icon: Bell,
    title: 'Notificaciones',
    description: 'Alertas importantes y recordatorios',
  },
  {
    icon: Radio,
    title: 'Funcionamiento en segundo plano',
    description: 'GPS continuo durante el viaje',
  },
];

export default function PermissionsPage() {
  const router = useRouter();
  const [isGranting, setIsGranting] = useState(false);

  const handleGrantPermissions = async () => {
    setIsGranting(true);

    // Simulate permission request delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Store permissions granted flag
    localStorage.setItem('permissions_granted', 'true');

    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-warning-light rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-warning-dark" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Permisos Necesarios
        </h1>
        <p className="text-sm text-gray-600">
          Para usar la app, necesitamos los siguientes permisos:
        </p>
      </div>

      {/* Permissions List */}
      <div className="space-y-4 mb-8">
        {permissions.map((permission, index) => {
          const Icon = permission.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-success-dark" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {permission.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-600">{permission.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Warning */}
      <div className="bg-warning-light border border-warning rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-warning-dark flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-warning-dark mb-1">
              Importante:
            </p>
            <p className="text-xs text-warning-dark">
              Estos permisos son necesarios para el correcto funcionamiento de
              la aplicación y garantizar la seguridad de los estudiantes.
            </p>
          </div>
        </div>
      </div>

      {/* Grant Button */}
      <button
        onClick={handleGrantPermissions}
        disabled={isGranting}
        className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
      >
        {isGranting ? 'Concediendo permisos...' : 'CONCEDER PERMISOS'}
      </button>

      {/* Skip for demo */}
      <div className="mt-4 text-center">
        <button
          onClick={() => {
            localStorage.setItem('permissions_granted', 'true');
            router.push('/dashboard');
          }}
          className="text-sm text-gray-600 hover:text-primary"
        >
          Continuar sin permisos (solo demo)
        </button>
      </div>
    </div>
  );
}
