# Altaviapp UI Patterns

Patrones estándar de UI/UX para todas las aplicaciones del sistema.
Basado en el sistema de diseño unificado para Admin, Crew y Parent apps.

---

## 1. Sistema de Colores

### Colores Primarios
```tsx
// Definidos en tailwind.config.ts
primary: '#042940'    // Navy blue - Sidebars, elementos principales
accent: '#DBF227'     // Yellow-lime - Highlights, badges, CTAs
white: '#F7FCFF'      // Off-white - Fondos

// Estados
success: '#10B981'    // Verde - Activo, completado
error: '#EF4444'      // Rojo - Error, destructivo
warning: '#F59E0B'    // Amber - Advertencia, pendiente
info: '#3B82F6'       // Azul - Información
```

### Botones de Acción (CTA)
```tsx
// Primario - Crear/Guardar/Confirmar
<Button className="bg-primary hover:bg-primary/90 text-white">
  <Plus className="h-4 w-4 mr-2" />
  Crear
</Button>

// Secundario - Cancelar
<Button variant="outline">Cancelar</Button>

// Destructivo - Eliminar
<Button variant="destructive">Eliminar</Button>
```

### Status Badges
```tsx
// Activo
<span className="px-2 py-1 text-xs rounded-full bg-success text-white">Activo</span>

// Pendiente
<span className="px-2 py-1 text-xs rounded-full bg-warning text-white">Pendiente</span>

// Inactivo
<span className="px-2 py-1 text-xs rounded-full bg-gray-400 text-white">Inactivo</span>
```

### Role Badges
```tsx
// Admin
<span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-200">Admin</span>

// Conductor
<span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/30 text-blue-200">Conductor</span>

// Monitor
<span className="text-xs px-1.5 py-0.5 rounded bg-green-500/30 text-green-200">Monitor</span>
```

---

## 2. Layout Principal

### Estructura General
```
┌─────────────────────────────────────────────────────────────┐
│                    SIDEBAR (w-60, bg-primary)                │
│  ┌─────────────┐  ┌──────────────────────────────────────┐  │
│  │ Logo        │  │ HEADER (sticky top-0)                │  │
│  │ [App Name]  │  │ - Hamburger (mobile)                 │  │
│  ├─────────────┤  │ - Page Title                         │  │
│  │ User Profile│  │ - Notifications                       │  │
│  │ [Name]      │  ├──────────────────────────────────────┤  │
│  │ [Role]      │  │                                      │  │
│  ├─────────────┤  │ MAIN CONTENT (flex-1, p-4 lg:p-8)    │  │
│  │ Navigation  │  │                                      │  │
│  │ - Item 1    │  │                                      │  │
│  │ - Item 2 ←──│──│ (active state highlighted)           │  │
│  │ - Item 3    │  │                                      │  │
│  ├─────────────┤  │                                      │  │
│  │ Footer      │  │                                      │  │
│  │ - Settings  │  │                                      │  │
│  │ - Logout    │  │                                      │  │
│  └─────────────┘  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Sidebar Component
```tsx
// Estructura estándar del Sidebar
<aside className="w-60 bg-primary min-h-screen flex flex-col">
  {/* Logo Section */}
  <div className="p-6">
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold text-lg">Altaviapp</span>
        <span className="text-white/70 text-xs">{appName}</span>
      </div>
    </div>
  </div>

  {/* User Profile - ARRIBA del navigation */}
  <div className="px-6 py-4 border-b border-primary-foreground/10">
    <div className="flex items-center gap-3">
      <Avatar />
      <div>
        <Name />
        <RoleBadge />
      </div>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
    {navItems.map(item => <NavItem />)}
  </nav>

  {/* Footer */}
  <div className="px-3 py-4 border-t border-primary-foreground/10 space-y-1">
    <SettingsLink />
    <LogoutButton />
  </div>
</aside>
```

### Active States (Navigation)
```tsx
// Item activo
className="bg-primary-foreground/20 text-white"

