import prisma from '../lib/prisma.js';
import { ErrorNegocio } from '../utils/errores.js';
import { getInicioDiaLima, esProductoVencido } from '../utils/fechas.js';

// Sincronización sanitaria automática DIGEMID (Horario America/Lima):
// Inhabilita automáticamente (activo: false) en la base de datos cualquier producto cuya fecha de caducidad
// sea anterior a hoy en Lima. De esta manera ningún medicamento vencido queda en estado ACTIVO,
// desaparece de la tienda web pública y queda bloqueado para venta en mostrador POS.
export async function sincronizarCaducidadAutomatica() {
  try {
    const inicioHoyLima = getInicioDiaLima();
    const res = await prisma.producto.updateMany({
      where: {
        activo: true,
        fechaVencimiento: {
          lt: inicioHoyLima
        }
      },
      data: {
        activo: false
      }
    });
    return res.count;
  } catch (err) {
    console.error('Error al sincronizar caducidad automática:', err);
    return 0;
  }
}

// 1. Búsqueda rápida para el POS (Máximo 20 productos, sin costos ni proveedor)
export async function buscarProductosPOS(termino) {
  const query = termino ? termino.trim() : '';
  if (!query) return [];

  // Garantizar que no haya medicamentos caducados en estado activo antes de consultar
  await sincronizarCaducidadAutomatica();

  const isShort = query.length <= 2;
  let whereCond;

  if (isShort) {
    // Si el usuario escribe 1 o 2 letras (ej: "A" o "Am"), buscar SOLO fármacos que inicien con esa letra
    whereCond = {
      activo: true,
      stock: { gt: 0 },
      OR: [
        { nombre: { startsWith: query, mode: 'insensitive' } },
        { nombre: { contains: ` ${query}`, mode: 'insensitive' } },
        { principioActivo: { startsWith: query, mode: 'insensitive' } },
        { principioActivo: { contains: ` ${query}`, mode: 'insensitive' } },
        { codigoBarras: { startsWith: query, mode: 'insensitive' } }
      ]
    };
  } else {
    // Búsqueda multi-token para términos de 3 o más letras
    const palabras = query.split(/\s+/).filter(Boolean);
    whereCond = {
      activo: true,
      stock: { gt: 0 },
      AND: palabras.map(p => ({
        OR: [
          { nombre: { contains: p, mode: 'insensitive' } },
          { codigoBarras: { contains: p, mode: 'insensitive' } },
          { principioActivo: { contains: p, mode: 'insensitive' } },
          { laboratorio: { contains: p, mode: 'insensitive' } }
        ]
      }))
    };
  }

  const productos = await prisma.producto.findMany({
    where: whereCond,
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
      imagen: true,
      categoriaId: true
      // EXCLUIDOS: costo, proveedorId
    },
    take: 50,
    orderBy: { nombre: 'asc' }
  });

  // Ordenamiento estricto por relevancia: los que inician con el término van primero
  const normQuery = query.toLowerCase();
  productos.sort((a, b) => {
    const aName = (a.nombre || '').toLowerCase();
    const bName = (b.nombre || '').toLowerCase();

    const aStarts = aName.startsWith(normQuery);
    const bStarts = bName.startsWith(normQuery);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    const aWord = aName.split(/\s+/).some(w => w.startsWith(normQuery));
    const bWord = bName.split(/\s+/).some(w => w.startsWith(normQuery));
    if (aWord && !bWord) return -1;
    if (!aWord && bWord) return 1;

    return aName.localeCompare(bName);
  });

  return productos.slice(0, 20);
}

