# Plan de Testing de Integración - Altaviapp (LIVE)

**Versión**: 2.0
**Fecha**: Diciembre 2024
**Tipo**: Testing en Producción (desde cero)
**Objetivo**: Validar flujo completo de usuario desde creación de institución hasta operación de viajes

---

## Resumen del Escenario de Prueba

### Usuarios de Testing

| Rol | Email | App | Descripción |
|-----|-------|-----|-------------|
| **Admin** | `desarrollo@altaviapp.com` | Admin | Crea institución, invita usuarios |
| **Parent 1** | `onedreamto@gmail.com` | Parent | 1 estudiante |
| **Parent 2** | `admin@ceibatic.com` | Parent | 2 estudiantes |
| **Driver 1** | `christiangoye@gmail.com` | Crew | Conductor principal |
| **Driver 2** | `luis.alvrz.la@gmail.com` | Crew | Conductor secundario |
| **Monitor** | `altaviappdev@gmail.com` | Crew | Monitor |

### Estudiantes a Crear

| # | Nombre | Parent | Email Padre | Grado |
|---|--------|--------|-------------|-------|
| 1 | Estudiante Alpha | Parent 1 | onedreamto@gmail.com | 5to A |
| 2 | Estudiante Beta | Parent 2 | admin@ceibatic.com | 4to B |
| 3 | Estudiante Gamma | Parent 2 | admin@ceibatic.com | 6to A |

### Rutas a Crear

| Ruta | Tipo | Recurrencia | Estudiantes | Horario |
|------|------|-------------|-------------|---------|
| Ruta Norte AM | pickup | Lun-Vie | Alpha, Beta, Gamma (3) | 07:00 |
| Ruta Norte PM | dropoff | Lun-Vie | Alpha, Beta, Gamma (3) | 14:00 |
| Ruta Especial Domingo | pickup | Una vez (domingo) | Alpha, Beta (2) | 09:00 |

### URLs de Producción

| App | URL |
|-----|-----|
| Admin | `https://admin.altaviapp.com` |
| Parent | `https://padres.altaviapp.com` |
| Crew | `https://crew.altaviapp.com` |

---

## Fase 1: Creación de Institución (Admin App)

### 1.1 Registro de Nueva Institución

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `https://admin.altaviapp.com/signup` | Página de registro | ☐ |
| 2 | Llenar datos de institución: | | |
| | - Nombre: `Escuela Demo Testing` | Campo llenado | ☐ |
| | - Email Admin: `desarrollo@altaviapp.com` | Campo validado | ☐ |
| | - Contraseña: `[tu contraseña]` | Campo llenado | ☐ |
| | - Confirmar contraseña | Coincide | ☐ |
| 3 | Aceptar términos | Checkbox marcado | ☐ |
| 4 | Click "Crear Cuenta" | Toast de éxito | ☐ |
| 5 | Verificar email (si aplica) | Link en correo | ☐ |
| 6 | Login con credenciales | Redirige a `/dashboard` | ☐ |

### 1.2 Configuración Inicial de Institución

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/settings` | Página de configuración | ☐ |
| 2 | Click en mapa para ubicar escuela | Pin en ubicación real | ☐ |
| 3 | Guardar ubicación | Toast de éxito | ☐ |
| 4 | Verificar coordenadas | Lat/Long correctos | ☐ |

### 1.3 Configuración de Grados

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/settings/grades` | Lista de grados (vacía) | ☐ |
| 2 | Crear grados necesarios: | | |
| | - `5to A` | Grado creado | ☐ |
| | - `4to B` | Grado creado | ☐ |
| | - `6to A` | Grado creado | ☐ |
| 3 | Verificar 3 grados en lista | Lista actualizada | ☐ |

### 1.4 Verificar Tipos de Novedad

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/settings/novedades` | Lista de tipos | ☐ |
| 2 | Verificar tipos de sistema: | | |
| | - Ausencia | ✓ | ☐ |
| | - Recoge Padre | ✓ | ☐ |
| | - Cambio de Parada | ✓ | ☐ |
| 3 | (Opcional) Crear tipo personalizado | Tipo creado | ☐ |

---

## Fase 2: Configuración de Flota (Admin App)

### 2.1 Crear Vehículo 1 (Principal)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` → Tab Vehículos | Lista vacía | ☐ |
| 2 | Click "Nuevo Vehículo" | Formulario | ☐ |
| 3 | Llenar datos: | | |
| | - Placa: `TES-001` | Campo validado | ☐ |
| | - Marca: `Toyota` | Campo llenado | ☐ |
| | - Modelo: `Hiace` | Campo llenado | ☐ |
| | - Año: `2023` | Campo validado | ☐ |
| | - Capacidad: `15` | Campo validado | ☐ |
| 4 | Click "Guardar" | Toast éxito, vehículo en lista | ☐ |

