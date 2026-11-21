# Abordo — PRD

**Versión**: 3.1 (autoalojado, mapas abiertos y suscripción)
**Fecha**: noviembre 2026
**Estado**: Aprobado; versión 1 implementada
**Reemplaza**: `docs/prd/*`, `docs/prd-v2/*`, `Technical-Specification.md`

---

## 1. Premisa

SaaS para colegios privados que gestionan sus rutas escolares. Mercado inicial: Colombia.

Un colegio tiene buses, conductores y estudiantes que viajan cada mañana y cada tarde. El producto responde tres preguntas, una por persona:

| Persona | Pregunta | Respuesta del producto |
|---------|----------|------------------------|
| **Coordinador** del colegio | ¿Está saliendo bien la operación de hoy? | Una pantalla en vivo con todos los buses, quién va a bordo y qué requiere atención |
| **Conductor / monitor** | ¿A quién recojo y dónde? | Una lista de paradas con los estudiantes de cada una y un botón por estudiante |
| **Familia** | ¿Dónde está el bus y ya subió mi hijo? | Mapa en vivo y un aviso push en cada momento que importa |

Todo lo que no ayude a responder una de esas tres preguntas queda fuera de la versión 1.

---

## 2. Qué aprendimos del producto actual

El producto actual (Altaviapp v2) cubre la idea correcta pero creció por acumulación. Medido sobre el repositorio:

| Dato | Valor actual | Consecuencia |
|------|--------------|--------------|
| Código TypeScript | 110.734 líneas, 664 archivos | Cada cambio toca muchas capas |
| Aplicaciones | 3 apps Next.js + 5 paquetes compartidos | Login, hooks y notificaciones triplicados |
| Tablas | 26 | Varias con campos `DEPRECATED` y "legacy" conviviendo con los nuevos |
| Endpoints HTTP | 80, que duplican las funciones de Convex | Dos superficies de API que mantener |
| Pruebas | 2 archivos | Reglas de negocio sin red de seguridad |
| Mapas | Google Maps y Leaflet a la vez | Costo por uso y dos implementaciones |

Problemas de fondo que la reescritura corrige:

1. **Seguridad**: 231 funciones del backend reciben `userId` como argumento y confían en él. Quien conozca un ID puede actuar como ese usuario. En el producto nuevo la identidad se deriva siempre del token de sesión en el servidor.
2. **El valor para la familia no llega**: no hay notificaciones push reales, solo una lista dentro de la app. El padre tiene que abrir la app para enterarse.
3. **Novedades sobrediseñadas**: 7 estados, tipos configurables con 16 opciones, aprobación del coordinador y acuse del conductor. En la práctica el 90 % de los casos es "mañana no va".
4. **Funciones a medias**: ajustes con datos de ejemplo, 2FA solo visual, modo relevo, dispositivos GPS externos con mapeo de campos, reportes, calendario del conductor.
5. **Fricción de acceso**: contraseña, verificación de correo, invitación con código y recuperación de contraseña, repetido en tres apps.

Lo que sí funciona y se conserva como idea: ruta como plantilla y viaje como ejecución del día, viaje creado al iniciarlo el conductor, detección de hermanos por correo del acudiente, importación por CSV, ordenamiento automático de paradas con ajuste manual.

---

## 3. Principios

1. **Una app, tres vistas.** Un solo dominio y un solo inicio de sesión. El rol decide qué se ve.
2. **Sin contraseñas.** Se entra con un código de 6 dígitos enviado al correo. La sesión dura 90 días en el dispositivo.
3. **El celular es el GPS.** El teléfono del conductor reporta la posición. No se integran dispositivos externos en v1.
4. **Avisar, no pedir permiso.** La familia informa una ausencia y queda aplicada. El coordinador la ve, no la aprueba.
5. **Derivar antes que guardar.** La lista de un viaje se calcula (estudiantes de la ruta menos ausencias del día), no se copia ni se sincroniza.
6. **Un toque por estudiante.** El conductor nunca escribe mientras opera.
7. **Presupuesto de ligereza.** Menos de 12.000 líneas, máximo 20 tablas, máximo 18 pantallas, sin dependencias de pago obligatorias.
8. **La biometría es opcional y local.** El reconocimiento facial corre en el celular del conductor. Al servidor solo llegan vectores numéricos, con consentimiento registrado y revocable.
9. **Autoalojado y sin proveedor cautivo.** Todo corre con `docker compose up` en un VPS o un servidor propio: PostgreSQL, la app y un proxy. Mapas, rutas y tiempo real usan software y datos abiertos.
10. **Cobrar no puede frenar un bus.** La falta de pago bloquea la edición del coordinador; nunca un viaje en curso ni el aviso a una familia.

