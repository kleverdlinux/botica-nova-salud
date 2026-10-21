import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';

export async function registrarEntrada({ productoId, cantidad, motivo, usuarioId }) {
  const pId = parseInt(productoId, 10);
  const cant = parseInt(cantidad, 10);

  if (isNaN(pId) || pId <= 0) throw new ErrorNegocio('ID de producto inválido.', 400);
  if (isNaN(cant) || cant <= 0) throw new ErrorNegocio('La cantidad a ingresar debe ser mayor a 0.', 400);

  return await prisma.$transaction(async (tx) => {
    // 1. Incremento atómico directo (elimina cualquier condición de carrera)
    const actualizado = await tx.producto.update({
      where: { id: pId, activo: true },
      data: { stock: { increment: cant } },
      select: { id: true, stock: true, nombre: true }
    });

    const stockNuevo = actualizado.stock;
    const stockAnterior = stockNuevo - cant;

    // 2. Registro obligatorio en el Kardex
    const kardex = await tx.movimientoInventario.create({
      data: {
        productoId: pId,
        usuarioId,
        tipo: 'ENTRADA',
        cantidad: cant,
        motivo,
        stockAnterior,
        stockNuevo
      }
    });

    return {
      productoId: pId,
      nombre: actualizado.nombre,
      cantidadIngresada: cant,
      stockAnterior,
      stockNuevo,
      kardexId: kardex.id
    };
  });
}

export async function registrarAjuste({ productoId, stockReal, motivo, usuarioId }) {
  const pId = parseInt(productoId, 10);
  const sReal = parseInt(stockReal, 10);

  if (isNaN(pId) || pId <= 0) throw new ErrorNegocio('ID de producto inválido.', 400);
  if (isNaN(sReal) || sReal < 0) throw new ErrorNegocio('El stock físico no puede ser negativo.', 400);

  return await prisma.$transaction(async (tx) => {
    const prod = await tx.producto.findUnique({
      where: { id: pId, activo: true },
      select: { id: true, stock: true, nombre: true }
    });

    if (!prod) {
      throw new ErrorNegocio('Producto no encontrado o inactivo.', 404);
    }

    const stockActual = prod.stock;

    // Validación solicitada: si el stock físico es idéntico al actual, da 400
    if (stockActual === sReal) {
      throw new ErrorNegocio('El stock real ingresado es idéntico al stock del sistema. No requiere ajuste.', 400);
    }

    const diferencia = Math.abs(sReal - stockActual);

    // Concurrencia optimista: solo actualiza si el stock no mutó mientras se contaba
    const res = await tx.producto.updateMany({
      where: {
        id: pId,
        stock: stockActual
      },
      data: { stock: sReal }
    });

    if (res.count === 0) {
      throw new ErrorNegocio(
        'El stock cambió mientras se realizaba el ajuste (posible venta simultánea). Vuelva a verificar el stock físico.',
        409
      );
    }

    const kardex = await tx.movimientoInventario.create({
      data: {
        productoId: pId,
        usuarioId,
        tipo: 'AJUSTE',
        cantidad: diferencia,
        motivo: `${motivo} (Ajuste físico: de ${stockActual} a ${sReal})`,
        stockAnterior: stockActual,
        stockNuevo: sReal
      }
    });

    return {
      productoId: pId,
      nombre: prod.nombre,
      stockAnterior: stockActual,
      stockNuevo: sReal,
      diferencia,
      kardexId: kardex.id
    };
  });
}

export async function obtenerKardexPorProducto(productoId, { page = 1, limit = 20 }) {
  const pId = parseInt(productoId, 10);
  if (isNaN(pId)) throw new ErrorNegocio('ID de producto inválido.', 400);

  const prod = await prisma.producto.findUnique({
    where: { id: pId },
    select: { id: true, nombre: true, stock: true, codigoBarras: true }
  });

  if (!prod) throw new ErrorNegocio('Producto no encontrado.', 404);

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const [total, movimientos] = await Promise.all([
    prisma.movimientoInventario.count({ where: { productoId: pId } }),
    prisma.movimientoInventario.findMany({
      where: { productoId: pId },
      skip,
      take: l,
      include: {
        usuario: { select: { id: true, nombre: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    producto: prod,
    total,
    paginaActual: p,
    totalPaginas: Math.ceil(total / l),
    movimientos
  };
}
