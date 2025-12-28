'use client';

/**
 * CheckinSheet Component
 *
 * Bottom sheet for student check-in during active trips.
 * Supports QR scanning (primary) and manual selection (fallback).
 */

import { useState, useCallback, useEffect } from 'react';
import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  X,
  QrCode,
  Users,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { QRScanner, type QRScanResult } from './QRScanner';
import { useCheckinMutations, useStudentByQR, useTripStudents, useCurrentPosition } from '@/hooks';
import type { Id } from '../../../../../convex/_generated/dataModel';

type CheckinMode = 'scanner' | 'manual' | 'confirming' | 'success' | 'error';

interface CurrentStop {
  id: Id<'routeStops'>;
  name: string;
  order: number;
}

interface CheckinSheetProps {
  tripId: Id<'trips'>;
  currentStop: CurrentStop | null;
  routeType: 'pickup' | 'dropoff';
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (studentName: string) => void;
}

interface ScannedStudent {
  id: Id<'students'>;
  name: string;
  stopId: Id<'routeStops'>;
  stopName: string;
}

export function CheckinSheet({
  tripId,
  currentStop,
  routeType,
  isOpen,
  onClose,
  onSuccess,
}: CheckinSheetProps) {
  const [mode, setMode] = useState<CheckinMode>('scanner');
  const [scannedStudent, setScannedStudent] = useState<ScannedStudent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastQrCode, setLastQrCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStudent, setSuccessStudent] = useState<string | null>(null);

  // Hooks
  const { recordCheckin } = useCheckinMutations();
  const { student: qrStudent, isLoading: qrLoading } = useStudentByQR(lastQrCode);
  const { students: tripStudents } = useTripStudents(tripId);
  const { getPosition } = useCurrentPosition();

  // Reset state when sheet opens
  useEffect(() => {
    if (isOpen) {
      setMode('scanner');
      setScannedStudent(null);
      setError(null);
      setLastQrCode(null);
      setSuccessStudent(null);
    }
  }, [isOpen]);

  // Process QR lookup result
  useEffect(() => {
    if (!lastQrCode || qrLoading) return;

    if (qrStudent) {
      // Find student's stop info from trip students
      const tripStudent = tripStudents.find(
        (ts: any) => ts.student?._id === qrStudent._id
      );

      if (!tripStudent) {
        setError('Este estudiante no está asignado a este viaje');
        setMode('error');
        return;
      }

      if (tripStudent.checkedIn) {
        setError('Este estudiante ya tiene check-in registrado');
        setMode('error');
        return;
      }

      setScannedStudent({
        id: qrStudent._id as Id<'students'>,
        name: `${qrStudent.firstName} ${qrStudent.lastName}`,
        stopId: (tripStudent.stop as any)?._id || currentStop?.id || '' as Id<'routeStops'>,
        stopName: tripStudent.stop?.name || currentStop?.name || 'Parada actual',
      });
      setMode('confirming');
    } else if (lastQrCode) {
      setError('Código QR no reconocido');
      setMode('error');
    }
  }, [qrStudent, qrLoading, lastQrCode, tripStudents, currentStop]);

  // Handle QR scan
  const handleQrScan = useCallback((result: QRScanResult) => {
    if (result.isValid && result.studentData?.studentId) {
      setLastQrCode(result.studentData.studentId);
      setError(null);
    } else {
      setError('Código QR inválido. Escanea el código del estudiante.');
      setMode('error');
    }
  }, []);

  // Handle manual student selection
  const handleManualSelect = useCallback((student: any) => {
    setScannedStudent({
      id: student._id || student.id,
      name: student.name || `${student.firstName} ${student.lastName}`,
      stopId: student.stop?._id || student.stopId || currentStop?.id || '' as Id<'routeStops'>,
      stopName: student.stop?.name || student.stopName || currentStop?.name || 'Parada actual',
    });
    setMode('confirming');
  }, [currentStop]);

  // Confirm check-in
  const handleConfirmCheckin = async () => {
    if (!scannedStudent) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const position = await getPosition();
      const latitude = position?.latitude ?? -0.1828;
      const longitude = position?.longitude ?? -78.4847;

      await recordCheckin({
        tripId,
        studentId: scannedStudent.id,
        stopId: scannedStudent.stopId,
        checkinType: routeType === 'pickup' ? 'pickup' : 'dropoff',
        qrScanned: mode === 'confirming' && lastQrCode !== null,
        latitude,
        longitude,
        manualReason: lastQrCode ? undefined : 'Check-in manual desde lista',
      });

      setSuccessStudent(scannedStudent.name);
      setMode('success');
      onSuccess?.(scannedStudent.name);

      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar check-in');
      setMode('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Retry from error
  const handleRetry = () => {
    setError(null);
    setLastQrCode(null);
    setScannedStudent(null);
    setMode('scanner');
  };

  // Get pending students for manual selection
  const pendingStudents = tripStudents.filter(
    (ts: any) => ts.student && !ts.checkedIn && ts.status === 'scheduled'
  );

  // Group by stop
  interface StudentItem {
    _id: string;
    name: string;
    grade: string;
    stopId: string;
    stopName: string;
  }
  const studentsByStop: Record<string, StudentItem[]> = pendingStudents.reduce((acc: Record<string, StudentItem[]>, ts: any) => {
    const stopName = ts.stop?.name || 'Sin parada';
    if (!acc[stopName]) {
      acc[stopName] = [];
    }
    acc[stopName].push({
      _id: ts.student?._id,
      name: `${ts.student?.firstName || ''} ${ts.student?.lastName || ''}`.trim(),
      grade: ts.student?.grade || '',
      stopId: ts.stop?._id,
      stopName,
    });
    return acc;
  }, {});

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        {/* Sheet Container */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center lg:items-center lg:p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full lg:translate-y-0 lg:scale-95"
              enterTo="opacity-100 translate-y-0 lg:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 lg:scale-100"
              leaveTo="opacity-0 translate-y-full lg:translate-y-0 lg:scale-95"
            >
              <Dialog.Panel className="w-full lg:max-w-lg transform overflow-hidden rounded-t-2xl lg:rounded-2xl bg-white shadow-xl transition-all max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Check-in
                      </Dialog.Title>
                      <p className="text-sm text-gray-500">
                        {routeType === 'pickup' ? 'Recogida' : 'Entrega'} de estudiante
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4">
                  {/* Scanner Mode */}
                  {mode === 'scanner' && (
                    <div className="space-y-4">
                      <QRScanner
                        isActive={isOpen && mode === 'scanner'}
                        onScan={handleQrScan}
                        onError={(err) => setError(err)}
                        onClose={() => setMode('manual')}
                        className="rounded-xl overflow-hidden"
                      />

                      <p className="text-center text-sm text-gray-500">
                        Escanea el código QR del estudiante
                      </p>

                      <button
                        onClick={() => setMode('manual')}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-primary hover:text-primary transition-colors"
                      >
                        <Users className="w-5 h-5" />
                        Check-in manual
                      </button>
                    </div>
                  )}

                  {/* Manual Mode */}
                  {mode === 'manual' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Seleccionar estudiante</h3>
                        <button
                          onClick={() => setMode('scanner')}
                          className="text-sm text-primary hover:underline flex items-center gap-1"
                        >
                          <QrCode className="w-4 h-4" />
                          Usar QR
                        </button>
                      </div>

                      {Object.keys(studentsByStop).length === 0 ? (
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500">No hay estudiantes pendientes</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {Object.entries(studentsByStop).map(([stopName, students]) => (
                            <div key={stopName}>
                              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                                {stopName}
                              </p>
                              <div className="space-y-2">
                                {students.map((student) => (
                                  <button
                                    key={student._id}
                                    onClick={() => handleManualSelect(student)}
                                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                                  >
                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-600">
                                        {student.name.split(' ').map((n: string) => n[0]).join('')}
                                      </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">{student.name}</p>
                                      <p className="text-xs text-gray-500">{student.grade}</p>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirming Mode */}
                  {mode === 'confirming' && scannedStudent && (
                    <div className="space-y-4">
                      <div className="text-center py-4">
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                          <span className="text-2xl font-bold text-primary">
                            {scannedStudent.name.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{scannedStudent.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{scannedStudent.stopName}</p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-sm text-gray-600 text-center">
                          {routeType === 'pickup'
                            ? '¿Confirmar que el estudiante subió al bus?'
                            : '¿Confirmar que el estudiante bajó del bus?'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={handleRetry}
                          disabled={isSubmitting}
                          className="py-3 px-4 rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirmCheckin}
                          disabled={isSubmitting}
                          className="py-3 px-4 rounded-xl bg-success text-white font-medium hover:bg-success/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5" />
                              Confirmar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Success Mode */}
                  {mode === 'success' && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-10 h-10 text-success" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Check-in exitoso</h3>
                      <p className="text-gray-500 mt-2">
                        {successStudent} {routeType === 'pickup' ? 'subió al bus' : 'bajó del bus'}
                      </p>
                    </div>
                  )}

                  {/* Error Mode */}
                  {mode === 'error' && (
                    <div className="text-center py-8">
                      <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
                        <AlertCircle className="w-10 h-10 text-error" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">Error</h3>
                      <p className="text-gray-500 mt-2">{error}</p>
                      <button
                        onClick={handleRetry}
                        className="mt-4 py-3 px-6 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors"
                      >
                        Intentar de nuevo
                      </button>
                    </div>
                  )}
                </div>

                {/* Current Stop Indicator */}
                {currentStop && mode !== 'success' && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center">
                      Parada actual: <span className="font-medium text-gray-700">{currentStop.name}</span>
                    </p>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export default CheckinSheet;
