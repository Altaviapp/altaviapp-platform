'use client';

import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  MapPin,
  QrCode,
  Bell,
  BarChart3,
  ArrowRight,
  Shield,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: MapPin,
      title: 'Seguimiento en Tiempo Real',
      description: 'Ubicación GPS actualizada cada 15 segundos para saber siempre dónde están tus hijos.',
    },
    {
      icon: QrCode,
      title: 'Check-in con QR',
      description: 'Escaneo rápido y seguro para registrar cuando los estudiantes abordan o descienden.',
    },
    {
      icon: Bell,
      title: 'Notificaciones Instantáneas',
      description: 'Alertas automáticas a los padres cuando su hijo aborda o desciende del transporte.',
    },
    {
      icon: BarChart3,
      title: 'Reportes y Analítica',
      description: 'Métricas de rendimiento, historial de viajes y análisis detallados.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xl font-bold text-primary">Altaviapp</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-primary transition-colors">
                Características
              </a>
              <button
                onClick={() => router.push('/plans')}
                className="text-gray-600 hover:text-primary transition-colors"
              >
                Precios
              </button>
              <button
                onClick={() => router.push('/login')}
                className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Iniciar Sesión
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <a
                  href="#features"
                  className="text-gray-600 hover:text-primary transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Características
                </a>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/plans');
                  }}
                  className="text-left text-gray-600 hover:text-primary transition-colors py-2"
                >
                  Precios
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    router.push('/login');
                  }}
                  className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-3 rounded-lg transition-colors text-center"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
                Transporte Escolar
                <span className="text-accent block">Seguro e Inteligente</span>
              </h1>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto lg:mx-0">
                Plataforma integral para gestionar el transporte de estudiantes con seguimiento en tiempo real,
                check-in QR y notificaciones instantáneas a los padres.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => router.push('/plans')}
                  className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 py-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Comenzar Ahora
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-4 rounded-lg transition-colors border border-white/20"
                >
                  Iniciar Sesión
                </button>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="hidden lg:flex justify-center">
              <div className="relative w-96 h-96 bg-white/10 rounded-3xl flex items-center justify-center">
                <div className="absolute inset-4 bg-white/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-14 h-14 text-primary" />
                    </div>
                    <div className="flex items-center justify-center gap-2 text-white/60">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">Seguimiento GPS activo</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Características Principales
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitas para gestionar el transporte escolar de manera segura y eficiente.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Invitation Code Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              ¿Ya tienes una invitación?
            </h2>
            <p className="text-white/80 mb-6 max-w-xl mx-auto">
              Si tu institución ya usa Altaviapp y te enviaron un código de invitación,
              puedes crear tu cuenta aquí.
            </p>
            <button
              onClick={() => router.push('/signup-invitation')}
              className="bg-accent hover:bg-accent/90 text-primary font-bold px-8 py-4 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              Tengo un código de invitación
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xl font-bold text-white">Altaviapp</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>

            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>© 2025 Altaviapp - Ceibatic</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
