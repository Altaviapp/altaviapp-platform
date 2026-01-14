# Generador de Historias de Usuario con Wireframes

**Propósito**: Instrucciones para generar documentación detallada de historias de usuario para cada app de Altaviapp.

---

## Cómo Usar Este Documento

1. Abre una nueva sesión de Claude
2. Copia el **Prompt Base** de abajo
3. Reemplaza `{APP_NAME}` con: `admin`, `crew`, o `parent`
4. Claude generará el documento completo de historias de usuario

---

## Prompt Base

```
Lee los siguientes documentos de PRD para contexto:
- docs/prd-v2/CROSS_APP_FLOWS.md
- docs/prd-v2/{APP_NAME}_PRD.md (donde APP_NAME = ADMIN, CREW, o PARENT)

Genera un documento completo de historias de usuario para la app {APP_NAME} siguiendo estas especificaciones:

## Estructura del Documento

El documento debe seguir este orden de desarrollo:

### 1. Componentes Globales (desarrollar primero)
- Header con notificaciones
- Sidebar / Bottom Navigation
- Componentes de layout compartidos

### 2. Páginas en orden del Sidebar
Para cada página del sidebar, documentar en este orden:
- Vista principal (lista/dashboard)
- Vista de detalle
- Vista de edición
- Vista de creación
- Modales y formularios relacionados

## Formato de Cada Historia de Usuario

```markdown
## [CÓDIGO] Nombre de la Historia

**Épica**: [Nombre del módulo]
**Prioridad**: Alta | Media | Baja
**Estimación**: XS | S | M | L | XL

### Descripción
Como [rol], quiero [acción], para [beneficio].

### Criterios de Aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] ...

### Wireframe

[Wireframe en ASCII art detallado]

### Estados de UI
| Estado | Visualización |
|--------|---------------|
| Loading | ... |
| Empty | ... |
| Error | ... |
| Success | ... |

### Interacciones
| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Botón X | Click | Navega a Y |
| ... | ... | ... |

### Datos Requeridos
| Campo | Tipo | Fuente | Actualización |
|-------|------|--------|---------------|
| ... | ... | Query X | Real-time |

### Funciones/Acciones
| Función | Trigger | Parámetros | Efecto |
|---------|---------|------------|--------|
| ... | ... | ... | ... |

### Validaciones
| Campo | Regla | Mensaje de Error |
|-------|-------|------------------|
| ... | ... | ... |

### Navegación
- Viene de: [página anterior]
- Va a: [páginas posibles]
- Breadcrumb: Home > ... > Esta página
```

## Reglas para Wireframes ASCII

1. Usar caracteres: ┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼
2. Ancho máximo: 80 caracteres
3. Incluir:
   - Header con título y acciones
   - Áreas de contenido claramente delimitadas
   - Botones con [Texto]
   - Inputs con [____input____]
   - Badges con (badge)
   - Iconos con descripción: 🔔 o [icon:bell]
   - Estados vacíos
   - Loading states

## Reglas de Nomenclatura

- Código de historia: {APP}-{MÓDULO}-{NÚMERO}
  - Ejemplo: ADM-FLEET-001, CRW-TRIP-003, PAR-NOV-002
- Módulos Admin: AUTH, DASH, FLEET, STU, RTE, TRIP, INC, REQ, USR, SET
- Módulos Crew: AUTH, DASH, RTE, CAL, TRIP, PROF
- Módulos Parent: AUTH, HOME, CAL, CHILD, HIST, NOTIF, NOV, SET

## Secciones Requeridas del Documento Final

1. Índice de Historias
2. Flujo de Desarrollo Recomendado
3. Dependencias entre Historias
4. Componentes Reutilizables
5. Historias por Módulo (en orden)

Genera el documento completo para la app {APP_NAME}.
```

---

## Parámetros por App

### Admin Dashboard

```yaml
APP_NAME: ADMIN
PRD_FILE: docs/prd-v2/ADMIN_PRD.md
OUTPUT_FILE: docs/user-stories/ADMIN_USER_STORIES.md

SIDEBAR_ORDER:
  1. Dashboard
  2. Fleet (Vehículos, Conductores, Monitores)
  3. Students
  4. Routes
  5. Trips
  6. Incidents
  7. Requests (Novedades, Incidentes)
  8. Users
  9. Settings

MODULES:
  - AUTH: Autenticación (login, registro, verificación, reset)
  - DASH: Dashboard principal
  - FLEET: Gestión de flota (vehículos, conductores, monitores)
  - STU: Gestión de estudiantes
  - RTE: Gestión de rutas
  - TRIP: Monitoreo de viajes
  - INC: Gestión de incidentes
  - REQ: Solicitudes (novedades pendientes)
  - USR: Gestión de usuarios
  - SET: Configuración

TOTAL_STORIES_ESTIMATE: 45-55
```

### Crew App

```yaml
APP_NAME: CREW
PRD_FILE: docs/prd-v2/CREW_PRD.md
OUTPUT_FILE: docs/user-stories/CREW_USER_STORIES.md

NAVIGATION_ORDER:
  1. Dashboard (Inicio)
  2. Calendar
  3. Routes
  4. Profile

MODULES:
  - AUTH: Autenticación
  - DASH: Dashboard/Inicio
  - RTE: Rutas asignadas
  - CAL: Calendario
  - TRIP: Viajes (checklist, activo, estudiantes, incidentes)
  - PROF: Perfil y configuración

TOTAL_STORIES_ESTIMATE: 35-45
```

