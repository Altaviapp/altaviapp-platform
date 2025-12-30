# Admin Dashboard - PRD v2

**App**: Admin Dashboard
**Usuarios**: Coordinadores escolares, Super administradores
**Versión**: 2.0
**Fecha**: Diciembre 2024

---

## 1. Propósito

El Admin Dashboard es el centro de control para la gestión del transporte escolar. Permite configurar todos los recursos (vehículos, personal, estudiantes, rutas) y supervisar la operación en tiempo real.

---

## 2. Usuarios y Permisos

| Rol | Alcance | Capacidades |
|-----|---------|-------------|
| **Super Admin** | Multi-institución | Todo + gestión de instituciones |
| **Admin/Coordinador** | Su institución | Gestión completa de recursos y operación |

---

## 3. Módulos Funcionales

### 3.1 Dashboard Principal

**Propósito**: Vista ejecutiva del estado actual de la operación.

**Información mostrada**:
- Viajes activos en este momento
- Viajes programados para hoy
- Vehículos en operación vs disponibles
- Estudiantes transportados hoy
- Incidentes abiertos (con indicador de severidad)
- Novedades pendientes de revisión

**Acciones rápidas**:
- Ver mapa de viajes activos
- Ir a incidentes abiertos
- Ir a novedades pendientes

**Criterios de aceptación**:
- [ ] Datos se actualizan en tiempo real (< 5 segundos)
- [ ] Incidentes críticos/altos destacados visualmente
- [ ] Click en cualquier métrica navega al detalle

---

### 3.2 Gestión de Flota

**Propósito**: Administrar vehículos, conductores y monitores.

#### 3.2.1 Vehículos

**Datos requeridos**:
| Campo | Obligatorio | Validación |
|-------|:-----------:|------------|
| Placa | ✅ | Único en institución |
| Marca | ✅ | - |
| Modelo | ✅ | - |
| Año | ✅ | 1990-actual |
| Capacidad | ✅ | 1-100 pasajeros |
| Color | ❌ | - |
| Estado | ✅ | activo, mantenimiento, fuera_de_servicio |

**Configuración GPS**:
- Tipo: móvil (app del conductor), dispositivo físico, o API externa
- Si dispositivo: ID del dispositivo

**Reglas de negocio**:
- No se puede eliminar vehículo asignado a ruta activa
- Cambiar a "fuera de servicio" advierte si tiene rutas asignadas
- Vehículo en "mantenimiento" no aparece como opción en rutas

#### 3.2.2 Conductores

**Datos requeridos**:
| Campo | Obligatorio | Validación |
|-------|:-----------:|------------|
| Nombre completo | ✅ | - |
| Email | ✅ | Único, formato válido |
| Teléfono | ✅ | Formato país |
| Licencia | ✅ | - |
| Tipo licencia | ✅ | C, D, E |
| Vencimiento licencia | ✅ | Fecha futura |
| Contacto emergencia | ✅ | Nombre + teléfono |

**Invitación**:
- Admin ingresa datos → Sistema genera código de 6 dígitos
- Conductor recibe email con código → Se registra en Crew app
- Código expira en 7 días

**Reglas de negocio**:
- Licencia vencida: alerta visual, bloquea asignación a nuevas rutas
- Conductor inactivo: no aparece en selectores

#### 3.2.3 Monitores/Auxiliares

**Datos requeridos**:
| Campo | Obligatorio | Validación |
|-------|:-----------:|------------|
| Nombre completo | ✅ | - |
| Email | ✅ | Único, formato válido |
| Teléfono | ✅ | Formato país |
| Documento identidad | ✅ | - |
| Certificación primeros auxilios | ❌ | Fecha de obtención |
| Certificación cuidado infantil | ❌ | Fecha de obtención |
| Contacto emergencia | ✅ | Nombre + teléfono |

**Invitación**: Mismo flujo que conductores.

---

### 3.3 Gestión de Estudiantes

**Propósito**: Mantener el registro de estudiantes y sus datos de transporte.

#### 3.3.1 Datos del Estudiante

