'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Truck, Download } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if already installed
    const isInstalled = localStorage.getItem('pwa_installed') === 'true';
    if (isInstalled) {
      router.push('/login');
    }
  }, [router]);

  const handleInstall = () => {
    // Mock PWA installation
    localStorage.setItem('pwa_installed', 'true');
    router.push('/login');
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center">
          <Truck className="w-12 h-12 text-primary" />
        </div>
      </div>

      {/* App Name */}
      <h1 className="text-3xl font-bold text-primary mb-2">Altaviapp</h1>
      <p className="text-lg text-primary/80 mb-2">Driver App</p>

      {/* Description */}
      <p className="text-gray-600 mb-8">
        Transporte Escolar Seguro
      </p>

      {/* Install Button */}
      <button
        onClick={handleInstall}
        className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-lg transition-colors mb-4 flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Instalar en el dispositivo
      </button>

      {/* Continue without install */}
      <Link
        href="/login"
        className="text-sm text-primary hover:underline"
      >
        Continuar sin instalar
      </Link>

      {/* Version */}
      <div className="mt-12 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500">Versión 1.0.0</p>
      </div>
    </div>
  );
}
