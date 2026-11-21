# PRD — Plataforma de rutas escolares (nombre por definir)

**Versión**: 3.0 (reescritura completa)
**Fecha**: noviembre 2026
**Estado**: Borrador para aprobación
**Reemplaza**: `docs/prd/*`, `docs/prd-v2/*`, `Technical-Specification.md`

---

## 1. Premisa

SaaS para colegios privados que gestionan sus rutas escolares.

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
7. **Presupuesto de ligereza.** Menos de 10.000 líneas, máximo 13 tablas, máximo 16 pantallas, sin dependencias de pago obligatorias.

---

## 4. Usuarios y roles

| Rol | Quién es | Dispositivo | Puede |
|-----|----------|-------------|-------|
| `admin` | Coordinador de transporte del colegio | Computador | Todo dentro de su colegio |
| `driver` | Conductor o monitor que opera el viaje | Celular | Ver y operar los viajes que tiene asignados |
| `parent` | Padre, madre o acudiente | Celular | Ver a sus hijos, reportar ausencias |

Un usuario pertenece a un solo colegio y tiene un solo rol. No hay rol separado de monitor: quien lleva el celular en el bus opera el viaje. El dueño de la plataforma administra colegios desde el panel de Convex en v1.

---

## 5. Alcance de la versión 1

### 5.1 Acceso (todos)

- Pantalla única de entrada: correo, luego código de 6 dígitos (vence en 10 minutos, 5 intentos).
- Solo entran correos que el coordinador ya registró, más el registro de un colegio nuevo.
- Registro de colegio: nombre del colegio, nombre y correo del coordinador. Crea el colegio y su primer `admin`.
- No hay invitaciones: al crear un estudiante con el correo de su acudiente, ese acudiente ya puede entrar. El coordinador puede reenviar un correo de bienvenida.

### 5.2 Coordinador (6 pantallas)

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
- Importación por CSV con vista previa y errores por fila.

**Rutas**
- Lista de rutas con sentido, horario, bus, conductor y ocupación.
- Editor en una sola pantalla: nombre, sentido (hacia el colegio o desde el colegio), días de la semana, hora de inicio, bus y conductor.
- Agregar estudiantes: cada uno crea o se suma a una parada en su domicilio. Los que viven en el mismo punto comparten parada.
- Botón "Ordenar paradas" (vecino más cercano desde o hacia el colegio) y reordenamiento manual arrastrando.
- Hora estimada por parada calculada desde la hora de inicio, editable.
- Aviso si los estudiantes superan la capacidad del bus.

**Equipo y buses**
- Conductores: nombre, correo, teléfono, activo.
- Buses: nombre o número, placa, capacidad, activo.

**Historial**
- Viajes por fecha y ruta, con hora real de inicio y fin y asistencia por estudiante.
- Exportación a CSV.

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
- Cada toque se puede deshacer.
- Mapa con las paradas y botón para abrir la navegación del teléfono hacia la parada siguiente.
- Botón "Avisar": retraso, avería u otro, con texto opcional. Llega al coordinador y, si el conductor lo marca, a las familias de ese viaje.
- La pantalla se mantiene encendida durante el viaje.
- Si se pierde la conexión, los toques quedan en cola y se envían al volver.

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

**Actividad**
- Avisos recibidos y asistencia de los últimos 30 días.
- Activar o desactivar notificaciones push. Cerrar sesión.

### 5.5 Notificaciones

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
7. **Hora estimada.** Hora prevista de la parada más el retraso observado en la última parada completada. Sin servicios externos de tráfico.
8. **Posición.** El celular del conductor envía la posición cada 10 segundos mientras el viaje está en curso. Se guarda la última en el viaje y un rastro que se borra a los 30 días.
9. **Aislamiento.** Todo dato lleva `schoolId` y toda función filtra por el colegio de la sesión. Un padre solo ve estudiantes de los que es acudiente; un conductor solo opera viajes de rutas que tiene asignadas.

---

## 7. Fuera de alcance

| Se elimina | Por qué | Vuelve si |
|------------|---------|-----------|
| Check-in con código QR | Tocar un nombre es más rápido que escanear a cada niño | Un colegio exige identificación con carné |
| Aprobación de novedades y tipos configurables | La ausencia cubre casi todos los casos | Hay demanda de cambio de parada temporal |
| Dispositivos GPS externos y webhooks | El celular basta para empezar | Un cliente ya tiene GPS instalado en la flota |
| Checklist del vehículo con fotos | No responde ninguna de las tres preguntas | Lo pide una norma local |
| Modo relevo (cambio de bus en ruta) | Caso raro; el aviso del conductor lo cubre | Se repite en operación real |
| Incidentes con severidad y flujo de resolución | Se reemplaza por el aviso del conductor | Se necesita trazabilidad formal |
| Reportes y gráficas | El historial exportable a CSV cubre la necesidad | Hay preguntas recurrentes que el CSV no responde |
| Calendario del conductor y del padre | "Hoy" es lo que importa | — |
| Organización matriz con varios colegios | Un colegio por cuenta | Aparece un grupo educativo como cliente |
| Planes y suscripción dentro de la app | La facturación se maneja por fuera al inicio | Hay más de unos pocos clientes |
| API REST pública | Nadie la consume | Hay una integración concreta |
| Contraseñas, 2FA, verificación de correo | Sustituidos por código al correo | — |
| Edición de datos del estudiante por la familia | El coordinador es dueño del dato | Se quiere que la familia confirme el punto de su casa |
| Google Maps | Costo y llave obligatoria | Se necesita trazado por calles con tráfico |
| Rutas mensuales o de fecha única | Las rutas escolares son por día de la semana | Salidas pedagógicas |

