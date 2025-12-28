# Prompt de Refactorización: Crew y Parent Apps

**Objetivo**: Reescritura completa de las aplicaciones Crew y Parent para alinearlas con los PRDs, el backend Convex, y mantener consistencia con la app Admin refactorizada.

---

## Contexto del Proyecto

### Arquitectura Existente
```
apps/
├── admin/      # ✅ Refactorizada - Modelo a seguir
├── crew/       # 🔄 Por refactorizar (conductor/monitor PWA)
└── parent/     # 🔄 Por refactorizar (portal de padres)

packages/
├── ui/         # Componentes compartidos (shadcn/ui)
├── auth/       # Utilidades de autenticación
└── maps/       # Componentes de mapas
```

### Documentos de Referencia
- **Crew PRD**: `docs/prd/CREW_PRD.md` (5 módulos: Dashboard, Routes, Calendar, Trips, Profile)
- **Parent PRD**: `docs/prd/PARENT_PRD.md` (7 módulos: Inicio, Calendario, Hijos, Historial, Notificaciones, Novedades, Settings)
- **Schema**: `convex/schema.ts` (fuente de verdad para tipos)
- **Admin Refactorizada**: `apps/admin/src/components/` (patrones de referencia)

### Stack Técnico Común
- Next.js 14+ con App Router
- Convex (real-time database)
- TypeScript estricto
- Tailwind CSS + Headless UI
- React Hook Form + Zod
- Leaflet (mapas)

---

## Fase 1: Biblioteca de Componentes Core (Por App)

Crear estructura consistente en cada app:

```
apps/{crew|parent}/src/
├── components/
│   ├── core/
│   │   ├── index.ts
│   │   ├── Button.tsx         # Variantes: primary, secondary, danger, ghost
│   │   ├── Input.tsx          # Con label, error, hint, iconos
│   │   ├── Select.tsx         # Con label, error, opciones
│   │   ├── Textarea.tsx       # Con label, error
│   │   ├── Switch.tsx         # Toggle con label y descripción
│   │   ├── Badge.tsx          # Variantes: default, success, warning, danger, info
│   │   ├── Card.tsx           # CardHeader, CardContent, CardFooter
│   │   ├── Modal.tsx          # Usando Headless UI Dialog
│   │   ├── Tabs.tsx           # Context-based tabs
│   │   └── states/
│   │       ├── LoadingState.tsx
│   │       ├── EmptyState.tsx
│   │       └── ErrorState.tsx
│   ├── shared/
│   │   ├── index.ts
│   │   ├── PageHeader.tsx     # Título, subtítulo, breadcrumbs, acciones
│   │   ├── StatsCard.tsx      # Tarjeta de métrica individual
│   │   ├── StatsGrid.tsx      # Grid de métricas (responsive)
│   │   └── ActionMenu.tsx     # Menú dropdown de acciones
│   └── modules/               # Componentes específicos por módulo
│       └── {module}/
│           └── *.tsx
├── lib/
│   ├── constants.ts           # STATUS_CONFIG, TYPE_CONFIG, etc.
│   └── format.ts              # formatTimeAgo, formatDate, getInitials
└── hooks/                     # Hooks de Convex existentes (mantener)
```

### Código de Referencia (Copiar de Admin)

**Button.tsx** - Patrón base:
```tsx
import { cn } from '@/lib/utils';
import { Loader2, LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2',
        // Size variants
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        // Color variants
        variant === 'primary' && 'bg-primary text-white hover:bg-primary/90 focus:ring-primary',
        variant === 'secondary' && 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500',
        variant === 'danger' && 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
        variant === 'ghost' && 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
        variant === 'link' && 'text-primary hover:underline p-0',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {RightIcon && !isLoading && <RightIcon className="w-4 h-4" />}
    </button>
  );
}
```

**Badge.tsx** - Patrón base:
```tsx
import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-1 text-sm',
        variant === 'default' && 'bg-gray-100 text-gray-700',
        variant === 'success' && 'bg-green-100 text-green-700',
        variant === 'warning' && 'bg-yellow-100 text-yellow-700',
        variant === 'danger' && 'bg-red-100 text-red-700',
        variant === 'info' && 'bg-blue-100 text-blue-700',
        variant === 'purple' && 'bg-purple-100 text-purple-700',
        className
      )}
    >
      {children}
    </span>
  );
}
```

