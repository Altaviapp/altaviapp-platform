# Desarrollo Local - App Móvil Conductores

**Altaviapp PWA - Aplicación para Conductores**
**Última actualización**: Noviembre 2025

---

## Requisitos Previos

- **Node.js**: v20+ (actualmente usando v22.18.0)
- **npm**: v10+ (actualmente usando v10.9.3)
- **Docker**: v20+ (recomendado para desarrollo)
- **Docker Compose**: v2+ (recomendado para desarrollo)
- **Sistema Operativo**: Linux, macOS, o Windows (con WSL2)

---

## Configuración Inicial

### 1. Instalar Dependencias

Desde la raíz del proyecto:

```bash
npm install
```

Esto instalará todas las dependencias necesarias incluyendo:
- Next.js 16 (con Turbopack)
- React 19
- Convex (cliente)
- Leaflet (mapas)
- next-pwa (PWA)
- Tailwind CSS
- shadcn/ui components
- Lucide React (iconos)

### 2. Configurar Variables de Entorno

El archivo `.env.local` en la carpeta `mobile/` ya está configurado:

```bash
# Convex Production
NEXT_PUBLIC_CONVEX_URL=https://abundant-mastiff-673.convex.site

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Nota**: Puedes cambiar el puerto en `NEXT_PUBLIC_APP_URL` si necesitas usar un puerto diferente.

---

## Comandos de Desarrollo

### Opción 1: Docker (Recomendado) 🐳

**Ventajas**:
- ✅ Entorno consistente entre desarrolladores
- ✅ Evita conflictos de dependencias locales
- ✅ Soluciona problemas de PostCSS y build tools
- ✅ Fácil reset y limpieza

**Iniciar con Docker**:
```bash
# Desde la raíz del proyecto
docker-compose up

# O en segundo plano
docker-compose up -d

# Ver logs
docker-compose logs -f

# Reconstruir si hay cambios en dependencias
docker-compose up --build
```

**Acceder a la aplicación**:
- Frontend: http://localhost:3001
- Hot reload automático

**Comandos útiles Docker**:
```bash
# Detener contenedores
docker-compose down

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v --rmi all

# Reiniciar solo el servicio de Next.js
docker-compose restart nextjs

# Ejecutar comandos dentro del contenedor
docker-compose exec nextjs npm install nueva-dependencia
docker-compose exec nextjs npm run lint
```

### Opción 2: Local (Sin Docker)

#### Iniciar Servidor de Desarrollo (Solo Mobile)

Para desarrollar SOLO la app móvil sin Convex:

```bash
npm run dev:mobile
```

Esto iniciará:
- Next.js 16 en modo desarrollo con Turbopack
- Hot reload automático
- Servidor en http://localhost:3000

#### Iniciar con Convex (Proyecto Completo)

Para desarrollar con backend Convex activo:

```bash
npm run dev
```

Esto iniciará:
- Convex dev server (backend en tiempo real)
- Next.js mobile app (frontend)

**Nota**: Necesitarás autenticación con Convex la primera vez.

### Otros Comandos Útiles

```bash
# Build para producción
npm run build:mobile

# Iniciar versión de producción
npm run start:mobile

# Linting
npm run lint

# Ejecutar tests
npm test

