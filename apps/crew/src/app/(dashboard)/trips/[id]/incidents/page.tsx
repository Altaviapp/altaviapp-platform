'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle, Car, Stethoscope, User, MapPin, Clock, Camera, Send, CheckCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIncidentMutations, useTripStudents, useCurrentPosition, useConvexAuth } from '@/hooks';
import type { IncidentType, IncidentSeverity } from '@/hooks';

// Map frontend incident types to backend types
const incidentTypeMap: Record<string, IncidentType> = {
  'accident': 'accident',
  'medical': 'emergency',
  'student': 'behavior',
  'route': 'breakdown',
  'delay': 'other',
  'other': 'other',
};

const incidentTypes = [
  { id: 'accident', label: 'Accidente de Tránsito', icon: Car, color: 'bg-error', severity: 'critical' as const },
  { id: 'medical', label: 'Emergencia Médica', icon: Stethoscope, color: 'bg-error', severity: 'critical' as const },
  { id: 'student', label: 'Problema con Estudiante', icon: User, color: 'bg-warning', severity: 'high' as const },
  { id: 'route', label: 'Problema en la Ruta', icon: MapPin, color: 'bg-warning', severity: 'medium' as const },
  { id: 'delay', label: 'Retraso', icon: Clock, color: 'bg-info', severity: 'low' as const },
  { id: 'other', label: 'Otro', icon: AlertTriangle, color: 'bg-gray-500', severity: 'low' as const },
];

const severityOptions: { value: IncidentSeverity; label: string; description: string; color: string }[] = [
  { value: 'critical', label: 'Crítico', description: 'Requiere ambulancia/policía', color: 'bg-error' },
  { value: 'high', label: 'Alto', description: 'Sin heridos graves', color: 'bg-warning' },
  { value: 'medium', label: 'Medio', description: 'Requiere atención', color: 'bg-warning' },
  { value: 'low', label: 'Menor', description: 'Solo información', color: 'bg-info' },
];

const delayOptions = [5, 10, 15, 20, 30];

