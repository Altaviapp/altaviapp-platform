# Altaviapp - Funcionalidades por Usuario

## Coordinadores

### Panel de Control
- Como coordinador, necesito ver métricas del día: viajes activos, vehículos en operación, total de estudiantes, conductores activos, rutas activas, incidentes abiertos
- Como coordinador, necesito ver los viajes activos con su estado, ruta, vehículo y progreso
- Como coordinador, necesito ver las últimas alertas e incidentes para actuar rápidamente
- Como coordinador, necesito acceder rápidamente al mapa de monitoreo desde el panel

### Flota - Vehículos
- Como coordinador, necesito registrar vehículos con placa, marca, modelo, año, color y capacidad de pasajeros
- Como coordinador, necesito asignar estado a cada vehículo: activo, en mantenimiento, fuera de servicio
- Como coordinador, necesito configurar el tipo de GPS del vehículo: aplicación móvil, dispositivo GPS dedicado, o API externa
- Como coordinador, necesito buscar vehículos por placa o filtrar por estado
- Como coordinador, necesito ver el historial de ubicaciones de cada vehículo

### Flota - Conductores
- Como coordinador, necesito registrar conductores con nombre, teléfono, email y contacto de emergencia
- Como coordinador, necesito registrar la licencia del conductor: número, tipo (C/D/E) y fecha de vencimiento
- Como coordinador, necesito asignar estado al conductor: activo o inactivo
- Como coordinador, necesito buscar conductores por nombre

### Flota - Monitores/Auxiliares
- Como coordinador, necesito registrar monitores con nombre, teléfono, email y documento de identidad
- Como coordinador, necesito registrar certificaciones: primeros auxilios y cuidado infantil
- Como coordinador, necesito asignar estado al monitor: activo o inactivo

### Estudiantes
- Como coordinador, necesito registrar estudiantes con nombre, apellido, grado y fecha de nacimiento
- Como coordinador, necesito configurar la ubicación del hogar con dirección y coordenadas GPS en un mapa interactivo
- Como coordinador, necesito asignar email del padre/apoderado principal y secundario
- Como coordinador, necesito agregar contactos de emergencia con nombre, teléfono y parentesco
- Como coordinador, necesito agregar notas médicas relevantes (alergias, condiciones, medicamentos)
- Como coordinador, necesito importar estudiantes masivamente desde archivo CSV con validación de datos
- Como coordinador, necesito que el sistema detecte hogares existentes automáticamente por email del padre
- Como coordinador, necesito generar código QR único para cada estudiante
- Como coordinador, necesito descargar e imprimir el código QR individualmente
- Como coordinador, necesito enviar invitación por email a los padres para acceder a la plataforma
- Como coordinador, necesito buscar estudiantes por nombre y filtrar por grado o estado

### Rutas - Creación
- Como coordinador, necesito crear rutas paso a paso con un asistente de 3 pasos
- Como coordinador, necesito definir el tipo de ruta: recogida (casa→colegio) o entrega (colegio→casa)
- Como coordinador, necesito establecer la hora objetivo de llegada/salida
- Como coordinador, necesito asignar vehículo, conductor y opcionalmente monitor a la ruta
- Como coordinador, necesito asignar estudiantes a paradas y ver sus ubicaciones en el mapa
- Como coordinador, necesito que el sistema calcule el orden óptimo de paradas automáticamente
- Como coordinador, necesito reordenar paradas manualmente con arrastrar y soltar
- Como coordinador, necesito ver el trazado de la ruta en el mapa con distancia y tiempo estimado
- Como coordinador, necesito configurar la recurrencia: diaria, días específicos de la semana, mensual o única vez

### Rutas - Gestión
- Como coordinador, necesito ver la lista de rutas con estadísticas: total, activas, vehículos asignados, estudiantes
- Como coordinador, necesito ver el detalle de cada ruta con mapa, paradas, estudiantes y horarios estimados
- Como coordinador, necesito editar rutas existentes manteniendo el historial
- Como coordinador, necesito activar o desactivar rutas según el calendario escolar
- Como coordinador, necesito eliminar rutas que ya no se usan
- Como coordinador, necesito buscar rutas por nombre y filtrar por tipo o estado

