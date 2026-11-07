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

  const cantidadHoy = ventasHoy.length;
  const totalHoyNum = Number(totalHoyDecimal);
  const promedioTicketHoy = cantidadHoy > 0 ? (totalHoyNum / cantidadHoy) : 0;

  // 1b. Ventas de Ayer (para calcular tendencia porcentual fidedigna)
  const inicioAyerLima = new Date(inicioHoyLima.getTime() - 86_400_000);
  const finAyerLima = new Date(finHoyLima.getTime() - 86_400_000);

  const ventasAyer = await prisma.venta.findMany({
    where: {
      createdAt: {
        gte: inicioAyerLima,
        lte: finAyerLima
      }
    },
    select: { total: true }
  });

  let totalAyerDecimal = new Prisma.Decimal(0);
  for (const v of ventasAyer) {
    totalAyerDecimal = totalAyerDecimal.add(v.total);
  }
  const totalAyerNum = Number(totalAyerDecimal);

  let porcentajeTendencia = 0;
  if (totalAyerNum > 0) {
    porcentajeTendencia = Math.round(((totalHoyNum - totalAyerNum) / totalAyerNum) * 100);
  } else if (totalHoyNum > 0) {
    porcentajeTendencia = 100;
  }

  const ventasHoyResumen = {
    total: totalHoyDecimal.toFixed(2),
    cantidad: cantidadHoy,
    promedioTicket: promedioTicketHoy.toFixed(2),
    ventasAyer: totalAyerDecimal.toFixed(2),
    tendencia: {
      porcentaje: Math.abs(porcentajeTendencia),
      esPositivo: totalHoyNum >= totalAyerNum,
      diferencia: (totalHoyNum - totalAyerNum).toFixed(2)
    }
  };

  // 2. Ventas de los últimos 7 días (con nombres de días abreviados)
  const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasMapa = new Map();
  const diasOrdenados = [];

  for (let i = 6; i >= 0; i--) {
    const diaFecha = new Date(inicioHoyLima.getTime() - i * 86_400_000);
    const fechaStr = diaFecha.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    const diaSemana = diasSemanaNombres[diaFecha.getDay()];
    if (!diasMapa.has(fechaStr)) {
      diasMapa.set(fechaStr, {
        fecha: fechaStr,
        diaSemana,
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
      diaSemana: entry.diaSemana,
      total: entry.totalDecimal.toFixed(2),
      cantidad: entry.cantidad
    };
  });

  // 2b. Flujo de Kardex Real de los últimos 7 días (Entradas vs Salidas auditadas en PostgreSQL)
  const kardexMapa = new Map();
  for (const fStr of diasOrdenados) {
    kardexMapa.set(fStr, {
      entradas: 0,
      salidas: 0,
      ajustes: 0
    });
  }

  const movimientos7Dias = await prisma.movimientoInventario.findMany({
    where: {
      createdAt: {
        gte: inicioRango7Dias,
        lte: finHoyLima
      }
    },
    select: {
      tipo: true,
      cantidad: true,
      createdAt: true
    }
  });

  for (const m of movimientos7Dias) {
    const mFechaStr = new Date(m.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (kardexMapa.has(mFechaStr)) {
      const entry = kardexMapa.get(mFechaStr);
      if (m.tipo === 'ENTRADA') entry.entradas += m.cantidad;
      else if (m.tipo === 'SALIDA') entry.salidas += m.cantidad;
      else if (m.tipo === 'AJUSTE') entry.ajustes += m.cantidad;
    }
  }

  const kardexUltimos7Dias = diasOrdenados.map(f => {
    const entry = kardexMapa.get(f);
    const diaEntry = diasMapa.get(f);
    return {
      fecha: f,
      diaSemana: diaEntry?.diaSemana || '',
      entradas: entry.entradas,
      salidas: entry.salidas,
      ajustes: entry.ajustes
    };
  });

  // 2c. Series Temporales 100% Reales basadas en transacciones de PostgreSQL (7d, 30d, 90d)
  const generarSerieTemporal = async (numDias) => {
    const mapa = new Map();
    const fechas = [];
    const diasSem = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

    for (let i = numDias - 1; i >= 0; i--) {
      const d = new Date(inicioHoyLima.getTime() - i * 86_400_000);
      const fStr = d.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
      const diaNum = d.getDate();
      const mesStr = meses[d.getMonth()];
      const etiqueta = numDias <= 7 ? `${diasSem[d.getDay()]} ${diaNum}` : `${diaNum} ${mesStr}`;

      mapa.set(fStr, {
        fecha: fStr,
        etiqueta,
        totalDecimal: new Prisma.Decimal(0),
        cantidad: 0
      });
      fechas.push(fStr);
    }

    const fechaInicio = new Date(`${fechas[0]}T00:00:00.000-05:00`);
    const ventasReales = await prisma.venta.findMany({
      where: {
        createdAt: {
          gte: fechaInicio,
          lte: finHoyLima
        }
      },
      select: { total: true, createdAt: true }
    });

    for (const v of ventasReales) {
      const fStr = new Date(v.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
      if (mapa.has(fStr)) {
        const item = mapa.get(fStr);
        item.totalDecimal = item.totalDecimal.add(v.total);
        item.cantidad += 1;
      }
    }

    let sumaTotal = 0;
    let sumaTickets = 0;

    const puntos = fechas.map(f => {
      const item = mapa.get(f);
      const totNum = Number(item.totalDecimal);
      sumaTotal += totNum;
      sumaTickets += item.cantidad;
      return {
        fecha: item.fecha,
        etiqueta: item.etiqueta,
        total: totNum,
        cantidad: item.cantidad
      };
    });

    return {
      puntos,
      resumen: {
        totalFacturado: sumaTotal.toFixed(2),
        totalTickets: sumaTickets
      }
    };
  };

  const seriesTemporales = {
    dias7: await generarSerieTemporal(7),
    dias30: await generarSerieTemporal(30),
    dias90: await generarSerieTemporal(90)
  };

  // 3. Top 5 productos más vendidos (con laboratorio y categoría)
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
    select: {
      id: true,
      nombre: true,
      laboratorio: true,
      stock: true,
      categoria: { select: { nombre: true } }
    }
  });
  const prodsMap = new Map(productosInfo.map(p => [p.id, p]));

  const topProductos = agrupadoDetalles.map(d => {
    const pInfo = prodsMap.get(d.productoId);
    const subtotalDec = d._sum.subtotal ? new Prisma.Decimal(d._sum.subtotal) : new Prisma.Decimal(0);
    return {
      id: d.productoId,
      nombre: pInfo?.nombre || 'Producto Desconocido',
      laboratorio: pInfo?.laboratorio || 'Genérico',
      categoria: pInfo?.categoria?.nombre || 'Farmacia',
      stockActual: pInfo?.stock ?? 0,
      totalUnidades: d._sum.cantidad || 0,
      totalRecaudado: subtotalDec.toFixed(2)
    };
  });

  // 4. Métricas globales de Inventario Valorizado (120 productos sincronizados)
  const totalProductosActivos = await prisma.producto.count({ where: { activo: true } });
  const inventarioTodos = await prisma.producto.findMany({
    where: { activo: true },
    select: { stock: true, precio: true, costo: true }
  });

  let totalUnidadesInventario = 0;
  let valorizadoVentaDec = new Prisma.Decimal(0);
  let valorizadoCostoDec = new Prisma.Decimal(0);

  for (const item of inventarioTodos) {
    totalUnidadesInventario += item.stock;
    const unidadesDec = new Prisma.Decimal(item.stock);
    valorizadoVentaDec = valorizadoVentaDec.add(unidadesDec.mul(item.precio));
    valorizadoCostoDec = valorizadoCostoDec.add(unidadesDec.mul(item.costo));
  }

  // 5. Últimas ventas en tiempo real (Live Feed transaccional)
  const ultimasVentasRaw = await prisma.venta.findMany({
    orderBy: { createdAt: 'desc' },
    take: 6,
    include: {
      usuario: { select: { nombre: true, rol: true } },
      detalles: {
        select: {
          cantidad: true,
          producto: { select: { nombre: true } }
        }
      }
    }
  });

  const ultimasVentas = ultimasVentasRaw.map(v => ({
    id: v.id,
    total: Number(v.total).toFixed(2),
    metodoPago: v.metodoPago,
    clienteNom: v.clienteNom || 'Cliente Mostrador',
    clienteDoc: v.clienteDoc || 'S/DNI',
    createdAt: v.createdAt,
    cajero: v.usuario?.nombre || 'Cajero',
    totalArticulos: v.detalles.reduce((acc, curr) => acc + curr.cantidad, 0),
    resumenProductos: v.detalles.map(d => `${d.cantidad}x ${d.producto.nombre}`).slice(0, 2).join(', ')
  }));

  // 6. Conteo numérico de alertas (bajoStock, porVencer, vencidos)
  const alertas = await obtenerAlertas();
  const conteoAlertas = {
    bajoStock: alertas.conteos.bajoStock,
    porVencer: alertas.conteos.porVencer,
    vencidos: alertas.conteos.vencidos
  };

  // 7. Distribución Real de Categorías (De los 120 medicamentos activos en PostgreSQL)
  const categoriasConProductos = await prisma.categoria.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      productos: {
        where: { activo: true },
        select: { stock: true, precio: true }
      }
    }
  });

  const distribucionCategorias = categoriasConProductos
    .map(c => {
      const totalItems = c.productos.length;
      const totalStock = c.productos.reduce((acc, p) => acc + p.stock, 0);
      const totalValor = c.productos.reduce((acc, p) => acc + (Number(p.precio) * p.stock), 0);
      return {
        id: c.id,
        nombre: c.nombre,
        totalItems,
        totalStock,
        totalValor: totalValor.toFixed(2)
      };
    })
    .filter(c => c.totalItems > 0)
    .sort((a, b) => b.totalStock - a.totalStock);

  // 8. Fármacos Esenciales de Mayor Disponibilidad en Mostrador (120 reales)
  const medicamentosDestacados = await prisma.producto.findMany({
    where: { activo: true },
    take: 6,
    orderBy: { stock: 'desc' },
    select: {
      id: true,
      nombre: true,
      principioActivo: true,
      presentacion: true,
      laboratorio: true,
      precio: true,
      stock: true,
      imagen: true,
      lote: true,
      fechaVencimiento: true,
      categoria: { select: { nombre: true } }
    }
  });

  // 9. Auditoría de Kardex en Vivo (Movimientos reales en almacén para vista colapsable/expandible)
  const movimientosRecientesRaw = await prisma.movimientoInventario.findMany({
    take: 12,
    orderBy: { createdAt: 'desc' },
    include: {
      producto: { select: { nombre: true, presentacion: true, imagen: true } },
      usuario: { select: { nombre: true, rol: true } }
    }
  });

  const movimientosRecientes = movimientosRecientesRaw.map(m => ({
    id: m.id,
    tipo: m.tipo,
    cantidad: m.cantidad,
    motivo: m.motivo || 'Movimiento de inventario',
    createdAt: m.createdAt,
    productoNombre: m.producto?.nombre || 'Producto',
    productoPresentacion: m.producto?.presentacion || '',
    productoImagen: m.producto?.imagen || null,
    usuarioNombre: m.usuario?.nombre || 'Administrador General',
    usuarioRol: m.usuario?.rol || 'ADMIN'
  }));

  return {
    ventasHoy: ventasHoyResumen,
    ventasUltimos7Dias,
    kardexUltimos7Dias,
    seriesTemporales,
    topProductos,
    alertas: conteoAlertas,
    inventarioMetricas: {
      totalProductos: totalProductosActivos,
      totalUnidades: totalUnidadesInventario,
      valorizadoVenta: valorizadoVentaDec.toFixed(2),
      valorizadoCosto: valorizadoCostoDec.toFixed(2)
    },
    ultimasVentas,
    distribucionCategorias,
    medicamentosDestacados,
    movimientosRecientes
  };
}

