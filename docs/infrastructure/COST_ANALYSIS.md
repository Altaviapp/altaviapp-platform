# Análisis de Costos de Infraestructura - Altaviapp
## Comparación de Stack Tecnológico para Caso Realista

**Versión:** 1.0
**Fecha:** Enero 2025
**Análisis realizado para:** Colegio grande (caso realista)

---

## 📊 Escenario Realista: Colegio Grande

### Características del Colegio

**Perfil del Cliente:**
- **Tipo:** Institución educativa privada grande
- **Ubicación:** Quito, Ecuador
- **Estudiantes:** 2,500 estudiantes
- **Rutas activas:** 25 rutas diarias
- **Vehículos:** 30 buses
- **Conductores:** 35 conductores (rotación y suplentes)
- **Personal administrativo:** 15 usuarios admin
- **Padres activos:** 2,000 usuarios (80% de engagement)

### Volúmenes de Datos y Operaciones

#### Base de Datos
- **Registros totales estimados:**
  - Estudiantes: 2,500 registros
  - Usuarios (padres + admin + conductores): ~2,050 registros
  - Vehículos: 30 registros
  - Rutas: 25 registros permanentes
  - Stops por ruta: ~15 stops × 25 rutas = 375 stops
  - Asignaciones estudiante-ruta: 2,500 registros

- **Datos operacionales diarios:**
  - Trips diarios: 50 viajes/día (25 rutas × 2 trayectos: ida y vuelta)
  - GPS tracking points: 50 trips × 60 min × 4 puntos/min = 12,000 puntos/día
  - Check-ins diarios: 2,500 estudiantes × 2 (entrada/salida) = 5,000 check-ins/día
  - Notificaciones: ~3,000 notificaciones/día (padres reciben alertas de llegada)

- **Almacenamiento estimado:**
  - Datos estructurados: ~500 MB iniciales
  - Crecimiento mensual GPS: ~200 MB/mes
  - Documentos/imágenes: ~2 GB/año
  - **Total primer año:** ~5 GB

#### Tráfico y Operaciones

**Monthly Active Users (MAU):**
- Padres activos: 1,800 MAU (90% engagement diario)
- Conductores: 35 MAU (100% engagement en días laborales)
- Administrativos: 15 MAU (100% engagement)
- **Total MAU:** 1,850 usuarios/mes

**Operaciones de Base de Datos (estimación mensual):**
- **Lecturas (Reads):**
  - Dashboard admin: 500 queries/día × 22 días = 11,000 queries/mes
  - Tracking en tiempo real: 50 trips × 60 min × 22 días = 66,000 queries/mes
  - Consultas de padres: 1,800 padres × 4 consultas/día × 22 días = 158,400 queries/mes
  - **Total lecturas:** ~240,000 reads/mes

- **Escrituras (Writes):**
  - GPS updates: 12,000 puntos/día × 22 días = 264,000 writes/mes
  - Check-ins: 5,000/día × 22 días = 110,000 writes/mes
  - Notificaciones: 3,000/día × 22 días = 66,000 writes/mes
  - **Total escrituras:** ~440,000 writes/mes

**Autenticación:**
- **Daily Active Users (DAU):** ~1,200 usuarios/día (65% de MAU)
- **Autenticaciones/mes:** 1,200 DAU × 22 días × 2 sesiones = ~52,800 auth requests/mes

**Real-time Connections:**
- Padres rastreando en tiempo real: ~300 conexiones simultáneas en horas pico
- Conductores activos: ~25 conexiones simultáneas
- Admin monitoring: ~5 conexiones simultáneas
- **Conexiones simultáneas pico:** ~330 conexiones

**Ancho de Banda:**
- GPS tracking data: ~50 KB/update × 12,000 updates/día = 600 MB/día
- API responses (padres): ~100 KB/consulta × 7,200 consultas/día = 720 MB/día
- **Total bandwidth:** ~30 GB/mes

---

## 💰 Comparación de Costos por Stack

### Opción 1: Stack Actual (Convex + Clerk)

#### Convex - Base de Datos y Backend

