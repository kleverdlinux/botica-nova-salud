import { Router } from 'express';
import * as ventaController from '../controllers/ventaController.js';
import { verificarAuth } from '../middlewares/authMiddleware.js';
import { validar } from '../middlewares/validar.js';
import { ventaCreateSchema } from '../schemas/ventaSchemas.js';

const router = Router();

// Todas las rutas de ventas requieren autenticación (Cajero y Admin)
router.use(verificarAuth);

router.post('/', validar(ventaCreateSchema), ventaController.crear);
router.get('/', ventaController.listar);
router.get('/:id', ventaController.obtenerPorId);

export default router;
