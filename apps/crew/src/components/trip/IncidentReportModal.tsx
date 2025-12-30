'use client';

import { useState, useCallback } from 'react';
import { AlertTriangle, Car, Stethoscope, User, MapPin, Clock, Camera, Send, CheckCircle, ArrowLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIncidentMutations, useTripStudents, useCurrentPosition } from '@/hooks';
import type { IncidentType, IncidentSeverity } from '@/hooks';
import { Modal } from '@/components/core';

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
  { value: 'critical', label: 'Critico', description: 'Requiere ambulancia/policia', color: 'bg-error' },
  { value: 'high', label: 'Alto', description: 'Sin heridos graves', color: 'bg-warning' },
  { value: 'medium', label: 'Medio', description: 'Requiere atencion', color: 'bg-warning' },
  { value: 'low', label: 'Menor', description: 'Solo informacion', color: 'bg-info' },
];

const delayOptions = [5, 10, 15, 20, 30];

export interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  onSuccess?: (incidentId: string) => void;
}

export function IncidentReportModal({ isOpen, onClose, tripId, onSuccess }: IncidentReportModalProps) {
  // Convex hooks
  const { reportIncident, isReady } = useIncidentMutations();
  const { students: tripStudents } = useTripStudents(tripId || null);
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

  // Get valid students from trip
  const validStudents = tripStudents
    .filter((ts): ts is NonNullable<typeof ts> => ts !== null && ts.student !== null)
    .map(ts => ({
      id: ts.student!.id,
      name: `${ts.student!.firstName} ${ts.student!.lastName}`,
    }));

  const currentType = incidentTypes.find(t => t.id === selectedType);

  const resetForm = useCallback(() => {
    setStep('type');
    setSelectedType(null);
    setSeverity('high');
    setDescription('');
    setSelectedStudents([]);
    setDelayMinutes(10);
    setNotifyParents(true);
    setNotifyAdmin(true);
    setError(null);
    setIncidentId(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

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
        onSuccess?.(result.incidentId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reportar incidente');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (step === 'success') {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="md" showClose={false}>
        <div className="flex flex-col items-center text-center py-4">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Incidente Reportado</h2>
          <p className="text-gray-600 text-sm mb-4">
            El incidente ha sido reportado y las notificaciones enviadas.
          </p>

          <div className="bg-gray-50 rounded-lg p-3 w-full mb-4">
            <div className="flex items-center gap-2 mb-2">
              {currentType && <currentType.icon className="w-4 h-4 text-gray-600" />}
              <span className="font-medium text-gray-900 text-sm">{currentType?.label}</span>
            </div>
            <p className="text-xs text-gray-500">ID: <span className="font-mono">{incidentId?.slice(0, 12)}...</span></p>
          </div>

          <div className="text-sm text-gray-600 mb-4">
            <p className="font-medium mb-2">Notificaciones enviadas a:</p>
            <div className="flex flex-col gap-1">
              {notifyAdmin && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-3 h-3" />
                  <span>Administradores</span>
                </div>
              )}
              {notifyParents && selectedType !== 'delay' && (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="w-3 h-3" />
                  <span>Padres de familia</span>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleClose}
            className="w-full py-3 bg-primary text-white rounded-lg font-medium"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" showClose={false}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 -mt-2">
        <button
          onClick={() => step === 'form' ? setStep('type') : handleClose()}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {step === 'form' ? <ArrowLeft className="w-5 h-5 text-gray-600" /> : <X className="w-5 h-5 text-gray-600" />}
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">Reportar Incidente</h2>
          <p className="text-sm text-gray-500">
            {step === 'type' ? 'Selecciona el tipo' : currentType?.label}
          </p>
        </div>
      </div>

      {/* Type Selection */}
      {step === 'type' && (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {incidentTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleSelectType(type.id)}
                className="w-full bg-white rounded-lg border border-gray-200 p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', type.color)}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                  <p className="text-xs text-gray-500">
                    Prioridad: {type.severity === 'critical' ? 'Critica' : type.severity === 'high' ? 'Alta' : type.severity === 'medium' ? 'Media' : 'Baja'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Incident Form */}
      {step === 'form' && (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Location & Time */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Informacion automatica</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Hora</p>
                <p className="text-gray-900">{new Date().toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Ubicacion</p>
                <p className="text-gray-900">{gpsPosition ? 'GPS Activo' : 'Sin GPS'}</p>
              </div>
            </div>
          </div>

          {/* Severity (not for delay) */}
          {selectedType !== 'delay' && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Gravedad</p>
              <div className="grid grid-cols-2 gap-2">
                {severityOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSeverity(option.value)}
                    className={cn(
                      'p-2 rounded-lg border text-left transition-colors',
                      severity === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div className={cn('w-2 h-2 rounded-full', option.color)} />
                      <span className="text-sm font-medium text-gray-900">{option.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Delay Options */}
          {selectedType === 'delay' && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Tiempo de retraso</p>
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
          {selectedType === 'student' && validStudents.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">Estudiantes involucrados</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
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
                      'w-full p-2 rounded-lg border text-left flex items-center gap-2 transition-colors',
                      selectedStudents.includes(student.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className={cn(
                      'w-4 h-4 rounded border flex items-center justify-center',
                      selectedStudents.includes(student.id)
                        ? 'bg-primary border-primary'
                        : 'border-gray-300'
                    )}>
                      {selectedStudents.includes(student.id) && (
                        <CheckCircle className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900">{student.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-error/10 rounded-lg text-sm text-error">
              {error}
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-gray-900 mb-2">Descripcion</p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el incidente..."
              rows={3}
              className="w-full p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Notifications */}
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Notificaciones</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Administradores</span>
                <button
                  onClick={() => setNotifyAdmin(!notifyAdmin)}
                  className={cn(
                    'w-10 h-5 rounded-full transition-colors relative',
                    notifyAdmin ? 'bg-success' : 'bg-gray-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform',
                      notifyAdmin ? 'translate-x-5' : 'translate-x-0.5'
                    )}
                  />
                </button>
              </div>
              {selectedType !== 'delay' && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Padres</span>
                  <button
                    onClick={() => setNotifyParents(!notifyParents)}
                    className={cn(
                      'w-10 h-5 rounded-full transition-colors relative',
                      notifyParents ? 'bg-success' : 'bg-gray-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform',
                        notifyParents ? 'translate-x-5' : 'translate-x-0.5'
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
              'w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
              severity === 'critical'
                ? 'bg-error text-white hover:bg-error/90'
                : 'bg-primary text-white hover:bg-primary/90',
              isSubmitting && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isSubmitting ? (
              <span>Enviando...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {severity === 'critical' ? 'Enviar Urgente' : 'Enviar Reporte'}
              </>
            )}
          </button>
        </div>
      )}
    </Modal>
  );
}