/**
 * Resumen especializado de métricas, alertas sanitarias y movimientos para el rol ALMACÉN
 */
export async function obtenerResumenAlmacen() {
  const inicioHoyLima = getInicioDiaLima();
  const finHoyLima = getFinDiaLima();
  const ahoraMs = inicioHoyLima.getTime();
  const msEnDia = 86_400_000;

  // 1. Catálogo de productos activos con su categoría y stock
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: {
      categoria: { select: { id: true, nombre: true } }
    }
  });

  const totalProductosActivos = productos.length;
  let totalUnidadesFisicas = 0;
  let valorizadoCostoTotal = new Prisma.Decimal(0);
  let stockCritico = 0;
  let quiebreStock = 0;

  // Semáforo FEFO Sanitario (DIGEMID)
  let caducados = 0;
  let en30Dias = 0;
  let en60Dias = 0;
  let en90Dias = 0;
  let vigentes = 0;

  const categoriasMap = new Map();

  for (const p of productos) {
    const stock = p.stock || 0;
    totalUnidadesFisicas += stock;
    const costo = p.costo ? new Prisma.Decimal(p.costo) : new Prisma.Decimal(0);
    valorizadoCostoTotal = valorizadoCostoTotal.add(costo.mul(stock));

    if (stock === 0) {
      quiebreStock++;
    } else if (stock <= p.stockMinimo) {
      stockCritico++;
    }

    if (p.fechaVencimiento) {
      const vDate = new Date(p.fechaVencimiento);
      const diffDias = Math.floor((vDate.getTime() - ahoraMs) / msEnDia);
      if (diffDias < 0) {
        caducados++;
      } else if (diffDias <= 30) {
        en30Dias++;
      } else if (diffDias <= 60) {
        en60Dias++;
      } else if (diffDias <= 90) {
        en90Dias++;
      } else {
        vigentes++;
      }
    } else {
      vigentes++;
    }

    const catNombre = p.categoria?.nombre || 'General';
    if (!categoriasMap.has(catNombre)) {
      categoriasMap.set(catNombre, { nombre: catNombre, productos: 0, unidades: 0 });
    }
    const catData = categoriasMap.get(catNombre);
    catData.productos += 1;
    catData.unidades += stock;
  }

  // Distribución de categorías ordenadas por unidades físicas desc
  const distribucionCategorias = Array.from(categoriasMap.values())
    .sort((a, b) => b.unidades - a.unidades);

  // 2. Movimientos de Kardex Hoy en Almacén
  const movimientosHoy = await prisma.movimientoInventario.findMany({
    where: {
      createdAt: {
        gte: inicioHoyLima,
        lte: finHoyLima
      }
    }
  });

  let entradasHoyUnidades = 0;
  let entradasHoyCount = 0;
  let salidasHoyUnidades = 0;
  let salidasHoyCount = 0;
  let ajustesHoyUnidades = 0;
  let ajustesHoyCount = 0;

  for (const m of movimientosHoy) {
    if (m.tipo === 'ENTRADA') {
      entradasHoyUnidades += m.cantidad;
      entradasHoyCount++;
    } else if (m.tipo === 'SALIDA') {
      salidasHoyUnidades += m.cantidad;
      salidasHoyCount++;
    } else if (m.tipo === 'AJUSTE') {
      ajustesHoyUnidades += m.cantidad;
      ajustesHoyCount++;
    }
  }

  // 3. Kardex últimos 7 días (para gráfico de tendencia)
  const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const kardex7DiasMapa = new Map();
  const fechas7Dias = [];

  for (let i = 6; i >= 0; i--) {
    const diaFecha = new Date(inicioHoyLima.getTime() - i * msEnDia);
    const fechaStr = diaFecha.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    const diaSemana = diasSemanaNombres[diaFecha.getDay()];
    kardex7DiasMapa.set(fechaStr, {
      fecha: fechaStr,
      diaSemana,
      entradas: 0,
      salidas: 0,
      ajustes: 0
    });
    fechas7Dias.push(fechaStr);
  }

  const inicioRango7Dias = new Date(`${fechas7Dias[0]}T00:00:00.000-05:00`);
  const movimientos7Dias = await prisma.movimientoInventario.findMany({
    where: {
      createdAt: {
        gte: inicioRango7Dias,
        lte: finHoyLima
      }
    }
  });

  for (const m of movimientos7Dias) {
    const fStr = new Date(m.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (kardex7DiasMapa.has(fStr)) {
      const item = kardex7DiasMapa.get(fStr);
      if (m.tipo === 'ENTRADA') item.entradas += m.cantidad;
      else if (m.tipo === 'SALIDA') item.salidas += m.cantidad;
      else if (m.tipo === 'AJUSTE') item.ajustes += m.cantidad;
    }
  }

  const kardex7Dias = fechas7Dias.map(f => kardex7DiasMapa.get(f));

  // 4. Tablas Operativas para Almacén:
  // a) Fármacos en quiebre o stock crítico
  const productosPorReponer = productos
    .filter(p => p.stock <= p.stockMinimo)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      presentacion: p.presentacion,
      laboratorio: p.laboratorio || 'Genérico',
      stock: p.stock,
      stockMinimo: p.stockMinimo,
      lote: p.lote || 'S/L',
      estadoStock: p.stock === 0 ? 'QUIEBRE' : 'CRITICO'
    }));

  // b) Próximos vencimientos FEFO
  const proximosVencimientos = productos
    .filter(p => p.fechaVencimiento !== null)
    .sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime())
    .slice(0, 10)
    .map(p => {
      const vDate = new Date(p.fechaVencimiento);
      const diffDias = Math.floor((vDate.getTime() - ahoraMs) / msEnDia);
      return {
        id: p.id,
        nombre: p.nombre,
        presentacion: p.presentacion,
        lote: p.lote || 'S/L',
        stock: p.stock,
        fechaVencimiento: p.fechaVencimiento,
        diasRestantes: diffDias,
        estadoSemaforo: diffDias < 0 ? 'CADUCADO' : diffDias <= 30 ? 'CRITICO' : diffDias <= 60 ? 'ALERTA' : 'VIGENTE'
      };
    });

  // c) Últimos movimientos de Kardex
  const ultimosMovimientosRaw = await prisma.movimientoInventario.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      producto: { select: { nombre: true, presentacion: true, lote: true } },
      usuario: { select: { nombre: true, rol: true } }
    }
  });

  const ultimosMovimientos = ultimosMovimientosRaw.map(m => ({
    id: m.id,
    tipo: m.tipo,
    cantidad: m.cantidad,
    motivo: m.motivo || 'Movimiento de Kardex',
    stockAnterior: m.stockAnterior,
    stockNuevo: m.stockNuevo,
    createdAt: m.createdAt,
    productoNombre: m.producto?.nombre || 'Producto',
    productoPresentacion: m.producto?.presentacion || '',
    productoLote: m.producto?.lote || 'S/L',
    usuarioNombre: m.usuario?.nombre || 'Responsable'
  }));

  return {
    metricas: {
      totalProductosActivos,
      totalUnidadesFisicas,
      valorizadoCostoTotal: valorizadoCostoTotal.toFixed(2),
      stockCritico,
      quiebreStock,
      totalAlertasStock: stockCritico + quiebreStock,
      semaforoFEFO: {
        caducados,
        en30Dias,
        en60Dias,
        en90Dias,
        vigentes,
        totalRiesgo: caducados + en30Dias + en60Dias
      },
      kardexHoy: {
        entradas: { unidades: entradasHoyUnidades, conteo: entradasHoyCount },
        salidas: { unidades: salidasHoyUnidades, conteo: salidasHoyCount },
        ajustes: { unidades: ajustesHoyUnidades, conteo: ajustesHoyCount }
      }
    },
    graficos: {
      distribucionCategorias,
      semaforoFEFO: [
        { etiqueta: 'Vigentes (>90d)', valor: vigentes, color: '#10b981' },
        { etiqueta: 'Atención (60-90d)', valor: en90Dias, color: '#3b82f6' },
        { etiqueta: 'Alerta (30-60d)', valor: en60Dias, color: '#f59e0b' },
        { etiqueta: 'Crítico (<=30d)', valor: en30Dias, color: '#f97316' },
        { etiqueta: 'Caducados', valor: caducados, color: '#ef4444' }
      ],
      kardex7Dias
    },
    tablas: {
      productosPorReponer,
      proximosVencimientos,
      ultimosMovimientos
    }
  };
}

