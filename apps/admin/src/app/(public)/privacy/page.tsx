'use client';

import Link from 'next/link';
import { ArrowLeft, GraduationCap, Lock } from 'lucide-react';

export default function PrivacyPage() {
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
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Politica de Privacidad</h1>
              <p className="text-sm text-gray-500">Ultima actualizacion: Diciembre 2024</p>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2>1. Introduccion</h2>
            <p>
              En Altaviapp, operado por Ceibatic, nos comprometemos a proteger la privacidad
              de nuestros usuarios, especialmente cuando se trata de informacion de menores
              de edad. Esta politica describe como recopilamos, utilizamos y protegemos
              sus datos personales.
            </p>

            <h2>2. Informacion que Recopilamos</h2>

            <h3>2.1 Datos de Instituciones y Administradores</h3>
            <ul>
              <li>Nombre de la institucion educativa</li>
              <li>Direccion y ubicacion geografica</li>
              <li>Datos de contacto del administrador (nombre, email, telefono)</li>
              <li>Credenciales de acceso (contraseña encriptada)</li>
            </ul>

            <h3>2.2 Datos de Personal (Conductores y Monitores)</h3>
            <ul>
              <li>Nombre completo y documento de identidad</li>
              <li>Informacion de contacto</li>
              <li>Informacion de licencia de conducir (para conductores)</li>
              <li>Ubicacion GPS durante rutas activas</li>
            </ul>

            <h3>2.3 Datos de Estudiantes y Familias</h3>
            <ul>
              <li>Nombre del estudiante y grado escolar</li>
              <li>Foto del estudiante (para identificacion)</li>
              <li>Direccion de recogida y entrega</li>
              <li>Datos de padres o tutores (nombre, telefono, email)</li>
              <li>Registros de check-in/check-out</li>
              <li>Informacion medica relevante para emergencias</li>
            </ul>

            <h3>2.4 Datos Tecnicos</h3>
            <ul>
              <li>Direccion IP y tipo de dispositivo</li>
              <li>Datos de ubicacion GPS de vehiculos</li>
              <li>Registros de actividad en la plataforma</li>
            </ul>

            <h2>3. Como Utilizamos la Informacion</h2>
            <p>Utilizamos los datos recopilados para:</p>
            <ul>
              <li>Proporcionar el servicio de seguimiento de transporte escolar</li>
              <li>Enviar notificaciones a padres sobre el estado de sus hijos</li>
              <li>Generar reportes de operacion para las instituciones</li>
              <li>Mejorar la seguridad y funcionalidad de la plataforma</li>
              <li>Cumplir con obligaciones legales</li>
              <li>Comunicar actualizaciones importantes del servicio</li>
            </ul>

            <h2>4. Proteccion de Datos de Menores</h2>
            <p>
              Entendemos la sensibilidad de manejar datos de menores de edad. Por ello:
            </p>
            <ul>
              <li>Solo recopilamos informacion estrictamente necesaria para el servicio</li>
              <li>Los datos de estudiantes solo son accesibles por personal autorizado de la institucion</li>
              <li>Las fotos de estudiantes se utilizan unicamente para verificacion de identidad</li>
              <li>No compartimos datos de menores con terceros para fines comerciales</li>
              <li>Los padres pueden solicitar acceso o eliminacion de los datos de sus hijos</li>
            </ul>

            <h2>5. Comparticion de Datos</h2>
            <p>Solo compartimos datos personales en los siguientes casos:</p>
            <ul>
              <li><strong>Dentro de la institucion:</strong> Entre administradores, conductores y monitores autorizados</li>
              <li><strong>Con padres/tutores:</strong> Informacion sobre sus propios hijos</li>
              <li><strong>Proveedores de servicios:</strong> Servicios tecnicos necesarios para operar la plataforma (hosting, email)</li>
              <li><strong>Requerimientos legales:</strong> Cuando sea exigido por autoridades competentes</li>
            </ul>

            <h2>6. Seguridad de los Datos</h2>
            <p>Implementamos medidas de seguridad para proteger su informacion:</p>
            <ul>
              <li>Encriptacion de datos en transito y reposo</li>
              <li>Contraseñas almacenadas con hash seguro (PBKDF2)</li>
              <li>Acceso basado en roles (RBAC)</li>
              <li>Aislamiento de datos entre instituciones (multi-tenancy)</li>
              <li>Monitoreo de actividad sospechosa</li>
              <li>Bloqueo de cuenta tras intentos fallidos de acceso</li>
            </ul>

            <h2>7. Retencion de Datos</h2>
            <p>
              Mantenemos los datos mientras la cuenta este activa o sea necesario para
              proporcionar el servicio. Tras la terminacion:
            </p>
            <ul>
              <li>Datos de estudiantes: eliminados dentro de 30 dias</li>
              <li>Historiales de viajes: archivados por 1 año para reportes</li>
              <li>Datos de facturacion: retenidos segun requisitos fiscales</li>
            </ul>

            <h2>8. Sus Derechos</h2>
            <p>Usted tiene derecho a:</p>
            <ul>
              <li><strong>Acceso:</strong> Solicitar una copia de sus datos personales</li>
              <li><strong>Rectificacion:</strong> Corregir datos inexactos</li>
              <li><strong>Eliminacion:</strong> Solicitar la eliminacion de sus datos</li>
              <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
              <li><strong>Oposicion:</strong> Oponerse al procesamiento de sus datos</li>
            </ul>
            <p>
              Para ejercer estos derechos, contactenos a privacidad@altaviapp.com
            </p>

            <h2>9. Cookies y Tecnologias Similares</h2>
            <p>
              Utilizamos cookies esenciales para el funcionamiento de la plataforma,
              incluyendo autenticacion y preferencias de usuario. No utilizamos
              cookies de seguimiento publicitario.
            </p>

            <h2>10. Cambios a esta Politica</h2>
            <p>
              Podemos actualizar esta politica periodicamente. Los cambios significativos
              seran notificados por email o mediante aviso en la plataforma.
            </p>

            <h2>11. Contacto</h2>
            <p>
              Para preguntas sobre privacidad o para ejercer sus derechos:
            </p>
            <ul>
              <li>Email: privacidad@altaviapp.com</li>
              <li>Direccion: Quito, Ecuador</li>
            </ul>

            <h2>12. Autoridad de Control</h2>
            <p>
              Si considera que el tratamiento de sus datos no cumple con la normativa,
              puede presentar una reclamacion ante la autoridad de proteccion de datos
              de su pais.
            </p>
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
