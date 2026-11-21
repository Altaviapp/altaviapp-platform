# CLAUDE.md — Guía de desarrollo de Abordo

Abordo es un SaaS de rutas escolares para colegios privados: una sola app Next.js con tres vistas (coordinador, conductor, familia) sobre Convex. Reemplaza a Altaviapp; nada del código anterior sigue vigente.

## Fuentes de verdad

| Fuente | Ubicación | Para qué |
|--------|-----------|----------|
| Producto | [docs/PRD.md](docs/PRD.md) | Qué hace y qué no hace el producto, reglas de negocio |
| Datos | `convex/schema.ts` | Estructura actual de la base |
| Reglas | `lib/` | Lógica pura compartida por servidor y cliente |
| Código | `app/`, `components/`, `convex/` | Implementación |

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

- Menos de 10.000 líneas de código.
- Máximo 14 tablas y 16 pantallas.
- Sin dependencias de pago obligatorias.
- Una regla de negocio nueva va en `lib/` como función pura, con su prueba.

## Estructura

```
app/            Pantallas: entrada, registro, admin/, conductor/, familia/
components/     Sesión, componentes base, mapa, rostro, push
convex/         Esquema y funciones
lib/            Reglas puras
tests/          Pruebas de reglas y de flujos
```

## Requisitos que todo cambio mantiene

- **Identidad en el servidor.** Las funciones públicas se definen con los constructores de `convex/lib.ts` (`adminQuery`, `driverMutation`, `userQuery`…). Nunca se acepta un `userId` como argumento para decidir quién llama.
- **Aislamiento por colegio.** Todo documento lleva `schoolId`; todo acceso por id pasa por `owned()`.
- **Privacidad entre familias.** Un acudiente solo ve a sus hijos. No se le envían nombres ni domicilios de otros estudiantes.
- **Biometría.** Solo vectores, con consentimiento, entregados únicamente al conductor del viaje en curso.
- **Tiempo real.** Datos en vivo con suscripciones de Convex. La posición vive en `positions`, aparte del viaje, para no recalcular lo demás cada 10 segundos.
- **Fechas.** Siempre en la zona horaria del colegio (`lib/dates.ts`).
- **Español** en toda la interfaz y en los mensajes de error que ve el usuario (`ConvexError`).
- **Identidad visual** solo en `app/globals.css` y `components/ui.tsx`. Las pantallas usan los tokens, no colores sueltos.

## Stack

| Componente | Tecnología |
|------------|------------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Backend y tiempo real | Convex |
| Estilos | Tailwind CSS 4, fuentes Outfit y Fraunces autoalojadas |
| Mapas | Leaflet + react-leaflet con teselas de OpenStreetMap |
| Rostros | @vladmandic/face-api en el navegador |
| Push | web-push (VAPID) |
| Correo | Resend por HTTP |
| Pruebas | Vitest + convex-test |

## Roles

| Rol | Vista | Puede |
|-----|-------|-------|
| `admin` | `/admin` | Todo dentro de su colegio |
| `driver` | `/conductor` | Operar los viajes de sus rutas |
| `parent` | `/familia` | Ver a sus hijos y reportar ausencias |

## Comandos

```bash
pnpm dev            # app
npx convex dev      # backend local
pnpm test           # pruebas
pnpm type-check     # tipos
pnpm build          # compilación de producción
pnpm seed           # colegio de demostración
```

## Commits

Formato `tipo(ámbito): mensaje`.

- Tipos: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`
- Ámbitos: `admin`, `conductor`, `familia`, `auth`, `schema`, `rutas`, `viajes`, `rostro`, `push`, `ui`, `prd`

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

Abordo usa su propio proyecto de Convex. El despliegue `wooden-armadillo-937` y los dominios `*.altaviapp.com` pertenecen al producto anterior: no se despliega ahí.
