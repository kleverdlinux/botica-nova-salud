import prisma from '../lib/prisma.js';

export async function obtenerCatalogoPublico() {
  const hoy = new Date();

  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: {
      id: true,
      codigoBarras: true,
      nombre: true,
      principioActivo: true,
      presentacion: true,
      laboratorio: true,
      precio: true,
      stock: true, // Se lee temporalmente para computar "disponible" y se descarta
      fechaVencimiento: true,
      imagen: true,
      categoria: {
        select: {
          id: true,
          nombre: true
        }
      }
    },
    orderBy: { nombre: 'asc' }
  });

  // Mapeo seguro: costo y proveedor JAMÁS salen del backend.
  // "stock" numérico se reemplaza por "disponible: true | false".
  // Los medicamentos vencidos SIEMPRE salen con "disponible: false".
  return productos.map(({ stock, fechaVencimiento, ...resto }) => {
    const estaVencido = fechaVencimiento && new Date(fechaVencimiento) <= hoy;
    const disponible = stock > 0 && !estaVencido;

    return {
      ...resto,
      fechaVencimiento,
      disponible
    };
  });
}