export default function IncidentsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params?.id as string ?? '';

  // Convex hooks
  const { isLoading: authLoading } = useConvexAuth();
  const { reportIncident, isReady } = useIncidentMutations();
  const { students: tripStudents, isLoading: studentsLoading } = useTripStudents(tripId || null);
  const { position: gpsPosition } = useCurrentPosition();

  // Form state
  const [step, setStep] = useState<'type' | 'form' | 'success'>('type');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [severity, setSeverity] = useState<IncidentSeverity>('high');
  const [description, setDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [delayMinutes, setDelayMinutes] = useState(10);
  const [notifyParents, setNotifyParents] = useState(true);
  const [notifyAdmin, setNotifyAdmin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incidentId, setIncidentId] = useState<string | null>(null);

  // Get valid students from trip (filter out nulls and get student info)
  const validStudents = tripStudents
    .filter((ts): ts is NonNullable<typeof ts> => ts !== null && ts.student !== null)
    .map(ts => ({
      id: ts.student!.id,
      name: `${ts.student!.firstName} ${ts.student!.lastName}`,
    }));

  const currentType = incidentTypes.find(t => t.id === selectedType);

  const handleSelectType = (typeId: string) => {
    setSelectedType(typeId);
    const type = incidentTypes.find(t => t.id === typeId);
    if (type) {
      setSeverity(type.severity);
    }
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!currentType || !isReady) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Build incident title based on type
      let title = currentType.label;
      if (selectedType === 'delay') {
        title = `Retraso de ${delayMinutes} minutos`;
      } else if (selectedType === 'student' && selectedStudents.length > 0) {
        const studentNames = validStudents
          .filter(s => selectedStudents.includes(s.id))
          .map(s => s.name)
          .join(', ');
        title = `${currentType.label}: ${studentNames}`;
      }

      // Build description
      let fullDescription = description || currentType.label;
      if (selectedType === 'delay') {
        fullDescription = `Retraso estimado de ${delayMinutes} minutos. ${description}`.trim();
      }

      const result = await reportIncident({
        tripId,
        type: incidentTypeMap[selectedType ?? 'other'] ?? 'other',
        severity,
        title,
        description: fullDescription,
        latitude: gpsPosition?.latitude,
        longitude: gpsPosition?.longitude,
        location: gpsPosition ? `${gpsPosition.latitude.toFixed(6)}, ${gpsPosition.longitude.toFixed(6)}` : undefined,
      });

      if (result.success) {
        setIncidentId(result.incidentId);
        setStep('success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reportar incidente');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/trips/${tripId}/active`);
  };

  // Loading state
  if (authLoading || studentsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Incidente Reportado</h1>
        <p className="text-gray-600 text-center mb-6">
          El incidente ha sido reportado exitosamente y las notificaciones han sido enviadas.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-4 w-full max-w-sm mb-6">
          <div className="flex items-center gap-3 mb-3">
            {currentType && <currentType.icon className="w-5 h-5 text-gray-600" />}
            <span className="font-medium text-gray-900">{currentType?.label}</span>
          </div>
          <p className="text-sm text-gray-500 mb-2">ID de reporte:</p>
          <p className="font-mono font-medium text-primary text-xs break-all">{incidentId}</p>
        </div>

        <div className="space-y-3 w-full max-w-sm">
          <p className="text-sm text-gray-600 text-center">Notificaciones enviadas a:</p>
          <div className="flex flex-col gap-2">
            {notifyAdmin && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" />
                Administradores
              </div>
            )}
            {notifyParents && selectedType !== 'delay' && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" />
                Padres de familia
              </div>
            )}
            {severity === 'critical' && (
              <div className="flex items-center gap-2 text-sm text-success">
                <CheckCircle className="w-4 h-4" />
                Emergencias (911)
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleGoBack}
          className="mt-8 w-full max-w-sm py-3 bg-primary text-white rounded-lg font-medium"
        >
          Volver al viaje
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step === 'form' ? setStep('type') : handleGoBack()}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Reportar Incidente</h1>
          <p className="text-sm text-gray-500">
            {step === 'type' ? 'Selecciona el tipo de incidente' : currentType?.label}
          </p>
        </div>
      </div>

      {/* Type Selection */}
      {step === 'type' && (
        <div className="space-y-3">
          {incidentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className="w-full bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', type.color)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{type.label}</p>
                  <p className="text-xs text-gray-500 capitalize">Prioridad: {type.severity === 'critical' ? 'Crítica' : type.severity === 'high' ? 'Alta' : type.severity === 'medium' ? 'Media' : 'Baja'}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Incident Form */}
      {step === 'form' && (
        <div className="space-y-4">
          {/* Location & Time */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Información Automática</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">Hora</p>
                <p className="text-gray-900">{new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ubicación</p>
                <p className="text-gray-900">GPS Activo</p>
              </div>
            </div>
          </div>

          {/* Severity (not for delay) */}
          {selectedType !== 'delay' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Gravedad</h3>
              <div className="space-y-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    className={cn(
                      'w-full p-3 rounded-lg border-2 text-left transition-colors',
                      severity === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', option.color)} />
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delay Options */}
          {selectedType === 'delay' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Tiempo de retraso estimado</h3>
              <div className="flex flex-wrap gap-2">
                {delayOptions.map((minutes) => (
                  <button
                    key={minutes}
                    onClick={() => setDelayMinutes(minutes)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                      delayMinutes === minutes
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Student Selection (for student-related incidents) */}
          {selectedType === 'student' && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900 mb-3">Estudiantes involucrados</h3>
              {validStudents.length === 0 ? (
                <p className="text-sm text-gray-500">No hay estudiantes en este viaje</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {validStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudents(prev =>
                          prev.includes(student.id)
                            ? prev.filter(id => id !== student.id)
                            : [...prev, student.id]
                        );
                      }}
                      className={cn(
                        'w-full p-3 rounded-lg border text-left flex items-center gap-3 transition-colors',
                        selectedStudents.includes(student.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className={cn(
                        'w-5 h-5 rounded border flex items-center justify-center',
                        selectedStudents.includes(student.id)
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      )}>
                        {selectedStudents.includes(student.id) && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-900">{student.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-error/10 rounded-lg text-sm text-error">
              {error}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Descripción</h3>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el incidente..."
              rows={4}
              className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Photos */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Fotos (opcional)</h3>
            <button className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center gap-2 hover:border-gray-400 transition-colors">
              <Camera className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-600">Agregar fotos</span>
            </button>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3">Notificaciones</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Notificar a administradores</span>
                <button
                  onClick={() => setNotifyAdmin(!notifyAdmin)}
                  className={cn(
                    'w-12 h-6 rounded-full transition-colors relative',
                    notifyAdmin ? 'bg-success' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                      notifyAdmin ? 'translate-x-6' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
              {selectedType !== 'delay' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Notificar a padres</span>
                  <button
                    onClick={() => setNotifyParents(!notifyParents)}
                    className={cn(
                      'w-12 h-6 rounded-full transition-colors relative',
                      notifyParents ? 'bg-success' : 'bg-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform',
                        notifyParents ? 'translate-x-6' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
              severity === 'critical'
                ? 'bg-error text-white hover:bg-error-dark'
                : 'bg-primary text-white hover:bg-primary/90'
            )}
          >
            {isSubmitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                {severity === 'critical' ? 'Enviar Reporte Urgente' : 'Enviar Reporte'}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