**Vehículo 1 ID:** `________________`

### 2.2 Crear Vehículo 2 (Secundario)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nuevo Vehículo" | Formulario | ☐ |
| 2 | Llenar datos: | | |
| | - Placa: `TES-002` | Campo validado | ☐ |
| | - Marca: `Hyundai` | Campo llenado | ☐ |
| | - Modelo: `H350` | Campo llenado | ☐ |
| | - Año: `2022` | Campo validado | ☐ |
| | - Capacidad: `20` | Campo validado | ☐ |
| 3 | Click "Guardar" | Toast éxito | ☐ |

**Vehículo 2 ID:** `________________`

---

## Fase 3: Invitación de Usuarios (Admin App)

> **IMPORTANTE**: Los conductores y monitores NO se crean directamente.
> Se envía una invitación con código que el usuario usa para registrarse en Crew App.

### 3.1 Invitar Driver 1 (christiangoye@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` → Tab Conductores | Lista vacía | ☐ |
| 2 | Click "Invitar Conductor" | Formulario de invitación | ☐ |
| 3 | Llenar datos: | | |
| | - Email: `christiangoye@gmail.com` | Campo validado | ☐ |
| | - Nombre: `Christian` (opcional) | Campo llenado | ☐ |
| | - Apellido: `Goye` (opcional) | Campo llenado | ☐ |
| 4 | Click "Enviar Invitación" | Toast: "Invitación enviada" | ☐ |
| 5 | Verificar en lista | Status: "Invitado" | ☐ |
| 6 | **Anotar código de invitación** | Código visible en modal/lista | ☐ |

**Código invitación Driver 1:** `________________`

### 3.2 Invitar Driver 2 (luis.alvrz.la@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Invitar Conductor" | Formulario | ☐ |
| 2 | Email: `luis.alvrz.la@gmail.com` | Campo validado | ☐ |
| 3 | Nombre: `Luis Álvarez` | Campo llenado | ☐ |
| 4 | Click "Enviar Invitación" | Toast éxito | ☐ |

**Código invitación Driver 2:** `________________`

### 3.3 Invitar Monitor (altaviappdev@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` → Tab Monitores | Lista vacía | ☐ |
| 2 | Click "Invitar Monitor" | Formulario | ☐ |
| 3 | Email: `altaviappdev@gmail.com` | Campo validado | ☐ |
| 4 | Nombre: `Altaviapp Dev` | Campo llenado | ☐ |
| 5 | Click "Enviar Invitación" | Toast éxito | ☐ |

**Código invitación Monitor:** `________________`

---

## Fase 4: Registro de Crew (Crew App)

> Los usuarios invitados deben registrarse usando su código de invitación.

### 4.1 Registro Driver 1 (christiangoye@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `https://crew.altaviapp.com/signup` | Página de registro | ☐ |
| 2 | Ingresar código de invitación | Código validado | ☐ |
| 3 | Llenar datos: | | |
| | - Email: `christiangoye@gmail.com` | Pre-llenado o validado | ☐ |
| | - Nombre completo | Campo llenado | ☐ |
| | - Contraseña | Campo llenado | ☐ |
| 4 | Click "Crear Cuenta" | Toast éxito | ☐ |
| 5 | Login automático o manual | Redirige a `/dashboard` | ☐ |
| 6 | Verificar rol: "Conductor" | Badge visible | ☐ |

### 4.2 Verificar en Admin App

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin App: `/fleet` → Conductores | Lista actualizada | ☐ |
| 2 | Ver Christian Goye | Status: "Activo" (no "Invitado") | ☐ |
| 3 | Verificar datos completos | Perfil auto-creado | ☐ |

### 4.3 Registro Driver 2 (luis.alvrz.la@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew App: `/signup` con código | Registro exitoso | ☐ |
| 2 | Login | Dashboard visible | ☐ |
| 3 | Admin: Verificar status activo | Conductor en lista | ☐ |

