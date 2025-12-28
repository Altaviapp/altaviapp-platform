# Crew App - Product Requirements Document

**App**: Crew App (Driver + Monitor)
**Location**: `apps/crew/`
**URL**: `crew.altaviapp.com`
**Version**: 1.0
**Status**: ✅ Implementado

---

## Overview

La Crew App es la aplicación móvil PWA para conductores y monitores/auxiliares. Permite operar viajes, realizar check-ins de estudiantes, reportar incidentes y gestionar novedades durante las rutas de transporte escolar.

### Usuarios

| Rol | Nombre UI | Permisos |
|-----|-----------|----------|
| **driver** | Conductor | Checklist, iniciar/terminar viaje, GPS, check-in (fallback) |
| **monitor** | Auxiliar | Check-in QR, reportar incidentes, ver novedades |

### Diferencias por Rol

| Funcionalidad | Conductor | Monitor |
|---------------|:---------:|:-------:|
| Login y ver rutas asignadas | ✅ | ✅ |
| Checklist pre-viaje | ✅ | ❌ |
| Iniciar/terminar viaje | ✅ | ❌ |
| GPS tracking (enviar) | ✅ | ❌ |
| Ver progreso del viaje | ✅ | ✅ |
| Check-in/out estudiantes (QR) | Solo fallback* | ✅ |
| Reportar incidentes | ❌ | ✅ |
| Ver notificaciones de padres | ❌ | ✅ |

*Conductor puede hacer check-in solo si no hay monitor asignado.

### Tech Stack

- Next.js 14+ PWA (instalable)
- Convex (real-time database)
- shadcn/ui + Tailwind CSS
- Leaflet + OpenStreetMap (mapas)
- Geolocation API (GPS)
- Camera API (QR scanner)

---

## Módulos

### 1. Dashboard (Inicio)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/dashboard` | ✅ | Pantalla principal con rutas del día |

**Funcionalidades**:
- [x] Saludo personalizado con nombre y rol
- [x] Resumen del día:
  - Viajes completados
  - Viajes programados
  - Estudiantes transportados
- [x] Lista de rutas de hoy para inicio rápido
- [x] Tarjetas de novedades del día
- [x] Estadísticas semanales
- [x] Notificaciones recientes

**Componentes clave**:
- `RouteCard` - Tarjeta de ruta disponible (lazy trip creation)
- `NovedadesCard` - Eventos especiales del día
- `WeeklyStats` - Resumen semanal (viajes, estudiantes, duración)
- `NotificationList` - Notificaciones recientes
- `VehicleCard` - Información del vehículo asignado

**Hooks**:
- `useMyRoutes()` - Rutas asignadas al usuario
- `useNovedadesForDriverToday()` - Novedades del día
- `useMyTrips()` - Viajes del usuario

---

### 2. Routes (Rutas)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/routes` | ✅ | Lista de rutas asignadas con filtros |
| `/routes/[id]` | ✅ | Detalle de ruta con paradas y estudiantes |
| `/routes/[id]/start` | ✅ | Confirmación de inicio (redirige a viaje) |

**Funcionalidades**:

*Lista de rutas*:
- [x] Tabs de filtro: Todas / Recogida / Entrega
- [x] Tarjetas de ruta con:
  - Nombre de ruta
  - Tipo (pickup/dropoff) con badge
  - Horario programado
  - Número de paradas
  - Número de estudiantes
  - Vehículo asignado
- [x] Estado de ruta (activa hoy según recurrencia)

*Detalle de ruta*:
- [x] Info completa: nombre, tipo, horario
- [x] Vehículo y conductor asignados
- [x] Lista de paradas con:
  - Número de orden
  - Dirección
  - Hora estimada (ETA)
  - Estudiantes en cada parada
- [x] Mapa con polilínea de ruta
- [x] Botón de iniciar viaje

*Validación de recurrencia*:
- [x] Diaria: verifica día de la semana
- [x] Semanal: verifica día específico
- [x] Mensual: verifica día del mes
- [x] Única: verifica fecha específica

