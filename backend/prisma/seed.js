import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de datos para Botica Nova Salud...');

  // 1. Usuarios con contraseñas seguras hasheadas (bcrypt con 10 rondas)
  const passAdmin = await bcrypt.hash('Admin123!', 10);
  const passCajero = await bcrypt.hash('Cajero123!', 10);
  const passAlmacen = await bcrypt.hash('Almacen123!', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@novasalud.com' },
    update: { avatar: '/avatars/admin/admin-3.jpg' },
    create: {
      nombre: 'Administrador Nova Salud',
      email: 'admin@novasalud.com',
      password: passAdmin,
      rol: 'ADMIN',
      avatar: '/avatars/admin/admin-3.jpg'
    }
  });

  const cajero = await prisma.usuario.upsert({
    where: { email: 'cajero@novasalud.com' },
    update: { avatar: '/avatars/cajero/cajero-2.jpg' },
    create: {
      nombre: 'Carla Ramos (Cajero)',
      email: 'cajero@novasalud.com',
      password: passCajero,
      rol: 'CAJERO',
      avatar: '/avatars/cajero/cajero-2.jpg'
    }
  });

  const almacen = await prisma.usuario.upsert({
    where: { email: 'almacen@novasalud.com' },
    update: { rol: 'ALMACEN', avatar: '/avatars/almacen/almacen-2.jpg' },
    create: {
      nombre: 'Gestor de Almacén & Kardex',
      email: 'almacen@novasalud.com',
      password: passAlmacen,
      rol: 'ALMACEN',
      avatar: '/avatars/almacen/almacen-2.jpg'
    }
  });

  console.log('Usuarios sembrados: admin@novasalud.com, cajero@novasalud.com y almacen@novasalud.com');

  // 2. Proveedor
  const prov1 = await prisma.proveedor.upsert({
    where: { ruc: '20100055231' },
    update: {},
    create: {
      ruc: '20100055231',
      razonSocial: 'Distribuidora Farmacéutica del Perú S.A.C.',
      telefono: '01-4458920',
      contacto: 'Juan Pérez (Ejemplo)'
    }
  });

  // 3. Categorías
  const catAnalgesicos = await prisma.categoria.upsert({
    where: { nombre: 'Analgésicos y Antiinflamatorios' },
    update: {},
    create: { nombre: 'Analgésicos y Antiinflamatorios', descripcion: 'Alivio del dolor y fiebre' }
  });

  const catAntibioticos = await prisma.categoria.upsert({
    where: { nombre: 'Antibióticos' },
    update: {},
    create: { nombre: 'Antibióticos', descripcion: 'Tratamiento de infecciones bacterianas' }
  });

  const catCuidado = await prisma.categoria.upsert({
    where: { nombre: 'Cuidado Personal y Primeros Auxilios' },
    update: {},
    create: { nombre: 'Cuidado Personal y Primeros Auxilios', descripcion: 'Higiene y curaciones' }
  });

  // 4. Fechas clave calculadas
  const hoy = new Date();
  const fechaFutura = new Date(hoy.getFullYear() + 2, hoy.getMonth(), hoy.getDate());
  const fechaPorVencer = new Date(Date.now() + 25 * 86_400_000); // En 25 días (Alerta: Por Vencer)
  const fechaVencida = new Date(Date.now() - 40 * 86_400_000);   // Hace 40 días (Alerta: Vencido)

  const productos = [
    {
      codigoBarras: '775012345001',
      nombre: 'Paracetamol 500 mg',
      principioActivo: 'Paracetamol',
      presentacion: 'Caja x 100 tabletas',
      laboratorio: 'Portugal',
      costo: 8.50,
      precio: 15.00,
      stock: 50,
      stockMinimo: 10,
      lote: 'L-2024-01',
      fechaVencimiento: fechaFutura,
      categoriaId: catAnalgesicos.id,
      proveedorId: prov1.id
    },
    {
      codigoBarras: '775012345002',
      nombre: 'Ibuprofeno 400 mg',
      principioActivo: 'Ibuprofeno',
      presentacion: 'Caja x 20 tabletas',
      laboratorio: 'Genfar',
      costo: 5.00,
      precio: 9.50,
      stock: 3, // ALERTA: stock <= stockMinimo
      stockMinimo: 10,
      lote: 'L-2024-02',
      fechaVencimiento: fechaFutura,
      categoriaId: catAnalgesicos.id,
      proveedorId: prov1.id
    },
    {
      codigoBarras: '775012345003',
      nombre: 'Amoxicilina 500 mg',
      principioActivo: 'Amoxicilina trihidrato',
      presentacion: 'Caja x 50 cápsulas',
      laboratorio: 'Medifarma',
      costo: 18.00,
      precio: 28.50,
      stock: 25,
      stockMinimo: 8,
      lote: 'L-2023-99',
      fechaVencimiento: fechaPorVencer, // ALERTA: Próximo a vencer en 25 días
      categoriaId: catAntibioticos.id,
      proveedorId: prov1.id
    },
    {
      codigoBarras: '775012345004',
      nombre: 'Alcohol Medicinal 70°',
      principioActivo: 'Etanol 70%',
      presentacion: 'Frasco 1000 ml',
      laboratorio: 'Alkofarma',
      costo: 6.00,
      precio: 11.00,
      stock: 30,
      stockMinimo: 5,
      lote: 'L-2024-50',
      fechaVencimiento: fechaFutura,
      categoriaId: catCuidado.id,
      proveedorId: prov1.id
    },
    {
      codigoBarras: '775012345005',
      nombre: 'Jarabe Tos Infantil (Caso Vencido)',
      principioActivo: 'Dextrometorfano',
      presentacion: 'Frasco 120 ml',
      laboratorio: 'Genfar',
      costo: 7.00,
      precio: 14.00,
      stock: 12,
      stockMinimo: 5,
      lote: 'L-2022-10',
      fechaVencimiento: fechaVencida, // ALERTA: Vencido (no disponible en catálogo)
      categoriaId: catAnalgesicos.id,
      proveedorId: prov1.id
    }
  ];

  // 5. Inserción idempotente de productos y Kardex
  for (const p of productos) {
    const existente = await prisma.producto.findUnique({
      where: { codigoBarras: p.codigoBarras }
    });

    if (!existente) {
      const prodCreado = await prisma.producto.create({ data: p });
      await prisma.movimientoInventario.create({
        data: {
          productoId: prodCreado.id,
          usuarioId: admin.id,
          tipo: 'ENTRADA',
          cantidad: p.stock,
          motivo: 'Inventario inicial del sistema',
          stockAnterior: 0,
          stockNuevo: p.stock
        }
      });
      console.log(`Producto creado: ${p.nombre} (Stock inicial: ${p.stock})`);
    } else {
      console.log(`Producto ya existe (omitiendo duplicación en Kardex): ${p.nombre}`);
    }
  }

  console.log('Seed de Botica Nova Salud finalizado con éxito.');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

