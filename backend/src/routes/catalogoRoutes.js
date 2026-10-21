import { Router } from 'express';
import * as catalogoController from '../controllers/catalogoController.js';

const router = Router();

// Endpoint 100% público para la Landing Page y Catálogo Web (sin token)
router.get('/', catalogoController.obtenerCatalogo);

export default router;
