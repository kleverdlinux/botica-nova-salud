import { Router } from 'express';
import * as productoController from '../controllers/productoController.js';
import * as consultaDocController from '../controllers/consultaDocController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Consulta automática de DNI / RUC para el POS (Cajero y Admin)
router.get('/consulta-documento', verificarAuth, consultaDocController.consultarDocumento);

// Categorías activas (para Cajero y Admin al filtrar o registrar)
router.get('/categorias', verificarAuth, productoController.listarCategorias);

// Proveedores activos (Admin y Almacén)
router.get('/proveedores', verificarAuth, requiereRol('ADMIN', 'ALMACEN'), productoController.listarProveedores);

export default router;
