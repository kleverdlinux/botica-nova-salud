import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import catalogoRoutes from './routes/catalogoRoutes.js';
import productoRoutes from './routes/productoRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import auxRoutes from './routes/auxRoutes.js';

const app = express();

// Middlewares de seguridad y perimétricos
app.use(helmet());

const origenPermitido = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: origenPermitido,
  credentials: true
}));

app.use(express.json());

// Endpoint de verificación de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    sistema: 'Botica Nova Salud API',
    version: '1.0.0'
  });
});

// Montaje de rutas
app.use('/api/auth', authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api', auxRoutes);

// Manejador de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// Manejador centralizado de errores
app.use(errorHandler);

export default app;
