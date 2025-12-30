# Crew App - PRD v2

**App**: Crew App (Conductor + Monitor)
**Usuarios**: Conductores, Monitores/Auxiliares
**Versión**: 2.0
**Fecha**: Diciembre 2024

---

## 1. Propósito

La Crew App es la herramienta operativa para ejecutar viajes de transporte escolar. Permite a conductores y monitores gestionar el recorrido diario, registrar check-ins de estudiantes, reportar incidentes y ver novedades.

---

## 2. Usuarios y Permisos

| Rol | Responsabilidad Principal | Capacidades Exclusivas |
|-----|---------------------------|------------------------|
| **Conductor** | Operar el vehículo | Checklist, iniciar/terminar viaje, GPS |
| **Monitor** | Gestionar estudiantes | Check-in QR, reportar incidentes, ver novedades |

### Matriz de Permisos

| Funcionalidad | Conductor | Monitor |
|---------------|:---------:|:-------:|
| Ver rutas asignadas | ✅ | ✅ |
| Checklist pre-viaje | ✅ | ❌ |
| Iniciar viaje | ✅ | ❌ |
| Terminar viaje | ✅ | ❌ |
| Enviar ubicación GPS | ✅ | ❌ |
| Check-in estudiantes (QR) | Solo si no hay monitor | ✅ |
| Check-in manual | Solo si no hay monitor | ✅ |
| Ver novedades del viaje | ✅ | ✅ |
| Acusar recibo de novedad | ❌ | ✅ |
| Reportar incidentes | ❌ | ✅ |
| Solicitar relevo (cambio vehículo) | ✅ | ❌ |

---

## 3. Módulos Funcionales

### 3.1 Inicio (Dashboard)

**Propósito**: Vista rápida del día y acceso a rutas.

**Información mostrada**:

1. **Saludo personalizado**
   - Nombre del usuario
   - Rol (Conductor / Auxiliar)

2. **Resumen del día**
   - Viajes completados hoy
   - Viajes pendientes hoy
   - Estudiantes transportados hoy

3. **Rutas de hoy** (acceso rápido)
   - Tarjetas de rutas que aplican para hoy según recurrencia
   - Estado: disponible para iniciar / en progreso / completada

4. **Novedades del día**
   - Resumen por categoría:
     - Ausencias: X estudiantes
     - Recoge padre: X estudiantes
     - Cambio parada: X estudiantes
   - Lista de las primeras 3 con nombre del estudiante
   - Link a lista completa

5. **Notificaciones recientes**
   - Últimas 3 notificaciones
   - Badge de no leídas

**Criterios de aceptación**:
- [ ] Solo mostrar rutas que aplican HOY según recurrencia
- [ ] Novedades solo muestran las de rutas asignadas al usuario
- [ ] Tap en ruta navega al detalle o inicio de viaje

---

### 3.2 Rutas

**Propósito**: Ver rutas asignadas y sus detalles.

#### 3.2.1 Lista de Rutas

**Filtros**:
- Todas
- Solo recogida (pickup)
- Solo entrega (dropoff)

**Por cada ruta**:
- Nombre de la ruta
- Tipo (pickup/dropoff) con badge
- Horario programado
- Número de paradas
- Número de estudiantes
- Vehículo asignado
- Estado para hoy: disponible / no aplica hoy

**Regla**: Solo mostrar rutas donde el usuario es conductor O monitor asignado.

#### 3.2.2 Detalle de Ruta

**Información**:
- Nombre, tipo, horario
- Vehículo y placa
- Conductor y monitor asignados
- Lista de paradas en orden:
  - Número de parada
  - Dirección
  - ETA estimado
  - Estudiantes en esa parada

**Mapa**:
- Polilínea de la ruta completa
- Marcadores de paradas numerados
- Marcador de escuela (origen/destino)

**Acción principal**: "Iniciar Viaje" (solo si aplica hoy)

---

### 3.3 Viajes

**Propósito**: Ejecutar y gestionar viajes activos.

#### 3.3.1 Pre-inicio de Viaje

**Pantalla de confirmación** muestra:
- Resumen de la ruta
- Vehículo asignado
- Número de estudiantes esperados
- **Banner de novedades**:
  - Total de novedades para este viaje
  - Desglose: X ausentes, X recoge padre, X cambio parada
  - Link para ver detalle de cada una