### Monitoreo de Viajes - Vista General
- Como coordinador, necesito ver todos los viajes del día con actualización automática
- Como coordinador, necesito ver estadísticas: activos, completados hoy, cancelados, programados
- Como coordinador, necesito ver indicador de novedades pendientes en cada viaje programado
- Como coordinador, necesito iniciar viajes manualmente si el conductor no lo hace

### Monitoreo de Viajes - Detalle en Tiempo Real
- Como coordinador, necesito ver la ubicación del vehículo en el mapa actualizada cada 15 segundos
- Como coordinador, necesito ver el trazado de la ruta con paradas completadas y pendientes diferenciadas
- Como coordinador, necesito ver el tiempo estimado de llegada (ETA) a cada parada restante
- Como coordinador, necesito ver indicador de retraso: a tiempo, leve retraso, retrasado, muy retrasado
- Como coordinador, necesito ver la velocidad actual del vehículo
- Como coordinador, necesito ver el estado de cada estudiante: pendiente, a bordo, entregado, ausente
- Como coordinador, necesito ver el timeline cronológico de eventos del viaje

### Incidentes
- Como coordinador, necesito ver la lista de todos los incidentes con búsqueda y filtros
- Como coordinador, necesito filtrar incidentes por estado: todos, abiertos, en progreso, resueltos
- Como coordinador, necesito ver cada incidente con tipo, severidad (baja/media/alta/crítica), descripción, fecha y ubicación
- Como coordinador, necesito ver qué estudiante fue afectado si aplica
- Como coordinador, necesito resolver incidentes agregando notas de resolución
- Como coordinador, necesito crear incidentes manualmente desde el panel
- Como coordinador, necesito recibir notificación inmediata cuando se reporta un incidente crítico

### Novedades - Revisión
- Como coordinador, necesito ver un panel con novedades pendientes de aprobación
- Como coordinador, necesito ver el detalle de cada novedad: estudiante, grado, tipo, fechas afectadas, ruta afectada, razón
- Como coordinador, necesito ver la evidencia adjunta: fotos o documentos PDF
- Como coordinador, necesito aprobar novedades con un clic
- Como coordinador, necesito rechazar novedades especificando el motivo
- Como coordinador, necesito que el padre reciba notificación automática de aprobación o rechazo

### Novedades - Configuración de Tipos
- Como coordinador, necesito ver los tipos de novedad predefinidos: ausencia, recogida por padre, cambio temporal de parada, recogida temprana, llegada tarde, licencia médica, cambio de ubicación
- Como coordinador, necesito crear tipos de novedad personalizados para mi institución
- Como coordinador, necesito configurar cada tipo con: código, nombre, descripción, icono, color, categoría de comportamiento
- Como coordinador, necesito definir si el tipo requiere aprobación o es inmediato
- Como coordinador, necesito definir si requiere evidencia obligatoria y cantidad máxima de archivos
- Como coordinador, necesito definir el tipo de duración: día único, rango de fechas, permanente, recurrente
- Como coordinador, necesito activar o desactivar tipos de novedad
- Como coordinador, necesito reordenar los tipos con arrastrar y soltar

### Usuarios
- Como coordinador, necesito ver la lista de usuarios con estadísticas por rol
- Como coordinador, necesito buscar usuarios por nombre o email
- Como coordinador, necesito filtrar usuarios por rol: administrador, conductor, monitor, padre
- Como coordinador, necesito ver el perfil de cada usuario con información de contacto, rol, estado y último acceso
- Como coordinador, necesito invitar nuevos usuarios generando un código de 6 dígitos con expiración de 7 días
- Como coordinador, necesito activar o desactivar cuentas de usuario
- Como coordinador, necesito editar información básica de usuarios

### Configuración - Institución
- Como coordinador, necesito configurar nombre, dirección, teléfono y email de la institución
- Como coordinador, necesito subir el logo de la institución
- Como coordinador, necesito configurar la ubicación del colegio con coordenadas GPS en mapa interactivo
- Como coordinador, necesito seleccionar la zona horaria (Ecuador/Colombia)