### 4.4 Registro Monitor (altaviappdev@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew App: `/signup` con código monitor | Registro exitoso | ☐ |
| 2 | Login | Dashboard visible | ☐ |
| 3 | Verificar rol: "Monitor" | Badge visible | ☐ |
| 4 | Admin: Verificar status activo | Monitor en lista | ☐ |

---

## Fase 5: Creación de Estudiantes (Admin App)

### 5.1 Estudiante Alpha (Parent 1)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/students` | Lista vacía | ☐ |
| 2 | Click "Nuevo Estudiante" | Formulario | ☐ |
| 3 | Llenar datos: | | |
| | - Nombre: `Alpha` | Campo llenado | ☐ |
| | - Apellido: `Testing` | Campo llenado | ☐ |
| | - Grado: `5to A` | Selector | ☐ |
| | - Email Padre: `onedreamto@gmail.com` | Campo validado | ☐ |
| | - Teléfono: `0991111111` | Campo validado | ☐ |
| 4 | Click en mapa para ubicar hogar | Pin seleccionado | ☐ |
| 5 | Click "Guardar" | Toast éxito | ☐ |

**Estudiante Alpha ID:** `________________`
**Ubicación:** `________________`

### 5.2 Estudiante Beta (Parent 2 - hijo 1)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nuevo Estudiante" | Formulario | ☐ |
| 2 | Llenar datos: | | |
| | - Nombre: `Beta` | Campo llenado | ☐ |
| | - Apellido: `Testing` | Campo llenado | ☐ |
| | - Grado: `4to B` | Selector | ☐ |
| | - Email Padre: `admin@ceibatic.com` | Campo validado | ☐ |
| | - Teléfono: `0992222222` | Campo validado | ☐ |
| 3 | Ubicar hogar en mapa | Ubicación diferente | ☐ |
| 4 | Click "Guardar" | Toast éxito | ☐ |

**Estudiante Beta ID:** `________________`
**Ubicación:** `________________`

### 5.3 Estudiante Gamma (Parent 2 - hijo 2)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nuevo Estudiante" | Formulario | ☐ |
| 2 | Llenar datos: | | |
| | - Nombre: `Gamma` | Campo llenado | ☐ |
| | - Apellido: `Testing` | Campo llenado | ☐ |
| | - Grado: `6to A` | Selector | ☐ |
| | - Email Padre: `admin@ceibatic.com` | (mismo que Beta) | ☐ |
| | - Teléfono: `0992222222` | (mismo que Beta) | ☐ |
| 3 | Ubicar hogar en mapa | Misma ubicación que Beta | ☐ |
| 4 | Click "Guardar" | Toast éxito | ☐ |

**Estudiante Gamma ID:** `________________`

### 5.4 Verificar Lista de Estudiantes

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ver lista en `/students` | 3 estudiantes | ☐ |
| 2 | Verificar Alpha → Parent 1 | onedreamto@gmail.com | ☐ |
| 3 | Verificar Beta, Gamma → Parent 2 | admin@ceibatic.com | ☐ |

---

## Fase 6: Registro de Parents (Parent App)

### 6.1 Registro Parent 1 (onedreamto@gmail.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `https://padres.altaviapp.com/signup` | Página de registro | ☐ |
| 2 | Email: `onedreamto@gmail.com` | Campo validado | ☐ |
| 3 | Contraseña | Campo llenado | ☐ |
| 4 | Click "Crear Cuenta" | Toast éxito | ☐ |
| 5 | Verificar email (si aplica) | Link en correo | ☐ |
| 6 | Login | Redirige a dashboard | ☐ |
| 7 | Ver hijo: Alpha Testing | Tarjeta visible | ☐ |

### 6.2 Verificar Perfil de Hijo (Parent 1)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/hijos` | Lista con 1 hijo | ☐ |
| 2 | Click en Alpha | Perfil del estudiante | ☐ |
| 3 | Verificar datos | Nombre, grado, dirección | ☐ |
| 4 | Verificar código QR | QR visible y funcional | ☐ |
| 5 | (Sin rutas aún) | Mensaje "Sin rutas" | ☐ |

### 6.3 Registro Parent 2 (admin@ceibatic.com)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Cerrar sesión o nueva ventana | | |
| 2 | Parent App: `/signup` | Registro exitoso | ☐ |
| 3 | Email: `admin@ceibatic.com` | Campo validado | ☐ |
| 4 | Completar registro | Toast éxito | ☐ |
| 5 | Login | Dashboard | ☐ |
| 6 | Ver 2 hijos: Beta y Gamma | 2 tarjetas visibles | ☐ |