**constants.ts** - Configuraciones de estado:
```tsx
// Configuraciones compartidas - adaptar por app
export const TRIP_STATUS_CONFIG = {
  scheduled: { label: 'Programado', variant: 'default' as const, color: 'gray' },
  in_progress: { label: 'En Ruta', variant: 'info' as const, color: 'blue' },
  completed: { label: 'Completado', variant: 'success' as const, color: 'green' },
  cancelled: { label: 'Cancelado', variant: 'danger' as const, color: 'red' },
};

export const ROUTE_TYPE_CONFIG = {
  pickup: { label: 'Recogida', variant: 'info' as const },
  dropoff: { label: 'Entrega', variant: 'warning' as const },
};

export const CHECKIN_STATUS_CONFIG = {
  pending: { label: 'Pendiente', variant: 'default' as const },
  onboard: { label: 'A Bordo', variant: 'info' as const },
  delivered: { label: 'Entregado', variant: 'success' as const },
  absent: { label: 'Ausente', variant: 'warning' as const },
};
```

---

## Fase 2: Crew App - Refactorización por Módulo

### 2.1 Dashboard (`/dashboard`)
**Archivo**: `apps/crew/src/app/(dashboard)/dashboard/page.tsx`

**Estructura**:
```tsx
export default function DashboardPage() {
  const { user } = useConvexAuth();
  const { routes } = useMyRoutes();
  const { novedades } = useNovedadesForDriverToday();
  const { stats } = useMyStats();

  return (
    <div className="space-y-6 pb-20">
      {/* Saludo personalizado */}
      <GreetingHeader name={user.name} role={user.role} />

      {/* Stats del día */}
      <StatsGrid stats={[...]} columns={3} />

      {/* Rutas de hoy - Acción rápida */}
      <TodayRoutes routes={routes} />

      {/* Novedades del día */}
      <NovedadesSection novedades={novedades} />

      {/* Vehículo asignado */}
      <VehicleCard vehicle={user.assignedVehicle} />
    </div>
  );
}
```

**Componentes a crear/refactorizar**:
- `components/modules/dashboard/GreetingHeader.tsx`
- `components/modules/dashboard/TodayRoutes.tsx`
- `components/modules/dashboard/NovedadesSection.tsx`
- `components/modules/dashboard/VehicleCard.tsx` (refactorizar existente)
- `components/modules/dashboard/WeeklyStats.tsx` (refactorizar existente)

### 2.2 Routes (`/routes`, `/routes/[id]`)

**Lista de rutas**:
```tsx
export default function RoutesPage() {
  const { routes, isLoading } = useMyRoutes();
  const [filter, setFilter] = useState<'all' | 'pickup' | 'dropoff'>('all');

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Mis Rutas" />

      {/* Tabs de filtro */}
      <Tabs value={filter} onChange={setFilter}>
        <TabsList>
          <Tab value="all">Todas</Tab>
          <Tab value="pickup">Recogida</Tab>
          <Tab value="dropoff">Entrega</Tab>
        </TabsList>
      </Tabs>

      {/* Lista de rutas */}
      <RoutesList routes={filtered} isLoading={isLoading} />
    </div>
  );
}
```

### 2.3 Trips - Módulo Complejo

**Estructura de páginas**:
- `/trips/[id]` - Detalle del viaje
- `/trips/[id]/start` - Confirmación de inicio
- `/trips/[id]/checklist` - Checklist pre-viaje (solo conductor)
- `/trips/[id]/active` - Viaje activo (mapa, tracking, acciones)
- `/trips/[id]/students` - Lista de estudiantes con check-in
- `/trips/[id]/incidents` - Formulario de incidentes
- `/trips/[id]/map` - Mapa pantalla completa

**Componentes clave a mantener/refactorizar**:
- `RouteMap.tsx` - Mantener, solo actualizar estilos
- `QRScanner.tsx` - Mantener, es funcional
- `ChecklistCategory.tsx` - Refactorizar con nuevos componentes core
- `NextStopCard.tsx` - Refactorizar estilos
- `QuickActions.tsx` - Refactorizar con Button component

