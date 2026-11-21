# Abordo

SaaS de rutas escolares para colegios privados. Una sola app con tres vistas:

- **Coordinador** (`/admin`): la operación del día en vivo, estudiantes, rutas, equipo, historial.
- **Conductor** (`/conductor`): sus viajes de hoy y el viaje en curso, un toque por estudiante o reconocimiento facial.
- **Familia** (`/familia`): dónde va el bus, si su hijo ya subió, ausencias y avisos.

Requisitos y decisiones de producto: [docs/PRD.md](docs/PRD.md).

## Arrancar en local

Necesitas Node 20 o superior y pnpm.

```bash
pnpm install
```

En una terminal, el backend (crea `.env.local` la primera vez):

```bash
npx convex dev
```

En otra, la app:

```bash
pnpm dev
```

Datos de demostración (un colegio en Quito con 11 estudiantes, 2 buses y 4 rutas que corren todos los días):

```bash
pnpm seed
```

Entra en http://localhost:3000 con `coordinacion@demo.abordo.app`, `ramiro@demo.abordo.app` (conductor) o `lucia@demo.abordo.app` (familia). Sin `RESEND_API_KEY`, el código de acceso de 6 dígitos aparece en el log de `npx convex dev`.

## Comandos

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | App en modo desarrollo |
| `npx convex dev` | Backend local con recarga |
| `pnpm test` | Pruebas de reglas y de flujos del backend |
| `pnpm type-check` | Tipos de la app y del backend |
| `pnpm build` | Compilación de producción |
| `pnpm seed` | Crea el colegio de demostración |

## Estructura

```
app/            Pantallas: entrada, registro, admin/, conductor/, familia/
components/     Sesión, componentes base, mapa, escáner y registro de rostro, push
convex/         Esquema (14 tablas) y funciones del backend
lib/            Reglas puras: lista del viaje, horas, orden de paradas, rostros, CSV
tests/          rules.test.ts (reglas) y flows.test.ts (backend de punta a punta)
docs/PRD.md     Producto
```

La identidad visual vive en dos archivos: `app/globals.css` (tokens de color, tipografía y mapa) y `components/ui.tsx` (componentes base).

## Configuración

Variables en [.env.example](.env.example). Las del backend se definen con `npx convex env set`.

| Para | Variables |
|------|-----------|
| Enviar el código de acceso por correo | `RESEND_API_KEY`, `EMAIL_FROM`, `APP_URL` |
| Notificaciones push | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` en Convex y `NEXT_PUBLIC_VAPID_PUBLIC_KEY` en la app |
| Otro proveedor de mapas | `NEXT_PUBLIC_TILE_URL` |

Generar las llaves push:

```bash
npx web-push generate-vapid-keys
```

Las teselas por defecto son las de OpenStreetMap, cuya política de uso no cubre tráfico de producción intenso. Antes de salir a clientes conviene contratar un proveedor de teselas y poner su URL en `NEXT_PUBLIC_TILE_URL`.

## Seguridad y datos

- La identidad se resuelve siempre en el servidor a partir del token de sesión (`convex/lib.ts`). Ninguna función recibe el usuario como argumento.
- Todo documento lleva `schoolId` y toda función filtra por el colegio de la sesión.
- Reconocimiento facial: el modelo corre en el navegador y al servidor solo llegan vectores numéricos, nunca fotos. Requiere consentimiento registrado y el acudiente puede retirarlo. Son datos sensibles de menores: el texto de autorización debe revisarlo un abogado antes de usarse con un colegio real.
- `convex/seed.ts` contiene utilidades internas de desarrollo (`seed:session`, `seed:wipe`). No son invocables desde un cliente, pero quien tenga la llave de despliegue puede ejecutarlas.

## Despliegue

1. Crear un proyecto nuevo en Convex y ejecutar `npx convex deploy`.
2. Definir las variables del backend con `npx convex env set`.
3. Desplegar la app Next.js con `NEXT_PUBLIC_CONVEX_URL` y `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.

Abordo no comparte datos ni despliegue con Altaviapp, el producto anterior de este repositorio.
