# ==============================================================================
# DOCKERFILE - FARMACIA NOVA (SISTEMA INTEGRAL & E-COMMERCE)
# Arquitectura: Multi-stage build (React Frontend + Node.js Backend + Prisma ORM)
# ==============================================================================

# ------------------------------------------------------------------------------
# ETAPA 1: Compilación de Frontend (React 19 + Vite)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# ETAPA 2: Entorno de Ejecución en Producción (Runtime Node.js + Prisma)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

# Instalar OpenSSL necesario para Prisma en Alpine Linux
RUN apk add --no-cache openssl

# Copiar manifiestos raíz y backend
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

# Instalar dependencias de producción y generar Prisma Client
RUN cd backend && npm install --omit=dev && npx prisma generate

# Copiar código fuente del backend
COPY backend/src ./backend/src/

# Copiar el frontend compilado desde la primera etapa
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist/

# Exponer el puerto del sistema
EXPOSE 4000

# Comando de arranque del servidor unificado
CMD ["node", "backend/src/server.js"]

