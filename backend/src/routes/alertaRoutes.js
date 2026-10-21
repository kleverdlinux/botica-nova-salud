import { Router } from 'express';
import * as alertaController from '../controllers/alertaController.js';
import { verificarAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Accesible por Cajero y Admin (sin costo ni proveedor)
router.use(verificarAuth);

router.get('/', alertaController.obtenerAlertas);

export default router;
