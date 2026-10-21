import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { ErrorNegocio } from '../utils/errores.js';
import { esProductoVencido, getInicioDiaLima } from '../utils/fechas.js';

export async function crearVenta({ items, usuarioId, metodoPago = 'EFECTIVO', clienteDoc, clienteNom }) {
  if (!items || items.length === 0) {
    throw new ErrorNegocio('La venta debe incluir al menos un producto.', 400);
  }

  // 1. Consolidar productos repetidos y validar cantidades enteras positivas
  const mapaItems = new Map();
  for (const item of items) {
    const pId = parseInt(item.productoId, 10);
    const cant = parseInt(item.cantidad, 10);

    if (isNaN(pId) || pId <= 0) {
      throw new ErrorNegocio(`ID de producto inválido: ${item.productoId}`, 400);
    }
    if (isNaN(cant) || cant <= 0) {
      throw new ErrorNegocio(`La cantidad para el producto ID ${pId} debe ser mayor a 0.`, 400);
    }

    const acumulado = mapaItems.get(pId) || 0;
    mapaItems.set(pId, acumulado + cant);
  }

  // 2. Ordenar por productoId ascendente para prevenir deadlocks en ventas concurrentes
  const itemsConsolidados = Array.from(mapaItems.entries())
    .map(([productoId, cantidad]) => ({ productoId, cantidad }))
    .sort((a, b) => a.productoId - b.productoId);

  const inicioHoyLima = getInicioDiaLima();

  return await prisma.$transaction(async (tx) => {
    const productoIds = itemsConsolidados.map(i => i.productoId);
    const productosDB = await tx.producto.findMany({
      where: { id: { in: productoIds }, activo: true }
    });

    if (productosDB.length !== itemsConsolidados.length) {
      throw new ErrorNegocio('Uno o más productos solicitados no existen o están inactivos.', 404);
    }

    const mapaProductos = new Map(productosDB.map(p => [p.id, p]));
    let totalVenta = new Prisma.Decimal(0);
    const detallesData = [];

    // 3. Validar vencimientos y calcular precios oficiales exclusivamente desde la base de datos
    for (const item of itemsConsolidados) {
      const prod = mapaProductos.get(item.productoId);

      // Verificación estricta de vencimiento contra la fecha local de Lima
      if (esProductoVencido(prod.fechaVencimiento)) {
        throw new ErrorNegocio(`El producto "${prod.nombre}" está vencido y no se puede vender.`, 409);
      }

      const cantidadDecimal = new Prisma.Decimal(item.cantidad);
      // El precio proviene 100% de la BD (ignora cualquier precio manipulado enviado desde el cliente)
      const subtotal = prod.precio.mul(cantidadDecimal);
      totalVenta = totalVenta.add(subtotal);

      detallesData.push({
        productoId: prod.id,
        cantidad: item.cantidad,
        precioUnitario: prod.precio,
        subtotal
      });
    }

    // 4. Registrar cabecera y detalles de la venta
    const venta = await tx.venta.create({
      data: {
        total: totalVenta,
        metodoPago,
        clienteDoc: clienteDoc ? clienteDoc.trim() : null,
        clienteNom: clienteNom ? clienteNom.trim() : null,
        usuarioId,
        detalles: { create: detallesData }
      },
      include: {
        detalles: {
          include: {
            producto: { select: { id: true, nombre: true, presentacion: true } }
          }
        },
        usuario: { select: { id: true, nombre: true } }
      }
    });

    const ticket = `T-${String(venta.id).padStart(6, '0')}`;

    // 5. Descuento atómico de stock y registro en Kardex en orden determinístico
    for (const item of itemsConsolidados) {
      const prod = mapaProductos.get(item.productoId);

      // updateMany condicional: valida stock suficiente y no vencido
      const res = await tx.producto.updateMany({
        where: {
          id: item.productoId,
          activo: true,
          stock: { gte: item.cantidad },
          OR: [
            { fechaVencimiento: null },
            { fechaVencimiento: { gte: inicioHoyLima } }
          ]
        },
        data: {
          stock: { decrement: item.cantidad }
        }
      });

      if (res.count === 0) {
        throw new ErrorNegocio(
          `Stock insuficiente para el producto "${prod.nombre}". No se pudo concretar la venta.`,
          409
        );
      }

      // Leer stock posterior al descuento dentro de la misma transacción
      const prodActualizado = await tx.producto.findUnique({
        where: { id: item.productoId },
        select: { stock: true }
      });

      const stockNuevo = prodActualizado.stock;
      const stockAnterior = stockNuevo + item.cantidad;

      // Registrar movimiento de Kardex
      await tx.movimientoInventario.create({
        data: {
          productoId: item.productoId,
          usuarioId,
          tipo: 'SALIDA',
          cantidad: item.cantidad,
          motivo: `Venta ${ticket}`,
          stockAnterior,
          stockNuevo
        }
      });
    }

    return {
      ...venta,
      ticket
    };
  });
}

export async function listarVentas({ rol, usuarioId, page = 1, limit = 20 }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};
  // Si es cajero, solo visualiza sus propias ventas
  if (rol === 'CAJERO') {
    where.usuarioId = usuarioId;
  }

  const [total, ventas] = await Promise.all([
    prisma.venta.count({ where }),
    prisma.venta.findMany({
      where,
      skip,
      take: l,
      include: {
        usuario: { select: { id: true, nombre: true } },
        detalles: {
          include: {
            producto: { select: { id: true, nombre: true } }
          }
        }
      },
      orderBy: { id: 'desc' }
    })
  ]);

  return {
    total,
    paginaActual: p,
    totalPaginas: Math.ceil(total / l),
    ventas: ventas.map(v => ({
      ...v,
      ticket: `T-${String(v.id).padStart(6, '0')}`
    }))
  };
}

export async function obtenerVentaPorId(id, rol, usuarioId) {
  const ventaId = parseInt(id, 10);
  if (isNaN(ventaId)) throw new ErrorNegocio('ID de venta inválido.', 400);

  const venta = await prisma.venta.findUnique({
    where: { id: ventaId },
    include: {
      usuario: { select: { id: true, nombre: true } },
      detalles: {
        include: {
          producto: {
            select: {
              id: true,
              nombre: true,
              presentacion: true,
              codigoBarras: true,
              laboratorio: true
            }
          }
        }
      }
    }
  });

  if (!venta) throw new ErrorNegocio('Venta no encontrada.', 404);

  // Si es cajero, solo puede reimprimir o consultar sus propias ventas
  if (rol === 'CAJERO' && venta.usuarioId !== usuarioId) {
    throw new ErrorNegocio('Acceso denegado: no puedes acceder a ventas de otros usuarios.', 403);
  }

  return {
    ...venta,
    ticket: `T-${String(venta.id).padStart(6, '0')}`
  };
}