| Campo | Obligatorio | Validación | Editable por Parent |
|-------|:-----------:|------------|:-------------------:|
| Nombre | ✅ | - | ❌ |
| Apellido | ✅ | - | ❌ |
| Grado | ✅ | De lista configurada | ❌ |
| Fecha nacimiento | ❌ | Fecha pasada | ❌ |
| Foto | ❌ | JPG/PNG, max 5MB | ✅ |
| Ubicación hogar | ✅ | Lat/Lng válidos | ✅ |
| Dirección | ✅ | Texto | ✅ |
| Email tutor principal | ✅ | Formato válido | ❌ |
| Email tutor secundario | ❌ | Formato válido | ❌ |
| Teléfono contacto | ✅ | Formato país | ✅ |
| Contacto emergencia | ❌ | Nombre + teléfono + relación | ✅ |
| Notas médicas | ❌ | Texto libre | ❌ |

#### 3.3.2 Detección de Hogares

Al crear estudiante con email de tutor:

| Escenario | Comportamiento |
|-----------|----------------|
| Email no existe | Crear usuario provisional, enviar invitación |
| Email existe, usuario activo | Vincular estudiante al hogar existente |
| Email existe, invitación pendiente | Vincular estudiante, mantener invitación |

**Criterios de aceptación**:
- [ ] Al escribir email, sistema busca en tiempo real (debounce 500ms)
- [ ] Si hay hogar existente, mostrar hermanos ya registrados
- [ ] Botón cambia texto según contexto ("Agregar al Hogar" vs "Guardar")

#### 3.3.3 Código QR

- Generado automáticamente al crear estudiante
- Contenido: identificador único del estudiante
- Acciones: ver, descargar PNG, imprimir

#### 3.3.4 Importación Masiva (CSV)

**Campos del CSV**:
```
nombre, apellido, grado, fecha_nacimiento, email_tutor, telefono_contacto, direccion
```

**Flujo**:
1. Admin sube archivo CSV
2. Sistema valida formato y datos
3. Preview con errores marcados en rojo
4. Admin corrige o confirma
5. Sistema agrupa por email_tutor (hogares)
6. Opción: enviar invitaciones automáticamente

**Criterios de aceptación**:
- [ ] Máximo 500 estudiantes por archivo
- [ ] Errores no bloquean importación de filas válidas
- [ ] Resumen final: importados, errores, invitaciones enviadas

---

### 3.4 Gestión de Rutas

**Propósito**: Definir recorridos recurrentes con paradas y estudiantes asignados.

#### 3.4.1 Datos de la Ruta

| Campo | Obligatorio | Descripción |
|-------|:-----------:|-------------|
| Nombre | ✅ | Identificador legible ("Ruta Norte AM") |
| Tipo | ✅ | pickup (recogida) o dropoff (entrega) |
| Hora objetivo | ✅ | Hora de llegada a escuela (pickup) o salida (dropoff) |
| Vehículo | ✅ | De lista de vehículos activos |
| Conductor | ✅ | De lista de conductores activos |
| Monitor | ❌ | De lista de monitores activos |
| Recurrencia | ✅ | Ver sección 3.4.3 |
| Estado | ✅ | activa / inactiva |

#### 3.4.2 Asignación de Paradas y Estudiantes

**Flujo de creación**:

1. **Selección de estudiantes**
   - Mostrar solo estudiantes:
     - Sin ruta del mismo tipo (pickup/dropoff) asignada
     - Con ubicación de hogar configurada
   - Filtros: por nombre, por grado
   - Selección múltiple

2. **Optimización de ruta**
   - Sistema calcula orden óptimo de paradas
   - Algoritmo: minimizar distancia total (nearest neighbor o similar)
   - Resultado: lista ordenada de paradas con ETAs estimados

3. **Ajuste manual**
   - Admin puede reordenar paradas (drag & drop)
   - Al reordenar: recalcular ETAs automáticamente

**Cálculo de ETA**:
- Basado en hora objetivo y distancias entre paradas
- Velocidad promedio configurable (default: 30 km/h urbano)
- Pickup: ETA retrocede desde hora de llegada a escuela
- Dropoff: ETA avanza desde hora de salida de escuela

#### 3.4.3 Recurrencia

