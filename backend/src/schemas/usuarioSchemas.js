import { z } from 'zod';

export const usuarioCreateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  rol: z.enum(['ADMIN', 'CAJERO']).default('CAJERO')
});

export const usuarioToggleActivoSchema = z.object({
  activo: z.boolean({ required_error: 'El campo activo es obligatorio' })
});
