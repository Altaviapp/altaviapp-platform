/**
 * useElapsedTime Hook
 *
 * Manages elapsed time tracking for active trips with HH:mm:ss formatting
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { formatElapsedTime } from '@/lib/utils/tripCalculations';

export interface UseElapsedTimeReturn {
  /** Total elapsed seconds */
  elapsedSeconds: number;
  /** Formatted time string (HH:mm:ss) */
  elapsedFormatted: string;
  /** Whether timer is currently running */
  isRunning: boolean;
  /** Start or resume the timer */
  start: () => void;
  /** Pause the timer */
  stop: () => void;
  /** Reset timer to zero */
  reset: () => void;
  /** Set elapsed time to specific value (in seconds) */
  setTime: (seconds: number) => void;
}

/**
 * Hook for tracking elapsed time with start/stop/reset controls
 *
 * @param initialSeconds - Initial elapsed time in seconds (default: 0)
 * @param autoStart - Whether to start timer automatically (default: false)
 * @returns Elapsed time state and control functions
 */
export function useElapsedTime(
  initialSeconds: number = 0,
  autoStart: boolean = false
): UseElapsedTimeReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Start or resume the timer
   */
  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  /**
   * Pause the timer
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Reset timer to zero
   */
  const reset = useCallback(() => {
    setElapsedSeconds(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Set elapsed time to specific value
   */
  const setTime = useCallback((seconds: number) => {
    setElapsedSeconds(seconds);
  }, []);

  /**
   * Effect to handle interval when running
   */
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  /**
   * Format elapsed time as HH:mm:ss
   */
  const elapsedFormatted = formatElapsedTime(elapsedSeconds);

  return {
    elapsedSeconds,
    elapsedFormatted,
    isRunning,
    start,
    stop,
    reset,
    setTime,
  };
}
