import * as inventarioService from '../services/inventarioService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const entrada = asyncHandler(async (req, res) => {
  const resultado = await inventarioService.registrarEntrada({
    ...req.body,
    usuarioId: req.usuario.id
  });
  return res.status(201).json({
    mensaje: 'Ingreso de mercadería registrado con éxito.',
    ...resultado
  });
});

export const ajuste = asyncHandler(async (req, res) => {
  const resultado = await inventarioService.registrarAjuste({
    ...req.body,
    usuarioId: req.usuario.id
  });
  return res.status(200).json({
    mensaje: 'Ajuste de inventario aplicado con éxito.',
    ...resultado
  });
});

export const kardex = asyncHandler(async (req, res) => {
  const resultado = await inventarioService.obtenerKardexPorProducto(
    req.params.productoId,
    req.query
  );
  return res.status(200).json(resultado);
});

export const kardexGlobal = asyncHandler(async (req, res) => {
  const resultado = await inventarioService.obtenerKardexGlobal(req.query);
  return res.status(200).json(resultado);
});
