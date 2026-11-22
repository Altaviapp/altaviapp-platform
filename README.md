# Abordo

SaaS de rutas escolares para colegios privados, autoalojado. Una sola app con cuatro vistas:

- **Coordinador** (`/admin`): la operación del día en vivo, estudiantes, rutas, equipo, historial, plan y pagos.
- **Conductor** (`/conductor`): sus viajes de hoy y el viaje en curso, un toque por estudiante o reconocimiento facial.
- **Familia** (`/familia`): dónde va el bus, si su hijo ya subió, ausencias y avisos.
- **Dueño de la plataforma** (`/plataforma`): colegios, precios y pagos.

Producto y decisiones: [docs/PRD.md](docs/PRD.md). Plan y pendientes: [tasks/todo.md](tasks/todo.md).

## Desarrollo local

Necesitas Node 22, pnpm y PostgreSQL 16 o superior.

```bash
pnpm install
```

Crea una base y un rol que **no** sea superusuario (la seguridad por fila no aplica a superusuarios):

```bash
psql -U postgres -c "create role abordo login password 'dev'" -c "create database abordo owner abordo"
```

Crea `.env.local`:

```bash
DATABASE_URL=postgres://abordo:dev@127.0.0.1:5432/abordo
APP_URL=http://localhost:3000
```

Migraciones y datos de demostración (un colegio en Bogotá con 11 estudiantes, 2 buses y 4 rutas):

```bash
pnpm seed
```

```bash
pnpm dev
```

Entra en http://localhost:3000 con `coordinacion@demo.abordo.app`, `ramiro@demo.abordo.app` (conductor) o `lucia@demo.abordo.app` (familia). Sin `SMTP_URL`, el código de acceso aparece en la terminal de `pnpm dev`.

Para la consola del dueño:

```bash
pnpm make-owner tu@correo.com Tu Nombre
```

## Probar desde el celular por tu tailnet

Deja la versión de desarrollo siempre encendida en tu máquina y accesible solo desde tus dispositivos de Tailscale, con HTTPS (el celular lo exige para cámara, ubicación y notificaciones).

Requisitos: Docker, y Tailscale conectado en esa máquina con MagicDNS y certificados HTTPS activados en el panel de la tailnet (DNS → Enable HTTPS).

```bash
./scripts/dev-tailnet.sh
```

En Windows se corre dentro de WSL: instala Tailscale en Windows (el guion lo usa desde WSL), activa la integración de WSL en Docker Desktop y clona el proyecto en la carpeta de Linux (`~`), no en `/mnt/c`.

Muestra la dirección (`https://tu-maquina.tu-tailnet.ts.net`). Ábrela en el celular, que debe estar en la misma tailnet. La primera vez tarda unos minutos instalando dependencias.

En desarrollo el código de acceso no llega por correo. Se ve con:

```bash
./scripts/dev-tailnet.sh codigos
```

Qué trae: PostgreSQL, el colegio de demostración y llaves de push generadas, para probar las notificaciones en el teléfono. El código es el de la carpeta: al hacer `git pull` la app se actualiza sola. La app y la base solo escuchan en la propia máquina; hacia afuera salen únicamente por Tailscale.

```bash
./scripts/dev-tailnet.sh parar
```

Para probar todo el recorrido con un solo celular, abre una ventana normal como conductor y una privada como familia; el coordinador se ve mejor en un computador de la tailnet.

## Comandos

| Comando | Qué hace |
|---------|----------|
| `pnpm dev` | App en modo desarrollo |
| `pnpm test` | Pruebas sobre PostgreSQL en memoria (no necesita base instalada) |
| `pnpm type-check` | Tipos |
| `pnpm build` | Compilación de producción |
| `pnpm db:generate` | Genera una migración a partir de cambios en `db/schema.ts` |
| `pnpm db:migrate` | Aplica migraciones pendientes |
| `pnpm seed` | Crea el colegio de demostración |
| `./scripts/dev-tailnet.sh` | Versión de desarrollo en contenedores, publicada en tu tailnet |

## Desplegar en un servidor

Necesitas un VPS (o servidor propio) con Docker y un dominio apuntando a él. Referencia: 2 vCPU y 4 GB de RAM alcanzan para empezar; con el motor de rutas, 8 GB.