### Configuración - Grados
- Como coordinador, necesito personalizar los grados/cursos de mi institución
- Como coordinador, necesito usar presets predefinidos o crear grados personalizados

### Configuración - Notificaciones
- Como coordinador, necesito activar/desactivar notificaciones de: inicio de viaje, fin de viaje, alertas de retraso, incidentes, reporte diario por email

### Configuración - General
- Como coordinador, necesito seleccionar idioma: español o inglés
- Como coordinador, necesito seleccionar formato de fecha y hora
- Como coordinador, necesito configurar el intervalo de actualización GPS (10-60 segundos)

### Notificaciones
- Como coordinador, necesito ver mis notificaciones en un menú desplegable con contador de no leídas
- Como coordinador, necesito ver las últimas 10 notificaciones con icono según categoría
- Como coordinador, necesito marcar notificaciones como leídas individual o masivamente
- Como coordinador, necesito que las notificaciones me lleven directamente al incidente, novedad o viaje relacionado

---

## Tripulación (Conductores y Monitores)

### Panel Principal
- Como tripulación, necesito ver un saludo personalizado con mi nombre y rol
- Como tripulación, necesito ver el resumen del día: viajes completados, viajes programados, estudiantes transportados
- Como tripulación, necesito ver mis rutas de hoy para iniciar rápidamente
- Como tripulación, necesito ver las novedades del día agrupadas por tipo con iconos y colores
- Como tripulación, necesito ver estadísticas de la semana: viajes, estudiantes, duración total
- Como tripulación, necesito ver información del vehículo asignado
- Como tripulación, necesito ver mis notificaciones recientes

### Rutas
- Como tripulación, necesito ver la lista de mis rutas asignadas
- Como tripulación, necesito filtrar rutas por tipo: todas, recogida, entrega
- Como tripulación, necesito ver cada ruta con: nombre, tipo, horario, cantidad de paradas, cantidad de estudiantes, vehículo asignado
- Como tripulación, necesito ver el detalle de una ruta con lista de paradas, estudiantes por parada y mapa con trazado
- Como conductor, necesito iniciar un viaje desde la pantalla de detalle de ruta

### Calendario
- Como tripulación, necesito ver el calendario mensual con mis viajes
- Como tripulación, necesito ver indicadores de color por estado: azul (en ruta), verde (completado), amarillo (programado), rojo (cancelado)
- Como tripulación, necesito navegar entre meses

### Viaje - Inicio
- Como tripulación, necesito ver la pantalla de confirmación antes de iniciar el viaje
- Como tripulación, necesito ver un banner con las novedades del día: total, desglose por categoría con iconos y colores
- Como tripulación, necesito acceder a la lista de estudiantes para ver detalles de novedades
- Como conductor, necesito completar la lista de verificación pre-viaje antes de iniciar

### Viaje - Lista de Verificación (Solo Conductor)
- Como conductor, necesito completar inspección por categorías: mecánica, luces, seguridad, limpieza
- Como conductor, necesito marcar cada item como verificado o con problema
- Como conductor, necesito ver el progreso de la verificación con barra de progreso
- Como conductor, necesito tomar foto del vehículo
- Como conductor, necesito ver un resumen antes de confirmar
- Como conductor, necesito reportar si hay problemas que impiden el viaje

### Viaje Activo - Mapa
- Como tripulación, necesito ver mi ubicación en el mapa actualizada en tiempo real con indicador de dirección
- Como tripulación, necesito ver el trazado de la ruta completa
- Como tripulación, necesito ver las paradas diferenciadas: completadas, actual, pendientes
- Como tripulación, necesito ver el marcador del colegio
- Como tripulación, necesito ver mi velocidad actual en el mapa
- Como tripulación, necesito ver el progreso del viaje (porcentaje completado)

### Viaje Activo - Siguiente Parada
- Como tripulación, necesito ver la tarjeta de la siguiente parada con nombre y dirección
- Como tripulación, necesito ver la distancia en metros/kilómetros a la parada
- Como tripulación, necesito ver el tiempo estimado de llegada en minutos
- Como tripulación, necesito abrir navegación externa (Google Maps/Waze) con un botón
- Como tripulación, necesito ver la lista de estudiantes de esa parada con su estado actual
- Como tripulación, necesito ver qué estudiantes tienen novedades activas con icono y color según tipo

