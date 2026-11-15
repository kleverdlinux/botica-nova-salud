# Botica Nova Salud — Sistema Web Fullstack de Gestión Farmacéutica, Inventario, POS y E-Commerce

Plataforma web empresarial e integral diseñada para la gestión centralizada de inventario farmacéutico, facturación en Punto de Venta (POS), monitoreo automatizado de alertas sanitarias (bajo stock y caducidad de lotes), trazabilidad en Kardex digital y comercio electrónico con atención asistencial al paciente.

---

## Información Académica e Institucional

- **Institución:** Servicio Nacional de Adiestramiento en Trabajo Industrial (SENATI)
- **Dirección Zonal / CFP:** Arequipa - Puno
- **Escuela / Carrera:** Tecnologías de la Información — Ingeniería de Software con Inteligencia Artificial
- **Semestre:** V Semestre
- **Curso / Módulo Formativo:** Fullstack Developer Software (Código: PIAD-527)
- **Tema del Trabajo Final:** Implementación de un software web de gestión de inventario y venta de una botica

### Integrantes del Entregable

1. **Vladimir Pedro Mamani Qquelcca**
2. **Kleverd Gabriel Apaza Quispe**
3. **Michel Enrique Tejada Fernández**
4. **Omar David Mamani Jihuallanca**
5. **Gustavo Edward Apaza Yanqui**

---

## Enlaces de Producción y Despliegue

