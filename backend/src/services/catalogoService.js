import prisma from '../lib/prisma.js';
import { getInicioDiaLima } from '../utils/fechas.js';
import { sincronizarCaducidadAutomatica } from './productoService.js';
import * as ventaService from './ventaService.js';
import bcrypt from 'bcryptjs';
import { ErrorNegocio } from '../utils/errores.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sincroniza todos los 120 productos y 6 categorías oficiales del catálogo web con PostgreSQL
 */
export async function sincronizarCatalogoCompleto(usuarioId) {
  const dataPath = path.resolve(__dirname, '../../prisma/store_products.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Archivo de catálogo no encontrado: ${dataPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { collections, products } = rawData;

  // 1. Obtener usuario administrador para Kardex
  let responsableId = usuarioId;
  if (!responsableId) {
    const admin = await prisma.usuario.findFirst({ where: { rol: 'ADMIN' } });
    responsableId = admin ? admin.id : 1;
  }

  // 2. Proveedor oficial DIGEMID
  const proveedor = await prisma.proveedor.upsert({
    where: { ruc: '20100055231' },
    update: {
      razonSocial: 'Distribuidora Farmacéutica del Perú S.A.C.',
      telefono: '01-4458920',
      contacto: 'Ing. Químico Farmacéutico Responsable'
    },
    create: {
      ruc: '20100055231',
      razonSocial: 'Distribuidora Farmacéutica del Perú S.A.C.',
      telefono: '01-4458920',
      contacto: 'Ing. Químico Farmacéutico Responsable'
    }
  });

  // 3. Crear / mapear las 6 categorías del catálogo oficial
  const categoriaMap = {};
  for (const col of collections) {
    const cat = await prisma.categoria.upsert({
      where: { nombre: col.name },
      update: { descripcion: col.description, activo: true },
      create: {
        nombre: col.name,
        descripcion: col.description,
        activo: true
      }
    });
    categoriaMap[col.id] = cat.id;
  }

  const defaultCat = await prisma.categoria.findFirst();
  const defaultCatId = defaultCat ? defaultCat.id : 1;

  // 4. Fechas de vencimiento farmacéuticas vigentes (junio 2028)
  const fechaFutura = new Date('2028-06-30T00:00:00Z');

  let sincronizados = 0;
  let kardexCreados = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const codigoBarras = `775${String(i + 1).padStart(9, '0')}`;

    let laboratorio = 'Nova Salud Lab';
    let principioActivo = p.name;

    if (p.materials) {
      const matchLab = p.materials.match(/\(([^)]+)\)/);
      if (matchLab && matchLab[1]) {
        laboratorio = matchLab[1].trim();
        principioActivo = p.materials.replace(/\([^)]+\)/, '').trim();
      } else {
        principioActivo = p.materials.trim();
      }
    }

    const presentacion = p.dimensions || p.boxLabel || p.unitLabel || 'Unidad / Presentación Farmacéutica';
    const precio = parseFloat(p.price) || 5.0;
    const costo = Math.round(precio * 0.65 * 100) / 100;
    const stock = 25 + ((i * 7) % 45); // Entre 25 y 70 unidades
    const lote = `L-2026-${String((i % 40) + 10).padStart(3, '0')}`;
    const categoriaId = categoriaMap[p.collection] || defaultCatId;
    const imagen = p.images && p.images[0] ? p.images[0] : null;

    const existente = await prisma.producto.findFirst({
      where: {
        OR: [{ nombre: p.name }, { codigoBarras: codigoBarras }]
      }
    });

    if (existente) {
      const fechaValida = (existente.fechaVencimiento && new Date(existente.fechaVencimiento) > new Date())
        ? existente.fechaVencimiento
        : fechaFutura;

      await prisma.producto.update({
        where: { id: existente.id },
        data: {
          costo,
          precio,
          stock: existente.stock > 0 ? existente.stock : stock,
          presentacion,
          laboratorio,
          principioActivo,
          imagen: imagen || existente.imagen,
          categoriaId,
          proveedorId: proveedor.id,
          fechaVencimiento: fechaValida,
          activo: true
        }
      });
      sincronizados++;
    } else {
      const nuevo = await prisma.producto.create({
        data: {
          codigoBarras,
          nombre: p.name,
          principioActivo,
          presentacion,
          laboratorio,
          costo,
          precio,
          stock,
          stockMinimo: 5,
          lote,
          fechaVencimiento: fechaFutura,
          imagen,
          activo: true,
          categoriaId,
          proveedorId: proveedor.id
        }
      });

      await prisma.movimientoInventario.create({
        data: {
          productoId: nuevo.id,
          usuarioId: responsableId,
          tipo: 'ENTRADA',
          cantidad: stock,
          motivo: 'Inventario inicial integrado con catálogo oficial web',
          stockAnterior: 0,
          stockNuevo: stock
        }
      });

      sincronizados++;
      kardexCreados++;
    }
  }

  // 5. Limpieza de los 5 productos dummy de prueba si no tienen ventas
  try {
    const dummyBarcodes = ['775012345001', '775012345002', '775012345003', '775012345004', '775012345005'];
    for (const bCode of dummyBarcodes) {
      const dummyProd = await prisma.producto.findUnique({
        where: { codigoBarras: bCode },
        include: { detallesVenta: true }
      });
      if (dummyProd && dummyProd.detallesVenta.length === 0) {
        await prisma.movimientoInventario.deleteMany({ where: { productoId: dummyProd.id } });
        await prisma.producto.delete({ where: { id: dummyProd.id } });
      }
    }
  } catch (errClean) {
    console.warn('Omitiendo limpieza de productos dummy:', errClean.message);
  }

  return {
    totalSincronizados: sincronizados,
    kardexCreados,
    categorias: collections.length
  };
}