**Condiciones para iniciar**:

| Condición | Comportamiento |
|-----------|----------------|
| Checklist no completado | Advertencia, pero permite continuar |
| Hay novedades sin acusar | Advertencia, pero permite continuar |
| Viaje ya iniciado | Navega al viaje activo |
| No es el día correcto | Botón deshabilitado |

#### 3.3.2 Checklist Pre-viaje (Solo Conductor)

**Propósito**: Inspección del vehículo antes de iniciar.

**Categorías de inspección**:

| Categoría | Ítems |
|-----------|-------|
| Mecánico | Frenos, dirección, llantas, motor, fluidos |
| Luces | Delanteras, traseras, intermitentes, emergencia |
| Seguridad | Cinturones, extintor, botiquín, salidas de emergencia |
| Limpieza | Interior, asientos, ventanas, pisos |

**Por cada ítem**:
- Checkbox: OK
- Opción: "Reportar problema"
- Si problema: campo de descripción

**Al completar**:
- Si hay problemas: modal de confirmación
- Registro de checklist guardado con timestamp

**Criterios de aceptación**:
- [ ] Barra de progreso visual
- [ ] No bloquea inicio de viaje (solo advierte)
- [ ] Problemas reportados visibles para Admin

#### 3.3.3 Viaje Activo

**Propósito**: Pantalla principal durante la ejecución del viaje.

**Elementos en pantalla**:

1. **Mapa** (ocupando mayor parte)
   - Ubicación actual del vehículo con dirección
   - Polilínea de la ruta
   - Paradas: completadas (verde), actual (azul), pendientes (gris)
   - Escuela marcada

2. **Overlay de velocidad** (esquina superior izquierda)
   - Velocidad actual en km/h

3. **Overlay de progreso** (esquina superior derecha)
   - X de Y paradas completadas

4. **Indicador de novedades** (debajo del header, si hay)
   - Badge con cantidad total
   - Tap expande resumen

5. **Tarjeta de próxima parada** (parte inferior)
   - Nombre/dirección de la parada
   - Distancia en metros/km
   - ETA en minutos
   - Botón "IR" (abre Google Maps/Waze)
   - Lista de estudiantes de esta parada con estado:
     - Pendiente (gris)
     - A bordo (azul) - ya hizo check-in
     - Ausente (rojo) - tiene novedad de ausencia
     - Recoge padre (amarillo) - tiene novedad parent_pickup
   - Botón de check-in por cada estudiante pendiente

6. **Acciones rápidas** (3 botones)
   - Incidente: abre modal de reporte
   - Relevo: abre modal de cambio de vehículo (solo conductor)
   - Detalles: navega a vista de detalles

7. **Botón terminar viaje** (fijo en bottom)
   - Confirmación antes de terminar

**GPS Tracking**:
- Actualización cada 15 segundos
- Background tracking mientras app abierta
- Datos: lat, lng, speed, heading, timestamp

**Criterios de aceptación**:
- [ ] Mapa se centra en vehículo automáticamente
- [ ] Tap en parada muestra estudiantes de esa parada
- [ ] Check-in actualiza estado en tiempo real
- [ ] Notificación a padres inmediata al check-in

#### 3.3.4 Check-in de Estudiantes

**Métodos**:

1. **QR Scanner** (preferido)
   - Escanea código QR del estudiante
   - Validaciones:
     - ¿Estudiante pertenece a este viaje?
     - ¿Estudiante está en la parada actual?
     - ¿Ya tiene check-in?
   - Si válido: registra check-in

2. **Manual** (fallback)
   - Lista de estudiantes de la parada
   - Tap en estudiante → confirmar check-in
   - Registra con nota "check-in manual"

**Datos registrados por check-in**:
- Estudiante ID
- Viaje ID
- Parada ID
- Tipo: boarding (subió) / alighting (bajó)
- Método: qr / manual
- Timestamp
- Ubicación GPS
- Usuario que registró

**Estados resultantes**:

| Tipo viaje | Check-in boarding | Check-out alighting |
|------------|-------------------|---------------------|
| Pickup | Estudiante subió en su parada | Estudiante bajó en escuela |
| Dropoff | Estudiante subió en escuela | Estudiante bajó en su parada |