---

## Fase 7: Creación de Rutas (Admin App)

### 7.1 Ruta Norte AM (Pickup - Lun-Vie)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/routes` | Lista vacía | ☐ |
| 2 | Click "Nueva Ruta" | Wizard paso 1 | ☐ |

**Paso 1 - Planificación:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 3 | Nombre: `Ruta Norte AM` | Campo llenado | ☐ |
| 4 | Tipo: `Recogida (pickup)` | Radio seleccionado | ☐ |
| 5 | Hora objetivo: `07:00` | Hora de llegada a escuela | ☐ |
| 6 | Vehículo: `TES-001` | Selector | ☐ |
| 7 | Conductor: `Christian Goye` | Selector (Driver 1) | ☐ |
| 8 | Monitor: `Altaviapp Dev` (opcional) | Selector | ☐ |
| 9 | Click "Siguiente" | Avanza a paso 2 | ☐ |

**Paso 2 - Asignación de Paradas:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 10 | Ver estudiantes disponibles | 3 estudiantes | ☐ |
| 11 | Seleccionar: Alpha Testing | ✓ | ☐ |
| 12 | Seleccionar: Beta Testing | ✓ | ☐ |
| 13 | Seleccionar: Gamma Testing | ✓ | ☐ |
| 14 | Click "Calcular Ruta" | Polilínea en mapa | ☐ |
| 15 | Verificar orden de paradas | ETAs calculados | ☐ |
| 16 | Click "Siguiente" | Avanza a paso 3 | ☐ |

**Paso 3 - Recurrencia y Confirmación:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 17 | Tipo recurrencia: `Diaria` | Selector | ☐ |
| 18 | Días: Lun, Mar, Mié, Jue, Vie | 5 días seleccionados | ☐ |
| 19 | Toggle: Activa = ON | Ruta activa | ☐ |
| 20 | Click "Crear Ruta" | Toast éxito | ☐ |
| 21 | Verificar en lista | Ruta Norte AM visible | ☐ |

**Ruta Norte AM ID:** `________________`

### 7.2 Ruta Norte PM (Dropoff - Lun-Vie)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nueva Ruta" | Wizard | ☐ |
| 2 | Nombre: `Ruta Norte PM` | Campo llenado | ☐ |
| 3 | Tipo: `Entrega (dropoff)` | Radio seleccionado | ☐ |
| 4 | Hora objetivo: `14:00` | Hora de salida | ☐ |
| 5 | Mismo vehículo y conductor | Seleccionados | ☐ |
| 6 | Seleccionar 3 estudiantes | Alpha, Beta, Gamma | ☐ |
| 7 | Calcular ruta | Polilínea | ☐ |
| 8 | Recurrencia: Lun-Vie | 5 días | ☐ |
| 9 | Crear ruta | Toast éxito | ☐ |

**Ruta Norte PM ID:** `________________`

### 7.3 Ruta Especial Domingo (Pickup - Una vez)

> Esta ruta es para un evento especial del domingo, con solo 2 estudiantes (1 de cada padre).

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nueva Ruta" | Wizard | ☐ |
| 2 | Nombre: `Ruta Especial Domingo` | Campo llenado | ☐ |
| 3 | Tipo: `Recogida (pickup)` | Radio seleccionado | ☐ |
| 4 | Hora objetivo: `09:00` | Hora mañana domingo | ☐ |
| 5 | Vehículo: `TES-002` | Otro vehículo | ☐ |
| 6 | Conductor: `Luis Álvarez` | Driver 2 | ☐ |
| 7 | Siguiente | Paso 2 | ☐ |

**Paso 2 - Estudiantes (solo 2):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 8 | Seleccionar: Alpha Testing | 1 de Parent 1 | ☐ |
| 9 | Seleccionar: Beta Testing | 1 de Parent 2 | ☐ |
| 10 | NO seleccionar Gamma | Solo 2 estudiantes | ☐ |
| 11 | Calcular ruta | Polilínea optimizada | ☐ |
| 12 | Siguiente | Paso 3 | ☐ |

**Paso 3 - Recurrencia única:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 13 | Tipo recurrencia: `Una vez` | Selector | ☐ |
| 14 | Fecha: Próximo domingo | Selector de fecha | ☐ |
| 15 | Toggle: Activa = ON | Ruta activa | ☐ |
| 16 | Crear ruta | Toast éxito | ☐ |

