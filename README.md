# Gestión-app — Finanzas Personales (Code-Pulse)

## ¿De qué se trata este proyecto?

Es una aplicación web para llevar el control de los ingresos y egresos
(gastos) de una persona, todo en un solo lugar y ordenado — nada de hojas
de cálculo sueltas ni apuntes en el teléfono. La idea es simple: la
persona inicia sesión, ve un resumen visual de cómo está su dinero, y más
adelante podrá ir agregando cada ingreso o gasto que tenga.

Como es un proyecto académico, se está construyendo **por entregas**: cada
entrega agrega una parte nueva y funcional, en vez de entregar todo junto
al final.

## ¿Qué es lo que ya funciona hoy?

### 1. El inicio de sesión (completo)
La persona entra con su usuario y contraseña, el sistema la reconoce, y
queda "adentro" de la aplicación de forma segura. Las contraseñas no se
guardan en texto plano en ningún lado — ni siquiera un administrador
puede verlas, solo comprobar que coinciden. Hay dos tipos de cuenta:
administrador y usuario normal.

### 2. El Dashboard (completo y conectado a datos reales)
Es la pantalla principal después de iniciar sesión. Muestra:

- **4 tarjetas de resumen**, cada una con su ícono: Total de Ingresos,
  Total de Egresos, Balance Total, y Porcentaje de balance mensual.
- **2 gráficas**: una de línea con el balance a través de los años, y una
  de barras con el balance mes a mes del año actual.

Estas tarjetas y gráficas ya **no muestran datos fijos en Q0**: se calculan
en el backend (`GET /api/movimientos/resumen`) a partir de lo que el
usuario haya guardado en "Nuevo Registro", y el dashboard vuelve a pedir
ese resumen cada vez que se entra a la pantalla — por ejemplo, justo
después de guardar un ingreso nuevo y volver del formulario.

### 3. Crear cuenta (registro público, funcional)
En el login ahora hay un enlace **"¿No tiene una cuenta? Regístrese"** que
lleva a `/registro`. Esa pantalla pide nombre, apellido, correo, nombre de
usuario, género, teléfono (opcional) y contraseña (con confirmación), y
al guardar llama a `POST /api/auth/registro`. Ese endpoint valida los
datos, revisa que el usuario/correo no estén repetidos, guarda la cuenta
con rol `USER` y **deja la sesión iniciada de una vez** (regresa el mismo
token que entrega el login), así que la persona entra directo al
Dashboard sin tener que volver a escribir sus credenciales.

### 4. Nuevo Registro — alta de ingresos (funcional)
Pantalla para agregar ingresos, siguiendo el maquetado aprobado: un
formulario ("Agregar Transacción") con descripción, monto, fecha y
categoría, y a la derecha una "Vista Previa del Registro" donde se van
acumulando las filas antes de guardarlas. Al presionar
**"Confirmar y guardar registro"** todas las filas de la vista previa se
guardan de una sola vez en la base de datos (tabla `movimientos`) y el
Dashboard queda actualizado automáticamente.

Por instrucción explícita del cliente, **por el momento la aplicación
solo permite registrar ingresos**: el toggle de "Egreso" del maquetado
original no se muestra en esta entrega (ni en el formulario ni en
ninguna parte de la interfaz), aunque la base de datos y el backend ya
están preparados para soportarlo (`tipo IN ('INGRESO', 'EGRESO')`) el día
que se habilite.

### 5. Datos de usuario ampliados
La tabla `usuarios` ahora guarda, además de usuario y contraseña:
nombre, apellido, correo electrónico, género, rol, teléfono, foto de
perfil (`avatar_url`) y si la cuenta está activa. El backend expone
`PUT /api/usuarios/perfil` para actualizar esos datos (incluyendo un
cambio de contraseña opcional) desde una futura pantalla de "Mi perfil".

## Lo que falta por construir

- La pantalla para ver el listado de todo lo registrado ("Registros") y
  sus filtros.
- Una pantalla de "Mi perfil" en el frontend que consuma
  `PUT /api/usuarios/perfil` (el backend de esa parte ya está listo).
- Habilitar el registro de egresos (la base de datos y el backend ya lo
  soportan; falta el toggle en la interfaz cuando el cliente lo autorice).
- Reportes adicionales y filtros (por mes, por categoría, etc.) — los
  botones de "Este Mes" y "Filtro" ya están puestos en el Dashboard, pero
  todavía no hacen nada hasta que exista ese filtrado.

---

## Documentación técnica

Todo lo que sigue es para quien vaya a instalar, revisar o seguir
desarrollando el proyecto (no hace falta leerlo para entender qué hace
la aplicación, eso ya se explicó arriba).

### Con qué está hecho

