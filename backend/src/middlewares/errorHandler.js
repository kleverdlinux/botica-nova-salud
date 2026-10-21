import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { ErrorNegocio } from '../utils/errores.js';

export function errorHandler(err, req, res, next) {
  // 1. Error de negocio controlado (400, 401, 403, 404, 409)
  if (err instanceof ErrorNegocio) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // 2. Error de validación Zod (utiliza err.issues canónico)
  if (err instanceof ZodError) {
    const detalles = err.issues.map(issue => ({
      campo: issue.path.join('.'),
      mensaje: issue.message
    }));
    return res.status(400).json({ error: 'Datos de entrada inválidos', detalles });
  }

  // 3. Errores controlados de Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const campo = err.meta?.target ? ` (${err.meta.target})` : '';
      return res.status(409).json({ error: `Ya existe un registro con ese valor único${campo}.` });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'El registro solicitado no existe o ya no está disponible.' });
    }
  }

  // 4. Errores de sintaxis JSON en el body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Formato JSON inválido en la petición.' });
  }

  // 5. Error 500 no previsto (registro seguro sin filtrar datos sensibles)
  console.error('[INTERNAL SERVER ERROR]:', err.message);
  return res.status(500).json({ error: 'Ocurrió un error interno en el servidor.' });
}