**Ruta Domingo ID:** `________________`
**Fecha:** `________________`

### 7.4 Verificar Rutas en Lista

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ver `/routes` | 3 rutas en lista | ☐ |
| 2 | Ruta Norte AM | pickup, Lun-Vie, 3 estudiantes | ☐ |
| 3 | Ruta Norte PM | dropoff, Lun-Vie, 3 estudiantes | ☐ |
| 4 | Ruta Especial Domingo | pickup, una vez, 2 estudiantes | ☐ |

---

## Fase 8: Verificación Cross-App

### 8.1 Parent App - Ver Rutas Asignadas

**Parent 1 (onedreamto@gmail.com):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Login Parent App | Dashboard | ☐ |
| 2 | Ir a `/hijos` → Alpha | Perfil | ☐ |
| 3 | Verificar rutas: | | |
| | - Ruta Norte AM (pickup) | ✓ | ☐ |
| | - Ruta Norte PM (dropoff) | ✓ | ☐ |
| | - Ruta Especial Domingo | ✓ | ☐ |

**Parent 2 (admin@ceibatic.com):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Login Parent App | Dashboard | ☐ |
| 2 | Ver Beta | 3 rutas (AM, PM, Domingo) | ☐ |
| 3 | Ver Gamma | 2 rutas (solo AM y PM, NO domingo) | ☐ |

### 8.2 Crew App - Ver Rutas Asignadas

**Driver 1 (christiangoye@gmail.com):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Login Crew App | Dashboard | ☐ |
| 2 | Ver "Mis Rutas" | | |
| | - Ruta Norte AM | ✓ | ☐ |
| | - Ruta Norte PM | ✓ | ☐ |
| 3 | NO ver Ruta Domingo | (asignada a Driver 2) | ☐ |

**Driver 2 (luis.alvrz.la@gmail.com):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Login Crew App | Dashboard | ☐ |
| 2 | Ver "Mis Rutas" | | |
| | - Ruta Especial Domingo | ✓ | ☐ |
| 3 | NO ver rutas AM/PM | (asignadas a Driver 1) | ☐ |

---

## Fase 9: Flujo de Viaje Regular (Lun-Vie)

### 9.1 Iniciar Viaje - Ruta Norte AM (Crew App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Login Driver 1 (Christian) | Dashboard | ☐ |
| 2 | Ver "Ruta Norte AM" en rutas del día | Badge: 3 estudiantes | ☐ |
| 3 | Click en ruta | Detalle de ruta | ☐ |
| 4 | Click "Iniciar Viaje" | `/trips/[id]/start` | ☐ |
| 5 | Verificar checklist | Items completos | ☐ |
| 6 | Verificar estudiantes: 3 | Alpha, Beta, Gamma | ☐ |
| 7 | Click "INICIAR" | Viaje creado, `/active` | ☐ |

**Trip ID AM:** `________________`

### 9.2 Tracking en Parent App

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent 1: Ver dashboard | Alpha "En ruta" (azul) | ☐ |
| 2 | Expandir tarjeta | Mapa con bus | ☐ |
| 3 | Ver ETA | Tiempo estimado | ☐ |
| 4 | Parent 2: Ver dashboard | Beta y Gamma "En ruta" | ☐ |

### 9.3 Check-in de Estudiantes

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew: `/trips/[id]/students` | Lista de 3 estudiantes | ☐ |
| 2 | Check-in Alpha | Status: "A bordo" | ☐ |
| 3 | Parent 1: Notificación | "Alpha subió al bus" | ☐ |
| 4 | Check-in Beta | Status: "A bordo" | ☐ |
| 5 | Check-in Gamma | Status: "A bordo" | ☐ |
| 6 | Parent 2: 2 notificaciones | "Beta subió...", "Gamma subió..." | ☐ |
| 7 | Crew: Verificar 3/3 | Todos a bordo | ☐ |

### 9.4 Completar Viaje

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew: Click "Terminar Viaje" | Modal confirmación | ☐ |
| 2 | Confirmar | Status: "Completado" | ☐ |
| 3 | Admin: Ver en `/trips` | Viaje completado | ☐ |
| 4 | Parents: Ver historial | Viaje en historial | ☐ |

---

## Fase 10: Flujo de Novedades

