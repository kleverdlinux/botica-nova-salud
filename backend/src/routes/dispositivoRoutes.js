import { Router } from 'express';
import * as dispositivoController from '../controllers/dispositivoController.js';

const router = Router();

// Canal SSE en tiempo real
router.get('/stream', dispositivoController.conectarStream);

// Emitir evento (desde POS o celular)
router.post('/evento', dispositivoController.emitirEvento);

// Consultar estado actual
router.get('/estado', dispositivoController.obtenerEstado);

// Consultar info de conectividad USB y periféricos
router.get('/info-conexion', dispositivoController.obtenerInfoConexion);

// Detectar dispositivo USB conectado actualmente
router.get('/detectar-usb', dispositivoController.obtenerDispositivoDetectado);

export default router;

