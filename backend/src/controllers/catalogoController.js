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
