'use client';

import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowLeft, Check, Star, Phone } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  recommended?: boolean;
  contactSales?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basico',
    price: 49,
    period: 'mes',
    description: 'Ideal para instituciones pequenas',
    features: [
      'Hasta 5 vehiculos',
      '100 estudiantes',
      'GPS en tiempo real',
      'Check-in con QR',
      'Notificaciones basicas',
      'Soporte por email',
    ],
  },
  {
    id: 'professional',
    name: 'Profesional',
    price: 99,
    period: 'mes',
    description: 'Para instituciones en crecimiento',
    recommended: true,
    features: [
      'Hasta 15 vehiculos',
      '500 estudiantes',
      'GPS en tiempo real',
      'Check-in con QR',
      'Notificaciones avanzadas',
      'Reportes y analitica',
      'Soporte por chat',
      'Gestion de rutas',
    ],
  },
  {
    id: 'enterprise',
    name: 'Empresarial',
    price: 199,
    period: 'mes',
    description: 'Solucion completa para grandes instituciones',
    contactSales: true,
    features: [
      'Vehiculos ilimitados',
      'Estudiantes ilimitados',
      'Todo lo de Profesional',
      'API personalizada',
      'Soporte 24/7',
      'Onboarding dedicado',
      'Multi-sede',
      'Integraciones custom',
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan?.contactSales) {
      window.location.href = 'mailto:ventas@altaviapp.com?subject=Plan Empresarial';
      return;
    }
    setSelectedPlan(planId);
    router.push(`/signup?plan=${planId}`);
  };

  return (
    <div className="w-full max-w-5xl">
      {/* Header Card */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-accent rounded-xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-primary" />
          </div>
          <span className="text-2xl font-bold text-white">Altaviapp</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          Elige tu Plan
        </h1>
        <p className="text-primary-foreground/80">
          Comienza con 14 dias de prueba gratis. Sin tarjeta de credito.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm text-primary-foreground/70 hover:text-white mt-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al inicio
        </Link>
      </div>

      {/* Plans Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`bg-white rounded-2xl p-6 relative ${
              plan.recommended
                ? 'ring-4 ring-accent shadow-xl md:scale-105'
                : 'shadow-lg'
            } transition-all`}
          >
            {/* Recommended Badge */}
            {plan.recommended && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="bg-accent text-primary text-sm font-semibold px-4 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  Recomendado
                </div>
              </div>
            )}

            {/* Plan Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {plan.name}
              </h2>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-primary">
                  ${plan.price}
                </span>
                <span className="text-gray-500">/{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-3 px-4 rounded-xl font-semibold transition-colors ${
                plan.recommended
                  ? 'bg-primary hover:bg-primary/90 text-white'
                  : plan.contactSales
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {plan.contactSales ? (
                <span className="flex items-center justify-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contactar Ventas
                </span>
              ) : (
                'Elegir Plan'
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="mt-8 text-center">
        <div className="inline-flex flex-wrap justify-center gap-4 text-sm text-primary-foreground/80">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            Prueba gratuita de 14 dias
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            Sin tarjeta para empezar
          </span>
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-accent" />
            Cancelar en cualquier momento
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-primary-foreground/80">
          Ya tienes cuenta?{' '}
          <Link
            href="/login"
            className="text-accent hover:underline font-semibold"
          >
            Iniciar sesion
          </Link>
        </p>
      </div>
    </div>
  );
}
