import prisma from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { getInicioDiaLima, getFinDiaLima } from '../utils/fechas.js';
import { obtenerAlertas } from './alertaService.js';

export async function obtenerResumenDashboard() {
  const inicioHoyLima = getInicioDiaLima();
  const finHoyLima = getFinDiaLima();

  // 1. Ventas de Hoy en horario America/Lima (Total en S/ y cantidad de tickets)
  const ventasHoy = await prisma.venta.findMany({
    where: {
      createdAt: {
        gte: inicioHoyLima,
        lte: finHoyLima
      }
    },
    select: {
      id: true,
      total: true
    }
  });

  let totalHoyDecimal = new Prisma.Decimal(0);
  for (const v of ventasHoy) {
    totalHoyDecimal = totalHoyDecimal.add(v.total);
  }

  const ventasHoyResumen = {
    total: totalHoyDecimal.toFixed(2),
    cantidad: ventasHoy.length
  };

  // 2. Ventas de los últimos 7 días (exactamente 7 objetos, con 0 en días sin ventas)
  const diasMapa = new Map();
  const diasOrdenados = [];

  for (let i = 6; i >= 0; i--) {
    const diaFecha = new Date(inicioHoyLima.getTime() - i * 86_400_000);
    const fechaStr = diaFecha.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (!diasMapa.has(fechaStr)) {
      diasMapa.set(fechaStr, {
        fecha: fechaStr,
        totalDecimal: new Prisma.Decimal(0),
        cantidad: 0
      });
      diasOrdenados.push(fechaStr);
    }
  }

  const fechaMasAntiguaStr = diasOrdenados[0];
  const inicioRango7Dias = new Date(`${fechaMasAntiguaStr}T00:00:00.000-05:00`);

  const ventas7Dias = await prisma.venta.findMany({
    where: {
      createdAt: {
        gte: inicioRango7Dias,
        lte: finHoyLima
      }
    },
    select: {
      total: true,
      createdAt: true
    }
  });

  for (const v of ventas7Dias) {
    const vFechaStr = new Date(v.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (diasMapa.has(vFechaStr)) {
      const entry = diasMapa.get(vFechaStr);
      entry.totalDecimal = entry.totalDecimal.add(v.total);
      entry.cantidad += 1;
    }
  }

  const ventasUltimos7Dias = diasOrdenados.map(f => {
    const entry = diasMapa.get(f);
    return {
      fecha: entry.fecha,
      total: entry.totalDecimal.toFixed(2),
      cantidad: entry.cantidad
    };
  });

  // 3. Top 5 productos más vendidos (id, nombre, totalUnidades, totalRecaudado)
  const agrupadoDetalles = await prisma.detalleVenta.groupBy({
    by: ['productoId'],
    _sum: {
      cantidad: true,
      subtotal: true
    },
    orderBy: {
      _sum: {
        cantidad: 'desc'
      }
    },
    take: 5
  });

  const productoIds = agrupadoDetalles.map(d => d.productoId);
  const productosInfo = await prisma.producto.findMany({
    where: { id: { in: productoIds } },
    select: { id: true, nombre: true }
  });
  const nombresMapa = new Map(productosInfo.map(p => [p.id, p.nombre]));

  const topProductos = agrupadoDetalles.map(d => {
    const subtotalDec = d._sum.subtotal ? new Prisma.Decimal(d._sum.subtotal) : new Prisma.Decimal(0);
    return {
      id: d.productoId,
      nombre: nombresMapa.get(d.productoId) || 'Desconocido',
      totalUnidades: d._sum.cantidad || 0,
      totalRecaudado: subtotalDec.toFixed(2)
    };
  });

  // 4. Conteo numérico de alertas (bajoStock, porVencer, vencidos)
  const alertas = await obtenerAlertas();
  const conteoAlertas = {
    bajoStock: alertas.conteos.bajoStock,
    porVencer: alertas.conteos.porVencer,
    vencidos: alertas.conteos.vencidos
  };

  return {
    ventasHoy: ventasHoyResumen,
    ventasUltimos7Dias,
    topProductos,
    alertas: conteoAlertas
  };
}