#### 3.3.5 Lista de Estudiantes

**Vista de todos los estudiantes del viaje**:
- Agrupados por parada
- Estado de cada uno (pending, aboard, delivered, absent, parent_pickup)
- Panel de novedades si tiene:
  - Tipo de novedad con icono
  - Descripción breve
  - Botón "Acusar recibo" si está en estado `approved`

**Búsqueda**: por nombre del estudiante

**Criterios de aceptación**:
- [ ] Novedades visualmente destacadas
- [ ] Estudiantes con novedad de ausencia no esperan check-in
- [ ] Al acusar recibo: novedad pasa a `acknowledged`

#### 3.3.6 Reporte de Incidentes (Solo Monitor)

**Flujo en modal** (3 pasos):

**Paso 1 - Tipo de incidente**:
- Accidente
- Emergencia médica
- Problema con estudiante
- Problema de ruta
- Retraso significativo
- Otro

**Paso 2 - Detalles**:
- Severidad: crítica, alta, media, baja
- Descripción (texto libre, obligatorio)
- Si tipo = "estudiante": selector de estudiante afectado
- Si tipo = "retraso": minutos de retraso estimado
- Ubicación GPS (automática)

**Paso 3 - Confirmación**:
- Resumen del incidente
- Botón "Reportar"
- Confirmación con ID del incidente

**Notificaciones automáticas**:
- Admin: siempre
- Padres: si hay estudiante afectado, según severidad

#### 3.3.7 Relevo / Cambio de Vehículo (Solo Conductor)

**Propósito**: Registrar cambio de vehículo durante el viaje.

**Flujo**:
1. Conductor selecciona "Relevo"
2. Modal solicita:
   - Nuevo vehículo (de lista disponible)
   - Motivo del cambio
3. Confirmación
4. Sistema registra evento
5. Notificación a Admin y padres

#### 3.3.8 Detalles del Viaje

**Tabs**:

1. **Info General**
   - Datos del viaje (ruta, tipo, hora inicio)
   - Vehículo y tripulación
   - Paradas con estudiantes agrupados
   - Estados visuales por parada

2. **Cronología**
   - Timeline de eventos ordenado:
     - Viaje iniciado
     - Llegada a parada X
     - Check-in de estudiante Y
     - Incidente reportado
     - Viaje completado
   - Timestamp de cada evento
   - Actor que realizó la acción

#### 3.3.9 Terminar Viaje

**Flujo**:
1. Conductor toca "Terminar Viaje"
2. Modal de confirmación muestra:
   - Estudiantes entregados: X
   - Estudiantes pendientes: Y (si hay)
   - Advertencia si hay pendientes
3. Confirmar → viaje pasa a `completed`

**Reglas**:
- Si hay estudiantes `aboard` (no entregados): advertencia fuerte
- Si hay estudiantes `pending` sin novedad: advertencia
- Registro de hora de fin

---

### 3.4 Calendario

**Propósito**: Vista mensual de viajes pasados y futuros.

**Vista**:
- Grid de calendario mensual
- Por día: indicadores de viajes
- Colores:
  - Azul: viaje activo (hoy, en progreso)
  - Verde: completado
  - Amarillo: programado (futuro)
  - Rojo: cancelado
  - Gris: no aplica

**Tap en día**: muestra viajes de ese día con opción de ver detalle.

---

### 3.5 Perfil

**Propósito**: Ver información personal y configuración.

#### 3.5.1 Información Personal

**Común a todos**:
- Foto/avatar
- Nombre completo
- Email
- Teléfono
- Rol

**Específico Conductor**:
- Número de licencia
- Tipo de licencia
- Vencimiento de licencia

**Específico Monitor**:
- Documento de identidad
- Certificaciones (primeros auxilios, cuidado infantil)

#### 3.5.2 Estadísticas

- Viajes completados (total y este mes)
- Estudiantes transportados
- Días trabajados

#### 3.5.3 Historial de Viajes

- Lista de viajes pasados
- Filtros: 7, 30, 90 días
- Por viaje: fecha, ruta, duración, estudiantes

#### 3.5.4 Configuración

**Notificaciones**:
- Toggle push notifications
- Toggle vibración
- Toggle sonido

**Mapas**:
- Tipo de vista (satélite, calles, terreno)
- Auto-centrar en vehículo