---

## 4. Usuarios y roles

| Rol | Quién es | Dispositivo | Puede |
|-----|----------|-------------|-------|
| `admin` | Coordinador de transporte del colegio | Computador | Todo dentro de su colegio |
| `driver` | Conductor o monitor que opera el viaje | Celular | Ver y operar los viajes que tiene asignados |
| `parent` | Padre, madre o acudiente | Celular | Ver a sus hijos, reportar ausencias |
| `owner` | Dueño de la plataforma | Computador | Ver todos los colegios, fijar precio, registrar pagos |

Un usuario pertenece a un solo colegio y tiene un solo rol. No hay rol separado de monitor: quien lleva el celular en el bus opera el viaje. El dueño de la plataforma no pertenece a ningún colegio y entra a su propia consola.

---

## 5. Alcance de la versión 1

### 5.1 Acceso (todos)

- Pantalla única de entrada: correo, luego código de 6 dígitos (vence en 10 minutos, 5 intentos).
- Solo entran correos que el coordinador ya registró, más el registro de un colegio nuevo.
- Registro de colegio: nombre del colegio, nombre y correo del coordinador. Crea el colegio, su primer `admin` y una prueba gratis de 30 días.
- La sesión vive en una cookie que el código de la página no puede leer. Las apps nativas usarán la cabecera `Authorization`.
- No hay invitaciones: al crear un estudiante con el correo de su acudiente, ese acudiente ya puede entrar. El coordinador puede reenviar un correo de bienvenida.

### 5.2 Coordinador (7 pantallas)

**Hoy** — pantalla de inicio.
- Mapa con todos los buses en viaje.
- Lista de viajes del día con estado: sin iniciar, en curso, terminado.
- Por viaje: estudiantes a bordo sobre esperados, parada actual, retraso en minutos.
- Bandeja de atención: viaje que no ha iniciado 10 minutos después de su hora, avisos del conductor, ausencias reportadas para hoy.
- Clic en un viaje: detalle con mapa, paradas y estado de cada estudiante.

**Estudiantes**
- Lista con búsqueda y filtro por grado y por ruta.
- Crear y editar: nombre, grado, dirección, punto en el mapa, hasta 2 acudientes (nombre, correo, teléfono), nota opcional.
- Los hermanos se agrupan solos al compartir correo de acudiente.
- Registro de rostro desde el colegio, declarando que cuenta con la autorización escrita del acudiente.
- Importación por CSV con vista previa y errores por fila.

**Rutas**
- Lista de rutas con sentido, horario, bus, conductor y ocupación.
- Editor en una sola pantalla: nombre, sentido (hacia el colegio o desde el colegio), días de la semana, hora de inicio, bus y conductor.
- Agregar estudiantes: cada uno crea o se suma a una parada en su domicilio. Los que viven en el mismo punto comparten parada.
- Botón "Ordenar": orden óptimo, horas y trazo por calles con el motor de rutas abierto; sin él, vecino más cercano en línea recta. Reordenamiento manual arrastrando.
- Hora prevista por parada, editable.
- Aviso si los estudiantes superan la capacidad del bus.

**Equipo y buses**
- Conductores: nombre, correo, teléfono, activo.
- Buses: nombre o número, placa, capacidad, activo.

**Historial**
- Viajes por fecha y ruta, con hora real de inicio y fin y asistencia por estudiante.
- Exportación a CSV.

**Plan y pagos**
- Estado de la suscripción y fecha hasta la que está cubierta.
- Tarifa del momento: estudiantes activos en ruta × precio, más IVA.
- Pagar 1 o 12 meses en el checkout de Wompi (PSE, tarjeta, Nequi, Botón Bancolombia).
- Datos de facturación (razón social, NIT, correo) e historial de pagos.

**Ajustes**
- Nombre del colegio, ubicación en el mapa, zona horaria, lista de grados, coordinadores adicionales.

### 5.3 Conductor (3 pantallas)