### Viaje Activo - Check-in de Estudiantes
- Como tripulación, necesito escanear el código QR del estudiante para registrar abordaje
- Como tripulación, necesito registrar check-in manualmente si el QR no funciona
- Como tripulación, necesito que el sistema valide que el estudiante pertenece a esta ruta y parada
- Como tripulación, necesito que el sistema registre automáticamente timestamp y ubicación GPS del check-in
- Como tripulación, necesito que el sistema notifique automáticamente al padre cuando su hijo aborda
- Como tripulación, necesito marcar cuando el estudiante es entregado en su destino
- Como tripulación, necesito que el sistema notifique automáticamente al padre cuando su hijo es entregado
- Como tripulación, necesito ver el estado de cada estudiante: pendiente (gris), a bordo (azul), entregado (verde), ausente por novedad (rojo), recogida por padre (amarillo)

### Viaje Activo - Novedades
- Como tripulación, necesito ver un banner compacto con el total de novedades y desglose
- Como tripulación, necesito ver qué estudiantes están ausentes hoy y no debo esperarlos
- Como tripulación, necesito ver cambios temporales de parada para recoger en otra ubicación
- Como tripulación, necesito ver si algún estudiante será recogido por su padre directamente
- Como tripulación, necesito confirmar que recibí y entendí cada novedad

### Viaje Activo - Acciones Rápidas
- Como tripulación, necesito reportar un incidente sin salir de la pantalla de viaje activo
- Como tripulación, necesito reportar cambio de vehículo (relay) si hay problemas mecánicos
- Como tripulación, necesito ver los detalles completos del viaje

### Viaje Activo - Reporte de Incidente
- Como tripulación, necesito reportar incidentes en 3 pasos desde un modal
- Como tripulación, necesito seleccionar el tipo: accidente, emergencia médica, problema con estudiante, problema en ruta, retraso, otro
- Como tripulación, necesito seleccionar la severidad: crítica, alta, media, baja
- Como tripulación, necesito escribir una descripción del incidente
- Como tripulación, necesito seleccionar el estudiante afectado si aplica
- Como tripulación, necesito indicar minutos de retraso si es un retraso
- Como tripulación, necesito que el sistema capture automáticamente mi ubicación GPS
- Como tripulación, necesito recibir confirmación con el ID del incidente
- Como tripulación, necesito que el coordinador reciba notificación inmediata

### Viaje Activo - Cambio de Vehículo (Relay)
- Como tripulación, necesito reportar que debo cambiar de vehículo durante el viaje
- Como tripulación, necesito seleccionar el nuevo vehículo de la lista disponible
- Como tripulación, necesito que el sistema notifique a los padres del cambio

### Viaje Activo - Finalización
- Como tripulación, necesito finalizar el viaje al completar todas las paradas
- Como tripulación, necesito confirmar la finalización del viaje
- Como tripulación, necesito ver un resumen del viaje completado

### Viaje - Detalles y Timeline
- Como tripulación, necesito ver información general del viaje: ruta, tipo, hora de inicio, duración
- Como tripulación, necesito ver información del vehículo y tripulación
- Como tripulación, necesito ver la lista de paradas con estudiantes agrupados y sus estados
- Como tripulación, necesito ver el timeline cronológico de todos los eventos: inicio, llegadas a paradas, check-ins, incidentes, cambios, finalización
- Como tripulación, necesito ver quién realizó cada acción y cuándo

### Perfil - Información
- Como tripulación, necesito ver mi foto o avatar
- Como tripulación, necesito ver mi nombre completo, email y teléfono
- Como tripulación, necesito ver mi rol (Conductor o Monitor)
- Como conductor, necesito ver mi número de licencia, tipo y fecha de vencimiento
- Como monitor, necesito ver mi documento de identidad y certificaciones
- Como tripulación, necesito ver mis estadísticas: viajes completados, estudiantes transportados, días trabajados

