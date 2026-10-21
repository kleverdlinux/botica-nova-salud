import { Router } from 'express';
import * as usuarioController from '../controllers/usuarioController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';
import { validar } from '../middlewares/validar.js';
import { usuarioCreateSchema, usuarioToggleActivoSchema } from '../schemas/usuarioSchemas.js';

const router = Router();

// Todas las rutas de usuarios requieren sesión activa y rol ADMIN
router.use(verificarAuth, requiereRol('ADMIN'));

router.get('/', usuarioController.listar);
router.post('/', validar(usuarioCreateSchema), usuarioController.crear);
router.patch('/:id/activo', validar(usuarioToggleActivoSchema), usuarioController.cambiarActivo);

export default router;
