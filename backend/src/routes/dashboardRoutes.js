import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas requieren usuario autenticado
router.use(verificarAuth);

// Dashboard General (Exclusivo Administrador)
router.get('/resumen', requiereRol('ADMIN'), dashboardController.resumen);

// Dashboard Especializado de Almacén (ADMIN y ALMACEN)
router.get('/almacen', requiereRol('ADMIN', 'ALMACEN'), dashboardController.resumenAlmacen);

// Dashboard Especializado de Cajero (ADMIN y CAJERO)
router.get('/cajero', requiereRol('ADMIN', 'CAJERO'), dashboardController.resumenCajero);

export default router;
