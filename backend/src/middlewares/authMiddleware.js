import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const verificarAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ErrorNegocio('Token no proporcionado o formato inválido.', 401);
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Consulta en vivo a la base de datos: revoca tokens de usuarios desactivados
    const usuario = await prisma.usuario.findUnique({
      where: { id: payload.id },
      select: { id: true, nombre: true, email: true, rol: true, activo: true }
    });

    if (!usuario || !usuario.activo) {
      throw new ErrorNegocio('Usuario inactivo o no autorizado.', 401);
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error instanceof ErrorNegocio) throw error;
    throw new ErrorNegocio('Sesión inválida o expirada.', 401);
  }
});

export const requiereRol = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    throw new ErrorNegocio('Acceso denegado: permisos insuficientes para esta operación.', 403);
  }
  next();
};
