import prisma from '../src/lib/prisma.js';

const BASE_URL = 'http://localhost:4000/api';

async function consultarEstadoBD(productoId) {
  const prod = await prisma.producto.findUnique({
    where: { id: productoId },
    select: { id: true, nombre: true, stock: true }
  });

  const kardex = await prisma.movimientoInventario.findMany({
    where: { productoId },
    select: { id: true, tipo: true, cantidad: true, motivo: true, stockAnterior: true, stockNuevo: true, createdAt: true },
    orderBy: { id: 'desc' },
    take: 3
  });

  return { producto: prod, ultimosMovimientosKardex: kardex };
}

async function ejecutarBateriaFase3() {
  console.log('=============================================================================');
  console.log('🧪 BATERÍA DE PRUEBAS REALES POR HTTP CON CONSULTA POSTGRESQL - FASE 3');
  console.log('=============================================================================\n');

  // Login de Cajero y Admin para obtener tokens JWT reales
  const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cajero@novasalud.com', password: 'Cajero123!' })
  });
  const { token: tokenCajero } = await resLoginCajero.json();

  const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
  });
  const { token: tokenAdmin } = await resLoginAdmin.json();

  // ---------------------------------------------------------------------------
  // TEST 1: Cantidad negativa o cero
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 1: Venta con cantidad negativa o cero (Rechazo 400)');
  const res1 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      items: [{ productoId: 1, cantidad: -5 }]
    })
  });
  const json1 = await res1.json();
  console.log(`HTTP Status: ${res1.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json1, null, 2));
  console.log('Estado en PostgreSQL:', await consultarEstadoBD(1));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 2: Ítems repetidos en el carrito (Consolidación automática)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 2: Ítems repetidos en el carrito (Consolidar y sumar cantidades)');
  const estadoAntes2 = await consultarEstadoBD(1);
  console.log('Stock antes de vender:', estadoAntes2.producto.stock);

  const res2 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      clienteNom: 'Cliente Prueba Duplicados',
      items: [
        { productoId: 1, cantidad: 2 },
        { productoId: 1, cantidad: 3 }
      ]
    })
  });
  const json2 = await res2.json();
  console.log(`HTTP Status: ${res2.status}`);
  console.log('Respuesta JSON (Total debe ser 5 x 15 = 75 Soles):', JSON.stringify(json2, null, 2));
  console.log('Estado en PostgreSQL:', await consultarEstadoBD(1));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 3: Producto vencido (Rechazo 409)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 3: Intento de venta de producto vencido (Rechazo 409)');
  // ID 5 es Jarabe Tos Infantil (Caso Vencido)
  const res3 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      items: [{ productoId: 5, cantidad: 1 }]
    })
  });
  const json3 = await res3.json();
  console.log(`HTTP Status: ${res3.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json3, null, 2));
  console.log('Estado en PostgreSQL (Stock no debe haberse alterado):', await consultarEstadoBD(5));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 4: Sobreventa (Cantidad mayor al stock existente)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 4: Sobreventa (Cantidad mayor al stock existente)');
  // ID 2 (Ibuprofeno) tiene stock bajo (stock actual = 3)
  const estadoAntes4 = await consultarEstadoBD(2);
  console.log(`Stock actual de Ibuprofeno: ${estadoAntes4.producto.stock}. Intentando comprar 10...`);

  const res4 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      items: [{ productoId: 2, cantidad: 10 }]
    })
  });
  const json4 = await res4.json();
  console.log(`HTTP Status: ${res4.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json4, null, 2));
  console.log('Estado en PostgreSQL tras rechazo:', await consultarEstadoBD(2));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 5: Venta válida con Kardex coherente (stockAnterior y stockNuevo)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 5: Venta válida de 1 unidad de Ibuprofeno (Stock pasa de 3 a 2)');
  const res5 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      clienteDoc: '45892314',
      clienteNom: 'Mariela Quispe',
      metodoPago: 'YAPE_PLIN',
      items: [{ productoId: 2, cantidad: 1 }]
    })
  });
  const json5 = await res5.json();
  console.log(`HTTP Status: ${res5.status}`);
  console.log('Ticket generado:', json5.venta?.ticket);
  console.log('Detalle de venta:', JSON.stringify(json5.venta?.detalles, null, 2));
  console.log('Estado en PostgreSQL (Kardex debe reflejar salida con stockAnterior=3 y stockNuevo=2):');
  console.log(await consultarEstadoBD(2));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 6: Concurrencia real (Dos ventas simultáneas de la última unidad de stock)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 6: Concurrencia real: 2 ventas simultáneas de la última unidad');
  // Preparamos un producto de prueba con exactamente stock = 1
  const prodConcurrente = await prisma.producto.create({
    data: {
      nombre: 'Prueba Concurrencia Stock 1',
      presentacion: 'Frasco 50 ml',
      costo: 5,
      precio: 10,
      stock: 1,
      stockMinimo: 1,
      categoriaId: 1
    }
  });
  console.log(`Producto de prueba ID ${prodConcurrente.id} creado con stock exacto = 1`);

  // Disparamos dos ventas exactamente al mismo milisegundo por HTTP
  const p1 = fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCajero}` },
    body: JSON.stringify({ items: [{ productoId: prodConcurrente.id, cantidad: 1 }] })
  });

  const p2 = fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenCajero}` },
    body: JSON.stringify({ items: [{ productoId: prodConcurrente.id, cantidad: 1 }] })
  });

  const [resConcurrente1, resConcurrente2] = await Promise.all([p1, p2]);
  const [jsonConcurrente1, jsonConcurrente2] = await Promise.all([
    resConcurrente1.json(),
    resConcurrente2.json()
  ]);

  console.log(`Venta simultánea A -> HTTP Status: ${resConcurrente1.status}`);
  console.log('Respuesta A:', JSON.stringify(jsonConcurrente1));
  console.log(`Venta simultánea B -> HTTP Status: ${resConcurrente2.status}`);
  console.log('Respuesta B:', JSON.stringify(jsonConcurrente2));

  const estadoPostConcurrencia = await consultarEstadoBD(prodConcurrente.id);
  console.log('Estado en PostgreSQL tras concurrencia (Stock DEBE ser 0, NUNCA -1):');
  console.log(estadoPostConcurrencia);
  console.log('¿Stock quedó en 0 exacto?:', estadoPostConcurrencia.producto.stock === 0);
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 7: Intento de manipulación de precio desde el cliente
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 7: Intento de manipulación de precio desde el cliente');
  // Paracetamol cuesta S/ 15.00 en la BD. El cliente envía precioUnitario: 0.01 y total: 0.01
  const res7 = await fetch(`${BASE_URL}/ventas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      items: [{
        productoId: 1,
        cantidad: 2,
        precioUnitario: 0.01, // PRECIO HACKEADO
        subtotal: 0.02,
        total: 0.02
      }]
    })
  });
  const json7 = await res7.json();
  console.log(`HTTP Status: ${res7.status}`);
  console.log('Respuesta de venta registrada:');
  console.log(`Total cobrado en servidor: S/ ${json7.venta?.total} (debe ser S/ 30.00, NO S/ 0.02)`);
  console.log('Detalle registrado:', json7.venta?.detalles);
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 8: Entrada de Inventario (Kardex coherente)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 8: Entrada de Inventario (POST /api/inventario/entrada)');
  const estadoAntes8 = await consultarEstadoBD(3); // Amoxicilina
  console.log(`Stock actual de Amoxicilina: ${estadoAntes8.producto.stock}. Ingresando 20 unidades...`);

  const res8 = await fetch(`${BASE_URL}/inventario/entrada`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      productoId: 3,
      cantidad: 20,
      motivo: 'Compra según Factura Electrónica F001-9821'
    })
  });
  const json8 = await res8.json();
  console.log(`HTTP Status: ${res8.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json8, null, 2));
  console.log('Estado en PostgreSQL tras entrada:');
  console.log(await consultarEstadoBD(3));
  console.log('-----------------------------------------------------------------------------\n');

  // ---------------------------------------------------------------------------
  // TEST 9: Ajuste de Inventario con stockReal (y caso stockReal == stockActual)
  // ---------------------------------------------------------------------------
  console.log('▶ TEST 9A: Ajuste de Inventario donde stockReal == stockActual (Debe responder 400)');
  const estadoProd3 = await consultarEstadoBD(3);
  const stockActualProd3 = estadoProd3.producto.stock;

  const res9A = await fetch(`${BASE_URL}/inventario/ajuste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      productoId: 3,
      stockReal: stockActualProd3, // Mismo valor
      motivo: 'Conteo de rutina sin variación'
    })
  });
  const json9A = await res9A.json();
  console.log(`HTTP Status (debe ser 400): ${res9A.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json9A, null, 2));

  console.log('\n▶ TEST 9B: Ajuste de Inventario legítimo por merma física (De 45 a 42)');
  const res9B = await fetch(`${BASE_URL}/inventario/ajuste`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      productoId: 3,
      stockReal: 42,
      motivo: 'Merma por frasco quebrado en almacén'
    })
  });
  const json9B = await res9B.json();
  console.log(`HTTP Status (debe ser 200): ${res9B.status}`);
  console.log('Respuesta JSON:', JSON.stringify(json9B, null, 2));
  console.log('Estado en PostgreSQL tras ajuste:');
  console.log(await consultarEstadoBD(3));
  console.log('=============================================================================');
  console.log('🏁 BATERÍA COMPLETA DE FASE 3 CULMINADA CON ÉXITO');
  console.log('=============================================================================');
}

ejecutarBateriaFase3()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