**Plan Recomendado:** Professional Plan

**Costos:**
- Plan base Professional: $25/mes
- Compute adicional estimado: ~$50-100/mes (para manejar 440k writes + real-time)
- Storage: 5 GB incluidos en plan pro
- Bandwidth: 100 GB incluidos

**Total Convex:** $75-125/mes

#### Clerk - Autenticación

**Plan Recomendado:** Pro Plan

**Costos:**
- Plan base Pro: $25/mes
- MAU adicionales: 1,850 MAU - 10,000 incluidos = 0 (dentro del límite)
- No hay cargos adicionales por autenticación

**Total Clerk:** $25/mes

#### Bubble.io - Frontend Admin y Parent Portal

**Plan Recomendado:** Professional Plan ($290/mes)

**Incluye:**
- Aplicaciones ilimitadas
- Capacidad suficiente para 1,850 usuarios
- Custom domain
- 10 GB bandwidth (suficiente para UI)

**Total Bubble.io:** $290/mes

#### Next.js PWA (Driver App) - Hosting

**Plataforma:** Vercel Pro

**Costos:**
- Plan Pro: $20/mes
- Bandwidth incluido: 100 GB
- Serverless functions incluidas

**Total Vercel:** $20/mes

#### Servicios Adicionales

**WhatsApp Business API:**
- 3,000 notificaciones/día × 22 días = 66,000 mensajes/mes
- Costo por mensaje en Ecuador: ~$0.01-0.02/mensaje
- **Total WhatsApp:** $660-1,320/mes

**Leaflet + OpenStreetMap:**
- Gratuito (open source)
- Self-hosted tiles o Mapbox gratuito hasta 50k requests
- **Total Maps:** $0/mes

---

### **TOTAL STACK ACTUAL (Convex + Clerk):**
- **Mínimo:** $1,070/mes ($75 Convex + $25 Clerk + $290 Bubble + $20 Vercel + $660 WhatsApp)
- **Promedio:** $1,280/mes
- **Máximo:** $1,730/mes (con picos de uso)

---

### Opción 2: Supabase + Supabase Auth

#### Supabase - Base de Datos, Auth y Backend

**Plan Recomendado:** Pro Plan

**Costos:**
- Plan base Pro: $25/mes
- Database: 8 GB incluidos (suficiente)
- MAU adicionales: 1,850 MAU - 100,000 incluidos = 0 (dentro del límite)
- Bandwidth: 50 GB incluidos
- Realtime: Incluido en Pro
- **Compute adicional estimado:** ~$50-80/mes (para manejar 440k writes)

**Total Supabase:** $75-105/mes

#### Bubble.io - Frontend

**Mismo costo que stack actual:**
- **Total Bubble.io:** $290/mes

#### Next.js PWA - Hosting

**Mismo costo que stack actual:**
- **Total Vercel:** $20/mes

#### Servicios Adicionales

**WhatsApp + Maps:**
- **Total:** $660/mes (mismo costo)

---

### **TOTAL SUPABASE STACK:**
- **Mínimo:** $1,045/mes
- **Promedio:** $1,120/mes
- **Máximo:** $1,455/mes

**Ahorro vs Stack Actual:** ~$25-275/mes (2-16%)

---

### Opción 3: Firebase (Google)

#### Firebase - Base de Datos, Auth y Backend

**Plan:** Blaze (Pay-as-you-go)

**Costos Firestore:**
- Writes: 440,000 writes/mes ÷ 100,000 × $0.18 = $0.79/mes
- Reads: 240,000 reads/mes ÷ 100,000 × $0.18 = $0.43/mes
- Storage: 5 GB × $0.26 = $1.30/mes
- **Total Firestore:** $2.52/mes

**Costos Authentication:**
- Verificaciones: 52,800 auth/mes - 10,000 gratis = 42,800 × $0.01/100 = $4.28/mes
- **Total Auth:** $4.28/mes

**Costos Real-time Database (para GPS tracking):**
- Storage: 3 GB × $5/GB = $15/mes
- Downloads: 10 GB × $1/GB = $10/mes
- **Total Realtime:** $25/mes