| Tipo | Configuración | Ejemplo |
|------|---------------|---------|
| Diaria | Días de la semana | Lunes a Viernes |
| Semanal | Día específico | Solo Lunes |
| Mensual | Día del mes | Día 15 de cada mes |
| Única | Fecha específica | 20 de Enero 2025 |

**Regla**: El sistema crea viajes automáticamente según recurrencia.

#### 3.4.4 Reglas de Negocio

| Regla | Comportamiento |
|-------|----------------|
| Estudiante ya tiene ruta del mismo tipo | No aparece en selector |
| Vehículo sin capacidad suficiente | Advertencia visual |
| Conductor ya asignado a otra ruta misma hora | Advertencia visual |
| Eliminar ruta con viajes futuros | Confirmar cancelación de viajes |
| Desactivar ruta | Viajes futuros pasan a "skipped" |

---

### 3.5 Monitoreo de Viajes

**Propósito**: Supervisar viajes en tiempo real y revisar históricos.

#### 3.5.1 Vista de Hoy

**Secciones**:

1. **Viajes Activos** (en_progreso)
   - Mapa con ubicación de todos los vehículos
   - Lista con: ruta, vehículo, conductor, progreso (%), ETA escuela
   - Indicador de delay (a tiempo, retrasado, muy retrasado)
   - Badge de novedades aplicadas

2. **Viajes Programados** (scheduled)
   - Lista con: ruta, hora programada, vehículo, estudiantes
   - Badge de novedades pendientes para el viaje
   - Acción: cancelar viaje (con confirmación)

3. **Viajes Completados/Cancelados**
   - Lista con: ruta, hora inicio/fin, estudiantes transportados
   - Resumen de incidentes si los hubo

#### 3.5.2 Detalle de Viaje

**Información**:
- Estado actual
- Ruta, tipo, vehículo, conductor, monitor
- Mapa con recorrido en tiempo real
- Lista de estudiantes con estado (pending, aboard, delivered, absent, etc.)
- Cronología de eventos (inicio, paradas, check-ins, incidentes)
- Novedades aplicadas a este viaje

**Acciones** (según estado):
- scheduled: cancelar
- in_progress: ver mapa en vivo
- completed: exportar reporte

---

### 3.6 Gestión de Solicitudes

**Propósito**: Revisar y aprobar novedades de padres, gestionar incidentes.

#### 3.6.1 Novedades Pendientes

**Lista muestra**:
- Estudiante (nombre, grado, foto)
- Tipo de novedad (con icono y color configurado)
- Fecha(s) afectada(s)
- Ruta afectada
- Razón del padre
- Indicador de evidencia adjunta
- Tiempo desde creación

**Modal de revisión**:
- Toda la información de la novedad
- Galería de evidencia (si existe)
- Campo para notas de Admin (opcional)
- Botones: Aprobar / Rechazar

**Al rechazar**: campo obligatorio para motivo.

**Criterios de aceptación**:
- [ ] Novedades ordenadas por fecha afectada (más próximas primero)
- [ ] Evidencia visualizable sin descargar (imágenes)
- [ ] PDFs descargables
- [ ] Notificación automática a padre al aprobar/rechazar

#### 3.6.2 Incidentes Abiertos

**Lista muestra**:
- Tipo de incidente (con icono)
- Severidad (badge de color)
- Viaje asociado
- Descripción breve
- Tiempo desde reporte

**Acciones**:
- Marcar "en investigación"
- Resolver con notas

**Criterios de aceptación**:
- [ ] Incidentes críticos/altos siempre visibles arriba
- [ ] Al resolver, notificar a Crew que reportó
- [ ] Si tiene estudiante afectado, notificar a padres

---

### 3.7 Gestión de Usuarios

**Propósito**: Ver y administrar usuarios de la institución.

#### 3.7.1 Lista de Usuarios

**Filtros**:
- Por rol: todos, admin, conductor, monitor, padre
- Por estado: activo, inactivo
- Búsqueda por nombre/email

**Información mostrada**:
- Avatar, nombre, email
- Rol (con badge de color)
- Estado
- Último acceso

#### 3.7.2 Detalle de Usuario

**Secciones**:
- Información de contacto
- Rol y permisos
- Actividad (último login, fecha registro)
- Seguridad (intentos fallidos, bloqueos)

