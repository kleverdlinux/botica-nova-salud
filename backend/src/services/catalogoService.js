import prisma from '../lib/prisma.js';
import { getInicioDiaLima } from '../utils/fechas.js';
import { sincronizarCaducidadAutomatica } from './productoService.js';
import * as ventaService from './ventaService.js';

export async function obtenerCatalogoPublico() {
  // Sincronizar caducidad para inhabilitar productos con fecha expirada
  await sincronizarCaducidadAutomatica();

  const inicioHoyLima = getInicioDiaLima();

  // En la tienda web pública solo se muestran productos estrictamente activos y vigentes (no caducados)
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { fechaVencimiento: null },
        { fechaVencimiento: { gte: inicioHoyLima } }
      ]
    },
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
    const disponible = stock > 0;

    return {
      ...resto,
      disponible
    };
  });
}

/**
 * Registra un pedido realizado desde la tienda web pública de forma atómica
 * Descuenta stock, genera kardex, emite comprobante y conecta con el panel de administración
 */
export async function registrarPedidoWebPublico({
  items = [],
  metodoPago = 'YAPE_PLIN',
  clienteDoc,
  clienteNom,
  direccion,
  distrito,
  tipoComprobante = 'BOLETA',
  ruc,
  razonSocial,
  correlativo,
  total
}) {
  const admin = await prisma.usuario.findFirst({
    where: { rol: 'ADMIN' }
  });
  const usuarioId = admin ? admin.id : 1;

  const dbItems = [];
  for (const item of items) {
    let pId = Number(item.productoId || item.id);
    let prod = null;

    if (!isNaN(pId) && pId > 0) {
      prod = await prisma.producto.findUnique({ where: { id: pId } });
    }

    if (!prod && (item.name || item.nombre)) {
      const searchName = (item.name || item.nombre).trim();
      const firstWord = searchName.split(' ')[0];
      prod = await prisma.producto.findFirst({
        where: {
          OR: [
            { nombre: { contains: firstWord } },
            { nombre: { contains: searchName } }
          ],
          activo: true
        }
      });
    }

    if (!prod) {
      prod = await prisma.producto.findFirst({ where: { activo: true } });
    }

    if (prod) {
      dbItems.push({
        productoId: prod.id,
        cantidad: Math.max(1, parseInt(item.quantity || item.cantidad || 1, 10))
      });
    }
  }

  if (dbItems.length === 0) {
    return null;
  }

  let metodoBD = 'YAPE_PLIN';
  if (metodoPago === 'TARJETA') metodoBD = 'TARJETA';
  else if (metodoPago === 'CONTRA_ENTREGA' || metodoPago === 'EFECTIVO') metodoBD = 'EFECTIVO';
  else if (metodoPago === 'TRANSFERENCIA') metodoBD = 'TARJETA';

  const docFinal = tipoComprobante === 'FACTURA' ? (ruc || clienteDoc) : clienteDoc;
  const nomFinal = tipoComprobante === 'FACTURA' && razonSocial ? razonSocial : clienteNom;
  const nombreConOrigen = nomFinal
    ? `${nomFinal} [Web Delivery - ${distrito || 'Lima'}]`
    : `Cliente Web [${distrito || 'Lima'}]`;

  const nuevaVenta = await ventaService.crearVenta({
    items: dbItems,
    usuarioId,
    metodoPago: metodoBD,
    clienteDoc: docFinal ? String(docFinal).trim() : null,
    clienteNom: nombreConOrigen
  });

  return nuevaVenta;
}