**Costos Cloud Functions:**
- Invocaciones: ~500k/mes × $0.40/millón = $0.20/mes
- Compute time: ~100 GB-s/mes × $0.0000025 = $0.25/mes
- **Total Functions:** $0.45/mes

**Total Firebase:** $32.25/mes

#### Bubble.io + Next.js + Adicionales

**Mismo costo que stack actual:**
- Bubble: $290/mes
- Vercel: $20/mes
- WhatsApp: $660/mes

---

### **TOTAL FIREBASE STACK:**
- **Mínimo:** $1,002.25/mes
- **Promedio:** $1,050/mes
- **Máximo:** $1,350/mes

**Ahorro vs Stack Actual:** ~$20-380/mes (2-22%)

---

### Opción 4: AWS (DynamoDB + RDS + Cognito)

#### DynamoDB - Base de Datos NoSQL

**Modo:** On-Demand

**Costos:**
- Write requests: 440,000 writes × $1.25/millón = $0.55/mes
- Read requests: 240,000 reads × $0.25/millón = $0.06/mes
- Storage: 5 GB × $0.25/GB = $1.25/mes
- **Total DynamoDB:** $1.86/mes

#### RDS PostgreSQL - Base de Datos Relacional

**Instancia:** db.t3.micro (2 vCPU, 1 GB RAM)

**Costos:**
- Instancia On-Demand: $0.017/hora × 730 horas = $12.41/mes
- Storage: 20 GB × $0.115/GB = $2.30/mes
- **Total RDS:** $14.71/mes

#### Cognito - Autenticación

**Plan:** Essentials Tier

**Costos:**
- MAU: 1,850 MAU - 10,000 gratis = 0
- Base rate: $0.015/MAU × 0 = $0
- **Total Cognito:** $0/mes (dentro de free tier)

#### Lambda - Serverless Functions

**Costos:**
- Requests: 500k requests × $0.20/millón = $0.10/mes
- Compute: 100 GB-s × $0.0000166667 = $1.67/mes
- **Total Lambda:** $1.77/mes

#### API Gateway

**Costos:**
- API calls: 500k calls × $3.50/millón = $1.75/mes
- **Total API Gateway:** $1.75/mes

#### Total AWS Backend: $20.09/mes

#### Bubble.io + Next.js + Adicionales

**Mismo costo que stack actual:**
- Bubble: $290/mes
- Vercel: $20/mes (o Lambda@Edge en AWS)
- WhatsApp: $660/mes

---

### **TOTAL AWS STACK:**
- **Mínimo:** $990/mes
- **Promedio:** $1,100/mes
- **Máximo:** $1,450/mes (con RDS escalado)

**Ahorro vs Stack Actual:** ~$80-740/mes (6-43%)

---

### Opción 5: Google Cloud Platform (GCP)

#### Cloud SQL - Base de Datos PostgreSQL

**Instancia:** db-f1-micro (0.6 GB RAM, shared vCPU)

**Costos:**
- Instancia: $7.67/mes (30-day estimate)
- Storage: 10 GB × $0.17/GB = $1.70/mes
- Backups: 10 GB × $0.08/GB = $0.80/mes
- **Total Cloud SQL:** $10.17/mes

#### Firestore - Base de Datos NoSQL (para real-time)

**Costos:**
- Writes: 440,000 ÷ 100,000 × $0.18 = $0.79/mes
- Reads: 240,000 ÷ 100,000 × $0.06 = $0.14/mes
- Storage: 2 GB × $0.26 = $0.52/mes
- **Total Firestore:** $1.45/mes

#### Identity Platform (Firebase Auth en GCP)

**Costos:**
- MAU: 1,850 - 10,000 gratis = 0
- **Total Auth:** $0/mes

#### Cloud Functions

**Costos:**
- Invocations: 500k × $0.40/millón = $0.20/mes
- Compute: 100 GB-s × $0.0000025 = $0.25/mes
- **Total Functions:** $0.45/mes

#### Cloud Storage

