import { z } from 'zod';

export const ventaCreateSchema = z.object({
  metodoPago: z.enum(['EFECTIVO', 'YAPE_PLIN', 'TARJETA']).default('EFECTIVO'),
  clienteDoc: z.string().trim().max(11).optional().nullable(),
  clienteNom: z.string().trim().max(100).optional().nullable(),
  items: z.array(
    z.object({
      productoId: z.coerce.number().int().positive('ID de producto inválido'),
      cantidad: z.coerce.number().int().positive('La cantidad debe ser un entero positivo mayor a 0')
    })
  ).min(1, 'La venta debe incluir al menos un producto')
});
