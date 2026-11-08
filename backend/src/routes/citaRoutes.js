import { Router } from 'express';
import * as citaController from '../controllers/citaController.js';
import { verificarAuth } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoint público para agendar cita desde la tienda web
router.post('/', citaController.registrarCita);

// Endpoints protegidos para Admin y Cajero en el panel de control
router.get('/', verificarAuth, citaController.listarCitas);
router.patch('/:id/estado', verificarAuth, citaController.cambiarEstadoCita);

export default router;