1. Clona el repositorio y crea la configuración:

```bash
cp .env.example .env
```

2. Completa `.env`. Los secretos se generan así:

```bash
openssl rand -hex 24
```

```bash
openssl rand -base64 32
```

El primero sirve para `POSTGRES_PASSWORD`, `APP_DB_PASSWORD` y `BACKUP_PASSPHRASE`; el segundo para `FACE_KEY`. Guarda `FACE_KEY` y `BACKUP_PASSPHRASE` también fuera del servidor: sin ellas no se pueden leer los rostros ni los respaldos.

3. Descarga el mapa de Colombia (datos de OpenStreetMap):

```bash
./scripts/maps.sh teselas
```

4. Levanta todo:

```bash
docker compose up -d --build
```

Caddy obtiene el certificado HTTPS solo. La app aplica las migraciones al arrancar y crea al dueño de la plataforma con `OWNER_EMAIL`.

### Opcionales

**Rutas por calles (OSRM).** Prepara los datos (pide unos 4 GB de RAM una sola vez), pon `OSRM_URL=http://osrm:5000` en `.env` y levanta el perfil:

```bash
./scripts/maps.sh rutas
```

```bash
docker compose --profile rutas up -d
```

Sin OSRM la app funciona igual: ordena las paradas y estima horas en línea recta.

**Servidor en casa.** Para no abrir puertos del router, usa un túnel de Cloudflare: en `.env` pon `SITE_ADDRESS=:80`, `BIND_ADDRESS=127.0.0.1`, `CLIENT_IP_HEADER=cf-connecting-ip` y `CLOUDFLARE_TUNNEL_TOKEN`, apunta el túnel a `http://caddy:80` y levanta con:

```bash
docker compose --profile casa up -d
```

Sirve para pilotos. Con datos en vivo de menores conviene un VPS: energía, conexión y respaldos no dependen de una casa.

**Docker Hub con límite de descargas.** Define `NODE_IMAGE`, `POSTGRES_IMAGE` y `CADDY_IMAGE` en `.env` con un espejo, por ejemplo `mirror.gcr.io/library/node:22-alpine`.

### Respaldos

```bash
./scripts/backup.sh
```

Crea un respaldo cifrado en `data/backups/` y borra los de más de 14 días. Prográmalo a diario con cron y **copia esa carpeta fuera del servidor**. Para restaurar:

```bash
./scripts/backup.sh restaurar data/backups/ARCHIVO
```

### Actualizar

```bash
git pull
```

```bash
docker compose up -d --build
```

## Pagos con Wompi

1. En el panel de Wompi (Desarrolladores) copia la llave pública, la privada, el secreto de integridad y el secreto de eventos a `.env`. Empieza con las de pruebas (`pub_test_…`).
2. Registra como URL de eventos: `https://TU_DOMINIO/api/wompi/events`.
3. Fija el precio por estudiante de cada colegio en `/plataforma` (o el valor por defecto con `PRICE_PER_STUDENT_COP`).

El coordinador paga 1 o 12 meses desde "Plan y pagos". Un pago solo se aplica cuando llega el evento de Wompi con firma válida y monto exacto. Los pagos por transferencia se registran en `/plataforma`.

## Seguridad y datos

- La identidad se resuelve en el servidor desde la cookie de sesión (`server/core.ts`). Ninguna función recibe el usuario como argumento.
- Aislamiento por colegio en dos capas: el filtro del código y la seguridad por fila de PostgreSQL (`db/migrations/0001_rls.sql`). Por eso la app se conecta con un rol sin privilegios de superusuario.
- Reconocimiento facial: el modelo corre en el navegador y al servidor solo llegan vectores numéricos, que se guardan cifrados. Requiere consentimiento y el acudiente puede retirarlo.
- El contenedor de la app corre sin root, con sistema de archivos de solo lectura. PostgreSQL no se publica fuera de la red interna de Docker.
- Acciones sensibles quedan en `audit_log`.

## Pendiente antes de cobrar a un colegio real

Lo que no resuelve el código: factura electrónica ante la DIAN, confirmación de la tarifa de IVA con un contador, política de tratamiento de datos y registro ante la SIC (Ley 1581), y revisión legal del texto de autorización biométrica. El detalle está en [tasks/todo.md](tasks/todo.md).
