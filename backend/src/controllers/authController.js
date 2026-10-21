import * as authService from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const login = asyncHandler(async (req, res) => {
  const resultado = await authService.login(req.body);
  return res.status(200).json(resultado);
});

export const perfil = asyncHandler(async (req, res) => {
  const usuario = await authService.obtenerPerfil(req.usuario.id);
  return res.status(200).json(usuario);
});
