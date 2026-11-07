import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sincronizarCatalogoCompleto } from '../src/services/catalogoService.js';

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

  // 2. Sincronización oficial del Catálogo Web Completo (120 productos, 6 familias, Kardex y Proveedor)
  console.log('Sincronizando 120 fármacos certificados y 6 categorías oficiales...');
  const resSync = await sincronizarCatalogoCompleto(admin.id);
  console.log(`Catálogo sincronizado exitosamente: ${resSync.totalSincronizados} productos en ${resSync.categorias} categorías.`);

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