**Mis viajes**
- Viajes de hoy con hora, bus, número de paradas y de estudiantes esperados, ya descontadas las ausencias.
- Botón "Iniciar viaje". Pide permiso de ubicación la primera vez.

**Viaje en curso**
- Tarjeta de la parada siguiente: nombre, hora prevista, estudiantes.
- Hacia el colegio: por estudiante, "Subió" o "No salió". Al llegar, "Llegamos al colegio" marca a todos los que van a bordo como entregados y termina el viaje.
- Desde el colegio: primero se marca quién subió en el colegio; en cada parada, "Bajó".
- Cada toque se puede deshacer. El aviso a la familia espera 8 segundos por si el conductor corrige.
- **Check-in con reconocimiento facial**: botón "Escanear" que abre la cámara, reconoce al estudiante entre los de ese viaje y lo marca. Si el parecido es dudoso pide confirmación; si no reconoce, se usa la lista. Solo aplica a estudiantes con rostro registrado.
- Mapa con las paradas y el trazo, y botones para abrir Waze o Google Maps hacia la parada siguiente. El conductor decide el camino con el tráfico del momento.
- Botón "Avisar": retraso, avería u otro, con texto opcional. Llega al coordinador y, si el conductor lo marca, a las familias de ese viaje.
- La pantalla se mantiene encendida durante el viaje.
- Si se pierde la conexión, los toques quedan guardados en el teléfono, se ven aplicados y se envían en orden al volver la señal.

**Resumen**
- Al terminar: duración, estudiantes transportados, quiénes no salieron.

### 5.4 Familia (3 pantallas)

**Inicio**
- Una tarjeta por hijo con su estado de hoy: en casa, bus en camino con hora estimada, a bordo, en el colegio, entregado.
- Mapa en vivo del bus cuando hay viaje en curso, con la parada del hijo resaltada.
- Nombre y teléfono del conductor, con botón de llamada.
- Botón "Reportar ausencia".

**Ausencia**
- Hijo, fecha o rango de fechas, sentido (mañana, tarde o ambos), nota opcional.
- Queda aplicada al instante. Se puede cancelar mientras el viaje no haya iniciado.

**Rostro del hijo (opcional)**
- El acudiente autoriza el reconocimiento facial y registra el rostro con la cámara de su celular.
- Puede retirar la autorización en cualquier momento; el registro se borra.

**Actividad**
- Avisos recibidos y asistencia de los últimos 30 días.
- Activar o desactivar notificaciones push. Cerrar sesión.

### 5.5 Dueño de la plataforma (1 pantalla)

**Colegios**
- Todos los colegios con su estado de pago, estudiantes en ruta, valor mensual y fecha cubierta.
- Ajustar el precio por estudiante, extender la prueba o cambiar el estado.
- Registrar un pago recibido por transferencia.

### 5.6 Notificaciones

Push web real más la lista dentro de la app.

| Momento | Quién lo recibe | Texto |
|---------|-----------------|-------|
| El viaje inicia | Familias del viaje | "El bus de la ruta {ruta} ya salió" |
| El bus está a menos de 500 m de la parada | Familias de esa parada | "El bus está por llegar a {parada}" |
| El estudiante sube | Sus acudientes | "{nombre} subió al bus" |
| El bus llega al colegio | Familias de los que van a bordo | "{nombre} llegó al colegio" |
| El estudiante baja en su parada | Sus acudientes | "{nombre} fue entregado en {parada}" |
| El estudiante no salió | Sus acudientes | "{nombre} no abordó en {parada}" |
| Aviso del conductor | Coordinador, y familias si se marca | El texto del aviso |
| Ausencia reportada | Coordinador y conductor de la ruta | "{nombre} no viaja el {fecha}" |
| Viaje sin iniciar tras 10 minutos | Coordinador | "La ruta {ruta} no ha iniciado" |

---

## 6. Reglas de negocio

