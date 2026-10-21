import { z } from 'zod';

export const productoCreateSchema = z.object({
  codigoBarras: z.string().trim().optional().nullable(),
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  principioActivo: z.string().trim().optional().nullable(),
  presentacion: z.string().trim().min(2, 'La presentación es obligatoria'),
  laboratorio: z.string().trim().optional().nullable(),
  costo: z.coerce.number().positive('El costo debe ser un número positivo'),
  precio: z.coerce.number().positive('El precio debe ser un número positivo'),
  stockInicial: z.coerce.number().int().min(0, 'El stock inicial no puede ser negativo').default(0),
  stockMinimo: z.coerce.number().int().min(1, 'El stock mínimo debe ser al menos 1').default(5),
  lote: z.string().trim().optional().nullable(),
  fechaVencimiento: z.preprocess((val) => {
    if (!val) return null;
    if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      return new Date(`${val}T00:00:00.000-05:00`);
    }
    return new Date(val);
  }, z.date().optional().nullable()),
  imagen: z.string().url('URL de imagen inválida').optional().nullable(),
  categoriaId: z.coerce.number().int().positive('Categoría requerida'),
  proveedorId: z.coerce.number().int().positive().optional().nullable()
});

// Modificación: PROHIBIDO modificar el stock por aquí (solo mediante compras o ajustes)
export const productoUpdateSchema = productoCreateSchema.omit({ stockInicial: true });
