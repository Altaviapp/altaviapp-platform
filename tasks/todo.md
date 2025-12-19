# TODO: Implementación Página de Hijos - Parent App

**Fecha**: 2025-12-18
**Módulo**: parent-app / students

---

## Plan de Implementación

### Fase 1: Backend - Schema y Mutaciones
- [ ] Agregar campos `photoUrl` y `photoStorageId` al schema de students
- [ ] Crear mutation `updateStudentByParent` para editar info básica
- [ ] Crear mutation `generateUploadUrl` para subir foto
- [ ] Crear mutation `updateStudentPhoto` para guardar URL de foto
- [ ] Crear query `getStudentWithDetails` (estudiante + ruta + stats básicas)

### Fase 2: Frontend - Página de Lista de Hijos
- [ ] Crear `/students/page.tsx` - Lista de hijos con cards
- [ ] Crear componente `StudentCard.tsx` con foto, nombre, grado, estado
- [ ] Agregar navegación en Sidebar y MobileNav

### Fase 3: Frontend - Página de Detalle
- [ ] Crear `/students/[id]/page.tsx` - Vista detalle del estudiante
- [ ] Mostrar: info personal, transporte asignado, QR real, contactos
- [ ] Botón para editar → `/students/[id]/edit`

### Fase 4: Frontend - Página de Edición
- [ ] Crear `/students/[id]/edit/page.tsx` - Formulario de edición
- [ ] Implementar `PhotoUpload.tsx` con preview y upload a Convex storage
- [ ] Campos editables: foto, dirección, contacto emergencia
- [ ] Validación con Zod

### Fase 5: Hooks y Integración
- [ ] Crear `useStudentMutations()` hook para edición
- [ ] Actualizar `useStudent()` para incluir foto
- [ ] Integrar con datos reales

### Fase 6: Cleanup - Migrar páginas mock
- [ ] Notifications: usar `useNotifications()` existente
- [ ] History: crear query y migrar datos
- [ ] Profile: redirigir a `/students` o deprecar

---

## Notas de Implementación

### Permisos de Edición para Padres
Los padres solo pueden editar campos limitados:
- Foto de perfil
- Dirección del hogar (ya existe en student location)
- Contacto de emergencia secundario

**NO pueden editar**: nombre, grado, fecha nacimiento (solo admin)

### Upload de Foto
- Usar Convex storage (`_storage`)
- Límite: 5MB
- Formatos: JPG, PNG, WebP
- Comprimir antes de subir (client-side)

### Navegación
```
Sidebar:
- Dashboard
- Tracking
- Hijos (NUEVO) ← /students
- Novedades
- Historial
- Notificaciones
```

---

## Review (post-implementación)

### Cambios Realizados - 2025-12-18

**Backend (Convex):**
1. `convex/schema.ts`: Agregados campos `photoStorageId` y `emergencyContactSecondary` a tabla students
2. `convex/students.ts`: 6 nuevas funciones:
   - `updateStudentByParent` - Edición limitada por padres
   - `generatePhotoUploadUrl` - URL para upload de foto
   - `saveStudentPhoto` - Guardar referencia de foto
   - `deleteStudentPhoto` - Eliminar foto
   - `getStudentWithPhoto` - Query con URL de foto
   - `listStudentsForParentWithPhotos` - Lista con fotos
3. `convex/trips.ts`: Query `getTripHistoryForStudent` para historial

**Frontend (Parent App):**
1. **Hooks** (`apps/parent/src/hooks/useMyStudents.ts`):
   - `useMyStudentsWithPhotos`
   - `useStudentWithPhoto`
   - `useStudentMutations`
   - `useTripHistory`

2. **Nuevas Páginas**:
   - `/students` - Lista de hijos con cards
   - `/students/[id]` - Detalle del estudiante con QR real
   - `/students/[id]/edit` - Edición con upload de foto

3. **Páginas Migradas a Datos Reales**:
   - `/history` - Ahora usa datos reales de Convex
   - `/notifications` - Ahora usa hook existente
   - `/profile` - Redirige a `/students`

4. **Navegación Actualizada**:
   - `Sidebar.tsx` - Agregado "Mis Hijos" → `/students`
   - `MobileNav.tsx` - Agregado "Hijos" → `/students`

**Dependencias Agregadas**:
- `qrcode` - Generación de códigos QR
- `@types/qrcode` - Tipos TypeScript

### Verificación
- [x] Type check del parent app pasa sin errores
- [x] Dependencias instaladas correctamente

### Archivos Modificados
```
convex/schema.ts
convex/students.ts
convex/trips.ts
apps/parent/package.json
apps/parent/src/hooks/useMyStudents.ts
apps/parent/src/hooks/index.ts
apps/parent/src/components/layout/Sidebar.tsx
apps/parent/src/components/layout/MobileNav.tsx
apps/parent/src/app/(dashboard)/students/page.tsx (nuevo)
apps/parent/src/app/(dashboard)/students/[id]/page.tsx (nuevo)
apps/parent/src/app/(dashboard)/students/[id]/edit/page.tsx (nuevo)
apps/parent/src/app/(dashboard)/history/page.tsx
apps/parent/src/app/(dashboard)/notifications/page.tsx
apps/parent/src/app/(dashboard)/profile/page.tsx
```
