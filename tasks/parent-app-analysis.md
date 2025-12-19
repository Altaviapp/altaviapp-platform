# Análisis Completo - App de Padres (Parent App)

**Fecha**: 2025-12-18
**Objetivo**: Identificar páginas con mockup data y planificar funcionalidad de gestión de hijos

---

## 1. Resumen Ejecutivo

### Estado Actual de las Páginas

| Página | Ruta | Estado | Fuente de Datos |
|--------|------|--------|-----------------|
| Dashboard | `/dashboard` | ✅ REAL | `useMyStudents()` → Convex |
| Tracking | `/tracking` | ✅ REAL | `useMyStudents()` + `useStudentTracking()` |
| Novedades | `/novedades` | ✅ REAL | `useMyNovedades()` → Convex |
| Novedades Create | `/novedades/create` | ✅ REAL | `useMyStudents()` + mutation |
| Student Location | `/students/[id]/location` | ✅ REAL | `useStudent()` + mutation |
| **Profile** | `/profile` | ❌ MOCK | 100% datos hardcoded |
| **History** | `/history` | ❌ MOCK | 100% datos hardcoded |
| **Notifications** | `/notifications` | ❌ MOCK | Ignora hook existente |
| **Settings** | `/settings` | ⚠️ LOCAL | Solo estado cliente |

### Faltantes Identificados

1. **No existe página `/students`** para listar y gestionar hijos
2. **No existe campo `photoUrl`** en el schema de students
3. **No hay funcionalidad de edición** de información de estudiantes para padres

---

## 2. Análisis Detallado por Página

### 2.1 Páginas con Datos Reales ✅

#### Dashboard (`/dashboard`)
- **Hook**: `useMyStudents()` → `api.students.listStudentsForParent`
- **Datos reales**: Lista de estudiantes del padre
- **Limitación**: El status se calcula en cliente basado en la hora del día (no viene de DB)

#### Tracking (`/tracking`)
- **Hooks**: `useMyStudents()` + `useStudentTracking()`
- **Datos reales**: Estudiantes + viaje activo con GPS en tiempo real
- **Limitación**: Info del conductor está hardcodeada ("Juan Pérez")

#### Novedades (`/novedades`, `/novedades/create`)
- **Hooks**: `useMyNovedades()`, `useNovedadesMutations()`
- **Datos reales**: Lista de novedades + creación

#### Student Location (`/students/[id]/location`)
- **Hooks**: `useStudent()` + `useStudentLocationMutation()`
- **Datos reales**: Fetch + actualización de ubicación

---

### 2.2 Páginas con Datos MOCK ❌

#### Profile (`/profile`) - 100% MOCK
```typescript
// Líneas 8-71: Datos completamente hardcodeados
const students = [
  {
    id: 1,
    name: 'Sofía García',
    grade: '5to Grado - Sección A',
    age: 10,
    birthDate: '15/03/2014',
    // ... todo hardcodeado
  },
  // ...
];
```

**Datos mock incluyen**:
- Información personal (nombre, edad, grado)
- Información de transporte (ruta, paradas, horarios)
- Estadísticas del mes (viajes, asistencia, puntualidad)
- Código QR (generado aleatoriamente en UI)
- Contactos de emergencia

#### History (`/history`) - 100% MOCK
```typescript
// Líneas 9-99: Historial de viajes hardcodeado
const tripHistory = [
  {
    date: 'Hoy - 03/12/2024',
    trips: [/* datos mock */],
  },
  // ...
];
```

#### Notifications (`/notifications`) - MOCK (ignora hook real)
```typescript
// Tiene disponible useNotifications() pero no lo usa
const notifications = [/* 7 notificaciones hardcodeadas */];
```

---

## 3. Schema de Students (Convex)

### Campos Actuales
```typescript
students: defineTable({
  institutionId: v.id("institutions"),
  firstName: v.string(),
  lastName: v.string(),
  grade: v.string(),
  dateOfBirth: v.number(),
  address: v.string(),
  homeLatitude: v.optional(v.number()),
  homeLongitude: v.optional(v.number()),
  parentPhone: v.string(),
  parentEmail: v.string(),
  parentName: v.string(),
  emergencyContact: v.string(),
  qrCode: v.string(),
  isActive: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
})
```

