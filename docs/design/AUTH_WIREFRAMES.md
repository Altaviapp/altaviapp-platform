# Authentication Wireframes
**Altaviapp - School Transport Management Platform**
**Versión**: 1.0
**Fecha**: Enero 2025
**Propósito**: Guía de wireframes para flujos de autenticación

---

## Flujos de Autenticación

Esta plataforma tiene dos flujos principales de acceso:

| Flujo | Usuario | Descripción |
|-------|---------|-------------|
| **Nueva Cuenta** | Admin/Institución | Registro de nueva institución con suscripción |
| **Invitación** | Parent/Driver/Monitor | Acceso por código de invitación enviado por admin |

### Diagrama de Flujos

```
NUEVA CUENTA (Admin)                    INVITACIÓN (Parent/Driver/Monitor)
─────────────────                       ──────────────────────────────────

Landing Page                            Email con código de invitación
     │                                           │
     ▼                                           ▼
Selección de Plan                       Página de Código de Invitación
     │                                           │
     ▼                                           ▼
Formulario de Registro                  Configurar Contraseña
     │                                           │
     ▼                                           ▼
Verificación de Email                   Verificación de Email
     │                                           │
     └──────────────┬────────────────────────────┘
                    ▼
            DASHBOARD (por rol)
            ├── Admin → /admin/dashboard
            ├── Parent → /parent/dashboard
            └── Crew → /crew/dashboard
```

---

## Índice

