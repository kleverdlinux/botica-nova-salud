import { z } from 'zod';

export const entradaInventarioSchema = z.object({
  productoId: z.coerce.number().int().positive('ID de producto inválido'),
  cantidad: z.coerce.number().int().positive('La cantidad debe ser un entero positivo mayor a 0'),
  motivo: z.string().trim().min(3, 'El motivo es requerido (ej: Factura F01-123)'),
  lote: z.string().trim().optional().nullable(),
  fechaVencimiento: z.preprocess((val) => {
    if (!val) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(`${val}T00:00:00.000-05:00`);
    }
    return new Date(val);
  }, z.date().optional().nullable())
});

export const ajusteInventarioSchema = z.object({
  productoId: z.coerce.number().int().positive('ID de producto inválido'),
  stockReal: z.coerce.number().int().min(0, 'El stock físico no puede ser negativo'),
  motivo: z.string().trim().min(3, 'El motivo es requerido (ej: Merma por rotura)')
});