| Capa       | Tecnología                                                              |
|------------|---------------------------------------------------------------------------|
| Backend    | Node.js, Express, TypeScript, PostgreSQL (librería `pg`), JWT, bcryptjs   |
| Frontend   | Angular 21 (componentes standalone), TypeScript                          |
| Estilos    | CSS con variables, paleta de marca a medida                              |
| Paquetería | pnpm                                                                       |

### Cómo está organizado

```
finanzas-app/
├── backend/
│   ├── db/
│   │   └── init.sql            # Creación de las tablas usuarios y movimientos
│   ├── src/
│   │   ├── config/              # Conexión a PostgreSQL y variables de entorno
│   │   ├── controllers/         # Controladores HTTP (auth, usuarios, movimientos)
│   │   ├── middlewares/         # Autenticación (JWT) y manejo de errores
│   │   ├── models/               # Tipos e interfaces (usuario, movimiento, auth)
│   │   ├── repositories/        # Acceso a datos (queries SQL)
│   │   ├── routes/               # Definición de endpoints
│   │   ├── services/             # Lógica de negocio (auth, usuarios, movimientos)
│   │   ├── seed.ts               # Carga de usuarios admin/user (idempotente)
│   │   ├── app.ts                # Configuración de Express
│   │   └── server.ts             # Punto de entrada
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/app/
    │   ├── core/
    │   │   ├── config/           # URL base de la API
    │   │   ├── guards/           # authGuard (protección de rutas)
    │   │   ├── interceptors/     # authInterceptor (agrega el token JWT)
    │   │   ├── models/           # Tipos compartidos (usuario, movimiento, resumen)
    │   │   └── services/         # AuthService, DashboardService, MovimientoService
    │   ├── shared/
    │   │   └── graficas/         # Dibuja las gráficas SVG del Dashboard
    │   └── features/
    │       ├── login/            # Pantalla de inicio de sesión (funcional)
    │       ├── dashboard/        # Resumen financiero visual (funcional, datos reales)
    │       └── nuevo-registro/   # Alta de ingresos + vista previa (funcional)
    └── package.json
```

> La tabla `movimientos` soporta `INGRESO` y `EGRESO`, pero el backend y
> la interfaz solo exponen `INGRESO` en esta entrega (ver sección
> "Nuevo Registro" arriba). Habilitar `EGRESO` no requiere tocar la base
> de datos, solo el formulario y las validaciones del backend.

### Lo que NO está en este repositorio (y por qué)

Si acabas de clonar el proyecto y notas que faltan varias carpetas, es
intencional. Hay ciertas cosas que nunca deben subirse a un repositorio de
Git porque son pesadas, se regeneran solas, o son configuración personal de
cada máquina. Esta sección explica exactamente qué falta y cómo recuperarlo.

#### 1. Las dependencias (`node_modules/`)

Tanto `backend/` como `frontend/` tienen su propia carpeta `node_modules/`
que **no está en el repositorio**. Ahí es donde viven todas las librerías
que el proyecto usa (Express, Angular, bcryptjs, etc.), y puede pesar
cientos de megabytes — no tiene sentido subir eso a GitHub cuando se puede
regenerar con un solo comando.

Para instalarlas:

```powershell
cd backend
pnpm install

cd ../frontend
pnpm install
```

Con eso, `pnpm` lee el `package.json` de cada carpeta (que sí está en el
repo) y descarga exactamente las versiones necesarias, usando
`pnpm-lock.yaml` (que **tampoco** se excluyó, ese sí va en el repo) para
asegurarse de que sean las mismas versiones exactas con las que se
construyó el proyecto originalmente.

#### 2. Las variables de entorno del backend (`.env`)

El archivo `backend/.env` tampoco está en el repositorio, porque ahí van
credenciales reales (usuario y contraseña de tu PostgreSQL local, y el
secreto usado para firmar los tokens JWT). Subir eso sería exponer
credenciales de forma pública, aunque sea un proyecto académico.

Lo que sí está en el repo es `backend/.env.example`, una plantilla sin
datos sensibles. Para crear tu `.env` real:

```powershell
cd backend
copy .env.example .env
```

Y luego edita `backend/.env` con tus datos reales:

```dotenv
PORT=4000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=finanzas_personales
DB_USER=postgres
DB_PASSWORD=tu_contraseña_real_de_postgres

JWT_SECRET=un_secreto_largo_y_dificil_de_adivinar
JWT_EXPIRES_IN=8h

CORS_ORIGIN=http://localhost:4200
```

#### 3. Carpetas de compilación (`dist/`, `.angular/`)

