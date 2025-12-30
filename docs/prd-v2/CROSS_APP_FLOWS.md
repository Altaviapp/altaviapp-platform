# Flujos Cross-App - Altaviapp

**Versión**: 2.0
**Fecha**: Diciembre 2024
**Propósito**: Definir comportamiento compartido entre Admin, Crew y Parent

---

## 1. Glosario de Conceptos

| Término | Definición | Ejemplo |
|---------|------------|---------|
| **Ruta** | Plantilla recurrente de recorrido con paradas y estudiantes asignados | "Ruta Norte AM" - todos los lunes a viernes |
| **Viaje** | Instancia ejecutable de una ruta para una fecha específica | "Ruta Norte AM" del 15 de enero 2025 |
| **Parada** | Punto geográfico donde se recoge/entrega estudiantes | Casa de Juan (lat, lng) |
| **Novedad** | Excepción al comportamiento normal de un estudiante en un viaje | Ausencia, recoge padre, cambio parada |
| **Check-in** | Registro de abordaje o entrega de un estudiante | Juan subió al bus a las 7:15 |
| **Incidente** | Evento anormal durante un viaje que requiere atención | Accidente, retraso, emergencia médica |

---

## 2. Ciclo de Vida: Ruta → Viaje

### 2.1 Concepto Fundamental

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   RUTA (Plantilla)                    VIAJE (Instancia)                │
│   ────────────────                    ─────────────────                │
│                                                                         │
│   • Creada por Admin                  • Creado automáticamente          │
│   • Define recurrencia                • Existe para fecha específica    │
│   • Contiene paradas base             • Hereda paradas de ruta          │
│   • Asigna vehículo/conductor         • Puede tener estado activo       │
│   • Lista estudiantes asignados       • Registra eventos y check-ins    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Cuándo Existe un Viaje

| Momento | ¿Existe el Viaje? | Estado |
|---------|-------------------|--------|
| Admin crea ruta | NO | Solo existe la ruta |
| Día coincide con recurrencia | SÍ (auto-creado) | `scheduled` |
| Crew inicia viaje | SÍ | `in_progress` |
| Crew termina viaje | SÍ | `completed` |
| Crew cancela viaje | SÍ | `cancelled` |

**Regla crítica**: Los viajes se crean automáticamente a las 00:00 de cada día según la recurrencia de la ruta. Esto permite:
- Que padres vean "viajes programados" con anticipación
- Que novedades se vinculen a un viaje específico
- Que el sistema calcule ausencias antes de iniciar

### 2.3 Estados del Viaje

```
                    ┌──────────────┐
                    │  scheduled   │ (creado automáticamente)
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            ▼            ▼
       ┌──────────┐ ┌─────────────┐ ┌───────────┐
       │ cancelled│ │ in_progress │ │  skipped  │
       └──────────┘ └──────┬──────┘ └───────────┘
                           │         (día feriado)
                           ▼
                    ┌──────────────┐
                    │  completed   │
                    └──────────────┘
```

---

## 3. Flujo de Novedades (Cross-App)

### 3.1 Diagrama de Estados

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                          ┌─────────┐                                   │
│            ┌─────────────│ PARENT  │─────────────┐                     │
│            │             └─────────┘             │                     │
│            │                                     │                     │
│            ▼                                     ▼                     │
│     ┌──────────────┐                      ┌──────────────┐             │
│     │   pending    │                      │  cancelled   │             │
│     └──────┬───────┘                      └──────────────┘             │
│            │                                     ▲                     │
│            │ (Admin revisa)                      │                     │
│            │                                     │                     │
│   ┌────────┼────────┐                           │                     │
│   │        │        │                           │                     │
│   ▼        ▼        │                           │                     │
│ ┌────────┐ ┌────────┴───┐                       │                     │
│ │rejected│ │  approved  │───────────────────────┘                     │
│ └────────┘ └─────┬──────┘  (Parent puede cancelar                     │
│                  │          antes de acknowledged)                     │
│                  │                                                     │
│                  │ (Crew acusa recibo)                                │
│                  ▼                                                     │
│           ┌──────────────┐                                            │
│           │ acknowledged │                                            │
│           └──────┬───────┘                                            │
│                  │                                                     │
│                  │ (Viaje inicia, se aplica)                          │
│                  ▼                                                     │
│           ┌──────────────┐                                            │
│           │   applied    │                                            │
│           └──────────────┘                                            │
│                                                                         │
│           ┌──────────────┐                                            │
│           │   expired    │ (fecha pasó sin aplicar)                   │
│           └──────────────┘                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Transiciones Permitidas

