# Bubble.io Authentication Setup - Altaviapp

**Guía Completa para Configurar Autenticación en Bubble.io**
**Sin Plugins - Usando API REST Nativa**

---

## 🎯 Objetivo

Configurar un sistema de autenticación completo en Bubble.io que se conecta a tu backend Convex usando REST APIs, sin necesidad de plugins de terceros.

---

## ⚡ Importante: Cómo Funciona la Sesión en Bubble

### ❌ NO Necesitas Cookies o localStorage

Bubble.io tiene su propio sistema de sesión nativo que funciona automáticamente:

- ✅ **"Log the user in"** crea una sesión de **12 meses** automáticamente
- ✅ **Current User** está disponible en todas las páginas
- ✅ La sesión persiste en navegación y refresh automáticamente
- ✅ El token de Convex se guarda en el campo `token` del User

### 🔑 Flujo de Autenticación

```
1. Usuario hace login → API de Convex valida credenciales
2. Convex retorna token → Se guarda en User.token field
3. "Log the user in" (Bubble) → Crea sesión de 12 meses
4. Para API calls → Usa Current User's token del campo
```

### 💡 Lo Que Debes Saber

- **NO uses cookies** - Bubble no puede leerlas confiablemente
- **NO uses localStorage** - Bubble no tiene acceso nativo
- **SÍ usa "Current User"** - Bubble lo mantiene automáticamente
- **SÍ guarda el token en el User** - Para usarlo en API calls

---

## 📋 Prerequisitos

- ✅ Cuenta de Bubble.io activa
- ✅ Backend Convex desplegado: `https://abundant-mastiff-673.convex.site`
- ✅ Plugin "API Connector" instalado en Bubble

---

## 🔧 Parte 1: Configurar API Connector

### Paso 1: Instalar API Connector

1. En el editor de Bubble, ve a: **Plugins**
2. Busca: **API Connector**
3. Haz clic en: **Install**

### Paso 2: Crear Nueva API

1. Abre: **Plugins** → **API Connector**
2. Haz clic en: **Add another API**
3. **API Name**: `Altaviapp Auth API`

### Paso 3: Configurar Headers Compartidos

En la sección **Shared headers for all calls**:

```
Key: Content-Type
Value: application/json

Key: Accept
Value: application/json
```

---

## 🔑 Parte 2: Configurar Endpoints de Autenticación

### Endpoint 1: Registro de Usuario (Sign Up)

**Configuración:**
- **Name**: `Register User`
- **Use as**: Action
- **Data type**: JSON
- **Method**: POST
- **URL**: `https://abundant-mastiff-673.convex.site/auth/register`

**Body type**: JSON

**Body**:
```json
{
  "email": "test@example.com",
  "password": "Password123",
  "name": "Test User",
  "phone": "+593987654321",
  "role": "parent"
}
```

**Parámetros a configurar:**
- `email` - **private** - Type: text
- `password` - **private** - Type: text
- `name` - **private** - Type: text
- `phone` - **private** - Type: text (optional)
- `role` - **private** - Type: text (optional, default: "parent")

**Haz clic en**: **Initialize call**

**Respuesta esperada:**
```json
{
  "success": true,
  "userId": "kh7br53dnk4ymje6kskv9f0vw97v82gq",
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "user": {
    "id": "kh7br53dnk4ymje6kskv9f0vw97v82gq",
    "email": "test@example.com",
    "name": "Test User",
    "role": "parent"
  }
}
```

---

### Endpoint 2: Inicio de Sesión (Login)

**Configuración:**
- **Name**: `Login User`
- **Use as**: Action
- **Data type**: JSON
- **Method**: POST
- **URL**: `https://abundant-mastiff-673.convex.site/auth/login`

**Body type**: JSON