// 2. Listado paginado de productos según Rol (Admin vs Cajero)
export async function listarProductos({ rol, activoQuery, page = 1, limit = 20, categoriaId, busqueda }) {
  // Sincronizar automáticamente el estado activo según fecha de vencimiento
  await sincronizarCaducidadAutomatica();

  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, Math.min(500, parseInt(limit, 10) || 20));
  const skip = (p - 1) * l;

  const where = {};

  // Filtro de estado activo según rol
  if (rol === 'ADMIN') {
    if (activoQuery === 'false') {
      where.activo = false;
    } else if (activoQuery === 'all') {
      // Sin filtro de activo: incluye activos e inactivos (ideal para auditoría de lotes)
    } else {
      where.activo = true; // Por defecto el catálogo muestra SOLO fármacos activos vigentes
    }
  } else {
    where.activo = true; // El cajero SIEMPRE recibe solo activos
  }

  if (categoriaId) {
    where.categoriaId = parseInt(categoriaId, 10);
  }

  if (busqueda && busqueda.trim()) {
    const q = busqueda.trim();
    const isShort = q.length <= 2;

    if (isShort) {
      // Para 1 o 2 letras (ej: "A"), buscar SOLO fármacos cuyo nombre o principio inicie con dicha letra
      where.OR = [
        { nombre: { startsWith: q, mode: 'insensitive' } },
        { nombre: { contains: ` ${q}`, mode: 'insensitive' } },
        { principioActivo: { startsWith: q, mode: 'insensitive' } },
        { principioActivo: { contains: ` ${q}`, mode: 'insensitive' } },
        { codigoBarras: { startsWith: q, mode: 'insensitive' } }
      ];
    } else {
      const palabras = q.split(/\s+/).filter(Boolean);
      where.AND = palabras.map(p => ({
        OR: [
          { nombre: { contains: p, mode: 'insensitive' } },
          { codigoBarras: { contains: p, mode: 'insensitive' } },
          { principioActivo: { contains: p, mode: 'insensitive' } },
          { laboratorio: { contains: p, mode: 'insensitive' } }
        ]
      }));
    }
  }

  // Si hay búsqueda, ordenar siempre alfabéticamente de la A a la Z para que no muestre productos desordenados
  const orderBy = (busqueda && busqueda.trim())
    ? { nombre: 'asc' }
    : { id: 'desc' };

  // Proyecciones estrictas por rol (ADMIN y ALMACEN ven gestión completa; CAJERO solo mostrador)
  const esGestor = rol === 'ADMIN' || rol === 'ALMACEN';
  const select = esGestor
    ? {
        id: true,
        codigoBarras: true,
        nombre: true,
        principioActivo: true,
        presentacion: true,
        laboratorio: true,
        costo: true,      // Gestores ven costo
        precio: true,
        stock: true,
        stockMinimo: true,
        lote: true,
        fechaVencimiento: true,
        imagen: true,
        activo: true,
        createdAt: true,
        categoriaId: true,
        proveedorId: true,
        categoria: { select: { id: true, nombre: true } },
        proveedor: { select: { id: true, razonSocial: true, ruc: true } }
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
        categoriaId: true,
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
      orderBy
    })
  ]);

  // Si hay búsqueda activa, ordenar por relevancia para que los que empiezan con el término aparezcan estrictamente primero
  if (busqueda && busqueda.trim()) {
    const normQ = busqueda.trim().toLowerCase();
    productos.sort((a, b) => {
      const aName = (a.nombre || '').toLowerCase();
      const bName = (b.nombre || '').toLowerCase();
      const aStarts = aName.startsWith(normQ);
      const bStarts = bName.startsWith(normQ);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      const aWord = aName.split(/\s+/).some(w => w.startsWith(normQ));
      const bWord = bName.split(/\s+/).some(w => w.startsWith(normQ));
      if (aWord && !bWord) return -1;
      if (!aWord && bWord) return 1;

      return aName.localeCompare(bName);
    });
  }

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

  const esGestor = rol === 'ADMIN' || rol === 'ALMACEN';
  const select = esGestor
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

  // Si se registra con fecha ya caducada, nace automáticamente inactivo
  if (productoData.fechaVencimiento && esProductoVencido(productoData.fechaVencimiento)) {
    productoData.activo = false;
  }

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

  // Lógica Sanitaria Automática DIGEMID:
  // Si la fecha de expiración es anterior a hoy en Lima, el producto se inhabilita automáticamente (activo: false)
  // retirándolo de inmediato del catálogo web público y del POS.
  if (datosSeguros.fechaVencimiento) {
    if (esProductoVencido(datosSeguros.fechaVencimiento)) {
      datosSeguros.activo = false;
    } else {
      // Si estaba caducado previamente y se actualiza a una fecha vigente, se reactiva de inmediato
      const actual = await prisma.producto.findUnique({
        where: { id: productoId },
        select: { activo: true, fechaVencimiento: true }
      });
      if (actual && !actual.activo && (!actual.fechaVencimiento || esProductoVencido(actual.fechaVencimiento))) {
        datosSeguros.activo = true;
      }
    }
  }

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

// 6b. Reactivar producto
export async function activarProducto(id) {
  const productoId = parseInt(id, 10);
  if (isNaN(productoId)) throw new ErrorNegocio('ID de producto inválido.', 400);

  const prod = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { fechaVencimiento: true, nombre: true }
  });

  if (!prod) throw new ErrorNegocio('Producto no encontrado.', 404);

  if (prod.fechaVencimiento && esProductoVencido(prod.fechaVencimiento)) {
    throw new ErrorNegocio(
      `No se puede reactivar "${prod.nombre}" porque su lote actual está caducado. Debe registrar un nuevo lote vigente en "Entrada de Mercadería".`,
      400
    );
  }

  return await prisma.producto.update({
    where: { id: productoId },
    data: { activo: true }
  });
}

// 7. Auxiliares: Categorías y Proveedores para selectores
export async function listarCategorias() {
  const categorias = await prisma.categoria.findMany({
    where: { activo: true },
    select: {
      id: true,
      nombre: true,
      descripcion: true,
      _count: {
        select: { productos: { where: { activo: true } } }
      },
      productos: {
        where: { activo: true },
        select: { stock: true }
      }
    },
    orderBy: { id: 'asc' }
  });

  return categorias.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    descripcion: c.descripcion,
    totalProductos: c._count.productos,
    totalStock: c.productos.reduce((acc, p) => acc + (p.stock || 0), 0)
  }));
}

export async function listarProveedores() {
  return await prisma.proveedor.findMany({
    where: { activo: true },
    select: { id: true, ruc: true, razonSocial: true, telefono: true, contacto: true },
    orderBy: { razonSocial: 'asc' }
  });
}