**Componentes clave**:
- `RouteCard` - Tarjeta de ruta
- `RouteDetail` - Vista de detalle
- `StopsList` - Lista de paradas
- `RouteMap` - Mapa de ruta

**Hooks**:
- `useMyRoutes()` - Rutas asignadas
- `useRoute()` - Ruta individual con paradas
- `useRoutesForDriverToday()` - Rutas válidas para hoy

---

### 3. Calendar (Calendario)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/calendar` | ✅ | Vista mensual de viajes |

**Funcionalidades**:
- [x] Grid de calendario mensual
- [x] Indicadores de viajes por día
- [x] Colores por estado de viaje:
  - Azul: en ruta
  - Verde: completado
  - Amarillo: programado
  - Rojo: cancelado
- [x] Navegación rápida para iniciar/ver viajes
- [x] Filtro por período

**Componentes clave**:
- `CalendarGrid` - Grid mensual
- `DayCell` - Celda de día con indicadores
- `TripIndicator` - Indicador de viaje

**Hooks**:
- `useTripsForCrewByMonth()` - Viajes del mes

---

### 4. Trips (Viajes)
**Estado**: ✅ Implementado

Este es el módulo más complejo, con múltiples sub-rutas para el flujo completo del viaje.

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/trips/[id]` | ✅ | Resumen/detalle del viaje |
| `/trips/[id]/start` | ✅ | Confirmación de inicio con estado de checklist |
| `/trips/[id]/checklist` | ✅ | Checklist pre-viaje de inspección |
| `/trips/[id]/active` | ✅ | Viaje activo (mapa, estudiantes, navegación) |
| `/trips/[id]/students` | ✅ | Lista de estudiantes con check-in |
| `/trips/[id]/incidents` | ✅ | Formulario de reporte de incidente |
| `/trips/[id]/map` | ✅ | Mapa a pantalla completa |

**Funcionalidades**:

#### 4.1 Detalle de Viaje (`/trips/[id]`)
- [x] Estado del viaje (programado, en ruta, completado, cancelado)
- [x] Info de ruta: nombre, tipo, horario
- [x] Info de vehículo y conductor
- [x] Lista de estudiantes con estado
- [x] Resumen de paradas

#### 4.2 Inicio de Viaje (`/trips/[id]/start`)
- [x] Confirmación antes de iniciar
- [x] Verificación de checklist completado
- [x] Botón de iniciar viaje
- [x] Lazy trip creation (viaje creado al iniciar)

#### 4.3 Checklist Pre-viaje (`/trips/[id]/checklist`)
*Solo para conductores*

**Categorías de inspección**:
- [x] Mecánico: frenos, dirección, llantas, motor
- [x] Luces: delanteras, traseras, intermitentes, emergencia
- [x] Seguridad: cinturones, extintor, botiquín, salidas emergencia
- [x] Limpieza: interior, asientos, ventanas, pisos

**Funcionalidades**:
- [x] Expansión por categoría
- [x] Checkbox para cada ítem
- [x] Marcar ítem como "con problema"
- [x] Barra de progreso de completitud
- [x] Upload de fotos del vehículo
- [x] Resumen antes de continuar
- [x] Diálogo si hay problemas encontrados

#### 4.4 Viaje Activo (`/trips/[id]/active`)
**Funcionalidades principales**:

*Mapa interactivo*:
- [x] Ubicación actual del vehículo con heading
- [x] Polilínea de ruta
- [x] Marcadores de paradas (completadas, actual, próximas)
- [x] Marcador de escuela
- [x] GPS tracking en background (cada 15 segundos)

*Panel de información*:
- [x] Progreso de paradas (X de Y completadas)
- [x] Tiempo transcurrido
- [x] Velocidad actual
- [x] Próxima parada con ETA

*Tarjeta de próxima parada*:
- [x] Nombre de la parada
- [x] Distancia en metros/km
- [x] ETA en minutos
- [x] Link a navegación externa (Google Maps)

*Acciones rápidas*:
- [x] Check-in de estudiantes
- [x] Ver lista de estudiantes
- [x] Reportar incidente
- [x] Terminar viaje

*ETA en tiempo real*:
- [x] Cálculo basado en distancia Haversine
- [x] Tracking de velocidad
- [x] Estado de delay (a tiempo, ligero retraso, retrasado, muy retrasado)

#### 4.5 Estudiantes (`/trips/[id]/students`)
**Funcionalidades**:
- [x] Lista agrupada por parada
- [x] Estados de check-in:
  - Pendiente (gris)
  - A bordo (azul)
  - Entregado (verde)
- [x] Panel de novedades por estudiante:
  - Ausencia
  - Recoge padre
  - Cambio de parada
  - Salida temprana
  - Llegada tarde
- [x] Modal de detalle de estudiante
- [x] Botón de reconocer novedad
- [x] Búsqueda/filtro de estudiantes

*Check-in*:
- [x] QR scanner para escanear código
- [x] Check-in manual (si QR falla)
- [x] Validación: ruta correcta, parada correcta, viaje activo
- [x] Registro de timestamp y GPS
- [x] Notificación automática a padres

#### 4.6 Incidentes (`/trips/[id]/incidents`)
**Tipos de incidente**:
- Accidente
- Médico
- Problema con estudiante
- Problema de ruta
- Retraso
- Otro

**Niveles de severidad**:
- Crítico (rojo)
- Alto (naranja)
- Medio (amarillo)
- Bajo (verde)

**Funcionalidades**:
- [x] Selección de tipo con iconos
- [x] Selección de severidad
- [x] Captura de ubicación GPS
- [x] Selección de estudiante afectado (opcional)
- [x] Campo de descripción
- [x] Upload de fotos (placeholder)
- [x] Opciones de notificación (admin/padres)
- [x] Confirmación con ID de incidente

#### 4.7 Mapa Completo (`/trips/[id]/map`)
- [x] Mapa a pantalla completa
- [x] Overlay de próxima parada
- [x] Controles de zoom
- [x] Botón de centrar en vehículo
- [x] Link de navegación externa

**Componentes clave**:
- `RouteMap` - Mapa interactivo (Leaflet)
- `NextStopCard` - Tarjeta de próxima parada
- `GPSStatus` - Indicador de estado GPS
- `MapControls` - Controles del mapa
- `QuickActions` - Acciones rápidas flotantes
- `RelayModeModal` - Modal de cambio de vehículo
- `ActiveTripFAB` - Botón flotante de viaje activo
- `StopMarker` - Marcador de parada
- `ChecklistCategory` - Categoría de checklist
- `ChecklistItem` - Ítem de checklist
- `ChecklistProgress` - Barra de progreso
- `QRScanner` - Escáner de código QR

**Hooks**:
- `useTrip()` - Viaje individual
- `useTripStudents()` - Estudiantes del viaje
- `useActiveTrip()` - Viaje activo actual
- `useGPSTracking()` - Tracking GPS
- `useCheckIn()` - Mutación de check-in

---

### 5. Profile (Perfil)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/profile` | ✅ | Perfil con 3 tabs (Perfil, Historial, Configuración) |
| `/profile/edit` | ✅ | Editar perfil (formulario específico por rol) |

