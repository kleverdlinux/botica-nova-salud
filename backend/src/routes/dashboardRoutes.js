import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Exclusivo para administradores
router.use(verificarAuth, requiereRol('ADMIN'));

router.get('/resumen', dashboardController.resumen);

export default router;
