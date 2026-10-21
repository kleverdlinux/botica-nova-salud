# 🏥 Sistema Web Botica "Nova Salud"

Sistema integral para gestión de inventario, punto de venta (POS) y catálogo público para la botica **Nova Salud**. Desarrollado con arquitectura cliente-servidor desacoplada (REST API + SPA) como Proyecto Final de Carrera para SENATI (PIAD-527).

## 🚀 Stack Tecnológico

* **Backend:** Node.js (v22 LTS) + Express 5 + Prisma 6 ORM
* **Base de Datos:** PostgreSQL 16
* **Seguridad:** JWT + bcryptjs + Helmet + CORS + Express Rate Limit
* **Frontend:** React 19 + Vite + Tailwind CSS v3 + React Router v7 + Axios + Lucide Icons + React Hot Toast
* **Zona Horaria y Moneda:** Horario oficial `America/Lima` (UTC-5) y Soles Peruanos (`es-PE / PEN`).

---

## 📁 Estructura del Proyecto

```text
botica-nova-salud/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Migraciones SQL versionadas
│   │   ├── schema.prisma     # Definición del modelo de datos
│   │   └── seed.js           # Sembrado de datos iniciales e idempotente
│   ├── src/                  # Código fuente de la API REST
│   ├── tests/                # Suites de pruebas HTTP reales por fase
│   ├── .env.example          # Plantilla de variables de entorno (BD, JWT, CORS)
│   └── package.json
└── frontend/                 # Aplicación React SPA (Vite + Tailwind)
    ├── src/
    │   ├── api/              # Cliente Axios con interceptor 401 e inyección Bearer
    │   ├── components/       # Layout privado, modal de ticket térmico 80mm y guards
    │   ├── context/          # AuthContext y CarritoContext
    │   ├── pages/            # Login, POS, Inventario, Alertas, Ventas
    │   └── utils/            # Formateadores oficiales (moneda PEN y fechas Lima)
    ├── .env.example          # Plantilla VITE_API_URL
    └── package.json
```

---

## 🔑 Credenciales de Demostración (Evaluación Académica SENATI)

Las siguientes credenciales se cargan automáticamente mediante el script de seed y están disponibles para pruebas del sistema:

| Rol | Correo Electrónico | Contraseña | Alcance de Permisos |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@novasalud.com` | `Admin123!` | Acceso total: POS, CRUD inventario, entradas, ajustes físicos, Kardex, alertas, dashboard y usuarios. Ve costos y proveedores. |
| **Cajero** | `cajero@novasalud.com` | `Cajero123!` | Operación de caja: POS, consulta de alertas, ventas propias del día, catálogo y stock. **Sin costos, sin proveedores y sin operaciones de ajuste de stock.** |

---

## 🛠️ Instrucciones de Ejecución Local

### 1. Puesta en Marcha del Backend (API REST)
```powershell
cd backend
# 1. Configurar variables de entorno si es la primera vez
# Copiar .env.example a .env y colocar DATABASE_URL
npm install
npx prisma migrate dev
npm run prisma:seed
# Iniciar servidor en http://localhost:4000/api
node src/server.js
```

### 2. Puesta en Marcha del Frontend (SPA Vite)
```powershell
cd frontend
# 1. Configurar variables de entorno si es la primera vez
# Copiar .env.example a .env con VITE_API_URL=http://localhost:4000/api
npm install
# Iniciar servidor de desarrollo en http://localhost:5173
npm run dev
```

### 3. Rutas de la Aplicación
* **Inicio de Sesión:** `http://localhost:5173/admin/login`
* **Punto de Venta (POS):** `http://localhost:5173/app/pos`
* **Inventario:** `http://localhost:5173/app/inventario`
* **Alertas:** `http://localhost:5173/app/alertas`
* **Ventas:** `http://localhost:5173/app/ventas`
