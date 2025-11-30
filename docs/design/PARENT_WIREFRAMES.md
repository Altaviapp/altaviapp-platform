# Parent Portal Wireframes
**Altaviapp - School Transport Management Platform**
**Versión**: 1.0
**Fecha**: Enero 2025
**Propósito**: Guía de wireframes para el portal de padres

---

## Índice
1. [Dashboard Principal](#1-dashboard-principal)
2. [Seguimiento en Vivo](#2-seguimiento-en-vivo)
3. [Historial de Viajes](#3-historial-de-viajes)
4. [Notificaciones](#4-notificaciones)
5. [Mi Hijo/a](#5-mi-hijoa)
6. [Contacto y Soporte](#6-contacto-y-soporte)
7. [Configuración](#7-configuración)
8. [Componentes Comunes](#8-componentes-comunes)

---

## 1. Dashboard Principal

### 1.1 Vista Principal del Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones 3] [👤]  │
├─────────────────────────────────────────────────────────────────────┤
│ Bienvenido/a, María Rodríguez               [Hoy: 05/01/2025]      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Mis Hijos                                                          │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👦 Carlos Rodríguez                    [Ver en mapa →]       │  │
│  │ 3er Grado - Sección A                                        │  │
│  │                                                               │  │
│  │ 🚌 Viaje de Ida                         🟢 EN RUTA           │  │
│  │ Ruta: Centro - Escuela A                                     │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │ Estado: Abordó a las 06:45                                   │  │
│  │ Llegada estimada: 07:15 (en 12 minutos)                      │  │
│  │                                                               │  │
│  │ ┌─────────────────────────────────────────────────────────┐ │  │
│  │ │ 📍 Última actualización: Hace 8 segundos                │ │  │
│  │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │ │  │
│  │ │ Paradas recorridas: 5/8                                 │ │  │
│  │ └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  │ [📍 Ver ruta completa] [📜 Ver historial]                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👧 Ana Rodríguez                       [Ver en mapa →]       │  │
│  │ 1er Grado - Sección B                                        │  │
│  │                                                               │  │
│  │ 🚌 Viaje de Ida                         ⚪ NO INICIADO        │  │
│  │ Ruta: Norte - Escuela B                                      │  │
│  │ Conductor: María González                                    │  │
│  │ Estado: Esperando recogida                                   │  │
│  │ Hora estimada de recogida: 07:30                             │  │
│  │                                                               │  │
│  │ ┌─────────────────────────────────────────────────────────┐ │  │
│  │ │ 📍 El vehículo aún no ha iniciado la ruta               │ │  │
│  │ │ Parada de recogida: Av. 6 de Diciembre y Naciones Unidas│ │  │
│  │ └─────────────────────────────────────────────────────────┘ │  │
│  │                                                               │  │
│  │ [📍 Ver ruta completa] [📜 Ver historial]                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Notificaciones Recientes                   [Ver todas →]          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✅ Carlos abordó el bus                    [Hace 18 min] 🟢      │
│  📍 El bus pasará por su parada en 5 min    [Hace 23 min]         │
│  ⚠️  Retraso de 10 min en la ruta           [Hace 35 min] 🟡      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│  Accesos Rápidos                                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  [📍 Seguimiento en Vivo]  [📜 Historial]  [💬 Contactar]         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Header con notificaciones y perfil de usuario
- Tarjetas por cada hijo con estado del viaje en tiempo real
- Indicadores visuales de estado (EN RUTA, NO INICIADO, COMPLETADO)
- Tiempo estimado de llegada (ETA) actualizado en tiempo real
- Barra de progreso de la ruta
- Notificaciones recientes
- Accesos rápidos a funciones principales

---

## 2. Seguimiento en Vivo

### 2.1 Mapa de Seguimiento en Tiempo Real

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Seguimiento en Vivo                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Carlos Rodríguez - Viaje de Ida                                   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                   ╔═══════════════════════════╗              │  │
│  │                   ║                           ║              │  │
│  │              🏫   ║    MAPA EN TIEMPO REAL    ║              │  │
│  │         Escuela A ║                           ║              │  │
│  │                   ║         🚌                ║              │  │
│  │           ●       ║         │                 ║              │  │
│  │           │       ║         │ ━━━━━━━━━━●    ║   📍         │  │
│  │           ●       ║         │          Parada ║   Mi hijo    │  │
│  │           │       ║         │          actual ║              │  │
│  │           ●       ║         ●                 ║              │  │
│  │           │       ║         │                 ║              │  │
│  │     Paradas       ║   ━━━━━━                 ║              │  │
│  │     recorridas    ║   Ruta completa          ║              │  │
│  │     (verde)       ║                           ║              │  │
│  │                   ╚═══════════════════════════╝              │  │
│  │                                                               │  │
│  │  [🔍 Zoom +] [🔍 Zoom -] [📍 Centrar en bus] [🔄 Actualizar]│  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Información del Viaje                                     │  │
│  │                                                               │  │
│  │  Estado: 🟢 EN RUTA                                           │  │
│  │  Actualizado: Hace 5 segundos                                │  │
│  │                                                               │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │  Progreso de la ruta: 5/8 paradas (62%)                      │  │
│  │                                                               │  │
│  │  ┌─────────────────────┬──────────────────────────────────┐ │  │
│  │  │ Abordó:             │ 06:45                            │ │  │
│  │  │ Llegada estimada:   │ 07:15 (en 12 minutos)           │ │  │
│  │  │ Distancia restante: │ 3.2 km                          │ │  │
│  │  │ Velocidad actual:   │ 25 km/h                         │ │  │
│  │  └─────────────────────┴──────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👨‍✈️ Conductor                                                │  │
│  │                                                               │  │
│  │  Nombre: Juan Pérez                                          │  │
│  │  Teléfono: +593 99 123 4567                                  │  │
│  │                                                               │  │
│  │  [📞 Llamar] [💬 Enviar WhatsApp]                           │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📍 Próximas Paradas                                          │  │
│  │                                                               │  │
│  │  1. Av. 12 de Octubre y Colón          Llegada: 07:05       │  │
│  │  2. Av. 6 de Diciembre y La Niña       Llegada: 07:10       │  │
│  │  3. 🏫 Escuela Altaviapp                Llegada: 07:15       │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [⬅ Volver al inicio]                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Mapa interactivo en tiempo real con Leaflet/OpenStreetMap
- Ubicación actual del bus (🚌)
- Ubicación del hijo (📍)
- Ruta completa con paradas
- Paradas completadas (verde) vs pendientes (gris)
- Actualización cada 15 segundos
- Barra de progreso visual
- Información del conductor con opciones de contacto
- ETA actualizado constantemente
- Controles de zoom y centrado

### 2.2 Vista de Seguimiento (Versión Móvil)

```
┌────────────────────────────────┐
│ [☰] Altaviapp         [🔔] [👤]│
├────────────────────────────────┤
│ < Seguimiento                  │
├────────────────────────────────┤
│                                │
│ Carlos Rodríguez               │
│ Viaje de Ida                   │
│                                │
│ ┌────────────────────────────┐ │
│ │                            │ │
│ │    ╔══════════════════╗    │ │
│ │    ║                  ║    │ │
│ │ 🏫 ║    MAPA          ║    │ │
│ │    ║                  ║    │ │
│ │    ║      🚌          ║    │ │
│ │    ║       │          ║    │ │
│ │    ║   ━━━━●━━━━━     ║ 📍 │ │
│ │    ║                  ║    │ │
│ │    ╚══════════════════╝    │ │
│ │                            │ │
│ │ [🔍+] [🔍-] [📍] [🔄]     │ │
│ └────────────────────────────┘ │
│                                │
│ 🟢 EN RUTA                     │
│ Actualizado: Hace 6 seg        │
│                                │
│ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│ 5/8 paradas (62%)              │
│                                │
│ ⏰ Llegada: 07:15 (12 min)     │
│ 📏 Distancia: 3.2 km           │
│ 🚗 Velocidad: 25 km/h          │
│                                │
│ 👨‍✈️ Juan Pérez                │
│ [📞] [💬]                      │
│                                │
│ 📍 Próximas paradas:           │
│ • Av. 12 de Octubre - 07:05   │
│ • Av. 6 de Diciembre - 07:10  │
│ • 🏫 Escuela - 07:15           │
│                                │
└────────────────────────────────┘
```

**Elementos Clave (Móvil):**
- Diseño compacto optimizado para móvil
- Menú hamburguesa para navegación
- Mapa responsivo
- Información crítica visible sin scroll
- Botones de acción rápida para contacto

---

## 3. Historial de Viajes

### 3.1 Listado de Viajes Pasados

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Historial de Viajes                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Historial de Viajes                                                │
│                                                                      │
│  Hijo: [Carlos Rodríguez ▼]         Período: [Última semana ▼]     │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📅 Hoy - 05/01/2025                                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje de Ida                         🟢 COMPLETADO        │  │
│  │ Ruta: Centro - Escuela A                                     │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │                                                               │  │
│  │ ⏱️  Abordó: 06:45      Bajó: 07:12                           │  │
│  │ 📏 Distancia: 8.5 km   Duración: 27 minutos                  │  │
│  │                                                               │  │
│  │ [📍 Ver ruta] [📊 Detalles]                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje de Vuelta                      🟡 EN CURSO          │  │
│  │ Ruta: Escuela A - Centro                                     │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │                                                               │  │
│  │ ⏱️  Abordó: 14:05      ETA: 14:35                            │  │
│  │ 📏 Progreso: 2/6 paradas                                     │  │
│  │                                                               │  │
│  │ [📍 Ver en mapa] [🔔 Activar notificaciones]                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📅 Ayer - 04/01/2025                                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje de Ida                         ✅ COMPLETADO        │  │
│  │ Ruta: Centro - Escuela A                                     │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │                                                               │  │
│  │ ⏱️  Abordó: 06:42      Bajó: 07:08                           │  │
│  │ 📏 Distancia: 8.5 km   Duración: 26 minutos                  │  │
│  │                                                               │  │
│  │ [📍 Ver ruta] [📊 Detalles]                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje de Vuelta                      ✅ COMPLETADO        │  │
│  │ Ruta: Escuela A - Centro                                     │  │
│  │ Conductor: Juan Pérez                                        │  │
│  │                                                               │  │
│  │ ⏱️  Abordó: 14:03      Bajó: 14:32                           │  │
│  │ 📏 Distancia: 8.2 km   Duración: 29 minutos                  │  │
│  │                                                               │  │
│  │ [📍 Ver ruta] [📊 Detalles]                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [Cargar más viajes...]                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Filtros por hijo y período de tiempo
- Agrupación por fecha
- Estado visual de cada viaje (completado, en curso, cancelado)
- Información resumida: horarios, duración, distancia
- Enlaces para ver detalles o ruta en el mapa
- Carga incremental (scroll infinito)

### 3.2 Detalle de Viaje Individual

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Historial / Detalle del Viaje                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Viaje del 05/01/2025 - Ida                                         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📊 Resumen del Viaje                                         │  │
│  │                                                               │  │
│  │  Estado: ✅ COMPLETADO                                        │  │
│  │  Estudiante: Carlos Rodríguez                                │  │
│  │  Ruta: Centro - Escuela A                                    │  │
│  │  Conductor: Juan Pérez                                       │  │
│  │  Vehículo: ABC-1234 (Toyota Coaster)                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⏱️  Tiempos                                                   │  │
│  │                                                               │  │
│  │  Inicio del viaje:     06:30                                 │  │
│  │  Abordó:               06:45                                 │  │
│  │  Llegada a escuela:    07:12                                 │  │
│  │  Fin del viaje:        07:18                                 │  │
│  │                                                               │  │
│  │  Duración total:       48 minutos                            │  │
│  │  Tiempo a bordo:       27 minutos                            │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📍 Recorrido de Paradas                                      │  │
│  │                                                               │  │
│  │  1. Inicio de Ruta               06:30 ✅                    │  │
│  │     Av. Amazonas y Naciones Unidas                           │  │
│  │                                                               │  │
│  │  2. Parada 1                     06:35 ✅                    │  │
│  │     Av. 10 de Agosto y Colón                                 │  │
│  │                                                               │  │
│  │  3. Parada 2 (Carlos abordó)     06:45 ✅                    │  │
│  │     Av. 12 de Octubre y Orellana                             │  │
│  │                                                               │  │
│  │  4. Parada 3                     06:52 ✅                    │  │
│  │     Av. 6 de Diciembre y Naciones Unidas                     │  │
│  │                                                               │  │
│  │  5. Parada 4                     06:58 ✅                    │  │
│  │     Av. 6 de Diciembre y La Niña                             │  │
│  │                                                               │  │
│  │  6. Parada 5                     07:05 ✅                    │  │
│  │     Av. Eloy Alfaro y De Los Shyris                          │  │
│  │                                                               │  │
│  │  7. Escuela Altaviapp (Llegada)  07:12 ✅                    │  │
│  │     Av. González Suárez 123                                  │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                               │  │
│  │                   ╔═══════════════════════════╗              │  │
│  │                   ║                           ║              │  │
│  │              🏫   ║    MAPA DE LA RUTA        ║              │  │
│  │         Escuela   ║                           ║              │  │
│  │                   ║         ●                 ║              │  │
│  │           ●       ║         │                 ║              │  │
│  │           │       ║         ●                 ║   📍         │  │
│  │           ●       ║         │                 ║   Abordó     │  │
│  │           │       ║         ●                 ║   aquí       │  │
│  │           ●       ║         │                 ║              │  │
│  │           │       ║         ●                 ║              │  │
│  │     Todas las     ║         │                 ║              │  │
│  │     paradas       ║         ●                 ║              │  │
│  │                   ║                           ║              │  │
│  │                   ╚═══════════════════════════╝              │  │
│  │                                                               │  │
│  │  [🔍 Zoom +] [🔍 Zoom -] [📍 Ver ruta completa]             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📊 Estadísticas                                              │  │
│  │                                                               │  │
│  │  Distancia total:      8.5 km                                │  │
│  │  Velocidad promedio:   18 km/h                               │  │
│  │  Estudiantes a bordo:  28/30                                 │  │
│  │  Paradas completadas:  7/7                                   │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [⬅ Volver al historial]                [📥 Descargar reporte]     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Información completa del viaje
- Línea de tiempo detallada de todas las paradas
- Destacado especial de la parada donde abordó el hijo
- Mapa con la ruta recorrida
- Estadísticas del viaje
- Opción de descargar reporte

---

## 4. Notificaciones

### 4.1 Centro de Notificaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Notificaciones                                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Notificaciones                             [⚙️ Configurar]         │
│                                                                      │
│  Filtros: [Todas] [No leídas] [Importantes]                        │
│  Hijo: [Todos ▼]                                                    │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📅 Hoy - 05/01/2025                                                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ✅ Check-in exitoso                     [Hace 15 min] 🟢     │  │
│  │ Carlos Rodríguez abordó el bus a las 06:45                   │  │
│  │ Ruta: Centro - Escuela A                                     │  │
│  │                                                               │  │
│  │ [📍 Ver en mapa] [✓ Marcar como leída]                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📍 Bus cerca de tu parada               [Hace 20 min] 🟡     │  │
│  │ El bus llegará a la parada de Carlos en 5 minutos           │  │
│  │ Hora estimada: 06:45                                         │  │
│  │                                                               │  │
│  │ [📍 Ver en mapa] [✓ Marcar como leída]                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Viaje iniciado                       [Hace 35 min]        │  │
│  │ El conductor Juan Pérez ha iniciado el viaje de ida          │  │
│  │ Ruta: Centro - Escuela A                                     │  │
│  │                                                               │  │
│  │ [📍 Ver en mapa] [✓ Marcar como leída]                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⚠️  Retraso en la ruta                   [Hace 1 hora] 🔴    │  │
│  │ La ruta Centro - Escuela A tiene un retraso de 10 minutos    │  │
│  │ debido a tráfico. Nueva hora estimada: 06:55                 │  │
│  │                                                               │  │
│  │ [📍 Ver en mapa] [✓ Marcar como leída]                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  📅 Ayer - 04/01/2025                                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ✅ Llegada exitosa                      [14:32]              │  │
│  │ Carlos llegó a casa. Check-out completado.                   │  │
│  │ Duración del viaje: 29 minutos                               │  │
│  │                                                               │  │
│  │ [📊 Ver detalles] [✓ Marcar como leída]                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ✅ Check-in exitoso                     [14:03]              │  │
│  │ Carlos abordó el bus a las 14:03                             │  │
│  │ Ruta: Escuela A - Centro                                     │  │
│  │                                                               │  │
│  │ [📊 Ver detalles] [✓ Marcar como leída]                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ✅ Llegada a la escuela                 [07:08]              │  │
│  │ Carlos llegó a Escuela Altaviapp. Check-out completado.      │  │
│  │ Duración del viaje: 26 minutos                               │  │
│  │                                                               │  │
│  │ [📊 Ver detalles] [✓ Marcar como leída]                      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [Cargar más notificaciones...]                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Tipos de Notificaciones:**

1. **Check-in/Check-out** (✅):
   - Cuando el hijo aborda el bus
   - Cuando el hijo baja del bus

2. **Proximidad** (📍):
   - Bus cerca de la parada (5 min antes)
   - Llegada inminente a destino

3. **Estado del viaje** (🚌):
   - Viaje iniciado
   - Viaje completado

4. **Alertas** (⚠️):
   - Retrasos
   - Cambios de ruta
   - Cambio de conductor
   - Cambio de vehículo

5. **Incidentes** (🚨):
   - Emergencias
   - Problemas de seguridad

### 4.2 Configuración de Notificaciones

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Notificaciones / Configuración                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Configuración de Notificaciones                                    │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📱 Canales de Notificación                                   │  │
│  │                                                               │  │
│  │  ☑ Notificaciones en la aplicación                           │  │
│  │  ☑ Notificaciones push (móvil)                               │  │
│  │  ☑ WhatsApp                                                  │  │
│  │     Número: +593 99 987 6543                 [Cambiar]       │  │
│  │  ☐ Email                                                     │  │
│  │     Email: maria@ejemplo.com                 [Cambiar]       │  │
│  │  ☐ SMS                                                       │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔔 Tipos de Notificaciones                                   │  │
│  │                                                               │  │
│  │  ☑ Check-in (cuando aborda el bus)                           │  │
│  │     Canales: [App] [WhatsApp] [Push]                         │  │
│  │                                                               │  │
│  │  ☑ Check-out (cuando baja del bus)                           │  │
│  │     Canales: [App] [WhatsApp] [Push]                         │  │
│  │                                                               │  │
│  │  ☑ Bus cerca de la parada (5 min antes)                      │  │
│  │     Canales: [App] [WhatsApp] [Push]                         │  │
│  │                                                               │  │
│  │  ☑ Retrasos en la ruta                                       │  │
│  │     Canales: [App] [WhatsApp] [Push]                         │  │
│  │                                                               │  │
│  │  ☑ Cambios en el viaje (conductor, vehículo)                │  │
│  │     Canales: [App] [Push]                                    │  │
│  │                                                               │  │
│  │  ☑ Alertas de incidentes (SIEMPRE ACTIVO)                   │  │
│  │     Canales: [App] [WhatsApp] [Push] [SMS]                   │  │
│  │                                                               │  │
│  │  ☐ Recordatorios diarios                                    │  │
│  │     Hora: [06:00]                                            │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👦 Configuración por Hijo                                    │  │
│  │                                                               │  │
│  │  Carlos Rodríguez                                            │  │
│  │  ☑ Notificaciones activas                                    │  │
│  │  ☑ Todas las notificaciones                                 │  │
│  │                                                               │  │
│  │  Ana Rodríguez                                               │  │
│  │  ☑ Notificaciones activas                                    │  │
│  │  ☑ Todas las notificaciones                                 │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⏰ Horarios de Silencio                                      │  │
│  │                                                               │  │
│  │  ☐ Activar modo silencioso                                  │  │
│  │     Desde: [__:__] Hasta: [__:__]                           │  │
│  │     (No se aplica a alertas de incidentes)                   │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [💾 Guardar cambios]                       [↶ Restablecer]        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Canales de notificación múltiples (App, WhatsApp, Email, SMS, Push)
- Control granular por tipo de notificación
- Configuración independiente por hijo
- Horarios de silencio (excepto emergencias)
- Alertas de incidentes siempre activas

---

## 5. Mi Hijo/a

### 5.1 Perfil del Estudiante

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Mi Hijo                                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Hijo: [Carlos Rodríguez ▼]  [Ana Rodríguez]                       │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👦 Carlos Rodríguez                                          │  │
│  │                                                               │  │
│  │  Información Personal                                        │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │  Grado: 3er Grado - Sección A                                │  │
│  │  Edad: 8 años                                                │  │
│  │  Fecha de nacimiento: 15/05/2017                             │  │
│  │  Institución: Escuela Altaviapp                              │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Información de Transporte                                 │  │
│  │                                                               │  │
│  │  Ruta Asignada: Centro - Escuela A                           │  │
│  │  Parada de Recogida: Av. 12 de Octubre y Orellana            │  │
│  │  Hora de recogida: 06:45                                     │  │
│  │  Parada de Regreso: Av. 12 de Octubre y Orellana             │  │
│  │  Hora de regreso: 14:05                                      │  │
│  │                                                               │  │
│  │  Conductor Regular: Juan Pérez                               │  │
│  │  Vehículo Regular: ABC-1234 (Toyota Coaster)                 │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📊 Estadísticas del Mes                                      │  │
│  │                                                               │  │
│  │  Viajes completados:    18/20                                │  │
│  │  Asistencia:            90%                                  │  │
│  │  Puntualidad promedio:  95%                                  │  │
│  │                                                               │  │
│  │  Tiempo promedio de viaje (ida):      27 min                 │  │
│  │  Tiempo promedio de viaje (vuelta):   29 min                 │  │
│  │                                                               │  │
│  │  [📊 Ver estadísticas completas]                             │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔐 Código QR del Estudiante                                  │  │
│  │                                                               │  │
│  │  Este código QR se usa para check-in/check-out               │  │
│  │                                                               │  │
│  │           ┌───────────────────┐                              │  │
│  │           │  ▄▄▄▄▄ ▄ ▄▄▄▄▄   │                              │  │
│  │           │  █   █ ▄ █   █   │                              │  │
│  │           │  █ ▄ █ ▄ █ ▄ █   │                              │  │
│  │           │  █▄▄▄█ ▄ █▄▄▄█   │                              │  │
│  │           │  ▄▄ ▄▄▄▄▄ ▄ ▄ ▄  │                              │  │
│  │           │   ▄█ █▄█ ▄█▄ ▄   │                              │  │
│  │           │  ▄▄▄▄▄ ▄ ▄  ▄▄   │                              │  │
│  │           │  █   █ ▄▄█▄▄ ▄   │                              │  │
│  │           │  █▄▄▄█ ▄ ▄█  ▄   │                              │  │
│  │           └───────────────────┘                              │  │
│  │                                                               │  │
│  │  [📥 Descargar QR] [🖨️  Imprimir] [📧 Enviar por email]      │  │
│  │                                                               │  │
│  │  💡 Tip: Guarde el QR en su teléfono o imprímalo para        │  │
│  │     que su hijo lo lleve en su mochila                       │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👥 Contactos de Emergencia                                   │  │
│  │                                                               │  │
│  │  1. María Rodríguez (Madre)                                  │  │
│  │     📞 +593 99 987 6543                                      │  │
│  │                                                               │  │
│  │  2. Pedro Rodríguez (Padre)                                  │  │
│  │     📞 +593 98 765 4321                                      │  │
│  │                                                               │  │
│  │  [✏️ Editar contactos]                                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Selector de hijos (si tiene más de uno)
- Información personal y académica
- Detalles de transporte (rutas, paradas, horarios)
- Estadísticas de uso del servicio
- Código QR único para check-in/check-out
- Contactos de emergencia

### 5.2 Estadísticas Detalladas

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Mi Hijo / Estadísticas                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Estadísticas de Carlos Rodríguez                                   │
│                                                                      │
│  Período: [Último mes ▼]  [01/12/2024 - 05/01/2025]                │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📊 Resumen General                                           │  │
│  │                                                               │  │
│  │  Viajes completados:        18/20      90%                   │  │
│  │  Viajes cancelados:         2          10%                   │  │
│  │  Total de días:             20 días escolares                │  │
│  │                                                               │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │  Viajes completados         ████████████████████░░           │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ⏱️  Puntualidad                                               │  │
│  │                                                               │  │
│  │  A tiempo:                  17 viajes  94%                   │  │
│  │  Tarde (1-5 min):           1 viaje    6%                    │  │
│  │  Muy tarde (>5 min):        0 viajes   0%                    │  │
│  │                                                               │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │  A tiempo                   ███████████████████░             │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │
│  │                                                               │  │
│  │  Promedio de retraso:       0.5 minutos                      │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Duración de Viajes                                        │  │
│  │                                                               │  │
│  │  Viajes de Ida:                                              │  │
│  │    Promedio:           27 minutos                            │  │
│  │    Más rápido:         23 minutos                            │  │
│  │    Más lento:          35 minutos                            │  │
│  │                                                               │  │
│  │  Viajes de Vuelta:                                           │  │
│  │    Promedio:           29 minutos                            │  │
│  │    Más rápido:         25 minutos                            │  │
│  │    Más lento:          38 minutos                            │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📅 Historial por Semana                                      │  │
│  │                                                               │  │
│  │  Semana del 30/12 - 03/01:                                   │  │
│  │    Lun  Mar  Mié  Jue  Vie                                   │  │
│  │    ✅  ✅  ✅  ✅  ✅   100% asistencia                       │  │
│  │                                                               │  │
│  │  Semana del 23/12 - 27/12:                                   │  │
│  │    Lun  Mar  Mié  Jue  Vie                                   │  │
│  │    ✅  ✅  ❌  ✅  ✅   80% asistencia                        │  │
│  │                                                               │  │
│  │  Semana del 16/12 - 20/12:                                   │  │
│  │    Lun  Mar  Mié  Jue  Vie                                   │  │
│  │    ✅  ✅  ✅  ❌  ✅   80% asistencia                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📍 Distancia Recorrida                                       │  │
│  │                                                               │  │
│  │  Total este mes:           306 km                            │  │
│  │  Promedio por viaje:       8.5 km                            │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [📥 Descargar reporte completo (PDF)]                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Resumen visual de viajes completados
- Métricas de puntualidad
- Estadísticas de duración de viajes
- Historial semanal con calendario
- Distancia total recorrida
- Opción de descargar reporte

---

## 6. Contacto y Soporte

### 6.1 Centro de Contacto

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Contacto                                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Contacto                                                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🚌 Contactar al Conductor                                    │  │
│  │                                                               │  │
│  │  Viaje activo de Carlos:                                     │  │
│  │                                                               │  │
│  │  👨‍✈️ Juan Pérez                                             │  │
│  │  Ruta: Centro - Escuela A                                    │  │
│  │  Vehículo: ABC-1234                                          │  │
│  │  Teléfono: +593 99 123 4567                                  │  │
│  │                                                               │  │
│  │  [📞 Llamar ahora] [💬 Enviar WhatsApp]                      │  │
│  │                                                               │  │
│  │  ⚠️  Nota: Use esta opción solo para situaciones urgentes    │  │
│  │     relacionadas con el viaje actual.                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🏫 Contactar a la Institución                                │  │
│  │                                                               │  │
│  │  Escuela Altaviapp                                           │  │
│  │  Departamento de Transporte                                  │  │
│  │                                                               │  │
│  │  📞 Teléfono: +593 2 234 5678                                │  │
│  │  📧 Email: transporte@altaviapp.edu.ec                       │  │
│  │  💬 WhatsApp: +593 99 876 5432                               │  │
│  │                                                               │  │
│  │  Horario de atención:                                        │  │
│  │  Lunes a Viernes: 07:00 - 17:00                              │  │
│  │                                                               │  │
│  │  [📞 Llamar] [📧 Enviar email] [💬 WhatsApp]                │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 💬 Enviar Mensaje                                            │  │
│  │                                                               │  │
│  │  Asunto: [Seleccione un tema ▼]                              │  │
│  │    ○ Consulta sobre el servicio                             │  │
│  │    ○ Reporte de problema                                    │  │
│  │    ○ Cambio de información                                  │  │
│  │    ○ Sugerencia                                             │  │
│  │    ○ Otro                                                   │  │
│  │                                                               │  │
│  │  Relacionado con: [Carlos Rodríguez ▼]                       │  │
│  │                                                               │  │
│  │  Mensaje:                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────┐│  │
│  │  │                                                          ││  │
│  │  │                                                          ││  │
│  │  │                                                          ││  │
│  │  │                                                          ││  │
│  │  │                                                          ││  │
│  │  └─────────────────────────────────────────────────────────┘│  │
│  │                                                               │  │
│  │  [📎 Adjuntar archivo]                                       │  │
│  │                                                               │  │
│  │  [📤 Enviar mensaje]                                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🆘 Soporte Técnico                                           │  │
│  │                                                               │  │
│  │  ¿Problemas con la aplicación?                               │  │
│  │                                                               │  │
│  │  📧 soporte@altaviapp.com                                    │  │
│  │  💬 Chat en vivo (disponible 08:00 - 18:00)                  │  │
│  │                                                               │  │
│  │  [💬 Iniciar chat] [📧 Enviar email]                         │  │
│  │                                                               │  │
│  │  ❓ Preguntas frecuentes                                     │  │
│  │  [📖 Ver FAQ]                                                │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Contacto directo con conductor (solo durante viajes activos)
- Información de contacto de la institución
- Formulario de mensajes con categorización
- Soporte técnico de la plataforma
- FAQ integrado

### 6.2 Preguntas Frecuentes (FAQ)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Contacto / Preguntas Frecuentes                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Preguntas Frecuentes                                               │
│                                                                      │
│  [Buscar en FAQ...]                                                 │
│                                                                      │
│  Categorías:                                                        │
│  [🚌 Seguimiento] [🔔 Notificaciones] [📱 App] [🔐 Seguridad]      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🚌 Seguimiento y Viajes                                            │
│                                                                      │
│  ▼ ¿Con qué frecuencia se actualiza la ubicación del bus?          │
│                                                                      │
│     La ubicación del bus se actualiza automáticamente cada 15       │
│     segundos mientras el viaje está activo. Puede ver la hora       │
│     exacta de la última actualización en la pantalla de seguimiento.│
│                                                                      │
│  ▼ ¿Qué significa cada estado del viaje?                           │
│                                                                      │
│     🟢 EN RUTA: El bus está en camino y su hijo está a bordo       │
│     🟡 RECOGIDA: El bus está recogiendo estudiantes                │
│     ⚪ NO INICIADO: El viaje aún no ha comenzado                   │
│     ✅ COMPLETADO: El viaje finalizó exitosamente                   │
│     🔴 CANCELADO: El viaje fue cancelado                           │
│                                                                      │
│  ▼ ¿Puedo ver viajes pasados?                                      │
│                                                                      │
│     Sí, puede ver todo el historial de viajes en la sección        │
│     "Historial". Allí encontrará detalles de cada viaje incluyendo  │
│     horarios, rutas y duración.                                     │
│                                                                      │
│  ▼ ¿Qué hago si el bus no aparece en el mapa?                      │
│                                                                      │
│     1. Verifique su conexión a internet                             │
│     2. Intente refrescar la página                                  │
│     3. Si el problema persiste, contacte a soporte técnico          │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔔 Notificaciones                                                  │
│                                                                      │
│  ▼ ¿Cómo activo las notificaciones de WhatsApp?                    │
│                                                                      │
│     1. Vaya a Configuración > Notificaciones                        │
│     2. Active "WhatsApp" en Canales de Notificación                 │
│     3. Confirme su número de teléfono                               │
│     4. Recibirá un mensaje de verificación                          │
│                                                                      │
│  ▼ ¿Por qué no recibo notificaciones?                              │
│                                                                      │
│     Verifique que:                                                  │
│     1. Las notificaciones estén activadas en Configuración          │
│     2. Su número de WhatsApp esté actualizado                       │
│     3. No esté en modo silencioso                                   │
│     4. Tenga conexión a internet                                    │
│                                                                      │
│  ▼ ¿Puedo desactivar notificaciones por la noche?                  │
│                                                                      │
│     Sí, puede configurar "Horarios de Silencio" en la sección de    │
│     notificaciones. Las alertas de emergencia siempre se enviarán.  │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  📱 Uso de la Aplicación                                            │
│                                                                      │
│  ▼ ¿La aplicación funciona sin internet?                           │
│                                                                      │
│     El portal de padres requiere conexión a internet para mostrar   │
│     información actualizada. Sin embargo, puede ver el historial    │
│     de viajes recientes que se guardan en caché.                    │
│                                                                      │
│  ▼ ¿Puedo usar la misma cuenta en varios dispositivos?             │
│                                                                      │
│     Sí, puede iniciar sesión desde cualquier dispositivo con sus    │
│     credenciales. La información se sincroniza automáticamente.     │
│                                                                      │
│  ▼ ¿Cómo cambio mi contraseña?                                     │
│                                                                      │
│     1. Vaya a Configuración > Seguridad                             │
│     2. Seleccione "Cambiar contraseña"                              │
│     3. Ingrese su contraseña actual y la nueva                      │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  🔐 Seguridad y Privacidad                                          │
│                                                                      │
│  ▼ ¿Es seguro el código QR de mi hijo?                             │
│                                                                      │
│     Sí, cada código QR es único y encriptado. Solo puede ser        │
│     escaneado por conductores autorizados en el sistema. Se genera  │
│     con tecnología de seguridad avanzada.                           │
│                                                                      │
│  ▼ ¿Quién puede ver la ubicación de mi hijo?                       │
│                                                                      │
│     Solo usted (como padre/tutor registrado), el conductor asignado,│
│     y los administradores de la institución pueden ver esta         │
│     información. Nadie más tiene acceso.                            │
│                                                                      │
│  ▼ ¿Mis datos están protegidos?                                    │
│                                                                      │
│     Sí, usamos encriptación de nivel bancario para proteger toda    │
│     la información. Cumplimos con las normas de protección de datos │
│     y privacidad vigentes en Ecuador.                               │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ❓ ¿No encontró su respuesta?                                      │
│                                                                      │
│  [💬 Contactar soporte]                                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Búsqueda de preguntas
- Categorías de FAQ expandibles
- Respuestas claras y concisas
- Enlaces a acciones relevantes
- Opción de contactar soporte si no encuentra respuesta

---

## 7. Configuración

### 7.1 Configuración General

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ < Inicio / Configuración                                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Configuración                                                      │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 👤 Información de Cuenta                                     │  │
│  │                                                               │  │
│  │  Nombre completo:                                            │  │
│  │  [María Rodríguez López                ]                     │  │
│  │                                                               │  │
│  │  Email:                                                      │  │
│  │  [maria.rodriguez@ejemplo.com          ]                     │  │
│  │                                                               │  │
│  │  Teléfono principal:                                         │  │
│  │  [+593 99 987 6543                     ]                     │  │
│  │                                                               │  │
│  │  Teléfono alternativo:                                       │  │
│  │  [+593 98 765 4321                     ]                     │  │
│  │                                                               │  │
│  │  [💾 Guardar cambios]                                        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔐 Seguridad                                                 │  │
│  │                                                               │  │
│  │  Cambiar contraseña:                                         │  │
│  │  [🔑 Actualizar contraseña]                                  │  │
│  │                                                               │  │
│  │  Autenticación de dos factores:                              │  │
│  │  ☑ Activar 2FA (recomendado)                                 │  │
│  │  [⚙️ Configurar 2FA]                                         │  │
│  │                                                               │  │
│  │  Sesiones activas:                                           │  │
│  │  • Navegador Chrome (Este dispositivo) - Ahora               │  │
│  │  • App móvil iOS - Hace 2 horas         [❌ Cerrar sesión]   │  │
│  │                                                               │  │
│  │  [🚪 Cerrar todas las sesiones]                              │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🌐 Preferencias                                              │  │
│  │                                                               │  │
│  │  Idioma:                                                     │  │
│  │  [Español (Ecuador) ▼]                                       │  │
│  │    • Español (Ecuador)                                       │  │
│  │    • English (United States)                                │  │
│  │                                                               │  │
│  │  Zona horaria:                                               │  │
│  │  [America/Guayaquil ▼]                                       │  │
│  │                                                               │  │
│  │  Formato de fecha:                                           │  │
│  │  ( ) MM/DD/YYYY                                              │  │
│  │  (•) DD/MM/YYYY                                              │  │
│  │                                                               │  │
│  │  Formato de hora:                                            │  │
│  │  ( ) 12 horas (AM/PM)                                        │  │
│  │  (•) 24 horas                                                │  │
│  │                                                               │  │
│  │  [💾 Guardar preferencias]                                   │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🔔 Notificaciones                                            │  │
│  │                                                               │  │
│  │  [⚙️ Configurar notificaciones]                              │  │
│  │  (Ver sección 4.2 - Configuración de Notificaciones)        │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🗺️  Mapas                                                    │  │
│  │                                                               │  │
│  │  Vista predeterminada del mapa:                              │  │
│  │  (•) Satélite                                                │  │
│  │  ( ) Calles                                                  │  │
│  │  ( ) Terreno                                                 │  │
│  │                                                               │  │
│  │  Zoom predeterminado:                                        │  │
│  │  [━━━━━━━━●━━━━━━━] (14)                                     │  │
│  │                                                               │  │
│  │  ☑ Centrar automáticamente en el bus                         │  │
│  │  ☑ Mostrar tráfico en tiempo real                            │  │
│  │                                                               │  │
│  │  [💾 Guardar configuración de mapas]                         │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 📱 Aplicación                                                │  │
│  │                                                               │  │
│  │  Versión: 1.0.0                                              │  │
│  │  Última actualización: 02/01/2025                            │  │
│  │                                                               │  │
│  │  [🔄 Buscar actualizaciones]                                 │  │
│  │                                                               │  │
│  │  ☑ Actualizar automáticamente                                │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ ℹ️  Información Legal                                        │  │
│  │                                                               │  │
│  │  [📄 Términos de servicio]                                   │  │
│  │  [🔒 Política de privacidad]                                 │  │
│  │  [📋 Política de cookies]                                    │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🆘 Ayuda y Soporte                                           │  │
│  │                                                               │  │
│  │  [❓ Preguntas frecuentes]                                   │  │
│  │  [💬 Contactar soporte]                                      │  │
│  │  [📖 Guía de uso]                                            │  │
│  │                                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  [🚪 Cerrar sesión]                                                 │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Información de cuenta editable
- Configuración de seguridad (contraseña, 2FA, sesiones)
- Preferencias de idioma y formato
- Configuración de notificaciones
- Personalización de mapas
- Información de la app
- Enlaces legales
- Ayuda y soporte
- Cerrar sesión

---

## 8. Componentes Comunes

### 8.1 Navegación Principal

#### Desktop/Tablet
```
┌─────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                           [Notificaciones] [👤]    │
├─────────────────────────────────────────────────────────────────────┤
│ Menú lateral (Siempre visible)                                      │
│ ┌──────────────────┐                                                │
│ │ 🏠 Inicio        │                                                │
│ │ 📍 Seguimiento   │                                                │
│ │ 📜 Historial     │                                                │
│ │ 🔔 Notificaciones│                                                │
│ │ 👦 Mis Hijos     │                                                │
│ │ 💬 Contacto      │                                                │
│ │ ⚙️  Configuración│                                                │
│ └──────────────────┘                                                │
└─────────────────────────────────────────────────────────────────────┘
```

#### Mobile
```
┌────────────────────────────────┐
│ [☰]  Altaviapp      [🔔]  [👤] │
├────────────────────────────────┤
│  Menú hamburguesa expandido:   │
│  ┌──────────────────────────┐  │
│  │ 🏠 Inicio                │  │
│  │ 📍 Seguimiento en Vivo   │  │
│  │ 📜 Historial de Viajes   │  │
│  │ 🔔 Notificaciones        │  │
│  │ 👦 Mis Hijos             │  │
│  │ 💬 Contacto              │  │
│  │ ⚙️  Configuración        │  │
│  │ ─────────────────────    │  │
│  │ 🚪 Cerrar sesión         │  │
│  └──────────────────────────┘  │
└────────────────────────────────┘
```

### 8.2 Estados de Viaje (Código de Colores)

```
Estados:
🟢 EN RUTA        - Verde  - El bus está en movimiento con el hijo a bordo
🟡 RECOGIDA       - Amarillo - El bus está recogiendo estudiantes
🟠 RETRASO        - Naranja - Hay un retraso en la ruta
⚪ NO INICIADO    - Blanco - El viaje aún no ha comenzado
✅ COMPLETADO     - Azul   - El viaje finalizó exitosamente
🔴 CANCELADO      - Rojo   - El viaje fue cancelado
🟣 INCIDENTE      - Morado - Hay un incidente activo
```

### 8.3 Iconografía Estándar

```
Navegación y Acciones:
🏠 - Inicio/Dashboard
📍 - Ubicación/Mapa/GPS
📜 - Historial
🔔 - Notificaciones
👤 - Perfil/Usuario
⚙️  - Configuración
🔍 - Buscar
📥 - Descargar
🔄 - Actualizar/Recargar
⬅ - Volver/Atrás
✏️ - Editar
🗑️  - Eliminar
💾 - Guardar

Transporte:
🚌 - Bus/Vehículo
👨‍✈️ - Conductor
🛣️  - Ruta
🏫 - Escuela/Institución

Comunicación:
💬 - Chat/Mensaje
📞 - Teléfono
📧 - Email
📱 - WhatsApp

Estudiantes:
👦 - Hijo (varón)
👧 - Hija (mujer)
👨‍🎓 - Estudiante genérico

Información:
ℹ️  - Información
❓ - Ayuda
⚠️  - Advertencia
🚨 - Emergencia/Incidente
✅ - Completado/Éxito
❌ - Error/Cancelado

Tiempo:
⏰ - Hora/Tiempo
📅 - Calendario/Fecha
⏱️  - Cronómetro/Duración

Estadísticas:
📊 - Gráficos/Estadísticas
📈 - Progreso
📏 - Distancia

Otros:
🔐 - Seguridad/QR
🔑 - Contraseña
🔒 - Privacidad
🆘 - Soporte/Emergencia
```

### 8.4 Paleta de Colores

```
Colores Principales:
- Azul primario:    #2196F3 (Botones principales, enlaces)
- Azul oscuro:      #1565C0 (Headers, navegación)
- Gris claro:       #F5F5F5 (Fondos)
- Blanco:           #FFFFFF (Tarjetas, contenido)
- Gris texto:       #424242 (Texto principal)
- Gris secundario:  #757575 (Texto secundario)

Colores de Estado:
- Verde:    #4CAF50 (Éxito, en ruta)
- Amarillo: #FFC107 (Advertencia, recogida)
- Naranja:  #FF9800 (Retraso)
- Rojo:     #F44336 (Error, cancelado, emergencia)
- Morado:   #9C27B0 (Incidentes)

Colores de Acento:
- Azul claro:  #BBDEFB (Fondos destacados)
- Verde claro: #C8E6C9 (Notificaciones positivas)
- Rojo claro:  #FFCDD2 (Notificaciones de alerta)
```

### 8.5 Tipografía

```
Desktop/Tablet:
- Títulos principales (H1): 24px, Bold
- Títulos sección (H2):     20px, Semibold
- Subtítulos (H3):          16px, Semibold
- Texto normal:             14px, Regular
- Texto pequeño:            12px, Regular

Mobile:
- Títulos principales (H1): 20px, Bold
- Títulos sección (H2):     18px, Semibold
- Subtítulos (H3):          14px, Semibold
- Texto normal:             14px, Regular
- Texto pequeño:            12px, Regular

Fuente: Roboto, Inter, o sistema (sans-serif)
```

### 8.6 Tarjetas de Información

```
┌──────────────────────────────────────────────────────────────┐
│ [Icono] Título de la Tarjeta                   [Acción]      │
│                                                               │
│ Línea de información 1: Valor 1                              │
│ Línea de información 2: Valor 2                              │
│ Línea de información 3: Valor 3                              │
│                                                               │
│ [Botón primario] [Botón secundario]                          │
└──────────────────────────────────────────────────────────────┘
```

### 8.7 Mensajes y Alertas

#### Éxito
```
┌──────────────────────────────────────────────────────────────┐
│ ✅ Mensaje de éxito                                          │
│ La acción se completó correctamente.                         │
│                                                [✕ Cerrar]    │
└──────────────────────────────────────────────────────────────┘
```

#### Advertencia
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️  Mensaje de advertencia                                   │
│ Revise la información antes de continuar.                    │
│                                                [✕ Cerrar]    │
└──────────────────────────────────────────────────────────────┘
```

#### Error
```
┌──────────────────────────────────────────────────────────────┐
│ ❌ Error                                                     │
│ Ocurrió un problema. Por favor, intente nuevamente.         │
│                                                [✕ Cerrar]    │
└──────────────────────────────────────────────────────────────┘
```

#### Información
```
┌──────────────────────────────────────────────────────────────┐
│ ℹ️  Información                                              │
│ Esta es información importante para tener en cuenta.         │
│                                                [✕ Cerrar]    │
└──────────────────────────────────────────────────────────────┘
```

### 8.8 Estados Vacíos (Empty States)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│                         📭                                    │
│                                                               │
│           No hay viajes en este período                      │
│                                                               │
│     No se encontraron viajes para el período seleccionado.   │
│     Intente seleccionar un rango de fechas diferente.        │
│                                                               │
│                  [Cambiar período]                            │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 8.9 Cargando (Loading States)

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│                         ⏳                                    │
│                                                               │
│                  Cargando información...                     │
│                                                               │
│                  ━━━━━━━━━━━━━━━━━━                         │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### 8.10 Modales de Confirmación

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  ⚠️  Confirmar Acción                                   │
│                                                         │
│  ¿Está seguro de que desea realizar esta acción?       │
│                                                         │
│  Esta acción no se puede deshacer.                     │
│                                                         │
│          [Cancelar]      [Confirmar]                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Notas de Implementación

### Responsividad

**Puntos de quiebre (breakpoints):**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Adaptaciones móviles:**
- Menú lateral → Menú hamburguesa
- Tablas → Tarjetas apilables
- Mapas → Vista optimizada para táctil
- Botones → Tamaño mínimo 44x44px (táctil)

### Accesibilidad

- Contraste mínimo WCAG AA (4.5:1 para texto)
- Navegación por teclado completa
- Etiquetas ARIA para lectores de pantalla
- Texto alternativo para iconos
- Tamaños de fuente ajustables

### Optimización de Rendimiento

- Carga lazy de imágenes
- Actualización incremental del mapa (solo diferencias)
- Caché de datos recientes
- Compresión de imágenes
- Minificación de assets

### Integración con Bubble.io

- Usar API Connector para endpoints de Convex
- Configurar workflows para actualización en tiempo real
- Implementar refresh automático cada 15 segundos para seguimiento
- Usar elementos de mapa de Bubble con Leaflet plugin
- Configurar privacy rules para seguridad de datos

---

## Próximos Pasos

1. **Diseño Visual**: Crear mockups de alta fidelidad en Figma
2. **Prototipo**: Desarrollar prototipo interactivo
3. **Testing**: Validar con padres de familia (5-10 usuarios)
4. **Implementación**: Desarrollar en Bubble.io siguiendo wireframes
5. **QA**: Testing de usabilidad y funcionalidad
6. **Lanzamiento**: Rollout gradual con usuarios piloto

---

**Fecha de creación**: Enero 2025
**Última actualización**: Enero 2025
**Versión**: 1.0