### 2.4 Profile (`/profile`)

**Estructura con tabs**:
```tsx
export default function ProfilePage() {
  const { profile } = useProfile();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');

  return (
    <div className="space-y-6 pb-20">
      {/* Header con avatar */}
      <ProfileHeader profile={profile} />

      <Tabs value={activeTab} onChange={setActiveTab}>
        <TabsList>
          <Tab value="profile">Perfil</Tab>
          <Tab value="history">Historial</Tab>
          <Tab value="settings">Configuración</Tab>
        </TabsList>

        <TabsPanel value="profile">
          {profile.role === 'driver' ? (
            <DriverProfileSection profile={profile} />
          ) : (
            <MonitorProfileSection profile={profile} />
          )}
        </TabsPanel>

        <TabsPanel value="history">
          <TripHistoryList />
        </TabsPanel>

        <TabsPanel value="settings">
          <SettingsSection />
        </TabsPanel>
      </Tabs>
    </div>
  );
}
```

---

## Fase 3: Parent App - Refactorización por Módulo

### 3.1 Inicio/Tracking (`/inicio`)

**Estructura principal**:
```tsx
export default function InicioPage() {
  const { children, isLoading } = useAllChildrenTrips();

  if (isLoading) return <LoadingState message="Cargando información..." />;

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Inicio" subtitle="Seguimiento en tiempo real" />

      {children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Sin hijos registrados"
          description="Contacta al colegio para vincular a tus hijos"
        />
      ) : (
        <div className="space-y-4">
          {children.map((child) => (
            <ChildTripCard key={child._id} child={child} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Componentes clave**:
- `components/modules/tracking/ChildTripCard.tsx` - Tarjeta expandible
- `components/modules/tracking/ActiveTripView.tsx` - Vista con mapa
- `components/modules/tracking/ETADisplay.tsx` - ETA con delay status
- `components/modules/tracking/ProgressBar.tsx` - Progreso del viaje

### 3.2 Calendario (`/calendario`)

**Vista semanal**:
```tsx
export default function CalendarioPage() {
  const { schedule, isLoading } = useWeeklySchedule();
  const [currentWeek, setCurrentWeek] = useState(new Date());

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Calendario" />

      <WeekNavigation
        currentWeek={currentWeek}
        onPrevious={() => ...}
        onNext={() => ...}
      />

      <WeekView schedule={schedule} isLoading={isLoading} />
    </div>
  );
}
```

### 3.3 Hijos (`/hijos`, `/hijos/[id]`, etc.)

**Lista de hijos**:
```tsx
export default function HijosPage() {
  const { students, isLoading } = useMyStudentsWithPhotos();

  return (
    <div className="space-y-4 pb-20">
      <PageHeader title="Mis Hijos" />

      {students.length === 0 ? (
        <EmptyState ... />
      ) : (
        <div className="grid gap-4">
          {students.map((student) => (
            <ChildCard key={student._id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**Páginas de detalle**:
- `/hijos/[id]` - Perfil completo con QR, rutas, contactos
- `/hijos/[id]/edit` - Formulario de edición
- `/hijos/[id]/location` - Selector de ubicación con mapa
- `/hijos/[id]/historial` - Historial de viajes

### 3.4 Notificaciones (`/notifications`)

**Centro de notificaciones**:
```tsx
export default function NotificationsPage() {
  const { notifications, isLoading } = useNotifications();
  const { markAsRead, markAllAsRead } = useNotificationMutations();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Notificaciones"
        actions={[
          { label: 'Marcar todo leído', onClick: markAllAsRead }
        ]}
      />

      <Tabs value={filter} onChange={setFilter}>
        <TabsList>
          <Tab value="all">Todas</Tab>
          <Tab value="unread">No leídas</Tab>
        </TabsList>
      </Tabs>

      <NotificationList
        notifications={filtered}
        onMarkAsRead={markAsRead}
      />
    </div>
  );
}
```

### 3.5 Novedades (`/novedades/create`)

**Formulario de creación**:
```tsx
export default function CreateNovedadPage() {
  const form = useForm<NovedadFormData>({
    resolver: zodResolver(novedadSchema),
  });
  const { createNovedad } = useNovedadesMutations();

  return (
    <div className="space-y-6 pb-20">
      <PageHeader title="Nueva Novedad" backHref="/inicio" />

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6">
            {/* Selector de hijo */}
            <ChildSelector control={form.control} />

            {/* Tipo de novedad */}
            <NovedadTypeSelector control={form.control} />

            {/* Fecha */}
            <DatePicker control={form.control} />

            {/* Tipo de ruta afectada */}
            <RouteTypeSelector control={form.control} />

            {/* Razón */}
            <Textarea
              label="Razón"
              {...form.register('reason')}
              error={form.formState.errors.reason?.message}
            />
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button type="submit" isLoading={form.formState.isSubmitting}>
            Enviar Solicitud
          </Button>
        </div>
      </form>
    </div>
  );
}
```

---

## Cross-App Consistency Checklist

### Colores de Marca
```css
--primary: #042940;      /* Altaviapp Blue */
--accent: #DBF227;       /* Altaviapp Lime */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

### Patrones Compartidos

| Patrón | Admin | Crew | Parent |
|--------|:-----:|:----:|:------:|
| PageHeader | ✅ | ⬜ | ⬜ |
| StatsGrid | ✅ | ⬜ | ⬜ |
| Badge | ✅ | ⬜ | ⬜ |
| Button | ✅ | ⬜ | ⬜ |
| Card | ✅ | ⬜ | ⬜ |
| Modal | ✅ | ⬜ | ⬜ |
| Tabs | ✅ | ⬜ | ⬜ |
| LoadingState | ✅ | ⬜ | ⬜ |
| EmptyState | ✅ | ⬜ | ⬜ |
| ErrorState | ✅ | ⬜ | ⬜ |

### Navegación Mobile

**Crew App** (Bottom Nav - 4 items):
- Inicio → `/dashboard`
- Calendario → `/calendar`
- Rutas → `/routes`
- Perfil → `/profile`

**Parent App** (Bottom Nav - 4 items):
- Inicio → `/inicio`
- Calendario → `/calendario`
- Hijos → `/hijos`
- Historial → `/historial`

### Labels en Español
- Todos los textos en español
- Formato de fecha: "28 de diciembre de 2024"
- Formato de hora: "14:30"
- Tiempo relativo: "Hace 2 min", "Hace 1 hora"

---

## Orden de Implementación

### Crew App
1. **Core Components** (lib/constants, components/core/*)
2. **Dashboard** (greeting, stats, routes, novedades)
3. **Routes** (list, detail)
4. **Profile** (tabs, sections)
5. **Trips** (refactorizar páginas existentes)
6. **Calendar** (monthly view)

### Parent App
1. **Core Components** (lib/constants, components/core/*)
2. **Inicio/Tracking** (child cards, map, ETA)
3. **Hijos** (list, detail, edit, location)
4. **Calendario** (week view)
5. **Novedades** (create form)
6. **Notificaciones** (list, filters)
7. **Settings** (preferences, account)

---

## Reglas de Refactorización

1. **Mantener hooks existentes** - Los hooks de Convex funcionan correctamente
2. **No romper funcionalidad** - Cada módulo debe funcionar después de refactorizar
3. **Mobile-first** - Ambas apps son PWA, diseñar para móvil primero
4. **Padding bottom** - Todas las páginas: `pb-20` para bottom navigation
5. **Estados de carga** - Usar LoadingState en cada página
6. **Estados vacíos** - Usar EmptyState cuando no hay datos
7. **Validación Zod** - Todos los formularios con Zod
8. **TypeScript estricto** - Sin `any`, tipos explícitos

---

## Verificación Final (Por App)

- [ ] Build sin errores: `pnpm --filter @altaviapp/{app} build`
- [ ] Type check: `pnpm --filter @altaviapp/{app} exec tsc --noEmit`
- [ ] Navegación funciona en mobile y desktop
- [ ] Todos los estados de carga muestran skeleton/spinner
- [ ] Todos los estados vacíos muestran mensaje apropiado
- [ ] Formularios validan correctamente
- [ ] Modales abren y cierran correctamente
- [ ] Real-time updates funcionan (Convex subscriptions)
- [ ] Labels en español
- [ ] Colores de marca correctos
