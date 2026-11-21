# CLAUDE.md — Guía de desarrollo de Abordo

Abordo es un SaaS de rutas escolares para colegios privados, autoalojado: una sola app Next.js (coordinador, conductor, familia y dueño de la plataforma) sobre PostgreSQL, desplegada con Docker Compose. Mercado inicial: Colombia.

## Fuentes de verdad

| Fuente | Ubicación | Para qué |
|--------|-----------|----------|
| Producto | [docs/PRD.md](docs/PRD.md) | Qué hace y qué no hace el producto, reglas de negocio |
| Datos | `db/schema.ts` y `db/migrations/` | Estructura actual de la base |
| Reglas | `lib/` | Lógica pura compartida por servidor y cliente |
| Código | `app/`, `components/`, `server/` | Implementación |

Antes de cambiar algo: lee la sección del PRD, revisa la implementación y el esquema, haz el cambio y actualiza el PRD si cambió un requisito.

## Reglas de trabajo

1. **Piensa y planea por escrito.** Analiza, lee el código relevante y escribe el plan en `tasks/todo.md`.
2. **Aprobación del usuario** antes de implementar un plan.
3. **Avanza tarea por tarea**, marcando lo terminado.
4. **La simplicidad manda.** Cada cambio toca el mínimo código posible.
5. **Causa raíz, no parches.**
6. **Impacto mínimo.** Solo se toca lo que la tarea necesita.

## Presupuesto de ligereza

El producto se sostiene en ser pequeño. Antes de agregar algo, revisa la sección 7 del PRD (fuera de alcance).

- Menos de 12.000 líneas de código.
- Máximo 20 tablas y 18 pantallas.
- Sin dependencias de pago obligatorias.
- Una regla de negocio nueva va en `lib/` como función pura, con su prueba.

## Estructura

```
app/            Pantallas y rutas de la API (app/api: rpc, live, wompi, health)
components/     Cliente de la API y sesión, componentes base, mapa, rostro, push
server/         Funciones del backend, cola de tareas, tiempo real, Wompi, motor de rutas
db/             Esquema (Drizzle), migraciones SQL y datos de demostración
lib/            Reglas puras
deploy/, scripts/   Caddy, base inicial, respaldos, datos de mapas
tests/          Pruebas de reglas, flujos y facturación
```

## Requisitos que todo cambio mantiene

- **Identidad en el servidor.** Las funciones públicas se definen con los constructores de `server/core.ts` (`adminQuery`, `driverMutation`, `userQuery`…) y se registran en `server/api.ts`. Nunca se acepta un `userId` como argumento para decidir quién llama.
- **Aislamiento por colegio, dos capas.** Todo acceso por id pasa por `owned()` y toda tabla con `school_id` tiene seguridad por fila. Una tabla nueva con datos de un colegio se agrega a `SCHOOL_TABLES` y a una migración de políticas.
- **Todo en transacción con alcance.** Fuera de una función de la API, la base se usa con `scoped("system" | schoolId, …)`. Sin alcance no se ve ninguna fila.
- **Tiempo real por etiquetas.** Las consultas declaran `ctx.watch(...)` y las mutaciones `ctx.touch(...)`. Si una mutación cambia algo que una consulta muestra, deben compartir etiqueta.
- **Efectos diferidos por la cola.** Avisos, push y correo se encolan con `ctx.enqueue` (misma transacción). Nada de `setTimeout` ni llamadas externas dentro de una mutación, salvo el motor de rutas.
- **Privacidad entre familias.** Un acudiente solo ve a sus hijos. No se le envían nombres ni domicilios de otros estudiantes.
- **Biometría.** Solo vectores, cifrados, con consentimiento, entregados únicamente al conductor del viaje en curso.
- **Pagos.** Un pago se aplica solo desde el webhook de Wompi con firma válida. Suspender nunca bloquea viajes ni familias.
- **Fechas.** Siempre en la zona horaria del colegio (`lib/dates.ts`).
- **Español** en toda la interfaz y en los mensajes de error que ve el usuario (`fail("…")`).
- **Identidad visual** solo en `app/globals.css` y `components/ui.tsx`. Las pantallas usan los tokens, no colores sueltos.
- **Cambios de esquema** con migración: editar `db/schema.ts` y correr `pnpm db:generate`.

## Stack

| Componente | Tecnología |
|------------|------------|
| App | Next.js 16 (App Router, salida standalone), React 19, TypeScript |
| Base de datos | PostgreSQL 17, Drizzle ORM, seguridad por fila |
| API y validación | Funciones propias tras `/api/rpc`, Zod |
| Tiempo real | Server-Sent Events + `LISTEN/NOTIFY` |
| Tareas | Cola propia sobre Postgres (`server/jobs.ts`) |
| Estilos | Tailwind CSS 4, fuentes Outfit y Fraunces autoalojadas |
| Mapas | MapLibre GL + PMTiles (OpenStreetMap); OSRM opcional para rutas |
| Rostros | @vladmandic/face-api en el navegador |
| Push | web-push (VAPID) |
| Correo | SMTP (nodemailer) |
| Pagos | Wompi (checkout web y webhook) |
| Despliegue | Docker Compose, Caddy |
| Pruebas | Vitest + PGlite |

## Roles

| Rol | Vista | Puede |
|-----|-------|-------|
| `admin` | `/admin` | Todo dentro de su colegio |
| `driver` | `/conductor` | Operar los viajes de sus rutas |
| `parent` | `/familia` | Ver a sus hijos y reportar ausencias |
| `owner` | `/plataforma` | Ver todos los colegios, fijar precios, registrar pagos |

## Comandos

```bash
pnpm dev            # app (necesita DATABASE_URL en .env.local)
pnpm test           # pruebas sobre PostgreSQL en memoria
pnpm type-check     # tipos
pnpm build          # compilación de producción
pnpm db:generate    # migración a partir de db/schema.ts
pnpm seed           # migraciones + colegio de demostración
```

## Commits

Formato `tipo(ámbito): mensaje`.

- Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Ámbitos: `admin`, `conductor`, `familia`, `plataforma`, `auth`, `schema`, `rutas`, `viajes`, `rostro`, `push`, `pagos`, `mapas`, `deploy`, `ui`, `prd`

```bash
feat(conductor): add delay notice
fix(viajes): keep stop index after undo
docs(prd): move QR check-in back in scope
```

## Flujos de cambio

**Corrección**: ubica el problema, revisa el PRD, corrige con impacto mínimo, agrega o ajusta la prueba, confirma con `pnpm test` y `pnpm type-check`.

**Función nueva**: revisa que no esté fuera de alcance en el PRD, planea en `tasks/todo.md`, espera aprobación, implementa, actualiza el PRD.

**Refactor**: sin cambio de comportamiento; las pruebas deben seguir pasando.

## Despliegue

Autoalojado con `docker compose` (ver README). La versión de desarrollo se publica en la tailnet con `./scripts/dev-tailnet.sh`.
