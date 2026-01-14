# Sistema de Generación de Historias de Usuario

Este directorio contiene las herramientas para generar documentación completa de historias de usuario con wireframes para cada app de Altaviapp.

---

## Estructura

```
docs/user-stories/
├── README.md                    ← Este archivo
├── GENERATOR_INSTRUCTIONS.md    ← Instrucciones generales del sistema
├── TEMPLATE.md                  ← Template y formato de las historias
├── PROMPT_ADMIN.md              ← Prompt específico para Admin
├── PROMPT_CREW.md               ← Prompt específico para Crew
├── PROMPT_PARENT.md             ← Prompt específico para Parent
│
└── (Archivos generados)
    ├── ADMIN_USER_STORIES.md    ← ~50 historias del Admin Dashboard
    ├── CREW_USER_STORIES.md     ← ~40 historias de la Crew App
    └── PARENT_USER_STORIES.md   ← ~35 historias del Parent Portal
```

---

## Cómo Generar los Documentos

### Paso 1: Abrir Nueva Sesión de Claude

Cada app debe generarse en una sesión separada para mantener contexto óptimo.

### Paso 2: Copiar el Prompt

1. Abre el archivo `PROMPT_{APP}.md` correspondiente
2. Copia TODO el contenido del bloque de código bajo "PROMPT"
3. Pégalo en la nueva sesión de Claude

### Paso 3: Esperar Generación

Claude generará el documento completo. Puede tomar varios mensajes debido a la extensión.

### Paso 4: Guardar Resultado

Guarda el output como `{APP}_USER_STORIES.md` en esta carpeta.

---

## Orden Recomendado de Generación

| Orden | App | Razón | Historias Est. |
|:-----:|-----|-------|:--------------:|
| 1 | **Admin** | Define patrones base, más completa | ~50 |
| 2 | **Crew** | Reutiliza patrones, agrega mobile | ~40 |
| 3 | **Parent** | Más simple, reutiliza todo | ~35 |

**Total**: ~125 historias de usuario

---

## Qué Incluye Cada Historia

Cada historia generada contiene:

```markdown
## {APP}-{MOD}-{NUM}: Nombre de la Historia

**Épica**: Módulo
**Prioridad**: Alta | Media | Baja
**Estimación**: XS | S | M | L | XL
**Depende de**: {códigos}
**Bloquea**: {códigos}

### Descripción
Como {rol}, quiero {acción}, para {beneficio}.

### Criterios de Aceptación
- [ ] Criterio verificable 1
- [ ] Criterio verificable 2

### Wireframe
[ASCII art detallado de la UI]

### Estados de UI
| Estado | Visualización |
|--------|---------------|
| Loading | ... |
| Empty | ... |

### Interacciones
| Elemento | Acción | Resultado |
|----------|--------|-----------|
| Botón X | Click | Navega a Y |

### Datos Requeridos
| Campo | Tipo | Fuente | Actualización |
|-------|------|--------|---------------|
| data | array | useQuery | Real-time |

### Funciones/Acciones
| Función | Trigger | Parámetros | Efecto |
|---------|---------|------------|--------|
| save | Click | formData | Guarda en DB |

### Validaciones
| Campo | Regla | Mensaje |
|-------|-------|---------|
| email | formato | "Email inválido" |

### Navegación
- Viene de: /ruta-anterior
- Va a: /ruta-siguiente
```

---

## Nomenclatura de Códigos

### Admin Dashboard (ADM)
| Módulo | Código | Descripción |
|--------|--------|-------------|
| Globales | ADM-GLOB | Header, Sidebar, Breadcrumb |
| Auth | ADM-AUTH | Login, registro, reset |
| Dashboard | ADM-DASH | Vista principal |
| Fleet | ADM-FLEET | Vehículos, conductores, monitores |
| Students | ADM-STU | Estudiantes, QR, importación |
| Routes | ADM-RTE | Rutas, wizard, optimización |
| Trips | ADM-TRIP | Monitoreo de viajes |
| Incidents | ADM-INC | Gestión de incidentes |
| Requests | ADM-REQ | Novedades pendientes |
| Users | ADM-USR | Gestión de usuarios |
| Settings | ADM-SET | Configuración |

### Crew App (CRW)
| Módulo | Código | Descripción |
|--------|--------|-------------|
| Globales | CRW-GLOB | Header, Bottom Nav, FAB |
| Auth | CRW-AUTH | Login, permisos |
| Dashboard | CRW-DASH | Inicio, rutas del día |
| Calendar | CRW-CAL | Calendario mensual |
| Routes | CRW-RTE | Rutas asignadas |
| Trips | CRW-TRIP | Checklist, activo, check-in |
| Profile | CRW-PROF | Perfil, historial, config |

### Parent Portal (PAR)
| Módulo | Código | Descripción |
|--------|--------|-------------|
| Globales | PAR-GLOB | Header, Navigation |
| Auth | PAR-AUTH | Login, registro invitación |
| Home | PAR-HOME | Tracking en tiempo real |
| Calendar | PAR-CAL | Calendario semanal |
| Children | PAR-CHILD | Gestión de hijos |
| History | PAR-HIST | Historial de viajes |
| Notifications | PAR-NOTIF | Centro de notificaciones |
| Novedades | PAR-NOV | Crear/gestionar novedades |
| Settings | PAR-SET | Configuración |

---

## Estimaciones

| Tamaño | Descripción | Tiempo Aprox |
|--------|-------------|--------------|
| XS | Cambio mínimo | 1-2 horas |
| S | Componente simple | 2-4 horas |
| M | Página estándar | 4-8 horas |
| L | Feature complejo | 1-2 días |
| XL | Módulo completo | 2-4 días |

---

## Dependencias con PRDs

Los documentos de historias de usuario hacen referencia a:

- [CROSS_APP_FLOWS.md](../prd-v2/CROSS_APP_FLOWS.md) - Flujos compartidos
- [ADMIN_PRD.md](../prd-v2/ADMIN_PRD.md) - PRD Admin
- [CREW_PRD.md](../prd-v2/CREW_PRD.md) - PRD Crew
- [PARENT_PRD.md](../prd-v2/PARENT_PRD.md) - PRD Parent

**Importante**: Si los PRDs cambian, las historias de usuario deben actualizarse.

---

## Checklist Post-Generación

Después de generar cada documento:

- [ ] Verificar que todas las páginas del sidebar tienen historias
- [ ] Cada historia tiene wireframe ASCII completo
- [ ] Flujos multi-step tienen todos los pasos documentados
- [ ] Modales documentados como historias separadas
- [ ] Estados de error y vacío definidos
- [ ] Interacciones completas para cada elemento clickeable
- [ ] Referencias cruzadas a PRD correctas
- [ ] Nomenclatura consistente (códigos)
- [ ] Dependencias entre historias definidas

---

## Uso de las Historias

### Para Desarrollo
1. Seguir el orden de dependencias
2. Usar wireframes como guía visual
3. Implementar todos los estados de UI
4. Verificar criterios de aceptación

### Para QA
1. Usar criterios de aceptación como test cases
2. Verificar todos los estados documentados
3. Probar interacciones listadas

### Para Diseño
1. Wireframes como base para mockups
2. Estados como variantes de diseño
3. Interacciones como especificación de micro-interacciones

---

## Mantenimiento

Cuando agregar nuevas historias:
1. Seguir nomenclatura existente
2. Actualizar índice del documento
3. Definir dependencias con historias existentes
4. Mantener formato consistente