**Cuenta**:
- Cambiar contraseña
- Cerrar sesión

---

## 4. Flujo de Novedades (Perspectiva Crew)

### 4.1 Dónde ve las novedades

| Lugar | Qué muestra |
|-------|-------------|
| Dashboard | Resumen del día (ausencias, recoge padre, etc.) |
| Pre-inicio viaje | Banner con desglose para ESE viaje |
| Viaje activo | Indicador compacto con badge |
| Lista estudiantes | Panel por estudiante con tipo y razón |

### 4.2 Estados que ve el Crew

| Estado | Badge en UI | Acción del Crew |
|--------|-------------|-----------------|
| `approved` | "Pendiente" (amarillo) | Debe acusar recibo |
| `acknowledged` | "Confirmada" (azul) | Ya confirmó |
| `applied` | "Aplicada" (gris) | Ya se aplicó al viaje |

### 4.3 Efecto de cada categoría

| Categoría | Lo que ve el Crew | Acción esperada |
|-----------|-------------------|-----------------|
| `absence` | Estudiante en rojo, "Ausente" | No esperarlo |
| `pickup_change` | Estudiante en amarillo, "Recoge padre" | No esperarlo |
| `stop_change` | Estudiante en parada diferente | Buscarlo en nueva parada |
| `time_change` | Nota informativa | Solo estar informado |
| `other` | Nota informativa | Solo estar informado |

---

## 5. Notificaciones

### 5.1 Notificaciones Recibidas

| Evento | Prioridad | Acción esperada |
|--------|-----------|-----------------|
| Nueva novedad para viaje | Normal | Revisar y acusar recibo |
| Novedad cancelada | Normal | Actualizar plan |
| Viaje cancelado por Admin | Alta | No presentarse |

### 5.2 Notificaciones Generadas

| Acción del Crew | Destinatario | Mensaje |
|-----------------|--------------|---------|
| Check-in estudiante | Parent | "{estudiante} ha subido al bus" |
| Check-out estudiante | Parent | "{estudiante} ha sido entregado" |
| Acusar recibo novedad | Parent | "El conductor confirmó la novedad" |
| Reportar incidente | Admin + Parent | "Incidente reportado: {tipo}" |
| Iniciar viaje | Admin | "Viaje {ruta} iniciado" |
| Terminar viaje | Admin + Parents | "Viaje {ruta} completado" |

---

## 6. Requisitos No Funcionales

### 6.1 PWA

- Instalable en Android e iOS
- Funciona sin conexión (modo degradado):
  - Puede ver rutas cacheadas
  - Puede hacer check-ins (se sincronizan al recuperar conexión)
  - GPS tracking se almacena localmente

### 6.2 Permisos de Dispositivo

| Permiso | Uso | Momento de solicitud |
|---------|-----|---------------------|
| Ubicación (foreground) | Tracking durante viaje | Al iniciar primer viaje |
| Ubicación (background) | Tracking continuo | Al iniciar primer viaje |
| Cámara | Escáner QR | Al primer check-in |
| Notificaciones | Push notifications | Al login |

### 6.3 Performance

| Métrica | Objetivo |
|---------|----------|
| Tiempo de carga inicial | < 3 segundos |
| Tiempo de check-in | < 2 segundos |
| Latencia GPS | < 5 segundos |
| Actualización de mapa | < 2 segundos |

---

## 7. Casos de Error

| Escenario | Comportamiento |
|-----------|----------------|
| Sin conexión a internet | Modo offline, sincroniza al recuperar |
| GPS no disponible | Advertencia, permite continuar sin tracking |
| QR no reconocido | Mensaje de error, opción de check-in manual |
| Estudiante no en este viaje | Mensaje de error claro |
| Viaje ya terminado | Redirige a detalle del viaje |

---

## 8. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Check-ins por QR vs manual | > 80% QR |
| Viajes con checklist completado | > 90% |
| Novedades acusadas antes de iniciar | > 95% |
| Incidentes reportados en < 5 min | > 90% |

---

## Referencias

- [Flujos Cross-App](./CROSS_APP_FLOWS.md) - Estados y transiciones compartidas
- [Admin PRD](./ADMIN_PRD.md) - App de administración
- [Parent PRD](./PARENT_PRD.md) - App de padres