### 10.1 Crear Novedad de Ausencia (Parent 1)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent 1: Ir a `/novedades/create` | Formulario | ☐ |
| 2 | Seleccionar: Alpha Testing | Hijo seleccionado | ☐ |
| 3 | Tipo: Ausencia | Tipo seleccionado | ☐ |
| 4 | Fecha: [próximo día hábil] | Fecha válida | ☐ |
| 5 | Ruta: Ambos trayectos | AM y PM | ☐ |
| 6 | Razón: "Cita médica programada" | Campo llenado | ☐ |
| 7 | (Opcional) Adjuntar justificante | Archivo subido | ☐ |
| 8 | Click "Enviar" | Toast éxito | ☐ |
| 9 | Ver en `/novedades` | Status: "Pendiente" | ☐ |

**Novedad Ausencia ID:** `________________`

### 10.2 Aprobar Novedad (Admin)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin: Ir a `/requests` | Badge: 1 pendiente | ☐ |
| 2 | Click en novedad de Alpha | Modal de revisión | ☐ |
| 3 | Ver detalles: estudiante, tipo, fecha | Datos correctos | ☐ |
| 4 | Ver evidencia (si hay) | Imagen/PDF visible | ☐ |
| 5 | Click "Aprobar" | Modal cierra | ☐ |
| 6 | Verificar status | "Aprobada" (verde) | ☐ |

### 10.3 Verificar Notificación (Parent 1)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent 1: Ver `/notifications` | "Novedad aprobada" | ☐ |
| 2 | Ir a `/novedades` | Status: "Aprobada" | ☐ |

### 10.4 Crear Novedad Recoge Padre (Parent 2)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent 2: `/novedades/create` | Formulario | ☐ |
| 2 | Seleccionar: Beta Testing | Hijo seleccionado | ☐ |
| 3 | Tipo: Recoge Padre | Tipo seleccionado | ☐ |
| 4 | Fecha: [mismo día que ausencia] | Fecha válida | ☐ |
| 5 | Ruta: Solo PM (dropoff) | Solo regreso | ☐ |
| 6 | Razón: "Evento familiar" | Campo llenado | ☐ |
| 7 | Click "Enviar" | Toast éxito | ☐ |
| 8 | Ver en `/novedades` | Status: "Confirmada" (auto) | ☐ |

**Novedad Recoge Padre ID:** `________________`

> **NOTA**: Las novedades "Recoge Padre" se auto-aprueban y no requieren acción del admin.

---

## Fase 11: Viaje con Novedades Aplicadas

### 11.1 Día con Novedades - Ruta AM

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Driver 1: Dashboard | Badge: "1 ausencia" | ☐ |
| 2 | Click en Ruta Norte AM | Ver novedades | ☐ |
| 3 | Click "Iniciar Viaje" | `/trips/[id]/start` | ☐ |
| 4 | Ver banner de novedades | "Alpha: Ausente" | ☐ |
| 5 | Verificar estudiantes: 2 | Solo Beta y Gamma | ☐ |
| 6 | Iniciar viaje | Viaje con 2 estudiantes | ☐ |

### 11.2 Día con Novedades - Ruta PM

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Iniciar Ruta Norte PM | `/trips/[id]/start` | ☐ |
| 2 | Ver banner | Alpha: Ausente, Beta: Recoge Padre | ☐ |
| 3 | Estudiantes a entregar: 1 | Solo Gamma | ☐ |
| 4 | Iniciar y completar viaje | Viaje con 1 estudiante | ☐ |

---

## Fase 12: Viaje Especial Domingo

### 12.1 Preparación

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin: Verificar ruta activa | "Ruta Especial Domingo" | ☐ |
| 2 | Verificar fecha correcta | Próximo domingo | ☐ |
| 3 | Verificar 2 estudiantes | Alpha y Beta | ☐ |

### 12.2 Ejecutar Viaje (Driver 2)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Driver 2 (Luis): Login domingo | Dashboard | ☐ |
| 2 | Ver "Ruta Especial Domingo" | Badge: 2 estudiantes | ☐ |
| 3 | Iniciar viaje | `/trips/[id]/start` | ☐ |
| 4 | Verificar: Alpha y Beta | 2 estudiantes | ☐ |
| 5 | Iniciar y hacer check-ins | A bordo | ☐ |
| 6 | Completar viaje | Status: Completado | ☐ |

