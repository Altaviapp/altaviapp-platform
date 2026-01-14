# Prompt para Generar User Stories - Admin Dashboard

**Copia este prompt completo en una nueva sesión de Claude**

---

## PROMPT

```
Eres un Product Manager experto generando documentación de historias de usuario con wireframes ASCII detallados.

## Contexto

Estás trabajando en Altaviapp, una plataforma de transporte escolar con 3 apps:
- Admin Dashboard (coordinadores)
- Crew App (conductores/monitores)
- Parent Portal (padres)

Tu tarea es generar el documento completo de historias de usuario para el **Admin Dashboard**.

## Archivos de Referencia

Lee estos archivos antes de comenzar:

1. `docs/prd-v2/CROSS_APP_FLOWS.md` - Flujos compartidos entre apps
2. `docs/prd-v2/ADMIN_PRD.md` - PRD del Admin Dashboard
3. `docs/user-stories/TEMPLATE.md` - Template y formato a seguir

## Especificaciones del Admin Dashboard

### Navegación (Sidebar)

Generar historias en este orden:

1. **Componentes Globales**
   - Header con notificaciones
   - Sidebar de navegación
   - Breadcrumb

2. **Dashboard**
   - Vista principal con métricas

3. **Fleet (Flota)** - Con tabs
   - Lista de vehículos
   - Detalle de vehículo
   - Crear vehículo
   - Editar vehículo
   - Lista de conductores
   - Detalle de conductor
   - Invitar conductor
   - Editar conductor
   - Lista de monitores
   - Detalle de monitor
   - Invitar monitor
   - Editar monitor

4. **Students (Estudiantes)**
   - Lista de estudiantes
   - Detalle de estudiante
   - Crear estudiante (con detección de hogar)
   - Editar estudiante
   - Vista de QR
   - Importar CSV (wizard multi-step)

5. **Routes (Rutas)**
   - Lista de rutas
   - Detalle de ruta
   - Crear ruta (wizard 3 pasos)
   - Editar ruta

6. **Trips (Viajes)**
   - Monitoreo del día (viajes activos + programados)
   - Detalle de viaje
   - Mapa en vivo

7. **Incidents (Incidentes)**
   - Lista de incidentes
   - Detalle de incidente
   - Modal de resolución

8. **Requests (Solicitudes)**
   - Vista con tabs (Novedades / Incidentes)
   - Modal de revisión de novedad

9. **Users (Usuarios)**
   - Lista de usuarios
   - Detalle de usuario
   - Modal de invitación
   - Editar usuario

10. **Settings (Configuración)**
    - Tabs: Institución, Notificaciones, Seguridad, General
    - Configuración de grados
    - Configuración de tipos de novedad

### Nomenclatura

- Código: ADM-{MÓDULO}-{NÚMERO}
- Módulos: GLOB, AUTH, DASH, FLEET, STU, RTE, TRIP, INC, REQ, USR, SET

### Roles

- Super Admin: acceso total
- Admin/Coordinador: gestión de su institución

## Output Requerido

Genera un documento markdown completo con:

1. **Índice** - Lista de todas las historias organizadas por módulo

2. **Flujo de desarrollo** - Orden recomendado y dependencias

3. **Componentes reutilizables** - Lista con wireframes

4. **Historias detalladas** - Para CADA historia:
   - Código y nombre
   - Épica, prioridad, estimación
   - Dependencias (depende de / bloquea)
   - Descripción en formato "Como X quiero Y para Z"
   - Criterios de aceptación (checkboxes)
   - Wireframe ASCII detallado (desktop y mobile si aplica)
   - Estados de UI (loading, empty, error, success)
   - Interacciones (tabla: elemento, acción, resultado)
   - Datos requeridos (tabla: campo, tipo, fuente, actualización)
   - Funciones/Acciones (tabla: función, trigger, parámetros, efecto)
   - Validaciones si aplica
   - Navegación (viene de, va a, breadcrumb)

## Reglas de Wireframes

1. Ancho máximo: 80 caracteres
2. Usar caracteres: ┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼
3. Elementos:
   - [Botón] para botones
   - [____input____] para campos
   - (badge) para badges
   - [icon] para iconos
   - ● activo, ○ inactivo

4. Incluir estados vacíos y de error
5. Mostrar versión desktop Y mobile cuando sea diferente
6. Para formularios multi-step, mostrar CADA paso

## Estimación de Historias

Esperamos aproximadamente 50-60 historias para Admin Dashboard.

Comienza generando el documento completo.
```

---

## Resultado Esperado

Un archivo `ADMIN_USER_STORIES.md` con aproximadamente:

- 3 historias globales (Header, Sidebar, Breadcrumb)
- 3 historias de Dashboard
- 12 historias de Fleet (4 por entidad × 3 entidades)
- 8 historias de Students
- 5 historias de Routes
- 4 historias de Trips
- 4 historias de Incidents
- 3 historias de Requests
- 5 historias de Users
- 6 historias de Settings

**Total estimado: ~53 historias**