1. **Ruta y viaje.** La ruta es la plantilla: paradas, estudiantes, días y hora. El viaje es su ejecución en una fecha. Solo hay un viaje por ruta y fecha, y se crea cuando el conductor lo inicia.
2. **Viajes de hoy.** Son las rutas activas cuyo día de la semana coincide con hoy en la zona horaria del colegio. No hay proceso nocturno que los cree.
3. **Lista del viaje.** Estudiantes de la ruta menos los que tienen una ausencia que cubra esa fecha y ese sentido. Se calcula al consultar.
4. **Foto de la ruta.** Al iniciar, el viaje guarda una copia de las paradas. Editar la ruta después no altera viajes ya iniciados ni el historial.
5. **Estados del viaje.** `in_progress` y `completed`. "Sin iniciar" es la ausencia de viaje. Un coordinador puede cerrar un viaje olvidado.
6. **Estados del estudiante en un viaje.** Esperado, a bordo, entregado, no salió, ausente. Los tres del medio son registros de asistencia; los otros dos se derivan.
7. **Hora estimada que aprende.** Cada viaje guarda la hora real de llegada a cada parada. Con 3 o más viajes, la hora típica de una parada es la mediana de sus últimas 10 llegadas; a eso se suma el retraso observado hoy. Así la estimación incluye el tráfico habitual de esa ruta sin consultar a un proveedor. También se guarda lo que se le mostró a la familia, para medir el error contra la llegada real.
8. **Posición.** El celular del conductor envía la posición cada 10 segundos mientras el viaje está en curso. Solo se guarda la última, en una tabla aparte para que cada reporte no recalcule las pantallas que leen el viaje. Se borra al terminar.
9. **Desde el colegio.** El viaje empieza con el abordaje en el colegio. Al salir, quien no subió queda como "no abordó" y las paradas sin nadie a bordo se saltan solas.
10. **Rostros.** Se comparan únicamente contra los estudiantes del viaje en curso. Coincidencia automática solo si el parecido es alto y con ventaja clara sobre el segundo candidato. Los vectores solo se entregan al conductor de ese viaje.
11. **Suscripción.** Se cobra por estudiante activo asignado a una ruta activa, por mes, más IVA. Estados: prueba (30 días), activa, en mora (7 días de gracia) y suspendida. Un pago se aplica solo con un evento de Wompi con firma válida, monto exacto y una sola vez. Pagar antes de vencer no pierde días.
12. **Aislamiento.** Todo dato lleva `schoolId` y toda función filtra por el colegio de la sesión. Además la base de datos lo impone por su cuenta (seguridad por fila): una consulta sin filtro tampoco ve otro colegio. Un padre solo ve estudiantes de los que es acudiente; un conductor solo opera viajes de rutas que tiene asignadas.

---

## 7. Fuera de alcance

| Se elimina | Por qué | Vuelve si |
|------------|---------|-----------|
| Check-in con código QR | Se reemplaza por reconocimiento facial y lista por toque | Un colegio exige identificación con carné |
| Aprobación de novedades y tipos configurables | La ausencia cubre casi todos los casos | Hay demanda de cambio de parada temporal |
| Dispositivos GPS externos y webhooks | El celular basta para empezar | Un cliente ya tiene GPS instalado en la flota |
| Checklist del vehículo con fotos | No responde ninguna de las tres preguntas | Lo pide una norma local |
| Modo relevo (cambio de bus en ruta) | Caso raro; el aviso del conductor lo cubre | Se repite en operación real |
| Incidentes con severidad y flujo de resolución | Se reemplaza por el aviso del conductor | Se necesita trazabilidad formal |
| Reportes y gráficas | El historial exportable a CSV cubre la necesidad | Hay preguntas recurrentes que el CSV no responde |
| Calendario del conductor y del padre | "Hoy" es lo que importa | — |
| Organización matriz con varios colegios | Un colegio por cuenta | Aparece un grupo educativo como cliente |
| API REST pública | Nadie la consume | Hay una integración concreta |
| Contraseñas, 2FA, verificación de correo | Sustituidos por código al correo | — |
| Edición de datos del estudiante por la familia | El coordinador es dueño del dato | Se quiere que la familia confirme el punto de su casa |
| Tráfico en vivo de un proveedor de pago | La hora estimada aprende del historial y se corrige con la posición del bus | El error medido (Historial) lo justifica; el motor de rutas tiene dónde enchufarlo |
| Renovación automática con tarjeta guardada | Mueve dinero sin una persona delante: se hace cuando se pueda probar contra Wompi | Hay llaves de prueba de Wompi |
| Factura electrónica (DIAN) | Se integra con un proveedor aparte | Antes del primer cobro real |
| Buscador de direcciones propio | Los buscadores abiertos aciertan poco con direcciones colombianas; el punto en el mapa es el camino seguro | Hay un índice de direcciones confiable |
| Rutas mensuales o de fecha única | Las rutas escolares son por día de la semana | Salidas pedagógicas |

