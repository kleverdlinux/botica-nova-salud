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
    ? `${nomFinal} [Web Delivery - ${distrito || 'Juliaca'}]`
    : `Cliente Web [${distrito || 'Juliaca'}]`;

  const nuevaVenta = await ventaService.crearVenta({
    items: dbItems,
    usuarioId,
    metodoPago: metodoBD,
    clienteDoc: docFinal ? String(docFinal).trim() : null,
    clienteNom: nombreConOrigen
  });

  // Si el cliente está registrado en PostgreSQL, asociar el pedido completo a su historial persistente
  if (docFinal) {
    try {
      const cleanDni = String(docFinal).trim();
      const clienteExistente = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
      if (clienteExistente) {
        const fichaActual = (clienteExistente.fichaMedica && typeof clienteExistente.fichaMedica === 'object')
          ? clienteExistente.fichaMedica
          : {};
        const pedidosPrevios = Array.isArray(fichaActual.pedidos) ? fichaActual.pedidos : [];

        const nuevoPedido = data.ordenCompleta || {
          id: correlativo ? `NS-${correlativo}` : `NS-2026-${nuevaVenta.id}`,
          serieNumero: correlativo || `B001-${String(nuevaVenta.id).padStart(8, '0')}`,
          tipoComprobante: tipoComprobante || 'BOLETA',
          date: new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' }),
          customer: {
            firstName: clienteNom || clienteExistente.nombre,
            lastName: '',
            email: clienteExistente.email,
            phone: clienteExistente.telefono || '',
            dni: cleanDni,
            address: direccion || clienteExistente.direccion || 'Juliaca',
            district: distrito || clienteExistente.distrito || 'Juliaca Cercado',
          },
          items: items.map(it => ({
            id: String(it.productoId || it.id),
            name: it.name || 'Medicamento',
            presentation: it.presentation || 'Unidad',
            quantity: it.cantidad || 1,
            price: Number(it.price || 0),
            subtotal: Number(it.subtotal || 0),
            image: it.image || '/media/botica-hero-clean.jpg'
          })),
          subtotal: Number(nuevaVenta.total),
          shipping: 0,
          total: Number(nuevaVenta.total),
          paymentMethod: metodoPago,
          paymentDetails: metodoPago === 'YAPE_PLIN' ? 'Yape / Plin (+51 955 545 561)' : metodoPago === 'TARJETA' ? 'Tarjeta Débito / Crédito' : 'Contra Entrega en Domicilio',
          status: 'CONFIRMADO'
        };

        const pedidosActualizados = [
          nuevoPedido,
          ...pedidosPrevios.filter(p => p.id !== nuevoPedido.id && p.serieNumero !== nuevoPedido.serieNumero)
        ];

        await prisma.cliente.update({
          where: { dni: cleanDni },
          data: {
            fichaMedica: {
              ...fichaActual,
              pedidos: pedidosActualizados
            }
          }
        });
      }
    } catch (e) {
      console.warn('Advertencia al vincular pedido al cliente:', e);
    }
  }

  return nuevaVenta;
}

/**
 * Registra un nuevo cliente en la base de datos central de PostgreSQL
 */
