# Polyline Diferenciada (Ruta Recorrida vs Restante)

## Descripción
Mostrar la ruta en el mapa con dos colores diferentes:
- **Gris**: Tramo ya recorrido (desde inicio hasta última parada completada)
- **Color activo**: Tramo restante (desde última parada completada hasta el final)

## Impacto Visual
Permite al conductor ver claramente qué parte de la ruta ya completó y cuánto falta.

## Archivos a Modificar

### 1. packages/maps/src/components/GoogleRouteMap.tsx
**Líneas relevantes**: 272-283 (renderizado de Polyline)

```tsx
// Actualmente renderiza una sola Polyline
{decodedPolyline.length > 1 && (
  <Polyline
    path={decodedPolyline}
    options={{
      strokeColor: "#042940",
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true,
    }}
  />
)}
```

**Cambio propuesto**:
```tsx
// Dividir polyline en dos segmentos basados en currentStopIndex
const completedPath = decodedPolyline.slice(0, completedStopIndex + 1);
const remainingPath = decodedPolyline.slice(completedStopIndex);

{completedPath.length > 1 && (
  <Polyline
    path={completedPath}
    options={{
      strokeColor: "#9CA3AF", // Gris
      strokeOpacity: 0.6,
      strokeWeight: 4,
      geodesic: true,
    }}
  />
)}
{remainingPath.length > 1 && (
  <Polyline
    path={remainingPath}
    options={{
      strokeColor: "#042940", // Color activo
      strokeOpacity: 0.8,
      strokeWeight: 4,
      geodesic: true,
    }}
  />
)}
```

### 2. Props necesarios
Agregar prop `completedStopIndex` o calcular internamente basado en `stops` con `status === 'completed'`.

## Consideraciones
- Si la polyline viene de Google Directions API, los puntos no coinciden 1:1 con las paradas
- Puede ser necesario encontrar el punto más cercano a la última parada completada
- Alternativa: usar el índice de parada actual (`currentStopIndex`) como punto de corte

## Prioridad
Baja - Mejora visual, no afecta funcionalidad

## Esfuerzo Estimado
2-3 horas
