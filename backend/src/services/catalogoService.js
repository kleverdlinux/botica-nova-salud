import prisma from '../lib/prisma.js';
import { esProductoVencido } from '../utils/fechas.js';

export async function obtenerCatalogoPublico() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      presentacion: true,
      principioActivo: true,
      precio: true,
      imagen: true,
      stock: true,             // Se lee internamente para calcular "disponible" y se descarta
      fechaVencimiento: true,  // Se lee internamente para evaluar vencimiento y se descarta
      categoria: {
        select: {
          id: true,
          nombre: true
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  // Mapeo seguro y limpio:
  // Solo se exponen: id, nombre, presentacion, principioActivo, precio, imagen, categoria y disponible.
  // Se excluyen estrictamente: costo, proveedor, fechaVencimiento, codigoBarras, laboratorio y stock numérico.
  return productos.map(({ stock, fechaVencimiento, ...resto }) => {
    const estaVencido = esProductoVencido(fechaVencimiento);
    const disponible = stock > 0 && !estaVencido;

    return {
      ...resto,
      disponible
    };
  });
}
