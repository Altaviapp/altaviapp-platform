'use client';

import { useState } from 'react';
import { User, GraduationCap, Bus, MapPin, Clock, BarChart3, QrCode, Download, Printer, Mail, Phone, ChevronRight, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock students data
const students = [
  {
    id: 1,
    name: 'Sofía García',
    grade: '5to Grado - Sección A',
    age: 10,
    birthDate: '15/03/2014',
    institution: 'Escuela Altaviapp',
    photo: null,
    transport: {
      route: 'Centro - Escuela Altaviapp',
      pickupStop: 'Av. 12 de Octubre y Orellana',
      pickupTime: '07:45',
      returnStop: 'Av. 12 de Octubre y Orellana',
      returnTime: '14:05',
      driver: 'Juan Pérez',
      vehicle: 'ABC-1234 (Toyota Coaster)',
    },
    stats: {
      tripsCompleted: 18,
      totalTrips: 20,
      attendance: 90,
      punctuality: 95,
      avgTripIda: 27,
      avgTripVuelta: 29,
    },
    qrCode: 'STU-001-2024',
    emergencyContacts: [
      { name: 'María García', relation: 'Madre', phone: '+593 99 987 6543' },
      { name: 'Pedro García', relation: 'Padre', phone: '+593 98 765 4321' },
    ],
  },
  {
    id: 2,
    name: 'Carlos García',
    grade: '3ro Grado - Sección B',
    age: 8,
    birthDate: '22/07/2016',
    institution: 'Escuela Altaviapp',
    photo: null,
    transport: {
      route: 'Norte - Escuela Altaviapp',
      pickupStop: 'Av. República y Naciones Unidas',
      pickupTime: '07:30',
      returnStop: 'Av. República y Naciones Unidas',
      returnTime: '14:15',
      driver: 'María González',
      vehicle: 'XYZ-5678 (Hino FB)',
    },
    stats: {
      tripsCompleted: 16,
      totalTrips: 20,
      attendance: 80,
      punctuality: 92,
      avgTripIda: 25,
      avgTripVuelta: 28,
    },
    qrCode: 'STU-002-2024',
    emergencyContacts: [
      { name: 'María García', relation: 'Madre', phone: '+593 99 987 6543' },
      { name: 'Pedro García', relation: 'Padre', phone: '+593 98 765 4321' },
    ],
  },
];

export default function ProfilePage() {
  const [selectedStudent, setSelectedStudent] = useState(students[0]!);

  return (
    <div className="space-y-4">
      {/* Student Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {students.map((student) => (
          <button
            key={student.id}
            onClick={() => setSelectedStudent(student)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedStudent.id === student.id
                ? 'bg-primary text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            )}
          >
            {student.name}
          </button>
        ))}
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{selectedStudent.name}</h2>
            <p className="text-sm text-gray-600">{selectedStudent.grade}</p>
            <p className="text-sm text-gray-500">{selectedStudent.institution}</p>
          </div>
        </div>

        {/* Personal Details */}
        <div className="border-t border-gray-100 pt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Información Personal</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Edad</p>
              <p className="text-sm font-medium text-gray-900">{selectedStudent.age} años</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de nacimiento</p>
              <p className="text-sm font-medium text-gray-900">{selectedStudent.birthDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Transport Info Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Bus className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Información de Transporte</h3>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500">Ruta Asignada</p>
            <p className="text-sm font-medium text-gray-900">{selectedStudent.transport.route}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Parada de Recogida</p>
              <p className="text-sm text-gray-900">{selectedStudent.transport.pickupStop}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                <Clock className="w-3 h-3 inline mr-1" />
                {selectedStudent.transport.pickupTime}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Parada de Regreso</p>
              <p className="text-sm text-gray-900">{selectedStudent.transport.returnStop}</p>
              <p className="text-xs text-gray-600 mt-0.5">
                <Clock className="w-3 h-3 inline mr-1" />
                {selectedStudent.transport.returnTime}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-500">Conductor Regular</p>
              <p className="text-sm font-medium text-gray-900">{selectedStudent.transport.driver}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Vehículo Regular</p>
              <p className="text-sm font-medium text-gray-900">{selectedStudent.transport.vehicle}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Estadísticas del Mes</h3>
          </div>
          <button className="text-sm text-primary hover:underline flex items-center gap-1">
            Ver completas <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-gray-900">
              {selectedStudent.stats.tripsCompleted}/{selectedStudent.stats.totalTrips}
            </p>
            <p className="text-xs text-gray-500">Viajes completados</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-success">{selectedStudent.stats.attendance}%</p>
            <p className="text-xs text-gray-500">Asistencia</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-info">{selectedStudent.stats.punctuality}%</p>
            <p className="text-xs text-gray-500">Puntualidad</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Tiempo promedio (ida)</p>
            <p className="text-lg font-semibold text-gray-900">{selectedStudent.stats.avgTripIda} min</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Tiempo promedio (vuelta)</p>
            <p className="text-lg font-semibold text-gray-900">{selectedStudent.stats.avgTripVuelta} min</p>
          </div>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <QrCode className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">Código QR del Estudiante</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          Este código QR se usa para check-in/check-out en el bus
        </p>

        {/* QR Placeholder */}
        <div className="bg-gray-50 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
          <div className="w-40 h-40 bg-white rounded-lg border-2 border-gray-200 flex items-center justify-center mb-2">
            <div className="grid grid-cols-5 gap-1 p-2">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'w-5 h-5 rounded-sm',
                    Math.random() > 0.5 ? 'bg-gray-900' : 'bg-white'
                  )}
                />
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-500">{selectedStudent.qrCode}</p>
        </div>

        {/* QR Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Download className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Descargar</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Printer className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Imprimir</span>
          </button>
          <button className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
            <Mail className="w-5 h-5 text-gray-600" />
            <span className="text-xs text-gray-600">Enviar</span>
          </button>
        </div>

        <div className="mt-4 p-3 bg-info/10 rounded-lg">
          <p className="text-xs text-info-dark">
            <strong>Tip:</strong> Guarde el QR en su teléfono o imprímalo para que su hijo lo lleve en su mochila
          </p>
        </div>
      </div>

      {/* Emergency Contacts Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-gray-900">Contactos de Emergencia</h3>
          </div>
          <button className="text-sm text-primary hover:underline">
            Editar
          </button>
        </div>

        <div className="space-y-3">
          {selectedStudent.emergencyContacts.map((contact, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{contact.name}</p>
                <p className="text-sm text-gray-500">{contact.relation}</p>
              </div>
              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="text-sm text-primary hover:underline"
              >
                {contact.phone}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