**Costos:**
- Storage: 5 GB × $0.02/GB = $0.10/mes
- Operations: mínimo
- **Total Storage:** $0.15/mes

#### Total GCP Backend: $12.22/mes

#### Bubble.io + Next.js + Adicionales

**Mismo costo:**
- Bubble: $290/mes
- Cloud Run (alternativa a Vercel): $10-20/mes
- WhatsApp: $660/mes

---

### **TOTAL GCP STACK:**
- **Mínimo:** $972/mes
- **Promedio:** $1,050/mes
- **Máximo:** $1,400/mes

**Ahorro vs Stack Actual:** ~$80-758/mes (6-44%)

---

## 📈 Tabla Comparativa Resumida

| Stack | Costo Mínimo/Mes | Costo Promedio/Mes | Costo Máximo/Mes | Ahorro vs Actual |
|-------|------------------|--------------------|--------------------|------------------|
| **Actual (Convex + Clerk)** | $1,070 | $1,280 | $1,730 | - (baseline) |
| **Supabase** | $1,045 | $1,120 | $1,455 | 2-16% |
| **Firebase** | $1,002 | $1,050 | $1,350 | 2-22% |
| **AWS** | $990 | $1,100 | $1,450 | 6-43% |
| **GCP** | $972 | $1,050 | $1,400 | 6-44% |

---

## 🔍 Análisis Detallado por Dimensión

### 1. Costos de Backend (DB + Auth + Functions)

| Stack | Backend Base | Real-time | Escalabilidad |
|-------|--------------|-----------|---------------|
| **Convex + Clerk** | $100/mes | Incluido nativo | Automática |
| **Supabase** | $75/mes | Incluido nativo | Automática |
| **Firebase** | $32/mes | $25/mes adicional | Automática |
| **AWS** | $20/mes | Requiere DynamoDB Streams + Lambda | Manual |
| **GCP** | $12/mes | Firestore $1.45/mes | Semi-automática |

**Observación:** Firebase y GCP son significativamente más baratos en backend puro, pero el stack actual ofrece mejor DX (Developer Experience).

---

### 2. Costos de Autenticación

| Stack | Auth Incluida | Costo/MAU | Gratis hasta |
|-------|---------------|-----------|--------------|
| **Clerk** | $25/mes | $0.02 después de 10k | 10,000 MAU |
| **Supabase Auth** | Incluido en Pro | $0.00325 después de 100k | 100,000 MAU |
| **Firebase Auth** | Pay-as-you-go | $0.01/100 verif | 10,000 verif/mes |
| **AWS Cognito** | Essentials | $0.015 después de 10k | 10,000 MAU |
| **GCP Identity** | Gratis | $0 | Sin límite básico |

**Observación:** Para 1,850 MAU, todos están dentro del free tier. Clerk ofrece mejor UX pero más caro a largo plazo.

---

### 3. Real-time Capabilities

| Stack | Solución Real-time | Costo Adicional | Complejidad |
|-------|-------------------|-----------------|-------------|
| **Convex** | Live Queries nativo | Incluido | Baja (built-in) |
| **Supabase** | Realtime Subscriptions | Incluido | Baja (built-in) |
| **Firebase** | Firestore onSnapshot | Incluido (lecturas) | Media |
| **AWS** | DynamoDB Streams + Lambda | ~$2-5/mes | Alta |
| **GCP** | Firestore listeners | Incluido (lecturas) | Media |

**Observación:** Convex y Supabase tienen la mejor experiencia real-time out-of-the-box.

---

### 4. Developer Experience (DX)

| Stack | Curva de Aprendizaje | TypeScript | Documentación | Comunidad |
|-------|---------------------|------------|---------------|-----------|
| **Convex** | Baja (muy intuitivo) | Nativo | Excelente | Pequeña pero activa |
| **Supabase** | Media | Buen soporte | Excelente | Grande y activa |
| **Firebase** | Media | Buen soporte | Excelente | Muy grande |
| **AWS** | Alta (complejo) | Manual setup | Exhaustiva | Enorme |
| **GCP** | Alta (complejo) | Manual setup | Buena | Grande |

