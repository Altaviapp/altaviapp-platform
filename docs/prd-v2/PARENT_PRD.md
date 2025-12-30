# Parent Portal - PRD v2

**App**: Parent Portal (Portal Padres)
**Usuarios**: Padres y tutores de estudiantes
**Versión**: 2.0
**Fecha**: Diciembre 2024

---

## 1. Propósito

El Parent Portal permite a padres y tutores seguir en tiempo real el transporte de sus hijos, recibir notificaciones de eventos importantes, y comunicar excepciones al horario normal (novedades).

---

## 2. Usuarios y Permisos

| Rol | Alcance | Capacidades |
|-----|---------|-------------|
| **Parent** | Sus hijos únicamente | Tracking, novedades, historial |

### Reglas de acceso

- Un parent solo ve estudiantes vinculados a su email (tutor principal o secundario)
- Puede haber múltiples hijos por parent (hogar)
- Puede haber dos tutores por estudiante (principal y secundario)
- Ambos tutores tienen los mismos permisos sobre el estudiante

---

## 3. Módulos Funcionales

### 3.1 Inicio (Tracking)

**Propósito**: Ver el estado actual de todos los hijos y hacer seguimiento en tiempo real.

#### 3.1.1 Vista Principal

**Por cada hijo**:

**Tarjeta de tracking** muestra:
- Foto/avatar del estudiante
- Nombre y grado
- Badge de estado actual:

| Estado | Color | Significado |
|--------|-------|-------------|
| En ruta | Azul | Viaje activo, estudiante esperado o a bordo |
| En la escuela | Verde | Estudiante fue entregado en la escuela |
| En casa | Gris | Estudiante fue entregado en casa |
| Regresando | Naranja | Viaje de regreso activo |
| Programado | Amarillo | Viaje programado, no iniciado aún |
| Sin viaje | Gris claro | No hay viaje para hoy |

- Nombre de la ruta (si hay viaje)
- Barra de progreso del viaje (% completado)
- ETA con hora estimada de llegada
- Indicador de delay si aplica:
  - A tiempo (verde)
  - Ligero retraso < 5 min (amarillo)
  - Retrasado 5-15 min (naranja)
  - Muy retrasado > 15 min (rojo)
- Nombre del conductor

**Acción**: Expandir tarjeta para ver mapa

#### 3.1.2 Vista Expandida (Mapa de Tracking)

Al expandir la tarjeta:

**Mapa interactivo** muestra:
- Ubicación actual del vehículo (con dirección de movimiento)
- Polilínea de la ruta completa
- Marcadores de todas las paradas
- Parada del estudiante resaltada
- Escuela marcada
- Paradas completadas vs pendientes (colores diferentes)

**Panel de información**:
- Punto de recogida/entrega del estudiante
- ETA detallado
- Velocidad actual del vehículo
- Datos del conductor:
  - Nombre
  - Foto (si disponible)
- Datos del vehículo:
  - Placa
  - Modelo/color

**Acciones de contacto**:
- Botón llamar (abre tel:)
- Botón WhatsApp (abre wa.me)

#### 3.1.3 Sin Viaje Activo

Si no hay viaje para el estudiante hoy:
- Mensaje informativo
- Próximo viaje programado (si existe)
- Botón "Crear Novedad" para informar ausencia u otra excepción

**Criterios de aceptación**:
- [ ] Datos de ubicación se actualizan cada 15 segundos
- [ ] ETA se recalcula con cada actualización
- [ ] Notificación visual cuando estudiante hace check-in
- [ ] Mapa se puede hacer zoom y pan

---

### 3.2 Calendario

**Propósito**: Ver el horario semanal de transporte de los hijos.

#### 3.2.1 Vista Semanal

**Layout**:
- 7 columnas (Domingo a Sábado)
- Día actual resaltado
- Navegación: semana anterior / siguiente

**Por cada día**:
- Tarjetas de viajes programados
- Por tarjeta:
  - Tipo (Recogida / Entrega)
  - Hora programada
  - Nombre de la ruta
  - Conductor asignado

**Si múltiples hijos**:
- Selector de hijo arriba
- O vista consolidada con colores por hijo

#### 3.2.2 Estados en Calendario

| Estado del día | Visualización |
|----------------|---------------|
| Viaje completado | Check verde |
| Viaje programado | Normal |
| Novedad de ausencia | Tachado |
| Sin viaje (no aplica recurrencia) | Vacío |

