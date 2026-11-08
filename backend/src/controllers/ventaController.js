import * as ventaService from '../services/ventaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const crear = asyncHandler(async (req, res) => {
  const nuevaVenta = await ventaService.crearVenta({
    ...req.body,
    usuarioId: req.usuario.id
  });
  return res.status(201).json({
    mensaje: 'Venta registrada con éxito.',
    venta: nuevaVenta
  });
});

export const listar = asyncHandler(async (req, res) => {
  const resultado = await ventaService.listarVentas({
    rol: req.usuario.rol,
    usuarioId: req.usuario.id,
    page: req.query.page,
    limit: req.query.limit,
    fechaInicio: req.query.fechaInicio,
    fechaFin: req.query.fechaFin,
    metodoPago: req.query.metodoPago,
    busqueda: req.query.busqueda
  });
  return res.status(200).json(resultado);
});

export const obtenerPorId = asyncHandler(async (req, res) => {
  const venta = await ventaService.obtenerVentaPorId(
    req.params.id,
    req.usuario.rol,
    req.usuario.id
  );
  return res.status(200).json(venta);
});