/**
 * Resumen especializado de turno, arqueo de mostrador y velocidad de cobro para el rol CAJERO
 */
export async function obtenerResumenCajero(usuarioId, esAdmin = false) {
  const inicioHoyLima = getInicioDiaLima();
  const finHoyLima = getFinDiaLima();

  const whereVentaHoy = {
    createdAt: {
      gte: inicioHoyLima,
      lte: finHoyLima
    }
  };
  if (!esAdmin && usuarioId) {
    whereVentaHoy.usuarioId = Number(usuarioId);
  }

  const ventasHoy = await prisma.venta.findMany({
    where: whereVentaHoy,
    include: {
      detalles: {
        include: {
          producto: { select: { id: true, nombre: true, presentacion: true } }
        }
      },
      usuario: { select: { nombre: true, rol: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  let totalCobrado = new Prisma.Decimal(0);
  let totalEfectivo = new Prisma.Decimal(0);
  let totalYapePlin = new Prisma.Decimal(0);
  let totalTarjeta = new Prisma.Decimal(0);

  let boletasCount = 0;
  let facturasCount = 0;
  let ticketsCount = 0;

  // Mapa de ventas por hora hoy (de 08:00 a 22:00)
  const horasMapa = new Map();
  for (let h = 8; h <= 22; h++) {
    const horaLabel = `${h.toString().padStart(2, '0')}:00`;
    horasMapa.set(horaLabel, { hora: horaLabel, totalDecimal: new Prisma.Decimal(0), cantidad: 0 });
  }

  const productosDispensadosMap = new Map();

  for (const v of ventasHoy) {
    totalCobrado = totalCobrado.add(v.total);

    if (v.metodoPago === 'EFECTIVO') totalEfectivo = totalEfectivo.add(v.total);
    else if (v.metodoPago === 'YAPE_PLIN') totalYapePlin = totalYapePlin.add(v.total);
    else if (v.metodoPago === 'TARJETA') totalTarjeta = totalTarjeta.add(v.total);

    if (v.clienteDoc && v.clienteDoc.length === 11) {
      facturasCount++;
    } else if (v.clienteDoc && v.clienteDoc.length === 8) {
      boletasCount++;
    } else {
      ticketsCount++;
    }

    const fechaHoraLima = new Date(v.createdAt).toLocaleTimeString('es-PE', {
      timeZone: 'America/Lima',
      hour: '2-digit',
      hour12: false
    });
    const horaEntera = parseInt(fechaHoraLima, 10);
    const horaKey = `${horaEntera.toString().padStart(2, '0')}:00`;
    if (horasMapa.has(horaKey)) {
      const hd = horasMapa.get(horaKey);
      hd.totalDecimal = hd.totalDecimal.add(v.total);
      hd.cantidad++;
    }

    for (const d of v.detalles) {
      const pId = d.productoId;
      const pNom = d.producto?.nombre || 'Producto';
      const pPres = d.producto?.presentacion || '';
      if (!productosDispensadosMap.has(pId)) {
        productosDispensadosMap.set(pId, { id: pId, nombre: pNom, presentacion: pPres, unidades: 0, subtotal: new Prisma.Decimal(0) });
      }
      const pItem = productosDispensadosMap.get(pId);
      pItem.unidades += d.cantidad;
      pItem.subtotal = pItem.subtotal.add(d.subtotal);
    }
  }

  const cantidadVentas = ventasHoy.length;
  const totalNum = Number(totalCobrado);
  const ticketPromedio = cantidadVentas > 0 ? (totalNum / cantidadVentas).toFixed(2) : '0.00';

  const ventasPorHora = Array.from(horasMapa.values()).map(h => ({
    hora: h.hora,
    total: Number(h.totalDecimal).toFixed(2),
    cantidad: h.cantidad
  }));

  const topProductosDispensados = Array.from(productosDispensadosMap.values())
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 8)
    .map(p => ({
      ...p,
      subtotal: p.subtotal.toFixed(2)
    }));

  // Historial de 7 días
  const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const diasCajeroMapa = new Map();
  const fechas7Dias = [];

  for (let i = 6; i >= 0; i--) {
    const diaFecha = new Date(inicioHoyLima.getTime() - i * 86_400_000);
    const fechaStr = diaFecha.toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    const diaSemana = diasSemanaNombres[diaFecha.getDay()];
    diasCajeroMapa.set(fechaStr, {
      fecha: fechaStr,
      diaSemana,
      totalDecimal: new Prisma.Decimal(0),
      cantidad: 0
    });
    fechas7Dias.push(fechaStr);
  }

  const inicioRango7Dias = new Date(`${fechas7Dias[0]}T00:00:00.000-05:00`);
  const where7Dias = {
    createdAt: {
      gte: inicioRango7Dias,
      lte: finHoyLima
    }
  };
  if (!esAdmin && usuarioId) {
    where7Dias.usuarioId = Number(usuarioId);
  }

  const ventas7DiasCajero = await prisma.venta.findMany({
    where: where7Dias,
    select: { total: true, createdAt: true }
  });

  for (const v of ventas7DiasCajero) {
    const fStr = new Date(v.createdAt).toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
    if (diasCajeroMapa.has(fStr)) {
      const item = diasCajeroMapa.get(fStr);
      item.totalDecimal = item.totalDecimal.add(v.total);
      item.cantidad++;
    }
  }

  const ventas7Dias = fechas7Dias.map(f => {
    const d = diasCajeroMapa.get(f);
    return {
      fecha: d.fecha,
      diaSemana: d.diaSemana,
      total: Number(d.totalDecimal).toFixed(2),
      cantidad: d.cantidad
    };
  });

  const ultimasVentas = ventasHoy.slice(0, 10).map(v => ({
    id: v.id,
    serieNumero: `T-${String(v.id).padStart(6, '0')}`,
    total: v.total.toFixed(2),
    metodoPago: v.metodoPago,
    clienteDoc: v.clienteDoc || 'SIN DOCUMENTO',
    clienteNom: v.clienteNom || 'CLIENTE MOSTRADOR',
    tipoComprobante: (v.clienteDoc && v.clienteDoc.length === 11) ? 'FACTURA' : (v.clienteDoc && v.clienteDoc.length === 8) ? 'BOLETA' : 'TICKET',
    itemsCount: v.detalles.reduce((acc, d) => acc + d.cantidad, 0),
    createdAt: v.createdAt,
    usuarioNombre: v.usuario?.nombre || 'Cajero'
  }));

  return {
    metricasHoy: {
      totalCobrado: totalCobrado.toFixed(2),
      ticketsEmitidos: cantidadVentas,
      ticketPromedio,
      desglosePago: {
        efectivo: totalEfectivo.toFixed(2),
        yapePlin: totalYapePlin.toFixed(2),
        tarjeta: totalTarjeta.toFixed(2)
      },
      comprobantes: {
        boletas: boletasCount,
        facturas: facturasCount,
        tickets: ticketsCount,
        total: cantidadVentas
      }
    },
    graficos: {
      metodosPago: [
        { metodo: 'Efectivo en Gaveta', total: Number(totalEfectivo), color: '#10b981' },
        { metodo: 'Billeteras (Yape / Plin)', total: Number(totalYapePlin), color: '#8b5cf6' },
        { metodo: 'Tarjetas POS', total: Number(totalTarjeta), color: '#3b82f6' }
      ],
      comprobantes: [
        { tipo: 'Boleta de Venta', cantidad: boletasCount, color: '#0d9488' },
        { tipo: 'Factura Electrónica', cantidad: facturasCount, color: '#2563eb' },
        { tipo: 'Ticket Simplificado', cantidad: ticketsCount, color: '#f59e0b' }
      ],
      ventasPorHora,
      ventas7Dias
    },
    tablas: {
      ultimasVentas,
      topProductosDispensados
    }
  };
}