# Limpiar caché de Next.js
rm -rf mobile/.next
```

---

## Estructura del Proyecto Mobile

```
mobile/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Layout principal con providers
│   │   ├── page.tsx      # Página de inicio
│   │   └── globals.css   # Estilos globales
│   ├── components/       # Componentes React
│   │   └── ui/          # shadcn/ui components
│   ├── providers/        # Context providers
│   │   ├── AuthProvider.tsx        # Autenticación custom
│   │   └── ConvexClientProvider.tsx # Cliente Convex
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilidades y helpers
│   ├── types/           # TypeScript types
│   └── utils/           # Funciones de utilidad
├── public/
│   ├── manifest.json    # PWA manifest
│   ├── icon.svg         # Icono SVG base
│   └── sw.js            # Service worker (generado)
├── next.config.js       # Configuración Next.js + PWA
├── tailwind.config.ts   # Configuración Tailwind
└── tsconfig.json        # Configuración TypeScript
```

---

## Características del PWA

### ✅ Configurado e Implementado

- **Next.js 16**: App Router, Server Components, Turbopack
- **React 19**: Última versión con mejoras de rendimiento
- **PWA**: next-pwa configurado (modo desarrollo: offline deshabilitado)
- **Autenticación**: Sistema custom con tokens (reemplaza Clerk)
- **Convex**: Cliente configurado para tiempo real
- **UI**: Tailwind CSS + shadcn/ui
- **Iconografía**: Lucide React (NO emojis)
- **Idioma**: Español (es-EC) como predeterminado
- **Metadata**: Configurada para instalación PWA
- **Docker**: Entorno de desarrollo containerizado
- **Páginas de autenticación**: Login, Welcome, Permisos ✅
- **Dashboard principal**: Implementado con mock data ✅
- **Layout**: Sidebar, Header, Mobile Navigation ✅
- **Componentes compartidos**: StatusBadge, EmptyState, LoadingState ✅

### 🔜 Pendiente de Implementar (Phases 4-8)

- [ ] Pre-Trip Checklist (Fase 4)
- [ ] Viaje Activo con GPS tracking (Fase 5)
- [ ] Navegación turn-by-turn (Fase 5)
- [ ] Mapas con Leaflet (Fase 5)
- [ ] Check-in/check-out de estudiantes (Fase 6)
- [ ] Escaneo de códigos QR (Fase 6)
- [ ] Reporte de incidentes (Fase 7)
- [ ] Historial de viajes (Fase 7)
- [ ] Perfil y configuración (Fase 7)
- [ ] Notificaciones push (Fase 8)
- [ ] Modo offline completo (Fase 8)
- [ ] Iconos PWA definitivos (actualmente placeholders)

---

## Generar Iconos PWA

Los iconos actuales son placeholders. Para generar iconos reales:

### Opción 1: Usar Herramientas Online

1. Diseña tu icono (512x512px mínimo)
2. Usa [realfavicongenerator.net](https://realfavicongenerator.net/)
3. Genera todos los tamaños necesarios
4. Descarga y coloca en `mobile/public/`

### Opción 2: Desde SVG Existente

Si tienes un SVG (como `mobile/public/icon.svg`):

```bash
# Usando ImageMagick (si está instalado)
convert -background none icon.svg -resize 192x192 icon-192x192.png
convert -background none icon.svg -resize 512x512 icon-512x512.png
convert icon.svg -resize 32x32 favicon.ico
```

### Archivos Necesarios

- `favicon.ico` - 32x32 favicon
- `icon-192x192.png` - 192x192 icono PWA
- `icon-512x512.png` - 512x512 icono PWA

---

## Problemas Comunes y Soluciones

### 1. Error: PostCSS - "Unexpected character '@'" ❌

**Error Completo**:
```
ERROR in ./mobile/src/app/globals.css
Module parse failed: Unexpected character '@' (1:0)
```

**Causa**:
- Next.js desactualizado (14.2.33)
- PostCSS no procesaba directivas de Tailwind correctamente

**Solución**:
```bash
# Opción 1: Actualizar Next.js (recomendado)
npm install next@latest react@latest react-dom@latest

