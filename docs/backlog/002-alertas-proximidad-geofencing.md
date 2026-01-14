# Alertas de Proximidad (Geofencing Backend)

## Descripción
Implementar notificaciones push automáticas cuando el vehículo de transporte se acerca a la parada del estudiante. El sistema debe verificar periódicamente la posición del vehículo y enviar alertas según las preferencias configuradas por cada padre.

## Flujo
1. Padre configura radio de alerta (500m, 1km, 2km) en AlertPreferencesSheet ✅ (ya implementado)
2. Sistema verifica posición del vehículo vs parada del estudiante cada 30 segundos
3. Si distancia < radio configurado → enviar push notification
4. Marcar alerta como enviada para evitar duplicados

## Archivos a Crear

### 1. convex/alerts.ts
Scheduled function para verificar proximidad:

```typescript
import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

/**
 * Ejecutar cada 30 segundos durante viajes activos
 */
export const checkProximityAlerts = internalAction({
  handler: async (ctx) => {
    // 1. Obtener todos los viajes activos
    const activeTrips = await ctx.runQuery(internal.trips.getAllActiveTrips);

    for (const trip of activeTrips) {
      // 2. Obtener posición actual del vehículo
      const vehiclePosition = await ctx.runQuery(
        internal.gpsTracking.getLatestPosition,
        { tripId: trip._id }
      );

      if (!vehiclePosition) continue;

      // 3. Para cada estudiante en el viaje
      for (const studentId of trip.studentIds) {
        // 4. Obtener preferencias de alerta del padre
        const preferences = await ctx.runQuery(
          internal.userPreferences.getPreferencesForStudent,
          { studentId }
        );

        if (!preferences?.alertsEnabled) continue;

        // 5. Calcular distancia a parada del estudiante
        const studentStop = await ctx.runQuery(
          internal.students.getStudentStop,
          { studentId, tripId: trip._id }
        );

        const distance = calculateDistance(
          vehiclePosition.latitude,
          vehiclePosition.longitude,
          studentStop.lat,
          studentStop.lng
        );

        // 6. Si distancia < alertRadius y no se ha enviado alerta
        if (
          distance <= preferences.alertRadius &&
          preferences.lastAlertTripId !== trip._id
        ) {
          // 7. Enviar push notification
          await sendPushNotification(preferences.pushToken, {
            title: "¡El transporte está cerca!",
            body: `El vehículo está a ${Math.round(distance)}m de la parada`,
          });

          // 8. Marcar alerta como enviada
          await ctx.runMutation(internal.userPreferences.markAlertSent, {
            userId: preferences.userId,
            studentId,
            tripId: trip._id,
          });
        }
      }
    }
  },
});

// Haversine formula para calcular distancia en metros
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
```

### 2. convex/crons.ts (o agregar a existente)
Programar ejecución periódica:

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Verificar alertas de proximidad cada 30 segundos
crons.interval(
  "check-proximity-alerts",
  { seconds: 30 },
  internal.alerts.checkProximityAlerts
);

export default crons;
```

## Dependencias Externas

### Push Notifications
Opciones a evaluar:
- **Expo Push Notifications** - Si la app usa Expo
- **Firebase Cloud Messaging (FCM)** - Estándar para web/Android
- **Web Push API** - Para PWA sin dependencias externas

### Implementación sugerida: Web Push API
```typescript
// convex/pushNotifications.ts
import webpush from "web-push";

export async function sendPushNotification(
  pushToken: string,
  payload: { title: string; body: string }
) {
  if (!pushToken) return;

  await webpush.sendNotification(
    JSON.parse(pushToken),
    JSON.stringify(payload),
    {
      vapidDetails: {
        subject: "mailto:soporte@altaviapp.com",
        publicKey: process.env.VAPID_PUBLIC_KEY!,
        privateKey: process.env.VAPID_PRIVATE_KEY!,
      },
    }
  );
}
```

## Archivos a Modificar

### 1. convex/userPreferences.ts ✅ (ya tiene markAlertSent)
Ya implementado con lastAlertTripId y lastAlertSentAt.

### 2. apps/parent/src/hooks/usePushNotifications.ts (nuevo)
Hook para solicitar permisos y registrar token:

```typescript
export function usePushNotifications(studentId: Id<"students">) {
  const updatePushToken = useMutation(api.userPreferences.updatePushToken);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: VAPID_PUBLIC_KEY,
    });

    await updatePushToken({
      userId,
      studentId,
      pushToken: JSON.stringify(subscription),
    });
  };

  return { requestPermission };
}
```

### 3. apps/parent/public/sw.js (Service Worker)
```javascript
self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
  });
});
```

## Consideraciones

1. **Rate limiting**: No enviar más de 1 alerta por viaje/estudiante
2. **Horarios**: Solo enviar durante horarios de viaje activo
3. **Batería**: El cron cada 30s es aceptable para un backend serverless
4. **Fallback**: Si push falla, crear notificación in-app
5. **Testing**: Agregar modo de prueba para simular proximidad

## Prerequisitos
- [x] Tabla userPreferences con alertRadius, alertsEnabled
- [x] Mutation markAlertSent para evitar duplicados
- [x] UI de configuración (AlertPreferencesSheet)
- [ ] Servicio de push notifications (FCM/Web Push)
- [ ] Service Worker en parent app
- [ ] VAPID keys configuradas

## Prioridad
Media - Funcionalidad de valor agregado para padres

## Esfuerzo Estimado
8-12 horas (incluye integración push notifications)

## Estado
Pendiente - Requiere decisión sobre servicio de push notifications