---

## 8. Modelo de datos

PostgreSQL, 20 tablas. Las paradas viven dentro de la ruta y los avisos del conductor dentro del viaje.

| Tabla | Para qué |
|-------|----------|
| `schools`, `users`, `sessions` | Colegios, personas (con su código de acceso vigente) y sesiones |
| `students`, `guardians`, `faces` | Estudiantes, sus acudientes y el vector de rostro cifrado con su consentimiento |
| `vehicles`, `routes` | Buses y rutas (paradas, días, hora, trazo por calles) |
| `trips`, `positions`, `boardings`, `stop_times` | Viajes, última posición, asistencia y hora real de llegada por parada |
| `absences` | Ausencias reportadas |
| `notifications`, `push_subscriptions` | Avisos en la app y suscripciones push |
| `subscriptions`, `charges` | Suscripción de cada colegio y sus cobros |
| `jobs`, `audit_log`, `rate_limits` | Cola de tareas, bitácora de acciones sensibles y límites de intentos |

Las 14 tablas con datos de un colegio tienen seguridad por fila forzada. La app se conecta con un rol que no es superusuario.

---

## 9. Arquitectura

| Capa | Elección | Motivo |
|------|----------|--------|
| App | Una sola app Next.js, instalable como PWA, en una imagen de Docker | Un despliegue, un dominio, un login |
| Base de datos | PostgreSQL 17 con Drizzle y migraciones versionadas | Estándar, con respaldos y permisos conocidos |
| API | Funciones tipadas tras un único punto `/api/rpc`, validadas con Zod | La identidad y el colegio se resuelven siempre en el servidor |
| Tiempo real | Server-Sent Events + `LISTEN/NOTIFY` de Postgres | Sin servicio extra; funciona con varias réplicas |
| Tareas | Cola propia sobre Postgres (`FOR UPDATE SKIP LOCKED`) | Avisos diferidos, push, correo, mora; transaccional y sin dependencia |
| Mapas | MapLibre GL con un archivo PMTiles de Colombia servido por el proxy | Datos de OpenStreetMap, cero costo por uso |
| Rutas | OSRM autoalojado (opcional) | Trazo por calles, tiempos y orden óptimo de paradas |
| Proxy | Caddy con HTTPS automático, o túnel de Cloudflare para un servidor en casa | Sin configurar certificados a mano |
| Correo | SMTP de cualquier proveedor | Solo código de acceso, bienvenida y recordatorios |
| Push | Web Push con llaves VAPID | Sin proveedor externo |
| Pagos | Wompi: checkout web y webhook firmado | Mercado colombiano: PSE, tarjeta, Nequi, Bancolombia |
| Reconocimiento facial | face-api en el navegador | Ninguna imagen sale del dispositivo |
| Pruebas | Vitest sobre PostgreSQL en memoria (PGlite), con la seguridad por fila activa | Las reglas son pocas y críticas |

### Seguridad

- Sesión en cookie `HttpOnly`, `Secure`, `SameSite=Lax`; toda petición con cookie debe venir del propio origen.
- Política de contenido con valor de un solo uso por petición; cabeceras HSTS, `nosniff`, sin marcos y permisos de cámara y ubicación solo para la propia app.
- Límite de intentos de acceso por correo y por conexión.
- Seguridad por fila en la base, como segunda barrera tras el filtro del código.
- Vectores de rostro cifrados en reposo con una llave que no está en la base.
- Bitácora de ingresos, rostros, importaciones, cambios de equipo y pagos.
- Contenedor de la app sin root, con sistema de archivos de solo lectura y sin capacidades; la base no se expone fuera de la red interna.
- Respaldo cifrado de la base y restauración probada.

### Estructura del repositorio

```
app/            Pantallas y rutas de la API (rpc, live, wompi, health)
components/     Cliente de la API y sesión, componentes base, mapa, rostro, push
server/         Funciones del backend, cola de tareas, tiempo real, Wompi, rutas
db/             Esquema, migraciones y datos de demostración
lib/            Reglas puras compartidas por servidor y cliente
deploy/, scripts/   Caddy, base inicial, respaldos y datos de mapas
tests/          Reglas, flujos del backend y facturación
```

