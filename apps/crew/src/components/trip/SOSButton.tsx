"use client";

/**
 * SOSButton Component
 *
 * Emergency FAB button with long-press activation (3 seconds).
 * Features:
 * - Visual countdown during long press
 * - Haptic feedback (vibration)
 * - Confirmation before sending
 * - Automatic GPS capture
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { AlertTriangle, Phone, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SOSButtonProps {
  /** Handler when SOS is triggered */
  onTrigger: (message?: string) => Promise<{ success: boolean; notifiedAdmins: number }>;
  /** Handler to open emergency contacts sheet */
  onOpenContacts?: () => void;
  /** Custom class name */
  className?: string;
  /** Disable the button */
  disabled?: boolean;
}

const LONG_PRESS_DURATION = 3000; // 3 seconds
const UPDATE_INTERVAL = 50; // Update progress every 50ms

export function SOSButton({
  onTrigger,
  onOpenContacts,
  className,
  disabled = false,
}: SOSButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isTriggering, setIsTriggering] = useState(false);
  const [isTriggered, setIsTriggered] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const pressStartRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasVibrated = useRef(false);

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, []);

  const startPress = useCallback(() => {
    if (disabled || isTriggering || isTriggered) return;

    setIsPressed(true);
    setProgress(0);
    pressStartRef.current = Date.now();
    hasVibrated.current = false;

    // Short vibration to indicate press started
    vibrate(50);

    // Update progress
    intervalRef.current = setInterval(() => {
      if (pressStartRef.current === null) return;

      const elapsed = Date.now() - pressStartRef.current;
      const newProgress = Math.min((elapsed / LONG_PRESS_DURATION) * 100, 100);
      setProgress(newProgress);

      // Vibration feedback at milestones
      if (newProgress >= 50 && !hasVibrated.current) {
        vibrate([100, 50, 100]);
        hasVibrated.current = true;
      }

      // Trigger when reached 100%
      if (newProgress >= 100) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        setShowConfirmation(true);
        vibrate([200, 100, 200, 100, 200]); // Strong vibration pattern
      }
    }, UPDATE_INTERVAL);
  }, [disabled, isTriggering, isTriggered, vibrate]);

  const endPress = useCallback(() => {
    setIsPressed(false);
    setProgress(0);
    pressStartRef.current = null;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const handleConfirmSOS = useCallback(async () => {
    setShowConfirmation(false);
    setIsTriggering(true);

    try {
      const result = await onTrigger();
      if (result.success) {
        setIsTriggered(true);
        vibrate([500]); // Long vibration for confirmation

        // Reset after 5 seconds
        setTimeout(() => {
          setIsTriggered(false);
        }, 5000);
      }
    } catch (error) {
      console.error("Error triggering SOS:", error);
      vibrate([100, 100, 100]); // Error vibration
    } finally {
      setIsTriggering(false);
    }
  }, [onTrigger, vibrate]);

  const handleCancelConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setProgress(0);
    vibrate(50);
  }, [vibrate]);

  // Confirmation dialog
  if (showConfirmation) {
    return (
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center bg-black/70", className)}>
        <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">¿Confirmar SOS?</h3>
              <p className="text-sm text-gray-500">Se notificará a todos los coordinadores</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Esta acción enviará una alerta de emergencia con tu ubicación actual a todos los administradores de la institución.
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleCancelConfirmation}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSOS}
              className="flex-1 py-3 px-4 bg-error text-white font-bold rounded-xl hover:bg-error/90 transition-colors flex items-center justify-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Enviar SOS
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main FAB button
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {/* Emergency contacts quick access */}
      {onOpenContacts && (
        <button
          onClick={onOpenContacts}
          className="w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Contactos de emergencia"
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* SOS Button */}
      <button
        onMouseDown={startPress}
        onMouseUp={endPress}
        onMouseLeave={endPress}
        onTouchStart={startPress}
        onTouchEnd={endPress}
        onTouchCancel={endPress}
        disabled={disabled || isTriggering || isTriggered}
        className={cn(
          "relative w-16 h-16 rounded-full shadow-lg transition-all duration-200 flex items-center justify-center overflow-hidden",
          isTriggered
            ? "bg-success"
            : isPressed
            ? "bg-error scale-110"
            : "bg-error/90 hover:bg-error",
          (disabled || isTriggering) && "opacity-50 cursor-not-allowed"
        )}
        aria-label="Botón SOS - Mantener presionado 3 segundos"
      >
        {/* Progress ring */}
        {isPressed && !isTriggered && (
          <svg
            className="absolute inset-0 w-full h-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.89} 289`}
              className="transition-all duration-100"
            />
          </svg>
        )}

        {/* Icon */}
        {isTriggering ? (
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        ) : isTriggered ? (
          <CheckCircle className="w-7 h-7 text-white" />
        ) : (
          <AlertTriangle className="w-7 h-7 text-white" />
        )}

        {/* Pulse animation when not pressed */}
        {!isPressed && !isTriggered && !isTriggering && (
          <span className="absolute inset-0 rounded-full bg-error animate-ping opacity-25" />
        )}
      </button>

      {/* Label */}
      <span
        className={cn(
          "text-xs font-medium text-center transition-colors",
          isPressed ? "text-error" : isTriggered ? "text-success" : "text-gray-500"
        )}
      >
        {isTriggered ? "SOS Enviado" : isPressed ? `${Math.ceil((100 - progress) / 33.3)}s` : "SOS"}
      </span>
    </div>
  );
}