# Opción 2: Usar Docker (resuelve problemas de entorno)
docker-compose up --build
```

**Prevención**: Mantener Next.js actualizado (v16+)

---

### 2. Error: Dashboard 404 después de login ❌

**Síntoma**: Después de iniciar sesión, redirige a `/dashboard` pero muestra error 404.

**Causa**: Estructura de rutas incorrecta en Next.js App Router
- `(dashboard)/page.tsx` mapea a `/`, NO a `/dashboard`
- Route groups `()` no afectan las URLs

**Solución**:
```bash
# Mover el archivo a la estructura correcta
mv mobile/src/app/(dashboard)/page.tsx mobile/src/app/(dashboard)/dashboard/page.tsx
```

**Estructura correcta**:
```
mobile/src/app/
├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx    # ← Correcto: mapea a /dashboard
│   └── layout.tsx
```

---

### 3. Error: Variable Name Typo en routes.ts ❌

**Error Completo**:
```
SyntaxError: Unexpected identifier 'Ida'
```

**Causa**: Espacio en nombre de variable exportada

**Código Incorrecto**:
```typescript
export const mockRoute Ida: Route = { /* ... */ };  // ❌ Espacio
```

**Solución**:
```typescript
export const mockRouteIda: Route = { /* ... */ };   // ✅ Sin espacio
```

---

### 4. Warning: Turbopack + next-pwa ⚠️

**Advertencia**:
```
⚠ Specified "webpack" config export in next.config.js ignored by Turbopack
```

**Causa**:
- Next.js 16 usa Turbopack por defecto
- next-pwa usa configuración de webpack

**Solución**:
```javascript
// next.config.js
module.exports = withPWA({
  // ... configuración PWA ...

  // Silenciar warning agregando turbopack vacío
  turbopack: {},
});
```

**Nota**: No afecta funcionalidad, solo silencia el warning.

---

### 5. Error: "NODE_ENV no estándar" ⚠️

**Advertencia**:
```
⚠ You are using a non-standard "NODE_ENV" value in your environment
```

**Solución**:
Edita `mobile/.env.local` y elimina o comenta:
```bash
# NODE_ENV=production  # Comentar o eliminar
```

---

### 6. Error: Convex "You don't have access" ❌

**Causa**: Convex no está autenticado o configurado.

**Solución Temporal**:
```bash
# Desarrollar solo frontend (sin Convex)
npm run dev:mobile
```

**Solución Permanente**:
```bash
# Autenticar con Convex
npx convex dev
# Seguir las instrucciones en pantalla
```

---

### 7. Puerto 3000 en uso ❌

**Síntoma**: "Port 3000 is already in use"

**Solución Rápida**:
```bash
# Usar puerto diferente
PORT=3001 npm run dev:mobile
```

**Solución con Docker**:
```bash
# Docker ya usa puerto 3001 por defecto
docker-compose up
# Accede en http://localhost:3001
```

**Solución Permanente**:
Editar `package.json`:
```json
"dev:mobile": "cd mobile && PORT=3001 next dev"
```

---

### 8. Error de compilación TypeScript ❌

**Síntoma**: Errores de tipos o compilación extraños

**Solución**:
```bash
# Limpiar caché de Next.js
rm -rf mobile/.next

# Reinstalar dependencias si es necesario
rm -rf node_modules package-lock.json
npm install

# Reiniciar servidor
npm run dev:mobile
```

**Con Docker**:
```bash
docker-compose down
docker-compose up --build
```

---

### 9. Emojis no se ven correctamente en diferentes dispositivos 📱

**Síntoma**:
- Emojis se ven diferentes en iOS vs Android
- Algunos emojis aparecen como cuadros vacíos

**Causa**: Diferentes fuentes de emoji entre sistemas operativos

**Solución**:
```tsx
// ❌ NO usar emojis en la UI
<h2>📅 Viajes de Hoy</h2>

// ✅ USAR Lucide React icons
import { Calendar } from 'lucide-react';
<h2>
  <Calendar className="w-5 h-5" />
  Viajes de Hoy
</h2>
```

Ver: [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) sección 7.1

---

### 10. Hot Reload no funciona ⚠️

**Síntoma**: Cambios en código no se reflejan automáticamente

**Con Docker**:
```bash
# Verificar que los volúmenes estén correctamente montados
docker-compose down
docker-compose up