**Funcionalidades**:

#### Tab 1 - Perfil
*Info común*:
- [x] Foto/avatar
- [x] Nombre completo
- [x] Email
- [x] Teléfono
- [x] Rol (Conductor/Auxiliar)

*Info de conductor*:
- [x] Número de licencia
- [x] Tipo de licencia (C/D/E)
- [x] Fecha de vencimiento
- [x] Años de experiencia

*Info de monitor*:
- [x] Documento de identidad
- [x] Certificación primeros auxilios
- [x] Certificación cuidado infantil

*Estadísticas*:
- [x] Viajes completados
- [x] Estudiantes transportados
- [x] Días trabajados
- [x] Rating (si aplica)

#### Tab 2 - Historial
- [x] Lista de viajes pasados
- [x] Filtros: 7 días, 30 días, 90 días
- [x] Info por viaje:
  - Fecha
  - Ruta
  - Tipo
  - Duración
  - Estudiantes
  - Estado final

#### Tab 3 - Configuración
*Notificaciones*:
- [x] Toggle de notificaciones push
- [x] Toggle de vibración
- [x] Toggle de sonido

*Mapas*:
- [x] Tipo de vista (satélite, calles, terreno)
- [x] Auto-centrar
- [x] Mostrar tráfico

*Seguridad*:
- [x] Cambiar contraseña
- [x] Cerrar sesión en todos los dispositivos

