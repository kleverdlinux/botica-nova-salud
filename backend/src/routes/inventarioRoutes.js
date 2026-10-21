import { Router } from 'express';
import * as inventarioController from '../controllers/inventarioController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';
import { validar } from '../middlewares/validar.js';
import { entradaInventarioSchema, ajusteInventarioSchema } from '../schemas/inventarioSchemas.js';

const router = Router();

// Todas las operaciones de kardex y movimientos manuales requieren sesión y rol ADMIN
router.use(verificarAuth, requiereRol('ADMIN'));

router.post('/entrada', validar(entradaInventarioSchema), inventarioController.entrada);
router.post('/ajuste', validar(ajusteInventarioSchema), inventarioController.ajuste);
router.get('/kardex/:productoId', inventarioController.kardex);

export default router;
