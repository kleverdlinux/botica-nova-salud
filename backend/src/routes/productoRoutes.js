import { Router } from 'express';
import * as productoController from '../controllers/productoController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';
import { validar } from '../middlewares/validar.js';
import { productoCreateSchema, productoUpdateSchema } from '../schemas/productoSchemas.js';

const router = Router();

// Todas las rutas de inventario/productos requieren autenticación
router.use(verificarAuth);

// 1. RUTA CRÍTICA: /buscar debe ir ANTES de /:id para evitar colisión de rutas
router.get('/buscar', productoController.buscarPOS);

// 2. Listado general paginado (con proyecciones según rol Admin vs Cajero)
router.get('/', productoController.listar);

// 3. Obtener por ID específico
router.get('/:id', productoController.obtenerPorId);

// 4. Operaciones de escritura (ADMIN y ALMACEN)
router.post('/sincronizar-catalogo', requiereRol('ADMIN'), productoController.sincronizarCatalogo);
router.post('/', requiereRol('ADMIN', 'ALMACEN'), validar(productoCreateSchema), productoController.crear);
router.put('/:id', requiereRol('ADMIN', 'ALMACEN'), validar(productoUpdateSchema), productoController.actualizar);
router.patch('/:id/activar', requiereRol('ADMIN', 'ALMACEN'), productoController.activar);
router.delete('/:id', requiereRol('ADMIN', 'ALMACEN'), productoController.desactivar);

export default router;