**Acciones**:
- Editar (nombre, teléfono, rol)
- Desactivar/Reactivar
- Resetear contraseña

#### 3.7.3 Invitación de Usuarios

**Flujo**:
1. Admin ingresa: email, nombre, rol
2. Sistema genera código de invitación (6 dígitos)
3. Email enviado con instrucciones
4. Usuario se registra usando código
5. Código expira en 7 días

---

### 3.8 Configuración

**Propósito**: Personalizar el comportamiento del sistema.

#### 3.8.1 Institución

| Configuración | Descripción |
|---------------|-------------|
| Logo | Imagen de la institución |
| Nombre | Nombre oficial |
| Dirección | Dirección física |
| Ubicación escuela | Lat/Lng (origen/destino de rutas) |
| Teléfono | Contacto principal |
| Email | Email oficial |
| Timezone | America/Guayaquil, America/Bogota, etc. |

#### 3.8.2 Grados

- Lista de grados disponibles (Prekinder, Kinder, 1ro, 2do, etc.)
- Orden personalizable
- Usado en formularios de estudiantes y filtros

#### 3.8.3 Tipos de Novedad

**Configuración por tipo**:

| Campo | Descripción | Impacto |
|-------|-------------|---------|
| Código | Identificador único | Queries y filtros |
| Nombre | Texto mostrado en UI | Todas las apps |
| Icono | Icono visual | Todas las apps |
| Color | Color del badge | Todas las apps |
| Categoría | Comportamiento (ver abajo) | Cómo se aplica al viaje |
| Requiere aprobación | Sí/No | Flujo de la novedad |
| Anticipación mínima | Horas antes del viaje | Validación al crear |
| Evidencia requerida | Sí/No/Opcional | Formulario del padre |
| Razón requerida | Sí/No | Formulario del padre |

**Categorías y su efecto**:

| Categoría | Efecto en estudiante del viaje |
|-----------|-------------------------------|
| `absence` | Estado → `absent`, no se espera |
| `pickup_change` | Estado → `parent_pickup`, no aborda |
| `stop_change` | Aparece en parada diferente |
| `time_change` | Solo informativo |
| `location_change` | Actualiza ubicación permanente |
| `other` | Solo informativo |

#### 3.8.4 Notificaciones

Toggles para habilitar/deshabilitar:
- Notificaciones de inicio de viaje
- Notificaciones de fin de viaje
- Alertas de retraso
- Notificaciones de incidentes
- Reporte diario por email

#### 3.8.5 Operación

| Configuración | Default | Descripción |
|---------------|---------|-------------|
| Velocidad promedio | 30 km/h | Para cálculo de ETAs |
| Intervalo GPS | 15 seg | Frecuencia de actualización |
| Umbral retraso | 10 min | Para notificar padres |
| Geofence parada | 100 m | Radio para detectar llegada |

---

## 4. Notificaciones Recibidas

| Evento | Prioridad | Acción esperada |
|--------|-----------|-----------------|
| Nueva novedad pendiente | Normal | Revisar y aprobar/rechazar |
| Incidente crítico | Alta | Atención inmediata |
| Incidente alto | Alta | Revisar pronto |
| Viaje con ausencias iniciado | Baja | Informativo |
| Cambio de ubicación de estudiante | Normal | Verificar si afecta rutas |

---

## 5. Integraciones Esperadas

| Sistema | Dirección | Datos |
|---------|-----------|-------|
| Email (Resend) | Salida | Invitaciones, notificaciones |
| GPS Devices | Entrada | Ubicación de vehículos |
| Storage | Entrada/Salida | Fotos, evidencia, QRs |

---

## 6. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Tiempo de revisión de novedad | < 2 horas |
| Tiempo de resolución de incidente crítico | < 30 min |
| Viajes completados vs programados | > 95% |
| Estudiantes con ubicación configurada | 100% |

---

## Referencias

- [Flujos Cross-App](./CROSS_APP_FLOWS.md) - Estados y transiciones compartidas
- [Crew PRD](./CREW_PRD.md) - App de conductores/monitores
- [Parent PRD](./PARENT_PRD.md) - App de padres
