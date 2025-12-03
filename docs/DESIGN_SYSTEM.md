# Sistema de Diseño - Altaviapp Crew PWA

**Basado en el estilo de dashboard administrativo de Bubble.io**
**Fecha**: Noviembre 2025

---

## Índice

1. [Paleta de Colores](#1-paleta-de-colores)
2. [Tipografía](#2-tipografía)
3. [Espaciado y Grid](#3-espaciado-y-grid)
4. [Componentes Base](#4-componentes-base)
5. [Patrones de Layout](#5-patrones-de-layout)
6. [Estados Visuales](#6-estados-visuales)
7. [Iconografía](#7-iconografía)
8. [Animaciones](#8-animaciones)

---

## 1. Paleta de Colores

### Colores Principales

```typescript
// tailwind.config.ts
const colors = {
  // Brand Colors
  primary: {
    DEFAULT: '#042940', // Azul oscuro profundo
    50: '#E6F0F5',
    100: '#CCE1EB',
    200: '#99C3D7',
    300: '#66A5C3',
    400: '#3387AF',
    500: '#042940', // Base
    600: '#032133',
    700: '#021926',
    800: '#02101A',
    900: '#01080D',
  },
  accent: {
    DEFAULT: '#DBF227', // Amarillo-verde lima
    50: '#FEFEF3',
    100: '#FDFDE7',
    200: '#FAFBCF',
    300: '#F7F9B7',
    400: '#F4F79F',
    500: '#DBF227', // Base
    600: '#C4D917',
    700: '#9CAF12',
    800: '#74840E',
    900: '#4C5909',
  },
  white: {
    DEFAULT: '#F7FCFF', // Blanco azulado
    pure: '#FFFFFF',
  },

  // Colores Funcionales (basados en las imágenes)
  success: {
    DEFAULT: '#10B981', // Verde (para badges "Activas")
    light: '#D1FAE5',
    dark: '#047857',
  },
  info: {
    DEFAULT: '#3B82F6', // Azul (para badges "Ida y Vuelta")
    light: '#DBEAFE',
    dark: '#1E40AF',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FEF3C7',
    dark: '#D97706',
  },
  error: {
    DEFAULT: '#EF4444',
    light: '#FEE2E2',
    dark: '#DC2626',
  },

  // Grises (del estilo Bubble.io)
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
}
```

### Uso de Colores

#### Fondos
- **Background principal**: `white` (#F7FCFF)
- **Sidebar**: `primary-500` (#042940)
- **Cards/Containers**: `white-pure` (#FFFFFF)
- **Hover en tabla**: `gray-50` (#F9FAFB)

#### Texto
- **Texto principal**: `gray-900` (#111827)
- **Texto secundario**: `gray-600` (#4B5563)
- **Texto en sidebar**: `white` (#F7FCFF)
- **Enlaces**: `info` (#3B82F6)

#### Botones
- **Primario**: `primary-500` background, `white` text
- **Secundario**: `white-pure` background, `primary-500` border y text
- **Acento**: `accent-500` background, `primary-900` text
- **Destructivo**: `error` background, `white` text

#### Badges/Pills
- **Activo/Exitoso**: `success` background, `success-dark` text
- **Info**: `info` background, `white` text
- **Advertencia**: `warning-light` background, `warning-dark` text
- **Error**: `error-light` background, `error-dark` text

---

## 2. Tipografía

### Fuentes

```typescript
// Similar al estilo Bubble.io - usar Inter o similar
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
});
```

### Escala Tipográfica

```css
/* Basado en el diseño mostrado */
--text-xs: 0.75rem;    /* 12px - Labels pequeños */
--text-sm: 0.875rem;   /* 14px - Texto secundario, tabla */
--text-base: 1rem;     /* 16px - Texto principal */
--text-lg: 1.125rem;   /* 18px - Subtítulos */
--text-xl: 1.25rem;    /* 20px - Títulos de sección */
--text-2xl: 1.5rem;    /* 24px - Títulos principales */
--text-3xl: 1.875rem;  /* 30px - Títulos grandes */
```

### Pesos

- **Regular (400)**: Texto general
- **Medium (500)**: Texto destacado, labels
- **Semibold (600)**: Subtítulos, headers de tabla
- **Bold (700)**: Títulos principales, botones

### Ejemplos de Uso

```tsx
// Título de página (como "Gestión Rutas")
<h1 className="text-2xl font-semibold text-gray-900">
  Gestión Rutas
</h1>

// Header de tabla
<th className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
  Ruta
</th>

// Contenido de celda
<td className="text-sm text-gray-900">
  Zona 1 - Escuela A
</td>

// Texto secundario
<span className="text-sm text-gray-600">
  C. Hernández
</span>

// Badge
<span className="text-xs font-medium">
  Activas
</span>
```

---

## 3. Espaciado y Grid

### Sistema de Espaciado (basado en 4px)

```css
/* Tailwind usa este sistema por defecto */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

### Layout Principal

```
┌─────────────────────────────────────────────┐
│ [Sidebar - 240px]  [Content - flex-1]       │
│                                              │
│  Logo              Header (h: 64px)         │
│                    ────────────────          │
│  User Profile                                │
│  ────────────      Content Area             │
│  Nav Menu          (padding: 24px)          │
│                                              │
│                    Cards/Tables             │
│                                              │
└─────────────────────────────────────────────┘
```

### Medidas Clave

- **Sidebar width**: 240px (fijo en desktop, full en mobile)
- **Header height**: 64px
- **Content padding**: 24px (desktop), 16px (mobile)
- **Card padding**: 20px (desktop), 16px (mobile)
- **Gap entre cards**: 24px
- **Border radius cards**: 8px
- **Border radius buttons**: 6px
- **Border radius badges**: 12px (pill)

---

## 4. Componentes Base

### 4.1 Sidebar (Estilo Bubble.io)

```tsx
// Características del diseño mostrado:
// - Fondo azul oscuro (#042940)
// - Logo arriba
// - Perfil de usuario con foto circular
// - Items de menú con iconos
// - Item activo con fondo más claro
// - Configuraciones y logout al final

<aside className="w-60 bg-primary-500 min-h-screen flex flex-col">
  {/* Logo */}
  <div className="p-6">
    <Logo className="text-white" />
  </div>

  {/* User Profile */}
  <div className="px-6 py-4 border-b border-primary-400/30">
    <div className="flex items-center gap-3">
      <Avatar className="w-10 h-10">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-accent text-primary-900">
          {user.initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {user.name}
        </p>
        <p className="text-xs text-white/70 truncate">
          {user.email}
        </p>
      </div>
    </div>
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4 space-y-1">
    <NavItem icon={Home} label="Inicio" active />
    <NavItem icon={Truck} label="Gestión Flota" />
    <NavItem icon={Route} label="Rutas" />
    <NavItem icon={Users} label="Alumnos" />
  </nav>

  {/* Footer Actions */}
  <div className="px-3 py-4 border-t border-primary-400/30 space-y-1">
    <NavItem icon={Settings} label="Configuraciones" />
    <NavItem icon={LogOut} label="Cerrar Sesión" />
  </div>
</aside>

// NavItem Component
function NavItem({ icon: Icon, label, active }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
        "text-sm font-medium",
        active
          ? "bg-primary-400/30 text-white"
          : "text-white/80 hover:bg-primary-400/20 hover:text-white"
      )}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );
}
```

### 4.2 Header de Página

```tsx
// Basado en el estilo mostrado en la imagen
<header className="bg-white border-b border-gray-200 px-6 py-4">
  <div className="flex items-center justify-between">
    {/* Breadcrumb + Título */}
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon">
        <Menu className="w-5 h-5" />
      </Button>

      <div>
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
          <span>Gestión Rutas</span>
        </div>
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <Route className="w-6 h-6 text-primary-500" />
          Gestión Rutas
        </h1>
      </div>
    </div>

    {/* Actions */}
    <Button className="bg-primary-500 hover:bg-primary-600">
      <Plus className="w-4 h-4 mr-2" />
      Crear Ruta
    </Button>
  </div>
</header>
```

### 4.3 Card Container

```tsx
// Card estilo similar al contenedor de la tabla
<Card className="bg-white rounded-lg shadow-sm border border-gray-200">
  <CardHeader className="px-6 py-4 border-b border-gray-200">
    <div className="flex items-center justify-between">
      <CardTitle className="text-lg font-semibold text-gray-900">
        Título de Card
      </CardTitle>
      <Badge variant="success">
        <Zap className="w-3 h-3 mr-1" />
        Activas
      </Badge>
    </div>
  </CardHeader>
  <CardContent className="p-6">
    {/* Contenido */}
  </CardContent>
</Card>
```

### 4.4 Table (Estilo Bubble.io)

```tsx
// Características observadas:
// - Headers con texto uppercase pequeño
// - Filas con hover sutil
// - Badges coloridos para estados
// - Buen espaciado entre celdas

<Table>
  <TableHeader>
    <TableRow className="border-b border-gray-200 bg-gray-50">
      <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Ruta
      </TableHead>
      <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Horario
      </TableHead>
      <TableHead className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
        Tipo
      </TableHead>
      {/* ... más headers */}
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <TableCell className="py-4 text-sm font-medium text-gray-900">
        Zona 1 - Escuela A
      </TableCell>
      <TableCell className="py-4 text-sm text-gray-600">
        <div>13:30</div>
        <div className="text-xs text-gray-500">14:30</div>
      </TableCell>
      <TableCell className="py-4">
        <Badge variant="info">Ida y Vuelta</Badge>
      </TableCell>
      {/* ... más celdas */}
    </TableRow>
  </TableBody>
</Table>
```

### 4.5 Badges/Pills

```tsx
// Variantes basadas en las imágenes
const badgeVariants = {
  success: "bg-success-light text-success-dark border-success",
  info: "bg-info text-white border-info",
  warning: "bg-warning-light text-warning-dark border-warning",
  error: "bg-error-light text-error-dark border-error",
  default: "bg-gray-100 text-gray-700 border-gray-200",
};

// Componente Badge
<Badge variant="success" className="px-3 py-1 rounded-full">
  <Zap className="w-3 h-3 mr-1.5" />
  Activas
</Badge>

<Badge variant="info" className="px-3 py-1 rounded-full">
  Ida y Vuelta
</Badge>
```

### 4.6 Buttons

```tsx
// Primario (estilo del botón "Crear Ruta")
<Button className="bg-primary-500 hover:bg-primary-600 text-white font-medium px-4 py-2 rounded-lg shadow-sm transition-colors">
  <Plus className="w-4 h-4 mr-2" />
  Crear Ruta
</Button>

// Secundario
<Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
  Cancelar
</Button>

// Con acento
<Button className="bg-accent-500 hover:bg-accent-600 text-primary-900 font-semibold">
  Iniciar Viaje
</Button>

// Destructivo
<Button variant="destructive" className="bg-error hover:bg-error-dark">
  Eliminar
</Button>
```

### 4.7 Form Inputs

```tsx
// Input estilo limpio y profesional
<div className="space-y-2">
  <Label className="text-sm font-medium text-gray-700">
    Nombre de la Ruta
  </Label>
  <Input
    className="border-gray-300 focus:border-primary-500 focus:ring-primary-500 rounded-lg"
    placeholder="Ej: Zona 1 - Escuela A"
  />
</div>

// Select
<Select>
  <SelectTrigger className="border-gray-300 rounded-lg">
    <SelectValue placeholder="Seleccione..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Opción 1</SelectItem>
    <SelectItem value="2">Opción 2</SelectItem>
  </SelectContent>
</Select>
```

---

## 5. Patrones de Layout

### 5.1 Layout Principal (Desktop)

```tsx
// app/layout.tsx estilo
export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 bg-white overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
```

### 5.2 Layout de Tabla (como en la imagen)

```tsx
<div className="space-y-6">
  {/* Header con badge y botón */}
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-gray-900">Rutas</h2>
      <Badge variant="success">
        <Zap className="w-3 h-3 mr-1" />
        Activas
      </Badge>
    </div>
    <Button>
      <Plus className="w-4 h-4 mr-2" />
      Crear Ruta
    </Button>
  </div>

  {/* Filtros (opcional) */}
  <div className="flex items-center gap-3">
    <Button variant="outline" size="icon">
      <Filter className="w-4 h-4" />
    </Button>
    {/* Más filtros */}
  </div>

  {/* Tabla */}
  <Card>
    <Table>
      {/* ... */}
    </Table>
  </Card>
</div>
```

### 5.3 Layout de Formulario

```tsx
<Card className="max-w-2xl mx-auto">
  <CardHeader>
    <CardTitle>Información del Vehículo</CardTitle>
    <CardDescription>Complete los datos básicos</CardDescription>
  </CardHeader>

  <CardContent className="space-y-6">
    {/* Tabs si aplica */}
    <Tabs defaultValue="general">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="docs">Documentación</TabsTrigger>
        <TabsTrigger value="mant">Mantenimiento</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-4">
        {/* Campos del formulario */}
      </TabsContent>
    </Tabs>
  </CardContent>

  <CardFooter className="flex justify-end gap-3 border-t pt-6">
    <Button variant="outline">Cancelar</Button>
    <Button>Guardar Cambios</Button>
  </CardFooter>
</Card>
```

### 5.4 Grid de Cards (Dashboard)

```tsx
// Para estadísticas o cards de resumen
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <StatCard
    title="Viajes Hoy"
    value="12"
    icon={Truck}
    trend="+2"
    trendUp
  />
  <StatCard
    title="Estudiantes"
    value="340"
    icon={Users}
  />
  {/* ... más cards */}
</div>
```

---

## 6. Estados Visuales

### 6.1 Estados de Elementos Interactivos

```tsx
// Botón
const buttonStates = `
  /* Default */
  bg-primary-500 text-white

  /* Hover */
  hover:bg-primary-600

  /* Active/Pressed */
  active:bg-primary-700

  /* Focus */
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2

  /* Disabled */
  disabled:opacity-50 disabled:cursor-not-allowed
`;

// Fila de tabla
const tableRowStates = `
  /* Default */
  border-b border-gray-100

  /* Hover */
  hover:bg-gray-50

  /* Selected (si aplica) */
  aria-selected:bg-primary-50
`;

// Input
const inputStates = `
  /* Default */
  border-gray-300 bg-white

  /* Focus */
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20

  /* Error */
  border-error focus:border-error focus:ring-error/20

  /* Disabled */
  disabled:bg-gray-100 disabled:cursor-not-allowed
`;
```

### 6.2 Estados de Datos

```tsx
// Badge de estado
function StatusBadge({ status }) {
  const variants = {
    active: { variant: 'success', label: 'Activo', icon: Check },
    inactive: { variant: 'default', label: 'Inactivo', icon: X },
    maintenance: { variant: 'warning', label: 'Mantenimiento', icon: Wrench },
    error: { variant: 'error', label: 'Error', icon: AlertCircle },
  };

  const { variant, label, icon: Icon } = variants[status];

  return (
    <Badge variant={variant}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}
```

### 6.3 Loading States

```tsx
// Skeleton para tablas
<TableRow>
  <TableCell><Skeleton className="h-4 w-32" /></TableCell>
  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
  <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
</TableRow>

// Spinner para botones
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Cargando...
</Button>
```

---

## 7. Iconografía

### 7.1 Librería

**IMPORTANTE**: Usar **Lucide React** exclusivamente, NO emojis.

```bash
npm install lucide-react
```

**Razones**:
- ✅ Consistencia visual en todos los dispositivos
- ✅ Escalabilidad sin pérdida de calidad
- ✅ Control total sobre color y tamaño
- ✅ Mejor accesibilidad
- ❌ NO usar emojis (renders inconsistentes entre navegadores/dispositivos)

### 7.2 Tamaños

```tsx
// Icono en sidebar nav: w-5 h-5 (20px)
<Home className="w-5 h-5" />

// Icono en botón: w-4 h-4 (16px)
<Plus className="w-4 h-4 mr-2" />

// Icono en badge: w-3 h-3 (12px)
<Zap className="w-3 h-3 mr-1" />

// Icono de header grande: w-6 h-6 (24px)
<Route className="w-6 h-6" />
```

### 7.3 Iconos por Sección

```tsx
// Navegación
import {
  Home,          // Inicio
  Truck,         // Gestión Flota
  Route,         // Rutas
  Users,         // Alumnos
  Settings,      // Configuraciones
  LogOut,        // Cerrar Sesión
} from 'lucide-react';

// Acciones
import {
  Plus,          // Crear
  Edit,          // Editar
  Trash2,        // Eliminar
  Filter,        // Filtrar
  Search,        // Buscar
  Download,      // Descargar
  Upload,        // Subir
} from 'lucide-react';

// Estados
import {
  Check,         // Éxito/Completado
  X,             // Error/Cancelado
  AlertCircle,   // Advertencia
  Info,          // Información
  Zap,           // Activo
  Clock,         // Pendiente
} from 'lucide-react';

// PWA específicos
import {
  MapPin,        // GPS/Ubicación
  Navigation,    // Navegación
  QrCode,        // Escaneo QR
  Camera,        // Cámara
  Bell,          // Notificaciones
  Phone,         // Teléfono
} from 'lucide-react';
```

---

## 8. Animaciones

### 8.1 Transiciones Sutiles

```tsx
// Hover transitions (rápidas y suaves)
className="transition-colors duration-150"
className="transition-all duration-200"

// Page transitions
className="animate-in fade-in slide-in-from-bottom-4 duration-300"

// Modal/Dialog
className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
```

### 8.2 Micro-interacciones

```tsx
// Botón con efecto de escala sutil
<Button className="transition-transform active:scale-[0.98]">
  Click
</Button>

// Card con elevación en hover
<Card className="transition-shadow hover:shadow-lg">
  {/* ... */}
</Card>

// Badge con animación de entrada
<Badge className="animate-in fade-in zoom-in-95 duration-200">
  New
</Badge>
```

### 8.3 Loading/Skeleton

```tsx
// Skeleton pulse
<Skeleton className="animate-pulse" />

// Spinner rotation
<Loader2 className="animate-spin" />

// Dots loading
<span className="flex gap-1">
  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
  <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
</span>
```

---

## 9. Responsive Design

### 9.1 Breakpoints

```typescript
// Tailwind breakpoints por defecto
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet portrait
  lg: '1024px',  // Tablet landscape / Desktop
  xl: '1280px',  // Desktop
  '2xl': '1536px', // Large desktop
};
```

### 9.2 Patrones Responsive

```tsx
// Sidebar colapsable en mobile
<aside className="
  fixed md:relative
  w-full md:w-60
  h-screen
  transform transition-transform
  -translate-x-full md:translate-x-0
  data-[open=true]:translate-x-0
">
  {/* Sidebar content */}
</aside>

// Grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
  {/* Cards */}
</div>

// Tabla responsive (scroll horizontal en mobile)
<div className="overflow-x-auto -mx-6 md:mx-0">
  <Table className="min-w-full md:min-w-0">
    {/* ... */}
  </Table>
</div>

// Padding responsive
<main className="p-4 md:p-6 lg:p-8">
  {/* Content */}
</main>
```

---

## 10. Accesibilidad

### 10.1 Contraste

Todos los colores cumplen con WCAG AA:
- Texto sobre fondo blanco: ratio mínimo 4.5:1
- Texto grande: ratio mínimo 3:1
- Primary (#042940) sobre white: 15.3:1 ✅
- Accent (#DBF227) sobre primary: 11.2:1 ✅

### 10.2 Focus Visible

```tsx
// Todos los elementos interactivos deben tener focus visible
className="focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
```

### 10.3 Semántica HTML

```tsx
// Usar elementos semánticos
<nav aria-label="Main navigation">
  {/* Links */}
</nav>

<main aria-label="Main content">
  {/* Content */}
</main>

// Labels para inputs
<Label htmlFor="route-name">Nombre de Ruta</Label>
<Input id="route-name" />

// Aria labels para iconos
<Button aria-label="Crear nueva ruta">
  <Plus className="w-4 h-4" />
</Button>
```

---

## Resumen de Implementación

### Prioridades

1. **Configurar Tailwind** con la paleta de colores
2. **Customizar shadcn/ui** components con los estilos definidos
3. **Crear componentes base** (Sidebar, Header, Card, Table, Badge)
4. **Implementar layouts** principales
5. **Agregar iconografía** consistente
6. **Aplicar responsive** patterns
7. **Testing de accesibilidad**

### Archivos a Modificar

- `tailwind.config.ts` - Colores y tema
- `src/components/ui/*` - Componentes shadcn customizados
- `src/components/layout/*` - Layout components (Sidebar, Header)
- `src/app/layout.tsx` - Layout principal
- `src/app/globals.css` - CSS variables y utilidades

---

**Siguiente paso**: Configurar Tailwind y crear los componentes base siguiendo este sistema de diseño.
