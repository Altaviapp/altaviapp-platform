'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <span className="text-xl font-bold text-primary">Altaviapp</span>
            </div>
            <Link
              href="/signup"
              className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Terminos de Servicio</h1>
              <p className="text-sm text-gray-500">Ultima actualizacion: Diciembre 2024</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Aceptacion de los Terminos</h2>
            <p>
              Al acceder y utilizar la plataforma Altaviapp, usted acepta estar sujeto a estos
              Terminos de Servicio y a todas las leyes y regulaciones aplicables. Si no esta
              de acuerdo con alguno de estos terminos, no podra utilizar nuestros servicios.
            </p>

            <h2>2. Descripcion del Servicio</h2>
            <p>
              Altaviapp es una plataforma de gestion de transporte escolar que proporciona:
            </p>
            <ul>
              <li>Seguimiento GPS en tiempo real de vehiculos de transporte escolar</li>
              <li>Sistema de check-in/check-out mediante codigo QR</li>
              <li>Notificaciones automaticas a padres y tutores</li>
              <li>Gestion de rutas, estudiantes y personal</li>
              <li>Reportes de incidentes y novedades</li>
              <li>Panel de administracion para instituciones educativas</li>
            </ul>

            <h2>3. Registro y Cuentas</h2>
            <p>
              Para utilizar Altaviapp, las instituciones educativas deben registrarse y crear
              una cuenta de administrador. Al registrarse, usted garantiza que:
            </p>
            <ul>
              <li>La informacion proporcionada es veraz y completa</li>
              <li>Tiene autoridad para actuar en nombre de la institucion</li>
              <li>Mantendra la confidencialidad de sus credenciales de acceso</li>
              <li>Notificara inmediatamente cualquier uso no autorizado de su cuenta</li>
            </ul>

            <h2>4. Uso Aceptable</h2>
            <p>Usted se compromete a:</p>
            <ul>
              <li>Utilizar el servicio unicamente para fines relacionados con transporte escolar</li>
              <li>No compartir credenciales de acceso con terceros no autorizados</li>
              <li>No intentar acceder a datos de otras instituciones</li>
              <li>No utilizar el servicio para actividades ilegales</li>
              <li>Mantener actualizada la informacion de estudiantes y personal</li>
            </ul>

            <h2>5. Proteccion de Datos de Menores</h2>
            <p>
              Altaviapp maneja informacion de menores de edad. Las instituciones son responsables de:
            </p>
            <ul>
              <li>Obtener el consentimiento de los padres o tutores para el uso del servicio</li>
              <li>Garantizar que solo personal autorizado acceda a la informacion de estudiantes</li>
              <li>Cumplir con las leyes de proteccion de datos de menores aplicables en su jurisdiccion</li>
            </ul>

            <h2>6. Disponibilidad del Servicio</h2>
            <p>
              Nos esforzamos por mantener el servicio disponible las 24 horas del dia, los 7 dias
              de la semana. Sin embargo, no garantizamos disponibilidad ininterrumpida y podemos
              realizar mantenimientos programados o de emergencia cuando sea necesario.
            </p>

            <h2>7. Limitacion de Responsabilidad</h2>
            <p>
              Altaviapp proporciona herramientas para facilitar la gestion del transporte escolar,
              pero la responsabilidad final sobre la seguridad de los estudiantes recae en la
              institucion educativa y el personal de transporte. No nos hacemos responsables de:
            </p>
            <ul>
              <li>Acciones u omisiones del personal de transporte</li>
              <li>Fallas en dispositivos GPS o conectividad de terceros</li>
              <li>Decisiones tomadas basadas en la informacion del sistema</li>
            </ul>

            <h2>8. Propiedad Intelectual</h2>
            <p>
              Todos los derechos de propiedad intelectual sobre la plataforma Altaviapp,
              incluyendo software, diseno, logos y documentacion, son propiedad exclusiva
              de Ceibatic o sus licenciantes.
            </p>

            <h2>9. Terminacion</h2>
            <p>
              Podemos suspender o terminar su acceso al servicio si incumple estos terminos
              o si detectamos actividades sospechosas. Usted puede cancelar su cuenta en
              cualquier momento contactandonos.
            </p>

            <h2>10. Modificaciones</h2>
            <p>
              Nos reservamos el derecho de modificar estos terminos en cualquier momento.
              Los cambios seran notificados a traves de la plataforma o por correo electronico.
              El uso continuado del servicio despues de los cambios constituye su aceptacion.
            </p>

            <h2>11. Ley Aplicable</h2>
            <p>
              Estos terminos se rigen por las leyes de la Republica del Ecuador. Cualquier
              disputa sera resuelta en los tribunales competentes de Quito, Ecuador.
            </p>

            <h2>12. Contacto</h2>
            <p>
              Para consultas sobre estos terminos, contactenos en:
            </p>
            <ul>
              <li>Email: legal@altaviapp.com</li>
              <li>Sitio web: www.altaviapp.com</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-sm">
          <p>&copy; 2025 Altaviapp - Ceibatic. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