**Criterios de aceptación**:
- [ ] Tap en día muestra detalle de viajes
- [ ] Novedades se reflejan visualmente
- [ ] Fácil navegación entre semanas

---

### 3.3 Mis Hijos

**Propósito**: Ver y gestionar información de los estudiantes.

#### 3.3.1 Lista de Hijos

**Por cada hijo**:
- Foto/avatar
- Nombre y apellido
- Grado
- Estado (activo/inactivo)
- Indicadores:
  - ✓ Ubicación configurada
  - ✓ Foto subida
  - ✓ QR generado

#### 3.3.2 Perfil del Hijo

**Secciones**:

1. **Información Personal**
   - Foto grande
   - Nombre completo
   - Grado/curso
   - Fecha de nacimiento (con edad calculada)
   - Estado

2. **Ubicación de Hogar**
   - Dirección
   - Mapa con marcador
   - Botón "Editar ubicación"

3. **Contactos**
   - Teléfono principal
   - Teléfono secundario
   - Email de tutor
   - Contacto de emergencia

4. **Código QR**
   - Vista del QR
   - Botón descargar
   - Botón imprimir

5. **Rutas Asignadas**
   - Lista de rutas (recogida y entrega)
   - Horarios y paradas

#### 3.3.3 Editar Información

**Campos editables por el parent**:

| Campo | Editable | Notas |
|-------|:--------:|-------|
| Foto | ✅ | Max 5MB, JPG/PNG/WebP |
| Dirección de hogar | ✅ | Requiere confirmación |
| Ubicación GPS | ✅ | Selector de mapa |
| Teléfono de contacto | ✅ | - |
| Contacto emergencia secundario | ✅ | - |

**Campos NO editables** (requieren Admin):
- Nombre
- Apellido
- Grado
- Email de tutor

#### 3.3.4 Configurar Ubicación

**Flujo**:
1. Mapa interactivo
2. Opciones:
   - Buscar dirección (geocoding)
   - Usar ubicación actual
   - Tap en mapa para seleccionar
3. Confirmar ubicación
4. Guardar

**Impacto del cambio de ubicación**:
- Si el estudiante tiene ruta asignada:
  - Sistema evalúa si nueva ubicación está en zona de cobertura
  - Si está en zona: se actualiza parada, se recalcula ETA
  - Si está fuera de zona: Admin notificado para reasignar

#### 3.3.5 Historial del Hijo

- Lista de viajes pasados del estudiante
- Filtros: 7, 30, 90 días
- Por viaje:
  - Fecha
  - Ruta y tipo
  - Conductor
  - Estado del estudiante (a bordo, entregado, ausente)
  - Hora de check-in/check-out

---

### 3.4 Historial Global

**Propósito**: Vista consolidada de viajes de todos los hijos.

**Filtros**:
- Por período: 7, 30, 90 días
- Por hijo (si tiene múltiples)
- Por tipo: todos, recogida, entrega

**Lista muestra**:
- Fecha
- Estudiante (si múltiples hijos)
- Ruta
- Estado
- Hora de eventos clave

---

### 3.5 Novedades

**Propósito**: Comunicar excepciones al transporte normal.

#### 3.5.1 Crear Novedad

**Paso 1 - Seleccionar hijo**
- Si tiene múltiples hijos: selector
- Si tiene uno solo: preseleccionado

**Paso 2 - Seleccionar tipo de novedad**

Los tipos son configurables por institución. Tipos comunes:

| Tipo | Descripción | Requiere Aprobación |
|------|-------------|:-------------------:|
| Ausencia | Estudiante no usará el bus | Sí |
| Recoge padre | Padre recogerá al estudiante | **No** |
| Cambio de parada | Recoger/entregar en otra ubicación | Sí |
| Salida temprana | Estudiante sale antes de hora normal | Sí |
| Llegada tarde | Estudiante llegará tarde | Sí |
| Ausencia médica | Ausencia con justificación médica | Sí |
| Cambio de domicilio | Nueva ubicación permanente | Sí |

**Paso 3 - Fechas afectadas**

Según el tipo de duración configurado:

| Tipo duración | Campos | Ejemplo |
|---------------|--------|---------|
| Un día | Selector de fecha | 15 de enero |
| Rango de fechas | Fecha inicio y fin | 15-30 de enero |
| Permanente | Solo fecha inicio | Desde 15 de enero |
| Recurrente | Fecha inicio + días semana | Desde 15 enero, solo L-M-V |

**Paso 4 - Ruta afectada**