1. [Landing Page](#1-landing-page)
2. [Selección de Plan](#2-selección-de-plan)
3. [Registro de Institución](#3-registro-de-institución)
4. [Login](#4-login)
5. [Código de Invitación](#5-código-de-invitación)
6. [Configurar Contraseña](#6-configurar-contraseña)
7. [Verificación de Email](#7-verificación-de-email)
8. [Reset de Contraseña](#8-reset-de-contraseña)
9. [Gestión de Invitaciones](#9-gestión-de-invitaciones-super-admin)
10. [Crear Invitación](#10-crear-invitación)

---

## 1. Landing Page

### 1.1 Vista Principal (Desktop)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    Características  Precios  [Iniciar Sesión]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│         Transporte Escolar                        ┌────────────────────┐    │
│         Seguro e Inteligente                      │                    │    │
│                                                    │   🚌 Ilustración   │    │
│         Plataforma integral para gestionar        │   de bus escolar   │    │
│         el transporte de estudiantes con          │   con tracking     │    │
│         seguimiento en tiempo real.               │                    │    │
│                                                    └────────────────────┘    │
│         ┌────────────────────┐  ┌────────────────────┐                      │
│         │  Comenzar Ahora    │  │  Ver Demo          │                      │
│         │  (primario)        │  │  (secundario)      │                      │
│         └────────────────────┘  └────────────────────┘                      │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         Características Principales                                          │
│                                                                              │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│
│  │ 📍 Seguimiento  │ │ 📱 Check-in QR  │ │ 🔔 Notificaciones│ │ 📊 Reportes ││
│  │ en Tiempo Real  │ │ de Estudiantes  │ │ Instantáneas    │ │ y Analítica ││
│  │                 │ │                 │ │                 │ │             ││
│  │ Ubicación GPS   │ │ Escaneo rápido  │ │ Alertas a       │ │ Métricas de ││
│  │ actualizada     │ │ y seguro para   │ │ padres cuando   │ │ rendimiento ││
│  │ cada 15 seg.    │ │ registrar       │ │ su hijo aborda  │ │ y viajes    ││
│  │                 │ │ estudiantes     │ │ o desciende     │ │             ││
│  └─────────────────┘ └─────────────────┘ └─────────────────┘ └─────────────┘│
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│         ¿Ya tienes una invitación?                                          │
│                                                                              │
│         ┌────────────────────────────────────────────────┐                  │
│         │  Tengo un código de invitación                 │                  │
│         └────────────────────────────────────────────────┘                  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  © 2025 Altaviapp - Ceibatic                    Privacidad  Términos        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Vista Mobile

```
┌────────────────────────────────┐
│ [Logo] Altaviapp          [☰] │
├────────────────────────────────┤
│                                │
│      🚌                        │
│                                │
│   Transporte Escolar           │
│   Seguro e Inteligente         │
│                                │
│   Plataforma integral para     │
│   gestionar el transporte      │
│   de estudiantes.              │
│                                │
│  ┌──────────────────────────┐ │
│  │     Comenzar Ahora       │ │
│  └──────────────────────────┘ │
│                                │
│  ┌──────────────────────────┐ │
│  │     Iniciar Sesión       │ │
│  └──────────────────────────┘ │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ¿Tienes código de invitación? │
│  [Ingresar código →]           │
│                                │
├────────────────────────────────┤
│  Características               │
├────────────────────────────────┤
│                                │
│  📍 Seguimiento en Tiempo Real │
│  Ubicación GPS cada 15 seg.    │
│                                │
│  📱 Check-in con QR            │
│  Escaneo rápido y seguro       │
│                                │
│  🔔 Notificaciones             │
│  Alertas instantáneas          │
│                                │
│  📊 Reportes                   │
│  Métricas de rendimiento       │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Hero con propuesta de valor clara
- CTAs prominentes: "Comenzar Ahora" y "Iniciar Sesión"
- Acceso rápido para usuarios con invitación
- Características principales visibles
- Responsive: Desktop y Mobile

---

## 2. Selección de Plan

### 2.1 Página de Planes de Suscripción

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                        [← Volver al inicio]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    Elige tu Plan                                             │
│            Comienza con 14 días de prueba gratis                             │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐   │
│  │                     │ │  ⭐ RECOMENDADO     │ │                     │   │
│  │       BÁSICO        │ │                     │ │     EMPRESARIAL     │   │
│  │                     │ │     PROFESIONAL     │ │                     │   │
│  │    $49/mes          │ │                     │ │    $199/mes         │   │
│  │                     │ │     $99/mes         │ │                     │   │
│  │  ─────────────────  │ │                     │ │  ─────────────────  │   │
│  │                     │ │  ─────────────────  │ │                     │   │
│  │  ✓ Hasta 5 vehículos│ │                     │ │  ✓ Vehículos        │   │
│  │  ✓ 100 estudiantes  │ │  ✓ Hasta 15        │ │    ilimitados       │   │
│  │  ✓ GPS en tiempo    │ │    vehículos       │ │  ✓ Estudiantes      │   │
│  │    real             │ │  ✓ 500 estudiantes │ │    ilimitados       │   │
│  │  ✓ Check-in QR      │ │  ✓ GPS en tiempo   │ │  ✓ Todo lo de       │   │
│  │  ✓ Notificaciones   │ │    real            │ │    Profesional      │   │
│  │    básicas          │ │  ✓ Check-in QR     │ │  ✓ API personalizada│   │
│  │  ✓ Soporte email    │ │  ✓ Notificaciones  │ │  ✓ Soporte 24/7     │   │
│  │                     │ │    avanzadas       │ │  ✓ Onboarding       │   │
│  │                     │ │  ✓ Reportes        │ │    dedicado         │   │
│  │                     │ │  ✓ Soporte chat    │ │  ✓ Multi-sede       │   │
│  │                     │ │                     │ │                     │   │
│  │  ┌───────────────┐  │ │  ┌───────────────┐  │ │  ┌───────────────┐  │   │
│  │  │   Elegir      │  │ │  │   Elegir      │  │ │  │  Contactar    │  │   │
│  │  └───────────────┘  │ │  └───────────────┘  │ │  │   Ventas      │  │   │
│  │                     │ │                     │ │  └───────────────┘  │   │
│  └─────────────────────┘ └─────────────────────┘ └─────────────────────┘   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Todos los planes incluyen:                                                  │
│  ✓ Prueba gratuita de 14 días   ✓ Sin tarjeta para empezar                  │
│  ✓ Cancelar en cualquier momento ✓ Soporte en español                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- 3 niveles de plan con diferenciación clara
- Plan recomendado destacado visualmente
- Lista de características por plan
- CTA claro en cada plan
- Prueba gratuita sin tarjeta
- Opción de contactar ventas para Empresarial

---

## 3. Registro de Institución

### 3.1 Formulario de Registro (Nueva Cuenta)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                    [← Volver a planes]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│              Crear tu Cuenta                                                 │
│              Plan seleccionado: Profesional - $99/mes                        │
│              14 días de prueba gratis                                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Paso 1 de 2: Información del Administrador                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Nombre *                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Juan                                                         │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Apellido *                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Pérez                                                        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Email *                                                             │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ juan.perez@escuela.edu.ec                                    │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Teléfono *                                                          │   │
│  │  ┌───────┐ ┌───────────────────────────────────────────────────┐    │   │
│  │  │ +593  │ │ 999123456                                          │    │   │
│  │  └───────┘ └───────────────────────────────────────────────────┘    │   │
│  │  Formato Ecuador: +593XXXXXXXXX                                      │   │
│  │                                                                       │   │
│  │  Contraseña *                                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │  Mínimo 8 caracteres, una mayúscula, un número                       │   │
│  │                                                                       │   │
│  │  Confirmar Contraseña *                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                              ┌───────────────────────────────────┐   │   │
│  │                              │       Continuar →                 │   │   │
│  │                              └───────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ¿Ya tienes cuenta? [Iniciar sesión]                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Paso 2: Información de la Institución

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                    [← Paso anterior]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│              Crear tu Cuenta                                                 │
│              Plan seleccionado: Profesional - $99/mes                        │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Paso 2 de 2: Información de la Institución                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Nombre de la Institución *                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Colegio San Francisco                                        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Tipo de Institución *                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Seleccionar...                                           ▼  │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │  • Escuela Primaria                                                  │   │
│  │  • Colegio Secundario                                                │   │
│  │  • Unidad Educativa (K-12)                                           │   │
│  │  • Universidad/Instituto                                             │   │
│  │  • Otro                                                              │   │
│  │                                                                       │   │
│  │  Dirección *                                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Av. 6 de Diciembre N23-45 y Colón                            │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Ciudad *                                                            │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Quito                                                        │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Teléfono de la Institución                                          │   │
│  │  ┌───────┐ ┌───────────────────────────────────────────────────┐    │   │
│  │  │ +593  │ │ 22345678                                           │    │   │
│  │  └───────┘ └───────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ☐ Acepto los Términos de Servicio y la Política de Privacidad      │   │
│  │                                                                       │   │
│  │                              ┌───────────────────────────────────┐   │   │
│  │                              │      Crear Cuenta                 │   │   │
│  │                              └───────────────────────────────────┘   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Formulario en 2 pasos
- Validación de teléfono Ecuador (+593)
- Selector de tipo de institución
- Aceptación de términos obligatoria
- Indicador de progreso claro

---

## 4. Login

### 4.1 Pantalla de Inicio de Sesión

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                        [← Volver al inicio]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         Iniciar Sesión                                       │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Email                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ 📧 tu@email.com                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Contraseña                                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ 🔒 ••••••••••••                                         [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ☐ Mantener sesión iniciada                                         │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │              INICIAR SESIÓN                                  │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                    [¿Olvidaste tu contraseña?]                       │   │
│  │                                                                       │   │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━    │   │
│  │                                                                       │   │
│  │  ¿No tienes cuenta?                                                  │   │
│  │  [Crear cuenta nueva]                                                │   │
│  │                                                                       │   │
│  │  ¿Tienes un código de invitación?                                    │   │
│  │  [Ingresar código]                                                   │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                    🔐 Conexión segura                                        │
│                    Certificado SSL activo                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Login Mobile

```
┌────────────────────────────────┐
│                                │
│        🚌 Altaviapp            │
│                                │
├────────────────────────────────┤
│                                │
│      Iniciar Sesión            │
│                                │
│  Email                         │
│  ┌──────────────────────────┐ │
│  │ 📧                       │ │
│  └──────────────────────────┘ │
│                                │
│  Contraseña                    │
│  ┌──────────────────────────┐ │
│  │ 🔒                   [👁]│ │
│  └──────────────────────────┘ │
│                                │
│  ☐ Mantener sesión iniciada    │
│                                │
│  ┌──────────────────────────┐ │
│  │   INICIAR SESIÓN         │ │
│  └──────────────────────────┘ │
│                                │
│  [¿Olvidaste tu contraseña?]   │
│                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│                                │
│  ¿Tienes código de invitación? │
│  [Ingresar código →]           │
│                                │
│  🔐 Conexión segura            │
│                                │
└────────────────────────────────┘
```

**Elementos Clave:**
- Campos email y contraseña
- Toggle para mostrar/ocultar contraseña
- Opción "Mantener sesión"
- Enlace a recuperar contraseña
- Acceso para usuarios con invitación
- Indicador de conexión segura

---

## 5. Código de Invitación

### 5.1 Ingresar Código de Invitación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                        [← Volver a login]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    Ingresa tu Código de Invitación                           │
│                                                                              │
│        Revisa tu email para encontrar el código de 8 caracteres              │
│        enviado por tu institución.                                           │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │               ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐       │   │
│  │               │ A │ │ B │ │ C │ │ 1 │ │ 2 │ │ 3 │ │ X │ │ Y │       │   │
│  │               └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘       │   │
│  │                                                                       │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Verificar Código              │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  │                                                                       │   │
│  │              ¿No recibiste el código?                                 │   │
│  │              Contacta a tu administrador                              │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Código Verificado - Información de Invitación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ✅ Código Verificado                                  │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Has sido invitado a:                                                │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  🏫 Colegio San Francisco                                    │    │   │
│  │  │  Rol: Padre/Madre de Familia                                 │    │   │
│  │  │  Email: maria.rodriguez@email.com                            │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Continúa para configurar tu contraseña y completar tu registro.    │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Continuar                     │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 5.3 Código Inválido/Expirado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                        [← Volver]          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        ❌ Código Inválido                                    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  El código que ingresaste no es válido o ha expirado.                │   │
│  │                                                                       │   │
│  │  Posibles razones:                                                    │   │
│  │  • El código tiene más de 7 días                                      │   │
│  │  • El código ya fue utilizado                                         │   │
│  │  • El código fue cancelado por el administrador                       │   │
│  │                                                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │  📧 Contacta a tu administrador para obtener un nuevo código│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Intentar con otro código      │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Input de 8 caracteres alfanuméricos
- Feedback visual de validación
- Muestra información de la invitación al verificar
- Manejo de errores claro
- Guía para obtener nuevo código

---

## 6. Configurar Contraseña

### 6.1 Formulario de Configuración de Contraseña (Post-Invitación)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    Configura tu Contraseña                                   │
│                                                                              │
│        Bienvenido/a, María Rodríguez                                         │
│        Crea una contraseña segura para tu cuenta.                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Tu email (no editable)                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ maria.rodriguez@email.com                                🔒 │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Nombre (opcional, puedes ajustarlo)                                 │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ María Rodríguez                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Teléfono * (WhatsApp para notificaciones)                           │   │
│  │  ┌───────┐ ┌───────────────────────────────────────────────────┐    │   │
│  │  │ +593  │ │ 999123456                                          │    │   │
│  │  └───────┘ └───────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Nueva Contraseña *                                                  │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Requisitos de contraseña:                                           │   │
│  │  ✅ Mínimo 8 caracteres                                              │   │
│  │  ✅ Al menos una mayúscula                                           │   │
│  │  ✅ Al menos un número                                               │   │
│  │  ⬜ Al menos un carácter especial                                    │   │
│  │                                                                       │   │
│  │  Confirmar Contraseña *                                              │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Crear Cuenta                  │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Email pre-llenado y no editable (de la invitación)
- Campo de teléfono para notificaciones WhatsApp
- Validación de contraseña en tiempo real
- Indicadores visuales de requisitos cumplidos
- Toggle para mostrar/ocultar contraseña

---

## 7. Verificación de Email

### 7.1 Pantalla de Verificación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         📧 Verifica tu Email                                 │
│                                                                              │
│        Hemos enviado un código de verificación a:                            │
│        juan.perez@escuela.edu.ec                                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Ingresa el código de 6 dígitos:                                     │   │
│  │                                                                       │   │
│  │            ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                       │   │
│  │            │ 1 │ │ 2 │ │ 3 │ │ 4 │ │ 5 │ │ 6 │                       │   │
│  │            └───┘ └───┘ └───┘ └───┘ └───┘ └───┘                       │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Verificar                     │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  │  ¿No recibiste el código?                                            │   │
│  │  [Reenviar código] (disponible en 2:45)                              │   │
│  │                                                                       │   │
│  │  [Cambiar email]                                                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  💡 Revisa también la carpeta de spam                                        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 Verificación Exitosa

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                            ✅                                                │
│                                                                              │
│                   ¡Email Verificado!                                         │
│                                                                              │
│        Tu cuenta ha sido creada exitosamente.                                │
│        Serás redirigido a tu dashboard en 3 segundos...                      │
│                                                                              │
│                   ┌─────────────────────────────────────┐                   │
│                   │       Ir al Dashboard               │                   │
│                   └─────────────────────────────────────┘                   │
│                                                                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Código de 6 dígitos numéricos
- Input dividido para mejor UX
- Timer para reenvío de código
- Opción de cambiar email
- Redirección automática al verificar

---

## 8. Reset de Contraseña

### 8.1 Solicitar Reset de Contraseña

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                        [← Volver a login]  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    Recuperar Contraseña                                      │
│                                                                              │
│        Ingresa tu email y te enviaremos un enlace para                       │
│        restablecer tu contraseña.                                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Email                                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ 📧 tu@email.com                                              │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Enviar Enlace                 │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ¿Recordaste tu contraseña? [Iniciar sesión]                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.2 Email Enviado

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                            📧                                                │
│                                                                              │
│                   Revisa tu Email                                            │
│                                                                              │
│        Hemos enviado instrucciones para restablecer tu                       │
│        contraseña a: juan.perez@escuela.edu.ec                               │
│                                                                              │
│        El enlace expira en 24 horas.                                         │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  ¿No recibiste el email?                                             │   │
│  │  • Revisa tu carpeta de spam                                         │   │
│  │  • Verifica que el email sea correcto                                │   │
│  │                                                                       │   │
│  │  [Reenviar email] (disponible en 1:00)                               │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                   [Volver a iniciar sesión]                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Nueva Contraseña

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                    Nueva Contraseña                                          │
│                                                                              │
│        Crea una nueva contraseña para tu cuenta.                             │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Nueva Contraseña                                                    │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Requisitos:                                                         │   │
│  │  ✅ Mínimo 8 caracteres                                              │   │
│  │  ✅ Al menos una mayúscula                                           │   │
│  │  ✅ Al menos un número                                               │   │
│  │                                                                       │   │
│  │  Confirmar Contraseña                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ ••••••••••••                                            [👁]│    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │                   ┌─────────────────────────────────────┐             │   │
│  │                   │       Cambiar Contraseña            │             │   │
│  │                   └─────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Flujo claro de 3 pasos
- Timer para reenvío de email
- Validación de contraseña en tiempo real
- Enlace expira en 24 horas (seguridad)

---

## 9. Gestión de Invitaciones (Super Admin)

### 9.1 Lista de Invitaciones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ [Logo] Altaviapp                    [Institución] ▼   [Admin] ▼ [🔔]        │
├─────────────────────────────────────────────────────────────────────────────┤
│ < Dashboard / Gestión de Usuarios / Invitaciones                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Invitaciones                                    [+ Nueva Invitación]       │
│                                                  [📥 Importar CSV]          │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔍 Buscar por email...                  Estado: [Todos ▼]           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Email                  │ Rol      │ Estado    │ Expira    │ Acciones│   │
│  ├────────────────────────┼──────────┼───────────┼───────────┼─────────│   │
│  │ maria@email.com        │ Padre    │ 🟡 Pend.  │ 5 días    │ [...]   │   │
│  │ juan@email.com         │ Conductor│ 🟢 Acept. │ -         │ [...]   │   │
│  │ carlos@email.com       │ Auxiliar │ 🟡 Pend.  │ 2 días    │ [...]   │   │
│  │ ana@email.com          │ Padre    │ 🔴 Expir. │ -         │ [...]   │   │
│  │ pedro@email.com        │ Admin    │ 🟡 Pend.  │ 6 días    │ [...]   │   │
│  │ lucia@email.com        │ Padre    │ ⚪ Cancel.│ -         │ [...]   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  Mostrando 1-6 de 24 invitaciones              [← Anterior] [Siguiente →]   │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Resumen:                                                                    │
│  🟡 Pendientes: 12  │  🟢 Aceptadas: 8  │  🔴 Expiradas: 3  │  ⚪ Cancel.: 1 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 Menú de Acciones

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ...                                                                        │
│  │ maria@email.com        │ Padre    │ 🟡 Pend.  │ 5 días    │ [...]   │   │
│  │                                                             ┌─────────┐ │
│  │                                                             │ 📧 Reen-│ │
│  │                                                             │   viar  │ │
│  │                                                             │─────────│ │
│  │                                                             │ 📋 Copiar│ │
│  │                                                             │   código│ │
│  │                                                             │─────────│ │
│  │                                                             │ ❌ Cance-│ │
│  │                                                             │   lar   │ │
│  │                                                             └─────────┘ │
│  ...                                                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Tabla con todas las invitaciones
- Filtros por estado
- Búsqueda por email
- Acciones: Reenviar, Copiar código, Cancelar
- Resumen de estadísticas
- Paginación

---

## 10. Crear Invitación

### 10.1 Modal de Nueva Invitación Individual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                  [✕ Cerrar] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         Nueva Invitación                                     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Email del invitado *                                                │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ usuario@email.com                                            │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Nombre (opcional)                                                   │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ María García                                                 │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  Rol asignado *                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │ Seleccionar rol...                                       ▼  │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │  • Administrador - Gestión completa de la institución               │   │
│  │  • Conductor - Operación de vehículos y viajes                      │   │
│  │  • Auxiliar - Asistente de ruta, check-in estudiantes               │   │
│  │  • Padre/Madre - Seguimiento de hijos                               │   │
│  │                                                                       │   │
│  │  ───────────────────────────────────────────────────────────────────│   │
│  │                                                                       │   │
│  │  Opciones adicionales:                                               │   │
│  │                                                                       │   │
│  │  ☑ Enviar email de invitación automáticamente                       │   │
│  │                                                                       │   │
│  │  Expiración del código:                                              │   │
│  │  ○ 7 días (predeterminado)                                          │   │
│  │  ○ 14 días                                                          │   │
│  │  ○ 30 días                                                          │   │
│  │                                                                       │   │
│  │                                                                       │   │
│  │         ┌──────────────┐    ┌──────────────────────────┐             │   │
│  │         │   Cancelar   │    │   Crear Invitación       │             │   │
│  │         └──────────────┘    └──────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Invitación Creada - Confirmación

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                  [✕ Cerrar] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                       ✅ Invitación Creada                                   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Se ha creado la invitación para:                                    │   │
│  │  📧 maria.garcia@email.com                                           │   │
│  │  👤 Rol: Padre/Madre                                                 │   │
│  │                                                                       │   │
│  │  ───────────────────────────────────────────────────────────────────│   │
│  │                                                                       │   │
│  │  Código de invitación:                                               │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │          ABC12XY9                               [📋 Copiar] │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  │                                                                       │   │
│  │  ⏰ Expira en: 7 días (12/01/2025)                                   │   │
│  │                                                                       │   │
│  │  ✅ Email enviado automáticamente                                    │   │
│  │                                                                       │   │
│  │         ┌──────────────────────────────────────────────────┐         │   │
│  │         │   Crear otra invitación                          │         │   │
│  │         └──────────────────────────────────────────────────┘         │   │
│  │                                                                       │   │
│  │         [Cerrar]                                                      │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 Importación CSV (Invitaciones Masivas)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                  [✕ Cerrar] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                     Importar Invitaciones (CSV)                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                                                                       │   │
│  │  Formato del archivo CSV:                                            │   │
│  │  email,nombre,rol                                                    │   │
│  │                                                                       │   │
│  │  Ejemplo:                                                            │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │ maria@email.com,María García,parent                           │  │   │
│  │  │ juan@email.com,Juan Pérez,driver                              │  │   │
│  │  │ ana@email.com,Ana López,monitor                               │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  │                                                                       │   │
│  │  Roles válidos: parent, driver, monitor, admin                       │   │
│  │                                                                       │   │
│  │  ───────────────────────────────────────────────────────────────────│   │
│  │                                                                       │   │
│  │              ┌─────────────────────────────────────────┐             │   │
│  │              │  📁 Seleccionar archivo CSV             │             │   │
│  │              │     o arrastra aquí                     │             │   │
│  │              └─────────────────────────────────────────┘             │   │
│  │                                                                       │   │
│  │  [📥 Descargar plantilla CSV]                                        │   │
│  │                                                                       │   │
│  │  ───────────────────────────────────────────────────────────────────│   │
│  │                                                                       │   │
│  │  ☑ Enviar emails de invitación automáticamente                      │   │
│  │                                                                       │   │
│  │         ┌──────────────┐    ┌──────────────────────────┐             │   │
│  │         │   Cancelar   │    │   Procesar CSV           │             │   │
│  │         └──────────────┘    └──────────────────────────┘             │   │
│  │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Elementos Clave:**
- Formulario simple para invitación individual
- Selector de rol con descripciones
- Opción de expiración configurable
- Envío automático de email
- Código copiable
- Importación CSV para invitaciones masivas (hasta 100)
- Plantilla descargable

---

## Componentes Comunes

### Estados de Botones

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│  Estado Normal  │ │  Estado Hover   │ │  Estado Loading │
│                 │ │  (más oscuro)   │ │  ⟳ Cargando...  │
└─────────────────┘ └─────────────────┘ └─────────────────┘

┌─────────────────┐ ┌─────────────────┐
│  Deshabilitado  │ │  Estado Error   │
│  (gris, opaco)  │ │  (borde rojo)   │
└─────────────────┘ └─────────────────┘
```

### Mensajes de Error

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ❌ Error                                                                    │
│  ───────────────────────────────────────────────────────────────────────────│
│  El email ingresado no es válido. Por favor verifica e intenta nuevamente.  │
│                                                               [Entendido]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Mensajes de Éxito

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ Éxito                                                                    │
│  ───────────────────────────────────────────────────────────────────────────│
│  Tu cuenta ha sido creada exitosamente.                                      │
│                                                               [Continuar]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Colores y Estados

| Estado | Color | Uso |
|--------|-------|-----|
| Primario | Azul (#3B82F6) | CTAs principales |
| Secundario | Gris (#6B7280) | CTAs secundarios |
| Éxito | Verde (#10B981) | Confirmaciones |
| Error | Rojo (#EF4444) | Errores, alertas |
| Advertencia | Amarillo (#F59E0B) | Avisos |
| Info | Azul claro (#3B82F6) | Información |

---

## Validaciones

### Campos de Formulario

| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| Email | Formato válido | "Ingresa un email válido" |
| Contraseña | Mín. 8 chars, 1 mayúscula, 1 número | "La contraseña no cumple los requisitos" |
| Teléfono | Formato +593XXXXXXXXX | "Ingresa un número válido de Ecuador" |
| Código invitación | 8 caracteres alfanuméricos | "El código debe tener 8 caracteres" |

### Estados de Invitación

| Estado | Descripción | Color |
|--------|-------------|-------|
| `pending` | Enviada, esperando aceptación | 🟡 Amarillo |
| `accepted` | Usuario creó su cuenta | 🟢 Verde |
| `expired` | Pasaron más de 7 días | 🔴 Rojo |
| `cancelled` | Cancelada por admin | ⚪ Gris |

---

**Listo para implementar flujos de autenticación**