### Limitaciones conocidas

- Una PWA no reporta posición con la pantalla apagada: la pantalla se mantiene encendida durante el viaje. Las apps nativas (siguiente fase) lo resuelven.
- En iPhone, el push web exige instalar la app en la pantalla de inicio.
- Sin tráfico en vivo, la hora estimada no anticipa un trancón que el bus aún no ha tocado.
- El reconocimiento facial depende de la luz y de la cámara. Nunca es el único camino.
- Los datos biométricos de menores son datos sensibles (Ley 1581 en Colombia): el texto de autorización necesita revisión legal.

---

## 10. Diseño

Limpio, fácil de navegar, nunca saturado, y con un aire campestre propio de un colegio privado.

| Elemento | Decisión |
|----------|----------|
| Paleta | Verde bosque `#12301f` para texto y superficies oscuras; crema `#f5f0e1` de fondo; mantequilla `#ead9a0` como acento sobre oscuro; musgo `#76873b`; pizarra `#24424f`; carmesí `#8a1c14` solo para alertas; dorado arena `#c9a86a` en detalles |
| Tipografía | Fraunces (serif) en títulos, horas y cifras; Outfit (sans geométrica) en todo lo demás |
| Forma | Bloques de radio amplio, botones y pestañas tipo píldora, iconos de línea |
| Celular | Cabecera verde con saludo y el contenido en una hoja crema; barra de navegación flotante |
| Escritorio | Barra lateral verde flotante; contenido sobre crema con tarjetas claras |
| Jerarquía | Un dato protagonista por bloque (la hora, el estado del hijo, el conteo a bordo) en tipografía grande |
| Color con significado | A bordo en pizarra, entregado en verde, ausente en dorado, no abordó en carmesí. Nada más lleva color |
| Mapa | Teselas desaturadas; el color lo ponen el bus, las paradas y el colegio |

---

## 11. Métricas de éxito

| Métrica | Meta |
|---------|------|
| Tiempo de un colegio desde el registro hasta su primera ruta lista | Menos de 30 minutos con CSV |
| Toques del conductor por estudiante | 1 |
| Familias con push activo a las 2 semanas | Más del 60 % |
| Viajes iniciados en la app sobre viajes programados | Más del 90 % |
| Tamaño del código | Menos de 12.000 líneas |
| Error medio de la hora estimada | Menos de 3 minutos por parada |
| Colegios que pagan al terminar la prueba | Más del 50 % |

---

## 12. Nombre

**Abordo**: lo que la familia quiere saber es que su hijo ya va a bordo. Reemplaza a Altaviapp. Falta verificar disponibilidad de dominio y de marca.

---

## 13. Entrega por fases

| Fase | Contenido | Resultado verificable |
|------|-----------|-----------------------|
| 0 | Borrar el código y la documentación actuales; esqueleto nuevo | El repositorio compila vacío |
| 1 | Esquema, acceso por código, registro de colegio, navegación por rol | Un coordinador entra y ve su colegio |
| 2 | Estudiantes con CSV, equipo y buses, rutas con editor | Una ruta completa creada desde cero |
| 3 | Conductor: mis viajes, viaje en curso, posición, asistencia | Un viaje operado de inicio a fin |
| 4 | Familia: inicio en vivo, ausencias, push | Un padre recibe "subió al bus" |
| 5 | Coordinador: Hoy en vivo, bandeja de atención, historial y CSV | La operación del día visible en una pantalla |
| 6 | PWA instalable, datos de demostración, pruebas de reglas, README y CLAUDE.md nuevos | Demo lista para mostrar a un colegio |

---

## 14. Decisiones tomadas

1. Nombre: Abordo.
2. Se empieza de cero. El despliegue de Altaviapp no se toca ni se migra.
3. El check-in con reconocimiento facial entra en la versión 1.
4. Diseño: paleta campestre y estructura de bloques amplios (sección 10).
5. Autoalojado en VPS o servidor propio, sobre PostgreSQL. Sin Convex ni Vercel.
6. Mapas y rutas con software y datos abiertos. El tráfico de pago queda como pieza enchufable, apagada.
7. Mercado inicial: Colombia. Cobro por estudiante activo al mes, con Wompi.
8. Siguiente fase: apps para Android y iPhone, con plan propio para publicación.