### Perfil - Historial
- Como tripulación, necesito ver mi historial de viajes
- Como tripulación, necesito filtrar por período: últimos 7, 30 o 90 días
- Como tripulación, necesito ver cada viaje con: fecha, ruta, tipo, duración, estudiantes, estado final

### Perfil - Configuración
- Como tripulación, necesito activar/desactivar notificaciones push, vibración y sonido
- Como tripulación, necesito configurar preferencias del mapa: tipo de vista, auto-centrar, mostrar tráfico
- Como tripulación, necesito cambiar mi contraseña
- Como tripulación, necesito cerrar sesión en todos los dispositivos
- Como tripulación, necesito ver la versión de la aplicación y acceder a ayuda

### Notificaciones
- Como tripulación, necesito ver mis notificaciones en un menú optimizado para móvil
- Como tripulación, necesito ver el contador de notificaciones no leídas
- Como tripulación, necesito ver notificaciones categorizadas: novedades (azul), actualizaciones de viaje (azul), check-ins (verde), incidentes (rojo), sistema (gris)
- Como tripulación, necesito marcar notificaciones como leídas

### Funcionalidades Móviles
- Como tripulación, necesito instalar la aplicación en mi teléfono desde el navegador
- Como tripulación, necesito que la aplicación funcione parcialmente sin internet
- Como tripulación, necesito otorgar permisos de ubicación, notificaciones y cámara al primer uso
- Como tripulación, necesito que el GPS siga funcionando en segundo plano durante el viaje

---

## Padres / Apoderados

### Inicio - Seguimiento en Vivo
- Como padre, necesito ver una tarjeta por cada uno de mis hijos con su estado actual
- Como padre, necesito ver el estado del viaje: en ruta, en el colegio, en casa, regresando, programado
- Como padre, necesito ver el nombre de la ruta actual (recogida o entrega)
- Como padre, necesito ver la barra de progreso visual del viaje (porcentaje completado)
- Como padre, necesito ver el tiempo estimado de llegada (ETA) en minutos y hora exacta
- Como padre, necesito ver indicador de retraso: a tiempo, leve retraso, retrasado, muy retrasado
- Como padre, necesito ver el nombre del conductor
- Como padre, necesito expandir la tarjeta para ver más detalles

### Inicio - Vista Expandida de Viaje
- Como padre, necesito ver el mapa con la ubicación del vehículo en tiempo real actualizada cada 15 segundos
- Como padre, necesito ver el trazado de la ruta completa con las paradas
- Como padre, necesito ver la parada de mi hijo destacada en el mapa
- Como padre, necesito ver el marcador del colegio
- Como padre, necesito ver la ubicación de recogida/entrega de mi hijo
- Como padre, necesito ver el ETA mejorado con indicador de retraso
- Como padre, necesito ver la velocidad actual del vehículo
- Como padre, necesito ver información del conductor y vehículo (placa)
- Como padre, necesito llamar al conductor con un botón de teléfono
- Como padre, necesito enviar WhatsApp al conductor con un botón
- Como padre, necesito crear una novedad rápida si no hay viaje activo

### Calendario
- Como padre, necesito ver el calendario semanal con los viajes de mis hijos
- Como padre, necesito ver el día actual destacado
- Como padre, necesito ver tarjetas de viaje por día con: nombre de ruta, tipo, hora programada, conductor
- Como padre, necesito navegar entre semanas
- Como padre, necesito ver días sin rutas con mensaje vacío

### Mis Hijos - Lista
- Como padre, necesito ver una tarjeta por cada hijo con foto, nombre, grado y estado
- Como padre, necesito ver indicadores: ubicación GPS configurada, foto cargada
- Como padre, necesito ver la dirección de casa y teléfono de contacto

### Mis Hijos - Perfil del Hijo
- Como padre, necesito ver la foto o avatar grande de mi hijo
- Como padre, necesito ver nombre completo, grado y fecha de nacimiento con edad calculada
- Como padre, necesito ver el estado: activo o inactivo
- Como padre, necesito ver la dirección del hogar y ubicación GPS
- Como padre, necesito ver los teléfonos de contacto principal y secundario
- Como padre, necesito ver el email del apoderado
- Como padre, necesito ver contactos de emergencia
- Como padre, necesito ver información del apoderado secundario si existe
- Como padre, necesito invitar a un apoderado secundario
- Como padre, necesito ver y descargar el código QR de mi hijo
- Como padre, necesito imprimir el código QR
- Como padre, necesito ver las rutas asignadas a mi hijo con horarios y paradas

