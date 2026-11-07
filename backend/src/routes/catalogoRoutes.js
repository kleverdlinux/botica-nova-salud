import { Router } from 'express';
import * as catalogoController from '../controllers/catalogoController.js';

const router = Router();

// Endpoints 100% públicos para la Tienda Web y Checkout de Clientes (sin token)
router.get('/', catalogoController.obtenerCatalogo);
router.post('/pedido-web', catalogoController.registrarPedidoWeb);

export default router;