---

## 8. Modelo de datos

13 tablas. Las paradas viven dentro de la ruta, no en tabla aparte.

| Tabla | Campos principales |
|-------|--------------------|
| `schools` | nombre, zona horaria, ubicación, grados |
| `users` | schoolId, correo, nombre, teléfono, rol, activo |
| `authCodes` | correo, hash del código, vencimiento, intentos |
| `sessions` | userId, hash del token, vencimiento |
| `students` | schoolId, nombre, grado, domicilio (dirección, lat, lng), guardianIds, nota, activo |
| `vehicles` | schoolId, nombre, placa, capacidad, activo |
| `routes` | schoolId, nombre, sentido, días, hora de inicio, vehicleId, driverId, paradas `[{id, nombre, lat, lng, hora, studentIds}]`, activa |
| `trips` | schoolId, routeId, fecha, sentido, driverId, vehicleId, estado, inicio, fin, copia de paradas, índice de parada, última posición |
| `boardings` | schoolId, tripId, studentId, stopId, estado (a bordo, entregado, no salió), hora |
| `absences` | schoolId, studentId, desde, hasta, sentido, nota, creada por |
| `notices` | schoolId, tripId, tipo, mensaje, visible para familias, hora |
| `notifications` | userId, título, cuerpo, tripId, leída, hora |
| `pushSubscriptions` | userId, endpoint, llaves |

El rastro de posiciones se guarda en `positions` (tripId, lat, lng, hora) solo si se confirma que el coordinador lo quiere ver en el historial; si no, basta la última posición en `trips` y el modelo queda en 13 tablas.

---

## 9. Arquitectura

| Capa | Elección | Motivo |
|------|----------|--------|
| App | Una sola app Next.js (App Router), instalable como PWA | Un despliegue, un dominio, un login |
| Backend y tiempo real | Convex | Las suscripciones en vivo son el corazón del producto y ya hay experiencia con él |
| Identidad | Sesión propia con token; el servidor resuelve el usuario en cada función | Corrige el fallo de seguridad actual |
| Correo | Resend por HTTP | Solo se usa para el código de acceso y la bienvenida |
| Mapas | Leaflet con teselas de OpenStreetMap, URL configurable | Sin costo ni llave obligatoria |
| Push | Web Push con llaves VAPID | Sin proveedor externo |
| Estilos | Tailwind, componentes propios mínimos | Sin paquete de UI compartido |
| Pruebas | Vitest sobre las reglas de la sección 6 | Las reglas son pocas y críticas |

Estructura del repositorio:

```
app/            Pantallas: (auth), admin/, conductor/, familia/
components/     Componentes compartidos (mapa, lista, formulario)
convex/         Esquema y funciones
lib/            Reglas puras (lista del viaje, hora estimada, orden de paradas)
docs/PRD.md     Este documento
```

Sin monorepo, sin Turborepo, sin paquetes internos, sin Docker.

Limitaciones conocidas que se aceptan en v1:

- Una PWA no puede reportar posición con la pantalla apagada. Se mantiene la pantalla encendida durante el viaje y se le indica al conductor dejar la app abierta.
- En iPhone, las notificaciones push exigen instalar la app en la pantalla de inicio. La app guía ese paso.
- El trazo entre paradas es en línea recta, no por calles.

---

## 10. Métricas de éxito

| Métrica | Meta |
|---------|------|
| Tiempo de un colegio desde el registro hasta su primera ruta lista | Menos de 30 minutos con CSV |
| Toques del conductor por estudiante | 1 |
| Familias con push activo a las 2 semanas | Más del 60 % |
| Viajes iniciados en la app sobre viajes programados | Más del 90 % |
| Tamaño del código | Menos de 10.000 líneas |

---

## 11. Nombre

El producto nuevo deja el nombre Altaviapp. Candidatos (sin verificar disponibilidad de dominio ni de marca):

| Nombre | Idea |
|--------|------|
| **Abordo** | Lo que la familia quiere saber: su hijo ya va a bordo |
| **Ronda** | El recorrido diario; corto y con eco escolar |
| **Trayecto** | Descriptivo y serio, orientado al colegio que compra |
| **Rutea** | Verbo directo para el coordinador que arma rutas |

---

## 12. Entrega por fases

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

## 13. Decisiones abiertas

1. Nombre del producto.
2. Datos de producción: empezar en un despliegue nuevo de Convex o migrar colegios existentes.
3. Si alguna función de la sección 7 debe entrar en v1.