# Ver logs para errores
docker-compose logs -f nextjs
```

**Local**:
```bash
# Reiniciar servidor
# Ctrl+C para detener
npm run dev:mobile
```

---

### 11. Debugging General 🔍

**Estrategia de Debugging**:

1. **Leer el mensaje de error completo**
   - No solo la primera línea
   - Buscar "at line X" para ubicar el problema

2. **Verificar estructura de archivos**
   ```bash
   tree mobile/src/app -L 3
   ```

3. **Limpiar caché y reconstruir**
   ```bash
   rm -rf mobile/.next
   npm run dev:mobile
   ```

4. **Verificar logs de Docker**
   ```bash
   docker-compose logs -f
   ```

5. **Verificar versiones**
   ```bash
   node --version   # Debe ser v20+
   npm --version    # Debe ser v10+
   next --version   # Debe ser 16+
   ```

6. **Revisar documentación oficial**
   - [Next.js 16 Docs](https://nextjs.org/docs)
   - [Next.js App Router](https://nextjs.org/docs/app)

---

## Desarrollo de Funcionalidades

### Agregar Nueva Página

```bash
# Crear archivo en src/app/
mobile/src/app/nueva-pagina/page.tsx
```

```tsx
export default function NuevaPagina() {
  return (
    <div>
      <h1>Nueva Página</h1>
    </div>
  );
}
```

Accesible en: http://localhost:3000/nueva-pagina

### Agregar Nuevo Componente

```bash
# Crear en src/components/
mobile/src/components/MiComponente.tsx
```

```tsx
"use client";

export function MiComponente() {
  return <div>Mi Componente</div>;
}
```

### Usar Convex (Queries/Mutations)

```tsx
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function MiComponente() {
  const data = useQuery(api.miModulo.miQuery);
  const mutate = useMutation(api.miModulo.miMutation);

  return (
    <div>
      <p>Data: {JSON.stringify(data)}</p>
      <button onClick={() => mutate({ param: "value" })}>
        Ejecutar Mutación
      </button>
    </div>
  );
}
```

### Usar Autenticación

```tsx
"use client";

import { useAuth } from "@/providers/AuthProvider";

export function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>No autenticado</div>;
  }

  return (
    <div>
      <p>Usuario: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Rol: {user.role}</p>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

---

## Testing

### Probar en Dispositivo Móvil

1. **Obtener IP local**:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

2. **Acceder desde móvil**:
```
http://TU_IP_LOCAL:3000
```

Ejemplo: `http://192.168.1.100:3000`

3. **Asegurar firewall permite conexiones**:
```bash
# Linux (UFW)
sudo ufw allow 3000/tcp
```

### Probar PWA

1. Abre Chrome/Edge en modo incógnito
2. Navega a `http://localhost:3000`
3. Abre DevTools > Application > Manifest
4. Verifica que el manifest esté cargado
5. Prueba "Install App" desde el menú

### Probar Service Worker

1. DevTools > Application > Service Workers
2. Verifica que `sw.js` esté registrado
3. Nota: En desarrollo, el caché está deshabilitado

---

## Recursos Útiles

### Documentación

- [Next.js 14 Docs](https://nextjs.org/docs)
- [Convex Docs](https://docs.convex.dev/)
- [Leaflet Docs](https://leafletjs.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [PWA Guide](https://web.dev/progressive-web-apps/)

### Herramientas de Desarrollo

- **React DevTools**: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- **Lighthouse**: Auditoría PWA (Chrome DevTools)
- **Convex Dashboard**: https://dashboard.convex.dev/

### Archivos de Configuración

- [next.config.js](./next.config.js) - Configuración Next.js y PWA
- [tailwind.config.ts](./tailwind.config.ts) - Configuración Tailwind
- [tsconfig.json](./tsconfig.json) - Configuración TypeScript
- [public/manifest.json](./public/manifest.json) - PWA manifest

---

## Próximos Pasos

1. **Implementar Autenticación**
   - Página de login
   - Página de registro
   - Recuperación de contraseña

2. **Dashboard Principal**
   - Vista de viajes activos
   - Estadísticas del día
   - Notificaciones pendientes

3. **Escaneo QR**
   - Integrar librería de escaneo
   - Validación con backend
   - Feedback visual/audio

4. **GPS Tracking**
   - Implementar geolocalización
   - Integrar mapa Leaflet
   - Envío de posición en tiempo real

5. **Gestión de Viajes**
   - Iniciar viaje
   - Finalizar viaje
   - Ver historial

---

## Soporte

Para reportar problemas o solicitar funcionalidades:

1. Revisar [docs/PRD.md](../docs/PRD.md) - Requerimientos del proyecto
2. Revisar [Technical-Specification.md](../Technical-Specification.md) - Especificaciones técnicas
3. Crear issue en el repositorio
4. Contactar al equipo de desarrollo

---

**¡Feliz desarrollo! 🚀🚌**
