import { Router } from 'express';
import * as catalogoController from '../controllers/catalogoController.js';
import { verificarAuth, requiereRol } from '../middlewares/authMiddleware.js';

const router = Router();

// Endpoints 100% públicos para la Tienda Web y Checkout de Clientes (sin token)
router.get('/', catalogoController.obtenerCatalogo);
router.post('/pedido-web', catalogoController.registrarPedidoWeb);

// Autenticación y gestión de cuentas de clientes en Base de Datos central (PostgreSQL)
router.post('/cliente/registro', catalogoController.registrarCliente);
router.post('/cliente/login', catalogoController.loginCliente);
router.post('/cliente/solicitar-recuperacion', catalogoController.solicitarRecuperacionCliente);
router.put('/cliente/perfil', catalogoController.actualizarPerfilCliente);
router.get('/cliente/pedidos/:dni', catalogoController.obtenerPedidosCliente);
router.get('/cliente/botiquin/:dni', catalogoController.obtenerBotiquinCliente);
router.put('/cliente/botiquin', catalogoController.actualizarBotiquinCliente);

// Control de estados de entrega y trazabilidad para Cajero / Admin y Motorizado
router.put('/pedido/estado', catalogoController.actualizarEstadoPedido);
router.get('/pedidos-delivery', catalogoController.listarPedidosDelivery);

// Gestión de clientes web y recuperación de contraseñas (Admin)
router.get('/admin/clientes', verificarAuth, requiereRol('ADMIN'), catalogoController.listarClientesAdmin);
router.post('/admin/clientes/reasignar-password', verificarAuth, requiereRol('ADMIN'), catalogoController.reasignarPasswordClienteAdmin);

export default router;
