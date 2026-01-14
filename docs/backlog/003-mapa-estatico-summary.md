# Mapa Estático en Página de Resumen

## Descripción
Mostrar un mapa estático (imagen) en la página de resumen del viaje que muestre:
- La ruta completa recorrida
- Marcadores de paradas (con indicador de completadas/omitidas)
- Marcador del colegio
- Opcionalmente: puntos GPS registrados durante el viaje

## Impacto
Permite ver de un vistazo el recorrido realizado sin necesidad de cargar un mapa interactivo.

## Archivos a Modificar

### 1. apps/crew/src/app/(dashboard)/trips/[id]/summary/page.tsx
**Ubicación sugerida**: Después del card de estadísticas, antes del timeline

```tsx
// Agregar sección de mapa estático
{stops && stops.length > 0 && (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <MapPin className="w-5 h-5 text-gray-600" />
      Recorrido
    </h3>
    <StaticRouteMap
      stops={stops}
      schoolPosition={trip.schoolPosition}
      className="w-full h-48 rounded-lg"
    />
  </div>
)}
```

### 2. Crear componente StaticRouteMap
**Nuevo archivo**: `packages/maps/src/components/StaticRouteMap.tsx`

#### Opción A: Google Static Maps API
```tsx
interface StaticRouteMapProps {
  stops: Array<{ lat: number; lng: number; status: string }>;
  schoolPosition?: { lat: number; lng: number };
  polyline?: string; // Encoded polyline
  className?: string;
}

export function StaticRouteMap({ stops, schoolPosition, polyline, className }: StaticRouteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Build markers string
  const markers = stops.map((stop, i) => {
    const color = stop.status === 'arrived' ? 'green' : stop.status === 'skipped' ? 'orange' : 'gray';
    return `markers=color:${color}|label:${i + 1}|${stop.lat},${stop.lng}`;
  }).join('&');

  // School marker
  const schoolMarker = schoolPosition
    ? `&markers=icon:https://...school-icon.png|${schoolPosition.lat},${schoolPosition.lng}`
    : '';

  // Polyline path
  const pathParam = polyline
    ? `&path=enc:${polyline}`
    : '';

  const url = `https://maps.googleapis.com/maps/api/staticmap?size=600x300&${markers}${schoolMarker}${pathParam}&key=${apiKey}`;

  return (
    <img
      src={url}
      alt="Mapa del recorrido"
      className={className}
    />
  );
}
```

#### Opción B: Leaflet estático (sin JS)
Usar una biblioteca como `react-leaflet-static` o generar SVG server-side.

#### Opción C: Captura del mapa interactivo
Usar `html2canvas` o similar para capturar el GoogleRouteMap como imagen.

### 3. Datos necesarios del backend
**Archivo**: `convex/trips.ts` - query `getTripSummary`

Agregar al return:
```typescript
return {
  // ... existing fields
  routePolyline: route?.optimizedPolyline, // Encoded polyline de la ruta
  schoolPosition: institution ? {
    lat: institution.latitude,
    lng: institution.longitude,
  } : null,
};
```

### 4. Exportar componente
**Archivo**: `packages/maps/src/index.ts`
```typescript
export { StaticRouteMap } from './components/StaticRouteMap';
```

## Consideraciones
- Google Static Maps API tiene límites de uso gratuito
- El tamaño máximo de imagen es 640x640 (sin cuenta premium)
- Las URLs muy largas pueden causar problemas (máx ~8192 caracteres)
- Alternativa: usar thumbnail del mapa interactivo

## Prioridad
Media - Mejora visual significativa para el resumen

## Esfuerzo Estimado
2-3 horas