**Body**:
```json
{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Parámetros a configurar:**
- `email` - **private** - Type: text
- `password` - **private** - Type: text

**Haz clic en**: **Initialize call**

**Respuesta esperada:**
```json
{
  "success": true,
  "userId": "kh7br53dnk4ymje6kskv9f0vw97v82gq",
  "token": "a2g3YnI1M2RuazR5bWplNms...",
  "user": {
    "id": "kh7br53dnk4ymje6kskv9f0vw97v82gq",
    "email": "test@example.com",
    "name": "Test User",
    "role": "parent"
  }
}
```

---

### Endpoint 3: Obtener Usuario Actual (Get Current User)

**Configuración:**
- **Name**: `Get Current User`
- **Use as**: Data
- **Data type**: JSON
- **Method**: GET
- **URL**: `https://abundant-mastiff-673.convex.site/auth/me?token=a2g3YnI1M2RuazR5bWplNms...`

**Parámetros a configurar:**
- `token` - **private** - Type: text

**Haz clic en**: **Initialize call**

**Respuesta esperada:**
```json
{
  "success": true,
  "user": {
    "id": "kh7br53dnk4ymje6kskv9f0vw97v82gq",
    "email": "test@example.com",
    "name": "Test User",
    "role": "parent",
    "institutionId": null,
    "createdAt": 1762983038855
  }
}
```

---

### Endpoint 4: Cerrar Sesión (Logout)

**Configuración:**
- **Name**: `Logout User`
- **Use as**: Action
- **Data type**: JSON
- **Method**: POST
- **URL**: `https://abundant-mastiff-673.convex.site/auth/logout`

**Body type**: JSON

**Body**:
```json
{
  "token": "a2g3YnI1M2RuazR5bWplNms..."
}
```

**Parámetros a configurar:**
- `token` - **private** - Type: text

**Haz clic en**: **Initialize call**

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 💾 Parte 3: Configurar Base de Datos en Bubble

### Crear Tipo de Dato: User (Si no existe)

1. Ve a: **Data** → **Data types**
2. Clic en: **New type**
3. **Name**: `User`

**Campos a crear:**

| Field Name | Field Type | Notes |
|------------|------------|-------|
| `email` | text | Unique |
| `name` | text | |
| `role` | text | parent, admin, driver, super_admin |
| `token` | text | Session token from API |
| `convex_user_id` | text | ID from Convex |
| `institution_id` | text | Optional |

---

## 🎨 Parte 4: Crear Páginas de Autenticación

### Página: Sign Up (Registro)

**Elementos UI:**

1. **Input**: Email
   - Placeholder: "correo@ejemplo.com"
   - Type: email

2. **Input**: Password
   - Type: password
   - Placeholder: "Contraseña (mínimo 8 caracteres)"

3. **Input**: Name
   - Placeholder: "Nombre completo"

4. **Input**: Phone (opcional)
   - Placeholder: "+593987654321"

5. **Button**: "Registrarse"

**Workflow del botón "Registrarse":**

**Step 1: Call API - Register User**
- API: `Altaviapp Auth API - Register User`
- email: `Input Email's value`
- password: `Input Password's value`
- name: `Input Name's value`
- phone: `Input Phone's value`
- role: "parent" (o dinámico según tipo de usuario)