/**
 * Auto-verificación en arranque: si hay menos de 100 productos en BD, sincroniza automáticamente
 */
export async function sincronizarCatalogoSiEsNecesario() {
  try {
    const total = await prisma.producto.count({ where: { activo: true } });
    if (total < 100) {
      console.log(`[AutoSync] Base de datos con ${total} productos. Sincronizando catálogo oficial web (120 productos)...`);
      const res = await sincronizarCatalogoCompleto();
      console.log(`[AutoSync] ✅ ${res.totalSincronizados} productos sincronizados exitosamente.`);
    } else {
      console.log(`[AutoSync] Catálogo completo verificado (${total} productos activos en inventario).`);
    }
  } catch (err) {
    console.error('[AutoSync] Error verificando catálogo:', err.message);
  }
}

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

/**
 * Registra un nuevo cliente en la base de datos central de PostgreSQL
 */
export async function registrarCliente({ dni, nombre, email, telefono, direccion, distrito, password }) {
  const cleanDni = String(dni || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanNombre = String(nombre || '').trim();
  const rawPassword = String(password || '').trim();

  if (!cleanNombre) {
    throw new ErrorNegocio('Ingresa tus nombres y apellidos completos.', 400);
  }
  if (!/^\d{8}$/.test(cleanDni)) {
    throw new ErrorNegocio('El DNI debe contener exactamente 8 dígitos numéricos.', 400);
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    throw new ErrorNegocio('Ingresa un correo electrónico válido.', 400);
  }
  if (rawPassword.length < 6) {
    throw new ErrorNegocio('La contraseña debe tener al menos 6 caracteres.', 400);
  }

  // Verificar si ya existe por DNI o correo
  const existenteDni = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
  if (existenteDni) {
    throw new ErrorNegocio('Ya existe una cuenta registrada con este DNI. Por favor inicia sesión.', 400);
  }

  const existenteEmail = await prisma.cliente.findUnique({ where: { email: cleanEmail } });
  if (existenteEmail) {
    throw new ErrorNegocio('Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.', 400);
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const nuevo = await prisma.cliente.create({
    data: {
      dni: cleanDni,
      nombre: cleanNombre,
      email: cleanEmail,
      telefono: telefono ? String(telefono).trim() : '',
      direccion: direccion ? String(direccion).trim() : 'Lima',
      distrito: distrito ? String(distrito).trim() : 'Lima Cercado',
      password: hashedPassword,
      fichaMedica: { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
      botiquin: [],
      activo: true
    }
  });

  return {
    id: nuevo.dni,
    dni: nuevo.dni,
    name: nuevo.nombre,
    email: nuevo.email,
    phone: nuevo.telefono || '',
    address: nuevo.direccion || 'Lima',
    district: nuevo.distrito || 'Lima Cercado',
    fichaSalud: nuevo.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
    createdAt: nuevo.createdAt
  };
}

/**
 * Iniciar sesión de cliente consultando la base de datos central de PostgreSQL
 */
export async function loginCliente({ identifier, password }) {
  const idf = String(identifier || '').trim().toLowerCase();
  const rawPassword = String(password || '').trim();

  if (!idf) {
    throw new ErrorNegocio('Ingresa tu DNI o correo electrónico.', 400);
  }

  const cliente = await prisma.cliente.findFirst({
    where: {
      OR: [
        { dni: idf },
        { email: idf }
      ],
      activo: true
    }
  });

  if (!cliente) {
    throw new ErrorNegocio('No encontramos una cuenta con ese DNI o correo. Por favor crea una cuenta nueva.', 404);
  }

  // Validar contraseña si el cliente tiene una guardada
  if (cliente.password && rawPassword) {
    const esValida = await bcrypt.compare(rawPassword, cliente.password);
    // Compatibilidad retroactiva si no estaba hasheada
    const esIgualPlano = cliente.password === rawPassword;
    if (!esValida && !esIgualPlano) {
      throw new ErrorNegocio('Contraseña incorrecta. Por favor verifica tus datos.', 401);
    }
  }

  return {
    id: cliente.dni,
    dni: cliente.dni,
    name: cliente.nombre,
    email: cliente.email,
    phone: cliente.telefono || '',
    address: cliente.direccion || 'Lima',
    district: cliente.distrito || 'Lima Cercado',
    fichaSalud: cliente.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
    createdAt: cliente.createdAt
  };
}

/**
 * Actualiza el perfil o ficha médica del cliente en PostgreSQL
 */
export async function actualizarPerfilCliente({ dni, telefono, direccion, distrito, fichaMedica, botiquin }) {
  const cleanDni = String(dni || '').trim();
  if (!cleanDni) {
    throw new ErrorNegocio('DNI de cliente requerido.', 400);
  }

  const dataToUpdate = {};
  if (telefono !== undefined) dataToUpdate.telefono = String(telefono).trim();
  if (direccion !== undefined) dataToUpdate.direccion = String(direccion).trim();
  if (distrito !== undefined) dataToUpdate.distrito = String(distrito).trim();
  if (fichaMedica !== undefined) dataToUpdate.fichaMedica = fichaMedica;
  if (botiquin !== undefined) dataToUpdate.botiquin = botiquin;

  const actualizado = await prisma.cliente.update({
    where: { dni: cleanDni },
    data: dataToUpdate
  });

  return {
    id: actualizado.dni,
    dni: actualizado.dni,
    name: actualizado.nombre,
    email: actualizado.email,
    phone: actualizado.telefono || '',
    address: actualizado.direccion || 'Lima',
    district: actualizado.distrito || 'Lima Cercado',
    fichaSalud: actualizado.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
    createdAt: actualizado.createdAt
  };
}

/**
 * Obtener pedidos asociados al DNI de un cliente desde la base de datos
 */
export async function obtenerPedidosCliente(dni) {
  const cleanDni = String(dni || '').trim();
  if (!cleanDni) return [];

  const ventas = await prisma.venta.findMany({
    where: { clienteDoc: cleanDni },
    orderBy: { createdAt: 'desc' },
    include: {
      detalles: {
        include: {
          producto: true
        }
      }
    }
  });

  return ventas;
}
