import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { errorHandler } from './middlewares/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rutaFrontendDist = path.resolve(__dirname, '../../frontend/dist');

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import auxRoutes from './routes/auxRoutes.js';
import inventarioRoutes from './routes/inventarioRoutes.js';
import ventaRoutes from './routes/ventaRoutes.js';
import alertaRoutes from './routes/alertaRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import dispositivoRoutes from './routes/dispositivoRoutes.js';

const app = express();

// Middlewares de seguridad y perimétricos
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Endpoint de verificación de salud (Vital para Render health check)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'Botica Nova Salud API',
    entorno: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  });
});

// Montaje de rutas API
app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/dispositivos', dispositivoRoutes);
app.use('/api', auxRoutes);

// Manejador de rutas API no encontradas (404)
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Ruta API no encontrada: ${req.method} ${req.originalUrl}` });
});

// Servir frontend compilado en producción (Single Page Application Fallback)
if (fs.existsSync(rutaFrontendDist)) {
  app.use(express.static(rutaFrontendDist));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile('index.html', { root: rutaFrontendDist }, (err) => {
      if (err) {
        try {
          const html = fs.readFileSync(path.join(rutaFrontendDist, 'index.html'), 'utf8');
          res.type('html').send(html);
        } catch (e) {
          next(err);
        }
      }
    });
  });
}

// Manejador centralizado de errores
app.use(errorHandler);

export default app;
