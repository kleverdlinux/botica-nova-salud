import * as usuarioService from '../services/usuarioService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listar = asyncHandler(async (req, res) => {
  const usuarios = await usuarioService.listarUsuarios();
  return res.status(200).json(usuarios);
});

export const crear = asyncHandler(async (req, res) => {
  const nuevoUsuario = await usuarioService.crearUsuario(req.body);
  return res.status(201).json(nuevoUsuario);
});

export const cambiarActivo = asyncHandler(async (req, res) => {
  const usuarioActualizado = await usuarioService.cambiarEstadoActivo(
    req.params.id,
    req.body.activo,
    req.usuario.id
  );
  return res.status(200).json(usuarioActualizado);
});
