import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';

export async function login({ email, password }) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() }
  });

  // Mensaje uniforme tanto si no existe, si está inactivo o si la clave está mal
  if (!usuario || !usuario.activo) {
    throw new ErrorNegocio('Credenciales inválidas.', 401);
  }

  const esValida = await bcrypt.compare(password, usuario.password);
  if (!esValida) {
    throw new ErrorNegocio('Credenciales inválidas.', 401);
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      avatar: usuario.avatar,
      telefono: usuario.telefono
    }
  };
}

export async function obtenerPerfil(usuarioId) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      avatar: true,
      telefono: true,
      activo: true,
      createdAt: true
    }
  });

  if (!usuario || !usuario.activo) {
    throw new ErrorNegocio('Usuario no encontrado o inactivo.', 404);
  }

  return usuario;
}

export async function actualizarPerfil(usuarioId, { nombre, avatar, telefono, passwordActual, nuevoPassword }) {
  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId }
  });

  if (!usuario || !usuario.activo) {
    throw new ErrorNegocio('Usuario no encontrado o inactivo.', 404);
  }

  const datosActualizar = {};
  if (nombre) datosActualizar.nombre = nombre.trim();
  if (avatar !== undefined) datosActualizar.avatar = avatar;
  if (telefono !== undefined) datosActualizar.telefono = telefono;

  if (nuevoPassword) {
    if (nuevoPassword.length < 6) {
      throw new ErrorNegocio('La nueva contraseña debe tener al menos 6 caracteres.', 400);
    }
    if (passwordActual) {
      const valida = await bcrypt.compare(passwordActual, usuario.password);
      if (!valida) {
        throw new ErrorNegocio('La contraseña actual es incorrecta.', 400);
      }
    }
    datosActualizar.password = await bcrypt.hash(nuevoPassword, 10);
  }

  const actualizado = await prisma.usuario.update({
    where: { id: usuarioId },
    data: datosActualizar,
    select: {
      id: true,
      nombre: true,
      email: true,
      rol: true,
      avatar: true,
      telefono: true,
      activo: true,
      createdAt: true
    }
  });

  return actualizado;
}
