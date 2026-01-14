# Prompt para Generar User Stories - Parent Portal

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

Tu tarea es generar el documento completo de historias de usuario para el **Parent Portal**.

## Archivos de Referencia

Lee estos archivos antes de comenzar:

1. `docs/prd-v2/CROSS_APP_FLOWS.md` - Flujos compartidos entre apps
2. `docs/prd-v2/PARENT_PRD.md` - PRD del Parent Portal
3. `docs/user-stories/TEMPLATE.md` - Template y formato a seguir

## Especificaciones del Parent Portal

### Navegación

**Desktop**: Sidebar izquierdo
**Mobile**: Bottom Navigation (4 tabs) + página de Notificaciones accesible desde header

Generar historias en este orden:

1. **Componentes Globales**
   - Header con badge de notificaciones
   - Sidebar (desktop) / Bottom Navigation (mobile)

2. **Home (Inicio/Tracking)**
   - Lista de hijos con estado actual
   - Card de tracking por hijo (colapsable)
   - Vista expandida con mapa de tracking
   - Estado sin viaje activo

3. **Calendar (Calendario)**
   - Vista semanal
   - Navegación entre semanas
   - Detalle de día

4. **Children (Mis Hijos)**
   - Lista de hijos
   - Perfil completo del hijo
   - Editar información (foto, ubicación, contactos)
   - Configurar ubicación (mapa interactivo)
   - Ver/descargar código QR
   - Historial de viajes del hijo

5. **History (Historial Global)**
   - Lista consolidada de viajes
   - Filtros por período y por hijo

6. **Notifications (Notificaciones)**
   - Lista agrupada por fecha
   - Filtros (todas / no leídas)
   - Acciones de marcar como leída

7. **Novedades**
   - Lista de novedades creadas (agrupadas por estado)
   - Crear novedad (wizard multi-step)
   - Detalle de novedad
   - Cancelar novedad

8. **Settings (Configuración)**
   - Información de cuenta
   - Preferencias de notificación
   - Preferencias de app
   - Seguridad

### Nomenclatura

- Código: PAR-{MÓDULO}-{NÚMERO}
- Módulos: GLOB, AUTH, HOME, CAL, CHILD, HIST, NOTIF, NOV, SET

### Usuario

- Rol único: Parent (padre/tutor)
- Puede tener múltiples hijos
- Puede ser tutor principal o secundario

## Output Requerido

Genera un documento markdown completo con:

1. **Índice** - Lista de todas las historias organizadas por módulo

2. **Flujo de desarrollo** - Orden recomendado y dependencias

3. **Componentes reutilizables** - Lista con wireframes

4. **Historias detalladas** - Para CADA historia:
   - Código y nombre
   - Épica, prioridad, estimación
   - Dependencias (depende de / bloquea)
   - Descripción en formato "Como padre/tutor quiero Y para Z"
   - Criterios de aceptación (checkboxes)
   - Wireframe ASCII detallado (desktop Y mobile)
   - Estados de UI (loading, empty, error, success)
   - Interacciones (tabla: elemento, acción, resultado)
   - Datos requeridos (tabla: campo, tipo, fuente, actualización)
   - Funciones/Acciones (tabla: función, trigger, parámetros, efecto)
   - Validaciones si aplica
   - Navegación (viene de, va a, breadcrumb)

## Reglas de Wireframes

1. Ancho máximo: 80 caracteres (desktop), 40 caracteres (mobile)
2. Usar caracteres: ┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼
3. Elementos:
   - [Botón] para botones
   - [____input____] para campos
   - (badge) para badges
   - [icon] para iconos
   - ● activo, ○ inactivo

4. Bottom Navigation (mobile):
```
├────────┬────────┬────────┬────────┤
│ [🏠]   │ [📅]   │ [👶]   │ [📜]   │
│ Inicio │  Cal   │ Hijos  │ Hist   │
└────────┴────────┴────────┴────────┘
```

5. Para tracking con mapa:
```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │
│ ║        [MAPA]                 ║   │
│ ║    🚌 ──── 🏠 ──── 🏫        ║   │
│ ║           ↑                   ║   │
│ ║      Parada Juan              ║   │
│ ╚═══════════════════════════════╝   │
└─────────────────────────────────────┘
```

6. Card de tracking expandible:
```
┌─────────────────────────────────────┐
│ [foto] Juan Pérez         (En ruta) │
│        3er Grado                    │
│ ────────────────────────────────────│
│ Ruta Norte AM                       │
│ ████████░░░░░░░░ 50%               │
│ ETA: 7:45 AM (en 15 min)           │
│ Conductor: Carlos M.               │
│                           [Expandir]│
└─────────────────────────────────────┘
```

7. Para crear novedad (wizard), mostrar CADA paso con sus campos

## Consideraciones Especiales

1. **Multi-hijo**: UI debe adaptarse a 1 hijo vs múltiples hijos
2. **Tracking en tiempo real**: Indicar actualización automática
3. **Novedades con evidencia**: Mostrar upload y preview de archivos
4. **Tipos de novedad dinámicos**: Vienen de configuración de Admin
5. **Estados de novedad**: Mostrar claramente el flujo pending → approved → acknowledged → applied

## Flujo de Novedades (detallado)

El wizard de crear novedad debe tener:
1. Selección de hijo (si múltiples)
2. Selección de tipo de novedad (dinámico)
3. Selección de fechas (según tipo de duración)
4. Selección de ruta afectada
5. Razón (si requerida)
6. Evidencia (si requerida/opcional)
7. Confirmación

Cada paso debe ser una parte del wireframe o sub-historia.

## Estimación de Historias

Esperamos aproximadamente 35-40 historias para Parent Portal.

Comienza generando el documento completo.
```

---

## Resultado Esperado

Un archivo `PARENT_USER_STORIES.md` con aproximadamente:

- 2 historias globales (Header, Navigation)
- 4 historias de Home/Tracking
- 3 historias de Calendar
- 7 historias de Children
- 2 historias de History
- 3 historias de Notifications
- 8 historias de Novedades (incluyendo wizard)
- 4 historias de Settings

**Total estimado: ~35 historias**

## Notas Especiales para Parent

1. **Tracking es el core**: El módulo Home/Tracking es el más importante
2. **Multi-hijo**: Siempre considerar el caso de múltiples hijos
3. **Novedades**: El wizard de creación es el flujo más complejo
4. **Estados visuales**: Los padres necesitan ver claramente el estado de sus novedades
5. **Contacto directo**: Botones de llamar/WhatsApp al conductor son críticos
