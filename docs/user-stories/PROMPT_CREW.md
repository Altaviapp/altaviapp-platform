# Prompt para Generar User Stories - Crew App

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

Tu tarea es generar el documento completo de historias de usuario para la **Crew App**.

## Archivos de Referencia

Lee estos archivos antes de comenzar:

1. `docs/prd-v2/CROSS_APP_FLOWS.md` - Flujos compartidos entre apps
2. `docs/prd-v2/CREW_PRD.md` - PRD de la Crew App
3. `docs/user-stories/TEMPLATE.md` - Template y formato a seguir

## Especificaciones de la Crew App

### Navegación (Bottom Navigation en mobile)

Generar historias en este orden:

1. **Componentes Globales**
   - Header con notificaciones (mobile-optimized)
   - Bottom Navigation (4 tabs)
   - FAB de viaje activo (floating action button)

2. **Dashboard (Inicio)**
   - Vista principal con rutas del día
   - Card de novedades del día
   - Estadísticas semanales
   - Lista de notificaciones recientes

3. **Calendar (Calendario)**
   - Vista mensual
   - Indicadores de viajes por día
   - Navegación entre meses

4. **Routes (Rutas)**
   - Lista de rutas asignadas
   - Detalle de ruta
   - Confirmación de inicio

5. **Trips (Viajes)** - Módulo más complejo
   - Pre-inicio de viaje (con banner de novedades)
   - Checklist pre-viaje (multi-step, solo conductor)
   - Viaje activo (mapa + próxima parada + acciones)
   - Check-in de estudiantes (QR + manual)
   - Lista de estudiantes del viaje
   - Detalle de estudiante con novedad
   - Modal de reporte de incidente (3 pasos)
   - Modal de relevo/cambio de vehículo
   - Detalles del viaje (tabs: info + cronología)
   - Terminar viaje (confirmación)

6. **Profile (Perfil)**
   - Tab: Información personal
   - Tab: Historial de viajes
   - Tab: Configuración
   - Editar perfil

### Nomenclatura

- Código: CRW-{MÓDULO}-{NÚMERO}
- Módulos: GLOB, AUTH, DASH, CAL, RTE, TRIP, PROF

### Roles y Diferencias

| Funcionalidad | Conductor | Monitor |
|---------------|:---------:|:-------:|
| Checklist | ✅ | ❌ |
| Iniciar/terminar viaje | ✅ | ❌ |
| GPS tracking | ✅ | ❌ |
| Check-in QR | Solo sin monitor | ✅ |
| Reportar incidentes | ❌ | ✅ |
| Ver novedades | ✅ | ✅ |
| Acusar recibo novedad | ❌ | ✅ |
| Relevo vehículo | ✅ | ❌ |

**IMPORTANTE**: Documentar qué ve cada rol cuando una funcionalidad no está disponible para ellos.

## Output Requerido

Genera un documento markdown completo con:

1. **Índice** - Lista de todas las historias organizadas por módulo

2. **Flujo de desarrollo** - Orden recomendado y dependencias

3. **Componentes reutilizables** - Lista con wireframes (mobile-first)

4. **Historias detalladas** - Para CADA historia:
   - Código y nombre
   - Épica, prioridad, estimación
   - Dependencias (depende de / bloquea)
   - **Roles**: Conductor | Monitor | Ambos
   - Descripción en formato "Como X quiero Y para Z"
   - Criterios de aceptación (checkboxes)
   - Wireframe ASCII detallado (MOBILE FIRST, desktop secundario)
   - Estados de UI (loading, empty, error, success)
   - Interacciones (tabla: elemento, acción, resultado)
   - Datos requeridos (tabla: campo, tipo, fuente, actualización)
   - Funciones/Acciones (tabla: función, trigger, parámetros, efecto)
   - Validaciones si aplica
   - Navegación (viene de, va a)

## Reglas de Wireframes

1. **MOBILE FIRST** - Ancho: 40 caracteres para mobile
2. Usar caracteres: ┌ ┐ └ ┘ ─ │ ├ ┤ ┬ ┴ ┼
3. Elementos:
   - [Botón] para botones
   - [____input____] para campos
   - (badge) para badges
   - [icon] para iconos
   - ● activo, ○ inactivo

4. Bottom Navigation siempre visible:
```
├────────┬────────┬────────┬────────┤
│ [🏠]   │ [📅]   │ [🛣]   │ [👤]   │
│ Inicio │  Cal   │ Rutas  │ Perfil │
└────────┴────────┴────────┴────────┘
```

5. Para el viaje activo, mostrar mapa simplificado:
```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │
│ ║        [MAPA]                 ║   │
│ ║    🚌 ──────── 📍             ║   │
│ ║                               ║   │
│ ╚═══════════════════════════════╝   │
└─────────────────────────────────────┘
```

6. Touch targets mínimo 44x44px (indicar en wireframes)

7. Para modales de incidentes y check-in, mostrar CADA paso

## Consideraciones PWA

- Indicar estados offline
- Permisos de dispositivo (GPS, cámara, notificaciones)
- QR scanner como componente especial

## Estimación de Historias

Esperamos aproximadamente 40-50 historias para Crew App.

Comienza generando el documento completo.
```

---

## Resultado Esperado

Un archivo `CREW_USER_STORIES.md` con aproximadamente:

- 3 historias globales (Header, Bottom Nav, FAB)
- 4 historias de Dashboard
- 3 historias de Calendar
- 4 historias de Routes
- 18-20 historias de Trips (módulo más complejo)
- 5 historias de Profile

**Total estimado: ~40 historias**

## Notas Especiales para Crew

1. **Mobile-first**: Todos los wireframes deben ser para pantalla móvil
2. **Permisos por rol**: Documentar claramente qué ve cada rol
3. **Viaje activo**: Es el flujo más complejo, requiere múltiples sub-historias
4. **QR Scanner**: Documentar como componente especial con estados de cámara
5. **Offline mode**: Indicar qué funciona sin conexión
