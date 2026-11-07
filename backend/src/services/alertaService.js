import prisma from '../lib/prisma.js';
import { getInicioDiaLima, getLimite60DiasLima } from '../utils/fechas.js';
import { sincronizarCaducidadAutomatica } from './productoService.js';

export async function obtenerAlertas() {
  await sincronizarCaducidadAutomatica();
  const inicioHoyLima = getInicioDiaLima();
  const limite60Dias = getLimite60DiasLima();

  // Proyección sin costo ni proveedor (seguro para ambos roles: Cajero y Admin)
  const select = {
    id: true,
    codigoBarras: true,
    nombre: true,
    principioActivo: true,
    presentacion: true,
    laboratorio: true,
    precio: true,
    stock: true,
    stockMinimo: true,
    lote: true,
    fechaVencimiento: true,
    imagen: true,
    activo: true,
    categoria: {
      select: {
        id: true,
        nombre: true
      }
    }
  };

  // Traer todos los productos para evaluación sanitaria integral
  const productos = await prisma.producto.findMany({
    select,
    orderBy: { nombre: 'asc' }
  });

  // 1. Bajo Stock: productos activos con stock <= stockMinimo (incluye stock 0)
  const bajoStock = productos.filter(p => p.activo && p.stock <= p.stockMinimo);

  // 2. Por Vencer: productos activos que vencen entre el inicio de hoy y 60 días calendario en Lima, con stock > 0
  const porVencer = productos.filter(p => {
    if (!p.activo || !p.fechaVencimiento || p.stock <= 0) return false;
    const fVenc = new Date(p.fechaVencimiento);
    return fVenc >= inicioHoyLima && fVenc <= limite60Dias;
  });

  // 3. Vencidos: lote expirado antes del inicio de hoy en Lima con existencia física (stock > 0),
  // visible tanto si ya fue bloqueado (activo: false) como si está por retirarse.
  const vencidos = productos.filter(p => {
    if (!p.fechaVencimiento || p.stock <= 0) return false;
    const fVenc = new Date(p.fechaVencimiento);
    return fVenc < inicioHoyLima;
  });

  return {
    conteos: {
      bajoStock: bajoStock.length,
      porVencer: porVencer.length,
      vencidos: vencidos.length
    },
    bajoStock,
    porVencer,
    vencidos
  };
}
