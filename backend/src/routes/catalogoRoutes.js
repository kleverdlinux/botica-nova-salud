import { Router } from 'express';
import * as catalogoController from '../controllers/catalogoController.js';

const router = Router();

// Endpoints 100% públicos para la Tienda Web y Checkout de Clientes (sin token)
router.get('/', catalogoController.obtenerCatalogo);
router.post('/pedido-web', catalogoController.registrarPedidoWeb);

// Autenticación y gestión de cuentas de clientes en Base de Datos central (PostgreSQL)
router.post('/cliente/registro', catalogoController.registrarCliente);
router.post('/cliente/login', catalogoController.loginCliente);
router.put('/cliente/perfil', catalogoController.actualizarPerfilCliente);
router.get('/cliente/pedidos/:dni', catalogoController.obtenerPedidosCliente);

// Control de estados de entrega y trazabilidad para Cajero / Admin y Motorizado
router.put('/pedido/estado', catalogoController.actualizarEstadoPedido);
router.get('/pedidos-delivery', catalogoController.listarPedidosDelivery);

export default router;