export async function registrarCliente({ dni, nombre, email, telefono, direccion, distrito, password, esAutoRegistro = false }) {
  const cleanDni = String(dni || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanNombre = String(nombre || '').trim();
  const rawPassword = String(password || cleanDni).trim();

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

  // Verificar si ya existe por DNI
  const existenteDni = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
  if (existenteDni) {
    if (esAutoRegistro) {
      // Si es auto-registro en checkout, actualizar datos de despacho y retornar cuenta existente
      const actualizado = await prisma.cliente.update({
        where: { dni: cleanDni },
        data: {
          nombre: cleanNombre || existenteDni.nombre,
          telefono: telefono ? String(telefono).trim() : existenteDni.telefono,
          direccion: direccion ? String(direccion).trim() : existenteDni.direccion,
          distrito: distrito ? String(distrito).trim() : existenteDni.distrito,
        }
      });
      return {
        id: actualizado.dni,
        dni: actualizado.dni,
        name: actualizado.nombre,
        email: actualizado.email,
        phone: actualizado.telefono || '',
        address: actualizado.direccion || 'Juliaca',
        district: actualizado.distrito || 'Juliaca Cercado',
        avatar: (actualizado.fichaMedica && actualizado.fichaMedica.avatar) || null,
        fichaSalud: actualizado.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
        createdAt: actualizado.createdAt
      };
    }
    throw new ErrorNegocio('Ya existe una cuenta registrada con este DNI. Por favor inicia sesión.', 400);
  }

  let finalEmail = cleanEmail;
  const existenteEmail = await prisma.cliente.findUnique({ where: { email: cleanEmail } });
  if (existenteEmail) {
    if (esAutoRegistro) {
      finalEmail = `${cleanDni}@cliente.novasalud.pe`;
    } else {
      throw new ErrorNegocio('Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.', 400);
    }
  }

  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const nuevo = await prisma.cliente.create({
    data: {
      dni: cleanDni,
      nombre: cleanNombre,
      email: finalEmail,
      telefono: telefono ? String(telefono).trim() : '',
      direccion: direccion ? String(direccion).trim() : 'Juliaca',
      distrito: distrito ? String(distrito).trim() : 'Juliaca Cercado',
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
    address: nuevo.direccion || 'Juliaca',
    district: nuevo.distrito || 'Juliaca Cercado',
    avatar: null,
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
    address: cliente.direccion || 'Juliaca',
    district: cliente.distrito || 'Juliaca Cercado',
    avatar: (cliente.fichaMedica && cliente.fichaMedica.avatar) || null,
    fichaSalud: cliente.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
    createdAt: cliente.createdAt
  };
}

/**
 * Actualiza el perfil o ficha médica del cliente en PostgreSQL
 */
export async function actualizarPerfilCliente({ dni, nombre, email, telefono, direccion, distrito, fichaMedica, botiquin, password }) {
  const cleanDni = String(dni || '').trim();
  if (!cleanDni) {
    throw new ErrorNegocio('DNI de cliente requerido.', 400);
  }

  const actual = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
  if (!actual) {
    throw new ErrorNegocio('Cliente no encontrado.', 404);
  }

  const prevFicha = (actual.fichaMedica && typeof actual.fichaMedica === 'object') ? actual.fichaMedica : {};

  const dataToUpdate = {};
  if (nombre !== undefined && String(nombre).trim()) dataToUpdate.nombre = String(nombre).trim();
  if (email !== undefined && String(email).trim()) dataToUpdate.email = String(email).trim().toLowerCase();
  if (telefono !== undefined) dataToUpdate.telefono = String(telefono).trim();
  if (direccion !== undefined) dataToUpdate.direccion = String(direccion).trim();
  if (distrito !== undefined) dataToUpdate.distrito = String(distrito).trim();
  if (fichaMedica !== undefined) {
    dataToUpdate.fichaMedica = {
      ...prevFicha,
      ...fichaMedica,
      pedidos: fichaMedica.pedidos || prevFicha.pedidos || [],
      avatar: fichaMedica.avatar !== undefined ? fichaMedica.avatar : prevFicha.avatar || null
    };
  }
  if (botiquin !== undefined) dataToUpdate.botiquin = botiquin;
  if (password && String(password).trim().length >= 6) {
    dataToUpdate.password = await bcrypt.hash(String(password).trim(), 10);
  }

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
    address: actualizado.direccion || 'Juliaca',
    district: actualizado.distrito || 'Juliaca Cercado',
    avatar: (actualizado.fichaMedica && actualizado.fichaMedica.avatar) || null,
    fichaSalud: actualizado.fichaMedica || { grupoSanguineo: 'O+', alergias: [], condiciones: [] },
    createdAt: actualizado.createdAt
  };
}

/**
 * Obtener pedidos asociados al DNI de un cliente desde la base de datos central de PostgreSQL
 * Retorna los pedidos completos con formato estándar CustomerOrder
 */
export async function obtenerPedidosCliente(dni) {
  const cleanDni = String(dni || '').trim();
  if (!cleanDni) return [];

  // 1. Obtener cliente y pedidos guardados en PostgreSQL
  const cliente = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
  const pedidosFicha = (cliente && cliente.fichaMedica && Array.isArray(cliente.fichaMedica.pedidos))
    ? cliente.fichaMedica.pedidos
    : [];

  // 2. Obtener ventas registradas con ese DNI en PostgreSQL
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

  // 3. Transformar ventas transaccionales en formato CustomerOrder
  const pedidosVentas = ventas.map(v => {
    const nextNum = v.id;
    const serie = `B001-${String(nextNum).padStart(8, '0')}`;
    const orderId = `NS-2026-${String(nextNum).padStart(4, '0')}`;
    const fechaStr = new Date(v.createdAt).toLocaleDateString('es-PE', {
      timeZone: 'America/Lima',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const titularParts = (v.clienteNom || cliente?.nombre || 'Cliente').replace(/\[.*\]/, '').trim().split(' ');
    const fName = titularParts[0] || 'Cliente';
    const lName = titularParts.slice(1).join(' ') || '';

    return {
      id: orderId,
      serieNumero: serie,
      tipoComprobante: 'BOLETA',
      date: fechaStr,
      customer: {
        firstName: fName,
        lastName: lName,
        email: cliente?.email || '',
        phone: cliente?.telefono || '',
        dni: cleanDni,
        address: cliente?.direccion || 'Juliaca',
        district: cliente?.distrito || 'Juliaca Cercado',
      },
      items: (v.detalles || []).map(d => ({
        id: String(d.productoId),
        name: d.producto?.nombre || 'Medicamento',
        presentation: d.producto?.presentacion || 'Unidad',
        quantity: d.cantidad,
        price: Number(d.precioUnitario),
        subtotal: Number(d.subtotal),
        image: d.producto?.imagen || '/media/botica-hero-clean.jpg'
      })),
      subtotal: Number(v.total),
      shipping: 0,
      total: Number(v.total),
      paymentMethod: v.metodoPago || 'YAPE_PLIN',
      paymentDetails: v.metodoPago === 'TARJETA' ? 'Tarjeta Débito / Crédito' : v.metodoPago === 'EFECTIVO' ? 'Contra Entrega en Domicilio' : 'Yape / Plin (+51 955 545 561)',
      status: 'CONFIRMADO'
    };
  });

  // Fusionar transacciones y fichas médicas asegurando que los productos (items) y el estado (status) siempre existan
  const mapa = new Map();
  for (const p of pedidosVentas) {
    if (p && (p.id || p.serieNumero)) {
      mapa.set(p.id, p);
      if (p.serieNumero) mapa.set(p.serieNumero, p);
    }
  }

  for (const p of pedidosFicha) {
    if (p && (p.id || p.serieNumero)) {
      const key = p.id || p.serieNumero;
      const baseVenta = mapa.get(key) || mapa.get(p.id) || mapa.get(p.serieNumero);
      if (baseVenta) {
        const merged = {
          ...baseVenta,
          ...p,
          items: (Array.isArray(p.items) && p.items.length > 0) ? p.items : (baseVenta.items || []),
          status: p.status || baseVenta.status || 'EN_PREPARACION'
        };
        mapa.set(baseVenta.id, merged);
      } else {
        mapa.set(key, {
          ...p,
          items: Array.isArray(p.items) ? p.items : [],
          status: p.status || 'EN_PREPARACION'
        });
      }
    }
  }

  const unicos = new Map();
  for (const p of mapa.values()) {
    if (p?.id && !unicos.has(p.id)) {
      unicos.set(p.id, p);
    }
  }

  return Array.from(unicos.values());
}

/**
 * Actualiza el estado de entrega de un pedido delivery (EN_PREPARACION, EN_CAMINO, ENTREGADO, CANCELADO)
 * Se actualiza en PostgreSQL para que tanto el cliente como el cajero/admin lo vean sincronizado en vivo
 */
export async function actualizarEstadoPedidoDelivery({ orderId, nuevoEstado, dni, ventaId }) {
  const estadoValido = ['CONFIRMADO', 'EN_PREPARACION', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO'].includes(nuevoEstado)
    ? nuevoEstado
    : 'EN_PREPARACION';

  let cleanDni = dni ? String(dni).trim() : null;

  // Si no se proporcionó el DNI, intentar resolverlo desde la Venta o el ID de la orden
  if (!cleanDni && ventaId) {
    const venta = await prisma.venta.findUnique({ where: { id: Number(ventaId) } });
    if (venta?.clienteDoc) cleanDni = String(venta.clienteDoc).trim();
  }

  if (!cleanDni && orderId) {
    const match = String(orderId).match(/(\d+)$/);
    if (match) {
      const vId = parseInt(match[1], 10);
      const venta = await prisma.venta.findUnique({ where: { id: vId } });
      if (venta?.clienteDoc) cleanDni = String(venta.clienteDoc).trim();
    }
  }

  // 1. Si tenemos el DNI, actualizar directamente la ficha del cliente en PostgreSQL
  if (cleanDni) {
    const cliente = await prisma.cliente.findUnique({ where: { dni: cleanDni } });
    if (cliente) {
      const fichaActual = (cliente.fichaMedica && typeof cliente.fichaMedica === 'object')
        ? cliente.fichaMedica
        : {};
      const pedidosPrevios = Array.isArray(fichaActual.pedidos) ? fichaActual.pedidos : [];

      let encontrado = false;
      const pedidosActualizados = pedidosPrevios.map((p) => {
        const matchesId = p.id === orderId || p.serieNumero === orderId;
        const matchesVenta = ventaId && (p.id?.endsWith(String(ventaId)) || p.serieNumero?.endsWith(String(ventaId)));
        if (matchesId || matchesVenta) {
          encontrado = true;
          return { ...p, status: estadoValido };
        }
        return p;
      });

      if (!encontrado && (orderId || ventaId)) {
        // Si no estaba en el array de pedidos previos, agregarlo con el estado
        pedidosActualizados.push({
          id: orderId || `NS-2026-${String(ventaId).padStart(4, '0')}`,
          serieNumero: `B001-${String(ventaId || 1).padStart(8, '0')}`,
          status: estadoValido,
          date: new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' })
        });
      }

      await prisma.cliente.update({
        where: { dni: cleanDni },
        data: {
          fichaMedica: {
            ...fichaActual,
            pedidos: pedidosActualizados
          }
        }
      });
      return { ok: true, dni: cleanDni, status: estadoValido };
    }
  }

  // 2. Si no se ubicó por DNI directo, buscar en todas las fichas de clientes registrados
  const clientes = await prisma.cliente.findMany({
    where: { NOT: { fichaMedica: null } }
  });

  for (const c of clientes) {
    const ficha = (c.fichaMedica && typeof c.fichaMedica === 'object') ? c.fichaMedica : {};
    const pedidos = Array.isArray(ficha.pedidos) ? ficha.pedidos : [];
    const index = pedidos.findIndex((p) => p.id === orderId || p.serieNumero === orderId);
    if (index >= 0) {
      pedidos[index].status = estadoValido;
      await prisma.cliente.update({
        where: { id: c.id },
        data: {
          fichaMedica: { ...ficha, pedidos }
        }
      });
      return { ok: true, dni: c.dni, status: estadoValido };
    }
  }

  return { ok: true, status: estadoValido };
}

/**
 * Obtener todos los pedidos web para el panel de Cajero / Admin con sus estados
 */
export async function listarPedidosDeliveryAdmin() {
  const ventas = await prisma.venta.findMany({
    where: {
      OR: [
        { clienteNom: { contains: 'Web Delivery' } },
        { clienteNom: { contains: 'Tienda Web' } },
        { clienteNom: { contains: '[Web' } }
      ]
    },
    orderBy: { createdAt: 'desc' },
    include: {
      detalles: {
        include: {
          producto: true
        }
      }
    }
  });

  // Mapear estados guardados en las fichas médicas de clientes
  const clientes = await prisma.cliente.findMany();
  const mapaEstados = new Map();
  for (const c of clientes) {
    if (c.fichaMedica && Array.isArray(c.fichaMedica.pedidos)) {
      for (const p of c.fichaMedica.pedidos) {
        if (p.id) mapaEstados.set(p.id, p);
        if (p.serieNumero) mapaEstados.set(p.serieNumero, p);
      }
    }
  }

  return ventas.map((v) => {
    const orderId = `NS-2026-${String(v.id).padStart(4, '0')}`;
    const serie = `B001-${String(v.id).padStart(8, '0')}`;
    const orderGuardada = mapaEstados.get(orderId) || mapaEstados.get(serie);

    return {
      ventaId: v.id,
      orderId,
      serieNumero: serie,
      clienteNom: v.clienteNom?.replace(/\s*\[Web Delivery.*?\]/g, '').replace(/\[.*?\]/g, '').trim() || 'Cliente General',
      clienteDoc: v.clienteDoc || '',
      direccion: orderGuardada?.customer?.address || 'Juliaca',
      distrito: orderGuardada?.customer?.district || 'Juliaca Cercado',
      telefono: orderGuardada?.customer?.phone || '',
      metodoPago: v.metodoPago,
      total: Number(v.total),
      fecha: v.createdAt,
      status: orderGuardada?.status || 'EN_PREPARACION',
      items: (v.detalles || []).map((d) => ({
        id: d.productoId,
        nombre: d.producto?.nombre || 'Medicamento',
        presentacion: d.producto?.presentacion || 'Unidad',
        cantidad: d.cantidad,
        precio: Number(d.precioUnitario),
        subtotal: Number(d.subtotal)
      }))
    };
  });
}