**Step 2: Create a new User** (Solo cuando Result of Step 1's success is "yes")
- email = `Result of Step 1's user email`
- name = `Result of Step 1's user name`
- role = `Result of Step 1's user role`
- token = `Result of Step 1's token`
- convex_user_id = `Result of Step 1's userId`

**Step 3: Log the user in**
- User: `Result of Step 2 (User)`
- Keep the user logged in: **Yes** (sesión dura 12 meses)

**Step 4: Navigate to Dashboard**
- Destination: `Dashboard` page

> **💡 Nota Importante**: NO necesitas cookies!
> Bubble maneja la sesión automáticamente cuando usas "Log the user in".
> El token se guarda en el campo `token` del User para usarlo en API calls.

**Error Handling:**
- Add: **Show alert** cuando `Result of Step 1's success` is "no"
- Message: `Result of Step 1's error`

---

### Página: Login (Inicio de Sesión)

**Elementos UI:**

1. **Input**: Email
   - Placeholder: "correo@ejemplo.com"
   - Type: email

2. **Input**: Password
   - Type: password
   - Placeholder: "Contraseña"

3. **Button**: "Iniciar Sesión"

4. **Link**: "¿No tienes cuenta? Regístrate"
   - Navigate to: Sign Up page

**Workflow del botón "Iniciar Sesión":**

**Step 1: Call API - Login User**
- API: `Altaviapp Auth API - Login User`
- email: `Input Email's value`
- password: `Input Password's value`

**Step 2: Search for User** (Solo cuando Result of Step 1's success is "yes")
- Type: User
- Constraints: `convex_user_id` = `Result of Step 1's userId`

**Step 3a: Update User** (If user found in Step 2)
- User: `Result of Step 2 (User)`
- token = `Result of Step 1's token`

**Step 3b: Create User** (If user NOT found in Step 2)
- email = `Result of Step 1's user email`
- name = `Result of Step 1's user name`
- role = `Result of Step 1's user role`
- token = `Result of Step 1's token`
- convex_user_id = `Result of Step 1's userId`

**Step 4: Log the user in**
- User: `Result of Step 2 or Step 3b`
- Keep the user logged in: **Yes** (sesión dura 12 meses)

**Step 5: Navigate to Dashboard**
- Destination: `Dashboard` page

> **💡 Nota Importante**: NO necesitas cookies!
> El token ya está guardado en `Current User's token` field.
> Bubble mantiene la sesión automáticamente.

**Error Handling:**
- Add: **Show alert** cuando `Result of Step 1's success` is "no"
- Message: `Result of Step 1's error`

---

### Página: Dashboard (Área Protegida)

**Workflow "Page is loaded":**

**Step 1: Redirect to Login (when user is NOT logged in)**
- Only when: `Current User is logged out`
- Destination: `Login` page

> **💡 Cómo Funciona**:
> - Bubble automáticamente mantiene `Current User` en todas las páginas
> - NO necesitas verificar cookies o tokens manualmente
> - Solo verifica si `Current User is logged out` → redirect

**Opcional - Verificar Token Válido:**

Si quieres validar que el token de Convex sigue válido:

**Step 2: Call API - Get Current User** (opcional)
- API: `Altaviapp Auth API - Get Current User`
- token: `Current User's token`

**Step 3: Handle expired token** (cuando Step 2 falla)
- Show alert: "Tu sesión ha expirado"
- Log the user out
- Navigate to Login

> **Nota**: Esta validación es opcional. Puedes validar el token cuando hagas la primera llamada API.

**Elementos UI en Dashboard:**

1. **Text**: "Bienvenido, `Current User's name`"
2. **Text**: "Rol: `Current User's role`"
3. **Button**: "Cerrar Sesión"

**Workflow del botón "Cerrar Sesión":**

**Step 1: Call API - Logout User** (opcional)
- API: `Altaviapp Auth API - Logout User`
- token: `Current User's token`

> **Nota**: Este paso es opcional. Invalida el token en Convex.
> Si no lo llamas, el token seguirá válido hasta que expire (30 días).

**Step 2: Log the user out**
- Esta acción de Bubble invalida la sesión automáticamente

**Step 3: Navigate to Login**
- Destination: `Login` page

> **💡 Simple**: Bubble maneja todo automáticamente.
> NO necesitas cookies! "Log the user out" limpia la sesión.

---

## 🔐 Parte 5: Validación y Seguridad

### Validaciones en el Frontend (Bubble)

**En Sign Up Page:**

1. **Email validation**:
   - Add condition to button: Email Input's value is not empty
   - Add condition: Email Input's value is valid email

2. **Password validation**:
   - Add condition: Password Input's length >= 8
   - Add condition: Password contains letters and numbers (usar regex si necesario)

3. **Name validation**:
   - Add condition: Name Input's value is not empty

4. **Phone validation** (opcional):
   - Add condition: Phone Input matches pattern `+593XXXXXXXXX`
   - Usar regex: `^\+593\d{9}$`

**En Login Page:**

1. **Email validation**:
   - Add condition: Email Input's value is not empty
   - Add condition: Email Input's value is valid email

2. **Password validation**:
   - Add condition: Password Input's value is not empty

### Privacy Rules (Importante)

1. Ve a: **Data** → **Privacy**
2. Para tipo `User`:
   - **View all fields**: Solo cuando `This User` is `Current User`
   - **Modify all fields**: Solo cuando `This User` is `Current User`

---

## 🔗 Parte 5.5: Usando Tokens para API Calls Autenticadas

### ¿Cómo Funcionan las Llamadas API Autenticadas?

Cuando un usuario está autenticado en Bubble, el token de Convex está guardado en `Current User's token`. Debes incluir este token en todas las llamadas API que requieran autenticación.

### Configurar API Call con Autenticación

**Ejemplo: Get Vehicles (Lista de Vehículos)**

1. En **API Connector**, agrega nuevo call:
   - **Name**: `Get Vehicles`
   - **Use as**: Data
   - **Method**: GET
   - **URL**: `https://abundant-mastiff-673.convex.site/vehicles`

2. En **Headers**, agrega:
   - **Key**: `Authorization`
   - **Value type**: Private
   - **Value**: `Bearer <token>`

3. Agrega parámetro:
   - **Name**: `token`
   - **Type**: text
   - **Private**: Yes

4. Al hacer la llamada desde workflow:
   - token: `Current User's token`

### Ejemplo de Workflow con API Autenticada

**Scenario**: Cargar lista de vehículos en página

**Workflow "Page is loaded":**

**Step 1: Get Vehicles**
- API: `Get Vehicles`
- token: `Current User's token`

**Step 2: Display results**
- Repeating Group: `Result of Step 1's vehicles`

### Manejo de Errores de Autenticación

Si la API retorna error 401 (No autorizado):

**Causas comunes**:
1. Token expirado (30 días)
2. Token inválido
3. Usuario no autenticado

**Solución**:

```
When Result of API call has error 401:
1. Show alert: "Tu sesión ha expirado"
2. Log the user out
3. Navigate to Login page
```

### Ejemplo Completo: CRUD de Vehículos con Auth

**Crear Vehículo:**
```
API: POST /vehicles
Headers: Authorization: Bearer <Current User's token>
Body: {
  "licensePlate": "ABC-123",
  "brand": "Toyota",
  "model": "Hiace",
  ...
}
```

**Leer Vehículos:**
```
API: GET /vehicles
Headers: Authorization: Bearer <Current User's token>
```

**Actualizar Vehículo:**
```
API: PUT /vehicles/:id
Headers: Authorization: Bearer <Current User's token>
Body: {Updated data}
```

**Eliminar Vehículo:**
```
API: DELETE /vehicles/:id
Headers: Authorization: Bearer <Current User's token>
```

> **💡 Pro Tip**: Crea un "Reusable Element" para manejo de errores de API que automáticamente redirija al login si el token expira.

---

## ⏰ Parte 5.6: Manejo de Expiración de Tokens

### Duración de Tokens

Los tokens de Convex duran **30 días** desde su creación.

### Estrategias para Manejar Expiración

#### Opción 1: Re-login Automático (Recomendado)

**Workflow global "When API returns 401":**

```
Step 1: Check if error is 401
Step 2: Show alert: "Tu sesión ha expirado. Redirigiendo a login..."
Step 3: Log the user out
Step 4: Navigate to Login page
```

El usuario simplemente hace login de nuevo y obtiene un nuevo token.

#### Opción 2: Refresh Token (Avanzado)

Requiere implementar un sistema de refresh tokens en Convex:

1. Al hacer login, Convex retorna:
   - `accessToken` (dura 1 hora)
   - `refreshToken` (dura 30 días)

2. Cuando accessToken expira:
   - Llama endpoint `/auth/refresh` con refreshToken
   - Obtén nuevo accessToken
   - Actualiza `Current User's token`

> **Nota**: Esta opción requiere modificar el backend de Convex.

#### Opción 3: Validación Proactiva

**Workflow "Page is loaded" (en páginas críticas):**

```
Step 1: Call API Get Current User
- token: Current User's token

Step 2: If Step 1 fails (401):
- Show alert: "Por favor inicia sesión nuevamente"
- Log the user out
- Navigate to Login
```

### Recomendación

Para MVP y simplicidad: **Usa Opción 1**.

- Los usuarios hacen login cada 30 días máximo
- Si usan la app regularmente, la sesión de Bubble (12 meses) los mantiene autenticados
- Solo necesitan re-login si el token de Convex expira

### Buenas Prácticas

1. **Manejo de errores consistente**: Crea un reusable element para manejar 401
2. **Mensajes claros**: "Tu sesión ha expirado" es mejor que "Error 401"
3. **No guardes contraseñas**: NUNCA guardes la contraseña del usuario para re-login automático
4. **Monitoreo**: Revisa logs para ver cuántos usuarios experimentan expiración

---

## 🎭 Parte 6: Roles de Usuario

### Tipos de Roles

| Rol | Nivel | Descripción | Acceso |
|-----|-------|-------------|--------|
| `parent` | 10 | Padre de familia | Solo ver datos de sus hijos |
| `driver` | 100 | Conductor | Gestionar viajes y check-ins |
| `admin` | 500 | Administrador escuela | Gestionar su institución |
| `super_admin` | 1000 | Super administrador | Acceso total plataforma |

### Implementar RBAC en Bubble

**Crear Reusable Element: "Protected Page"**

Workflow: "Page is loaded"

```
Step 1: Get Current User's role
Step 2: If role != required_role:
  - Show alert: "No tienes permisos para esta página"
  - Navigate to Dashboard
```

**Ejemplo de uso:**

En página "Admin Panel":
1. Add condition: `Current User's role` is not "admin" or "super_admin"
2. Action: Navigate to Dashboard

---

## 🧪 Parte 7: Testing

### Test 1: Registro de Usuario

1. Ve a Sign Up page
2. Completa el formulario:
   - Email: `test@altaviapp.com`
   - Password: `Test1234`
   - Name: `Usuario de Prueba`
   - Phone: `+593987654321`
3. Haz clic en "Registrarse"
4. ✅ Debes ver el Dashboard
5. ✅ El nombre debe aparecer en pantalla

### Test 2: Login

1. Abre una ventana de incógnito
2. Ve a Login page
3. Ingresa:
   - Email: `test@altaviapp.com`
   - Password: `Test1234`
4. Haz clic en "Iniciar Sesión"
5. ✅ Debes ver el Dashboard

### Test 3: Sesión Persistente

1. Recarga la página Dashboard
2. ✅ Debes permanecer autenticado
3. ✅ No te debe redirigir al login

### Test 4: Logout

1. En Dashboard, haz clic en "Cerrar Sesión"
2. ✅ Debes ser redirigido a Login
3. Intenta navegar a Dashboard manualmente
4. ✅ Debes ser redirigido a Login automáticamente

### Test 5: Validaciones

1. Intenta registrarte con email inválido
2. ✅ El botón debe estar deshabilitado o mostrar error
3. Intenta con contraseña de menos de 8 caracteres
4. ✅ El botón debe estar deshabilitado o mostrar error

---

## 📊 Parte 8: Debugging

### Ver API Calls en Bubble

1. En el editor, haz clic en el botón **Preview**
2. Abre Developer Tools (F12)
3. Ve a **Network** tab
4. Filtra por: `convex.site`
5. Verás todas las llamadas a tu API

### Ver Respuestas de API

En cada request:
- **Request**: Verifica que los parámetros sean correctos
- **Response**: Verifica que `success` sea `true`
- **Status Code**:
  - 200 = OK
  - 400 = Error en request (validación falló)
  - 401 = No autenticado
  - 500 = Error en servidor

### Troubleshooting Común

**Error: "Invalid email format"**
- Solución: Verifica que el email tenga formato válido

**Error: "Password must be at least 8 characters"**
- Solución: Usa contraseña más larga con letras y números

**Error: "User with this email already exists"**
- Solución: Usa un email diferente o haz login

**Error: "Invalid email or password"**
- Solución: Verifica las credenciales

**Error: "Session not found or expired"**
- Solución: Haz login nuevamente

**Error: "Session expired"**
- Solución: Las sesiones duran 30 días. Haz login nuevamente.

---

## 🔄 Parte 9: Sincronización de Datos

### Cuando Crear Usuario en Bubble vs Convex

**Flujo correcto:**

1. **Sign Up**:
   - Usuario completa formulario en Bubble
   - Bubble llama API `Register User` en Convex
   - Convex crea usuario y retorna datos
   - Bubble crea usuario local con datos de Convex
   - **Resultado**: Usuario existe en ambos sistemas

2. **Login**:
   - Usuario ingresa credenciales en Bubble
   - Bubble llama API `Login User` en Convex
   - Convex valida y retorna token + datos
   - Bubble busca usuario local por `convex_user_id`
   - Si no existe, lo crea
   - **Resultado**: Usuario sincronizado

### Mantener Token Actualizado

Los tokens duran **30 días**. Para renovar:

**Option 1: Renovar en cada login**
- Cada vez que el usuario hace login, obtiene nuevo token
- El token viejo se invalida automáticamente

**Option 2: Renovar antes de expirar**
- Implementa un workflow que verifique el token periódicamente
- Si está cerca de expirar, llama a `Login User` con credenciales guardadas

---

## 📱 Parte 10: Responsive Design

### Mobile-Friendly

1. En Bubble editor, habilita **Responsive design**
2. Ajusta elementos para móvil:
   - Inputs más grandes
   - Botones más espaciados
   - Texto más legible

### PWA (Progressive Web App)

1. Instala plugin: **Progressive Web App**
2. Configura:
   - App name: "Altaviapp"
   - Icon: Logo de Altaviapp
   - Theme color: `#000000`

---

## ✅ Checklist Final

Antes de lanzar a producción, verifica:

- [ ] API Connector configurado con todos los endpoints
- [ ] Sign Up page creada con validaciones
- [ ] Login page creada con manejo de errores
- [ ] Dashboard con protección de ruta (redirect si logged out)
- [ ] Logout funcional
- [ ] Token guardado en User field para API calls
- [ ] Privacy rules configuradas
- [ ] RBAC implementado para diferentes roles
- [ ] Manejo de expiración de tokens (401 errors)
- [ ] Testing completo en desktop
- [ ] Testing completo en móvil
- [ ] Error messages en español
- [ ] Responsive design verificado

---

## 🚀 Próximos Pasos

Una vez completada la autenticación, continúa con:

1. **Crear páginas por rol**:
   - Admin Dashboard
   - Parent Portal
   - Driver App (opcional en Bubble, ya tienes PWA)

2. **Implementar funcionalidades**:
   - Gestión de estudiantes
   - Gestión de vehículos
   - Gestión de rutas
   - Tracking en tiempo real
   - Reportes e incidencias

3. **Conectar más APIs**:
   - Students API
   - Vehicles API
   - Routes API
   - Trips API
   - GPS Tracking API

---

## 📞 Soporte

**API Base URL**: `https://abundant-mastiff-673.convex.site`

**Endpoints Disponibles**:
- `POST /auth/register` - Registro
- `POST /auth/login` - Login
- `GET /auth/me?token=<token>` - Obtener usuario actual
- `POST /auth/logout` - Cerrar sesión

**Documentación API**: `GET /api`

**Health Check**: `GET /health`

---

**¡Autenticación configurada! Ahora Bubble.io puede gestionar usuarios de forma segura con tu backend Convex! 🎉**
