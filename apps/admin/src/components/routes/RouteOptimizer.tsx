'use client';

import { useState } from 'react';
import { Route, MapPin, Clock, ArrowRight, Loader2, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Stop {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  order: number;
  scheduledTime?: string;
}

interface OptimizationResult {
  optimizedOrder: number[];
  totalDistance: number;
  totalDuration: number;
  savings: {
    distanceReduction: number;
    durationReduction: number;
  };
}

interface RouteOptimizerProps {
  stops: Stop[];
  originAddress?: string;
  destinationAddress?: string;
  onOptimize: (newOrder: Array<{ id: string; order: number }>) => Promise<void>;
  className?: string;
}

export function RouteOptimizer({
  stops,
  originAddress = 'Colegio',
  destinationAddress = 'Colegio',
  onOptimize,
  className,
}: RouteOptimizerProps) {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState('');
  const [previewOrder, setPreviewOrder] = useState<number[] | null>(null);

  // Calculate current route stats (estimated)
  const calculateRouteStats = (stopsInOrder: Stop[]) => {
    let totalDistance = 0;
    let totalDuration = 0;

    for (let i = 0; i < stopsInOrder.length - 1; i++) {
      const stop1 = stopsInOrder[i];
      const stop2 = stopsInOrder[i + 1];
      if (stop1 && stop2) {
        // Haversine distance calculation
        const R = 6371; // Earth's radius in km
        const dLat = ((stop2.latitude - stop1.latitude) * Math.PI) / 180;
        const dLon = ((stop2.longitude - stop1.longitude) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((stop1.latitude * Math.PI) / 180) *
            Math.cos((stop2.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        totalDistance += distance;
        // Estimate 2 min per km average in city traffic
        totalDuration += distance * 2;
      }
    }

    return { totalDistance, totalDuration };
  };

  const handleOptimize = async () => {
    if (stops.length < 3) {
      setError('Se necesitan al menos 3 paradas para optimizar');
      return;
    }

    setIsOptimizing(true);
    setError('');
    setResult(null);

    try {
      // Build waypoints for Google Directions API
      const waypoints = stops
        .sort((a, b) => a.order - b.order)
        .map((stop) => ({
          location: `${stop.latitude},${stop.longitude}`,
          stopover: true,
        }));

      // Call Google Directions API with optimization
      const origin = waypoints[0]?.location ?? '';
      const destination = waypoints[waypoints.length - 1]?.location ?? '';
      const waypointsMiddle = waypoints.slice(1, -1);

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        // Simulate optimization for demo
        await simulateOptimization();
        return;
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?` +
          `origin=${origin}&` +
          `destination=${destination}&` +
          `waypoints=optimize:true|${waypointsMiddle.map((w) => w.location).join('|')}&` +
          `key=${apiKey}&` +
          `language=es`
      );

      const data = await response.json();

      if (data.status === 'OK' && data.routes[0]) {
        const route = data.routes[0];
        const optimizedOrder = route.waypoint_order as number[];

        // Calculate savings
        const currentStats = calculateRouteStats(stops.sort((a, b) => a.order - b.order));
        const totalDistance = route.legs.reduce(
          (sum: number, leg: { distance: { value: number } }) => sum + leg.distance.value,
          0
        ) / 1000;
        const totalDuration = route.legs.reduce(
          (sum: number, leg: { duration: { value: number } }) => sum + leg.duration.value,
          0
        ) / 60;

        setResult({
          optimizedOrder: [0, ...optimizedOrder.map((i: number) => i + 1), stops.length - 1],
          totalDistance,
          totalDuration,
          savings: {
            distanceReduction: Math.max(0, currentStats.totalDistance - totalDistance),
            durationReduction: Math.max(0, currentStats.totalDuration - totalDuration),
          },
        });
        setPreviewOrder([0, ...optimizedOrder.map((i: number) => i + 1), stops.length - 1]);
      } else {
        setError('No se pudo calcular la ruta óptima. ' + (data.error_message || ''));
      }
    } catch (err) {
      console.error('Optimization error:', err);
      // Fall back to simulation
      await simulateOptimization();
    }

    setIsOptimizing(false);
  };

  const simulateOptimization = async () => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simple nearest-neighbor optimization
    const sortedStops = [...stops].sort((a, b) => a.order - b.order);
    const optimized: number[] = [];
    const remaining = sortedStops.map((_, i) => i);

    let current = 0;
    optimized.push(current);
    remaining.splice(remaining.indexOf(current), 1);

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (const idx of remaining) {
        const currStop = sortedStops[current];
        const nextStop = sortedStops[idx];
        if (currStop && nextStop) {
          const dist = Math.sqrt(
            Math.pow(nextStop.latitude - currStop.latitude, 2) +
              Math.pow(nextStop.longitude - currStop.longitude, 2)
          );
          if (dist < nearestDist) {
            nearestDist = dist;
            nearestIdx = idx;
          }
        }
      }

      optimized.push(nearestIdx);
      remaining.splice(remaining.indexOf(nearestIdx), 1);
      current = nearestIdx;
    }

    const currentStats = calculateRouteStats(sortedStops);
    const optimizedStops = optimized.map((i) => sortedStops[i]).filter((s): s is Stop => s !== undefined);
    const optimizedStats = calculateRouteStats(optimizedStops);

    setResult({
      optimizedOrder: optimized,
      totalDistance: optimizedStats.totalDistance,
      totalDuration: optimizedStats.totalDuration,
      savings: {
        distanceReduction: Math.max(0, currentStats.totalDistance - optimizedStats.totalDistance),
        durationReduction: Math.max(0, currentStats.totalDuration - optimizedStats.totalDuration),
      },
    });
    setPreviewOrder(optimized);
    setIsOptimizing(false);
  };

  const handleApplyOptimization = async () => {
    if (!result || !previewOrder) return;

    setIsOptimizing(true);
    try {
      const sortedStops = [...stops].sort((a, b) => a.order - b.order);
      const newOrder = previewOrder.map((oldIndex, newIndex) => ({
        id: sortedStops[oldIndex]?.id ?? '',
        order: newIndex + 1,
      })).filter(item => item.id !== '');

      await onOptimize(newOrder);
      setResult(null);
      setPreviewOrder(null);
    } catch (err) {
      setError('Error aplicando optimización');
    }
    setIsOptimizing(false);
  };

  const sortedStops = [...stops].sort((a, b) => a.order - b.order);
  const displayStops = previewOrder
    ? previewOrder.map((i) => sortedStops[i]).filter((s): s is Stop => s !== undefined)
    : sortedStops;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Route className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">Optimizar Ruta</h3>
            <p className="text-sm text-gray-500">
              {stops.length} paradas • Reordena para minimizar distancia
            </p>
          </div>
        </div>
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || stops.length < 3}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors',
            'bg-accent text-primary hover:bg-accent/90',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizando...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Optimizar
            </>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-error/10 text-error rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Optimization Result */}
      {result && (
        <div className="p-4 bg-success/5 border-b">
          <div className="flex items-center gap-2 text-success mb-2">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium">Ruta Optimizada</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Distancia total:</span>{' '}
              <span className="font-medium">{result.totalDistance.toFixed(1)} km</span>
              {result.savings.distanceReduction > 0 && (
                <span className="text-success ml-1">
                  (-{result.savings.distanceReduction.toFixed(1)} km)
                </span>
              )}
            </div>
            <div>
              <span className="text-gray-500">Duración estimada:</span>{' '}
              <span className="font-medium">{Math.round(result.totalDuration)} min</span>
              {result.savings.durationReduction > 0 && (
                <span className="text-success ml-1">
                  (-{Math.round(result.savings.durationReduction)} min)
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleApplyOptimization}
              disabled={isOptimizing}
              className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:bg-success/90 font-medium"
            >
              Aplicar Orden Óptimo
            </button>
            <button
              onClick={() => {
                setResult(null);
                setPreviewOrder(null);
              }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Stops List */}
      <div className="p-4">
        <div className="space-y-2">
          {/* Origin */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center text-white text-sm font-bold">
              O
            </div>
            <div>
              <p className="font-medium text-gray-900">{originAddress}</p>
              <p className="text-xs text-gray-500">Punto de inicio</p>
            </div>
          </div>

          {/* Stops */}
          {displayStops.map((stop, index) => (
            <div key={stop.id} className="flex items-center gap-3">
              <div className="w-8 flex justify-center">
                <ArrowRight className="w-4 h-4 text-gray-300" />
              </div>
              <div
                className={cn(
                  'flex-1 flex items-center gap-3 p-3 rounded-lg border transition-colors',
                  previewOrder ? 'border-accent bg-accent/5' : 'border-gray-200'
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    previewOrder ? 'bg-accent text-primary' : 'bg-primary text-white'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{stop.name}</p>
                  <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                </div>
                {stop.scheduledTime && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    {stop.scheduledTime}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Destination */}
          <div className="flex items-center gap-3">
            <div className="w-8 flex justify-center">
              <ArrowRight className="w-4 h-4 text-gray-300" />
            </div>
            <div className="flex-1 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-error flex items-center justify-center text-white text-sm font-bold">
                D
              </div>
              <div>
                <p className="font-medium text-gray-900">{destinationAddress}</p>
                <p className="text-xs text-gray-500">Punto final</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