- Selector de ruta del estudiante
- Opciones:
  - Ruta específica (Recogida AM)
  - Todas las rutas del día

**Paso 5 - Detalles**

- Razón/motivo (texto)
  - Requerido según configuración del tipo
- Evidencia (archivos)
  - Requerido/opcional según configuración
  - Tipos: imágenes, PDF
  - Límite: configurable (default 5 archivos, 10MB cada uno)

**Paso 6 - Confirmar y enviar**

**Validaciones antes de enviar**:

| Validación | Mensaje si falla |
|------------|------------------|
| Fecha es futura | "No puedes crear novedades para fechas pasadas" |
| Anticipación mínima | "Este tipo requiere {X} horas de anticipación" |
| No hay duplicada | "Ya existe una novedad para esta fecha" |
| Evidencia requerida | "Este tipo requiere adjuntar evidencia" |
| Razón requerida | "Debes ingresar un motivo" |

#### 3.5.2 Lista de Novedades

**Agrupación**:

1. **Pendientes de aprobación**
   - Novedades en estado `pending`
   - Badge amarillo

2. **Próximas** (aprobadas, fecha futura)
   - Novedades en estado `approved` o `acknowledged`
   - Badge verde

3. **Historial** (pasadas)
   - Novedades `applied`, `rejected`, `cancelled`, `expired`

**Por cada novedad**:
- Icono y color del tipo
- Nombre del hijo
- Fecha(s) afectada(s)
- Razón (truncada)
- Badge de estado
- Indicador de evidencia adjunta (clip + cantidad)

#### 3.5.3 Estados de Novedad (Vista Parent)

| Estado | Badge | Significado | Acción disponible |
|--------|-------|-------------|-------------------|
| `pending` | Pendiente (amarillo) | Esperando revisión de coordinador | Cancelar |
| `approved` | Aprobada (verde) | Aprobada, esperando confirmación del conductor | Cancelar |
| `rejected` | Rechazada (rojo) | Rechazada por coordinador (ver motivo) | - |
| `acknowledged` | Confirmada (azul) | Conductor confirmó la novedad | - |
| `applied` | Aplicada (gris) | Ya se aplicó al viaje | - |
| `cancelled` | Cancelada (gris) | Cancelada por el padre | - |
| `expired` | Expirada (gris) | Fecha pasó sin aplicar | - |

#### 3.5.4 Cancelar Novedad

**Disponible cuando**:
- Estado es `pending` o `approved`
- Fecha del viaje es futura

**Flujo**:
1. Tap "Cancelar"
2. Confirmación
3. Novedad pasa a `cancelled`
4. Notificación a Crew (si ya estaba `approved`)

**No disponible cuando**:
- Estado es `acknowledged` (Crew ya lo vio, contactar coordinador)
- Estado es `applied` (ya se ejecutó)
- Fecha ya pasó

#### 3.5.5 Caso Especial: Recoge Padre

El tipo `parent_pickup` tiene flujo especial:
- **No requiere aprobación**
- Al crear: pasa directamente a `acknowledged`
- Notificación inmediata a Crew
- Estudiante marcado como "recoge padre" en el viaje

**Razón**: Es una comunicación informativa, no una solicitud.

---

### 3.6 Notificaciones

**Propósito**: Centro de todas las notificaciones recibidas.

#### 3.6.1 Lista de Notificaciones

**Agrupación**:
- Hoy
- Ayer
- Esta semana
- Anteriores

**Filtros**:
- Todas / No leídas
- Por hijo (si múltiples)

#### 3.6.2 Tipos de Notificación

| Tipo | Icono | Color | Ejemplo |
|------|-------|-------|---------|
| Check-in | ✓ | Verde | "Juan ha subido al bus" |
| Check-out | ✓ | Verde | "Juan ha sido entregado" |
| Viaje iniciado | Bus | Azul | "El bus de Juan ha iniciado" |
| Viaje completado | Bus | Azul | "El viaje ha terminado" |
| ETA actualizado | Reloj | Amarillo | "Nueva hora: 7:45 AM" |
| Novedad aprobada | ✓ | Verde | "Tu novedad fue aprobada" |
| Novedad rechazada | ✗ | Rojo | "Tu novedad fue rechazada" |
| Novedad confirmada | ✓ | Azul | "El conductor confirmó" |
| Incidente | ⚠ | Rojo/Naranja | "Incidente reportado" |
| Cambio vehículo | ↻ | Morado | "El bus cambió a ABC-123" |

