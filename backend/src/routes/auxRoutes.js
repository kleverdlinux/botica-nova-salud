import { Router } from 'express';
import * as productoController from '../controllers/productoController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Categorías activas (para Cajero y Admin al filtrar o registrar)
router.get('/categorias', verificarAuth, productoController.listarCategorias);

// Proveedores activos (Solo Admin)
router.get('/proveedores', verificarAuth, requiereRol('ADMIN'), productoController.listarProveedores);

export default router;