*App*:
- [x] Versión de la app
- [x] Última actualización
- [x] Ayuda y soporte
- [x] Cerrar sesión

**Componentes clave**:
- `GlobalProfileSection` - Info común
- `DriverProfileSection` - Info específica de conductor
- `MonitorProfileSection` - Info específica de monitor
- `TripHistoryList` - Lista de historial
- `SettingsToggles` - Toggles de configuración

**Hooks**:
- `useProfile()` - Perfil del usuario
- `useDriverTripHistory()` - Historial de viajes

---

## Authentication (Autenticación)
**Estado**: ✅ Implementado

**Rutas públicas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Inicio de sesión |
| `/signup-invitation` | ✅ | Registro por invitación |
| `/verify-email` | ✅ | Verificación de email |
| `/forgot-password` | ✅ | Solicitud de reset |
| `/reset-password` | ✅ | Reset de contraseña |
| `/permissions` | ✅ | Solicitud de permisos (GPS, notificaciones) |
| `/welcome` | ✅ | Pantalla de bienvenida/onboarding |

**Funcionalidades**:
- [x] Login con email/contraseña
- [x] Registro por invitación del admin
- [x] Verificación de email
- [x] Reset de contraseña
- [x] Solicitud de permisos de dispositivo
- [x] Onboarding para nuevos usuarios

---

## Cross-Cutting Requirements

### PWA Features
- [x] Instalable en iOS y Android (manifest)
- [x] Service worker para cache
- [x] Icono de app en home screen
- [ ] Modo offline (parcial, no completamente testeado)

### GPS Tracking
- [x] Geolocation API de alta precisión
- [x] Solicitud de permisos
- [x] Tracking en background durante viaje activo
- [x] Actualizaciones cada 15 segundos
- [x] Detección de velocidad
- [x] Geofence para paradas

### Real-time
- [x] Convex subscriptions para datos de viaje
- [x] Actualizaciones de estudiantes
- [x] Novedades en tiempo real
- [x] Notificaciones in-app

### Navegación Móvil
- [x] Bottom navigation en móvil (4 items: Inicio, Calendario, Rutas, Perfil)
- [x] Sidebar en desktop
- [x] Navegación contextual durante viaje activo
- [x] Safe area para dispositivos con notch

### Permisos de Dispositivo
- [x] Geolocalización
- [x] Cámara (para QR)
- [x] Notificaciones push

---

## Requisitos Pendientes (v2.0)

- [ ] Modo offline completo (viaje sin conexión)
- [ ] Sincronización en background
- [ ] Upload real de fotos en checklist
- [ ] Upload real de fotos en incidentes
- [ ] QR scanner mejorado
- [ ] Push notifications nativas
- [ ] Llamada directa a padres desde lista de estudiantes

---

## Referencias

- **Wireframes**: [docs/design/CREW_WIREFRAMES.md](../design/CREW_WIREFRAMES.md)
- **API**: [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
- **Schema**: [docs/database/DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md)
- **Tech Spec**: [Technical-Specification.md](../../Technical-Specification.md)
- **ETA System**: [docs/features/REAL_TIME_ETA.md](../features/REAL_TIME_ETA.md)
