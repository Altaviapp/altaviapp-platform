# Plan de Desarrollo Frontend - Crew PWA

**Basado en**: [docs/design/CREW_WIREFRAMES.md](../docs/design/CREW_WIREFRAMES.md)
**Design System**: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
**Duración Estimada**: 4-6 semanas
**Fecha**: Noviembre 2025

---

## Índice

1. [Fase 0: Setup y Configuración](#fase-0-setup-y-configuración)
2. [Fase 1: Componentes Base](#fase-1-componentes-base)
3. [Fase 2: Autenticación](#fase-2-autenticación)
4. [Fase 3: Dashboard](#fase-3-dashboard)
5. [Fase 4: Pre-Trip Checklist](#fase-4-pre-trip-checklist)
6. [Fase 5: Viaje Activo](#fase-5-viaje-activo)
7. [Fase 6: Check-in/Check-out](#fase-6-check-incheck-out)
8. [Fase 7: Funcionalidades Avanzadas](#fase-7-funcionalidades-avanzadas)
9. [Fase 8: Testing y Optimización](#fase-8-testing-y-optimización)

---

## Fase 0: Setup y Configuración
**Duración**: 1-2 días

### Objetivos
- Configurar el tema de la aplicación
- Customizar shadcn/ui components
- Crear mockup data
- Configurar estructura de carpetas

### Tareas

#### 1. Configurar Tailwind con Brand Colors

```bash
# Archivo: mobile/tailwind.config.ts
```

**Actualizar con**:
- Colores del brand (primary, accent, white)
- Colores funcionales (success, info, warning, error)
- Tipografía (Inter)
- Extensiones de animación

#### 2. Actualizar CSS Global

```bash
# Archivo: mobile/src/app/globals.css
```

**Agregar**:
- CSS variables para colores
- Estilos base para shadcn
- Utilidades personalizadas

#### 3. Crear Estructura de Carpetas

```
mobile/src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Layout con sidebar
│   │   ├── page.tsx            # Dashboard principal
│   │   ├── trips/              # Gestión de viajes
│   │   ├── checkin/            # Check-in de estudiantes
│   │   ├── history/            # Historial
│   │   └── profile/            # Perfil
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # shadcn components
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MobileNav.tsx
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── TripCard.tsx
│   │   └── NotificationList.tsx
│   ├── trips/
│   │   ├── TripStatus.tsx
│   │   ├── RouteMap.tsx
│   │   └── StudentList.tsx
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── EmptyState.tsx
│       └── LoadingState.tsx
├── lib/
│   ├── mockData/
│   │   ├── users.ts
│   │   ├── trips.ts
│   │   ├── students.ts
│   │   ├── vehicles.ts
│   │   └── routes.ts
│   ├── utils/
│   │   ├── cn.ts
│   │   ├── dates.ts
│   │   └── formatters.ts
│   └── constants/
│       ├── colors.ts
│       └── config.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useTrip.ts
│   └── useGeolocation.ts
└── types/
    ├── user.ts
    ├── trip.ts
    ├── student.ts
    └── vehicle.ts
```

#### 4. Instalar Dependencias Adicionales

```bash
npm install lucide-react date-fns clsx tailwind-merge
npm install -D @types/node
```

#### 5. Crear Mockup Data

Ver [mockData/README.md](./src/lib/mockData/README.md)

---

## Fase 1: Componentes Base
**Duración**: 3-4 días

### Objetivos
- Crear componentes de layout (Sidebar, Header)
- Customizar componentes shadcn/ui
- Crear componentes compartidos

### Tareas

#### 1.1 Customizar shadcn/ui Components

```bash
# Instalar componentes necesarios
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add skeleton
```

**Customizar cada componente** según [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

#### 1.2 Crear Layout Components

**Sidebar.tsx**
- Logo de Altaviapp
- Perfil de usuario con avatar
- Navegación con iconos
- Estados activo/hover
- Responsive (colapsable en mobile)

**Header.tsx**
- Breadcrumbs
- Título de página
- Botones de acción
- Menú hamburguesa (mobile)

**MobileNav.tsx**
- Bottom navigation para mobile
- Accesos rápidos (Viaje, Check-in, Perfil)

#### 1.3 Crear Shared Components

**StatusBadge.tsx**
```tsx
// Badge con variantes para estados
// - active, inactive, in_progress, completed, cancelled
```

**EmptyState.tsx**
```tsx
// Estado vacío con ilustración/icono
// Texto descriptivo
// Call to action
```

**LoadingState.tsx**
```tsx
// Skeleton loaders para diferentes componentes
// - Table, Card, List
```

---

## Fase 2: Autenticación
**Duración**: 2-3 días

### Wireframes de Referencia
- Sección 1: Login y Autenticación (CREW_WIREFRAMES.md)

### Pantallas

#### 2.1 Pantalla de Bienvenida (Primera vez)
**Ruta**: `/welcome`

**Componentes**:
- Logo de Altaviapp
- Descripción breve
- Botón "Instalar en el dispositivo"
- Link "Continuar sin instalar"

#### 2.2 Pantalla de Login
**Ruta**: `/login`

**Componentes**:
- Logo
- Form con email/usuario
- Input de contraseña
- Checkbox "Mantener sesión iniciada"
- Botón "Iniciar Sesión"
- Link "¿Olvidó su contraseña?"
- Indicador de conexión segura

**Validaciones**:
- Email formato válido
- Contraseña requerida (mínimo 6 caracteres)
- Feedback de errores

**Mockup Data**:
```typescript
// Usuario de prueba
email: "conductor@altaviapp.ec"
password: "demo123"
```

#### 2.3 Verificación de Permisos
**Ruta**: `/permissions`

**Componentes**:
- Lista de permisos necesarios:
  - ✅ Ubicación (GPS)
  - ✅ Cámara
  - ✅ Notificaciones
  - ✅ Background location
- Explicación de cada permiso
- Botón "Conceder Permisos"

---

## Fase 3: Dashboard
**Duración**: 3-4 días

### Wireframes de Referencia
- Sección 2: Dashboard del Conductor

### Pantallas

#### 3.1 Dashboard Principal
**Ruta**: `/dashboard`

**Secciones**:

1. **Header**
   - Saludo personalizado: "Buenos días, [Nombre]"
   - Fecha actual

2. **Mi Vehículo** (Card)
   - Modelo y placa
   - Capacidad
   - Estado (disponible/mantenimiento)
   - Botón "Ver detalles"

3. **Viajes de Hoy** (Cards)
   - Viaje de Ida
     - Ruta
     - Horario
     - Número de paradas
     - Estudiantes asignados
     - Estado
     - Botón "INICIAR VIAJE" (prominente)
   - Viaje de Vuelta
     - Similar al de ida
     - Botón "Ver detalles"

4. **Resumen** (Stats)
   - Viajes completados (semana)
   - Estudiantes transportados
   - Puntualidad

5. **Notificaciones Recientes** (List)
   - Últimas 3 notificaciones
   - Timestamp relativo
   - Link "Ver todas"

**Componentes a Crear**:
- `VehicleCard.tsx`
- `TripCard.tsx`
- `WeeklyStats.tsx`
- `NotificationItem.tsx`

**Mockup Data**:
```typescript
// Viajes de hoy (2)
// Vehículo asignado
// Estadísticas de la semana
// Notificaciones (3)
```

---

## Fase 4: Pre-Trip Checklist
**Duración**: 2-3 días

### Wireframes de Referencia
- Sección 3: Pre-Trip Checklist

### Pantallas

#### 4.1 Lista de Verificación
**Ruta**: `/trips/[id]/checklist`

**Categorías**:
1. 🔧 Mecánica (5 items)
   - Frenos
   - Neumáticos
   - Motor
   - Combustible
   - Batería

2. 💡 Luces y Señales (4 items)
   - Luces delanteras
   - Luces traseras
   - Direccionales
   - Luces de emergencia

3. 🔐 Seguridad (6 items)
   - Cinturones
   - Puertas y ventanas
   - Espejos
   - Extintor
   - Botiquín
   - Triángulos

4. 🧹 Limpieza (2 items)
   - Interior limpio
   - Parabrisas limpio

**Features**:
- Checkboxes grandes y táctiles
- Barra de progreso: "X/16 completados"
- Campo de observaciones (opcional)
- Opción de agregar foto
- Botón "COMPLETAR INSPECCIÓN" (deshabilitado hasta completar todo)

**Estados**:
- ✅ **Completado**: Todos los items OK
- ⚠️ **Con problemas**: Al menos un item marcado como problema
  - Mostrar items problemáticos
  - Opciones:
    - "Reportar problema y cancelar viaje"
    - "Problema menor - Continuar con precaución"

**Componentes a Crear**:
- `ChecklistCategory.tsx`
- `ChecklistItem.tsx`
- `ChecklistProgress.tsx`
- `ChecklistSummary.tsx`

---

## Fase 5: Viaje Activo
**Duración**: 4-5 días

### Wireframes de Referencia
- Sección 4: Viaje Activo

### Pantallas

#### 5.1 Iniciar Viaje (Confirmación)
**Ruta**: `/trips/[id]/start`

**Información**:
- Tipo de viaje (Ida/Vuelta)
- Vehículo
- Ruta
- Horario
- Estudiantes
- Paradas
- Checklist completado

**Advertencias**:
- GPS se activará automáticamente
- Padres recibirán notificación
- Recordatorio de check-in

**Botón**: "INICIAR VIAJE"

#### 5.2 Panel de Control del Viaje Activo
**Ruta**: `/trips/[id]/active`

**Secciones**:

1. **Header**
   - Estado: "EN RUTA"
   - Ruta
   - Tiempo transcurrido
   - Menú de opciones [⋮]

2. **Próxima Parada** (Card destacado)
   - Número de parada (X de Y)
   - Dirección
   - Distancia
   - ETA
   - Estudiantes esperando (nombres)
   - Botón "NAVEGAR A PARADA"

3. **Progreso del Viaje**
   - Barra de progreso de paradas
   - Contador de estudiantes a bordo

4. **Acciones Rápidas** (Grid de botones grandes)
   - 📷 CHECK IN
   - 📋 LISTA ESTUD.
   - 🚨 INCIDENTE
   - 💬 MENSAJE

5. **GPS Status**
   - Indicador de transmisión activa
   - Velocidad actual
   - Link "Ver mapa"

6. **Botón de finalizar** (al final)
   - "FINALIZAR VIAJE"

**Features**:
- Actualización en tiempo real (simulada con mock data)
- Contador de tiempo en vivo
- Estado del GPS visible

**Componentes a Crear**:
- `TripHeader.tsx`
- `NextStopCard.tsx`
- `TripProgress.tsx`
- `QuickActions.tsx`
- `GPSStatus.tsx`

#### 5.3 Vista de Mapa
**Ruta**: `/trips/[id]/map`

**Elementos**:
- Mapa con Leaflet
- Ruta completa trazada
- Paradas marcadas:
  - ✅ Completadas (verde)
  - 📍 Actual (azul)
  - ⚪ Pendientes (gris)
- Ubicación actual del bus (🚌)
- Controles de zoom
- Info de próxima parada (overlay)
- Botón "NAVEGACIÓN"

**Componentes a Crear**:
- `RouteMap.tsx` (con react-leaflet)
- `MapControls.tsx`
- `StopMarker.tsx`

---

## Fase 6: Check-in/Check-out
**Duración**: 4-5 días

### Wireframes de Referencia
- Sección 5: Check-in de Estudiantes

### Pantallas

#### 6.1 Lista de Estudiantes por Parada
**Ruta**: `/trips/[id]/stops/[stopId]`

**Elementos**:
- Header con dirección de la parada
- Contador: "Estudiantes esperando: X"
- Lista de estudiantes:
  - Foto/Avatar
  - Nombre completo
  - Grado y sección
  - Hora esperada
  - Contacto de emergencia
  - Botones:
    - "📷 QR SCAN"
    - "✓ MANUAL CHECK-IN"

**Estados**:
- ⏳ Pendiente (sin check-in)
- ✅ Abordado (check-in completado)

**Botón al final**:
- "CONTINUAR A PRÓXIMA PARADA (X pendientes)"

**Componentes a Crear**:
- `StopHeader.tsx`
- `StudentCard.tsx`
- `CheckInActions.tsx`

#### 6.2 Escáner de Código QR
**Ruta**: `/trips/[id]/scan`

**Elementos**:
- Nombre del estudiante (header)
- Vista de cámara con:
  - Frame para QR code
  - Indicador de escaneo activo
- Instrucción: "Enfoque el código QR en el recuadro"
- Consejo de iluminación
- Botón "ACTIVAR FLASH"
- Link "Usar check-in manual"

**Features**:
- Escaneo continuo
- Feedback visual al detectar QR
- Vibración al escanear exitosamente
- Validación del QR code

**Librería**: `react-qr-scanner` o similar

#### 6.3 Check-in Exitoso (Modal/Screen)
**Elementos**:
- ✅ Icono grande
- "Check-in Exitoso"
- Nombre del estudiante
- Hora
- Parada
- "✅ Padre notificado - WhatsApp enviado"
- Contador actualizado: "Estudiantes a bordo: X/Y"
- Botones:
  - "Siguiente estudiante"
  - "Ver todos los estudiantes"
- Auto-close en 3 segundos

#### 6.4 Check-in Manual (Confirmación)
**Ruta**: `/trips/[id]/manual-checkin/[studentId]`

**Elementos**:
- Header: "Check-in Manual"
- Info del estudiante
- Hora y parada (auto)
- Razón del check-in manual (radio):
  - QR code no disponible
  - QR code dañado
  - Problemas con cámara
  - Otro
- Campo de observaciones
- Verificación de identidad (checkboxes):
  - ☑ Estudiante identificado correctamente
  - ☑ Confirmo que es [Nombre]
- Botón "✓ CONFIRMAR CHECK-IN"

#### 6.5 Check-out (Bajada)
**Ruta**: `/trips/[id]/checkout`

**Elementos**:
- Header con parada (generalmente escuela)
- "Estudiantes a bordo: X"
- Lista de estudiantes:
  - Foto/Nombre
  - Estado:
    - ✅ Check-out realizado (con hora)
    - ⏳ Pendiente (con botones)
- Barra de progreso: "X/Y estudiantes bajados"
- Opciones:
  - "📷 ESCANEO RÁPIDO (Modo continuo)"
  - "✓ CHECK-OUT MASIVO (Todos)"

**Componentes a Crear**:
- `QRScanner.tsx`
- `CheckInSuccess.tsx`
- `ManualCheckInForm.tsx`
- `CheckOutList.tsx`

---

## Fase 7: Funcionalidades Avanzadas
**Duración**: 5-6 días

### 7.1 Navegación Turn-by-Turn
**Wireframes**: Sección 6

**Elementos**:
- Mapa simplificado con flecha de dirección
- Instrucción grande: "En 200m - Gire a la DERECHA"
- Info de destino (parada actual)
- Distancia y ETA
- Velocidad actual vs límite
- Próximas instrucciones (lista)
- Botón "SILENCIAR VOZ"

**Integración**: Leaflet Routing Machine o Google Maps API

### 7.2 Lista de Paradas Restantes
**Ruta**: `/trips/[id]/stops`

**Elementos**:
- Progreso: "X/Y paradas"
- Lista de paradas:
  - ✅ Completadas (con hora y estudiantes)
  - 🔵 Actual (con ETA y botón navegar)
  - ⚪ Pendientes (con ETA)
  - 🏫 Destino final

### 7.3 Reporte de Incidentes
**Wireframes**: Sección 7

#### Tipos de Incidentes (Selector)
- 🚗 Accidente de tránsito
- 🔧 Problema mecánico
- ⚠️ Retraso por tráfico
- 🚨 Emergencia médica
- 👨‍🎓 Problema con estudiante
- 🛣️ Problema en la ruta
- 📝 Otro

#### Formulario según Tipo

**Ejemplo: Accidente**
- Gravedad (radio):
  - 🔴 Grave (requiere ambulancia)
  - 🟡 Moderado (sin heridos graves)
  - 🟢 Menor (solo daños materiales)
- Hora (auto)
- Ubicación GPS (auto)
- Checkboxes:
  - Llamar a emergencias (911)
  - Notificar a administradores
  - Notificar a padres
- Detalles:
  - ☐ Hay heridos (número)
  - ☐ Estudiantes involucrados
  - ☐ Otro vehículo (placa)
- Descripción (textarea)
- Fotos (hasta 3)
- Botón "🚨 ENVIAR REPORTE URGENTE"

**Ejemplo: Retraso Rápido**
- Tiempo estimado de retraso (botones):
  - 5 MIN, 10 MIN, 15 MIN, 20 MIN, 30 MIN, Otro
- Razón (radio):
  - Tráfico pesado
  - Accidente en la vía
  - Construcción/Cierre
  - Condiciones climáticas
  - Otro
- Comentarios (opcional)
- Botón "ENVIAR NOTIFICACIÓN"

**Incidente Enviado**
- ✅ Confirmación
- Número de reporte
- Notificaciones enviadas
- Contacto de emergencia
- Botones:
  - "Ver detalles del incidente"
  - "Volver al viaje"

**Componentes a Crear**:
- `IncidentTypeSelector.tsx`
- `AccidentForm.tsx`
- `DelayForm.tsx`
- `IncidentConfirmation.tsx`

### 7.4 Historial de Viajes
**Wireframes**: Sección 8

**Lista de Viajes**
- Filtros (dropdown):
  - Por fecha (última semana, último mes, personalizado)
  - Por tipo (todos, ida, vuelta)
- Agrupación por fecha
- Card por viaje:
  - Tipo e icono (🌅 Ida / 🌇 Vuelta)
  - Ruta
  - Horario y duración
  - Distancia
  - Estudiantes
  - Estado:
    - ✅ Completado sin incidentes
    - ⚠️ Con incidentes/retrasos
  - Link "Ver detalles"

**Detalle de Viaje**
- Resumen completo
- Ruta recorrida (con horas)
- Lista de estudiantes (con ausentes)
- Incidentes (si los hay)
- Estadísticas (velocidad promedio, puntualidad)
- Botones:
  - "Descargar reporte"
  - "Compartir"

**Componentes a Crear**:
- `TripHistoryList.tsx`
- `TripHistoryFilters.tsx`
- `TripDetail.tsx`

### 7.5 Perfil y Configuración
**Wireframes**: Sección 9

**Perfil del Conductor**
- Avatar (grande)
- Nombre y rol
- Info personal (email, teléfono, cédula)
- Info profesional (licencia, vencimiento)
- Institución y antigüedad
- Vehículo asignado
- Estadísticas de desempeño
- Documentos

**Configuración**
- 🔔 Notificaciones
  - Checkboxes para tipos
  - Sonido, vibración
- 🗺️ Navegación
  - Voz (activada/solo alertas/silenciada)
  - Volumen
  - Vista (3D/2D)
  - Mostrar tráfico, modo nocturno
- 📷 Escáner QR
  - Sonido, vibración, flash
  - Modo (continuo/manual)
- 📍 GPS
  - Frecuencia (15s/30s)
  - Alta precisión
- 🌐 General
  - Idioma
  - Zona horaria
  - Formato de hora (24h/12h)
  - Mantener pantalla encendida
- 🔐 Seguridad
  - Cambiar contraseña
  - Auto-logout
  - Requerir PIN
- 📱 Sobre la App
  - Versión
  - Buscar actualizaciones
  - Guía, Ayuda, Términos, Privacidad

**Componentes a Crear**:
- `ProfileHeader.tsx`
- `ProfileInfo.tsx`
- `ProfileStats.tsx`
- `SettingsGroup.tsx`
- `SettingsItem.tsx`

---

## Fase 8: Testing y Optimización
**Duración**: 3-4 días

### 8.1 Testing

**Unit Tests** (Jest + React Testing Library)
- Componentes UI
- Utilities y helpers
- Custom hooks

**Integration Tests**
- Flujos completos:
  - Login → Dashboard
  - Iniciar viaje → Check-in → Finalizar
  - Reporte de incidente

**E2E Tests** (opcional: Playwright/Cypress)
- Flujo crítico de viaje completo

### 8.2 Optimización

**Performance**
- Lazy loading de rutas
- Code splitting
- Optimización de imágenes
- Memoización de componentes

**PWA**
- Service Worker optimizado
- Estrategias de caché
- Offline fallbacks
- Background sync

**Accesibilidad**
- Auditoría con Lighthouse
- Testing con lectores de pantalla
- Contraste de colores
- Keyboard navigation

**SEO/Metadata**
- Metadata por página
- Open Graph tags
- Manifest optimizado

---

## Mockup Data Structure

Ver archivos en `/mobile/src/lib/mockData/`:

1. **users.ts** - Conductores de prueba
2. **vehicles.ts** - Vehículos asignados
3. **routes.ts** - Rutas y paradas
4. **students.ts** - Estudiantes por ruta
5. **trips.ts** - Viajes programados y en curso
6. **incidents.ts** - Incidentes de ejemplo
7. **notifications.ts** - Notificaciones

---

## Checklist de Implementación

### Setup ✓
- [x] Configurar Tailwind con brand colors
- [x] Crear estructura de carpetas
- [x] Instalar shadcn/ui components
- [x] Crear mockup data
- [x] Configurar routing
- [x] Configurar Docker para desarrollo
- [x] Actualizar a Next.js 16 + Turbopack

### Componentes Base ✓
- [x] Sidebar con navegación
- [x] Header responsive
- [x] Mobile navigation
- [x] StatusBadge
- [x] EmptyState
- [x] LoadingState

### Autenticación ✓
- [x] Pantalla de bienvenida
- [x] Login form
- [x] Verificación de permisos
- [x] Protección de rutas

### Dashboard ✓
- [x] VehicleCard
- [x] TripCard (Ida/Vuelta)
- [x] WeeklyStats
- [x] NotificationList

### Pre-Trip Checklist ✓
- [x] Checklist categorizado
- [x] Progreso visual
- [x] Manejo de problemas
- [x] Foto upload

### Viaje Activo
- [ ] Panel de control
- [ ] Próxima parada
- [ ] Progreso del viaje
- [ ] Quick actions
- [ ] GPS status

### Mapa y Navegación
- [ ] Integración Leaflet
- [ ] Ruta trazada
- [ ] Markers de paradas
- [ ] Turn-by-turn navigation

### Check-in/Check-out
- [ ] Lista de estudiantes
- [ ] QR Scanner
- [ ] Check-in manual
- [ ] Check-out masivo

### Incidentes
- [ ] Selector de tipo
- [ ] Formulario de accidente
- [ ] Reporte rápido de retraso
- [ ] Confirmación y tracking

### Historial y Perfil
- [ ] Lista de viajes históricos
- [ ] Detalle de viaje
- [ ] Perfil del conductor
- [ ] Configuración completa

### Testing y Optimización
- [ ] Unit tests
- [ ] Integration tests
- [ ] Performance audit
- [ ] Accessibility audit
- [ ] PWA optimization

---

## Próximos Pasos Inmediatos

1. ~~Configurar Tailwind con los colores del brand~~ ✓
2. ~~Crear mockup data completo~~ ✓
3. ~~Implementar Sidebar y Header siguiendo el diseño~~ ✓
4. ~~Crear página de Dashboard con datos mock~~ ✓
5. ~~Implementar Pre-Trip Checklist~~ ✓ (Fase 4)
6. **Implementar Viaje Activo** (Fase 5)
7. **Implementar Check-in/Check-out** (Fase 6)

---

## Lecciones Aprendidas (Phases 0-3)

### 1. Stack Tecnológico

**Versiones Finales**:
- **Next.js**: 16.0.5 (actualizado desde 14.2.33)
- **React**: 19.2.0 (actualizado desde 18.x)
- **Turbopack**: Habilitado por defecto en Next.js 16
- **TypeScript**: Strict mode
- **Tailwind CSS**: 3.4+
- **Lucide React**: Para iconografía (NO emojis)

**Razón de Actualización**:
- Next.js 14.2.33 estaba desactualizado y causaba problemas con PostCSS
- Next.js 16 incluye Turbopack por defecto (compilación más rápida)
- React 19 incluye mejoras de rendimiento y nuevas características

### 2. Entorno de Desarrollo

**Docker-First Approach**:
```bash
# Usar Docker para desarrollo consistente
docker-compose up
```

**Ventajas**:
- ✅ Entorno consistente entre desarrolladores
- ✅ Evita conflictos de dependencias locales
- ✅ Soluciona problemas de PostCSS y build tools
- ✅ Fácil reset: `docker-compose down && docker-compose up --build`

**Configuración**:
- Dockerfile: Node 20-alpine
- Puerto: 3001:3000 (para evitar conflictos)
- Volúmenes: Código sincronizado en tiempo real
- Health check: Verifica que Next.js esté corriendo

### 3. Arquitectura de Rutas (Next.js App Router)

**Uso de Route Groups**:
```
mobile/src/app/
├── (auth)/              # Route group - no afecta URL
│   ├── login/
│   │   └── page.tsx     # URL: /login
│   └── layout.tsx       # Layout solo para auth
├── (dashboard)/         # Route group - no afecta URL
│   ├── dashboard/
│   │   └── page.tsx     # URL: /dashboard (NO /)
│   └── layout.tsx       # Layout con Sidebar
└── layout.tsx           # Root layout
```

**Lección**:
- ⚠️ `(dashboard)/page.tsx` mapea a `/`, NO a `/dashboard`
- ✅ `(dashboard)/dashboard/page.tsx` mapea a `/dashboard`
- Route groups son para organización, no para URLs

### 4. Patrones de Diseño UI

#### 4.1 Iconografía: Lucide React Exclusivamente

**NUNCA usar emojis en la UI**:
```tsx
// ❌ INCORRECTO - Emojis no consistentes
<h2>📅 Viajes de Hoy</h2>
<span>🌅 VIAJE DE IDA</span>

// ✅ CORRECTO - Lucide React icons
import { Calendar, Sunrise, Sunset } from 'lucide-react';

<h2 className="flex items-center gap-2">
  <Calendar className="w-5 h-5 text-primary" />
  Viajes de Hoy
</h2>

<Icon className={isInbound ? 'w-5 h-5 text-warning' : 'w-5 h-5 text-info'} />
<span>VIAJE DE IDA</span>
```

**Razones**:
- ✅ Consistencia visual en todos los dispositivos
- ✅ Escalabilidad sin pérdida de calidad
- ✅ Control total sobre color, tamaño y estilo
- ✅ Mejor accesibilidad con aria-labels
- ❌ Emojis renderizan diferente en iOS, Android, Windows, Linux

#### 4.2 Composición de Componentes

**Patrón**: Componentes reutilizan componentes existentes
```tsx
// TripCard usa Icon component dinámico
const Icon = isInbound ? Sunrise : Sunset;
<Icon className="w-5 h-5" />

// StatusBadge usa variantes consistentes
<StatusBadge status={trip.status} />
```

#### 4.3 Colores Semánticos

**Aplicar colores según significado**:
```tsx
// Viajes
text-warning  // Viaje de ida (mañana)
text-info     // Viaje de vuelta (tarde)

// Estados
text-success  // Completado
text-error    // Cancelado
text-warning  // En progreso
text-gray     // Pendiente
```

### 5. TypeScript y Validación

**Tipos Compartidos**:
```typescript
// mobile/src/types/index.ts
export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
export type TripType = 'inbound' | 'outbound';

export interface TripWithDetails {
  _id: string;
  type: TripType;
  status: TripStatus;
  route: Route;
  vehicle: Vehicle;
  // ...
}
```

**Mock Data Tipado**:
```typescript
// mobile/src/lib/mockData/trips.ts
export const mockTripInbound: TripWithDetails = {
  // Autocomplete y type checking
};
```

### 6. Mock Data para Desarrollo

**Estructura Modular**:
```
mobile/src/lib/mockData/
├── users.ts       # Conductores
├── vehicles.ts    # Vehículos
├── routes.ts      # Rutas y paradas
├── students.ts    # Estudiantes
└── trips.ts       # Viajes (combina todo lo anterior)
```

**Ventaja**: Desarrollo sin backend, datos realistas

### 7. Componentes Compartidos

**Siempre crear componentes reutilizables**:
```
mobile/src/components/
├── shared/
│   ├── StatusBadge.tsx      # Usado en múltiples lugares
│   ├── EmptyState.tsx       # Maneja casos sin datos
│   └── LoadingState.tsx     # Skeleton loaders
├── dashboard/
│   ├── VehicleCard.tsx      # Específico de dashboard
│   ├── TripCard.tsx
│   └── WeeklyStats.tsx
└── layout/
    ├── Sidebar.tsx          # Layout components
    └── Header.tsx
```

### 8. Gestión de Estado

**Para Phases 0-3 usamos**:
- React hooks locales (`useState`, `useEffect`)
- Custom hooks (`useAuth`, `useDashboardData`)
- Context API para autenticación

**Para Phases 4+ necesitaremos**:
- Convex queries para datos en tiempo real
- Optimistic UI updates
- Client-side caching

### 9. Debugging y Troubleshooting

**Problemas Comunes Resueltos**:

1. **PostCSS Error**: Actualizar Next.js a 16 + usar Docker
2. **Dashboard 404**: Mover page.tsx a `(dashboard)/dashboard/page.tsx`
3. **Variable typo**: `mockRoute Ida` → `mockRouteIda`
4. **Turbopack warning**: Agregar `turbopack: {}` en next.config.js

**Estrategia**:
- Leer mensajes de error completos
- Verificar estructura de rutas en Next.js App Router
- Limpiar caché: `rm -rf mobile/.next`
- Revisar logs de Docker: `docker-compose logs -f`

### 10. Flujo de Trabajo Git

**Commits Granulares**:
```bash
# Cada feature en commits pequeños
git commit -m "feat(ui): add StatusBadge component"
git commit -m "feat(dashboard): implement TripCard"
git commit -m "fix(routes): correct dashboard route structure"
git commit -m "refactor(ui): replace emojis with Lucide icons"
```

**Branches**:
- `main` - Código estable
- `feature/*` - Nuevas funcionalidades
- `fix/*` - Bug fixes

### 11. Patrones de Código

#### Conditional Styling
```tsx
// Usar clsx o cn() para clases condicionales
<Icon className={cn(
  'w-5 h-5',
  isInbound ? 'text-warning' : 'text-info'
)} />
```

#### Prop Variants
```tsx
// Componentes con variantes
interface TripCardProps {
  trip: TripWithDetails;
  variant?: 'primary' | 'secondary'; // Opciones claras
}

// Renderizado condicional basado en variant
{variant === 'primary' && trip.status === 'scheduled' ? (
  <button>INICIAR VIAJE</button>
) : (
  <Link>Ver detalles →</Link>
)}
```

#### Date/Time Utilities
```tsx
// Centralizar formateo de fechas
// mobile/src/lib/utils/dates.ts
export const formatTime = (isoString: string): string => {
  // Implementación consistente
};

export const formatDate = (isoString: string): string => {
  // Formato: DD/MM/YYYY
};
```

### 12. Preparación para Fases Siguientes

**Próximas Integraciones**:
- **Leaflet Maps**: Ya instalado, listo para Fase 5
- **QR Scanner**: Necesita permisos de cámara (Fase 6)
- **Geolocation API**: Para tracking GPS (Fase 5)
- **Service Worker**: Para modo offline (Fase 8)

**Endpoints Backend** (cuando se conecte):
- `GET /api/trips/today` - Viajes del día
- `GET /api/driver/profile` - Perfil del conductor
- `POST /api/checkin` - Check-in de estudiante
- `PUT /api/trips/:id/start` - Iniciar viaje

---

**Estado Actual**: Fases 0-4 Completadas ✅

**Próxima Fase**: Fase 5 - Viaje Activo

**¡Listo para continuar el desarrollo! 🚀**
