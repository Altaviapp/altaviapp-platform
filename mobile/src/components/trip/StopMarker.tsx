/**
 * StopMarker Component
 *
 * Custom marker for route stops with different states
 */

'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { Stop } from '@/types';

export interface StopMarkerProps {
  /** Stop data */
  stop: Stop;
  /** Stop status */
  status: 'completed' | 'current' | 'upcoming';
  /** Stop number in sequence */
  stopNumber: number;
}

/**
 * Create custom icon for stop marker based on status
 */
function createStopIcon(status: StopMarkerProps['status'], stopNumber: number) {
  const colors = {
    completed: '#10b981', // success green
    current: '#042940', // primary blue
    upcoming: '#9ca3af', // gray
  };

  const color = colors[status];

  const svgIcon = `
    <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
      <g filter="url(#shadow)">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 12 16 26 16 26s16-14 16-26c0-8.837-7.163-16-16-16z"
          fill="${color}"
        />
        <circle cx="16" cy="16" r="12" fill="white"/>
        <text
          x="16"
          y="21"
          text-anchor="middle"
          font-size="12"
          font-weight="bold"
          fill="${color}"
        >${stopNumber}</text>
      </g>
      <defs>
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
        </filter>
      </defs>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-stop-marker',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
}

/**
 * Stop marker for route map
 */
export function StopMarker({ stop, status, stopNumber }: StopMarkerProps) {
  const icon = createStopIcon(status, stopNumber);

  return (
    <Marker
      position={[stop.latitude, stop.longitude]}
      icon={icon}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{
                backgroundColor: status === 'completed' ? '#10b981' : status === 'current' ? '#042940' : '#9ca3af'
              }}
            >
              {stopNumber}
            </div>
            <span className="text-xs font-semibold text-gray-700 uppercase">
              {status === 'completed' ? 'Completada' : status === 'current' ? 'Actual' : 'Próxima'}
            </span>
          </div>

          <h4 className="font-bold text-gray-900 mb-1">{stop.name}</h4>
          <p className="text-sm text-gray-600 mb-2">{stop.address}</p>

          {stop.students && stop.students.length > 0 && (
            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
              {stop.students.length} estudiante{stop.students.length !== 1 ? 's' : ''}
            </div>
          )}

          {stop.estimatedArrivalTime && (
            <div className="text-xs text-gray-600">
              Hora estimada: {stop.estimatedArrivalTime}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}
