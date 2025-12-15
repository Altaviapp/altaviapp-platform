'use client';

import { useState, useCallback, useEffect } from 'react';
import { QrCode, User, CheckCircle, Search, AlertCircle, Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { QRScanner, type QRScanResult } from '@/components/checkin';
import {
  useConvexAuth,
  useActiveConvexTrip,
  usePendingStudents,
  useTripCheckins,
  useCheckinMutations,
  useStudentByQR,
  useCurrentPosition,
} from '@/hooks';
import type { Id } from '../../../../../../convex/_generated/dataModel';

export default function CheckinPage() {
  const { isLoading: authLoading } = useConvexAuth();
  const { activeTrip, isLoading: tripLoading, hasActiveTrip } = useActiveConvexTrip();

  // Get pending students and checkins for the active trip
  const tripId = activeTrip?._id as Id<'trips'> | null;
  const { pending: pendingStudents, isLoading: pendingLoading } = usePendingStudents(tripId);
  const { checkins, isLoading: checkinsLoading } = useTripCheckins(tripId);
  const { recordCheckin } = useCheckinMutations();

  // GPS position for check-in location
  const { position: gpsPosition } = useCurrentPosition();

  // Scanner state
  const [scanMode, setScanMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [lastScanned, setLastScanned] = useState<{ name: string; success: boolean } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // QR validation state
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const { student: scannedStudent, isLoading: studentLoading } = useStudentByQR(scannedQR);

  // Process check-in when student is found from QR
  useEffect(() => {
    if (scannedStudent && !isProcessing && tripId) {
      processCheckin(scannedStudent._id, scannedStudent.firstName, scannedStudent.lastName, true);
    }
  }, [scannedStudent, isProcessing, tripId]);

  // Filter students for manual selection - filter out null values
  const validPendingStudents = pendingStudents.filter((s): s is NonNullable<typeof s> => s !== null);
  const filteredStudents = validPendingStudents.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Checked-in students (pickup type)
  const checkedInStudents = checkins.filter(c => c.checkinType === 'pickup');

  // Handle QR scan result
  const handleScan = useCallback((result: QRScanResult) => {
    if (!result.isValid) {
      setLastScanned({ name: 'Código QR inválido', success: false });
      setTimeout(() => setLastScanned(null), 3000);
      return;
    }

    // Set the scanned QR to trigger student lookup
    setScannedQR(result.rawValue);
  }, []);

  // Process check-in (both QR and manual)
  const processCheckin = async (
    studentId: Id<'students'>,
    firstName: string,
    lastName: string,
    qrScanned: boolean
  ) => {
    if (!tripId || isProcessing) return;

    setIsProcessing(true);

    try {
      // Get a stop ID - use the first pending student's stop
      const stopId = validPendingStudents[0]?.stopId;

      if (!stopId) {
        throw new Error('No hay parada activa');
      }

      await recordCheckin({
        tripId,
        studentId,
        stopId: stopId as Id<'routeStops'>,
        checkinType: 'pickup',
        qrScanned,
        latitude: gpsPosition?.latitude ?? 0,
        longitude: gpsPosition?.longitude ?? 0,
        manualReason: qrScanned ? undefined : 'Selección manual',
      });

      const studentName = `${firstName} ${lastName}`;
      setLastScanned({ name: studentName, success: true });

      // Close scanner after successful scan
      if (qrScanned) {
        setTimeout(() => {
          setScanMode(false);
          setScannedQR(null);
        }, 1500);
      }

      // Close manual select after successful check-in
      if (!qrScanned) {
        setShowManualSelect(false);
      }
    } catch (error) {
      console.error('Check-in error:', error);
      setLastScanned({
        name: error instanceof Error ? error.message : 'Error en check-in',
        success: false,
      });
    } finally {
      setIsProcessing(false);
      setScannedQR(null);
      setTimeout(() => setLastScanned(null), 3000);
    }
  };

  // Handle manual check-in
  const handleManualCheckin = (student: {
    studentId: Id<'students'>;
    firstName: string;
    lastName: string;
  }) => {
    processCheckin(student.studentId, student.firstName, student.lastName, false);
  };

  // Handle scanner error
  const handleScanError = useCallback((error: string) => {
    console.error('Scanner error:', error);
  }, []);

  // Loading state
  const isLoading = authLoading || tripLoading || pendingLoading || checkinsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="bg-gray-100 rounded-xl h-16" />
        <div className="bg-gray-100 rounded-xl h-48" />
        <div className="bg-gray-100 rounded-xl h-32" />
      </div>
    );
  }

  // No active trip
  if (!hasActiveTrip) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Sin viaje activo</h3>
        <p className="text-sm text-gray-500 text-center mb-4">
          Inicia un viaje para poder realizar check-ins.
        </p>
        <Link
          href="/trips"
          className="px-4 py-2 bg-primary text-white rounded-lg font-medium"
        >
          Ver viajes
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Check-in</h1>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {activeTrip?.route?.name ?? 'Ruta activa'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">
            {checkedInStudents.length}/{validPendingStudents.length + checkedInStudents.length}
          </p>
          <p className="text-xs text-gray-500">a bordo</p>
        </div>
      </div>

      {/* QR Scanner Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {scanMode ? (
          <div className="relative">
            {/* Real QR Scanner */}
            <QRScanner
              isActive={scanMode}
              onScan={handleScan}
              onError={handleScanError}
              onClose={() => {
                setScanMode(false);
                setScannedQR(null);
              }}
            />

            {/* Processing/Result Overlay */}
            {(isProcessing || studentLoading || lastScanned) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                {(isProcessing || studentLoading) && (
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Procesando...</p>
                  </div>
                )}
                {lastScanned && (
                  <div className={cn(
                    'p-4 rounded-lg flex items-center gap-2',
                    lastScanned.success ? 'bg-success text-white' : 'bg-error text-white'
                  )}>
                    {lastScanned.success ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <AlertCircle className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {lastScanned.name}
                      {lastScanned.success && ' - Check-in exitoso'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <button
              onClick={() => setScanMode(true)}
              className="w-full py-4 bg-primary text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <QrCode className="w-6 h-6" />
              Escanear Código QR
            </button>

            <div className="flex items-center gap-2 my-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-500">o</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
              onClick={() => setShowManualSelect(!showManualSelect)}
              className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <User className="w-5 h-5" />
              Check-in Manual
            </button>
          </div>
        )}
      </div>

      {/* Scan Result Toast (when not in scan mode) */}
      {!scanMode && lastScanned && (
        <div className={cn(
          'p-4 rounded-xl flex items-center gap-2',
          lastScanned.success ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
        )}>
          {lastScanned.success ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{lastScanned.name}</span>
        </div>
      )}

      {/* Manual Selection */}
      {showManualSelect && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-500">
                No hay estudiantes pendientes
              </p>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.studentId}
                  onClick={() => handleManualCheckin({
                    studentId: student.studentId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                  })}
                  disabled={isProcessing}
                  className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-gray-500">{student.grade} • {student.stopName}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-gray-300" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Students Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-warning">{validPendingStudents.length}</p>
          <p className="text-xs text-gray-500">Pendientes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-success">{checkedInStudents.length}</p>
          <p className="text-xs text-gray-500">A bordo</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-gray-400">0</p>
          <p className="text-xs text-gray-500">Ausentes</p>
        </div>
      </div>

      {/* Pending Students */}
      {validPendingStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Estudiantes pendientes</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {validPendingStudents.slice(0, 5).map((student) => (
              <div key={student.studentId} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-warning" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-gray-500">{student.grade}</p>
                </div>
                <button
                  onClick={() => handleManualCheckin({
                    studentId: student.studentId,
                    firstName: student.firstName,
                    lastName: student.lastName,
                  })}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-success text-white text-sm rounded-lg hover:bg-success/90 transition-colors disabled:opacity-50"
                >
                  Check-in
                </button>
              </div>
            ))}
          </div>

          {validPendingStudents.length > 5 && (
            <div className="p-4 text-center text-sm text-primary">
              +{validPendingStudents.length - 5} estudiantes más
            </div>
          )}
        </div>
      )}

      {/* Recently Checked In */}
      {checkedInStudents.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Check-ins recientes</h3>
          </div>

          <div className="divide-y divide-gray-100">
            {checkedInStudents.slice(0, 5).map((checkin) => (
              <div key={checkin._id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {checkin.student?.firstName} {checkin.student?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {checkin.qrScanned ? 'QR' : 'Manual'} • {checkin.stop?.name ?? 'Parada'}
                  </p>
                </div>
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(checkin.timestamp).toLocaleTimeString('es-EC', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