`backend/dist/` y `frontend/.angular/` son resultado de compilar el
proyecto — código generado, no código fuente. Se regeneran solas al correr
`pnpm build` (backend) o `pnpm start` / `ng build` (frontend). No hace
falta hacer nada especial con ellas, simplemente no existen hasta que
compilas por primera vez.

#### 4. La carpeta `.vscode/` del frontend

A diferencia de las anteriores, esta sí es útil tenerla — trae accesos
directos y configuración de depuración para VS Code — pero como es
configuración del editor y no del proyecto en sí, se dejó fuera del repo.
Si quieres recuperarla, crea la carpeta `frontend/.vscode/` con estos tres
archivos:

**`frontend/.vscode/extensions.json`** — recomienda la extensión oficial de
Angular al abrir el proyecto:

```json
{
  "recommendations": ["angular.ng-template"]
}
```

**`frontend/.vscode/tasks.json`** — define las tareas de `npm start` y
`npm test` para que VS Code las reconozca:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "type": "npm",
      "script": "start",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": { "regexp": "Changes detected" },
          "endsPattern": { "regexp": "bundle generation (complete|failed)" }
        }
      }
    },
    {
      "type": "npm",
      "script": "test",
      "isBackground": true,
      "problemMatcher": {
        "owner": "typescript",
        "pattern": "$tsc",
        "background": {
          "activeOnStart": true,
          "beginsPattern": { "regexp": "Changes detected" },
          "endsPattern": { "regexp": "bundle generation (complete|failed)" }
        }
      }
    }
  ]
}
```

**`frontend/.vscode/launch.json`** — permite depurar la app directo desde
VS Code presionando F5 (abre Chrome apuntando a `localhost:4200`):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "ng serve",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: start",
      "url": "http://localhost:4200/"
    },
    {
      "name": "ng test",
      "type": "chrome",
      "request": "launch",
      "preLaunchTask": "npm: test",
      "url": "http://localhost:9876/debug.html"
    }
  ]
}
```

> Un archivo que quizás también veas generado localmente es
> `.vscode/mcp.json`. Ese lo genera el propio Angular CLI para integraciones
> de asistentes de IA con las herramientas de Angular — no contiene ninguna
> credencial, pero es opcional y no hace falta para que el proyecto
> funcione, así que se dejó fuera del repo a propósito.

### Instalación completa, paso a paso

Con todo lo anterior explicado, aquí está el flujo completo desde cero:

#### Requisitos previos

- Node.js 22 o superior
- pnpm (`npm install -g pnpm`)
- PostgreSQL 14 o superior corriendo localmente
- pgAdmin4 (opcional, pero recomendado para revisar la base de datos visualmente)

#### 1. Clonar el repositorio

```powershell
git clone <url-de-tu-repositorio>
cd finanzas-app
```

#### 2. Crear la base de datos

Puedes hacerlo desde `psql` o desde pgAdmin4. Con `psql`:

```powershell
psql -U postgres -c "CREATE DATABASE finanzas_personales;"
psql -U postgres -d finanzas_personales -f backend/db/init.sql
```

Si usas pgAdmin4: crea la base `finanzas_personales`, ábrela, entra a Query
Tool y pega ahí el contenido de `backend/db/init.sql`, luego ejecútalo.

Esto crea dos tablas: `usuarios` (para el login) y `movimientos` (donde
van a quedar los ingresos y egresos cuando exista esa pantalla). Las dos
quedan vacías; `movimientos` se llena hasta que se construya el "Nuevo
Registro".

#### 3. Configurar y levantar el backend

```powershell
cd backend
pnpm install
copy .env.example .env
```

Edita `.env` con tus datos reales (ver la sección anterior).

Carga los dos usuarios base. Sus credenciales no están escritas en ningún
archivo del proyecto — se inyectan como variables de entorno directamente
en la terminal antes de correr el seed, así nunca quedan "quemadas" en el
código ni en el repositorio:

**PowerShell:**
```powershell
$env:SEED_ADMIN_USERNAME="admin"
$env:SEED_ADMIN_PASSWORD="Admin123!"
$env:SEED_ADMIN_NOMBRE="Administrador"
$env:SEED_USER_USERNAME="user"
$env:SEED_USER_PASSWORD="User123!"
$env:SEED_USER_NOMBRE="Usuario"
pnpm seed
```

**CMD:**
```cmd
set SEED_ADMIN_USERNAME=admin
set SEED_ADMIN_PASSWORD=Admin123!
set SEED_ADMIN_NOMBRE=Administrador
set SEED_USER_USERNAME=user
set SEED_USER_PASSWORD=User123!
set SEED_USER_NOMBRE=Usuario
pnpm seed
```

Si corres `pnpm seed` sin definir esas variables primero, el script se
detiene y te dice exactamente cuáles faltan, en vez de fallar en silencio.