#### 3.6.3 Acciones

- Tap: marca como leída
- "Marcar todas como leídas"
- Deep link según tipo (ver tracking, ver novedad, etc.)

---

### 3.7 Configuración

**Propósito**: Preferencias de la cuenta y app.

#### 3.7.1 Información de Cuenta

- Nombre
- Email (no editable)
- Teléfono principal
- Teléfono alternativo

#### 3.7.2 Seguridad

- Cambiar contraseña
- Sesiones activas

#### 3.7.3 Preferencias de Notificación

| Notificación | Default |
|--------------|---------|
| Inicio de viaje | ✅ |
| Fin de viaje | ✅ |
| Check-in / Check-out | ✅ |
| Alertas de retraso | ✅ |
| Incidentes | ✅ |
| Actualizaciones de novedad | ✅ |

#### 3.7.4 Preferencias de App

- Idioma (Español, English)
- Zona horaria
- Formato de fecha
- Formato de hora
- Tipo de mapa (calles, satélite)

#### 3.7.5 Legal y Ayuda

- Términos de servicio
- Política de privacidad
- FAQ
- Contactar soporte

---

## 4. Notificaciones

### 4.1 Notificaciones Recibidas

| Evento | Prioridad | Canal |
|--------|-----------|-------|
| Estudiante abordó | Alta | Push + In-app |
| Estudiante entregado | Alta | Push + In-app |
| Viaje iniciado | Normal | Push |
| Viaje completado | Normal | In-app |
| ETA > 10 min de diferencia | Normal | Push |
| Novedad aprobada | Normal | Push + In-app |
| Novedad rechazada | Alta | Push + In-app |
| Novedad confirmada por Crew | Baja | In-app |
| Incidente (si afecta a hijo) | Alta | Push + In-app |
| Cambio de vehículo | Normal | Push |

### 4.2 Notificaciones Generadas

| Acción del Parent | Destinatario |
|-------------------|--------------|
| Crear novedad | Admin (para revisar) |
| Cancelar novedad | Crew (si ya estaba approved) |

---

## 5. Flujo de Onboarding

### 5.1 Registro por Invitación

**Flujo**:
1. Admin crea estudiante con email del parent
2. Parent recibe email con código de invitación
3. Parent abre app → "Tengo código de invitación"
4. Ingresa código + crea contraseña
5. Verificación de email (código 6 dígitos)
6. Acceso a la app

### 5.2 Primer Uso

**Checklist recomendado**:
1. Verificar datos de hijos
2. Configurar ubicación de hogar (si no está)
3. Descargar código QR
4. Habilitar notificaciones

---

## 6. Requisitos No Funcionales

### 6.1 PWA

- Instalable en iOS y Android
- Responsive (mobile-first)
- Funciona en navegador desktop

### 6.2 Performance

| Métrica | Objetivo |
|---------|----------|
| Carga inicial | < 3 segundos |
| Actualización de tracking | < 2 segundos |
| Carga de mapa | < 3 segundos |

### 6.3 Offline

- Modo degradado: puede ver última ubicación conocida
- Cola de novedades si no hay conexión (se envían al recuperar)

---

## 7. Casos de Error

| Escenario | Comportamiento |
|-----------|----------------|
| Sin conexión | Mensaje claro, última data cacheada |
| Viaje sin GPS | "Ubicación no disponible" |
| Error al crear novedad | Mensaje de error, no pierde datos del form |
| Código QR no carga | Mensaje + botón reintentar |

---

## 8. Multi-hijo

### 8.1 Comportamiento General

- Tracking muestra tarjeta por cada hijo
- Calendario puede mostrar consolidado o por hijo
- Historial filtrable por hijo
- Novedades se crean por hijo individual

### 8.2 Tutor Secundario

- Mismo acceso que tutor principal
- Ve los mismos estudiantes
- Puede crear novedades
- Recibe mismas notificaciones

---

## 9. Métricas de Éxito

| Métrica | Objetivo |
|---------|----------|
| Parents con ubicación configurada | 100% |
| Novedades creadas con anticipación | > 90% |
| Tiempo promedio de respuesta a notificación | < 5 min |
| Parents con notificaciones habilitadas | > 80% |

---

## Referencias

- [Flujos Cross-App](./CROSS_APP_FLOWS.md) - Estados y transiciones compartidas
- [Admin PRD](./ADMIN_PRD.md) - App de administración
- [Crew PRD](./CREW_PRD.md) - App de conductores/monitores