| Estado Actual | → Estado Nuevo | Actor | Condición |
|---------------|----------------|-------|-----------|
| `pending` | `approved` | Admin | Revisión positiva |
| `pending` | `rejected` | Admin | Revisión negativa |
| `pending` | `cancelled` | Parent | Antes de revisión |
| `approved` | `acknowledged` | Crew | Acusa recibo |
| `approved` | `cancelled` | Parent | Antes de que Crew acuse |
| `acknowledged` | `applied` | Sistema | Al iniciar viaje |
| `acknowledged` | `expired` | Sistema | Fecha pasó sin viaje |
| `pending` | `expired` | Sistema | Fecha pasó sin revisión |

### 3.3 Excepción: parent_pickup

El tipo `parent_pickup` tiene flujo especial:

```
Parent crea ──► acknowledged (automático) ──► applied (al iniciar viaje)
```

**Razón**: No requiere aprobación porque el padre informa que él mismo recogerá al estudiante.

### 3.4 Novedades Permanentes y Recurrentes

| Tipo Duración | Comportamiento | Ejemplo |
|---------------|----------------|---------|
| `single_day` | Aplica solo a la fecha indicada | Ausencia el 15 de enero |
| `date_range` | Aplica a todos los viajes en el rango | Vacaciones 15-30 enero |
| `permanent` | Aplica desde fecha inicio indefinidamente | Nuevo domicilio desde 15 enero |
| `recurring` | Aplica solo los días seleccionados cada semana | Solo usa bus lunes y miércoles |

**Regla de aplicación**:
- Sistema verifica cada viaje contra novedades activas del estudiante
- Si `viaje.fecha` está dentro del rango/patrón de la novedad → se aplica
- Novedad `permanent` se aplica hasta que Parent la cancele

### 3.5 Edge Cases Definidos

| Escenario | Comportamiento Esperado |
|-----------|------------------------|
| **Novedad aprobada después de iniciar viaje** | Se aplica al siguiente viaje que coincida |
| **Novedad para viaje ya completado** | Rechazada automáticamente con motivo "Viaje ya finalizado" |
| **Dos novedades para mismo estudiante/fecha** | Solo se permite una. Segunda es rechazada |
| **Novedad permanente + novedad puntual** | Puntual tiene prioridad para esa fecha |
| **Crew no acusa recibo antes de viaje** | Se aplica automáticamente al iniciar (acknowledged implícito) |
| **Parent cancela después de acknowledged** | No permitido. Debe contactar Admin |

---

## 4. Flujo de Incidentes (Cross-App)

### 4.1 Estados del Incidente

```
     ┌──────────┐
     │  open    │ (Crew reporta)
     └────┬─────┘
          │
          │ (Admin investiga)
          ▼
     ┌──────────────┐
     │ in_progress  │
     └──────┬───────┘
            │
            │ (Admin resuelve)
            ▼
     ┌──────────────┐
     │   resolved   │
     └──────────────┘
```

### 4.2 Visibilidad por Rol

| Información | Admin | Crew | Parent |
|-------------|:-----:|:----:|:------:|
| Lista de todos los incidentes | ✅ | ❌ | ❌ |
| Incidentes de sus viajes | ✅ | ✅ | ❌ |
| Incidentes que afectan a su hijo | ✅ | ✅ | ✅ |
| Detalle completo | ✅ | ✅ | Solo resumen |
| Resolución | ✅ | ❌ | Solo notificación |

### 4.3 Notificaciones de Incidentes

| Severidad | Admin | Crew | Parent (si hijo afectado) |
|-----------|:-----:|:----:|:-------------------------:|
| Crítica | Push + In-app inmediato | In-app | Push + In-app |
| Alta | Push + In-app | In-app | Push |
| Media | In-app | In-app | In-app |
| Baja | In-app | In-app | No notifica |

---

## 5. Flujo de Check-in (Cross-App)

