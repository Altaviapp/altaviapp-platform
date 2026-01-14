# Animación Suave del Marcador de Vehículo

## Descripción
Interpolar la posición del marcador del vehículo entre actualizaciones GPS para crear un movimiento más fluido en lugar de "saltos" cada 15 segundos.

## Problema Actual
El marcador del vehículo se actualiza cada 15 segundos (intervalo de GPS tracking), lo que causa que "salte" de una posición a otra abruptamente.

## Solución Propuesta
Usar interpolación lineal (lerp) o CSS transitions para animar el marcador entre posiciones.

## Archivos a Modificar

### 1. packages/maps/src/components/GoogleRouteMap.tsx
**Líneas relevantes**: 343-352 (renderizado del marcador de vehículo)

```tsx
// Actualmente renderiza directamente la posición
{showVehicle && vehiclePosition?.position && (
  <Marker
    position={vehiclePosition.position}
    icon={vehicleIcon}
    ...
  />
)}
```

### 2. Opciones de Implementación

#### Opción A: CSS Transitions (más simple)
No es directamente soportado por Google Maps Markers, pero se puede usar AdvancedMarkerElement con HTML custom.

#### Opción B: Interpolación con requestAnimationFrame
```tsx
// Nuevo hook: useAnimatedPosition
function useAnimatedPosition(targetPosition: LatLng | null, duration = 1000) {
  const [currentPosition, setCurrentPosition] = useState(targetPosition);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();
  const startPositionRef = useRef<LatLng | null>(null);

  useEffect(() => {
    if (!targetPosition) return;
    if (!currentPosition) {
      setCurrentPosition(targetPosition);
      return;
    }

    startPositionRef.current = currentPosition;
    startTimeRef.current = performance.now();

    const animate = (time: number) => {
      const elapsed = time - (startTimeRef.current || 0);
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out interpolation
      const eased = 1 - Math.pow(1 - progress, 3);

      const lat = lerp(startPositionRef.current!.lat, targetPosition.lat, eased);
      const lng = lerp(startPositionRef.current!.lng, targetPosition.lng, eased);

      setCurrentPosition({ lat, lng });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetPosition]);

  return currentPosition;
}

function lerp(start: number, end: number, t: number) {
  return start + (end - start) * t;
}
```

#### Opción C: Usar biblioteca de animación
- `@react-google-maps/marker-with-label` con transiciones
- Overlay custom con Framer Motion

### 3. Integración en GoogleRouteMap
```tsx
// Usar el hook
const animatedPosition = useAnimatedPosition(vehiclePosition?.position ?? null);

// Renderizar con posición animada
{showVehicle && animatedPosition && (
  <Marker
    position={animatedPosition}
    ...
  />
)}
```

## Consideraciones
- La interpolación debe manejar casos donde el vehículo se mueve muy rápido
- No animar si la distancia es mayor a cierto umbral (indica un "salto" de GPS)
- Considerar la rotación del heading también

## Prioridad
Baja - Mejora de UX visual

## Esfuerzo Estimado
3-4 horas
