'use client';

/**
 * QRScanner Component
 *
 * Real-time QR code scanner using html5-qrcode library.
 * Used for student check-in/check-out operations.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { Camera, CameraOff, Flashlight, X, AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QRScanResult {
  /** Raw QR code content */
  rawValue: string;
  /** Parsed student data if valid Altaviapp QR */
  studentData?: {
    studentId: string;
    institutionId: string;
    timestamp: number;
    version: number;
  };
  /** Whether parsing was successful */
  isValid: boolean;
}

interface QRScannerProps {
  /** Called when a QR code is successfully scanned */
  onScan: (result: QRScanResult) => void;
  /** Called when scanner encounters an error */
  onError?: (error: string) => void;
  /** Whether scanner is active */
  isActive: boolean;
  /** Called when scanner is closed */
  onClose: () => void;
  /** Custom className */
  className?: string;
}

const SCANNER_CONFIG = {
  fps: 10,
  qrbox: { width: 250, height: 250 },
  aspectRatio: 1.0,
  disableFlip: false,
};

/**
 * Parse Altaviapp QR code data
 */
function parseQRData(rawValue: string): QRScanResult {
  try {
    const data = JSON.parse(rawValue);

    // Validate expected structure
    if (
      typeof data.studentId === 'string' &&
      typeof data.institutionId === 'string' &&
      typeof data.timestamp === 'number' &&
      typeof data.version === 'number'
    ) {
      return {
        rawValue,
        studentData: data,
        isValid: true,
      };
    }

    return { rawValue, isValid: false };
  } catch {
    return { rawValue, isValid: false };
  }
}

export function QRScanner({
  onScan,
  onError,
  isActive,
  onClose,
  className,
}: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [hasFlash, setHasFlash] = useState(false);
  const lastScannedRef = useRef<string>('');
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce scans to prevent duplicate reads
  const handleScanSuccess = useCallback((decodedText: string) => {
    // Prevent duplicate scans within 2 seconds
    if (lastScannedRef.current === decodedText) {
      return;
    }

    lastScannedRef.current = decodedText;

    // Clear previous timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    // Reset after 2 seconds to allow re-scanning same code
    scanTimeoutRef.current = setTimeout(() => {
      lastScannedRef.current = '';
    }, 2000);

    const result = parseQRData(decodedText);
    onScan(result);
  }, [onScan]);

  // Initialize scanner
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }

    const containerId = 'qr-scanner-container';

    // Ensure container has the ID
    containerRef.current.id = containerId;

    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        setError(null);

        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();

        if (cameras.length === 0) {
          throw new Error('No se encontraron cámaras disponibles');
        }

        // Prefer back camera
        const backCamera = cameras.find(
          (camera) => camera.label.toLowerCase().includes('back') ||
                      camera.label.toLowerCase().includes('trasera') ||
                      camera.label.toLowerCase().includes('rear')
        );

        const cameraId = backCamera?.id || cameras[0]?.id;

        if (!cameraId) {
          throw new Error('No se pudo acceder a la cámara');
        }

        await html5QrCode.start(
          cameraId,
          SCANNER_CONFIG,
          handleScanSuccess,
          () => {} // Ignore scan failures (no QR visible)
        );

        setIsScanning(true);

        // Check flash capability
        try {
          const capabilities = html5QrCode.getRunningTrackCameraCapabilities();
          setHasFlash(capabilities.torchFeature().isSupported());
        } catch {
          setHasFlash(false);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al iniciar el escáner';
        setError(message);
        onError?.(message);
        setIsScanning(false);
      }
    };

    startScanner();

    // Cleanup
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }

      if (scannerRef.current) {
        const scanner = scannerRef.current;

        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          scanner.stop().catch(console.error);
        }

        scannerRef.current = null;
      }

      setIsScanning(false);
      setFlashEnabled(false);
      lastScannedRef.current = '';
    };
  }, [isActive, handleScanSuccess, onError]);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (!scannerRef.current || !hasFlash) return;

    try {
      const capabilities = scannerRef.current.getRunningTrackCameraCapabilities();
      const newState = !flashEnabled;

      if (newState) {
        await capabilities.torchFeature().apply(true);
      } else {
        await capabilities.torchFeature().apply(false);
      }

      setFlashEnabled(newState);
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  }, [flashEnabled, hasFlash]);

  // Retry scanner
  const handleRetry = useCallback(() => {
    setError(null);
    // Force re-mount by toggling active state
    if (containerRef.current) {
      const event = new CustomEvent('retry-scanner');
      containerRef.current.dispatchEvent(event);
    }
  }, []);

  if (!isActive) {
    return null;
  }

  return (
    <div className={cn('relative bg-gray-900 rounded-xl overflow-hidden', className)}>
      {/* Scanner Container */}
      <div
        ref={containerRef}
        className="w-full h-64 relative"
      />

      {/* Scan Frame Overlay */}
      {isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-48 h-48 border-2 border-white/30 rounded-lg relative">
            {/* Corner Accents */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-accent rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-accent rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-accent rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-accent rounded-br-lg" />

            {/* Animated Scan Line */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-accent/70 animate-pulse" />
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white">
            <Camera className="w-12 h-12 mx-auto mb-2 animate-pulse" />
            <p className="text-sm">Iniciando cámara...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center text-white p-4">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-error" />
            <p className="text-sm mb-4">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-t from-black/50 to-transparent">
        {/* Flash Toggle */}
        <button
          onClick={toggleFlash}
          disabled={!hasFlash || !isScanning}
          className={cn(
            'p-3 rounded-full transition-colors',
            flashEnabled ? 'bg-warning text-white' : 'bg-white/20 text-white',
            (!hasFlash || !isScanning) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Flashlight className="w-5 h-5" />
        </button>

        {/* Status Text */}
        <p className="text-white/80 text-sm">
          {isScanning ? 'Escanear código QR' : 'Preparando...'}
        </p>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default QRScanner;