### Mis Hijos - Edición
- Como padre, necesito subir o cambiar la foto de mi hijo (máximo 5MB, JPG/PNG/WebP)
- Como padre, necesito actualizar la dirección del hogar
- Como padre, necesito actualizar el teléfono de contacto
- Como padre, necesito agregar o editar contacto de emergencia secundario

### Mis Hijos - Ubicación del Hogar
- Como padre, necesito configurar la ubicación exacta del hogar en un mapa interactivo
- Como padre, necesito buscar la dirección con autocompletado
- Como padre, necesito hacer clic en el mapa para seleccionar el punto exacto
- Como padre, necesito confirmar y guardar las coordenadas GPS

### Mis Hijos - Historial de Viajes
- Como padre, necesito ver el historial de viajes de cada hijo
- Como padre, necesito filtrar por período: últimos 7, 30 o 90 días
- Como padre, necesito ver cada viaje con: fecha, ruta, tipo, conductor, estado del estudiante (a bordo/entregado/ausente)

### Historial Global
- Como padre, necesito ver el historial consolidado de viajes de todos mis hijos
- Como padre, necesito filtrar por período y por hijo
- Como padre, necesito ver la información de cada viaje: estudiante, fecha, ruta, estado, conductor

### Novedades - Crear Solicitud
- Como padre, necesito seleccionar el hijo si tengo varios
- Como padre, necesito seleccionar el tipo de novedad de una lista con iconos y colores
- Como padre, necesito seleccionar la fecha afectada para novedades de un día
- Como padre, necesito seleccionar rango de fechas para ausencias prolongadas
- Como padre, necesito seleccionar la hora si el tipo lo requiere (recogida temprana)
- Como padre, necesito seleccionar la ruta específica afectada de las asignadas a mi hijo
- Como padre, necesito seleccionar si afecta recogida, entrega o ambas
- Como padre, necesito escribir el motivo de la solicitud
- Como padre, necesito adjuntar evidencia: fotos o documentos PDF
- Como padre, necesito ver preview de los archivos adjuntos
- Como padre, necesito ver progreso de carga de archivos
- Como padre, necesito validación en tiempo real del formulario
- Como padre, necesito enviar la solicitud y ver confirmación

### Novedades - Tipos Disponibles
- Como padre, necesito reportar ausencia de mi hijo por uno o varios días
- Como padre, necesito indicar que recogeré a mi hijo personalmente (no usará el bus)
- Como padre, necesito solicitar cambio temporal de parada (recoger en otra dirección)
- Como padre, necesito solicitar recogida temprana (salir antes del horario normal)
- Como padre, necesito reportar llegada tarde (abordar en parada posterior o no usar el bus)
- Como padre, necesito reportar licencia médica con certificado adjunto
- Como padre, necesito solicitar cambio permanente de ubicación
- Como padre, necesito ver tipos personalizados creados por mi institución

### Novedades - Lista y Estados
- Como padre, necesito ver mis novedades agrupadas por estado: pendientes de aprobación, próximas (aprobadas), historial
- Como padre, necesito ver cada novedad con: tipo (icono y color), hijo, fechas afectadas, motivo, estado, indicador de evidencia
- Como padre, necesito ver el estado: pendiente (amarillo), aprobada (verde), rechazada (rojo), confirmada por conductor (azul), aplicada (gris)
- Como padre, necesito ver el motivo de rechazo si fue rechazada
- Como padre, necesito crear nueva novedad desde esta pantalla

### Notificaciones - Centro
- Como padre, necesito ver todas mis notificaciones en una pantalla dedicada
- Como padre, necesito ver notificaciones agrupadas por fecha: hoy, ayer, esta semana, anteriores
- Como padre, necesito filtrar: todas o solo no leídas
- Como padre, necesito filtrar por hijo si tengo varios