### Campos Faltantes para Funcionalidad Completa
- ❌ `photoUrl` - URL de foto de perfil (Convex storage)
- ❌ `photoStorageId` - ID del archivo en Convex storage
- ❌ `secondaryEmergencyContact` - Segundo contacto de emergencia

---

## 4. Hooks Existentes

### Disponibles en `apps/parent/src/hooks/`
```typescript
// Estudiantes
useMyStudents()           // ✅ Usado
useStudent(id)            // ✅ Usado
useStudentTracking(id)    // ✅ Usado
useStudentLocationMutation() // ✅ Usado

// Novedades
useMyNovedades()          // ✅ Usado
useNovedadesMutations()   // ✅ Usado

// Notificaciones
useNotifications()        // ❌ NO usado en página
useUnreadCount()          // ❌ NO usado
useNotificationMutations() // ❌ NO usado
```

---

## 5. Plan de Implementación

### Fase 1: Agregar campo de foto al schema
- [ ] Agregar `photoUrl` y `photoStorageId` a tabla students
- [ ] Crear mutation para subir foto (usando Convex storage)
- [ ] Crear mutation para actualizar info del estudiante

### Fase 2: Crear página de gestión de hijos (`/students`)
- [ ] `/students` - Lista de hijos con cards
- [ ] `/students/[id]` - Detalle del estudiante (reemplaza Profile)
- [ ] `/students/[id]/edit` - Edición de info + foto

### Fase 3: Migrar páginas mock a datos reales
- [ ] Profile → Redirigir a `/students` o integrar datos reales
- [ ] History → Crear query para historial de viajes
- [ ] Notifications → Usar `useNotifications()` hook existente

### Fase 4: Funcionalidades adicionales
- [ ] Upload de foto de perfil con preview
- [ ] Descarga de QR real del estudiante
- [ ] Edición de contactos de emergencia

---

## 6. Estructura de Archivos Propuesta

```
apps/parent/src/app/(dashboard)/students/
├── page.tsx                    # Lista de hijos
├── [id]/
│   ├── page.tsx               # Detalle del estudiante
│   ├── edit/
│   │   └── page.tsx           # Editar estudiante + foto
│   └── location/
│       └── page.tsx           # (existente) Editar ubicación

apps/parent/src/components/students/
├── StudentCard.tsx             # Card para lista
├── StudentDetail.tsx           # Vista detalle
├── StudentEditForm.tsx         # Formulario edición
└── PhotoUpload.tsx             # Componente upload foto

apps/parent/src/hooks/
├── useStudents.ts              # (actualizar con más queries)
└── useStudentMutations.ts      # Mutaciones para edición
```

---

## 7. Cambios en Backend (Convex)

### Schema Updates
```typescript
// convex/schema.ts - students table
photoUrl: v.optional(v.string()),
photoStorageId: v.optional(v.id("_storage")),
```

### Nuevas Mutations
```typescript
// convex/students.ts
updateStudentByParent()     // Actualizar info básica
uploadStudentPhoto()        // Subir foto a storage
deleteStudentPhoto()        // Eliminar foto
```

### Nuevas Queries
```typescript
// convex/students.ts
getStudentWithRouteInfo()   // Estudiante + info de ruta asignada

// convex/trips.ts
getTripHistoryForStudent()  // Historial de viajes del estudiante
```

---

## 8. Priorización

1. **Alta Prioridad** (Core): Página `/students` con lista y detalle
2. **Alta Prioridad** (Core): Edición de información básica
3. **Media Prioridad**: Upload de foto de perfil
4. **Media Prioridad**: Migrar History a datos reales
5. **Baja Prioridad**: Migrar Notifications (ya tiene hook)
6. **Baja Prioridad**: Deprecar Profile o redirigir