Con eso, la tabla `usuarios` queda con:

| Usuario | Contraseña  | Rol   |
|---------|-------------|-------|
| admin   | Admin123!   | ADMIN |
| user    | User123!    | USER  |

Ahora sí, levanta el servidor:

```powershell
pnpm dev
```

El backend queda escuchando en `http://localhost:4000`.

#### 4. Configurar y levantar el frontend

En otra terminal:

```powershell
cd frontend
pnpm install
pnpm start
```

La aplicación queda disponible en `http://localhost:4200`. Si en algún
momento cambias el puerto del backend, recuerda actualizar
`frontend/src/app/core/config/api.config.ts`.

### Cómo funciona el login por dentro

1. La persona ingresa `username` y `password` en `/login`.
2. El backend busca el usuario en PostgreSQL y compara la contraseña con
   `bcrypt.compare()` contra el hash guardado — la contraseña real nunca se
   guarda en texto plano, ni siquiera tú puedes verla en pgAdmin4.
3. Si coincide, el backend firma un JWT con `jsonwebtoken` que incluye el
   id, username y rol del usuario, y expira en 8 horas.
4. El frontend guarda ese token, protege la ruta `/dashboard` con
   `authGuard` (si no hay token válido, te manda de regreso al login), y
   agrega el token automáticamente a cada petición saliente mediante
   `authInterceptor`.

### Cómo funciona el Dashboard por dentro

1. `DashboardService` (frontend) llama a `MovimientoService.obtenerResumen()`,
   que hace `GET /api/movimientos/resumen` contra el backend.
2. En el backend, `movimientoService.obtenerResumen()` agrega en PostgreSQL
   los totales de ingresos/egresos (histórico, del año actual y del mes
   actual vs. el anterior) y arma las 4 tarjetas junto con las series para
   la gráfica de línea (últimos 7 años) y la de barras (12 meses del año
   en curso). Si el usuario todavía no tiene movimientos, todo regresa en
   cero pero con los ejes ya armados, igual que en el maquetado original.
3. Las gráficas se dibujan en el frontend con funciones propias en
   TypeScript (`shared/graficas/graficas.util.ts`), sin ninguna librería
   externa de gráficas — arman el SVG a mano a partir de una lista de
   puntos que manda el backend.
4. `Dashboard` (el componente) vuelve a pedir este resumen cada vez que se
   entra a la ruta `/dashboard`, así que después de guardar un ingreso en
   "Nuevo Registro" y volver, las tarjetas y gráficas ya están al día.

### Cómo funciona "Nuevo Registro" por dentro

1. El formulario de la izquierda ("Agregar Transacción") valida
   descripción, monto (> Q0.00), fecha y categoría con Angular Reactive
   Forms. El tipo de movimiento va fijo en `INGRESO` — no hay ningún
   control de egreso visible en esta entrega.
2. Cada clic en **"+ Agregar a la lista"** agrega esa fila a un arreglo en
   memoria (un `signal`) que alimenta la "Vista Previa del Registro" de la
   derecha; todavía no se ha guardado nada en la base de datos.
3. El clic en **"Confirmar y guardar registro"** manda todas las filas
   juntas a `POST /api/movimientos/lote`, que las inserta en una sola
   transacción de PostgreSQL. Si todo sale bien, se limpia la vista previa
   y aparece un aviso con acceso directo al Dashboard ya actualizado.
4. En el backend, `movimientoService.crearLote()` rechaza cualquier
   movimiento que no sea `INGRESO` o que no traiga una categoría válida
   del catálogo (`GET /api/movimientos/categorias`), sin importar lo que
   mande el cliente.

### Paleta de colores

| Variable                  | Hex       | Uso                                |
|----------------------------|-----------|--------------------------------------|
| `--color-bg-deep`          | `#010f1f` | Fondo general                        |
| `--color-bg-surface`       | `#051424` | Tarjetas y paneles                   |
| `--color-bg-elevated`      | `#0d1c2d` | Inputs y elementos elevados          |
| `--color-border`           | `#2c3a4c` | Bordes y divisores                   |
| `--color-accent`           | `#0066ff` | Acciones primarias, foco, enlaces    |
| `--color-accent-light`     | `#3b82f6` | Acentos claros (gráficas, textos)    |
| `--color-text-primary`     | `#ffffff` | Texto principal                      |
| `--color-text-secondary`   | `#a0aab8` | Texto secundario                     |

---

*Este proyecto se construyó con apoyo de Claude (Anthropic) como asistente
de desarrollo. La estructura, el código y las decisiones técnicas fueron
revisadas para el contexto del proyecto académico "Fundación Kinal —
Finanzas Personales".*