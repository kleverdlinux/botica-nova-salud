# 🏥 Sistema Web Botica "Nova Salud"

Sistema integral para gestión de inventario, punto de venta (POS) y catálogo público para la botica **Nova Salud**. Desarrollado con arquitectura cliente-servidor desacoplada (REST API + SPA).

## 🚀 Stack Tecnológico

* **Backend:** Node.js (v22 LTS) + Express 5 + Prisma 6 ORM
* **Base de Datos:** PostgreSQL 16
* **Seguridad:** JWT + bcryptjs + Helmet + CORS + Express Rate Limit
* **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Chart.js

---

## 📁 Estructura del Proyecto

```text
botica-nova-salud/
├── backend/
│   ├── prisma/
│   │   ├── migrations/       # Migraciones SQL versionadas
│   │   ├── schema.prisma     # Definición del modelo de datos
│   │   └── seed.js           # Sembrado de datos iniciales e idempotente
│   ├── src/                  # Código fuente de la API
│   ├── .env.example          # Plantilla de variables de entorno
│   └── package.json
└── frontend/                 # Aplicación React SPA (Fase 5)
```

---

## 🛠️ Instrucciones de Ejecución Local (Backend)

### 1. Requisitos Previos
* Node.js v20+ o v22+
* PostgreSQL 16 corriendo en el puerto 5432
* Base de datos `botica_novasalud` creada

### 2. Configuración de Entorno
Copiar el archivo de ejemplo en `backend/`:
```bash
cd backend
cp .env.example .env
```
Configurar la variable `DATABASE_URL` con tus credenciales locales.

### 3. Migraciones y Sembrado de Datos
```bash
cd backend
npm install
npx prisma migrate dev
npm run prisma:seed
```

### 4. Credenciales de Demostración (Seed)
* **Administrador:** `admin@novasalud.com` / `Admin123!` (Demo académica)
* **Cajero:** `cajero@novasalud.com` / `Cajero123!` (Demo académica)
