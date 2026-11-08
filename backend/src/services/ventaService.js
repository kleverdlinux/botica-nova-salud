import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { ErrorNegocio } from '../utils/errores.js';
import { esProductoVencido, getInicioDiaLima, getFinDiaLima } from '../utils/fechas.js';

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

  const resultadoVenta = await prisma.$transaction(async (tx) => {
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

  // 6. Si la venta tiene clienteDoc (DNI) y no es Web Delivery, vincular pedido e incrementar Puntos Salud
  if (clienteDoc && !clienteNom?.includes('[Web')) {
    try {
      const cleanDni = String(clienteDoc).trim();
      if (cleanDni.length === 8) {
        const clienteExistente = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
        if (clienteExistente) {
          const fichaActual = (clienteExistente.fichaMedica && typeof clienteExistente.fichaMedica === 'object')
            ? clienteExistente.fichaMedica
            : {};
          const pedidosPrevios = Array.isArray(fichaActual.pedidos) ? fichaActual.pedidos : [];

          const nuevoPedidoPOS = {
            id: `NS-POS-${resultadoVenta.id}`,
            serieNumero: resultadoVenta.ticket,
            tipoComprobante: 'BOLETA',
            date: new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
            customer: {
              firstName: clienteNom || clienteExistente.nombre,
              lastName: '',
              email: clienteExistente.email,
              phone: clienteExistente.telefono || '',
              dni: cleanDni,
              address: clienteExistente.direccion || 'Juliaca Cercado',
              district: clienteExistente.distrito || 'Juliaca Cercado',
            },
            items: (resultadoVenta.detalles || []).map(d => ({
              id: String(d.productoId),
              name: d.producto?.nombre || 'Producto Farmacéutico',
              presentation: d.producto?.presentacion || 'Unidad',
              quantity: d.cantidad,
              price: Number(d.precioUnitario),
              subtotal: Number(d.subtotal),
              image: '/media/botica-hero-clean.jpg'
            })),
            subtotal: Number(resultadoVenta.total),
            shipping: 0,
            total: Number(resultadoVenta.total),
            paymentMethod: metodoPago,
            paymentDetails: metodoPago === 'YAPE_PLIN' ? 'Yape / Plin POS' : metodoPago === 'TARJETA' ? 'Tarjeta Débito / Crédito POS' : 'Efectivo en Caja Mostrador',
            status: 'ENTREGADO'
          };

          const pedidosActualizados = [
            nuevoPedidoPOS,
            ...pedidosPrevios.filter(p => p.id !== nuevoPedidoPOS.id && p.serieNumero !== nuevoPedidoPOS.serieNumero)
          ];

          const puntosPrevios = typeof fichaActual.puntos === 'number'
            ? fichaActual.puntos
            : Math.max(50, pedidosPrevios.length * 25 + 50);

          await prisma.cliente.update({
            where: { dni: cleanDni },
            data: {
              fichaMedica: {
                ...fichaActual,
                pedidos: pedidosActualizados,
                puntos: puntosPrevios + 25
              }
            }
          });
        }
      }
    } catch (errPuntos) {
      console.warn('Error al vincular puntos o comprobante POS al cliente:', errPuntos.message);
    }
  }

  return resultadoVenta;
}

export async function listarVentas({ rol, usuarioId, page = 1, limit = 20, fechaInicio, fechaFin, metodoPago, busqueda }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};
  // Si es cajero, solo visualiza sus propias ventas realizadas hoy en horario Lima
  if (rol === 'CAJERO') {
    where.usuarioId = usuarioId;
    where.createdAt = {
      gte: getInicioDiaLima(),
      lte: getFinDiaLima()
    };
  } else if (fechaInicio || fechaFin) {
    where.createdAt = {};
    if (fechaInicio) where.createdAt.gte = new Date(fechaInicio);
    if (fechaFin) {
      const fFin = new Date(fechaFin);
      fFin.setHours(23, 59, 59, 999);
      where.createdAt.lte = fFin;
    }
  }

  if (metodoPago && ['EFECTIVO', 'YAPE_PLIN', 'TARJETA'].includes(metodoPago)) {
    where.metodoPago = metodoPago;
  }

  if (busqueda && busqueda.trim()) {
    const q = busqueda.trim();
    const cleanNum = q.replace(/^T-0*/i, '').replace(/\D/g, '');
    const numId = cleanNum ? parseInt(cleanNum, 10) : null;

    where.OR = [
      { clienteNom: { contains: q, mode: 'insensitive' } },
      { clienteDoc: { contains: q, mode: 'insensitive' } },
      ...(numId && !isNaN(numId) ? [{ id: numId }] : [])
    ];
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
