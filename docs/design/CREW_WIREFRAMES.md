# Crew Mobile App Wireframes (PWA)
**Altaviapp - School Transport Management Platform**
**Versión**: 2.0
**Fecha**: Enero 2025
**Propósito**: Guía de wireframes para la app móvil de tripulación (Conductor y Auxiliar)

---

## Roles de la App

Esta aplicación es utilizada por dos roles de tripulación:

| Rol | Nombre UI | Descripción |
|-----|-----------|-------------|
| **driver** | Conductor | Operador del vehículo, controla el viaje |
| **monitor** | Auxiliar | Asistente de ruta, gestiona estudiantes |

### Leyenda de Acceso por Rol

A lo largo de este documento, las pantallas y funcionalidades se marcan con:

- 🚗 **Solo Conductor** - Funcionalidad exclusiva del conductor
- 👥 **Solo Auxiliar** - Funcionalidad exclusiva del auxiliar
- 🚗👥 **Ambos Roles** - Funcionalidad compartida
- 🔄 **Fallback** - El conductor puede usar esta función si no hay auxiliar asignado

---

## Índice
1. [Login y Autenticación](#1-login-y-autenticación) 🚗👥
2. [Dashboard de Tripulación](#2-dashboard-de-tripulación) 🚗👥
3. [Pre-Trip Checklist](#3-pre-trip-checklist) 🚗
4. [Viaje Activo](#4-viaje-activo) 🚗👥
5. [Check-in de Estudiantes](#5-check-in-de-estudiantes) 👥🔄
6. [Navegación y Ruta](#6-navegación-y-ruta) 🚗👥
7. [Reporte de Incidentes](#7-reporte-de-incidentes) 👥
8. [Historial de Viajes](#8-historial-de-viajes) 🚗👥
9. [Perfil y Configuración](#9-perfil-y-configuración) 🚗👥
10. [Modo Offline](#10-modo-offline) 🚗👥
11. [Componentes Comunes](#11-componentes-comunes) 🚗👥

---

## Características de la PWA

### Instalación
- Instalable en iOS y Android
- Ícono en pantalla de inicio
- Funciona como app nativa
- Actualizaciones automáticas

### Performance
- Carga en < 2 segundos
- Funciona offline
- GPS en background
- Sincronización automática

### Diseño
- Mobile-first (pantallas 360-414px)
- Modo retrato optimizado
- Botones grandes para uso con una mano
- Alto contraste para uso en exteriores

---

## 1. Login y Autenticación 🚗👥

### 1.1 Pantalla de Bienvenida (Primera vez)

```
┌────────────────────────────────┐
│                                │
│                                │
│          🚌                    │
│       Altaviapp                │
│      Crew App                  │
│                                │
│   Transporte Escolar Seguro    │
│                                │
│                                │
│                                │
│  ┌──────────────────────────┐ │
│  │  📱 Instalar en el       │ │
│  │     dispositivo          │ │
│  └──────────────────────────┘ │
│                                │
│  [Continuar sin instalar]      │
│                                │
│                                │
│        Versión 1.0.0           │
│                                │
└────────────────────────────────┘
```

### 1.2 Pantalla de Login

```
┌────────────────────────────────┐
│                                │
│        🚌 Altaviapp            │
│        Crew App                │
│                                │
├────────────────────────────────┤
│                                │
│  Iniciar Sesión                │
│                                │
│  Email o Usuario               │
│  ┌──────────────────────────┐ │
│  │ 📧                       │ │
│  └──────────────────────────┘ │
│                                │
│  Contraseña                    │
│  ┌──────────────────────────┐ │
│  │ 🔒                       │ │
│  └──────────────────────────┘ │
│                                │
│  ☐ Mantener sesión iniciada    │
│                                │
│  ┌──────────────────────────┐ │
│  │   INICIAR SESIÓN         │ │
│  └──────────────────────────┘ │
│                                │
│  [¿Olvidó su contraseña?]      │
│                                │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  🔐 Conexión segura            │
│  Certificado SSL activo        │
│                                │
└────────────────────────────────┘
```

### 1.3 Verificación de Permisos

```
┌────────────────────────────────┐
│                                │
│   Permisos Necesarios          │
│                                │
├────────────────────────────────┤
│                                │
│  Para usar la app, necesitamos │
│  los siguientes permisos:      │
│                                │
│  ✅ Ubicación (GPS)            │
│     Seguimiento en tiempo real │
│                                │
│  ✅ Cámara                     │
│     Escanear códigos QR        │
│                                │
│  ✅ Notificaciones             │
│     Alertas importantes        │
│                                │
│  ✅ Funcionamiento en segundo  │
│     plano (Background)         │
│     GPS continuo durante viaje │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ⚠️  Importante:               │
│  Estos permisos son necesarios │
│  para el correcto              │
│  funcionamiento de la app.     │
│                                │
│  ┌──────────────────────────┐ │
│  │  CONCEDER PERMISOS       │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

---

## 2. Dashboard de Tripulación 🚗👥

El dashboard se adapta según el rol del usuario autenticado.

### 2.1 Vista Principal - Conductor 🚗

```
┌────────────────────────────────┐
│ [☰] Dashboard        [🔔3] [👤]│
├────────────────────────────────┤
│                                │
│  Buenos días, Juan Pérez       │
│  Hoy: Viernes, 05/01/2025      │
│                                │
├────────────────────────────────┤
│                                │
│  🚌 Mi Vehículo                │
│  ┌──────────────────────────┐ │
│  │ Toyota Coaster           │ │
│  │ Placa: ABC-1234          │ │
│  │ Capacidad: 30 pasajeros  │ │
│  │                          │ │
│  │ Estado: 🟢 Disponible    │ │
│  │                          │ │
│  │ [🔧 Ver detalles]        │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📅 Viajes de Hoy              │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌅 VIAJE DE IDA          │ │
│  │ Centro - Escuela A       │ │
│  │                          │ │
│  │ ⏰ 06:30 - 07:30         │ │
│  │ 📍 8 paradas             │ │
│  │ 👨‍🎓 28/30 estudiantes    │ │
│  │                          │ │
│  │ Estado: ⏳ Programado    │ │
│  │                          │ │
│  │ ┌────────────────────┐   │ │
│  │ │  INICIAR VIAJE     │   │ │
│  │ └────────────────────┘   │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌇 VIAJE DE VUELTA       │ │
│  │ Escuela A - Centro       │ │
│  │                          │ │
│  │ ⏰ 14:00 - 15:00         │ │
│  │ 📍 6 paradas             │ │
│  │ 👨‍🎓 28/30 estudiantes    │ │
│  │                          │ │
│  │ Estado: ⏳ Programado    │ │
│  │                          │ │
│  │ [Ver detalles →]         │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📊 Resumen                    │
├────────────────────────────────┤
│                                │
│  Esta semana:                  │
│  • Viajes completados: 8       │
│  • Estudiantes transportados:  │
│    224                         │
│  • Puntualidad: 100%           │
│                                │
│  [📜 Ver historial completo]   │
│                                │
├────────────────────────────────┤
│  🔔 Notificaciones Recientes   │
├────────────────────────────────┤
│                                │
│  ℹ️  Nuevo estudiante añadido  │
│     a su ruta                  │
│     [Hace 2 horas]             │
│                                │
│  ⚠️  Mantenimiento programado  │
│     para el 10/01              │
│     [Hace 1 día]               │
│                                │
│  [Ver todas →]                 │
│                                │
└────────────────────────────────┘
```

**Elementos Clave (Conductor):**
- Saludo personalizado con fecha
- Información del vehículo asignado
- Lista de viajes del día
- Botón prominente para iniciar viaje (→ checklist)
- Resumen de desempeño
- Notificaciones importantes

### 2.2 Vista Principal - Auxiliar 👥

```
┌────────────────────────────────┐
│ [☰] Dashboard        [🔔3] [👤]│
├────────────────────────────────┤
│                                │
│  Buenos días, Ana Martínez     │
│  Hoy: Viernes, 05/01/2025      │
│                                │
├────────────────────────────────┤
│                                │
│  👥 Mi Rol                     │
│  ┌──────────────────────────┐ │
│  │ Auxiliar de Ruta         │ │
│  │                          │ │
│  │ 📍 Ruta: Centro-Escuela A│ │
│  │ 🚌 Vehículo: ABC-1234    │ │
│  │ 👨‍✈️ Conductor: Juan Pérez │ │
│  │                          │ │
│  │ Estado: 🟢 Activa        │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📅 Viajes de Hoy              │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌅 VIAJE DE IDA          │ │
│  │ Centro - Escuela A       │ │
│  │                          │ │
│  │ ⏰ 06:30 - 07:30         │ │
│  │ 📍 8 paradas             │ │
│  │ 👨‍🎓 28/30 estudiantes    │ │
│  │                          │ │
│  │ Estado: ⏳ Programado    │ │
│  │                          │ │
│  │ ┌────────────────────┐   │ │
│  │ │  VER VIAJE         │   │ │
│  │ └────────────────────┘   │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📊 Check-ins de Hoy           │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ Total: 0 check-ins       │ │
│  │                          │ │
│  │ Viaje AM: --             │ │
│  │ Viaje PM: --             │ │
│  │                          │ │
│  │ [📷 Escanear QR]         │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  🔔 Notificaciones Recientes   │
├────────────────────────────────┤
│                                │
│  ℹ️  Viaje asignado para hoy  │
│     [Hace 2 horas]             │
│                                │
│  ⚠️  Recordatorio: revisar    │
│     lista de estudiantes       │
│     [Hace 3 horas]             │
│                                │
│  [Ver todas →]                 │
│                                │
└────────────────────────────────┘
```

**Elementos Clave (Auxiliar):**
- Saludo personalizado con fecha
- Información de rol y ruta asignada
- Lista de viajes del día
- Botón para "Ver Viaje" (no iniciar - eso es del conductor)
- Resumen de check-ins realizados
- Acceso rápido a escáner QR
- Notificaciones importantes

### Diferencias entre Dashboard por Rol

| Elemento | Conductor | Auxiliar |
|----------|-----------|----------|
| Tarjeta principal | Vehículo asignado | Rol y ruta |
| Acción en viaje | "INICIAR VIAJE" → Checklist | "VER VIAJE" → Viaje activo |
| Estadísticas | Viajes completados, puntualidad | Check-ins realizados |
| Acceso rápido | -- | Botón "Escanear QR" |

---

## 3. Pre-Trip Checklist 🚗

> ⚠️ **Acceso**: Solo Conductor. Los auxiliares son redirigidos directamente al viaje activo.

### 3.1 Lista de Verificación del Vehículo

```
┌────────────────────────────────┐
│ [←] Pre-Trip Checklist    [❓] │
├────────────────────────────────┤
│                                │
│  Inspección del Vehículo       │
│  ABC-1234                      │
│                                │
│  ⚠️  Complete esta lista antes │
│     de iniciar el viaje        │
│                                │
├────────────────────────────────┤
│  🔧 Mecánica                   │
├────────────────────────────────┤
│                                │
│  ☐ Frenos                      │
│     Estado de los frenos       │
│                                │
│  ☐ Neumáticos                  │
│     Presión y estado           │
│                                │
│  ☐ Motor                       │
│     Nivel de aceite y agua     │
│                                │
│  ☐ Combustible                 │
│     Nivel suficiente           │
│                                │
│  ☐ Batería                     │
│     Carga adecuada             │
│                                │
├────────────────────────────────┤
│  💡 Luces y Señales            │
├────────────────────────────────┤
│                                │
│  ☐ Luces delanteras            │
│     Altas y bajas              │
│                                │
│  ☐ Luces traseras              │
│     Freno y reversa            │
│                                │
│  ☐ Direccionales               │
│     Ambos lados                │
│                                │
│  ☐ Luces de emergencia         │
│     Funcionando                │
│                                │
├────────────────────────────────┤
│  🔐 Seguridad                  │
├────────────────────────────────┤
│                                │
│  ☐ Cinturones de seguridad     │
│     Todos funcionando          │
│                                │
│  ☐ Puertas y ventanas          │
│     Cierran correctamente      │
│                                │
│  ☐ Espejos                     │
│     Limpios y ajustados        │
│                                │
│  ☐ Extintor                    │
│     Presente y cargado         │
│                                │
│  ☐ Botiquín de primeros        │
│     auxilios                   │
│     Completo y accesible       │
│                                │
│  ☐ Triángulos de seguridad     │
│     Presentes                  │
│                                │
├────────────────────────────────┤
│  🧹 Limpieza                   │
├────────────────────────────────┤
│                                │
│  ☐ Interior limpio             │
│     Asientos y pasillos        │
│                                │
│  ☐ Parabrisas limpio           │
│     Visibilidad clara          │
│                                │
├────────────────────────────────┤
│                                │
│  Progreso: 0/16 ━━━━━━━━━━    │
│                                │
│  📸 [Agregar foto del vehículo]│
│                                │
│  Observaciones (opcional):     │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  COMPLETAR INSPECCIÓN    │ │
│  │     (0/16 completos)     │ │
│  └──────────────────────────┘ │
│                                │
│  ⚠️  Debe completar todos los  │
│     items para continuar      │
│                                │
└────────────────────────────────┘
```

### 3.2 Checklist Completado

```
┌────────────────────────────────┐
│ [←] Pre-Trip Checklist    [✓]  │
├────────────────────────────────┤
│                                │
│  ✅ Inspección Completada      │
│                                │
│  Vehículo: ABC-1234            │
│  Fecha: 05/01/2025 06:15       │
│                                │
├────────────────────────────────┤
│                                │
│  ✅ Todos los sistemas OK      │
│                                │
│  🔧 Mecánica:        ✅ 5/5    │
│  💡 Luces:           ✅ 4/4    │
│  🔐 Seguridad:       ✅ 6/6    │
│  🧹 Limpieza:        ✅ 2/2    │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Total: 16/16 ✅              │
│                                │
│  Observaciones:                │
│  "Todo en orden"               │
│                                │
│  Foto del vehículo:            │
│  [Ver imagen →]                │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  El vehículo está listo para   │
│  iniciar el viaje.             │
│                                │
│  ┌──────────────────────────┐ │
│  │  CONTINUAR AL VIAJE      │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

### 3.3 Checklist con Problemas

```
┌────────────────────────────────┐
│ [←] Pre-Trip Checklist    [!]  │
├────────────────────────────────┤
│                                │
│  ⚠️  Problemas Detectados      │
│                                │
│  Vehículo: ABC-1234            │
│  Fecha: 05/01/2025 06:15       │
│                                │
├────────────────────────────────┤
│                                │
│  Items con problemas:          │
│                                │
│  ❌ Luces traseras             │
│     Luz de freno derecha no    │
│     funciona                   │
│                                │
│  ⚠️  Neumáticos                │
│     Presión baja en llanta     │
│     trasera izquierda          │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  Total: 14/16 ✅ | 2 ⚠️       │
│                                │
│  Observaciones:                │
│  ┌──────────────────────────┐ │
│  │ "Luz de freno rota,      │ │
│  │  requiere cambio de      │ │
│  │  foco. Llanta necesita   │ │
│  │  aire."                  │ │
│  └──────────────────────────┘ │
│                                │
│  📸 [Agregar foto del problema]│
│                                │
├────────────────────────────────┤
│  Acciones:                     │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🚨 REPORTAR PROBLEMA     │ │
│  │    Y CANCELAR VIAJE      │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🔧 PROBLEMA MENOR        │ │
│  │    CONTINUAR CON         │ │
│  │    PRECAUCIÓN            │ │
│  └──────────────────────────┘ │
│                                │
│  [Contactar mantenimiento]     │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Checklist categorizado (Mecánica, Luces, Seguridad, Limpieza)
- Checkboxes grandes y fáciles de marcar
- Barra de progreso visual
- Opción de agregar fotos
- Campo de observaciones
- Validación de completitud
- Flujo para reportar problemas

---

## 4. Viaje Activo 🚗👥

Ambos roles pueden ver el viaje activo, pero con diferentes controles disponibles.

### 4.1 Iniciar Viaje 🚗

> ⚠️ Solo el conductor puede iniciar el viaje (después del checklist).

```
┌────────────────────────────────┐
│ [←] Iniciar Viaje              │
├────────────────────────────────┤
│                                │
│  🌅 Viaje de Ida               │
│  Centro - Escuela A            │
│                                │
├────────────────────────────────┤
│  Información del Viaje         │
├────────────────────────────────┤
│                                │
│  🚌 Vehículo: ABC-1234         │
│  📍 Ruta: Centro - Escuela A   │
│  ⏰ Hora: 06:30 - 07:30        │
│  👨‍🎓 Estudiantes: 28           │
│  🛑 Paradas: 8                 │
│                                │
├────────────────────────────────┤
│  ✅ Pre-Trip Checklist         │
├────────────────────────────────┤
│                                │
│  ✅ Inspección completada      │
│  06:15 - Todos los sistemas OK │
│                                │
│  [Ver checklist]               │
│                                │
├────────────────────────────────┤
│  📋 Resumen                    │
├────────────────────────────────┤
│                                │
│  Estudiantes esperando:        │
│                                │
│  Parada 1: Av. 10 de Agosto    │
│  • Ana García                  │
│  • Luis Martínez               │
│  • ... y 3 más                 │
│                                │
│  [Ver lista completa →]        │
│                                │
├────────────────────────────────┤
│                                │
│  ⚠️  Importante:               │
│                                │
│  • GPS se activará             │
│    automáticamente             │
│  • Los padres recibirán        │
│    notificación               │
│  • No olvide realizar check-in │
│    de cada estudiante          │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ┌──────────────────────────┐ │
│  │   🚀 INICIAR VIAJE       │ │
│  └──────────────────────────┘ │
│                                │
│  [Cancelar]                    │
│                                │
└────────────────────────────────┘
```

### 4.2 Panel de Control del Viaje Activo - Conductor 🚗

```
┌────────────────────────────────┐
│ 🚌 VIAJE ACTIVO         [⋮]    │
├────────────────────────────────┤
│                                │
│  🟢 EN RUTA - Centro→Escuela A │
│                                │
│  Iniciado: 06:32               │
│  Tiempo transcurrido: 00:18    │
│                                │
├────────────────────────────────┤
│  📍 Próxima Parada             │
├────────────────────────────────┤
│                                │
│  Parada 3 de 8                 │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  📏 Distancia: 0.8 km          │
│  ⏱️  ETA: 3 minutos            │
│                                │
│  Estudiantes esperando: 4      │
│  • Carlos Rodríguez            │
│  • María López                 │
│  • ... y 2 más                 │
│                                │
│  ┌──────────────────────────┐ │
│  │  📍 NAVEGAR A PARADA     │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📊 Progreso del Viaje         │
├────────────────────────────────┤
│                                │
│  ━━━━━━━━━━━━━░░░░░░░░░      │
│  Paradas: 2/8 completadas      │
│                                │
│  👨‍🎓 Estudiantes a bordo: 8/28 │
│                                │
│  ━━━━━━━━━━━━━░░░░░░░░░      │
│                                │
├────────────────────────────────┤
│  Acciones Rápidas              │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │   📋 VER ESTUDIANTES     │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📍 GPS Activo                 │
├────────────────────────────────┤
│                                │
│  🟢 Transmitiendo ubicación    │
│  Última actualización: Ahora   │
│                                │
│  Velocidad: 25 km/h            │
│                                │
│  [Ver mapa →]                  │
│                                │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │   🛑 FINALIZAR VIAJE     │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Acciones disponibles para Conductor:**
- Ver estudiantes (solo lectura)
- Navegar a siguiente parada
- Ver mapa
- Finalizar viaje

### 4.3 Panel de Control del Viaje Activo - Auxiliar 👥

```
┌────────────────────────────────┐
│ 🚌 VIAJE ACTIVO         [⋮]    │
├────────────────────────────────┤
│                                │
│  🟢 EN RUTA - Centro→Escuela A │
│                                │
│  Iniciado: 06:32               │
│  Tiempo transcurrido: 00:18    │
│                                │
├────────────────────────────────┤
│  📍 Parada Actual              │
├────────────────────────────────┤
│                                │
│  Parada 3 de 8                 │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  Estudiantes esperando: 4      │
│  • Carlos Rodríguez            │
│  • María López                 │
│  • Pedro Gómez                 │
│  • Ana Fernández               │
│                                │
│  ┌──────────────────────────┐ │
│  │  📷 REGISTRAR ESTUDIANTE │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📊 Progreso del Viaje         │
├────────────────────────────────┤
│                                │
│  ━━━━━━━━━━━━━░░░░░░░░░      │
│  Paradas: 2/8 completadas      │
│                                │
│  👨‍🎓 Estudiantes a bordo: 8/28 │
│                                │
│  ━━━━━━━━━━━━━░░░░░░░░░      │
│                                │
├────────────────────────────────┤
│  Acciones Rápidas              │
├────────────────────────────────┤
│                                │
│  ┌────────┐ ┌────────┐        │
│  │   📷   │ │   📋   │        │
│  │ CHECK  │ │ LISTA  │        │
│  │   IN   │ │ESTUD.  │        │
│  └────────┘ └────────┘        │
│                                │
│  ┌────────┐ ┌────────┐        │
│  │   🚨   │ │   💬   │        │
│  │INCIDEN │ │ NOTIFY │        │
│  │   TE   │ │PADRES  │        │
│  └────────┘ └────────┘        │
│                                │
├────────────────────────────────┤
│  📍 Ubicación                  │
├────────────────────────────────┤
│                                │
│  🟢 Viaje en progreso          │
│  Conductor: Juan Pérez         │
│                                │
│  [Ver mapa →]                  │
│                                │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │   🚪 SALIR DEL VIAJE     │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Acciones disponibles para Auxiliar:**
- Registrar estudiantes (check-in/out)
- Ver lista de estudiantes
- Reportar incidentes
- Notificar a padres
- Ver mapa (solo lectura)

### Comparación de Acciones por Rol

| Acción | Conductor | Auxiliar |
|--------|:---------:|:--------:|
| Iniciar viaje | ✅ | ❌ |
| Finalizar viaje | ✅ | ❌ |
| Check-in/out estudiantes | 🔄 Fallback | ✅ |
| Ver lista estudiantes | ✅ (lectura) | ✅ |
| Reportar incidentes | ❌ | ✅ |
| Navegar a parada | ✅ | ❌ |
| Ver mapa | ✅ | ✅ |
| GPS tracking | ✅ (envía) | ✅ (ve) |

### 4.4 Vista de Mapa Durante el Viaje 🚗👥

**Menú [⋮] de opciones:**
```
┌──────────────────────┐
│ 🗺️  Ver mapa         │
│ 📋 Lista estudiantes │
│ 📍 Paradas restantes │
│ 🔔 Notificaciones    │
│ ⚙️  Configuración    │
│ ─────────────────    │
│ 🚨 Emergencia        │
└──────────────────────┘
```

### 4.3 Vista de Mapa Durante el Viaje

```
┌────────────────────────────────┐
│ [←] Mapa                  [⋮]  │
├────────────────────────────────┤
│                                │
│  ╔══════════════════════════╗ │
│  ║                          ║ │
│  ║    🏫 Escuela A          ║ │
│  ║         │                ║ │
│  ║         ●────●           ║ │
│  ║         │    Parada 6    ║ │
│  ║         ●                ║ │
│  ║         │                ║ │
│  ║     ●───┘                ║ │
│  ║     Parada 4             ║ │
│  ║     │                    ║ │
│  ║  📍 ● Parada 3 (próxima) ║ │
│  ║     │                    ║ │
│  ║   🚌 Mi ubicación        ║ │
│  ║     │                    ║ │
│  ║  ✅ ● Parada 2           ║ │
│  ║     │   (completada)     ║ │
│  ║  ✅ ● Parada 1           ║ │
│  ║     │   (completada)     ║ │
│  ║  ✅ ● Inicio             ║ │
│  ║                          ║ │
│  ╚══════════════════════════╝ │
│                                │
│  [🔍-] [📍] [🔍+]             │
│                                │
├────────────────────────────────┤
│                                │
│  📍 Próxima parada en 0.8 km   │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  ┌──────────────────────────┐ │
│  │  🧭 NAVEGACIÓN           │ │
│  └──────────────────────────┘ │
│                                │
│  🟢 GPS Activo - 25 km/h       │
│  Paradas: 2/8 | Estud: 8/28    │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Estado del viaje claramente visible
- Tiempo transcurrido
- Información de próxima parada
- ETA y distancia
- Progreso visual con barras
- Botones grandes para acciones frecuentes
- GPS en tiempo real
- Botón prominente para finalizar viaje

---

## 5. Check-in de Estudiantes 👥🔄

> **Acceso Principal**: Auxiliar (Monitor)
> **Fallback**: El conductor puede realizar check-ins si no hay auxiliar asignado al viaje.

Esta sección es el flujo principal de trabajo del Auxiliar.

### 5.1 Lista de Estudiantes de la Parada

```
┌────────────────────────────────┐
│ [←] Parada 3              [?]  │
├────────────────────────────────┤
│                                │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  Estudiantes esperando: 4      │
│                                │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 👦 Carlos Rodríguez      │ │
│  │ 3er Grado - Sección A    │ │
│  │                          │ │
│  │ ⏰ Esperado: 06:45       │ │
│  │ 📞 +593 99 987 6543      │ │
│  │    (Contacto: Madre)     │ │
│  │                          │ │
│  │ ┌──────────┐ ┌─────────┐│ │
│  │ │ 📷 QR    │ │ ✓ MANUAL││ │
│  │ │  SCAN    │ │ CHECK-IN││ │
│  │ └──────────┘ └─────────┘│ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 👧 María López           │ │
│  │ 3er Grado - Sección B    │ │
│  │                          │ │
│  │ ⏰ Esperado: 06:45       │ │
│  │ 📞 +593 98 765 4321      │ │
│  │    (Contacto: Padre)     │ │
│  │                          │ │
│  │ ┌──────────┐ ┌─────────┐│ │
│  │ │ 📷 QR    │ │ ✓ MANUAL││ │
│  │ │  SCAN    │ │ CHECK-IN││ │
│  │ └──────────┘ └─────────┘│ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 👦 Pedro Gómez           │ │
│  │ 2do Grado - Sección A    │ │
│  │                          │ │
│  │ ⏰ Esperado: 06:45       │ │
│  │ 📞 +593 99 123 4567      │ │
│  │    (Contacto: Madre)     │ │
│  │                          │ │
│  │ ┌──────────┐ ┌─────────┐│ │
│  │ │ 📷 QR    │ │ ✓ MANUAL││ │
│  │ │  SCAN    │ │ CHECK-IN││ │
│  │ └──────────┘ └─────────┘│ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 👧 Ana Fernández         │ │
│  │ 1er Grado - Sección C    │ │
│  │                          │ │
│  │ ⏰ Esperado: 06:45       │ │
│  │ 📞 +593 99 888 7777      │ │
│  │    (Contacto: Abuela)    │ │
│  │                          │ │
│  │ ┌──────────┐ ┌─────────┐│ │
│  │ │ 📷 QR    │ │ ✓ MANUAL││ │
│  │ │  SCAN    │ │ CHECK-IN││ │
│  │ └──────────┘ └─────────┘│ │
│  └──────────────────────────┘ │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ⚠️  Estudiantes no abordados  │
│     marcarán ausencia          │
│                                │
│  ┌──────────────────────────┐ │
│  │  CONTINUAR A PRÓXIMA     │ │
│  │  PARADA (4 pendientes)   │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

### 5.2 Escáner de Código QR

```
┌────────────────────────────────┐
│ [×] Escanear QR                │
├────────────────────────────────┤
│                                │
│  Carlos Rodríguez              │
│  3er Grado - Sección A         │
│                                │
├────────────────────────────────┤
│                                │
│  ╔══════════════════════════╗ │
│  ║                          ║ │
│  ║   📷  CÁMARA ACTIVA      ║ │
│  ║                          ║ │
│  ║   ┌──────────────────┐   ║ │
│  ║   │                  │   ║ │
│  ║   │  ╔════════════╗  │   ║ │
│  ║   │  ║            ║  │   ║ │
│  ║   │  ║  QR CODE   ║  │   ║ │
│  ║   │  ║   FRAME    ║  │   ║ │
│  ║   │  ║            ║  │   ║ │
│  ║   │  ╚════════════╝  │   ║ │
│  ║   │                  │   ║ │
│  ║   └──────────────────┘   ║ │
│  ║                          ║ │
│  ║  Enfoque el código QR    ║ │
│  ║  en el recuadro          ║ │
│  ║                          ║ │
│  ╚══════════════════════════╝ │
│                                │
│  💡 Asegúrese de que haya      │
│     buena iluminación          │
│                                │
│  ┌──────────────────────────┐ │
│  │  💡 ACTIVAR FLASH        │ │
│  └──────────────────────────┘ │
│                                │
│  [Usar check-in manual]        │
│                                │
└────────────────────────────────┘
```

### 5.3 Check-in Exitoso

```
┌────────────────────────────────┐
│                                │
│          ✅                    │
│                                │
│     Check-in Exitoso           │
│                                │
│  👦 Carlos Rodríguez           │
│  3er Grado - Sección A         │
│                                │
│  ⏰ 06:47                       │
│  📍 Parada 3                   │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ✅ Padre notificado           │
│     WhatsApp enviado           │
│                                │
│  Estudiantes a bordo: 9/28     │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  [Siguiente estudiante]        │
│  [Ver todos los estudiantes]   │
│                                │
│  Cierre automático en 3s...    │
│                                │
└────────────────────────────────┘
```

### 5.4 Check-in Manual (Confirmación)

```
┌────────────────────────────────┐
│ [←] Check-in Manual            │
├────────────────────────────────┤
│                                │
│  Confirmar check-in manual     │
│                                │
│  👦 Carlos Rodríguez           │
│  3er Grado - Sección A         │
│                                │
├────────────────────────────────┤
│                                │
│  ⏰ Hora: 06:47                │
│  📍 Parada: Parada 3           │
│     Av. 12 de Octubre          │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ⚠️  Razón del check-in manual:│
│                                │
│  (•) QR code no disponible     │
│  ( ) QR code dañado            │
│  ( ) Problemas con cámara      │
│  ( ) Otro                      │
│                                │
│  Observaciones (opcional):     │
│  ┌──────────────────────────┐ │
│  │ Estudiante olvidó su     │ │
│  │ código QR                │ │
│  └──────────────────────────┘ │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ✅ Verificación de identidad: │
│                                │
│  ☑ Estudiante identificado     │
│    correctamente              │
│  ☑ Confirmo que es Carlos     │
│    Rodríguez                  │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ┌──────────────────────────┐ │
│  │  ✓ CONFIRMAR CHECK-IN    │ │
│  └──────────────────────────┘ │
│                                │
│  [Cancelar]                    │
│                                │
└────────────────────────────────┘
```

### 5.5 Check-out (Bajada de Estudiante)

```
┌────────────────────────────────┐
│ [←] Check-out                  │
├────────────────────────────────┤
│                                │
│  🏫 Escuela Altaviapp          │
│  Parada Final                  │
│                                │
│  Estudiantes a bordo: 28       │
│                                │
├────────────────────────────────┤
│  Realizar check-out:           │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 👦 Carlos Rodríguez  ✅  │ │
│  │ Check-out: 07:12         │ │
│  │ [Deshacer]               │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 👧 María López      ✅   │ │
│  │ Check-out: 07:12         │ │
│  │ [Deshacer]               │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 👦 Pedro Gómez      ⏳   │ │
│  │ [📷 Scan] [✓ Manual]     │ │
│  └──────────────────────────┘ │
│                                │
│  ... 25 más pendientes         │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Progreso:                     │
│  ━━━━━░░░░░░░░░░░░░░░░        │
│  2/28 estudiantes bajados      │
│                                │
│  ┌──────────────────────────┐ │
│  │  📷 ESCANEO RÁPIDO       │ │
│  │  (Modo continuo)         │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  ✓ CHECK-OUT MASIVO      │ │
│  │  (Todos los estudiantes) │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Lista de estudiantes por parada
- Dos opciones de check-in: QR scan y manual
- Información de contacto de emergencia visible
- Scanner QR con indicadores visuales
- Confirmación inmediata con feedback visual
- Notificación automática a padres
- Razón requerida para check-in manual
- Check-out con opciones individual o masiva
- Contador de estudiantes a bordo

---

## 6. Navegación y Ruta 🚗👥

> **Navegación activa**: Solo Conductor
> **Ver mapa**: Ambos roles

### 6.1 Vista de Navegación Turn-by-Turn 🚗

```
┌────────────────────────────────┐
│ [×] Navegación            [⚙️] │
├────────────────────────────────┤
│                                │
│  ╔══════════════════════════╗ │
│  ║                          ║ │
│  ║         ⬆️               ║ │
│  ║         ║                ║ │
│  ║    ═════╝                ║ │
│  ║                          ║ │
│  ║    🚌 Su ubicación       ║ │
│  ║                          ║ │
│  ║    Av. 10 de Agosto      ║ │
│  ║                          ║ │
│  ║                          ║ │
│  ╚══════════════════════════╝ │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│        ⬆️  En 200m            │
│                                │
│  Gire a la DERECHA en          │
│  Av. 12 de Octubre             │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  📍 Destino: Parada 3          │
│  📏 Distancia: 0.8 km          │
│  ⏱️  ETA: 3 min                │
│                                │
├────────────────────────────────┤
│  Velocidad: 25 km/h            │
│  🟢 Límite: 40 km/h            │
├────────────────────────────────┤
│                                │
│  Próximas instrucciones:       │
│  1. ➡️  Derecha en 200m        │
│  2. ⬆️  Continuar 400m         │
│  3. ➡️  Derecha en Orellana    │
│                                │
│  ┌──────────────────────────┐ │
│  │  🔇 SILENCIAR VOZ        │ │
│  └──────────────────────────┘ │
│                                │
│  [Finalizar navegación]        │
│                                │
└────────────────────────────────┘
```

### 6.2 Lista de Paradas Restantes

```
┌────────────────────────────────┐
│ [←] Paradas Restantes          │
├────────────────────────────────┤
│                                │
│  Centro - Escuela A            │
│  Progreso: 2/8 paradas         │
│                                │
├────────────────────────────────┤
│                                │
│  ✅ Parada 1 - Completada      │
│  Av. 10 de Agosto y Colón      │
│  ⏰ 06:35 | 👨‍🎓 5 estudiantes   │
│                                │
├────────────────────────────────┤
│                                │
│  ✅ Parada 2 - Completada      │
│  Av. América y La Gasca        │
│  ⏰ 06:40 | 👨‍🎓 3 estudiantes   │
│                                │
├────────────────────────────────┤
│                                │
│  🔵 Parada 3 - ACTUAL          │
│  Av. 12 de Octubre y Orellana  │
│  ⏱️  ETA: 3 min                │
│  👨‍🎓 4 estudiantes esperando   │
│                                │
│  ┌──────────────────────────┐ │
│  │  📍 NAVEGAR              │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│                                │
│  ⚪ Parada 4 - Pendiente       │
│  Av. 6 de Diciembre            │
│  ⏱️  ETA: 8 min                │
│  👨‍🎓 6 estudiantes esperando   │
│                                │
├────────────────────────────────┤
│                                │
│  ⚪ Parada 5 - Pendiente       │
│  Av. 6 de Diciembre y La Niña  │
│  ⏱️  ETA: 12 min               │
│  👨‍🎓 5 estudiantes esperando   │
│                                │
├────────────────────────────────┤
│                                │
│  ⚪ Parada 6 - Pendiente       │
│  Av. Eloy Alfaro               │
│  ⏱️  ETA: 18 min               │
│  👨‍🎓 3 estudiantes esperando   │
│                                │
├────────────────────────────────┤
│                                │
│  ⚪ Parada 7 - Pendiente       │
│  Av. De Los Shyris             │
│  ⏱️  ETA: 22 min               │
│  👨‍🎓 2 estudiantes esperando   │
│                                │
├────────────────────────────────┤
│                                │
│  🏫 Escuela Altaviapp          │
│  Av. González Suárez 123       │
│  ⏱️  ETA: 28 min               │
│  Destino final                 │
│                                │
└────────────────────────────────┘
```

### 6.3 Alerta de Desvío de Ruta

```
┌────────────────────────────────┐
│                                │
│        ⚠️  ALERTA              │
│                                │
│  Desvío de Ruta Detectado      │
│                                │
├────────────────────────────────┤
│                                │
│  Se detectó que se ha          │
│  desviado de la ruta           │
│  programada.                   │
│                                │
│  Ubicación actual:             │
│  Av. Amazonas y Patria         │
│                                │
│  Ruta programada:              │
│  Av. 10 de Agosto              │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ¿Qué desea hacer?             │
│                                │
│  ┌──────────────────────────┐ │
│  │  🔄 RECALCULAR RUTA      │ │
│  │  (Regresar a ruta)       │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  ✓ DESVÍO INTENCIONAL    │ │
│  │  (Notificar admin)       │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  📝 REPORTAR PROBLEMA    │ │
│  │  (Tráfico/Emergencia)    │ │
│  └──────────────────────────┘ │
│                                │
│  ⚠️  Los administradores y     │
│     padres serán notificados   │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Navegación turn-by-turn con instrucciones visuales
- Indicación de distancia y tiempo
- Voz para instrucciones (silenciable)
- Lista de paradas con estado (completada, actual, pendiente)
- ETA para cada parada
- Número de estudiantes por parada
- Detección de desvío de ruta
- Opciones para manejar desvíos

---

## 7. Reporte de Incidentes 👥

> ⚠️ **Acceso**: Solo Auxiliar (Monitor). El auxiliar es responsable de documentar cualquier incidente durante el viaje.

El conductor debe enfocarse en la conducción segura. El auxiliar maneja la comunicación y documentación de incidentes.

### 7.1 Tipos de Incidentes

```
┌────────────────────────────────┐
│ [←] Reportar Incidente         │
├────────────────────────────────┤
│                                │
│  Seleccione el tipo de         │
│  incidente:                    │
│                                │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │  🚗 ACCIDENTE DE         │ │
│  │     TRÁNSITO             │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  🔧 PROBLEMA MECÁNICO    │ │
│  │     DEL VEHÍCULO         │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  ⚠️  RETRASO POR         │ │
│  │     TRÁFICO              │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  🚨 EMERGENCIA MÉDICA    │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  👨‍🎓 PROBLEMA CON        │ │
│  │     ESTUDIANTE           │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  🛣️  PROBLEMA EN         │ │
│  │     LA RUTA              │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  📝 OTRO                 │ │
│  │     (Especificar)        │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

### 7.2 Formulario de Incidente - Accidente

```
┌────────────────────────────────┐
│ [←] Reportar Accidente         │
├────────────────────────────────┤
│                                │
│  🚗 Accidente de Tránsito      │
│                                │
├────────────────────────────────┤
│  Gravedad del Accidente        │
├────────────────────────────────┤
│                                │
│  (•) 🔴 Grave                  │
│      (Requiere ambulancia)     │
│                                │
│  ( ) 🟡 Moderado               │
│      (Sin heridos graves)      │
│                                │
│  ( ) 🟢 Menor                  │
│      (Solo daños materiales)   │
│                                │
├────────────────────────────────┤
│  Información Básica            │
├────────────────────────────────┤
│                                │
│  ⏰ Hora: 06:52 (Automático)   │
│  📍 Ubicación:                 │
│     Av. 12 de Octubre y        │
│     Orellana (GPS)             │
│                                │
│  ☑ Llamar a emergencias (911)  │
│  ☑ Notificar a administradores │
│  ☑ Notificar a padres          │
│                                │
├────────────────────────────────┤
│  Detalles del Incidente        │
├────────────────────────────────┤
│                                │
│  ☐ Hay heridos                 │
│     Número de heridos: [__]    │
│                                │
│  ☐ Estudiantes involucrados    │
│     [Seleccionar estudiantes]  │
│                                │
│  ☐ Otro vehículo involucrado   │
│     Placa: [___________]       │
│                                │
│  Descripción del incidente:    │
│  ┌──────────────────────────┐ │
│  │                          │ │
│  │                          │ │
│  │                          │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  📸 Fotos:                     │
│  [Agregar foto 1]              │
│  [Agregar foto 2]              │
│  [Agregar foto 3]              │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ┌──────────────────────────┐ │
│  │  🚨 ENVIAR REPORTE       │ │
│  │     URGENTE              │ │
│  └──────────────────────────┘ │
│                                │
│  [Cancelar]                    │
│                                │
└────────────────────────────────┘
```

### 7.3 Incidente Enviado

```
┌────────────────────────────────┐
│                                │
│          ✅                    │
│                                │
│   Incidente Reportado          │
│                                │
├────────────────────────────────┤
│                                │
│  El incidente ha sido          │
│  reportado exitosamente.       │
│                                │
│  🚨 Accidente de Tránsito      │
│  Gravedad: 🔴 Grave            │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Notificaciones enviadas:      │
│                                │
│  ✅ Emergencias (911)          │
│  ✅ Administradores            │
│  ✅ Padres de familia          │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Número de reporte:            │
│  INC-20250105-001              │
│                                │
│  ⏰ 06:52                       │
│  📍 Av. 12 de Octubre          │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  🆘 Soporte en camino          │
│                                │
│  Un administrador lo           │
│  contactará en breve.          │
│                                │
│  📞 Para emergencias:          │
│     +593 2 234 5678            │
│                                │
│  ┌──────────────────────────┐ │
│  │  VER DETALLES DEL        │ │
│  │  INCIDENTE               │ │
│  └──────────────────────────┘ │
│                                │
│  [Volver al viaje]             │
│                                │
└────────────────────────────────┘
```

### 7.4 Reporte Rápido - Retraso

```
┌────────────────────────────────┐
│ [←] Reportar Retraso           │
├────────────────────────────────┤
│                                │
│  ⚠️  Retraso por Tráfico       │
│                                │
│  Tiempo estimado de retraso:   │
│                                │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ │
│  │ 5  │ │ 10 │ │ 15 │ │ 20 │ │
│  │MIN │ │MIN │ │MIN │ │MIN │ │
│  └────┘ └────┘ └────┘ └────┘ │
│                                │
│  ┌────┐ ┌─────────────────┐  │
│  │ 30 │ │ Otro: [__] min  │  │
│  │MIN │ │                 │  │
│  └────┘ └─────────────────┘  │
│                                │
│  Razón del retraso:            │
│                                │
│  ( ) Tráfico pesado            │
│  (•) Accidente en la vía       │
│  ( ) Construcción/Cierre vía   │
│  ( ) Condiciones climáticas    │
│  ( ) Otro                      │
│                                │
│  Comentarios (opcional):       │
│  ┌──────────────────────────┐ │
│  │ Accidente en Av. 12 de   │ │
│  │ Octubre, buscando ruta   │ │
│  │ alternativa              │ │
│  └──────────────────────────┘ │
│                                │
│  ☑ Notificar a padres          │
│  ☑ Notificar a administradores │
│                                │
│  ┌──────────────────────────┐ │
│  │  ENVIAR NOTIFICACIÓN     │ │
│  └──────────────────────────┘ │
│                                │
│  [Cancelar]                    │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Tipos de incidentes predefinidos
- Formularios específicos por tipo
- Nivel de gravedad seleccionable
- Ubicación y hora automática (GPS + reloj)
- Opción de agregar fotos
- Notificaciones automáticas según gravedad
- Número de referencia del incidente
- Reportes rápidos para situaciones comunes
- Campos obligatorios mínimos para agilidad

---

## 8. Historial de Viajes 🚗👥

Ambos roles pueden ver el historial de viajes en los que participaron.

### 8.1 Lista de Viajes Completados

```
┌────────────────────────────────┐
│ [☰] Historial        [🔍] [📅]│
├────────────────────────────────┤
│                                │
│  Filtros:                      │
│  [Última semana ▼] [Todos ▼]  │
│                                │
├────────────────────────────────┤
│  📅 Hoy - 05/01/2025           │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌅 Viaje de Ida          │ │
│  │ Centro - Escuela A       │ │
│  │                          │ │
│  │ ⏰ 06:32 - 07:18         │ │
│  │ ⏱️  Duración: 46 min     │ │
│  │ 📏 Distancia: 8.5 km     │ │
│  │ 👨‍🎓 Estudiantes: 28/30   │ │
│  │                          │ │
│  │ ✅ Completado sin        │ │
│  │    incidentes            │ │
│  │                          │ │
│  │ [Ver detalles →]         │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📅 Ayer - 04/01/2025          │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌇 Viaje de Vuelta       │ │
│  │ Escuela A - Centro       │ │
│  │                          │ │
│  │ ⏰ 14:05 - 14:58         │ │
│  │ ⏱️  Duración: 53 min     │ │
│  │ 📏 Distancia: 8.2 km     │ │
│  │ 👨‍🎓 Estudiantes: 28/28   │ │
│  │                          │ │
│  │ ✅ Completado sin        │ │
│  │    incidentes            │ │
│  │                          │ │
│  │ [Ver detalles →]         │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌅 Viaje de Ida          │ │
│  │ Centro - Escuela A       │ │
│  │                          │ │
│  │ ⏰ 06:28 - 07:22         │ │
│  │ ⏱️  Duración: 54 min     │ │
│  │ 📏 Distancia: 8.5 km     │ │
│  │ 👨‍🎓 Estudiantes: 30/30   │ │
│  │                          │ │
│  │ ⚠️  1 retraso reportado  │ │
│  │                          │ │
│  │ [Ver detalles →]         │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│  📅 03/01/2025                 │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌇 Viaje de Vuelta       │ │
│  │ Escuela A - Centro       │ │
│  │                          │ │
│  │ ⏰ 14:02 - 14:55         │ │
│  │ ⏱️  Duración: 53 min     │ │
│  │ 📏 Distancia: 8.3 km     │ │
│  │ 👨‍🎓 Estudiantes: 29/30   │ │
│  │                          │ │
│  │ ✅ Completado sin        │ │
│  │    incidentes            │ │
│  │                          │ │
│  │ [Ver detalles →]         │ │
│  └──────────────────────────┘ │
│                                │
│  [Cargar más viajes...]        │
│                                │
└────────────────────────────────┘
```

### 8.2 Detalle de Viaje

```
┌────────────────────────────────┐
│ [←] Detalle del Viaje          │
├────────────────────────────────┤
│                                │
│  🌅 Viaje de Ida               │
│  Centro - Escuela A            │
│  05/01/2025                    │
│                                │
├────────────────────────────────┤
│  📊 Resumen                    │
├────────────────────────────────┤
│                                │
│  Inicio:      06:32            │
│  Finalización: 07:18           │
│  Duración:    46 minutos       │
│  Distancia:   8.5 km           │
│                                │
│  Estudiantes: 28/30            │
│  Ausentes:    2                │
│                                │
│  Vehículo:    ABC-1234         │
│  Conductor:   Juan Pérez       │
│                                │
│  Estado: ✅ Completado         │
│                                │
├────────────────────────────────┤
│  📍 Ruta Recorrida             │
├────────────────────────────────┤
│                                │
│  ✅ Inicio                     │
│     06:32                      │
│     Av. Amazonas               │
│                                │
│  ✅ Parada 1                   │
│     06:37 (5 estudiantes)      │
│     Av. 10 de Agosto           │
│                                │
│  ✅ Parada 2                   │
│     06:42 (3 estudiantes)      │
│     Av. América                │
│                                │
│  ✅ Parada 3                   │
│     06:50 (4 estudiantes)      │
│     Av. 12 de Octubre          │
│                                │
│  ✅ Parada 4                   │
│     06:58 (6 estudiantes)      │
│     Av. 6 de Diciembre         │
│                                │
│  ✅ Parada 5                   │
│     07:04 (5 estudiantes)      │
│     Av. 6 de Diciembre         │
│                                │
│  ✅ Parada 6                   │
│     07:10 (3 estudiantes)      │
│     Av. Eloy Alfaro            │
│                                │
│  ✅ Parada 7                   │
│     07:14 (2 estudiantes)      │
│     Av. De Los Shyris          │
│                                │
│  🏫 Escuela Altaviapp          │
│     07:18 (Llegada)            │
│     28 check-outs realizados   │
│                                │
│  [📍 Ver mapa de la ruta]      │
│                                │
├────────────────────────────────┤
│  👨‍🎓 Estudiantes               │
├────────────────────────────────┤
│                                │
│  A bordo: 28                   │
│  Ausentes: 2                   │
│                                │
│  [Ver lista completa →]        │
│                                │
├────────────────────────────────┤
│  📝 Incidentes                 │
├────────────────────────────────┤
│                                │
│  ✅ Sin incidentes reportados  │
│                                │
├────────────────────────────────┤
│  📊 Estadísticas               │
├────────────────────────────────┤
│                                │
│  Velocidad promedio: 18 km/h   │
│  Check-ins manuales: 2         │
│  Puntualidad: A tiempo         │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  [📥 Descargar reporte]        │
│  [🔗 Compartir]                │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Lista cronológica de viajes
- Filtros por fecha y tipo
- Resumen visual de cada viaje
- Indicadores de estado e incidentes
- Detalles completos del viaje
- Ruta con timestamps
- Lista de estudiantes
- Estadísticas del viaje
- Opción de descargar reporte

---

## 9. Perfil y Configuración 🚗👥

El perfil muestra información específica según el rol del usuario.

### 9.1 Perfil del Conductor 🚗

```
┌────────────────────────────────┐
│ [☰] Mi Perfil        [✏️] [⚙️] │
├────────────────────────────────┤
│                                │
│        👨‍✈️                     │
│                                │
│     Juan Pérez                 │
│     Conductor                  │
│                                │
├────────────────────────────────┤
│  Información Personal          │
├────────────────────────────────┤
│                                │
│  📧 Email:                     │
│     juan.perez@altaviapp.ec    │
│                                │
│  📞 Teléfono:                  │
│     +593 99 123 4567           │
│                                │
│  🆔 Cédula:                    │
│     1234567890                 │
│                                │
│  🎂 Fecha de nacimiento:       │
│     15/03/1985                 │
│                                │
├────────────────────────────────┤
│  Información Profesional       │
├────────────────────────────────┤
│                                │
│  🚗 Licencia de conducir:      │
│     EC-1234567890              │
│     Tipo: Profesional (Tipo E) │
│     Vencimiento: 15/08/2026    │
│                                │
│  🏢 Institución:               │
│     Escuela Altaviapp          │
│                                │
│  📅 Antigüedad:                │
│     2 años, 3 meses            │
│                                │
├────────────────────────────────┤
│  Vehículo Asignado             │
├────────────────────────────────┤
│                                │
│  🚌 Toyota Coaster             │
│  Placa: ABC-1234               │
│  Capacidad: 30 pasajeros       │
│                                │
│  [Ver detalles del vehículo]   │
│                                │
├────────────────────────────────┤
│  Estadísticas                  │
├────────────────────────────────┤
│                                │
│  Viajes completados: 482       │
│  Estudiantes transportados:    │
│  12,850                        │
│  Puntualidad: 98%              │
│  Calificación: ⭐⭐⭐⭐⭐       │
│                                │
│  [Ver estadísticas completas]  │
│                                │
├────────────────────────────────┤
│  Documentos                    │
├────────────────────────────────┤
│                                │
│  📄 Licencia de conducir       │
│  📄 Certificado médico         │
│  📄 Antecedentes penales       │
│  📄 Curso de seguridad vial    │
│                                │
│  [Ver todos los documentos]    │
│                                │
└────────────────────────────────┘
```

### 9.2 Perfil del Auxiliar 👥

```
┌────────────────────────────────┐
│ [☰] Mi Perfil        [✏️] [⚙️] │
├────────────────────────────────┤
│                                │
│        👥                      │
│                                │
│     Ana Martínez               │
│     Auxiliar                   │
│                                │
├────────────────────────────────┤
│  Información Personal          │
├────────────────────────────────┤
│                                │
│  📧 Email:                     │
│     ana.martinez@altaviapp.ec  │
│                                │
│  📞 Teléfono:                  │
│     +593 99 876 5432           │
│                                │
│  🆔 Cédula:                    │
│     0987654321                 │
│                                │
│  🎂 Fecha de nacimiento:       │
│     22/08/1990                 │
│                                │
├────────────────────────────────┤
│  Información Profesional       │
├────────────────────────────────┤
│                                │
│  🏢 Institución:               │
│     Escuela Altaviapp          │
│                                │
│  📍 Ruta asignada:             │
│     Centro - Escuela A         │
│                                │
│  👨‍✈️ Conductor:                │
│     Juan Pérez                 │
│                                │
│  📅 Antigüedad:                │
│     1 año, 6 meses             │
│                                │
├────────────────────────────────┤
│  Certificaciones               │
├────────────────────────────────┤
│                                │
│  ✅ Primeros auxilios          │
│     Vencimiento: 15/06/2026    │
│                                │
│  ✅ Cuidado infantil           │
│     Certificado activo         │
│                                │
├────────────────────────────────┤
│  Estadísticas                  │
├────────────────────────────────┤
│                                │
│  Check-ins realizados: 3,240   │
│  Incidentes reportados: 12     │
│  Asistencia: 99%               │
│  Calificación: ⭐⭐⭐⭐⭐       │
│                                │
│  [Ver estadísticas completas]  │
│                                │
├────────────────────────────────┤
│  Contacto de Emergencia        │
├────────────────────────────────┤
│                                │
│  👤 María López (Madre)        │
│  📞 +593 99 111 2222           │
│                                │
│  [Editar contacto]             │
│                                │
└────────────────────────────────┘
```

### Diferencias en Perfil por Rol

| Sección | Conductor | Auxiliar |
|---------|-----------|----------|
| Licencia | ✅ Obligatoria | ❌ No aplica |
| Vehículo | ✅ Asignado | ❌ No asignado |
| Ruta | ❌ Via vehículo | ✅ Directa |
| Certificaciones | Seguridad vial | Primeros auxilios, cuidado infantil |
| Estadísticas | Viajes, puntualidad | Check-ins, incidentes |

### 9.3 Configuración de la App 🚗👥

```
┌────────────────────────────────┐
│ [←] Configuración              │
├────────────────────────────────┤
│                                │
│  ┌──────────────────────────┐ │
│  │ 🔔 Notificaciones        │ │
│  │                          │ │
│  │ ☑ Nuevos viajes asignados│ │
│  │ ☑ Cambios en la ruta     │ │
│  │ ☑ Mensajes de admin      │ │
│  │ ☑ Alertas de sistema     │ │
│  │                          │ │
│  │ Sonido:                  │ │
│  │ [Predeterminado ▼]       │ │
│  │                          │ │
│  │ ☑ Vibración              │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🗺️  Navegación           │ │
│  │                          │ │
│  │ Voz de navegación:       │ │
│  │ (•) Activada             │ │
│  │ ( ) Solo alertas         │ │
│  │ ( ) Silenciada           │ │
│  │                          │ │
│  │ Volumen:                 │ │
│  │ [━━━━━━━●━━━] 70%       │ │
│  │                          │ │
│  │ Vista de mapa:           │ │
│  │ (•) 3D                   │ │
│  │ ( ) 2D                   │ │
│  │                          │ │
│  │ ☑ Mostrar tráfico        │ │
│  │ ☑ Modo nocturno auto     │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📷 Escáner QR            │ │
│  │                          │ │
│  │ ☑ Sonido al escanear     │ │
│  │ ☑ Vibración al escanear  │ │
│  │ ☑ Flash automático       │ │
│  │                          │ │
│  │ Modo de escaneo:         │ │
│  │ (•) Continuo             │ │
│  │ ( ) Manual               │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📍 GPS y Ubicación       │ │
│  │                          │ │
│  │ Frecuencia de            │ │
│  │ actualización:           │ │
│  │ (•) Cada 15 segundos     │ │
│  │     (Recomendado)        │ │
│  │ ( ) Cada 30 segundos     │ │
│  │     (Ahorro de batería)  │ │
│  │                          │ │
│  │ ☑ GPS de alta precisión  │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🌐 General               │ │
│  │                          │ │
│  │ Idioma:                  │ │
│  │ [Español (Ecuador) ▼]    │ │
│  │                          │ │
│  │ Zona horaria:            │ │
│  │ [America/Guayaquil ▼]    │ │
│  │                          │ │
│  │ Formato de hora:         │ │
│  │ (•) 24 horas             │ │
│  │ ( ) 12 horas (AM/PM)     │ │
│  │                          │ │
│  │ ☑ Mantener pantalla      │ │
│  │   encendida durante viaje│ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 🔐 Seguridad             │ │
│  │                          │ │
│  │ [🔑 Cambiar contraseña]  │ │
│  │                          │ │
│  │ Cerrar sesión            │ │
│  │ automáticamente:         │ │
│  │ [Después de 8 horas ▼]   │ │
│  │                          │ │
│  │ ☑ Requerir PIN para      │ │
│  │   acciones sensibles     │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │ 📱 Sobre la App          │ │
│  │                          │ │
│  │ Versión: 1.0.0           │ │
│  │ Build: 2025.01.05        │ │
│  │                          │ │
│  │ [🔄 Buscar actualizaciones]│
│  │                          │ │
│  │ [📖 Guía de uso]         │ │
│  │ [❓ Ayuda]               │ │
│  │ [📋 Términos de servicio]│ │
│  │ [🔒 Privacidad]          │ │
│  │                          │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │  🚪 CERRAR SESIÓN        │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Información personal y profesional
- Detalles de licencia con fecha de vencimiento
- Vehículo asignado
- Estadísticas de desempeño
- Configuraciones de notificaciones
- Opciones de navegación y GPS
- Configuración del escáner QR
- Preferencias de idioma y formato
- Seguridad y privacidad

---

## 10. Modo Offline 🚗👥

El modo offline funciona igual para ambos roles, permitiendo continuar las operaciones sin conexión a internet.

### 10.1 Indicador de Estado Offline

```
┌────────────────────────────────┐
│ [☰] Dashboard         ⚠️ OFFLINE│
├────────────────────────────────┤
│                                │
│  ⚠️  Sin Conexión a Internet   │
│                                │
│  ┌──────────────────────────┐ │
│  │ La app está funcionando  │ │
│  │ en modo offline.         │ │
│  │                          │ │
│  │ Funciones disponibles:   │ │
│  │ ✅ Check-in/out (QR)     │ │
│  │ ✅ Lista de estudiantes  │ │
│  │ ✅ Ruta guardada         │ │
│  │ ✅ GPS tracking          │ │
│  │                          │ │
│  │ Funciones limitadas:     │ │
│  │ ⚠️  Navegación en tiempo │ │
│  │    real                  │ │
│  │ ⚠️  Notificaciones       │ │
│  │                          │ │
│  │ Los datos se             │ │
│  │ sincronizarán cuando     │ │
│  │ se restablezca la        │ │
│  │ conexión.                │ │
│  │                          │ │
│  │ [🔄 Reintentar conexión] │ │
│  └──────────────────────────┘ │
│                                │
├────────────────────────────────┤
│                                │
│  Buenos días, Juan Pérez       │
│  Hoy: Viernes, 05/01/2025      │
│                                │
│  ... (resto del dashboard)     │
│                                │
└────────────────────────────────┘
```

### 10.2 Check-in Offline

```
┌────────────────────────────────┐
│ [←] Check-in           ⚠️ OFFLINE│
├────────────────────────────────┤
│                                │
│          ✅                    │
│                                │
│  Check-in Guardado             │
│  (Pendiente de sincronizar)    │
│                                │
│  👦 Carlos Rodríguez           │
│  3er Grado - Sección A         │
│                                │
│  ⏰ 06:47                       │
│  📍 Parada 3                   │
│  Av. 12 de Octubre y Orellana  │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ⚠️  Modo Offline              │
│                                │
│  El check-in se ha guardado    │
│  localmente y se enviará al    │
│  servidor cuando se restablezca│
│  la conexión a internet.       │
│                                │
│  ⚠️  Los padres recibirán la   │
│     notificación una vez       │
│     sincronizado.              │
│                                │
│  Estudiantes a bordo: 9/28     │
│  (8 sincronizados, 1 pendiente)│
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  [Siguiente estudiante]        │
│                                │
│  Cierre automático en 3s...    │
│                                │
└────────────────────────────────┘
```

### 10.3 Cola de Sincronización

```
┌────────────────────────────────┐
│ [←] Sincronización    🔄 ACTIVA│
├────────────────────────────────┤
│                                │
│  🔄 Sincronizando Datos...     │
│                                │
│  ━━━━━━━━━━━━━░░░░░░░░       │
│  Progreso: 65%                 │
│                                │
├────────────────────────────────┤
│  Datos Pendientes:             │
├────────────────────────────────┤
│                                │
│  ✅ Check-ins: 12/15           │
│     3 pendientes               │
│                                │
│  ✅ Check-outs: 10/12          │
│     2 pendientes               │
│                                │
│  ✅ Ubicaciones GPS: 45/52     │
│     7 pendientes               │
│                                │
│  ⏳ Incidentes: 1/1            │
│     Sincronizando...           │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Último check-in sincronizado: │
│  👦 Carlos Rodríguez           │
│  Hace 2 segundos               │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ⚠️  No cierre la app mientras │
│     se sincronizan los datos   │
│                                │
│  Tiempo estimado: 15 segundos  │
│                                │
└────────────────────────────────┘
```

### 10.4 Sincronización Completada

```
┌────────────────────────────────┐
│                                │
│          ✅                    │
│                                │
│  Sincronización Completada     │
│                                │
├────────────────────────────────┤
│                                │
│  Todos los datos guardados     │
│  durante el modo offline han   │
│  sido sincronizados            │
│  exitosamente.                 │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Datos sincronizados:          │
│                                │
│  ✅ Check-ins: 15              │
│  ✅ Check-outs: 12             │
│  ✅ Ubicaciones GPS: 52        │
│  ✅ Incidentes: 1              │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ✅ Notificaciones enviadas    │
│     a los padres               │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Última sincronización:        │
│  05/01/2025 07:25              │
│                                │
│  ┌──────────────────────────┐ │
│  │  CONTINUAR               │ │
│  └──────────────────────────┘ │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Indicador claro de estado offline
- Banner persistente de modo offline
- Funciones disponibles claramente identificadas
- Check-ins guardados localmente
- GPS tracking continúa funcionando
- Cola de sincronización visible
- Progreso de sincronización en tiempo real
- Confirmación de sincronización exitosa
- No pérdida de datos durante offline

---

## 11. Componentes Comunes 🚗👥

### 11.1 Navegación Principal (Menú Hamburguesa)

El menú lateral se adapta según el rol del usuario.

#### Menú - Conductor 🚗

```
┌────────────────────────────────┐
│  MENÚ                     [×]  │
├────────────────────────────────┤
│                                │
│  👨‍✈️ Juan Pérez               │
│  Conductor                     │
│  juan.perez@altaviapp.ec       │
│                                │
├────────────────────────────────┤
│                                │
│  🏠 Dashboard                  │
│                                │
│  🚌 Viaje Activo               │
│                                │
│  📜 Historial                  │
│                                │
│  🔔 Notificaciones        [3]  │
│                                │
│  👤 Mi Perfil                  │
│                                │
│  ⚙️  Configuración             │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  📖 Guía de Uso                │
│                                │
│  ❓ Ayuda y Soporte            │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  🚪 Cerrar Sesión              │
│                                │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Versión 2.0.0                 │
│  🟢 En línea                   │
│                                │
└────────────────────────────────┘
```

#### Menú - Auxiliar 👥

```
┌────────────────────────────────┐
│  MENÚ                     [×]  │
├────────────────────────────────┤
│                                │
│  👥 Ana Martínez               │
│  Auxiliar                      │
│  ana.martinez@altaviapp.ec     │
│                                │
├────────────────────────────────┤
│                                │
│  🏠 Dashboard                  │
│                                │
│  🚌 Viaje Activo               │
│                                │
│  📷 Escanear QR                │
│                                │
│  🚨 Reportar Incidente         │
│                                │
│  📜 Historial                  │
│                                │
│  🔔 Notificaciones        [3]  │
│                                │
│  👤 Mi Perfil                  │
│                                │
│  ⚙️  Configuración             │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  📖 Guía de Uso                │
│                                │
│  ❓ Ayuda y Soporte            │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  🚪 Cerrar Sesión              │
│                                │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  Versión 2.0.0                 │
│  🟢 En línea                   │
│                                │
└────────────────────────────────┘
```

### Diferencias en Navegación por Rol

| Item de Menú | Conductor | Auxiliar |
|--------------|:---------:|:--------:|
| Dashboard | ✅ | ✅ |
| Viaje Activo | ✅ | ✅ |
| Escanear QR | ❌ | ✅ |
| Reportar Incidente | ❌ | ✅ |
| Historial | ✅ | ✅ |
| Notificaciones | ✅ | ✅ |
| Mi Perfil | ✅ | ✅ |
| Configuración | ✅ | ✅ |

### 11.2 Bottom Action Bar (Durante Viaje Activo)

La barra inferior muestra acciones diferentes según el rol.

#### Bottom Bar - Conductor 🚗
```
┌────────────────────────────────┐
│                                │
│  ... (Contenido principal)     │
│                                │
├────────────────────────────────┤
│  🚌 VIAJE ACTIVO               │
│  Parada 3/8 | 9/28 estudiantes │
├────────────────────────────────┤
│ [📍]   [📋]   [🗺️]        [⋮]  │
│ PARADA ESTUD. MAPA         MÁS │
└────────────────────────────────┘
```

#### Bottom Bar - Auxiliar 👥
```
┌────────────────────────────────┐
│                                │
│  ... (Contenido principal)     │
│                                │
├────────────────────────────────┤
│  🚌 VIAJE ACTIVO               │
│  Parada 3/8 | 9/28 estudiantes │
├────────────────────────────────┤
│ [📷]   [📋]   [🚨]   [💬]  [⋮] │
│CHECK  ESTUD. INCID. NOTIF. MÁS │
└────────────────────────────────┘
```

### 11.3 Iconografía y Símbolos

```
Estados de Viaje:
⏳ - No iniciado
🟢 - En ruta
🟡 - En pausa
🔴 - Cancelado
✅ - Completado

Acciones:
📷 - Escanear QR
✓  - Check-in manual
🗺️  - Mapa/Navegación
🚨 - Reporte de incidente
📞 - Llamar
💬 - Mensaje

Información:
👨‍🎓 - Estudiantes
📍 - Ubicación/Parada
⏰ - Hora programada
⏱️  - Duración
📏 - Distancia
🚌 - Vehículo
👨‍✈️ - Conductor
👥 - Auxiliar/Monitor

Alertas:
⚠️  - Advertencia
🔴 - Urgente/Grave
🟡 - Moderado
🟢 - Leve/OK
ℹ️  - Información

Navegación:
⬆️  - Adelante
⬇️  - Atrás
➡️  - Derecha
⬅️ - Izquierda
🔄 - U-turn

Roles (usado en este documento):
🚗 - Funcionalidad solo Conductor
👥 - Funcionalidad solo Auxiliar
🚗👥 - Funcionalidad compartida
🔄 - Fallback (Conductor si no hay Auxiliar)
```

### 11.4 Paleta de Colores (PWA)

```
Colores Principales:
- Azul primario:    #2196F3
- Azul oscuro:      #1565C0
- Verde éxito:      #4CAF50
- Rojo urgente:     #F44336
- Amarillo alerta:  #FFC107
- Naranja:          #FF9800

Colores de Estado:
- En ruta:          #4CAF50 (Verde)
- Programado:       #2196F3 (Azul)
- Completado:       #757575 (Gris)
- Cancelado:        #F44336 (Rojo)
- En pausa:         #FFC107 (Amarillo)

Colores de Fondo:
- Blanco:           #FFFFFF
- Gris claro:       #F5F5F5
- Gris medio:       #E0E0E0
- Texto:            #212121
- Texto secundario: #757575

Alto Contraste (Uso en exteriores):
- Fondo oscuro:     #212121
- Texto claro:      #FFFFFF
- Acentos brillantes para visibilidad
```

### 11.5 Botones y Controles

#### Botón Primario
```
┌──────────────────────────┐
│   ACCIÓN PRINCIPAL       │
└──────────────────────────┘
Tamaño mínimo: 48x48px (táctil)
Color: Azul #2196F3
Texto: Blanco, Bold, 16px
```

#### Botón Secundario
```
┌──────────────────────────┐
│   Acción Secundaria      │
└──────────────────────────┘
Tamaño mínimo: 48x48px
Color: Gris #757575
Texto: Blanco, Regular, 14px
```

#### Botón de Emergencia
```
┌──────────────────────────┐
│   🚨 EMERGENCIA          │
└──────────────────────────┘
Tamaño mínimo: 48x48px
Color: Rojo #F44336
Texto: Blanco, Bold, 16px
Siempre visible y accesible
```

#### Botones de Acción Rápida
```
┌────────┐
│  📷    │
│ CHECK  │
│  IN    │
└────────┘
Tamaño: 80x80px
Diseño: Ícono + texto
Uso: Acciones frecuentes
```

### 11.6 Mensajes del Sistema

#### Confirmación
```
┌────────────────────────────────┐
│          ✅                    │
│   Acción Completada            │
│                                │
│   El viaje ha sido iniciado    │
│   exitosamente.                │
│                                │
│   Cierre automático en 3s...   │
└────────────────────────────────┘
```

#### Error
```
┌────────────────────────────────┐
│          ❌                    │
│   Error                        │
│                                │
│   No se pudo completar el      │
│   check-in. Intente            │
│   nuevamente.                  │
│                                │
│   [Reintentar] [Cancelar]      │
└────────────────────────────────┘
```

#### Advertencia
```
┌────────────────────────────────┐
│          ⚠️                     │
│   Advertencia                  │
│                                │
│   Hay 3 estudiantes sin        │
│   check-in en esta parada.     │
│                                │
│   ¿Desea continuar?            │
│                                │
│   [Sí, continuar] [No, volver] │
└────────────────────────────────┘
```

### 11.7 Estados de Carga

#### Loading Spinner
```
┌────────────────────────────────┐
│                                │
│          ⏳                    │
│       Cargando...              │
│                                │
│     ━━━━━━━━━━━━━             │
│                                │
└────────────────────────────────┘
```

#### Skeleton Screen
```
┌────────────────────────────────┐
│ ▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓               │
│                                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓                      │
│                                │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓               │
│ ▓▓▓▓▓▓▓▓▓                      │
│                                │
└────────────────────────────────┘
```

### 11.8 Accesibilidad y Usabilidad

**Consideraciones para Conductores:**

1. **Uso con una mano**: Todos los controles principales accesibles en la mitad inferior de la pantalla

2. **Contraste alto**: Diseño visible bajo luz solar directa

3. **Botones grandes**: Mínimo 48x48px para uso con guantes

4. **Feedback táctil**: Vibración en acciones importantes

5. **Modo nocturno**: Cambio automático según hora del día

6. **Confirmaciones mínimas**: Flujo rápido para acciones frecuentes

7. **Voz**: Navegación y alertas por voz

8. **Pantalla siempre activa**: Durante viaje activo (opcional)

---

## Flujos de Usuario Principales

### Flujo 1: Iniciar Viaje
1. Dashboard → Ver viaje del día
2. Tap "INICIAR VIAJE"
3. Completar pre-trip checklist
4. Confirmar inicio
5. GPS se activa automáticamente
6. Navegar a primera parada

### Flujo 2: Check-in de Estudiante (QR)
1. Viaje activo → Tap "CHECK IN"
2. Lista de estudiantes de la parada
3. Tap "QR SCAN" en estudiante
4. Escanear código QR
5. Confirmación automática
6. Notificación enviada a padres

### Flujo 3: Check-in Manual
1. Viaje activo → Tap "CHECK IN"
2. Lista de estudiantes de la parada
3. Tap "MANUAL CHECK-IN" en estudiante
4. Seleccionar razón
5. Confirmar identidad
6. Confirmar check-in
7. Notificación enviada

### Flujo 4: Reportar Incidente
1. Tap botón "🚨" en cualquier momento
2. Seleccionar tipo de incidente
3. Completar formulario
4. Agregar fotos (opcional)
5. Enviar reporte
6. Notificaciones automáticas según gravedad

### Flujo 5: Finalizar Viaje
1. Completar todas las paradas
2. Realizar check-out de todos los estudiantes
3. Tap "FINALIZAR VIAJE"
4. Confirmar finalización
5. Ver resumen del viaje
6. GPS se desactiva

---

## Notas de Implementación

### PWA Específico

**Service Worker:**
- Cache de rutas y estudiantes
- Offline-first para check-ins
- Background sync para datos pendientes
- Push notifications

**Manifest:**
```json
{
  "name": "Altaviapp Driver",
  "short_name": "Driver",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#2196F3",
  "background_color": "#FFFFFF",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### APIs Requeridas

**Geolocation API:**
- `navigator.geolocation.watchPosition()`
- Alta precisión activada
- Actualización cada 15 segundos

**Camera API:**
- `navigator.mediaDevices.getUserMedia()`
- Para escáner QR

**Vibration API:**
- `navigator.vibrate()`
- Feedback táctil

**Wake Lock API:**
- `navigator.wakeLock.request()`
- Mantener pantalla activa durante viaje

**Background Sync API:**
- `navigator.serviceWorker.ready.sync.register()`
- Sincronizar datos offline

### Optimización de Performance

1. **Lazy Loading**: Cargar componentes bajo demanda
2. **Image Optimization**: Comprimir fotos antes de upload
3. **Local Storage**: Cache de datos frecuentes
4. **IndexedDB**: Almacenamiento de viajes offline
5. **Debouncing**: GPS updates optimizados

### Seguridad

1. **HTTPS obligatorio** para PWA
2. **Validación de tokens** en cada request
3. **Encriptación** de datos locales sensibles
4. **Permisos** verificados antes de usar APIs
5. **Auto-logout** después de inactividad

---

**Fecha de creación**: Enero 2025
**Última actualización**: Enero 2025
**Versión**: 1.0
**Plataforma**: PWA (iOS/Android)
