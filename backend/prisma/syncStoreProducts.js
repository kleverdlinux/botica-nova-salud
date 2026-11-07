import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 Sincronizando catálogo de tienda con inventario de Botica Nova Salud...');

  const dataPath = path.join(__dirname, 'store_products.json');
  if (!fs.existsSync(dataPath)) {
    throw new Error(`Archivo no encontrado: ${dataPath}`);
  }

  const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  const { collections, products } = rawData;

  // 1. Obtener usuario Administrador para registrar el Kardex
  const admin = await prisma.usuario.findFirst({
    where: { rol: 'ADMIN' },
  });
  const adminId = admin ? admin.id : 1;

  // 2. Proveedor oficial DIGEMID
  const proveedor = await prisma.proveedor.upsert({
    where: { ruc: '20100055231' },
    update: {},
    create: {
      ruc: '20100055231',
      razonSocial: 'Distribuidora Farmacéutica del Perú S.A.C.',
      telefono: '01-4458920',
      contacto: 'Ing. Químico Farmacéutico Responsable',
    },
  });

  // 3. Crear / mapear las 6 categorías del catálogo
  const categoriaMap = {};
  for (const col of collections) {
    const cat = await prisma.categoria.upsert({
      where: { nombre: col.name },
      update: { descripcion: col.description },
      create: {
        nombre: col.name,
        descripcion: col.description,
      },
    });
    categoriaMap[col.id] = cat.id;
  }

  // Categoría por defecto si no hace match
  const defaultCat = await prisma.categoria.findFirst();
  const defaultCatId = defaultCat ? defaultCat.id : 1;

  console.log(`✅ ${collections.length} Categorías sincronizadas.`);

  // 4. Fechas y lotes farmacéuticos realistas
  const fechaFutura = new Date('2028-06-30T00:00:00Z');

  let sincronizados = 0;
  let kardexCreados = 0;

  for (let i = 0; i < products.length; i++) {
    const p = products[i];

    // Generar código de barras único con prefijo GS1 Perú (775)
    const codigoBarras = `775${String(i + 1).padStart(9, '0')}`;

    // Extraer laboratorio de materiales si viene entre paréntesis Ej: (ISDIN), (Portugal), (Bayer)
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

    const presentacion =
      p.dimensions || p.boxLabel || p.unitLabel || 'Unidad / Presentación Farmacéutica';
    const precio = parseFloat(p.price) || 5.0;
    const costo = Math.round(precio * 0.65 * 100) / 100; // Margen farmacéutico realista
    const stock = 20 + ((i * 7) % 45); // Entre 20 y 65 unidades de stock físico
    const lote = `L-2026-${String((i % 40) + 10).padStart(3, '0')}`;
    const categoriaId = categoriaMap[p.collection] || defaultCatId;
    const imagen = p.images && p.images[0] ? p.images[0] : null;

    // Buscar si ya existe por nombre o código de barras
    const existente = await prisma.producto.findFirst({
      where: {
        OR: [{ nombre: p.name }, { codigoBarras: codigoBarras }],
      },
    });

    if (existente) {
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
          activo: true,
        },
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
          proveedorId: proveedor.id,
        },
      });

      // Crear asiento de Kardex inicial
      await prisma.movimientoInventario.create({
        data: {
          productoId: nuevo.id,
          usuarioId: adminId,
          tipo: 'ENTRADA',
          cantidad: stock,
          motivo: 'Inventario inicial integrado con catálogo oficial web',
          stockAnterior: 0,
          stockNuevo: stock,
        },
      });

      sincronizados++;
      kardexCreados++;
    }
  }

  console.log(`\n🎉 Sincronización completada con éxito:`);
  console.log(`📦 Productos sincronizados en Inventario: ${sincronizados}`);
  console.log(`📋 Movimientos de Kardex iniciales registrados: ${kardexCreados}`);
}

main()
  .catch((e) => {
    console.error('❌ Error sincronizando catálogo:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

