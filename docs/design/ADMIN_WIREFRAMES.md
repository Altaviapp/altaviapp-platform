# Admin Dashboard Wireframes (PWA)
**Altaviapp - School Transport Management Platform**
**Versión**: 1.1
**Fecha**: Enero 2025
**Propósito**: Guía de wireframes para el dashboard de administración (PWA)

---

## Características de la PWA

### Instalación
- Instalable en desktop (Windows, Mac, Linux)
- Instalable en móvil (iOS, Android)
- Ícono en pantalla de inicio/escritorio
- Funciona como app nativa

### Performance
- Carga en < 3 segundos
- Modo offline básico (ver datos cacheados)
- Sincronización automática al reconectar

### Diseño
- Desktop-first (1280px+)
- Responsive para tablet (768px-1024px)
- Responsive para móvil (360px-414px)

---

## Índice
1. [Dashboard Overview](#1-dashboard-overview)
2. [Fleet Management](#2-fleet-management)
3. [Route Management](#3-route-management)
4. [Student Management](#4-student-management)
5. [Trip Monitoring](#5-trip-monitoring)
6. [Incident Management](#6-incident-management)
7. [Reports and Analytics](#7-reports-and-analytics)
8. [Settings and Configuration](#8-settings-and-configuration)
9. [Componentes Comunes](#9-componentes-comunes)

---

## 1. Dashboard Overview

### 1.1 Vista Principal del Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ Dashboard                                        [Hoy: 05/01/2025]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │  📊 Viajes     │ │  🚌 Vehículos  │ │  👨‍🎓 Estudiantes│         │
│  │  Activos: 12   │ │  En ruta: 8    │ │  A bordo: 342  │         │
│  │  Total: 24     │ │  Total: 15     │ │  Total: 856    │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │  👨‍✈️ Conductores│ │  📍 Rutas      │ │  ⚠️ Alertas    │         │
│  │  En servicio:10│ │  Activas: 18   │ │  Hoy: 3        │         │
│  │  Total: 18     │ │  Total: 25     │ │  Sin leer: 1   │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Viajes en Tiempo Real                          [Ver todos →]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Ruta: Centro - Escuela A          [EN RUTA] 🟢           │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │ Estudiantes: 28/30  │ Paradas: 3/8  │ ETA: 15 min          │  │
│  │ [📍 Ver en mapa] [📊 Detalles]                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Ruta: Norte - Escuela B           [RECOGIDA] 🟡          │  │
│  │ Conductor: María González                                    │  │
│  │ Estudiantes: 12/25  │ Paradas: 5/12 │ ETA: 25 min          │  │
│  │ [📍 Ver en mapa] [📊 Detalles]                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Ruta: Sur - Escuela A             [COMPLETADO] ⚪        │  │
│  │ Conductor: Carlos Ruiz                                       │  │
│  │ Estudiantes: 22/22  │ Paradas: 10/10│ Finalizado: 08:45    │  │
│  │ [📍 Ver en mapa] [📊 Detalles]                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Alertas Recientes                              [Ver todas →]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ⚠️  Conductor reportó retraso - Ruta Centro    [Hace 5 min] 🔴   │
│  ℹ️  Vehículo requiere mantenimiento - Bus 12   [Hace 1 hora]     │
│  ✅  Viaje completado exitosamente - Ruta Norte [Hace 2 horas]    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Header global con selector de institución y usuario
- 6 tarjetas de métricas principales
- Lista de viajes en tiempo real con estados visuales
- Panel de alertas recientes
- Enlaces rápidos a módulos específicos

---

## 2. Fleet Management

### 2.1 Lista de Vehículos

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Flota                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Vehículos                                      [+ Nuevo Vehículo]  │
│                                                                      │
│  [Buscar vehículos...]                    [Filtrar: Todos ▼]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estado: [Todos] [En servicio] [Mantenimiento] [Inactivo]          │
│                                                                      │
├─┬───────────┬──────────┬──────────┬─────────────┬──────────┬────────┤
│ │ Placa     │ Modelo   │ Capac.   │ Estado      │ Conductor│ Acción │
├─┼───────────┼──────────┼──────────┼─────────────┼──────────┼────────┤
│ │ ABC-1234  │ Toyota   │ 30       │ 🟢 En ruta  │ J. Pérez │ [...] ││
│ │           │ Coaster  │          │             │          │       ││
│ │                                                                   ││
│ │ XYZ-5678  │ Mitsu-   │ 25       │ 🟡 Manteni- │ -        │ [...] ││
│ │           │ bishi    │          │    miento   │          │       ││
│ │                                                                   ││
│ │ DEF-9012  │ Hino     │ 35       │ 🟢 En ruta  │ M. Glez  │ [...] ││
│ │           │ Dutro    │          │             │          │       ││
│ │                                                                   ││
│ │ GHI-3456  │ Toyota   │ 30       │ ⚪ Disponible│ -        │ [...] ││
│ │           │ Coaster  │          │             │          │       ││
└─┴───────────┴──────────┴──────────┴─────────────┴──────────┴────────┘

  [← Anterior] Página 1 de 4 [Siguiente →]
```

**Menú desplegable [...] para cada vehículo:**
```
┌─────────────────┐
│ 📝 Editar       │
│ 📊 Ver detalles │
│ 🔧 Mantenimiento│
│ 🗑️  Eliminar    │
└─────────────────┘
```

### 2.2 Formulario: Crear/Editar Vehículo

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Flota / Nuevo Vehículo                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nuevo Vehículo                                                     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Básica                                            │ │
│  │                                                               │ │
│  │  Placa *                                                      │ │
│  │  [_______________]  Ej: ABC-1234                              │ │
│  │                                                               │ │
│  │  Marca *                    Modelo *                          │ │
│  │  [______________]           [______________]                  │ │
│  │                                                               │ │
│  │  Año *                      Color                             │ │
│  │  [____]                     [______________]                  │ │
│  │                                                               │ │
│  │  Capacidad de Pasajeros *                                     │ │
│  │  [____] estudiantes                                           │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Documentación                                                 │ │
│  │                                                                │ │
│  │  Número de Registro                                           │ │
│  │  [_______________________]                                    │ │
│  │                                                                │ │
│  │  Póliza de Seguro                                             │ │
│  │  [_______________________]                                    │ │
│  │                                                                │ │
│  │  Fecha de Vencimiento del Seguro *                            │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  │  Fecha de Última Revisión Técnica *                           │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  │  Fecha de Próxima Revisión Técnica *                          │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Estado y Asignación                                           │ │
│  │                                                                │ │
│  │  Estado *                                                     │ │
│  │  ( ) Activo                                                   │ │
│  │  ( ) En mantenimiento                                         │ │
│  │  ( ) Inactivo                                                 │ │
│  │                                                                │ │
│  │  Conductor Asignado                                           │ │
│  │  [Seleccionar conductor ▼]                                    │ │
│  │                                                                │ │
│  │  Ruta Asignada                                                │ │
│  │  [Seleccionar ruta ▼]                                         │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Notas Adicionales                                             │ │
│  │                                                                │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Vehículo]          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.3 Lista de Conductores

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Flota / Conductores                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Conductores                                    [+ Nuevo Conductor]  │
│                                                                      │
│  [Buscar conductores...]                  [Filtrar: Todos ▼]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estado: [Todos] [En servicio] [Disponible] [Inactivo]             │
│                                                                      │
├─┬─────────────┬────────────┬───────────┬────────────┬──────┬────────┤
│ │ Nombre      │ Cédula     │ Teléfono  │ Vehículo   │Estado│ Acción │
├─┼─────────────┼────────────┼───────────┼────────────┼──────┼────────┤
│ │ Juan Pérez  │ 1234567890 │ +593 99   │ ABC-1234   │🟢 En │ [...] ││
│ │             │            │ 123 4567  │ (Ruta 1)   │ruta  │       ││
│ │                                                                   ││
│ │ María       │ 0987654321 │ +593 98   │ DEF-9012   │🟢 En │ [...] ││
│ │ González    │            │ 765 4321  │ (Ruta 3)   │ruta  │       ││
│ │                                                                   ││
│ │ Carlos Ruiz │ 1122334455 │ +593 97   │ -          │⚪ Dis│ [...] ││
│ │             │            │ 555 6666  │            │poni- │       ││
│ │             │            │           │            │ble   │       ││
│ │                                                                   ││
│ │ Ana Torres  │ 5544332211 │ +593 96   │ XYZ-5678   │🔴 Li│ [...] ││
│ │             │            │ 888 9999  │            │cencia│       ││
│ │             │            │           │            │vencida│      ││
└─┴─────────────┴────────────┴───────────┴────────────┴──────┴────────┘

  [← Anterior] Página 1 de 2 [Siguiente →]
```

### 2.4 Formulario: Crear/Editar Conductor

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Conductores / Nuevo Conductor                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nuevo Conductor                                                    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Personal                                          │ │
│  │                                                               │ │
│  │  Nombres *                                                    │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  Apellidos *                                                  │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  Cédula de Identidad *                                        │ │
│  │  [__________________]  10 dígitos                             │ │
│  │                                                               │ │
│  │  Fecha de Nacimiento *                                        │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                               │ │
│  │  Teléfono *                                                   │ │
│  │  [+593_____________]  Formato: +593XXXXXXXXX                  │ │
│  │                                                               │ │
│  │  Email                                                        │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  Dirección                                                    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Licencia de Conducir                                          │ │
│  │                                                                │ │
│  │  Número de Licencia *                                         │ │
│  │  [_______________________]                                    │ │
│  │                                                                │ │
│  │  Tipo de Licencia *                                           │ │
│  │  [Seleccionar tipo ▼]  (C, D, E, etc.)                        │ │
│  │                                                                │ │
│  │  Fecha de Emisión *                                           │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  │  Fecha de Vencimiento *                                       │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Asignaciones                                                  │ │
│  │                                                                │ │
│  │  Vehículo Asignado                                            │ │
│  │  [Seleccionar vehículo ▼]                                     │ │
│  │                                                                │ │
│  │  Estado *                                                     │ │
│  │  ( ) Activo                                                   │ │
│  │  ( ) Inactivo                                                 │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Contacto de Emergencia                                        │ │
│  │                                                                │ │
│  │  Nombre Completo                                              │ │
│  │  [_______________________]                                    │ │
│  │                                                                │ │
│  │  Relación                                                     │ │
│  │  [_______________________]                                    │ │
│  │                                                                │ │
│  │  Teléfono                                                     │ │
│  │  [+593_____________]                                          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Conductor]         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Route Management

### 3.1 Lista de Rutas

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Rutas                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Rutas                                              [+ Nueva Ruta]   │
│                                                                      │
│  [Buscar rutas...]                        [Filtrar: Todas ▼]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Tipo: [Todas] [Ida] [Retorno] [Ambas]                             │
│  Estado: [Todas] [Activas] [Inactivas]                             │
│                                                                      │
├─┬────────────┬─────────┬──────────┬─────────┬─────────────┬─────────┤
│ │ Nombre     │ Tipo    │ Paradas  │ Vehículo│ Estudiantes │ Acción  │
├─┼────────────┼─────────┼──────────┼─────────┼─────────────┼─────────┤
│ │ Ruta Centro│ Ida     │ 8        │ ABC-1234│ 28/30       │ [...]  ││
│ │ - Escuela A│ 07:00   │          │ J. Pérez│ 🟢 Activa   │        ││
│ │                                                                   ││
│ │ Ruta Norte │ Ida     │ 12       │ DEF-9012│ 22/25       │ [...]  ││
│ │ - Escuela B│ 06:30   │          │ M. Glez │ 🟢 Activa   │        ││
│ │                                                                   ││
│ │ Ruta Sur   │ Retorno │ 10       │ ABC-1234│ 22/30       │ [...]  ││
│ │ - Escuela A│ 13:00   │          │ J. Pérez│ 🟢 Activa   │        ││
│ │                                                                   ││
│ │ Ruta Este  │ Ambas   │ 6 (ida)  │ -       │ 0/20        │ [...]  ││
│ │ - Escuela C│ 07:15   │ 6 (ret.) │         │ ⚪ Inactiva │        ││
└─┴────────────┴─────────┴──────────┴─────────┴─────────────┴─────────┘

  [← Anterior] Página 1 de 3 [Siguiente →]
```

**Menú desplegable [...] para cada ruta:**
```
┌──────────────────┐
│ 📝 Editar        │
│ 📍 Ver paradas   │
│ 👨‍🎓 Ver estudiantes│
│ 🗺️  Ver en mapa  │
│ 📋 Duplicar      │
│ 🗑️  Eliminar     │
└──────────────────┘
```

### 3.2 Formulario: Crear/Editar Ruta

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Rutas / Nueva Ruta                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nueva Ruta                                                         │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Básica                                            │ │
│  │                                                               │ │
│  │  Nombre de la Ruta *                                          │ │
│  │  [_______________________]  Ej: Ruta Centro - Escuela A       │ │
│  │                                                               │ │
│  │  Descripción                                                  │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                               │ │
│  │  Tipo de Ruta *                                               │ │
│  │  ( ) Ida (Recoger estudiantes)                                │ │
│  │  ( ) Retorno (Dejar estudiantes)                              │ │
│  │  ( ) Ambas (Ida y retorno)                                    │ │
│  │                                                               │ │
│  │  Hora de Inicio *                                             │ │
│  │  [__:__] 🕐  Formato 24h                                      │ │
│  │                                                               │ │
│  │  Duración Estimada                                            │ │
│  │  [___] minutos                                                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Asignaciones                                                  │ │
│  │                                                                │ │
│  │  Vehículo Asignado *                                          │ │
│  │  [Seleccionar vehículo ▼]                                     │ │
│  │  Capacidad: 30 estudiantes                                    │ │
│  │                                                                │ │
│  │  Conductor Asignado *                                         │ │
│  │  [Seleccionar conductor ▼]                                    │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Paradas (Orden de recorrido)                  [+ Agregar Parada]│
│  │                                                                │ │
│  │  1. [≡] Parada Inicial - Centro Comercial     [📝] [🗑️]       │ │
│  │     📍 Lat: -0.2298, Lng: -78.5249                             │ │
│  │     Estudiantes: 5  │ Tiempo estimado: 5 min                  │ │
│  │                                                                │ │
│  │  2. [≡] Parada 2 - Parque Central             [📝] [🗑️]       │ │
│  │     📍 Lat: -0.2305, Lng: -78.5240                             │ │
│  │     Estudiantes: 8  │ Tiempo estimado: 3 min                  │ │
│  │                                                                │ │
│  │  3. [≡] Parada 3 - Iglesia San Juan           [📝] [🗑️]       │ │
│  │     📍 Lat: -0.2315, Lng: -78.5235                             │ │
│  │     Estudiantes: 6  │ Tiempo estimado: 4 min                  │ │
│  │                                                                │ │
│  │  4. [≡] Destino - Escuela A                   [📝] [🗑️]       │ │
│  │     📍 Lat: -0.2350, Lng: -78.5200                             │ │
│  │                                                                │ │
│  │  [≡] = Arrastrar para reordenar                                │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Configuración Adicional                                       │ │
│  │                                                                │ │
│  │  Estado *                                                     │ │
│  │  ( ) Activa                                                   │ │
│  │  ( ) Inactiva                                                 │ │
│  │                                                                │ │
│  │  Días de Operación *                                          │ │
│  │  [✓] Lunes    [✓] Martes   [✓] Miércoles                      │ │
│  │  [✓] Jueves   [✓] Viernes  [ ] Sábado    [ ] Domingo          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Ruta]              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.3 Modal: Agregar/Editar Parada

```
┌─────────────────────────────────────────────────────────────┐
│  Agregar Parada                                         [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Nombre de la Parada *                                      │
│  [_____________________________]                            │
│                                                             │
│  Descripción/Referencia                                     │
│  [_____________________________]                            │
│  Ej: Frente al parque, junto a la farmacia                  │
│                                                             │
│  Ubicación *                                                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │              [MAPA INTERACTIVO]                     │   │
│  │                                                     │   │
│  │     Click en el mapa para seleccionar ubicación    │   │
│  │                    o                                │   │
│  │          [📍 Usar mi ubicación actual]              │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Latitud                       Longitud                     │
│  [______________]              [______________]             │
│                                                             │
│  Tiempo Estimado de Parada                                  │
│  [___] minutos                                              │
│                                                             │
│  Radio de Geofence (metros)                                 │
│  [___] m  (Recomendado: 50-100m)                            │
│                                                             │
│  Número de Estudiantes Esperados                            │
│  [___] estudiantes                                          │
│                                                             │
│                         [Cancelar] [Guardar Parada]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 3.4 Asignación de Estudiantes a Rutas

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Rutas / Ruta Centro - Escuela A / Asignar Estudiantes │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Asignación de Estudiantes: Ruta Centro - Escuela A                │
│  Capacidad: 28/30 estudiantes                                       │
│                                                                      │
│  ┌────────────────────────────────┐ ┌────────────────────────────┐ │
│  │ Estudiantes Disponibles        │ │ Estudiantes Asignados      │ │
│  │                                │ │                            │ │
│  │ [Buscar estudiantes...]        │ │ [Buscar...]                │ │
│  │                                │ │                            │ │
│  │ Filtrar por:                   │ │ Ordenar por parada:        │ │
│  │ [Todos los grados ▼]           │ │ [Todas las paradas ▼]      │ │
│  │ [Todos los salones ▼]          │ │                            │ │
│  │                                │ │                            │ │
│  │ ┌────────────────────────────┐ │ │ ┌────────────────────────┐│ │
│  │ │ [ ] María Rodríguez        │ │ │ │ [✓] Juan Pérez         ││ │
│  │ │     4to A │ Sin asignar     │ │ │ │     5to B              ││ │
│  │ │     [+ Asignar →]          │ │ │ │     Parada 1 - Centro  ││ │
│  │ │                            │ │ │ │     [← Remover]        ││ │
│  │ ├────────────────────────────┤ │ │ ├────────────────────────┤│ │
│  │ │ [ ] Carlos Sánchez         │ │ │ │ [✓] Ana Torres         ││ │
│  │ │     3ro B │ Sin asignar     │ │ │ │     4to C              ││ │
│  │ │     [+ Asignar →]          │ │ │ │     Parada 1 - Centro  ││ │
│  │ │                            │ │ │ │     [← Remover]        ││ │
│  │ ├────────────────────────────┤ │ │ ├────────────────────────┤│ │
│  │ │ [ ] Sofía Morales          │ │ │ │ [✓] Diego López        ││ │
│  │ │     5to A │ Ruta Norte      │ │ │ │     3ro A              ││ │
│  │ │     Ya asignado            │ │ │ │     Parada 2 - Parque  ││ │
│  │ │                            │ │ │ │     [← Remover]        ││ │
│  │ └────────────────────────────┘ │ │ └────────────────────────┘│ │
│  │                                │ │                            │ │
│  │ [Asignar Seleccionados →]      │ │ [← Remover Seleccionados]  │ │
│  │                                │ │                            │ │
│  └────────────────────────────────┘ └────────────────────────────┘ │
│                                                                      │
│  Asignación por Parada:                                             │
│  • Parada 1 - Centro Comercial: 5 estudiantes                       │
│  • Parada 2 - Parque Central: 8 estudiantes                         │
│  • Parada 3 - Iglesia San Juan: 6 estudiantes                       │
│  • Parada 4 - Plaza Mayor: 9 estudiantes                            │
│                                                                      │
│                              [Cancelar] [Guardar Asignaciones]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 4. Student Management

### 4.1 Lista de Estudiantes

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Estudiantes                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estudiantes                                   [+ Nuevo Estudiante]  │
│                                                                      │
│  [Buscar estudiantes...]                  [Filtrar: Todos ▼]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Grado: [Todos] [1ro] [2do] [3ro] [4to] [5to] [6to]                │
│  Estado: [Todos] [Activos] [Inactivos]                             │
│  Ruta: [Todas] [Con ruta asignada] [Sin ruta]                      │
│                                                                      │
├─┬──────────────┬─────────┬─────────┬──────────────┬──────┬──────────┤
│ │ Nombre       │ Grado   │ Padres  │ Ruta         │ QR   │ Acción   │
├─┼──────────────┼─────────┼─────────┼──────────────┼──────┼──────────┤
│ │ Juan Pérez   │ 5to B   │ 2       │ Ruta Centro  │ 📱  │ [...]   ││
│ │ González     │         │ padres  │ Parada 1     │     │         ││
│ │                                                                   ││
│ │ Ana Torres   │ 4to C   │ 1 padre │ Ruta Centro  │ 📱  │ [...]   ││
│ │ Martínez     │         │         │ Parada 1     │     │         ││
│ │                                                                   ││
│ │ Diego López  │ 3ro A   │ 2       │ Ruta Centro  │ 📱  │ [...]   ││
│ │ Ramírez      │         │ padres  │ Parada 2     │     │         ││
│ │                                                                   ││
│ │ María        │ 4to A   │ 1 madre │ Sin asignar  │ 📱  │ [...]   ││
│ │ Rodríguez    │         │         │              │     │         ││
└─┴──────────────┴─────────┴─────────┴──────────────┴──────┴──────────┘

  [← Anterior] Página 1 de 35 [Siguiente →]
```

**Menú desplegable [...] para cada estudiante:**
```
┌──────────────────────┐
│ 📝 Editar            │
│ 👨‍👩‍👧 Ver padres       │
│ 📱 Ver/Descargar QR  │
│ 📍 Asignar a ruta    │
│ 📊 Historial         │
│ 🗑️  Eliminar         │
└──────────────────────┘
```

### 4.2 Formulario: Crear/Editar Estudiante

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Estudiantes / Nuevo Estudiante                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nuevo Estudiante                                                   │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Personal                                          │ │
│  │                                                               │ │
│  │  Nombres *                                                    │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  Apellidos *                                                  │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  Cédula/Pasaporte                                             │ │
│  │  [__________________]                                         │ │
│  │                                                               │ │
│  │  Fecha de Nacimiento *                                        │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                               │ │
│  │  Género                                                       │ │
│  │  ( ) Masculino   ( ) Femenino   ( ) Otro                      │ │
│  │                                                               │ │
│  │  Foto del Estudiante                                          │ │
│  │  ┌─────────────┐                                              │ │
│  │  │             │  [📷 Subir foto]                              │ │
│  │  │  [FOTO]     │  [🗑️  Eliminar]                              │ │
│  │  │             │                                               │ │
│  │  └─────────────┘                                              │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Académica                                         │ │
│  │                                                                │ │
│  │  Grado *                                                      │ │
│  │  [Seleccionar grado ▼]  1ro, 2do, 3ro, 4to, 5to, 6to          │ │
│  │                                                                │ │
│  │  Salón/Paralelo *                                             │ │
│  │  [Seleccionar salón ▼]  A, B, C, D...                          │ │
│  │                                                                │ │
│  │  Número de Matrícula                                          │ │
│  │  [__________________]                                         │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información de Contacto                                       │ │
│  │                                                                │ │
│  │  Dirección de Residencia                                      │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  Ubicación GPS (para geolocalización)                         │ │
│  │  Latitud: [______________]  Longitud: [______________]        │ │
│  │  [📍 Seleccionar en mapa]                                     │ │
│  │                                                                │ │
│  │  Teléfono de Casa                                             │ │
│  │  [+593_____________]                                          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Padres/Tutores                                [+ Agregar Padre]│
│  │                                                                │ │
│  │  Padre/Tutor 1 *                                              │ │
│  │  Nombre: [_______________________]                            │ │
│  │  Relación: [Padre ▼]  (Padre, Madre, Tutor, Otro)             │ │
│  │  Teléfono: [+593_____________] *                              │ │
│  │  Email: [_______________________]                             │ │
│  │  [✓] Usuario principal (recibe notificaciones)                │ │
│  │  [🗑️  Remover]                                                │ │
│  │                                                                │ │
│  │  Padre/Tutor 2                                                │ │
│  │  Nombre: [_______________________]                            │ │
│  │  Relación: [Madre ▼]                                          │ │
│  │  Teléfono: [+593_____________]                                │ │
│  │  Email: [_______________________]                             │ │
│  │  [ ] Usuario principal (recibe notificaciones)                │ │
│  │  [🗑️  Remover]                                                │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Asignación de Ruta                                            │ │
│  │                                                                │ │
│  │  Ruta Asignada                                                │ │
│  │  [Seleccionar ruta ▼]                                         │ │
│  │                                                                │ │
│  │  Parada de Recogida (Ida)                                     │ │
│  │  [Seleccionar parada ▼]                                       │ │
│  │                                                                │ │
│  │  Parada de Entrega (Retorno)                                  │ │
│  │  [Seleccionar parada ▼]                                       │ │
│  │  [ ] Usar la misma parada para ida y retorno                  │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Médica y de Emergencia                            │ │
│  │                                                                │ │
│  │  Tipo de Sangre                                               │ │
│  │  [Seleccionar ▼]  A+, A-, B+, B-, AB+, AB-, O+, O-             │ │
│  │                                                                │ │
│  │  Alergias                                                     │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  Condiciones Médicas                                          │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  Medicamentos                                                 │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  Contacto de Emergencia (además de padres)                    │ │
│  │  Nombre: [_______________________]                            │ │
│  │  Relación: [_______________________]                          │ │
│  │  Teléfono: [+593_____________]                                │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Código QR                                                     │ │
│  │                                                                │ │
│  │  ┌───────────┐                                                │ │
│  │  │           │  El código QR se generará automáticamente      │ │
│  │  │  [QR CODE]│  al guardar el estudiante.                     │ │
│  │  │           │                                                │ │
│  │  └───────────┘  Este código será único para el estudiante     │ │
│  │                 y contendrá su información de identificación. │ │
│  │                                                                │ │
│  │                 [📥 Descargar QR] [📧 Enviar por email]        │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Estado                                                        │ │
│  │                                                                │ │
│  │  ( ) Activo                                                   │ │
│  │  ( ) Inactivo                                                 │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Estudiante]        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.3 Vista: QR Code Individual

```
┌─────────────────────────────────────────────────────────────┐
│  Código QR - Juan Pérez González                       [✕] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Juan Pérez González                      │
│                    Grado: 5to B                             │
│                    Matrícula: 2025-001234                   │
│                                                             │
│              ┌─────────────────────────┐                    │
│              │                         │                    │
│              │                         │                    │
│              │      [CÓDIGO QR]        │                    │
│              │      [GRANDE]           │                    │
│              │                         │                    │
│              │                         │                    │
│              └─────────────────────────┘                    │
│                                                             │
│              Escuela: Escuela Primaria ABC                  │
│              Institución: Instituto XYZ                     │
│                                                             │
│              Ruta asignada: Ruta Centro - Escuela A         │
│              Parada: Parada 1 - Centro Comercial            │
│                                                             │
│         ┌─────────────┐  ┌──────────────────────┐          │
│         │📥 Descargar │  │ 📧 Enviar por Email  │          │
│         │    PNG      │  │                      │          │
│         └─────────────┘  └──────────────────────┘          │
│                                                             │
│         ┌─────────────┐  ┌──────────────────────┐          │
│         │ 🖨️  Imprimir│  │ 📱 Enviar por WhatsApp│         │
│         │             │  │                      │          │
│         └─────────────┘  └──────────────────────┘          │
│                                                             │
│                           [Cerrar]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4.4 Vista: QR Codes Masivos

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Estudiantes / Códigos QR                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Generación Masiva de Códigos QR                                    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Filtros de Selección                                          │ │
│  │                                                               │ │
│  │  Grado                                                        │ │
│  │  [✓] Todos  [ ] 1ro  [ ] 2do  [ ] 3ro  [ ] 4to  [ ] 5to  [ ] 6to│
│  │                                                               │ │
│  │  Salón                                                        │ │
│  │  [✓] Todos  [ ] A  [ ] B  [ ] C  [ ] D                        │ │
│  │                                                               │ │
│  │  Ruta                                                         │ │
│  │  [Todas las rutas ▼]                                          │ │
│  │                                                               │ │
│  │  Estado                                                       │ │
│  │  ( ) Todos  (•) Solo activos  ( ) Solo inactivos              │ │
│  │                                                               │ │
│  │                              [Aplicar Filtros]                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Estudiantes Seleccionados: 156                                     │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Opciones de Generación                                        │ │
│  │                                                               │ │
│  │  Formato de Salida                                            │ │
│  │  ( ) Hoja A4 con múltiples QR (6 por página)                  │ │
│  │  ( ) Tarjetas individuales para imprimir                      │ │
│  │  ( ) Archivo ZIP con imágenes PNG individuales                │ │
│  │  ( ) PDF con un QR por página                                │ │
│  │                                                               │ │
│  │  Incluir en el QR                                             │ │
│  │  [✓] Nombre del estudiante                                    │ │
│  │  [✓] Grado y salón                                            │ │
│  │  [✓] Número de matrícula                                      │ │
│  │  [✓] Logo de la institución                                   │ │
│  │  [ ] Foto del estudiante                                      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ 📥 Descargar Todo   │  │ 📧 Enviar por Email a Padres        │  │
│  │                     │  │                                     │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                      │
│  ┌─────────────────────┐  ┌─────────────────────────────────────┐  │
│  │ 🖨️  Imprimir Todo   │  │ 📱 Enviar por WhatsApp a Padres     │  │
│  │                     │  │                                     │  │
│  └─────────────────────┘  └─────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Trip Monitoring

### 5.1 Vista de Viajes Activos

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Monitoreo de Viajes                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Viajes Activos                    [📊 Ver Historial] [📍 Ver Mapa] │
│                                                                      │
│  Filtros: [Todos] [En ruta] [Recogida] [Retorno]   [Fecha: Hoy ▼]  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje #1234 - Ruta Centro - Escuela A    [EN RUTA] 🟢   │  │
│  │                                                              │  │
│  │ Conductor: Juan Pérez              Vehículo: ABC-1234       │  │
│  │ Inicio: 07:00   │   Ahora: 07:32   │   ETA: 08:15           │  │
│  │                                                              │  │
│  │ Progreso: ████████░░░░░░░░ 60%                              │  │
│  │                                                              │  │
│  │ ┌────────────────┬────────────────┬────────────────────┐    │  │
│  │ │ Estudiantes    │ Paradas        │ Estado             │    │  │
│  │ ├────────────────┼────────────────┼────────────────────┤    │  │
│  │ │ 28/30 a bordo  │ 5/8 completadas│ 🟢 Sin problemas   │    │  │
│  │ │ 2 pendientes   │ 3 restantes    │                    │    │  │
│  │ └────────────────┴────────────────┴────────────────────┘    │  │
│  │                                                              │  │
│  │ Última actualización GPS: Hace 12 segundos                  │  │
│  │ Ubicación: Av. América y Colón                              │  │
│  │                                                              │  │
│  │ [📍 Ver en Mapa] [📊 Ver Detalles] [💬 Contactar Conductor] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje #1235 - Ruta Norte - Escuela B     [RECOGIDA] 🟡  │  │
│  │                                                              │  │
│  │ Conductor: María González          Vehículo: DEF-9012       │  │
│  │ Inicio: 06:30   │   Ahora: 07:32   │   ETA: 08:00           │  │
│  │                                                              │  │
│  │ Progreso: ███████████░░░░░ 75%                              │  │
│  │                                                              │  │
│  │ ┌────────────────┬────────────────┬────────────────────┐    │  │
│  │ │ Estudiantes    │ Paradas        │ Estado             │    │  │
│  │ ├────────────────┼────────────────┼────────────────────┤    │  │
│  │ │ 22/25 a bordo  │ 9/12 completadas│ 🟡 Retraso 5 min   │    │  │
│  │ │ 3 pendientes   │ 3 restantes    │                    │    │  │
│  │ └────────────────┴────────────────┴────────────────────┘    │  │
│  │                                                              │  │
│  │ Última actualización GPS: Hace 8 segundos                   │  │
│  │ Ubicación: Av. 10 de Agosto y Naciones Unidas              │  │
│  │                                                              │  │
│  │ [📍 Ver en Mapa] [📊 Ver Detalles] [💬 Contactar Conductor] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje #1236 - Ruta Sur - Escuela A       [RETORNO] 🔵  │  │
│  │                                                              │  │
│  │ Conductor: Carlos Ruiz             Vehículo: GHI-3456       │  │
│  │ Inicio: 13:00   │   Ahora: 13:45   │   ETA: 14:30           │  │
│  │                                                              │  │
│  │ Progreso: ████░░░░░░░░░░░░ 40%                              │  │
│  │                                                              │  │
│  │ ┌────────────────┬────────────────┬────────────────────┐    │  │
│  │ │ Estudiantes    │ Paradas        │ Estado             │    │  │
│  │ ├────────────────┼────────────────┼────────────────────┤    │  │
│  │ │ 18 a bordo     │ 4/10 completadas│ 🟢 Sin problemas   │    │  │
│  │ │ 4 entregados   │ 6 restantes    │                    │    │  │
│  │ └────────────────┴────────────────┴────────────────────┘    │  │
│  │                                                              │  │
│  │ Última actualización GPS: Hace 5 segundos                   │  │
│  │ Ubicación: Av. 6 de Diciembre y Orellana                    │  │
│  │                                                              │  │
│  │ [📍 Ver en Mapa] [📊 Ver Detalles] [💬 Contactar Conductor] │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [← Anterior] Página 1 de 1 [Siguiente →]                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Mapa de Viajes en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Monitoreo de Viajes / Mapa en Tiempo Real                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Mapa de Viajes                              [📋 Vista de Lista]    │
│                                                                      │
│  ┌─────────────────────┐                                            │
│  │ Filtros             │                                            │
│  │ [✓] Viajes activos  │   ┌──────────────────────────────────────┐│
│  │ [✓] Paradas         │   │                                      ││
│  │ [ ] Rutas completas │   │                                      ││
│  │ [✓] Estudiantes     │   │          [MAPA INTERACTIVO]          ││
│  │                     │   │                                      ││
│  │ Estado:             │   │   🚌 Bus en movimiento (azul)        ││
│  │ [✓] En ruta         │   │   📍 Paradas (verde = completada)   ││
│  │ [✓] Recogida        │   │        (naranja = actual)            ││
│  │ [✓] Retorno         │   │        (gris = pendiente)           ││
│  │ [ ] Completado      │   │   👨‍🎓 Estudiantes (ubicación)        ││
│  │                     │   │   🏫 Escuelas (morado)              ││
│  │ Vehículos:          │   │                                      ││
│  │ [✓] ABC-1234        │   │   Zoom: [+] [-]                     ││
│  │ [✓] DEF-9012        │   │   [🎯 Centrar vista]                ││
│  │ [✓] GHI-3456        │   │                                      ││
│  │                     │   │                                      ││
│  │ [Aplicar]           │   └──────────────────────────────────────┘│
│  └─────────────────────┘                                            │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Viajes Visibles en Mapa                                      │  │
│  │                                                               │  │
│  │ 🟢 Viaje #1234 - ABC-1234 - 28 estudiantes  [Ver detalles]  │  │
│  │ 🟡 Viaje #1235 - DEF-9012 - 22 estudiantes  [Ver detalles]  │  │
│  │ 🔵 Viaje #1236 - GHI-3456 - 18 estudiantes  [Ver detalles]  │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Actualización automática: 🟢 Activa (cada 15 segundos)             │
│  Última actualización: Hace 3 segundos                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.3 Detalles de Viaje Individual

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Monitoreo de Viajes / Viaje #1234                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Viaje #1234 - Ruta Centro - Escuela A           [EN RUTA] 🟢      │
│  Fecha: 05/01/2025                                                  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información General                                           │ │
│  │                                                               │ │
│  │ Conductor: Juan Pérez                Teléfono: +593 99 123 45│ │
│  │ Vehículo: ABC-1234 (Toyota Coaster)                          │ │
│  │ Ruta: Centro - Escuela A (Ida)                               │ │
│  │ Hora Inicio: 07:00    Hora Actual: 07:45    ETA: 08:15       │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Timeline del Viaje                                            │ │
│  │                                                               │ │
│  │ ✅ 07:00 - Viaje iniciado                                     │ │
│  │ ✅ 07:05 - Parada 1 (Centro Comercial) - 5 estudiantes       │ │
│  │ ✅ 07:15 - Parada 2 (Parque Central) - 8 estudiantes         │ │
│  │ ✅ 07:25 - Parada 3 (Iglesia San Juan) - 6 estudiantes       │ │
│  │ ✅ 07:35 - Parada 4 (Plaza Mayor) - 9 estudiantes            │ │
│  │ 🔵 07:45 - En tránsito hacia Parada 5                         │ │
│  │ ⏳ 07:55 - Parada 5 (Terminal) - 5 estudiantes esperados     │ │
│  │ ⏳ 08:05 - Parada 6 (Hospital) - 3 estudiantes esperados     │ │
│  │ ⏳ 08:15 - Destino (Escuela A)                                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Estudiantes en el Viaje (28/30)                               │ │
│  │                                                               │ │
│  │ ✅ Juan Pérez (Parada 1)      - Abordó: 07:06                │ │
│  │ ✅ Ana Torres (Parada 1)      - Abordó: 07:06                │ │
│  │ ✅ Diego López (Parada 2)     - Abordó: 07:16                │ │
│  │ ✅ María González (Parada 2)  - Abordó: 07:16                │ │
│  │ ... [Ver 24 más]                                             │ │
│  │                                                               │ │
│  │ ⚠️ Estudiantes Ausentes (2):                                  │ │
│  │ ❌ Carlos Ruiz (Parada 3)     - No se presentó               │ │
│  │ ❌ Sofía Morales (Parada 4)   - No se presentó               │ │
│  │                                                               │ │
│  │ [📋 Exportar Lista] [📧 Notificar Ausentes]                   │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Seguimiento GPS                                               │ │
│  │                                                               │ │
│  │ ┌─────────────────────────┐                                  │ │
│  │ │                         │                                  │ │
│  │ │   [MINI MAPA]           │  Ubicación actual:               │ │
│  │ │   Mostrando ruta        │  Av. 10 de Agosto y Colón        │ │
│  │ │   y posición actual     │                                  │ │
│  │ │                         │  Velocidad: 35 km/h              │ │
│  │ └─────────────────────────┘  Última actualización: 5s        │ │
│  │                                                               │ │
│  │ [🗺️  Ver Mapa Completo]                                       │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Acciones Rápidas                                              │ │
│  │                                                               │ │
│  │ [💬 Contactar Conductor]  [📢 Enviar Anuncio]                 │ │
│  │ [⚠️  Reportar Incidente]   [🔴 Finalizar Viaje]               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                                              [← Volver a Lista]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.4 Historial de Viajes

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Monitoreo de Viajes / Historial                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Historial de Viajes                         [📊 Ver Estadísticas]  │
│                                                                      │
│  [Buscar viajes...]                                                 │
│                                                                      │
│  Fecha: [Del: 01/01/2025] [Al: 05/01/2025] [Aplicar]               │
│                                                                      │
│  Filtros:                                                            │
│  Ruta: [Todas ▼]  Conductor: [Todos ▼]  Estado: [Todos ▼]          │
│                                                                      │
├─┬──────┬────────────┬──────────┬──────────┬──────────┬──────┬───────┤
│ │ ID   │ Fecha/Hora │ Ruta     │ Conductor│ Vehículo │Estado│Acción │
├─┼──────┼────────────┼──────────┼──────────┼──────────┼──────┼───────┤
│ │ 1234 │ 05/01/2025 │ Centro - │ J. Pérez │ ABC-1234 │🟢 OK │ [...] ││
│ │      │ 07:00-08:12│ Escuela A│          │ 28/30    │      │       ││
│ │      │            │          │          │          │      │       ││
│ │ 1233 │ 04/01/2025 │ Norte -  │ M. Glez  │ DEF-9012 │🟡 Ret│ [...] ││
│ │      │ 06:30-07:58│ Escuela B│          │ 25/25    │raso  │       ││
│ │      │            │          │          │          │      │       ││
│ │ 1232 │ 04/01/2025 │ Sur -    │ C. Ruiz  │ GHI-3456 │🔴 Inc│ [...] ││
│ │      │ 07:00-08:45│ Escuela A│          │ 22/30    │idente│       ││
│ │      │            │          │          │          │      │       ││
│ │ 1231 │ 03/01/2025 │ Centro - │ J. Pérez │ ABC-1234 │🟢 OK │ [...] ││
│ │      │ 07:00-08:10│ Escuela A│          │ 30/30    │      │       ││
└─┴──────┴────────────┴──────────┴──────────┴──────────┴──────┴───────┘

  [← Anterior] Página 1 de 142 [Siguiente →]

  [📥 Exportar a Excel] [📄 Generar Reporte PDF]
```

**Menú desplegable [...] para cada viaje:**
```
┌─────────────────────┐
│ 📊 Ver detalles     │
│ 📍 Ver recorrido    │
│ 📋 Ver estudiantes  │
│ 📄 Exportar reporte │
│ 🗑️  Eliminar        │
└─────────────────────┘
```

---

## 6. Incident Management

### 6.1 Lista de Incidentes

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Incidentes                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Incidentes                                   [+ Nuevo Incidente]    │
│                                                                      │
│  [Buscar incidentes...]                    [Filtrar: Todos ▼]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Severidad: [Todos] [🔴 Alta] [🟡 Media] [🟢 Baja]                  │
│  Estado: [Todos] [Abierto] [En investigación] [Resuelto] [Cerrado] │
│  Fecha: [Última semana ▼]                                           │
│                                                                      │
├─┬─────┬────────────┬──────────────┬──────────┬──────────┬───┬───────┤
│ │ ID  │ Fecha/Hora │ Tipo         │ Viaje    │ Reportado│Sev│Acción │
├─┼─────┼────────────┼──────────────┼──────────┼──────────┼───┼───────┤
│ │ 042 │ 05/01/2025 │ Retraso      │ #1235    │ Conductor│🟡 │ [...] ││
│ │     │ 07:25      │              │ Ruta Nte │ M. Glez  │   │       ││
│ │     │            │ 🟡 En invest.│          │          │   │       ││
│ │                                                                   ││
│ │ 041 │ 04/01/2025 │ Accidente    │ #1232    │ Admin    │🔴 │ [...] ││
│ │     │ 07:30      │ leve         │ Ruta Sur │ Sistema  │   │       ││
│ │     │            │ 🔴 Abierto   │          │          │   │       ││
│ │                                                                   ││
│ │ 040 │ 04/01/2025 │ Estudiante   │ #1230    │ Padre    │🟢 │ [...] ││
│ │     │ 08:00      │ no abordó    │ Rta Ctro │ L. Gómez │   │       ││
│ │     │            │ ✅ Resuelto  │          │          │   │       ││
│ │                                                                   ││
│ │ 039 │ 03/01/2025 │ Vehículo     │ #1228    │ Conductor│🟡 │ [...] ││
│ │     │ 06:45      │ averiado     │ Ruta Nte │ J. Pérez │   │       ││
│ │     │            │ ✅ Resuelto  │          │          │   │       ││
└─┴─────┴────────────┴──────────────┴──────────┴──────────┴───┴───────┘

  [← Anterior] Página 1 de 15 [Siguiente →]
```

**Menú desplegable [...] para cada incidente:**
```
┌──────────────────────┐
│ 📝 Ver detalles      │
│ 🔍 Investigar        │
│ ✅ Marcar resuelto   │
│ 📧 Notificar         │
│ 📄 Exportar reporte  │
│ 🗑️  Eliminar         │
└──────────────────────┘
```

### 6.2 Formulario: Crear Incidente

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Incidentes / Nuevo Incidente                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Nuevo Incidente                                                    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Básica                                            │ │
│  │                                                               │ │
│  │  Tipo de Incidente *                                          │ │
│  │  [Seleccionar tipo ▼]                                         │ │
│  │  Opciones: Accidente, Retraso, Avería mecánica, Comportamiento│ │
│  │            Salud/Emergencia médica, Otro                      │ │
│  │                                                               │ │
│  │  Título *                                                     │ │
│  │  [_______________________________________________________]    │ │
│  │  Ej: Retraso por tráfico intenso                              │ │
│  │                                                               │ │
│  │  Severidad *                                                  │ │
│  │  ( ) 🔴 Alta - Requiere atención inmediata                    │ │
│  │  ( ) 🟡 Media - Importante pero no urgente                    │ │
│  │  ( ) 🟢 Baja - Informativo                                    │ │
│  │                                                               │ │
│  │  Fecha y Hora del Incidente *                                 │ │
│  │  [__/__/____] 📅  [__:__] 🕐                                  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Contexto del Incidente                                        │ │
│  │                                                                │ │
│  │  Viaje Relacionado                                            │ │
│  │  [Seleccionar viaje ▼]  o  [🔍 Buscar por ID]                 │ │
│  │                                                                │ │
│  │  Información cargada automáticamente:                         │ │
│  │  • Ruta: Centro - Escuela A                                   │ │
│  │  • Conductor: Juan Pérez                                      │ │
│  │  • Vehículo: ABC-1234                                         │ │
│  │                                                                │ │
│  │  Ubicación del Incidente                                      │ │
│  │  [_______________________________________________________]    │ │
│  │  Ej: Av. 10 de Agosto y Colón                                 │ │
│  │                                                                │ │
│  │  Coordenadas GPS                                              │ │
│  │  Lat: [______________]  Lng: [______________]                 │ │
│  │  [📍 Capturar ubicación actual]                               │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Personas Involucradas                                         │ │
│  │                                                                │ │
│  │  Conductor Involucrado                                        │ │
│  │  [✓] Juan Pérez (Cargado del viaje)                           │ │
│  │                                                                │ │
│  │  Estudiantes Involucrados                [+ Agregar Estudiante]│ │
│  │  [ ] Ninguno                                                  │ │
│  │  [✓] María Rodríguez (4to A)             [Remover]            │ │
│  │  [✓] Carlos Sánchez (3ro B)              [Remover]            │ │
│  │                                                                │ │
│  │  Otros Involucrados                                           │ │
│  │  [_______________________________________________________]    │ │
│  │  Ej: Peatones, otros vehículos, etc.                          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Descripción del Incidente                                     │ │
│  │                                                                │ │
│  │  Descripción Detallada *                                      │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  ¿Qué sucedió? ¿Quién estaba involucrado? ¿Cómo se manejó?   │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Evidencia                                                     │ │
│  │                                                                │ │
│  │  Fotos/Videos                                                 │ │
│  │  ┌─────────────┐ ┌─────────────┐                             │ │
│  │  │   [IMG 1]   │ │   [IMG 2]   │  [📷 Subir archivos]        │ │
│  │  └─────────────┘ └─────────────┘                             │ │
│  │                                                                │ │
│  │  Documentos Adicionales                                       │ │
│  │  📄 reporte_policial.pdf  [Ver] [Eliminar]                    │ │
│  │  [📎 Adjuntar documentos]                                     │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Acciones Tomadas                                              │ │
│  │                                                                │ │
│  │  Acciones Inmediatas                                          │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  [ ] Se notificó a los padres                                 │ │
│  │  [ ] Se contactó a servicios de emergencia                    │ │
│  │  [ ] Se suspendió el viaje                                    │ │
│  │  [ ] Se reemplazó el vehículo/conductor                       │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Seguimiento                                                   │ │
│  │                                                                │ │
│  │  Estado Inicial *                                             │ │
│  │  (•) Abierto - Incidente reportado, pendiente revisión        │ │
│  │  ( ) En investigación - Recopilando información               │ │
│  │                                                                │ │
│  │  Asignado a                                                   │ │
│  │  [Seleccionar administrador ▼]                                │ │
│  │                                                                │ │
│  │  Prioridad de Seguimiento                                     │ │
│  │  ( ) Urgente  ( ) Normal  ( ) Baja                            │ │
│  │                                                                │ │
│  │  Fecha Límite de Resolución                                   │ │
│  │  [__/__/____] 📅                                              │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Notificaciones                                                │ │
│  │                                                                │ │
│  │  Notificar a:                                                 │ │
│  │  [ ] Padres de estudiantes involucrados                       │ │
│  │  [ ] Director de la institución                               │ │
│  │  [ ] Equipo de administración                                 │ │
│  │  [ ] Conductor involucrado                                    │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Incidente]         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.3 Vista de Detalle e Investigación

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Gestión de Incidentes / Incidente #042                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Incidente #042 - Retraso por tráfico      [EN INVESTIGACIÓN] 🟡   │
│  Severidad: 🟡 Media                    Prioridad: Normal           │
│                                                                      │
│  [📝 Editar] [✅ Marcar Resuelto] [📧 Notificar] [📄 Exportar PDF]  │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información General                                           │ │
│  │                                                               │ │
│  │ Tipo: Retraso                                                 │ │
│  │ Fecha/Hora: 05/01/2025 - 07:25                                │ │
│  │ Reportado por: Conductor (María González)                     │ │
│  │ Asignado a: Admin Principal (Juan López)                      │ │
│  │ Fecha límite: 07/01/2025                                      │ │
│  │                                                               │ │
│  │ Viaje: #1235 - Ruta Norte - Escuela B                        │ │
│  │ Conductor: María González                                     │ │
│  │ Vehículo: DEF-9012                                            │ │
│  │ Ubicación: Av. 10 de Agosto y Naciones Unidas                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Descripción                                                   │ │
│  │                                                               │ │
│  │ "Tráfico intenso en la Av. 10 de Agosto debido a accidente   │ │
│  │ de tránsito. Se tomó ruta alterna por Av. 6 de Diciembre.    │ │
│  │ Retraso estimado de 15 minutos. Se notificó a los padres     │ │
│  │ mediante el sistema."                                         │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Personas Involucradas                                         │ │
│  │                                                               │ │
│  │ Conductor: María González                                     │ │
│  │ Estudiantes: 22 a bordo (ninguno afectado directamente)      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Evidencia (3 archivos)                                        │ │
│  │                                                               │ │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │ │
│  │ │   [FOTO 1]  │ │   [FOTO 2]  │ │   [MAPA]    │             │ │
│  │ │   Tráfico   │ │   Desvío    │ │   Recorrido │             │ │
│  │ └─────────────┘ └─────────────┘ └─────────────┘             │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Timeline de Investigación                                     │ │
│  │                                                               │ │
│  │ 🔵 05/01/2025 07:25 - Incidente reportado                     │ │
│  │    Por: María González (Conductor)                            │ │
│  │                                                               │ │
│  │ 🔵 05/01/2025 07:30 - Actualización de estado                 │ │
│  │    "Ruta alterna tomada, ETA actualizado"                     │ │
│  │    Por: María González                                        │ │
│  │                                                               │ │
│  │ 🔵 05/01/2025 07:32 - Notificaciones enviadas                 │ │
│  │    "22 padres notificados por SMS/WhatsApp"                   │ │
│  │    Por: Sistema                                               │ │
│  │                                                               │ │
│  │ 🔵 05/01/2025 08:05 - Viaje completado                        │ │
│  │    "Estudiantes entregados con 12 minutos de retraso"         │ │
│  │    Por: Sistema                                               │ │
│  │                                                               │ │
│  │ 🔵 05/01/2025 10:15 - Investigación iniciada                  │ │
│  │    Asignado a: Juan López                                     │ │
│  │    Por: Admin Principal                                       │ │
│  │                                                               │ │
│  │ [+ Agregar Nota/Actualización]                                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Agregar Actualización                                         │ │
│  │                                                               │ │
│  │ [_______________________________________________________]     │ │
│  │ [_______________________________________________________]     │ │
│  │                                                               │ │
│  │ Cambiar estado:                                               │ │
│  │ ( ) Abierto  (•) En investigación  ( ) Resuelto  ( ) Cerrado │ │
│  │                                                               │ │
│  │                                      [Agregar Actualización]  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Acciones Tomadas                                              │ │
│  │                                                               │ │
│  │ ✅ Padres notificados automáticamente                         │ │
│  │ ✅ Ruta alterna utilizada                                     │ │
│  │ ✅ ETA actualizado en tiempo real                             │ │
│  │ ⏳ Pendiente: Revisar patrones de tráfico en esta zona        │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Resolución y Cierre                                           │ │
│  │                                                               │ │
│  │ Resolución:                                                   │ │
│  │ [_______________________________________________________]     │ │
│  │ [_______________________________________________________]     │ │
│  │                                                               │ │
│  │ Medidas Preventivas:                                          │ │
│  │ [ ] Ajustar horarios de ruta                                  │ │
│  │ [ ] Considerar rutas alternas permanentes                     │ │
│  │ [ ] Capacitación adicional                                    │ │
│  │ [ ] Otro: [_____________________]                             │ │
│  │                                                               │ │
│  │                              [Marcar como Resuelto]           │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                                              [← Volver a Lista]      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Reports and Analytics

### 7.1 Dashboard de Reportes

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Reportes y Análisis                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Reportes y Análisis                         [📄 Generar Reporte]   │
│                                                                      │
│  Período: [Último mes ▼]  Del: [01/12/2024] Al: [05/01/2025]       │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Métricas Generales                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │  📊 Viajes     │ │  ✅ Tasa       │ │  ⏱️  Puntualidad│         │
│  │  Realizados    │ │  Completados   │ │                │         │
│  │  1,234         │ │  98.5%         │ │  92.3%         │         │
│  │  ▲ +5% vs mes  │ │  ▼ -0.5%       │ │  ▲ +2.1%       │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                      │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐         │
│  │  👨‍🎓 Asistencia │ │  ⚠️ Incidentes │ │  😊 Satisfacción│         │
│  │  Estudiantes   │ │  Reportados    │ │  (Padres)      │         │
│  │  94.2%         │ │  18            │ │  4.7/5.0       │         │
│  │  ▲ +1.2%       │ │  ▼ -3 vs mes   │ │  ▲ +0.2        │         │
│  └────────────────┘ └────────────────┘ └────────────────┘         │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Análisis de Viajes                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Viajes por Día de la Semana                                   │ │
│  │                                                               │ │
│  │  [GRÁFICO DE BARRAS]                                          │ │
│  │                                                               │ │
│  │  Lunes:    ████████████████░░░░ 245 viajes                    │ │
│  │  Martes:   ██████████████████░░ 268 viajes                    │ │
│  │  Miércoles:███████████████░░░░░ 232 viajes                    │ │
│  │  Jueves:   ██████████████████░░ 256 viajes                    │ │
│  │  Viernes:  █████████████████░░░ 233 viajes                    │ │
│  │                                                               │ │
│  │  Total: 1,234 viajes                                          │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Puntualidad por Ruta                                          │ │
│  │                                                               │ │
│  │  [GRÁFICO DE LÍNEAS - TENDENCIA]                              │ │
│  │                                                               │ │
│  │  Ruta Centro:  ████████████████████ 95.2% puntual            │ │
│  │  Ruta Norte:   ██████████████████░░ 89.5% puntual            │ │
│  │  Ruta Sur:     ███████████████████░ 93.8% puntual            │ │
│  │  Ruta Este:    ████████████████░░░░ 87.3% puntual            │ │
│  │                                                               │ │
│  │  Promedio general: 92.3%                                      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Análisis de Estudiantes                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Asistencia por Grado                                          │ │
│  │                                                               │ │
│  │  [GRÁFICO CIRCULAR]                                           │ │
│  │                                                               │ │
│  │  1er Grado: 96.5%  |  4to Grado: 94.1%                        │ │
│  │  2do Grado: 95.2%  |  5to Grado: 92.8%                        │ │
│  │  3er Grado: 93.7%  |  6to Grado: 91.5%                        │ │
│  │                                                               │ │
│  │  Promedio general: 94.2%                                      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Top 5 Estudiantes con Mayor Asistencia                       │ │
│  │                                                               │ │
│  │  1. Juan Pérez González (5to B)     - 100% (45/45 viajes)    │ │
│  │  2. Ana Torres Martínez (4to C)     - 100% (45/45 viajes)    │ │
│  │  3. Diego López Ramírez (3ro A)     - 97.8% (44/45 viajes)   │ │
│  │  4. María González Silva (4to A)    - 97.8% (44/45 viajes)   │ │
│  │  5. Carlos Ruiz Moreno (5to A)      - 95.6% (43/45 viajes)   │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Análisis de Flota                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Utilización de Vehículos                                      │ │
│  │                                                               │ │
│  │  ABC-1234: ████████████████████ 412 viajes (33.4%)           │ │
│  │  DEF-9012: ███████████████████░ 398 viajes (32.3%)           │ │
│  │  GHI-3456: ████████████████░░░░ 345 viajes (28.0%)           │ │
│  │  JKL-7890: ███████░░░░░░░░░░░░░  79 viajes (6.4%)            │ │
│  │                                                               │ │
│  │  Total: 1,234 viajes                                          │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Mantenimiento y Costos                                        │ │
│  │                                                               │ │
│  │  Vehículos en mantenimiento: 1                                │ │
│  │  Próximos mantenimientos: 2 (en 15 días)                      │ │
│  │  Costo promedio por viaje: $12.50                             │ │
│  │  Costo total del período: $15,425.00                          │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Incidentes y Seguridad                                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Incidentes por Tipo                                           │ │
│  │                                                               │ │
│  │  [GRÁFICO DE BARRAS]                                          │ │
│  │                                                               │ │
│  │  Retrasos:           ███████░░░  8 incidentes (44%)           │ │
│  │  Averías mecánicas:  ████░░░░░░  4 incidentes (22%)           │ │
│  │  Comportamiento:     ███░░░░░░░  3 incidentes (17%)           │ │
│  │  Accidentes leves:   ██░░░░░░░░  2 incidentes (11%)           │ │
│  │  Emergencias médicas: █░░░░░░░░  1 incidente (6%)             │ │
│  │                                                               │ │
│  │  Total: 18 incidentes  |  Resueltos: 15 (83.3%)              │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [📥 Exportar Datos] [📊 Generar Reporte Completo] [📧 Enviar por Email]│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.2 Generador de Reportes Personalizados

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Reportes / Generar Reporte Personalizado                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Generar Reporte Personalizado                                      │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 1. Tipo de Reporte                                            │ │
│  │                                                               │ │
│  │  Seleccione el tipo de reporte:                               │ │
│  │  ( ) Viajes y Operaciones                                     │ │
│  │  ( ) Asistencia de Estudiantes                                │ │
│  │  ( ) Rendimiento de Conductores                               │ │
│  │  ( ) Utilización de Flota                                     │ │
│  │  ( ) Incidentes y Seguridad                                   │ │
│  │  ( ) Financiero (Costos y Gastos)                             │ │
│  │  ( ) Reporte Completo (Todos los anteriores)                  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 2. Período de Tiempo                                          │ │
│  │                                                               │ │
│  │  Rango de fechas:                                             │ │
│  │  Del: [__/__/____] 📅  Al: [__/__/____] 📅                    │ │
│  │                                                               │ │
│  │  Presets rápidos:                                             │ │
│  │  [Hoy] [Esta semana] [Este mes] [Mes pasado] [Este año]      │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 3. Filtros Adicionales (Opcional)                             │ │
│  │                                                               │ │
│  │  Rutas:                                                       │ │
│  │  [✓] Todas las rutas                                          │ │
│  │  [ ] Seleccionar rutas específicas: [Seleccionar ▼]           │ │
│  │                                                               │ │
│  │  Conductores:                                                 │ │
│  │  [✓] Todos los conductores                                    │ │
│  │  [ ] Seleccionar conductores específicos: [Seleccionar ▼]     │ │
│  │                                                               │ │
│  │  Vehículos:                                                   │ │
│  │  [✓] Todos los vehículos                                      │ │
│  │  [ ] Seleccionar vehículos específicos: [Seleccionar ▼]       │ │
│  │                                                               │ │
│  │  Grados:                                                      │ │
│  │  [✓] Todos los grados                                         │ │
│  │  [ ] Seleccionar grados específicos:                          │ │
│  │     [ ] 1ro [ ] 2do [ ] 3ro [ ] 4to [ ] 5to [ ] 6to           │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 4. Métricas a Incluir                                         │ │
│  │                                                               │ │
│  │  Viajes:                                                      │ │
│  │  [✓] Total de viajes realizados                               │ │
│  │  [✓] Tasa de completitud                                      │ │
│  │  [✓] Puntualidad promedio                                     │ │
│  │  [✓] Retrasos y causas                                        │ │
│  │  [✓] Viajes cancelados                                        │ │
│  │                                                               │ │
│  │  Estudiantes:                                                 │ │
│  │  [✓] Tasa de asistencia                                       │ │
│  │  [✓] Estudiantes transportados                                │ │
│  │  [✓] Ausencias por estudiante                                 │ │
│  │  [ ] Check-ins y check-outs detallados                        │ │
│  │                                                               │ │
│  │  Conductores:                                                 │ │
│  │  [✓] Horas de servicio                                        │ │
│  │  [✓] Puntualidad                                              │ │
│  │  [✓] Incidentes reportados                                    │ │
│  │  [ ] Evaluaciones de desempeño                                │ │
│  │                                                               │ │
│  │  Flota:                                                       │ │
│  │  [✓] Utilización de vehículos                                 │ │
│  │  [✓] Mantenimientos realizados                                │ │
│  │  [✓] Costos operativos                                        │ │
│  │  [ ] Consumo de combustible                                   │ │
│  │                                                               │ │
│  │  Incidentes:                                                  │ │
│  │  [✓] Total de incidentes                                      │ │
│  │  [✓] Incidentes por tipo                                      │ │
│  │  [✓] Incidentes por severidad                                 │ │
│  │  [✓] Tiempo promedio de resolución                            │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 5. Visualizaciones                                            │ │
│  │                                                               │ │
│  │  Incluir gráficos:                                            │ │
│  │  [✓] Gráficos de barras                                       │ │
│  │  [✓] Gráficos de líneas (tendencias)                          │ │
│  │  [✓] Gráficos circulares                                      │ │
│  │  [✓] Tablas resumen                                           │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 6. Formato de Salida                                          │ │
│  │                                                               │ │
│  │  Formato del archivo:                                         │ │
│  │  ( ) PDF (Recomendado para presentaciones)                    │ │
│  │  ( ) Excel (XLSX) - Para análisis adicional                   │ │
│  │  ( ) CSV - Datos crudos                                       │ │
│  │  ( ) HTML - Vista web                                         │ │
│  │                                                               │ │
│  │  Opciones adicionales:                                        │ │
│  │  [✓] Incluir logo de la institución                           │ │
│  │  [✓] Incluir fecha de generación                              │ │
│  │  [ ] Incluir glosario de términos                             │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ 7. Distribución                                               │ │
│  │                                                               │ │
│  │  ¿Cómo desea recibir el reporte?                              │ │
│  │  [✓] Descargar ahora                                          │ │
│  │  [ ] Enviar por email a: [____________________@____.__]       │ │
│  │  [ ] Programar envío recurrente:                              │ │
│  │      Frecuencia: [Semanal ▼]  Día: [Lunes ▼]                  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Vista Previa                                                  │ │
│  │                                                               │ │
│  │  Nombre del reporte: Reporte de Viajes - Diciembre 2024      │ │
│  │  Período: 01/12/2024 - 31/12/2024                             │ │
│  │  Métricas seleccionadas: 18                                   │ │
│  │  Formato: PDF                                                │ │
│  │  Tamaño estimado: 2.5 MB                                      │ │
│  │  Tiempo estimado de generación: 15-30 segundos                │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                              [Cancelar] [Generar Reporte]           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 7.3 Estadísticas en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Reportes / Estadísticas en Tiempo Real                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estadísticas en Tiempo Real                     [Actualizado: 07:45]│
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Operaciones HOY - 05/01/2025                                  │ │
│  │                                                               │ │
│  │ ┌──────────────┬──────────────┬──────────────┬─────────────┐ │ │
│  │ │ Viajes       │ Estudiantes  │ Conductores  │ Vehículos   │ │ │
│  │ ├──────────────┼──────────────┼──────────────┼─────────────┤ │ │
│  │ │ Activos: 12  │ A bordo: 342 │ Activos: 10  │ En ruta: 8  │ │ │
│  │ │ Completos: 8 │ En casa: 514 │ Libres: 8    │ Libres: 7   │ │ │
│  │ │ Pendientes:4 │ Total: 856   │ Total: 18    │ Total: 15   │ │ │
│  │ └──────────────┴──────────────┴──────────────┴─────────────┘ │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Rendimiento del Día                                           │ │
│  │                                                               │ │
│  │  Puntualidad:     ████████████████████ 95.5%                 │ │
│  │  Asistencia:      ███████████████████░ 94.2%                 │ │
│  │  Sin incidentes:  ██████████████████░░ 91.7%                 │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Alertas y Notificaciones                                      │ │
│  │                                                               │ │
│  │  🟡 2 viajes con retraso menor a 10 minutos                   │ │
│  │  🟢 15 estudiantes ausentes (notificaciones enviadas)         │ │
│  │  🟢 1 vehículo requiere mantenimiento en 3 días               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Comparación con Ayer                                          │ │
│  │                                                               │ │
│  │  Viajes completados:   20 / 24  (▼ -4 viajes)                │ │
│  │  Estudiantes a bordo:  342 / 356 (▼ -14 estudiantes)         │ │
│  │  Puntualidad:         95.5% / 92.3% (▲ +3.2%)                │ │
│  │  Incidentes:          2 / 3 (▼ -1 incidente)                 │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Actualización automática: 🟢 Cada 30 segundos                      │
│                                                                      │
│  [📊 Ver Dashboard Completo] [📥 Exportar Snapshot]                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Settings and Configuration

### 8.1 Configuración de Institución

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Configuración / Institución                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Configuración de Institución                                       │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información General                                           │ │
│  │                                                               │ │
│  │  Nombre de la Institución *                                   │ │
│  │  [_______________________________________________________]    │ │
│  │                                                               │ │
│  │  Nombre Corto                                                 │ │
│  │  [_______________________]                                    │ │
│  │                                                               │ │
│  │  RUC *                                                        │ │
│  │  [__________________]  13 dígitos                             │ │
│  │                                                               │ │
│  │  Logo de la Institución                                       │ │
│  │  ┌─────────────┐                                              │ │
│  │  │             │  [📷 Subir logo]                              │ │
│  │  │  [LOGO]     │  [🗑️  Eliminar]                              │ │
│  │  │             │  Formatos: PNG, JPG (max 2MB)                │ │
│  │  └─────────────┘                                              │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información de Contacto                                       │ │
│  │                                                                │ │
│  │  Dirección *                                                  │ │
│  │  [_______________________________________________________]    │ │
│  │  [_______________________________________________________]    │ │
│  │                                                                │ │
│  │  Ciudad *                    Provincia *                      │ │
│  │  [______________]            [______________]                 │ │
│  │                                                                │ │
│  │  Código Postal               País                             │ │
│  │  [______________]            [Ecuador ▼]                      │ │
│  │                                                                │ │
│  │  Teléfono Principal *                                         │ │
│  │  [+593_____________]  Formato: +593XXXXXXXXX                  │ │
│  │                                                                │ │
│  │  Email Institucional *                                        │ │
│  │  [_______________________@____.__]                            │ │
│  │                                                                │ │
│  │  Sitio Web                                                    │ │
│  │  [https://_____________________]                              │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Configuración Regional                                        │ │
│  │                                                                │ │
│  │  Zona Horaria *                                               │ │
│  │  [America/Guayaquil (UTC-5) ▼]                                │ │
│  │                                                                │ │
│  │  Idioma Principal *                                           │ │
│  │  ( ) Español (es)  [ ] Inglés (en)                            │ │
│  │                                                                │ │
│  │  Formato de Fecha                                             │ │
│  │  (•) DD/MM/YYYY  ( ) MM/DD/YYYY  ( ) YYYY-MM-DD               │ │
│  │                                                                │ │
│  │  Formato de Hora                                              │ │
│  │  (•) 24 horas (HH:mm)  ( ) 12 horas (hh:mm AM/PM)             │ │
│  │                                                                │ │
│  │  Moneda                                                       │ │
│  │  [USD - Dólar Estadounidense ▼]                               │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Configuración Académica                                       │ │
│  │                                                                │ │
│  │  Año Académico Actual *                                       │ │
│  │  [2024-2025 ▼]                                                │ │
│  │                                                                │ │
│  │  Grados Ofrecidos                                             │ │
│  │  [✓] 1ro  [✓] 2do  [✓] 3ro  [✓] 4to  [✓] 5to  [✓] 6to        │ │
│  │                                                                │ │
│  │  Salones/Paralelos por Grado                                  │ │
│  │  [A, B, C, D________________________________________]          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Guardar Cambios]           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.2 Gestión de Usuarios y Roles

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Configuración / Usuarios y Roles                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Gestión de Usuarios                               [+ Nuevo Usuario] │
│                                                                      │
│  [Buscar usuarios...]                         [Filtrar: Todos ▼]    │
│                                                                      │
│  Rol: [Todos] [Super Admin] [Admin] [Driver] [Parent]              │
│  Estado: [Todos] [Activo] [Inactivo]                               │
│                                                                      │
├─┬──────────────┬──────────────────┬─────────────┬──────────┬────────┤
│ │ Nombre       │ Email            │ Rol         │ Estado   │ Acción │
├─┼──────────────┼──────────────────┼─────────────┼──────────┼────────┤
│ │ Juan López   │ juan@escuela.com │ Super Admin │ 🟢 Activo│ [...] ││
│ │              │                  │ (Nivel 1000)│          │       ││
│ │                                                                   ││
│ │ María Pérez  │ maria@esc.com    │ Admin       │ 🟢 Activo│ [...] ││
│ │              │                  │ (Nivel 500) │          │       ││
│ │                                                                   ││
│ │ Carlos Ruiz  │ carlos@esc.com   │ Driver      │ 🟢 Activo│ [...] ││
│ │              │                  │ (Nivel 100) │          │       ││
│ │                                                                   ││
│ │ Ana González │ ana@gmail.com    │ Parent      │ 🟢 Activo│ [...] ││
│ │              │                  │ (Nivel 10)  │          │       ││
└─┴──────────────┴──────────────────┴─────────────┴──────────┴────────┘

  [← Anterior] Página 1 de 12 [Siguiente →]
```

**Formulario: Crear/Editar Usuario**
```
┌─────────────────────────────────────────────────────────────────────┐
│  Nuevo Usuario                                              [✕]     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información Personal                                          │ │
│  │                                                               │ │
│  │  Nombre Completo *                                            │ │
│  │  [_______________________________________________________]    │ │
│  │                                                               │ │
│  │  Email *                                                      │ │
│  │  [_______________________@____.__]                            │ │
│  │                                                               │ │
│  │  Teléfono                                                     │ │
│  │  [+593_____________]                                          │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Rol y Permisos                                                │ │
│  │                                                               │ │
│  │  Rol del Usuario *                                            │ │
│  │  ( ) Super Admin (Nivel 1000) - Acceso total a la plataforma │ │
│  │      • Gestión de múltiples instituciones                     │ │
│  │      • Configuración de sistema                               │ │
│  │                                                               │ │
│  │  ( ) Admin (Nivel 500) - Gestión de la institución           │ │
│  │      • Gestión de flota, rutas, estudiantes                   │ │
│  │      • Visualización de reportes                              │ │
│  │      • Sin acceso a configuración de sistema                  │ │
│  │                                                               │ │
│  │  ( ) Driver (Nivel 100) - Operaciones de viaje                │ │
│  │      • Gestión de viajes asignados                            │ │
│  │      • Check-in/out de estudiantes                            │ │
│  │      • Reporte de incidentes                                  │ │
│  │      • Sin acceso a configuración                             │ │
│  │                                                               │ │
│  │  ( ) Parent (Nivel 10) - Solo lectura                         │ │
│  │      • Ver viajes de sus hijos                                │ │
│  │      • Recibir notificaciones                                 │ │
│  │      • Sin acceso a gestión                                   │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Vinculación (Solo para conductores y padres)                  │ │
│  │                                                                │ │
│  │  Si el rol es Driver:                                         │ │
│  │  Vincular a conductor: [Seleccionar conductor ▼]              │ │
│  │                                                                │ │
│  │  Si el rol es Parent:                                         │ │
│  │  Vincular a estudiantes: [Seleccionar estudiantes ▼]          │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Configuración de Acceso                                       │ │
│  │                                                                │ │
│  │  Estado del Usuario                                           │ │
│  │  (•) Activo  ( ) Inactivo                                     │ │
│  │                                                                │ │
│  │  [ ] Enviar email de invitación con instrucciones de acceso   │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  * Campos obligatorios                                              │
│                                                                      │
│                              [Cancelar] [Crear Usuario]             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.3 Configuración de Notificaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Configuración / Notificaciones                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Configuración de Notificaciones                                    │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Canales de Notificación                                       │ │
│  │                                                               │ │
│  │  Métodos de envío activos:                                    │ │
│  │  [✓] Email                                                    │ │
│  │  [✓] SMS                                                      │ │
│  │  [✓] WhatsApp                                                 │ │
│  │  [✓] Push Notifications (App móvil)                           │ │
│  │  [ ] Telegram (Próximamente)                                  │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Notificaciones para Padres                                    │ │
│  │                                                               │ │
│  │  Viajes:                                                      │ │
│  │  [✓] Viaje iniciado                                           │ │
│  │  [✓] Conductor en camino a parada                             │ │
│  │  [✓] Estudiante abordó el bus                                 │ │
│  │  [✓] Estudiante bajó del bus                                  │ │
│  │  [✓] Viaje completado                                         │ │
│  │  [✓] Retrasos (más de 10 minutos)                             │ │
│  │                                                               │ │
│  │  Alertas:                                                     │ │
│  │  [✓] Estudiante no abordó el bus                              │ │
│  │  [✓] Incidentes reportados                                    │ │
│  │  [✓] Cambios de ruta o horario                                │ │
│  │  [✓] Cancelaciones de viaje                                   │ │
│  │                                                               │ │
│  │  Frecuencia de actualizaciones GPS:                           │ │
│  │  ( ) Tiempo real (cada actualización)                         │ │
│  │  (•) Cada 5 minutos                                           │ │
│  │  ( ) Solo eventos importantes                                 │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Notificaciones para Conductores                               │ │
│  │                                                                │ │
│  │  [✓] Nuevo viaje asignado                                     │ │
│  │  [✓] Recordatorio de viaje (30 min antes)                     │ │
│  │  [✓] Cambios en la ruta o estudiantes                         │ │
│  │  [✓] Alertas de mantenimiento del vehículo                    │ │
│  │  [✓] Mensajes del administrador                               │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Notificaciones para Administradores                           │ │
│  │                                                                │ │
│  │  [✓] Incidentes reportados (prioridad alta)                   │ │
│  │  [✓] Viajes con retraso significativo (>15 min)               │ │
│  │  [✓] Vehículos que requieren mantenimiento                    │ │
│  │  [✓] Licencias de conductor por vencer                        │ │
│  │  [✓] Documentos de vehículos por vencer                       │ │
│  │  [ ] Resumen diario de operaciones (email)                    │ │
│  │  [ ] Resumen semanal de métricas (email)                      │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Configuración de Horarios                                     │ │
│  │                                                                │ │
│  │  No enviar notificaciones entre:                              │ │
│  │  [22:00] y [06:00]  (Modo silencioso nocturno)                │ │
│  │                                                                │ │
│  │  Excepciones (siempre notificar):                             │ │
│  │  [✓] Emergencias y alertas de seguridad                       │ │
│  │  [✓] Incidentes de severidad alta                             │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Plantillas de Mensajes                                        │ │
│  │                                                                │ │
│  │  [📝 Editar Plantillas de Email]                              │ │
│  │  [📱 Editar Plantillas de SMS/WhatsApp]                       │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Probar Notificaciones                                         │ │
│  │                                                                │ │
│  │  Enviar notificación de prueba a:                             │ │
│  │  [_______________________@____.__]                            │ │
│  │  [+593_____________]                                          │ │
│  │                                                                │ │
│  │  Tipo: [Viaje iniciado ▼]  [Enviar Prueba]                    │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                              [Cancelar] [Guardar Configuración]     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 8.4 Parámetros del Sistema

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]│
├─────────────────────────────────────────────────────────────────────┤
│ < Configuración / Parámetros del Sistema                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Parámetros del Sistema                                             │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ GPS y Seguimiento                                             │ │
│  │                                                               │ │
│  │  Frecuencia de actualización GPS                              │ │
│  │  [15] segundos  (Recomendado: 15-30s)                         │ │
│  │                                                               │ │
│  │  Radio de geofence para paradas                               │ │
│  │  [50] metros  (Recomendado: 50-100m)                          │ │
│  │                                                               │ │
│  │  [ ] Activar modo de ahorro de batería                        │ │
│  │      (Actualiza GPS solo cuando hay movimiento)               │ │
│  │                                                               │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Viajes y Rutas                                                │ │
│  │                                                                │ │
│  │  Tiempo de espera en paradas                                  │ │
│  │  [5] minutos por defecto                                      │ │
│  │                                                                │ │
│  │  Tolerancia de puntualidad                                    │ │
│  │  [10] minutos (viaje se marca como retrasado después)         │ │
│  │                                                                │ │
│  │  Tiempo máximo de espera por estudiante                       │ │
│  │  [3] minutos                                                  │ │
│  │                                                                │ │
│  │  [✓] Permitir inicio de viaje sin todos los estudiantes       │ │
│  │  [✓] Requerir confirmación de parada completada               │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Check-in y QR Codes                                           │ │
│  │                                                                │ │
│  │  Método de validación QR                                      │ │
│  │  (•) Escaneo de QR por conductor                              │ │
│  │  ( ) Check-in automático por GPS (geofence)                   │ │
│  │  ( ) Ambos métodos                                            │ │
│  │                                                                │ │
│  │  Duración de códigos QR temporales                            │ │
│  │  [24] horas (para eventos especiales)                         │ │
│  │                                                                │ │
│  │  [✓] Permitir check-in manual (sin QR) en emergencias         │ │
│  │  [✓] Requerir foto del estudiante al abordar                  │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Seguridad y Privacidad                                        │ │
│  │                                                                │ │
│  │  Tiempo de sesión inactiva                                    │ │
│  │  [30] minutos (logout automático)                             │ │
│  │                                                                │ │
│  │  Intentos de login fallidos permitidos                        │ │
│  │  [3] intentos antes de bloqueo temporal                       │ │
│  │                                                                │ │
│  │  Duración de bloqueo de cuenta                                │ │
│  │  [15] minutos                                                 │ │
│  │                                                                │ │
│  │  [✓] Requerir verificación en dos pasos (2FA)                 │ │
│  │  [✓] Registrar auditoría de todas las acciones                │ │
│  │  [✓] Encriptar datos sensibles en tránsito                    │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Mantenimiento y Respaldos                                     │ │
│  │                                                                │ │
│  │  Frecuencia de respaldo automático                            │ │
│  │  (•) Diario  ( ) Semanal  ( ) Manual                           │ │
│  │                                                                │ │
│  │  Hora de respaldo programado                                  │ │
│  │  [02:00] (madrugada, baja actividad)                          │ │
│  │                                                                │ │
│  │  Retención de datos históricos                                │ │
│  │  [12] meses antes de archivar                                 │ │
│  │                                                                │ │
│  │  [🗄️  Realizar Respaldo Manual Ahora]                         │ │
│  │  [📥 Descargar Último Respaldo]                               │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Integrations (APIs)                                           │ │
│  │                                                                │ │
│  │  Google Maps API                                              │ │
│  │  API Key: [**********************1234]  [Actualizar]          │ │
│  │  Estado: 🟢 Conectado                                         │ │
│  │                                                                │ │
│  │  SMS Gateway (Twilio)                                         │ │
│  │  Estado: 🟢 Conectado                                         │ │
│  │  Créditos restantes: 2,450 SMS                                │ │
│  │  [💳 Recargar Créditos]                                       │ │
│  │                                                                │ │
│  │  WhatsApp Business API                                        │ │
│  │  Estado: 🟢 Conectado                                         │ │
│  │  [⚙️  Configurar]                                             │ │
│  │                                                                │ │
│  │  Clerk (Authentication)                                       │ │
│  │  Estado: 🟢 Conectado                                         │ │
│  │                                                                │ │
│  │  Convex (Database)                                            │ │
│  │  Estado: 🟢 Conectado                                         │ │
│  │  Uso actual: 45% del plan                                     │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │ Información del Sistema                                       │ │
│  │                                                                │ │
│  │  Versión: 1.0.0                                               │ │
│  │  Última actualización: 05/01/2025                             │ │
│  │  Servidor: Producción (AWS us-east-1)                         │ │
│  │  Uptime: 99.8% (últimos 30 días)                              │ │
│  │  Usuarios activos: 1,245                                      │ │
│  │                                                                │ │
│  │  [📋 Ver Changelog]  [🔄 Buscar Actualizaciones]              │ │
│  │                                                                │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                                                      │
│                              [Cancelar] [Guardar Configuración]     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 9. Componentes Comunes

### 9.1 Header Global

```
┌─────────────────────────────────────────────────────────────────────┐
│ [🚌 Logo] Altaviapp        [Institución XYZ ▼]  [Admin Pérez ▼] [🔔]│
└─────────────────────────────────────────────────────────────────────┘
```

**Dropdown: Institución** (solo para super_admin)
```
┌──────────────────────────┐
│ Institución Actual:      │
│ ✓ Institución XYZ        │
├──────────────────────────┤
│ Cambiar a:               │
│ ○ Institución ABC        │
│ ○ Escuela Primaria 123   │
│ ○ Colegio Nacional DEF   │
└──────────────────────────┘
```

**Dropdown: Usuario**
```
┌──────────────────────────┐
│ 👤 Admin Pérez           │
│ admin@institucion.com    │
├──────────────────────────┤
│ ⚙️  Mi Perfil            │
│ 🔑 Cambiar Contraseña    │
│ 📊 Configuración         │
│ ❓ Ayuda                 │
│ 🚪 Cerrar Sesión         │
└──────────────────────────┘
```

**Notificaciones [🔔]**
```
┌──────────────────────────────────────┐
│ Notificaciones                  [✕] │
├──────────────────────────────────────┤
│ ⚠️  Conductor reportó retraso       │
│    Ruta Centro - Hace 5 min     [👁️] │
├──────────────────────────────────────┤
│ ℹ️  Mantenimiento programado        │
│    Bus ABC-1234 - Hace 1 hora   [👁️] │
├──────────────────────────────────────┤
│ ✅ Viaje completado                 │
│    Ruta Norte - Hace 2 horas    [👁️] │
├──────────────────────────────────────┤
│           [Ver todas →]              │
└──────────────────────────────────────┘
```

### 9.2 Navegación Lateral (Sidebar)

```
┌────────────────────────┐
│ 📊 Dashboard           │ ← Activo
│ 🚌 Gestión de Flota    │
│   ├─ Vehículos         │
│   └─ Conductores       │
│ 📍 Gestión de Rutas    │
│   ├─ Rutas             │
│   ├─ Paradas           │
│   └─ Asignaciones      │
│ 👨‍🎓 Gestión de Estudiantes│
│   ├─ Estudiantes       │
│   ├─ Códigos QR        │
│   └─ Padres/Tutores    │
│ 🗺️  Viajes en Tiempo Real│
│ 📋 Reportes            │
│ ⚠️  Incidentes         │
│ ⚙️  Configuración      │
└────────────────────────┘
```

### 9.3 Estados Visuales

**Estados de Viaje:**
- 🟢 **EN RUTA** (Verde) - Viaje activo en progreso
- 🟡 **RECOGIDA** (Amarillo) - Recogiendo estudiantes
- 🔵 **RETORNO** (Azul) - Dejando estudiantes
- ⚪ **COMPLETADO** (Gris) - Viaje finalizado
- 🔴 **RETRASADO** (Rojo) - Viaje con retraso
- ⚫ **CANCELADO** (Negro) - Viaje cancelado

**Estados de Vehículo:**
- 🟢 **En ruta** - Operativo en servicio
- 🟡 **Mantenimiento** - En mantenimiento programado
- ⚪ **Disponible** - Listo para asignar
- 🔴 **Fuera de servicio** - No operativo
- ⚫ **Inactivo** - Temporalmente inactivo

**Estados de Conductor:**
- 🟢 **En servicio** - Activo conduciendo
- ⚪ **Disponible** - Listo para asignar
- 🔴 **Licencia vencida** - Requiere actualización
- ⚫ **Inactivo** - Temporalmente inactivo

**Estados de Estudiante:**
- ✅ **A bordo** - En el vehículo
- 🏠 **En casa** - No ha abordado
- 🏫 **En escuela** - Entregado
- ⚠️ **Ausente** - No se presentó

### 9.4 Breadcrumbs

```
< Dashboard / Gestión de Flota / Vehículos / Editar ABC-1234
```

### 9.5 Tabla de Datos Estándar

**Características:**
- Paginación (Anterior/Siguiente)
- Búsqueda en tiempo real
- Filtros desplegables
- Acciones contextuales (menú [...])
- Ordenamiento por columnas (opcional)
- Selección múltiple (checkboxes) para acciones masivas

**Ejemplo de acciones masivas:**
```
[✓ 15 seleccionados]  [Asignar a ruta ▼]  [Exportar ▼]  [Eliminar]
```

### 9.6 Formularios

**Convenciones:**
- (*) = Campo obligatorio
- Validación en tiempo real
- Mensajes de error bajo cada campo
- Tooltips (?) para campos complejos
- Botones de acción al final: [Cancelar] [Guardar]
- Confirmación antes de eliminar

**Ejemplo de validación:**
```
Teléfono *
[+593 99 123 456_]
❌ Formato inválido. Use: +593XXXXXXXXX
```

### 9.7 Mensajes de Confirmación

```
┌─────────────────────────────────────────┐
│  ⚠️  Confirmar Eliminación          [✕] │
├─────────────────────────────────────────┤
│                                         │
│  ¿Está seguro de eliminar el vehículo   │
│  ABC-1234?                              │
│                                         │
│  Esta acción no se puede deshacer.      │
│                                         │
│           [Cancelar]  [Sí, Eliminar]    │
│                                         │
└─────────────────────────────────────────┘
```

### 9.8 Mensajes de Éxito/Error

**Éxito:**
```
┌─────────────────────────────────────────┐
│ ✅ Vehículo guardado exitosamente       │
└─────────────────────────────────────────┘
```

**Error:**
```
┌─────────────────────────────────────────┐
│ ❌ Error: El número de placa ya existe  │
└─────────────────────────────────────────┘
```

**Advertencia:**
```
┌─────────────────────────────────────────┐
│ ⚠️  Advertencia: El seguro vence pronto │
└─────────────────────────────────────────┘
```

### 9.9 Loading States

```
┌─────────────────────────────────────────┐
│                                         │
│         ⏳ Cargando datos...            │
│         [Barra de progreso]             │
│                                         │
└─────────────────────────────────────────┘
```

### 9.10 Empty States

```
┌─────────────────────────────────────────┐
│                                         │
│           📭                            │
│     No hay vehículos registrados        │
│                                         │
│     [+ Crear Primer Vehículo]           │
│                                         │
└─────────────────────────────────────────┘
```

---

## Notas de Diseño

### Paleta de Colores Sugerida
- **Primary**: Azul (#2563EB) - Botones principales, enlaces
- **Success**: Verde (#10B981) - Estados positivos, confirmaciones
- **Warning**: Amarillo (#F59E0B) - Advertencias, atención
- **Danger**: Rojo (#EF4444) - Errores, eliminaciones
- **Neutral**: Gris (#6B7280) - Texto secundario, bordes
- **Background**: Blanco (#FFFFFF) / Gris claro (#F9FAFB)

### Tipografía
- **Headings**: Sans-serif bold (18-24px)
- **Body**: Sans-serif regular (14-16px)
- **Small**: Sans-serif (12px) para metadatos

### Espaciado
- **Padding**: 12px, 16px, 24px
- **Margin**: 8px, 16px, 24px, 32px
- **Gap entre elementos**: 16px

### Responsividad
- **Desktop**: 1024px+ (wireframes mostrados)
- **Tablet**: 768px-1023px (sidebar colapsable, tablas con scroll horizontal)
- **Mobile**: < 768px (no aplicable para admin, solo PWA)

### Iconografía
- Usar iconos claros y universales
- Tamaño consistente (16px-24px)
- Acompañar con texto cuando sea posible

### Accesibilidad
- Contraste WCAG AA mínimo (4.5:1)
- Labels en todos los inputs
- Estados focus visibles
- Soporte de teclado para navegación

---

## Prioridades de Implementación

### Fase 1 (MVP):
1. Dashboard Overview (métricas básicas)
2. Fleet Management - Vehículos (CRUD completo)
3. Fleet Management - Conductores (CRUD completo)
4. Student Management - Estudiantes (CRUD completo)
5. Student Management - QR Codes (generación básica)

### Fase 2:
6. Route Management - Rutas (CRUD completo)
7. Route Management - Paradas (CRUD completo)
8. Route Management - Asignaciones (estudiantes a rutas)
9. Dashboard - Viajes en tiempo real (lista simple)

### Fase 3:
10. Dashboard - Viajes en tiempo real (mapa interactivo)
11. Notificaciones en tiempo real
12. Reportes y analytics

---

## Próximos Pasos para el Diseñador

1. **Revisar wireframes** y validar flujos de usuario
2. **Crear mockups de alta fidelidad** en Figma/Adobe XD
3. **Definir componentes reutilizables** (Design System)
4. **Diseñar estados interactivos** (hover, focus, disabled)
5. **Prototipar flujos clave** (crear vehículo, asignar ruta)
6. **Validar con stakeholders** antes de implementación

---

**Documento creado para**: Altaviapp Platform
**Versión**: 1.0
**Fecha**: Enero 2025
**Contacto**: [Equipo de Desarrollo Ceibatic]