### 5.1 Estados del Estudiante en Viaje

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Estado Inicial (según novedades aplicadas)                           │
│   ──────────────────────────────────────────                           │
│                                                                         │
│   Sin novedad          → pending                                       │
│   Novedad absence      → absent                                        │
│   Novedad parent_pickup → parent_pickup                                │
│   Novedad stop_change  → pending (en parada diferente)                 │
│                                                                         │
│   Flujo Normal                                                          │
│   ───────────                                                          │
│                                                                         │
│        ┌─────────┐                                                     │
│        │ pending │                                                     │
│        └────┬────┘                                                     │
│             │                                                           │
│             │ (Crew registra check-in)                                 │
│             ▼                                                           │
│        ┌─────────┐                                                     │
│        │ aboard  │                                                     │
│        └────┬────┘                                                     │
│             │                                                           │
│             │ (Crew registra check-out)                                │
│             ▼                                                           │
│        ┌───────────┐                                                   │
│        │ delivered │                                                   │
│        └───────────┘                                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Transiciones Especiales

| Desde | Hacia | Condición | Actor |
|-------|-------|-----------|-------|
| `pending` | `no_show` | Crew marca como no presentado | Crew |
| `pending` | `absent` | Novedad de ausencia aplicada | Sistema |
| `aboard` | `early_dropoff` | Padre recoge en parada intermedia | Crew |
| Cualquiera | `incident` | Incidente afecta al estudiante | Sistema |

### 5.3 Notificación a Padres

| Evento | Notificación | Timing |
|--------|--------------|--------|
| Estudiante aborda | Push: "{nombre} subió al bus" | Inmediato |
| Estudiante entregado | Push: "{nombre} llegó a destino" | Inmediato |
| Estudiante no se presentó | Push: "{nombre} no abordó el bus" | 5 min después de salir de parada |
| Cambio de ETA > 10 min | Push: "Nueva hora estimada: {hora}" | Cuando se detecta |

---

## 6. Cambios de Ubicación y su Impacto

### 6.1 Flujo de Cambio de Ubicación

```
Parent cambia ubicación ──► Sistema detecta ──► Admin notificado
                                                      │
                                                      ▼
                                              ¿Estudiante tiene ruta?
                                                      │
                                       ┌──────────────┼──────────────┐
                                       │              │              │
                                       ▼              ▼              ▼
                                      NO           SÍ (misma zona)  SÍ (otra zona)
                                       │              │              │
                                       │              ▼              ▼
                                       │         Ruta válida    Ruta invalidada
                                       │         (recalcular    (Admin debe
                                       │          ETA)           reasignar)
                                       ▼
                                    Sin acción
```

### 6.2 Definición de "Misma Zona"

- Distancia < 2km de la parada actual asignada
- O: dentro del polígono de cobertura de la ruta

### 6.3 Comportamiento Esperado

| Escenario | Acción Automática | Acción Requerida |
|-----------|-------------------|------------------|
| Nueva ubicación en misma zona | Actualizar parada, recalcular ETA | Ninguna |
| Nueva ubicación fuera de zona | Marcar ruta como "requiere revisión" | Admin reasigna |
| Nueva ubicación sin ruta asignada | Actualizar ubicación | Ninguna |

---

## 7. Permisos Explícitos por Entidad

### 7.1 Matriz de Permisos

| Entidad | Crear | Leer | Actualizar | Eliminar |
|---------|:-----:|:----:|:----------:|:--------:|
| **Estudiante** |
| - Admin | ✅ | ✅ (todos) | ✅ | ✅ |
| - Parent | ❌ | ✅ (sus hijos) | ✅ (foto, ubicación, contacto) | ❌ |
| - Crew | ❌ | ✅ (en sus rutas) | ❌ | ❌ |
| **Ruta** |
| - Admin | ✅ | ✅ | ✅ | ✅ |
| - Parent | ❌ | ✅ (de sus hijos) | ❌ | ❌ |
| - Crew | ❌ | ✅ (asignadas) | ❌ | ❌ |
| **Viaje** |
| - Admin | ❌ (auto) | ✅ | ✅ (cancelar) | ❌ |
| - Parent | ❌ | ✅ (de sus hijos) | ❌ | ❌ |
| - Crew | ✅ (iniciar) | ✅ (asignados) | ✅ (estado, eventos) | ❌ |
| **Novedad** |
| - Admin | ❌ | ✅ (todas) | ✅ (aprobar/rechazar) | ❌ |
| - Parent | ✅ | ✅ (propias) | ✅ (cancelar) | ❌ |
| - Crew | ❌ | ✅ (de sus viajes) | ✅ (acknowledge) | ❌ |
| **Incidente** |
| - Admin | ✅ | ✅ (todos) | ✅ (resolver) | ❌ |
| - Parent | ❌ | ✅ (afectan hijos, resumen) | ❌ | ❌ |
| - Crew | ✅ | ✅ (de sus viajes) | ❌ | ❌ |

