import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';

// 1. Búsqueda rápida para el POS (Máximo 20 productos, sin costos ni proveedor)
export async function buscarProductosPOS(termino) {
  const query = termino ? termino.trim() : '';
  if (!query) return [];

  return await prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: query, mode: 'insensitive' } },
        { codigoBarras: { equals: query } },
        { principioActivo: { contains: query, mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      codigoBarras: true,
      nombre: true,
      principioActivo: true,
      presentacion: true,
      laboratorio: true,
      precio: true,
      stock: true,
      lote: true,
      fechaVencimiento: true,
      categoriaId: true
      // EXCLUIDOS: costo, proveedorId
    },
    take: 20,
    orderBy: { nombre: 'asc' }
  });
}

// 2. Listado paginado de productos según Rol (Admin vs Cajero)
export async function listarProductos({ rol, activoQuery, page = 1, limit = 20, categoriaId, busqueda }) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};

  // Filtro de estado activo según rol
  if (rol === 'ADMIN' && activoQuery !== undefined) {
    where.activo = activoQuery === 'true';
  } else {
    where.activo = true; // El cajero SIEMPRE recibe solo activos
  }

  if (categoriaId) {
    where.categoriaId = parseInt(categoriaId, 10);
  }

  if (busqueda && busqueda.trim()) {
    const q = busqueda.trim();
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { codigoBarras: { equals: q } },
      { principioActivo: { contains: q, mode: 'insensitive' } }
    ];
  }

  // Proyecciones estrictas por rol
  const select = rol === 'ADMIN'
    ? {
        id: true,
        codigoBarras: true,
        nombre: true,
        principioActivo: true,
        presentacion: true,
        laboratorio: true,
        costo: true,      // Admin ve costo
        precio: true,
        stock: true,
        stockMinimo: true,
        lote: true,
        fechaVencimiento: true,
        imagen: true,
        activo: true,
        createdAt: true,
        categoria: { select: { id: true, nombre: true } },
        proveedor: { select: { id: true, razonSocial: true, ruc: true } } // Admin ve proveedor
      }
    : {
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
        categoria: { select: { id: true, nombre: true } }
        // Cajero NO ve costo ni proveedor
      };

  const [total, productos] = await Promise.all([
    prisma.producto.count({ where }),
    prisma.producto.findMany({
      where,
      skip,
      take: l,
      select,
      orderBy: { id: 'desc' }
    })
  ]);

  return {
    total,
    paginaActual: p,
    totalPaginas: Math.ceil(total / l),
    limite: l,
    productos
  };
}

// 3. Obtener un producto por ID con proyección por rol
export async function obtenerProductoPorId(id, rol) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) throw new ErrorNegocio('ID de producto inválido.', 400);

  const select = rol === 'ADMIN'
    ? {
        id: true,
        codigoBarras: true,
        nombre: true,
        principioActivo: true,
        presentacion: true,
        laboratorio: true,
        costo: true,
        precio: true,
        stock: true,
        stockMinimo: true,
        lote: true,
        fechaVencimiento: true,
        imagen: true,
        activo: true,
        categoriaId: true,
        proveedorId: true,
        categoria: { select: { id: true, nombre: true } },
        proveedor: { select: { id: true, razonSocial: true } }
      }
    : {
        id: true,
        codigoBarras: true,
        nombre: true,
        principioActivo: true,
        presentacion: true,
        laboratorio: true,
        precio: true,
        stock: true,
        lote: true,
        fechaVencimiento: true,
        imagen: true,
        categoriaId: true,
        categoria: { select: { id: true, nombre: true } }
      };

  const prod = await prisma.producto.findUnique({
    where: { id: productoId },
    select
  });

  if (!prod) throw new ErrorNegocio('Producto no encontrado.', 404);
  return prod;
}

// 4. Crear producto con transacción y Kardex si hay stock inicial
export async function crearProducto(datos, usuarioId) {
  const { stockInicial = 0, ...productoData } = datos;

  return await prisma.$transaction(async (tx) => {
    const nuevoProducto = await tx.producto.create({
      data: {
        ...productoData,
        stock: stockInicial
      }
    });

    if (stockInicial > 0) {
      await tx.movimientoInventario.create({
        data: {
          productoId: nuevoProducto.id,
          usuarioId,
          tipo: 'ENTRADA',
          cantidad: stockInicial,
          motivo: 'Inventario inicial al registrar producto',
          stockAnterior: 0,
          stockNuevo: stockInicial
        }
      });
    }

    return nuevoProducto;
  });
}

// 5. Actualizar producto (omite stock)
export async function actualizarProducto(id, datos) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) throw new ErrorNegocio('ID de producto inválido.', 400);

  const { stock, stockInicial, ...datosSeguros } = datos;

  return await prisma.producto.update({
    where: { id: productoId },
    data: datosSeguros
  });
}

// 6. Desactivar producto (Soft Delete)
export async function desactivarProducto(id) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) throw new ErrorNegocio('ID de producto inválido.', 400);

  return await prisma.producto.update({
    where: { id: productoId },
    data: { activo: false }
  });
}

// 7. Auxiliares: Categorías y Proveedores para selectores
export async function listarCategorias() {
  return await prisma.categoria.findMany({
    where: { activo: true },
    select: { id: true, nombre: true, descripcion: true },
    orderBy: { nombre: 'asc' }
  });
}

export async function listarProveedores() {
  return await prisma.proveedor.findMany({
    where: { activo: true },
    select: { id: true, ruc: true, razonSocial: true, telefono: true, contacto: true },
    orderBy: { razonSocial: 'asc' }
  });
}