### Notificaciones - Tipos y Eventos
- Como padre, necesito recibir notificación cuando mi hijo aborda el bus (check-in verde)
- Como padre, necesito recibir notificación cuando mi hijo es entregado en su destino
- Como padre, necesito recibir notificación cuando el viaje de mi hijo inicia
- Como padre, necesito recibir notificación cuando el viaje termina
- Como padre, necesito recibir notificación cuando el ETA se actualiza significativamente
- Como padre, necesito recibir notificación cuando mi solicitud de novedad es aprobada
- Como padre, necesito recibir notificación cuando mi solicitud es rechazada con el motivo
- Como padre, necesito recibir notificación cuando el conductor confirma mi novedad
- Como padre, necesito recibir notificación si hay un incidente en la ruta de mi hijo
- Como padre, necesito recibir notificación si cambian el vehículo durante el viaje

### Notificaciones - Interacción
- Como padre, necesito ver notificaciones con iconos según categoría y colores distintivos
- Como padre, necesito ver el tiempo relativo: hace 2 min, hace 1 hora, etc.
- Como padre, necesito marcar notificaciones individuales como leídas
- Como padre, necesito marcar todas como leídas
- Como padre, necesito que las notificaciones me lleven al contexto relacionado (mapa, novedad, etc.)

### Configuración - Cuenta
- Como padre, necesito ver mi nombre, email y teléfonos
- Como padre, necesito cambiar mi contraseña
- Como padre, necesito ver mis sesiones activas
- Como padre, necesito activar autenticación de dos factores

### Configuración - Preferencias
- Como padre, necesito seleccionar idioma: español o inglés
- Como padre, necesito seleccionar zona horaria: Ecuador o Colombia
- Como padre, necesito seleccionar formato de fecha
- Como padre, necesito seleccionar formato de hora: 12h o 24h

### Configuración - Mapa
- Como padre, necesito seleccionar tipo de vista: satélite, calles o terreno
- Como padre, necesito activar/desactivar auto-centrar en el vehículo
- Como padre, necesito activar/desactivar mostrar tráfico

### Configuración - Legal y Ayuda
- Como padre, necesito ver los términos y condiciones
- Como padre, necesito ver la política de privacidad
- Como padre, necesito ver la política de cookies
- Como padre, necesito acceder a preguntas frecuentes (FAQ)
- Como padre, necesito contactar a soporte
- Como padre, necesito ver la guía de uso

### Configuración - Sesión
- Como padre, necesito ver la versión de la aplicación
- Como padre, necesito cerrar sesión

### Funcionalidades Móviles
- Como padre, necesito instalar la aplicación en mi teléfono desde el navegador
- Como padre, necesito usar la aplicación de forma responsiva en cualquier dispositivo
- Como padre, necesito recibir notificaciones push en mi teléfono

---

## Funcionalidades Transversales

### Autenticación
- Como usuario, necesito iniciar sesión con email y contraseña
- Como usuario, necesito la opción "recordarme" para sesiones de 30 días
- Como usuario nuevo, necesito registrarme con código de invitación de 6 dígitos
- Como usuario nuevo, necesito verificar mi email con código de 6 dígitos (expira en 24h)
- Como usuario, necesito recuperar mi contraseña con código enviado por email (expira en 1h)
- Como usuario, necesito que mi cuenta se bloquee después de 5 intentos fallidos (30 min)

### Tiempo Real
- Como usuario, necesito que los datos se actualicen automáticamente sin refrescar la página
- Como usuario, necesito ver la ubicación del vehículo actualizada cada 15 segundos
- Como usuario, necesito recibir notificaciones instantáneas de eventos importantes

### Seguridad
- Como usuario, necesito que mis datos estén protegidos según mi rol
- Como usuario, necesito que todas las acciones verifiquen mis permisos
- Como usuario de una institución, necesito que solo vea datos de mi institución

### Accesibilidad
- Como usuario, necesito acceder desde computador, tablet o celular
- Como usuario, necesito una interfaz adaptada al tamaño de mi pantalla
- Como usuario, necesito que la aplicación esté en español con soporte para inglés
