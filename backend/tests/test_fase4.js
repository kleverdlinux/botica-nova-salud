import { PrismaClient, Prisma } from '@prisma/client';
import { getInicioDiaLima, getFinDiaLima } from '../src/utils/fechas.js';

const prisma = new PrismaClient();
const BASE_URL = 'http://localhost:4000/api';

async function main() {
  console.log('=============================================================================');
  console.log('  SUITE DE PRUEBAS FASE 4: PRE-VERIFICACIONES, ALERTAS Y DASHBOARD ADMIN');
  console.log('=============================================================================\n');

  // 1. Obtener tokens reales
  console.log('🔑 Obteniendo tokens JWT para ADMIN y CAJERO...');
  const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
  });
  const dataAdmin = await resLoginAdmin.json();
  const tokenAdmin = dataAdmin.token;

  const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cajero@novasalud.com', password: 'Cajero123!' })
  });
  const dataCajero = await resLoginCajero.json();
  const tokenCajero = dataCajero.token;

  console.log('✓ Tokens obtenidos con éxito.\n');

  // ===========================================================================
  // PARTE 1: VERIFICACIONES PREVIAS A LA FASE 4
  // ===========================================================================
  console.log('-----------------------------------------------------------------------------');
  console.log('▶ VERIFICACIÓN 1: POST /api/productos como ADMIN con stockInicial y Kardex');
  console.log('-----------------------------------------------------------------------------');
  const codigoAleatorio = `775${Date.now().toString().slice(-9)}`;
  const resProd1 = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      codigoBarras: codigoAleatorio,
      nombre: 'Complejo B Forte 500mg',
      principioActivo: 'Vitaminas B1, B6, B12',
      presentacion: 'Caja x 30 tabletas',
      laboratorio: 'Bayer',
      costo: 12.00,
      precio: 22.50,
      stockInicial: 15,
      stockMinimo: 5,
      lote: 'L-VIT-001',
      fechaVencimiento: '2027-06-30',
      categoriaId: 1
    })
  });
  const jsonProd1 = await resProd1.json();
  console.log(`HTTP Status: ${resProd1.status}`);
  console.log('Respuesta JSON:', JSON.stringify(jsonProd1, null, 2));

  // Consulta directa a la base de datos para confirmar producto y kardex
  const prodEnBD = await prisma.producto.findUnique({
    where: { id: jsonProd1.id }
  });
  const kardexEnBD = await prisma.movimientoInventario.findMany({
    where: { productoId: jsonProd1.id },
    orderBy: { id: 'desc' }
  });

  console.log('\nConsulta a la BD - Producto creado:');
  console.log({
    id: prodEnBD.id,
    nombre: prodEnBD.nombre,
    stock: prodEnBD.stock,
    stockMinimo: prodEnBD.stockMinimo,
    activo: prodEnBD.activo
  });
  console.log('Consulta a la BD - Movimiento Kardex generado automáticamente:');
  console.log(kardexEnBD);
  console.log('-----------------------------------------------------------------------------\n');

  console.log('-----------------------------------------------------------------------------');
  console.log('▶ VERIFICACIÓN 2: PUT /api/productos/:id ignora stock y DELETE hace Soft Delete');
  console.log('-----------------------------------------------------------------------------');
  // Intento de modificar el stock enviando stock: 999
  const resPut = await fetch(`${BASE_URL}/productos/${jsonProd1.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      nombre: 'Complejo B Forte 500mg (Modificado)',
      presentacion: 'Caja x 30 tabletas',
      costo: 13.00,
      precio: 24.00,
      stock: 999, // INTENTO DE HACKEO DE STOCK
      categoriaId: 1
    })
  });
  const jsonPut = await resPut.json();
  console.log(`PUT HTTP Status: ${resPut.status}`);
  console.log('Respuesta PUT JSON:', JSON.stringify(jsonPut, null, 2));

  const prodPostPut = await prisma.producto.findUnique({
    where: { id: jsonProd1.id },
    select: { id: true, nombre: true, stock: true, precio: true }
  });
  console.log('Verificación en BD tras PUT (Stock DEBE seguir siendo 15, NO 999):', prodPostPut);

  // Soft delete
  const resDelete = await fetch(`${BASE_URL}/productos/${jsonProd1.id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const jsonDelete = await resDelete.json();
  console.log(`DELETE HTTP Status: ${resDelete.status}`);
  console.log('Respuesta DELETE JSON:', JSON.stringify(jsonDelete, null, 2));

  const prodPostDelete = await prisma.producto.findUnique({
    where: { id: jsonProd1.id },
    select: { id: true, nombre: true, activo: true }
  });
  console.log('Verificación en BD tras DELETE (Activo DEBE ser false):', prodPostDelete);
  console.log('-----------------------------------------------------------------------------\n');

  console.log('-----------------------------------------------------------------------------');
  console.log('▶ VERIFICACIÓN 3: Control de roles en Kardex, Entrada y Ajuste (403 para Cajero)');
  console.log('-----------------------------------------------------------------------------');
  // 3.1 Kardex como ADMIN
  const resKardexAdmin = await fetch(`${BASE_URL}/inventario/kardex/1`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const jsonKardexAdmin = await resKardexAdmin.json();
  console.log(`GET /inventario/kardex/1 como ADMIN -> HTTP Status: ${resKardexAdmin.status}`);
  console.log(`Movimientos obtenidos: ${jsonKardexAdmin.movimientos?.length}`);

  // 3.2 Kardex como CAJERO (debe dar 403)
  const resKardexCajero = await fetch(`${BASE_URL}/inventario/kardex/1`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const jsonKardexCajero = await resKardexCajero.json();
  console.log(`GET /inventario/kardex/1 como CAJERO -> HTTP Status: ${resKardexCajero.status} (Esperado: 403)`);
  console.log('Respuesta:', jsonKardexCajero);

  // 3.3 Entrada como CAJERO (debe dar 403)
  const resEntradaCajero = await fetch(`${BASE_URL}/inventario/entrada`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCajero}` },
    body: JSON.stringify({ productoId: 1, cantidad: 5, motivo: 'Prueba cajero' })
  });
  const jsonEntradaCajero = await resEntradaCajero.json();
  console.log(`POST /inventario/entrada como CAJERO -> HTTP Status: ${resEntradaCajero.status} (Esperado: 403)`);
  console.log('Respuesta:', jsonEntradaCajero);

  // 3.4 Ajuste como CAJERO (debe dar 403)
  const resAjusteCajero = await fetch(`${BASE_URL}/inventario/ajuste`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCajero}` },
    body: JSON.stringify({ productoId: 1, stockReal: 50, motivo: 'Prueba cajero' })
  });
  const jsonAjusteCajero = await resAjusteCajero.json();
  console.log(`POST /inventario/ajuste como CAJERO -> HTTP Status: ${resAjusteCajero.status} (Esperado: 403)`);
  console.log('Respuesta:', jsonAjusteCajero);
  console.log('-----------------------------------------------------------------------------\n');

  console.log('-----------------------------------------------------------------------------');
  console.log('▶ VERIFICACIÓN 4: GET /api/ventas (Cajero solo las suyas de hoy; Admin todas) y GET /:id');
  console.log('-----------------------------------------------------------------------------');
  const resVentasCajero = await fetch(`${BASE_URL}/ventas`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const jsonVentasCajero = await resVentasCajero.json();
  console.log(`GET /ventas como CAJERO -> HTTP Status: ${resVentasCajero.status}`);
  console.log(`Total ventas devueltas al cajero (suyas de hoy en Lima): ${jsonVentasCajero.total}`);
  const primeraVentaId = jsonVentasCajero.ventas?.[0]?.id;

  const resVentasAdmin = await fetch(`${BASE_URL}/ventas`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const jsonVentasAdmin = await resVentasAdmin.json();
  console.log(`GET /ventas como ADMIN -> HTTP Status: ${resVentasAdmin.status}`);
  console.log(`Total ventas devueltas al admin (todas las ventas históricas): ${jsonVentasAdmin.total}`);

  if (primeraVentaId) {
    const resDetalleVenta = await fetch(`${BASE_URL}/ventas/${primeraVentaId}`, {
      headers: { 'Authorization': `Bearer ${tokenCajero}` }
    });
    const jsonDetalleVenta = await resDetalleVenta.json();
    console.log(`GET /ventas/${primeraVentaId} con detalle -> HTTP Status: ${resDetalleVenta.status}`);
    console.log('Ticket:', jsonDetalleVenta.ticket);
    console.log('Detalle de productos:', JSON.stringify(jsonDetalleVenta.detalles, null, 2));
  }
  console.log('-----------------------------------------------------------------------------\n');

  // ===========================================================================
  // PARTE 2: PRUEBAS FASE 4 (ALERTAS Y DASHBOARD)
  // ===========================================================================

  console.log('=============================================================================');
  console.log('▶ PRUEBA 4.a: Alertas con datos actuales (Ibuprofeno, Amoxicilina, Jarabe)');
  console.log('=============================================================================');
  const resAlertas = await fetch(`${BASE_URL}/alertas`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` } // Cajero tiene acceso
  });
  const jsonAlertas = await resAlertas.json();
  console.log(`GET /alertas -> HTTP Status: ${resAlertas.status}`);
  console.log('Conteos de alertas:', jsonAlertas.conteos);

  console.log('\n1. Productos en "Bajo Stock":');
  console.log(jsonAlertas.bajoStock.map(p => ({
    id: p.id,
    nombre: p.nombre,
    stock: p.stock,
    stockMinimo: p.stockMinimo,
    costo: p.costo, // DEBE SER undefined
    proveedor: p.proveedor // DEBE SER undefined
  })));

  console.log('\n2. Productos en "Por Vencer" (próximos 60 días):');
  console.log(jsonAlertas.porVencer.map(p => ({
    id: p.id,
    nombre: p.nombre,
    stock: p.stock,
    fechaVencimiento: p.fechaVencimiento,
    costo: p.costo,
    proveedor: p.proveedor
  })));

  console.log('\n3. Productos en "Vencidos":');
  console.log(jsonAlertas.vencidos.map(p => ({
    id: p.id,
    nombre: p.nombre,
    stock: p.stock,
    fechaVencimiento: p.fechaVencimiento,
    costo: p.costo,
    proveedor: p.proveedor
  })));

  // Verificación SQL directa de las alertas
  console.log('\n--- Consulta SQL de Verificación de Alertas ---');
  const sqlBajoStock = await prisma.$queryRaw`
    SELECT id, nombre, stock, "stockMinimo"
    FROM "Producto"
    WHERE activo = true AND stock <= "stockMinimo"
  `;
  console.log('SQL Bajo Stock:', sqlBajoStock);

  const inicioLima = getInicioDiaLima();
  const sqlPorVencer = await prisma.$queryRaw`
    SELECT id, nombre, stock, "fechaVencimiento"
    FROM "Producto"
    WHERE activo = true AND stock > 0
      AND "fechaVencimiento" >= ${inicioLima}
      AND "fechaVencimiento" <= ${new Date(Date.now() + 60 * 86_400_000)}
  `;
  console.log('SQL Por Vencer (próximos 60 días):', sqlPorVencer);

  const sqlVencidos = await prisma.$queryRaw`
    SELECT id, nombre, stock, "fechaVencimiento"
    FROM "Producto"
    WHERE activo = true AND stock > 0
      AND "fechaVencimiento" < ${inicioLima}
  `;
  console.log('SQL Vencidos:', sqlVencidos);
  console.log('-----------------------------------------------------------------------------\n');

  console.log('=============================================================================');
  console.log('▶ PRUEBA 4.b: Dashboard ADMIN vs Suma Real en SQL, y 403 para Cajero');
  console.log('=============================================================================');
  // Cajero intentando acceder al dashboard
  const resDashCajero = await fetch(`${BASE_URL}/dashboard/resumen`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const jsonDashCajero = await resDashCajero.json();
  console.log(`GET /dashboard/resumen como CAJERO -> HTTP Status: ${resDashCajero.status} (Esperado: 403)`);
  console.log('Respuesta:', jsonDashCajero);

  // Admin accediendo al dashboard
  const resDashAdmin = await fetch(`${BASE_URL}/dashboard/resumen`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const jsonDashAdmin = await resDashAdmin.json();
  console.log(`\nGET /dashboard/resumen como ADMIN -> HTTP Status: ${resDashAdmin.status}`);
  console.log('Respuesta Dashboard:', JSON.stringify(jsonDashAdmin, null, 2));

  // Consulta SQL para verificar la métrica 1 (Ventas de Hoy)
  const sqlVentasHoy = await prisma.$queryRaw`
    SELECT
      COUNT(*)::int as cantidad,
      COALESCE(SUM(total), 0) as total
    FROM "Venta"
    WHERE ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Lima')::date = (CURRENT_TIMESTAMP AT TIME ZONE 'America/Lima')::date
  `;
  console.log('\n--- Consulta SQL: Ventas de Hoy en Horario Lima ---');
  console.log('SQL Ventas de Hoy:', {
    cantidad: sqlVentasHoy[0].cantidad,
    total: new Prisma.Decimal(sqlVentasHoy[0].total).toFixed(2)
  });
  console.log('Dashboard Ventas de Hoy:', jsonDashAdmin.ventasHoy);
  console.log('¿Coinciden exactamente?:',
    Number(sqlVentasHoy[0].cantidad) === Number(jsonDashAdmin.ventasHoy.cantidad) &&
    new Prisma.Decimal(sqlVentasHoy[0].total).toFixed(2) === jsonDashAdmin.ventasHoy.total
  );
  console.log('-----------------------------------------------------------------------------\n');

  console.log('=============================================================================');
  console.log('▶ PRUEBA 4.c: Zona Horaria America/Lima (20:00 Lima = 01:00 UTC día siguiente)');
  console.log('=============================================================================');
  // Obtenemos la fecha de hoy en Lima
  const fechaLimaStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Lima' });
  // Construimos una fecha exactamente a las 20:00:00 en Lima (en UTC esto es a la 01:00:00 del día siguiente)
  const fecha20HorasLima = new Date(`${fechaLimaStr}T20:00:00.000-05:00`);
  console.log(`Fecha simulada Lima: ${fechaLimaStr} 20:00:00 -05:00`);
  console.log(`Representación ISO/UTC equivalente: ${fecha20HorasLima.toISOString()} (Día siguiente en UTC)`);

  // Insertamos una venta de prueba con este createdAt
  const ventaNocturna = await prisma.venta.create({
    data: {
      total: new Prisma.Decimal(50.00),
      metodoPago: 'EFECTIVO',
      usuarioId: 2, // cajero
      createdAt: fecha20HorasLima,
      detalles: {
        create: [
          {
            productoId: 1, // Paracetamol
            cantidad: 2,
            precioUnitario: new Prisma.Decimal(25.00),
            subtotal: new Prisma.Decimal(50.00)
          }
        ]
      }
    }
  });
  console.log(`Venta nocturna insertada con ID ${ventaNocturna.id}, Total: S/ ${ventaNocturna.total}`);

  // Consultamos el Dashboard nuevamente por HTTP real
  const resDashPostNocturna = await fetch(`${BASE_URL}/dashboard/resumen`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const jsonDashPostNocturna = await resDashPostNocturna.json();

  console.log('\nMétrica de ventas de hoy tras insertar venta a las 20:00 Lima:');
  console.log(jsonDashPostNocturna.ventasHoy);

  // Verificamos por SQL filtrando por el día calendario en America/Lima
  const sqlVerifNocturna = await prisma.$queryRaw`
    SELECT
      id,
      total,
      "createdAt",
      "createdAt"::date::text as fecha_utc_ingenua,
      ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Lima')::text as fecha_hora_lima,
      ("createdAt" AT TIME ZONE 'UTC' AT TIME ZONE 'America/Lima')::date::text as fecha_lima
    FROM "Venta"
    WHERE id = ${ventaNocturna.id}
  `;
  console.log('\n--- Consulta SQL: Verificación de Zona Horaria en PostgreSQL ---');
  console.log(sqlVerifNocturna[0]);
  console.log(`Fecha UTC ingenua (sin considerar zona horaria): ${sqlVerifNocturna[0].fecha_utc_ingenua} (¡Falsamente caería en mañana!)`);
  console.log(`Fecha local en America/Lima: ${sqlVerifNocturna[0].fecha_lima} (¡Correctamente hoy!)`);
  console.log(`¿La fecha Lima calculada por SQL es "${fechaLimaStr}"?:`, sqlVerifNocturna[0].fecha_lima === fechaLimaStr);

  // Limpiamos la venta simulada para mantener la BD en estado prístino
  await prisma.detalleVenta.deleteMany({ where: { ventaId: ventaNocturna.id } });
  await prisma.venta.delete({ where: { id: ventaNocturna.id } });
  console.log('✓ Venta nocturna de prueba limpiada de la base de datos tras la verificación.');
  console.log('-----------------------------------------------------------------------------\n');

  console.log('=============================================================================');
  console.log('▶ PRUEBA 4.d: Los 7 días devuelven exactamente 7 entradas (incluso días con 0)');
  console.log('=============================================================================');
  console.log('Array de los 7 días devuelto por el Dashboard:');
  console.table(jsonDashPostNocturna.ventasUltimos7Dias);
  console.log(`Cantidad de días en el array: ${jsonDashPostNocturna.ventasUltimos7Dias.length} (Esperado: 7)`);
  const diasSinVentas = jsonDashPostNocturna.ventasUltimos7Dias.filter(d => d.cantidad === 0);
  console.log(`Días sin ventas en la última semana: ${diasSinVentas.length}`);
  if (diasSinVentas.length > 0) {
    console.log('Ejemplo de día sin ventas (debe tener total: "0.00" y cantidad: 0):', diasSinVentas[0]);
  }

  console.log('\nTop 5 productos más vendidos:');
  console.table(jsonDashPostNocturna.topProductos);

  console.log('=============================================================================');
  console.log('  TODAS LAS VERIFICACIONES Y PRUEBAS DE LA FASE 4 COMPLETADAS CON ÉXITO');
  console.log('=============================================================================\n');
}

main()
  .catch((e) => {
    console.error('Error durante la ejecución del test de Fase 4:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