### 12.3 Verificar Parents

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent 1: Notificación check-in | Alpha | ☐ |
| 2 | Parent 2: Notificación check-in | Solo Beta (no Gamma) | ☐ |
| 3 | Gamma NO recibió tracking | No estaba en ruta | ☐ |

---

## Fase 13: Testing de Incidentes (Opcional)

### 13.1 Reportar Incidente

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Durante viaje activo | `/trips/[id]/active` | ☐ |
| 2 | Click "Reportar Incidente" | Formulario | ☐ |
| 3 | Tipo: Retraso | Selector | ☐ |
| 4 | Severidad: Baja | Selector | ☐ |
| 5 | Descripción: "Tráfico leve" | Campo | ☐ |
| 6 | Click "Reportar" | Toast éxito | ☐ |

### 13.2 Verificar en Admin

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin: `/incidents` | Incidente en lista | ☐ |
| 2 | Ver detalle | Info completa | ☐ |

---

## Checklist Final

### Datos Creados

| Entidad | Cantidad | Verificado |
|---------|----------|------------|
| Institución | 1 | ☐ |
| Vehículos | 2 | ☐ |
| Conductores | 2 | ☐ |
| Monitores | 1 | ☐ |
| Estudiantes | 3 | ☐ |
| Parents | 2 | ☐ |
| Rutas regulares | 2 | ☐ |
| Rutas especiales | 1 | ☐ |
| Viajes completados | 3+ | ☐ |
| Novedades | 2 | ☐ |

### Flujos Validados

| Flujo | Status |
|-------|--------|
| Signup Admin → Crear institución | ☐ |
| Configurar ubicación escuela | ☐ |
| Crear grados | ☐ |
| Crear vehículos | ☐ |
| Invitar conductores (código) | ☐ |
| Invitar monitores (código) | ☐ |
| Registro crew con código | ☐ |
| Crear estudiantes | ☐ |
| Registro parents | ☐ |
| Crear rutas recurrentes (Lun-Vie) | ☐ |
| Crear ruta única (domingo) | ☐ |
| Cross-app: Parents ven rutas | ☐ |
| Cross-app: Crew ve sus rutas | ☐ |
| Iniciar viaje (lazy creation) | ☐ |
| GPS tracking en tiempo real | ☐ |
| Check-in de estudiantes | ☐ |
| Notificaciones de check-in | ☐ |
| Crear novedad con evidencia | ☐ |
| Auto-aprobación parent_pickup | ☐ |
| Aprobación manual de ausencia | ☐ |
| Aplicación de novedades a viaje | ☐ |
| Viaje especial una vez | ☐ |

### Cross-App Communication

| Acción | Origen | Destino | ✓ |
|--------|--------|---------|---|
| Crear estudiante | Admin | Parent ve hijo | ☐ |
| Crear ruta | Admin | Crew ve ruta | ☐ |
| Crear ruta | Admin | Parent ve ruta hijo | ☐ |
| Invitar conductor | Admin | Crew puede registrarse | ☐ |
| Iniciar viaje | Crew | Parent ve tracking | ☐ |
| Check-in | Crew | Parent recibe notif | ☐ |
| Crear novedad | Parent | Admin ve pendiente | ☐ |
| Aprobar novedad | Admin | Parent recibe notif | ☐ |
| Aprobar novedad | Admin | Crew ve novedad | ☐ |
| Acusar recibo | Crew | Parent ve estado | ☐ |

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| Ruta no aparece para crew | Día incorrecto de recurrencia | Verificar días seleccionados |
| Parent no ve hijo | Email no coincide | Verificar email exacto |
| Código de invitación no funciona | Expirado o usado | Generar nueva invitación |
| Novedad no aplica al viaje | Fecha incorrecta | Verificar fecha de novedad |
| Tracking no actualiza | GPS deshabilitado | Permitir geolocalización |
| Ruta domingo no aparece | Fecha pasada | Verificar fecha futura |

---

## Notas del Testing

**Fecha:** ________________

**Tester:** ________________

**Dispositivos usados:**
- Admin: ________________
- Parent: ________________
- Crew: ________________

**Observaciones:**

```
[Agregar notas aquí]
```

**Bugs encontrados:**

| # | Descripción | Severidad | App | Screenshot |
|---|-------------|-----------|-----|------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

---

## Referencias

- [ADMIN_PRD.md](../prd/ADMIN_PRD.md)
- [PARENT_PRD.md](../prd/PARENT_PRD.md)
- [CREW_PRD.md](../prd/CREW_PRD.md)