**Observación:** Convex tiene el mejor DX para TypeScript-first development.

---

### 5. Vendor Lock-in

| Stack | Portabilidad | Migración a SQL | Costo de Salida |
|-------|--------------|----------------|-----------------|
| **Convex** | Baja (propietario) | Difícil | Alto |
| **Supabase** | Alta (PostgreSQL) | Nativo | Bajo |
| **Firebase** | Baja (propietario) | Difícil | Medio |
| **AWS** | Media | DynamoDB difícil, RDS fácil | Medio |
| **GCP** | Media | Firestore difícil, SQL fácil | Medio |

**Observación:** Supabase es el menos "locked-in" por usar PostgreSQL estándar.

---

## 🎯 Análisis de Escalabilidad

### Escenario de Crecimiento: 10 Colegios (25,000 estudiantes)

**Volúmenes multiplicados por 10:**
- MAU: 18,500
- Writes: 4.4M/mes
- Reads: 2.4M/mes
- Storage: 50 GB
- Bandwidth: 300 GB/mes

| Stack | Costo 1 Colegio | Costo 10 Colegios | Costo por Colegio |
|-------|-----------------|-------------------|-------------------|
| **Convex + Clerk** | $1,280/mes | $2,500-3,000/mes | $250-300/mes |
| **Supabase** | $1,120/mes | $2,200-2,800/mes | $220-280/mes |
| **Firebase** | $1,050/mes | $1,800-2,200/mes | $180-220/mes |
| **AWS** | $1,100/mes | $1,500-2,000/mes | $150-200/mes |
| **GCP** | $1,050/mes | $1,400-1,900/mes | $140-190/mes |

**Observación:** GCP y AWS se vuelven más competitivos a escala, pero requieren más DevOps.

---

## ⚖️ Matriz de Decisión

### Factores Clave

| Factor | Peso | Convex + Clerk | Supabase | Firebase | AWS | GCP |
|--------|------|----------------|----------|----------|-----|-----|
| **Costo Mensual** | 20% | 3/10 | 5/10 | 7/10 | 8/10 | 9/10 |
| **Developer Experience** | 25% | 10/10 | 8/10 | 7/10 | 4/10 | 4/10 |
| **Real-time Nativo** | 20% | 10/10 | 9/10 | 7/10 | 5/10 | 7/10 |
| **Escalabilidad** | 15% | 9/10 | 8/10 | 9/10 | 10/10 | 10/10 |
| **Vendor Lock-in** | 10% | 3/10 | 9/10 | 4/10 | 6/10 | 6/10 |
| **Comunidad/Soporte** | 10% | 6/10 | 8/10 | 9/10 | 10/10 | 9/10 |
| **TOTAL PONDERADO** | 100% | **7.5/10** | **7.9/10** | **7.4/10** | **6.9/10** | **7.2/10** |

---

## 💡 Recomendaciones

### Recomendación Principal: **Mantener Stack Actual (Convex + Clerk)**

**Razones:**
1. **Developer Experience Superior:** El tiempo de desarrollo es más valioso que $200/mes de ahorro
2. **Real-time Nativo:** Convex maneja GPS tracking y live queries sin complejidad adicional
3. **TypeScript-First:** Integración perfecta con el código base actual
4. **Menor Deuda Técnica:** No requiere manejo manual de conexiones WebSocket o polling
5. **Ya Implementado:** Costo de migración > ahorro mensual (al menos 6-12 meses)

**Costo-Beneficio:**
- Ahorro potencial máximo: $300/mes (vs GCP)
- Costo de migración estimado: 80-120 horas desarrollo = $4,000-6,000 USD
- Break-even: 13-20 meses

---

### Alternativa Recomendada: **Supabase (si se migra)**

**Si decidieras cambiar de stack, Supabase es la mejor opción:**

**Pros:**
- Ahorro: ~$150/mes (12% menos que actual)
- DX casi tan bueno como Convex
- PostgreSQL estándar (sin vendor lock-in)
- Real-time incluido y bien implementado
- Gran comunidad y documentación

