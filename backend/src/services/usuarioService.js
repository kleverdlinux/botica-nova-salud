import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';

export async function listarUsuarios() {
  return await prisma.usuario.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true
    },
    orderBy: { id: 'asc' }
  });
}

export async function crearUsuario({ nombre, email, password, rol }) {
  const emailNormalizado = email.toLowerCase().trim();

  const existente = await prisma.usuario.findUnique({
    where: { email: emailNormalizado }
  });

  if (existente) {
    throw new ErrorNegocio('El correo electrónico ya se encuentra registrado.', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.usuario.create({
    data: {
      nombre: nombre.trim(),
      email: emailNormalizado,
      password: hashedPassword,
      rol
    },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      createdAt: true
    }
  });
}

export async function cambiarEstadoActivo(id, activo, solicitanteId) {
  const usuarioId = parseInt(id, 10);

  if (isNaN(usuarioId)) {
    throw new ErrorNegocio('ID de usuario inválido.', 400);
  }

  // Salvaguarda crítica: un admin no puede desactivarse a sí mismo
  if (usuarioId === solicitanteId) {
    throw new ErrorNegocio('No puedes desactivar tu propia cuenta de administrador.', 400);
  }

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario) {
    throw new ErrorNegocio('Usuario no encontrado.', 404);
  }

  return await prisma.usuario.update({
    where: { id: usuarioId },
    data: { activo },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      activo: true,
      updatedAt: true
    }
  });
}