| Recurso | Enlace Directo | Estado |
| :--- | :--- | :--- |
| **Aplicación Web en Vivo (Render Cloud)** | [https://botica-nova-salud-khs4.onrender.com/](https://botica-nova-salud-khs4.onrender.com/) | Operativo (HTTPS / SSL) |
| **Estado del Servidor API (Health Check)** | [https://botica-nova-salud-khs4.onrender.com/api/health](https://botica-nova-salud-khs4.onrender.com/api/health) | Activo (`200 OK`) |
| **Repositorio Oficial (GitHub)** | [https://github.com/kleverdlinux/botica-nova-salud](https://github.com/kleverdlinux/botica-nova-salud) | Rama `main` |

---

## Características Principales del Sistema

1. **Punto de Venta (POS) Transaccional (`/app/pos`):**
   - Búsqueda indexada en milisegundos por nombre comercial, principio activo o lectura óptica de código de barras.
   - Procesamiento de ventas mediante transacciones atómicas en PostgreSQL (`prisma.$transaction`), garantizando cero sobreventa ante operaciones concurrentes.
   - Cálculo de importes e IGV (18%) validado exclusivamente desde la base de datos del servidor.
   - Consulta automatizada de DNI (RENIEC) y RUC (SUNAT) para emisión de Boleta de Venta, Factura Electrónica A4 y Ticket Térmico.
   - Soporte multipago: Efectivo (con cálculo automático de vuelto), Yape/Plin (QR dinámico) y Tarjeta.

2. **Motor de Alertas Sanitarias de Triple Filtro (`/app/alertas`):**
   - **Bajo Stock:** Detección automática en tiempo real de productos activos con existencias menores o iguales al umbral mínimo (`stock <= stockMinimo`).
   - **Próximos a Vencer (FEFO/PEPS):** Identificación preventiva de lotes cuya fecha de vencimiento se encuentra dentro de los próximos 60 días calendario (zona horaria oficial `America/Lima` UTC-5).
   - **Bloqueo Automático de Lotes Vencidos:** Rutina de seguridad sanitaria (`sincronizarCaducidadAutomatica`) que inmoviliza e impide por software la venta de cualquier medicamento expirado.

3. **Gestión de Inventario y Kardex Inmutable (`/app/inventario`):**
   - Catálogo sincronizado de **120 productos farmacéuticos certificados** con registro de código de barras, principio activo, presentación, laboratorio, costo, precio, lote y vencimiento.
   - Registro auditable de movimientos (`ENTRADA`, `SALIDA`, `AJUSTE`) en la tabla `MovimientoInventario`, conservando stock anterior, stock resultante, motivo justificado, fecha/hora exacta y usuario responsable.

4. **Terminal Móvil de Mostrador en Tiempo Real:**
   - Sincronización inmediata entre la laptop de caja y dispositivos móviles mediante Server-Sent Events (`/api/dispositivos/stream`), sondeo REST y detección física por puerto USB (`detectarUsb.ps1`).
   - Incluye **Terminal Móvil** (`/terminal-movil`), vinculada directamente desde el POS mediante código QR para visualizar el detalle de medicamentos, monto total y completar el cobro por Yape/Plin o tarjeta.

5. **Tienda Virtual E-Commerce 24/7, Portal del Cliente y Tópico Clínico:**
   - Catálogo público interactivo con filtrado por categorías terapéuticas, carrito de compras, checkout y módulo de seguimiento de despachos delivery (cobertura en Juliaca, San Román, Puno).
   - **Portal del Cliente (`/mi-cuenta`):** Gestión de perfil, ficha médica básica, historial de compras y botiquín familiar sincronizado en PostgreSQL.
   - **Módulo de Citas de Tópico (`/app/citas`):** Programación y control de atención para servicios farmacéuticos asistenciales (inyectables, toma de presión arterial y control de glucosa).

6. **Seguridad Perimetral y Control de Accesos Basado en Roles (RBAC):**
   - Autenticación con JSON Web Tokens (`JWT`), contraseñas cifradas con `bcryptjs`, protección de cabeceras HTTP con `Helmet`, limitador de intentos de acceso (`express-rate-limit`) y validación de esquemas con `Zod`.
   - Segmentación de privilegios en tres roles: `ADMIN`, `CAJERO` y `ALMACEN`, con revocación en vivo y cierre automático de sesión tras 30 minutos de inactividad.

---

## Stack Tecnológico

| Capa | Tecnologías e Instrumentos |
| :--- | :--- |
| **Frontend (SPA)** | React 19.3, Vite 8.3, Tailwind CSS 3.4, Radix UI, Lucide React, Zustand, Axios, Chart.js, Recharts, SweetAlert2, `qrcode`, `html2canvas` |
| **Backend (API REST)** | Node.js (>= 20.0), Express 5.0, Prisma ORM 6.4, `jsonwebtoken` (JWT), `bcryptjs`, `zod`, `helmet`, `cors`, `compression` (GZIP), `express-rate-limit`, `nodemailer` |
| **Base de Datos** | PostgreSQL (Esquema relacional transaccional gestionado con migraciones de Prisma) |
| **DevOps y Despliegue** | Render Cloud (Web Service + Managed PostgreSQL con SSL/TLS), Docker, Docker Compose, Git y GitHub |

---

## Arquitectura y Estructura del Proyecto

```text
botica-nova-salud/
├── backend/
│   ├── prisma/
│   │   ├── migrations/          # Migraciones SQL versionadas (init_fase1 y add_cliente_table)
│   │   ├── schema.prisma        # Modelo relacional PostgreSQL (8 modelos y 3 enums)
│   │   ├── seed.js              # Semilla inicial de usuarios, roles, categorías y catálogo
│   │   └── store_products.json  # Catálogo oficial de 120 productos farmacéuticos
│   ├── src/
│   │   ├── controllers/         # Controladores HTTP de la API REST
│   │   ├── lib/                 # Instancia singleton de Prisma Client
│   │   ├── middlewares/         # Autenticación JWT, autorización RBAC, Zod y manejo de errores
│   │   ├── routes/              # Definición de rutas (/api/auth, /productos, /ventas, /alertas, etc.)
│   │   ├── schemas/             # Validaciones de entrada con Zod
│   │   ├── services/            # Lógica de negocio transaccional y sanitaria
│   │   ├── utils/               # Zona horaria America/Lima, manejo de errores y detectarUsb.ps1
│   │   ├── app.js               # Configuración de Express, middlewares y servidor SPA estático
│   │   └── server.js            # Punto de entrada del servidor backend
│   └── package.json
├── frontend/
│   ├── public/                  # Recursos públicos e imágenes optimizadas de productos
│   ├── src/
│   │   ├── api/                 # Módulos de consumo HTTP con Axios
│   │   ├── components/          # Componentes UI, modales operativos y guardias de seguridad
│   │   ├── context/             # Contextos de autenticación y carrito
│   │   ├── hooks/               # Custom Hooks de estado, tema y carrito
│   │   ├── pages/               # Vistas del panel administrativo, POS, terminales y tienda pública
│   │   ├── utils/               # Impresión A4/térmica, formateadores y alertas
│   │   ├── App.jsx              # Enrutador principal con carga diferida (Lazy Loading)
│   │   └── main.jsx             # Punto de montaje de React 19
│   └── package.json
├── db/
│   └── init.sql                 # Volcado SQL estructurado de inicialización y respaldo
├── Dockerfile                   # Definición de imagen multi-etapa para contenedores
├── docker-compose.yml           # Orquestación de servicios (App + PostgreSQL)
├── render.yaml                  # Blueprint de infraestructura como código para Render Cloud
└── package.json                 # Scripts maestros de construcción y despliegue
```

---

## Modelo Relacional de Base de Datos

El esquema en `backend/prisma/schema.prisma` define las siguientes entidades principales:

- **`Usuario`**: Personal autorizado de la botica con rol asignado (`ADMIN`, `CAJERO`, `ALMACEN`).
- **`Categoria`**: Clasificación terapéutica y comercial de los medicamentos.
- **`Proveedor`**: Laboratorios y droguerías proveedoras con RUC y datos de contacto.
- **`Producto`**: Fármacos con código de barras, principio activo, presentación, laboratorio, costo, precio, stock actual, stock mínimo, lote y fecha de vencimiento.
- **`Venta` y `DetalleVenta`**: Registro transaccional de comprobantes, método de pago (`EFECTIVO`, `YAPE_PLIN`, `TARJETA`), datos del cliente y detalle de unidades con precio histórico congelado.
- **`MovimientoInventario`**: Bitácora Kardex inmutable (`ENTRADA`, `SALIDA`, `AJUSTE`) con trazabilidad de saldos y operador.
- **`Cliente`**: Cuenta del paciente con DNI, datos de contacto, dirección de reparto, ficha médica y botiquín familiar.

---

## Principales Endpoints de la API REST

| Método | Ruta | Descripción Técnica |
| :-: | :--- | :--- |
| `GET` | `/api/health` | Verificación de estado operativo del servidor y entorno. |
| `POST` | `/api/auth/login` | Autenticación de personal y emisión de token JWT. |
| `GET` | `/api/catalogo` | Catálogo público de medicamentos activos para la tienda E-Commerce. |
| `GET` | `/api/productos/buscar` | Búsqueda rápida para el POS por nombre, principio activo o código de barras. |
| `POST` | `/api/ventas` | Procesamiento atómico de venta, descuento de stock y registro en Kardex. |
| `GET` | `/api/alertas` | Evaluación sanitaria de Bajo Stock, Próximos a Vencer (60 días) y Vencidos. |
| `POST` | `/api/inventario/entrada` | Ingreso de nuevos lotes de proveedor y actualización de existencias. |
| `POST` | `/api/inventario/ajuste` | Ajuste auditado de inventario por merma o arqueo físico. |
| `GET` | `/api/inventario/kardex` | Consulta del historial cronológico de movimientos de inventario. |
| `GET` | `/api/dashboard/resumen` | Indicadores gerenciales, ingresos y estadísticas operativas en hora de Lima. |
| `GET` | `/api/consulta-documento` | Consulta de DNI (RENIEC) y RUC (SUNAT) para facturación rápida. |

---

## Normativas Técnicas, Sanitarias y Legales Aplicadas

- **ISO/IEC 25010:** Calidad de producto de software (adecuación funcional, eficiencia de desempeño, usabilidad y fiabilidad).
- **ISO/IEC 27001:** Gestión de seguridad de la información (Control de accesos A.9, Criptografía A.10 y Seguridad operativa A.12).
- **DIGEMID — D.S. N.° 014-2011-SA / D.S. N.° 016-2011-SA:** Buenas Prácticas de Almacenamiento y Dispensación (control de número de lote, fecha de expiración, rotación FEFO/PEPS e inmovilización de productos vencidos).
- **Ley N.° 29733 (Perú):** Ley de Protección de Datos Personales aplicada al resguardo de información de clientes y pacientes.
- **R.M. N.° 375-2008-TR:** Norma Básica de Ergonomía para entornos de trabajo informáticos y terminales de punto de venta.

---

## Instalación y Ejecución Local

### Requisitos Previos
- **Node.js** `>= 20.0.0` y **npm**
- **PostgreSQL** `>= 15` (local o en contenedor Docker)

### 1. Clonar el repositorio
```bash
git clone https://github.com/kleverdlinux/botica-nova-salud.git
cd botica-nova-salud
```

### 2. Configurar variables de entorno
Crear el archivo `backend/.env` tomando como base `.env.example`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://usuario:password@localhost:5432/novasalud?schema=public"
JWT_SECRET="clave_secreta_segura_jwt"
```

### 3. Instalar dependencias, migrar base de datos y poblar semilla
```bash
npm run render-build
npm run prisma:deploy
npm run prisma:seed
```

### 4. Iniciar en modo desarrollo
```bash
# Terminal 1: Servidor Backend API (Puerto 3000)
npm run dev:backend

# Terminal 2: Servidor Frontend Vite (Puerto 5173)
npm run dev:frontend
```

### Ejecución Alternativa con Docker Compose
```bash
docker compose up --build -d
```

---

**Desarrollado para el Trabajo Final del curso Fullstack Developer Software (PIAD-527) — SENATI (2026).**