---

## 8. Notificaciones Cross-App

### 8.1 Matriz de Eventos y Destinatarios

| Evento | Admin | Crew | Parent |
|--------|:-----:|:----:|:------:|
| Novedad creada (requiere aprobación) | ✅ | ❌ | ❌ |
| Novedad aprobada | ❌ | ✅ | ✅ |
| Novedad rechazada | ❌ | ❌ | ✅ |
| Novedad acknowledged | ❌ | ❌ | ✅ |
| Viaje iniciado | ✅ | ❌ | ✅ |
| Viaje completado | ✅ | ❌ | ✅ |
| Check-in estudiante | ❌ | ❌ | ✅ |
| Check-out estudiante | ❌ | ❌ | ✅ |
| Incidente reportado | ✅ | ❌ | ✅ (si afecta) |
| Incidente resuelto | ❌ | ✅ | ✅ (si afecta) |
| Cambio de vehículo (relay) | ✅ | ❌ | ✅ |
| ETA actualizado (+10 min) | ❌ | ❌ | ✅ |

### 8.2 Canales de Notificación

| Prioridad | Canal | Latencia |
|-----------|-------|----------|
| Crítica | Push + In-app + Email | < 30 seg |
| Alta | Push + In-app | < 1 min |
| Normal | In-app | < 2 min |
| Baja | In-app (batch) | < 5 min |

---

## 9. Reglas de Negocio Globales

### 9.1 Tiempos y Límites

| Regla | Valor | Configurable |
|-------|-------|:------------:|
| Anticipación mínima para novedad | 24 horas | ✅ por tipo |
| Anticipación mínima para stop_change | 48 horas | ✅ |
| Tiempo para que Crew acuse recibo | Hasta iniciar viaje | ❌ |
| Expiración de novedad no revisada | Fecha del viaje + 1 día | ❌ |
| Intervalo de actualización GPS | 15 segundos | ✅ |
| Umbral de retraso para notificar | 10 minutos | ✅ |

### 9.2 Validaciones Cross-App

| Validación | Momento | Resultado si falla |
|------------|---------|-------------------|
| Estudiante tiene ubicación | Asignar a ruta | Bloquea asignación |
| Ruta tiene vehículo | Crear viaje | Bloquea creación |
| Viaje existe para fecha | Crear novedad | Crea viaje programado automáticamente |
| Novedad no duplicada | Crear novedad | Rechaza con mensaje |
| Checklist completado | Iniciar viaje | Advierte pero permite |

---

## 10. Glosario de Estados

### Viaje
- `scheduled`: Creado automáticamente, pendiente de iniciar
- `in_progress`: Crew lo inició, en ejecución
- `completed`: Crew lo terminó exitosamente
- `cancelled`: Cancelado antes o durante ejecución
- `skipped`: No se ejecutó (feriado, evento especial)

### Novedad
- `pending`: Creada, esperando revisión de Admin
- `approved`: Admin aprobó, esperando acknowledge de Crew
- `rejected`: Admin rechazó con motivo
- `acknowledged`: Crew confirmó que vio la novedad
- `applied`: Sistema aplicó al viaje
- `cancelled`: Parent canceló antes de aplicar
- `expired`: Fecha pasó sin aplicar

### Estudiante en Viaje
- `pending`: Esperando en parada
- `aboard`: Subió al vehículo
- `delivered`: Entregado en destino
- `absent`: Marcado ausente por novedad
- `parent_pickup`: Padre lo recoge
- `no_show`: No se presentó sin novedad previa
- `early_dropoff`: Bajó antes del destino final

### Incidente
- `open`: Reportado, sin atender
- `in_progress`: Admin investigando
- `resolved`: Cerrado con resolución