**Cons:**
- Requiere migración de schema
- Real-time menos "mágico" que Convex
- Menos optimizado para TypeScript

**Cuándo considerar el cambio:**
- Al implementar un nuevo módulo grande
- Al llegar a 5-10 colegios (economía de escala)
- Si necesitas SQL avanzado (reports, analytics)

---

### NO Recomendado Ahora: **AWS o GCP**

**Por qué NO cambiar a AWS/GCP:**
1. **Complejidad innecesaria:** Requiere DevOps dedicado
2. **Costo de desarrollo:** El ahorro en infra se pierde en horas de configuración
3. **Real-time complejo:** DynamoDB Streams + Lambda es frágil
4. **Overkill para 1-5 colegios:** Estos stacks brillan a escala enterprise (50+ colegios)

**Cuándo reconsiderar AWS/GCP:**
- Al superar 50 colegios (economía de escala real)
- Al requerir compliance específico (HIPAA, SOC2)
- Al tener equipo DevOps dedicado

---

## 📋 Plan de Acción Recomendado

### Fase 1: Optimización del Stack Actual (Mes 1-2)

1. **Auditar uso de Convex:**
   - Identificar queries costosas
   - Implementar caching donde sea posible
   - Optimizar índices

2. **Reducir costos de WhatsApp:**
   - Implementar lógica de notificaciones inteligentes
   - Agrupar mensajes donde sea posible
   - Ofrecer alternativa email (gratis)
   - **Ahorro potencial:** $200-400/mes

3. **Optimizar Bubble.io:**
   - Revisar si necesitas Professional o si Growth ($190/mes) es suficiente
   - **Ahorro potencial:** $100/mes

**Ahorro total Fase 1:** $300-500/mes sin cambiar de stack

---

### Fase 2: Evaluación de Cambio (Mes 3-6)

**Criterios para considerar migración a Supabase:**
- [ ] Tienes 3+ colegios confirmados (economía de escala)
- [ ] Necesitas SQL avanzado para reports
- [ ] Equipo domina PostgreSQL
- [ ] Presupuesto ajustado (<$1,000/mes infra)

**Si 3+ criterios se cumplen:** Planear migración gradual

---

### Fase 3: Migración Gradual (si aplica, Mes 6-12)

1. **Nuevo módulo en Supabase:** Implementar siguiente módulo grande en Supabase
2. **Dual-stack temporal:** Mantener ambos stacks en paralelo
3. **Migración incremental:** Mover módulo por módulo
4. **Deprecar Convex:** Una vez todo esté migrado

---

## 📊 Conclusión Ejecutiva

### Para 1 Colegio Grande (escenario actual):

**MANTENER STACK ACTUAL (Convex + Clerk)**
- **Costo:** $1,280/mes promedio
- **Ventaja:** DX superior, real-time nativo, menos deuda técnica
- **Optimización:** Reducir WhatsApp y revisar plan Bubble = ahorro de $300-500/mes

### Para 5+ Colegios (escalabilidad):

**CONSIDERAR MIGRACIÓN A SUPABASE**
- **Costo:** $1,120/mes por colegio → $5,600/mes para 5 colegios
- **Ahorro:** ~$800/mes vs Convex (12%)
- **Ventaja:** PostgreSQL estándar, sin vendor lock-in

### Para 50+ Colegios (escala enterprise):

**MIGRAR A AWS o GCP**
- **Costo:** ~$1,000/mes por colegio → $50,000/mes para 50 colegios
- **Ahorro:** ~$15,000/mes vs Convex (23%)
- **Requisito:** Equipo DevOps dedicado

---

## 🚀 Próximos Pasos

1. ✅ Implementar optimizaciones de Fase 1 (costo = $0, ahorro = $300-500/mes)
2. 📊 Monitorear uso real de Convex durante 3 meses
3. 🔍 Reevaluar cuando tengas 3+ colegios confirmados
4. 📝 Documentar patrones de uso para facilitar futura migración

---

**Última actualización:** Enero 2025
**Próxima revisión:** Abril 2025 (o al conseguir cliente #3)