### Parent Portal

```yaml
APP_NAME: PARENT
PRD_FILE: docs/prd-v2/PARENT_PRD.md
OUTPUT_FILE: docs/user-stories/PARENT_USER_STORIES.md

NAVIGATION_ORDER:
  1. Inicio (Tracking)
  2. Calendario
  3. Mis Hijos
  4. Historial
  5. Notificaciones

MODULES:
  - AUTH: Autenticación
  - HOME: Inicio/Tracking
  - CAL: Calendario
  - CHILD: Gestión de hijos
  - HIST: Historial
  - NOTIF: Notificaciones
  - NOV: Novedades
  - SET: Configuración

TOTAL_STORIES_ESTIMATE: 30-40
```

---

## Ejemplo de Output Esperado

```markdown
# Admin Dashboard - Historias de Usuario

## Índice

### Componentes Globales
- [ADM-GLOB-001] Header con notificaciones
- [ADM-GLOB-002] Sidebar de navegación
- [ADM-GLOB-003] Breadcrumb de navegación

### Módulo: Dashboard
- [ADM-DASH-001] Vista principal del dashboard
- [ADM-DASH-002] Tarjeta de métricas en tiempo real
- [ADM-DASH-003] Sección de viajes activos

### Módulo: Fleet - Vehículos
- [ADM-FLEET-001] Lista de vehículos
- [ADM-FLEET-002] Detalle de vehículo
- [ADM-FLEET-003] Crear vehículo
- [ADM-FLEET-004] Editar vehículo
...

---

## ADM-GLOB-001: Header con Notificaciones

**Épica**: Componentes Globales
**Prioridad**: Alta
**Estimación**: M

### Descripción
Como administrador, quiero ver un header persistente con acceso a notificaciones, para estar informado de eventos importantes sin salir de mi vista actual.

### Criterios de Aceptación
- [ ] Header visible en todas las páginas autenticadas
- [ ] Badge muestra conteo de notificaciones no leídas
- [ ] Click en campana abre dropdown de notificaciones
- [ ] Notificaciones ordenadas por fecha (más reciente primero)
- [ ] Click en notificación navega al recurso relacionado
- [ ] Opción "Marcar todas como leídas"

### Wireframe

┌─────────────────────────────────────────────────────────────────────────────┐
│ [≡]  Altaviapp Admin                                        🔔(3)  [JD ▼]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                    ┌───────────────────────┐│
│                                                    │ Notificaciones    [x] ││
│                                                    ├───────────────────────┤│
│                                                    │ ● Nueva novedad       ││
│                                                    │   Ausencia - Juan P.  ││
│                                                    │   Hace 5 min          ││
│                                                    ├───────────────────────┤│
│                                                    │ ● Incidente crítico   ││
│                                                    │   Accidente Ruta Norte││
│                                                    │   Hace 12 min         ││
│                                                    ├───────────────────────┤│
│                                                    │ ○ Viaje completado    ││
│                                                    │   Ruta Sur AM         ││
│                                                    │   Hace 1 hora         ││
│                                                    ├───────────────────────┤│
│                                                    │ [Marcar todas leídas] ││
│                                                    │ [Ver todas →]         ││
│                                                    └───────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────┘

Leyenda:
● = No leída (punto azul)
○ = Leída
🔔(3) = Campana con badge de conteo

### Estados de UI
| Estado | Visualización |
|--------|---------------|
| Sin notificaciones | Badge oculto, dropdown muestra "No hay notificaciones" |
| Con no leídas | Badge con número, dropdown con lista |
| Todas leídas | Badge oculto, dropdown con lista sin puntos |
| Cargando | Skeleton en dropdown |
| Error | Mensaje "Error al cargar" con botón reintentar |

### Interacciones
| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Campana | Click | Toggle dropdown |
| Notificación | Click | Navega a recurso, marca como leída |
| "Marcar todas" | Click | Todas pasan a leídas, badge desaparece |
| "Ver todas" | Click | Navega a /notifications |
| Fuera del dropdown | Click | Cierra dropdown |

### Datos Requeridos
| Campo | Tipo | Fuente | Actualización |
|-------|------|--------|---------------|
| notifications | array | useUnreadNotifications(10) | Real-time |
| unreadCount | number | useUnreadCount() | Real-time |

### Funciones/Acciones
| Función | Trigger | Parámetros | Efecto |
|---------|---------|------------|--------|
| markAsRead | Click notificación | notificationId | Marca individual |
| markAllAsRead | Click botón | - | Marca todas |
| navigate | Click notificación | relatedEntityType, relatedEntityId | Navega |

---
```

---

## Orden de Generación Recomendado

1. **Primero**: Admin (es la app más completa, define patrones)
2. **Segundo**: Crew (reutiliza patrones, agrega especificidades móviles)
3. **Tercero**: Parent (app más simple, reutiliza todo lo anterior)

---

## Checklist Post-Generación

Después de generar cada documento, verificar:

- [ ] Todas las páginas del sidebar tienen historias
- [ ] Cada historia tiene wireframe ASCII
- [ ] Flujos multi-step tienen todos los pasos
- [ ] Modales documentados como historias separadas
- [ ] Estados de error y vacío definidos
- [ ] Interacciones completas
- [ ] Referencias cruzadas a PRD v2 correctas
- [ ] Nomenclatura consistente
