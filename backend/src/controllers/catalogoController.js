import * as catalogoService from '../services/catalogoService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const obtenerCatalogo = asyncHandler(async (req, res) => {
  const catalogo = await catalogoService.obtenerCatalogoPublico();
  return res.status(200).json(catalogo);
});

export const registrarPedidoWeb = asyncHandler(async (req, res) => {
  const venta = await catalogoService.registrarPedidoWebPublico(req.body);
  return res.status(201).json({
    mensaje: 'Pedido web registrado exitosamente en Botica Nova Salud.',
    venta
  });
});

export const registrarCliente = asyncHandler(async (req, res) => {
  const client = await catalogoService.registrarCliente(req.body);
  return res.status(201).json({
    ok: true,
    mensaje: `¡Bienvenido(a), ${client.name}! Tu cuenta ha sido creada exitosamente.`,
    client
  });
});

export const loginCliente = asyncHandler(async (req, res) => {
  const client = await catalogoService.loginCliente(req.body);
  return res.status(200).json({
    ok: true,
    mensaje: `¡Bienvenido(a) de nuevo, ${client.name.split(' ')[0]}!`,
    client
  });
});

export const actualizarPerfilCliente = asyncHandler(async (req, res) => {
  const client = await catalogoService.actualizarPerfilCliente(req.body);
  return res.status(200).json({
    ok: true,
    mensaje: 'Perfil actualizado exitosamente en el servidor.',
    client
  });
});

export const obtenerPedidosCliente = asyncHandler(async (req, res) => {
  const pedidos = await catalogoService.obtenerPedidosCliente(req.params.dni);
  return res.status(200).json({
    ok: true,
    pedidos
  });
});

export const actualizarEstadoPedido = asyncHandler(async (req, res) => {
  const { orderId, nuevoEstado, dni, ventaId } = req.body;
  const result = await catalogoService.actualizarEstadoPedidoDelivery({ orderId, nuevoEstado, dni, ventaId });
  return res.status(200).json({
    ok: true,
    mensaje: `Estado del pedido actualizado a ${nuevoEstado}.`,
    result
  });
});

export const listarPedidosDelivery = asyncHandler(async (req, res) => {
  const pedidos = await catalogoService.listarPedidosDeliveryAdmin();
  return res.status(200).json({
    ok: true,
    pedidos
  });
});