// Item inactivo
className="text-white/80 hover:bg-primary-foreground/10 hover:text-white"
```

---

## 3. Páginas de Lista

### Estructura
```
┌─────────────────────────────────────────────────────────────┐
│ Título Página                                    [+ Crear]  │
│ Descripción de la sección                                   │
├─────────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                        │
│ │ Stat │ │ Stat │ │ Stat │ │ Stat │      Stats Cards       │
│ └──────┘ └──────┘ └──────┘ └──────┘                        │
├─────────────────────────────────────────────────────────────┤
│ 🔍 Buscar...            [Filtro▼] [Tipo▼] [Estado▼]        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Data Table                         │   │
│  │  Col 1    Col 2    Col 3    Col 4    Actions        │   │
│  │  ────────────────────────────────────────────       │   │
│  │  Row 1                                               │   │
│  │  Row 2                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Mostrando 1-10 de 100                    [< 1 2 3 >]      │
└─────────────────────────────────────────────────────────────┘
```

### Header de Página
```tsx
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Título</h1>
    <p className="text-gray-500">Descripción</p>
  </div>
  <Button className="bg-primary hover:bg-primary/90">
    <Plus className="h-4 w-4 mr-2" />
    Crear Nuevo
  </Button>
</div>
```

### Stats Cards
```tsx
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  {stats.map(stat => (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center gap-3">
        <div className={cn('w-12 h-12 rounded-lg flex items-center justify-center', stat.color)}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          <p className="text-sm text-gray-500">{stat.label}</p>
        </div>
      </div>
    </div>
  ))}
</div>
```

### Barra de Filtros
```tsx
<div className="bg-white rounded-lg shadow p-4">
  <div className="flex flex-col sm:flex-row gap-4">
    {/* Buscador */}
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        placeholder="Buscar..."
        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg"
      />
    </div>

    {/* Filtros */}
    <div className="flex gap-2">
      <select className="px-4 py-2 border border-gray-200 rounded-lg bg-white">
        <option>Todos</option>
      </select>
    </div>
  </div>
</div>
```

---

## 4. Páginas de Detalle

### Estructura con Tabs
```tsx
<Tabs defaultValue="detail">
  <TabsList>
    <TabsTrigger value="detail">
      <Info className="h-4 w-4 mr-2" /> Detalle
    </TabsTrigger>
    <TabsTrigger value="items">
      <List className="h-4 w-4 mr-2" /> Items
    </TabsTrigger>
  </TabsList>

  <TabsContent value="detail">
    {/* Cards de información */}
  </TabsContent>
</Tabs>
```

---

## 5. Formularios

### Modal de Creación
```tsx
<Dialog>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Crear Nuevo</DialogTitle>
      <DialogDescription>
        Complete los campos requeridos
      </DialogDescription>
    </DialogHeader>

    <form>
      {/* Campos */}
      <div className="space-y-4">
        <div>
          <Label>Campo *</Label>
          <Input />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t mt-6">
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-primary">Guardar</Button>
      </div>
    </form>
  </DialogContent>
</Dialog>
```

---

## 6. Estados Especiales

### Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12">
  <PackageOpen className="h-16 w-16 text-gray-400 mb-4" />
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No hay datos
  </h3>
  <p className="text-sm text-gray-600 text-center mb-6 max-w-md">
    Descripción del estado vacío
  </p>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Crear Primero
  </Button>
</div>
```

### Loading State
```tsx
// Spinner
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />

// Skeleton
<div className="animate-pulse bg-gray-200 rounded h-32" />
```

---

## 7. Responsive

### Breakpoints
- Mobile: < 640px (default)
- Tablet: >= 640px (`sm:`)
- Desktop: >= 1024px (`lg:`)

### Patrones Comunes
```tsx
// Grid responsive
className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"

// Ocultar en mobile
className="hidden lg:block"

// Stack en mobile, row en desktop
className="flex flex-col sm:flex-row gap-4"

// Sidebar: oculto en mobile, visible en desktop
className="hidden lg:flex lg:w-60"
```

---

## 8. Componentes por App

### Admin App
- Sidebar: Dashboard, Viajes, Flota, Estudiantes, Rutas, Usuarios, Incidentes, Reportes, Configuración
- Sin MobileNav (desktop-first)
- Stats Cards en páginas de lista

### Crew App
- Sidebar: Dashboard, Mis Viajes, Mapa, Check-in, Estudiantes, Incidentes, Historial, Perfil
- Con MobileNav (mobile-first)
- Role-based navigation filtering

### Parent App
- Sidebar: Dashboard, Seguimiento, Historial, Perfil
- Con MobileNav (mobile-first)
- Vista simplificada, solo lectura

---

## Referencias

- **Código de referencia**: `apps/crew/src/components/layout/`
- **Colores**: `apps/*/tailwind.config.ts`
- **Wireframes**: `docs/design/*_WIREFRAMES.md`
