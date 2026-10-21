const BASE_URL = 'http://localhost:4000/api';

async function ejecutarPruebas() {
  console.log('===============================================================');
  console.log('🧪 INICIANDO BATERÍA DE 9 PRUEBAS REALES - FASE 2');
  console.log('===============================================================\n');

  // -------------------------------------------------------------------------
  // PRUEBA 1: Login correcto (Admin y Cajero)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 1: Login correcto (Admin)');
  const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
  });
  const dataLoginAdmin = await resLoginAdmin.json();
  console.log(`Status: ${resLoginAdmin.status}`);
  console.log('JSON:', JSON.stringify(dataLoginAdmin, null, 2));
  console.log('¿Tiene token?:', !!dataLoginAdmin.token);
  console.log('¿Tiene password expuesta?:', dataLoginAdmin.usuario?.password !== undefined);
  console.log('---------------------------------------------------------------\n');

  const tokenAdmin = dataLoginAdmin.token;

  // Login de cajero para pruebas posteriores
  const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cajero@novasalud.com', password: 'Cajero123!' })
  });
  const dataLoginCajero = await resLoginCajero.json();
  const tokenCajero = dataLoginCajero.token;

  // -------------------------------------------------------------------------
  // PRUEBA 2: Login con email inexistente y contraseña errónea (mismo mensaje)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 2A: Login con email inexistente');
  const resEmailInvalido = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'noexiste@novasalud.com', password: 'Admin123!' })
  });
  const dataEmailInvalido = await resEmailInvalido.json();
  console.log(`Status: ${resEmailInvalido.status}`);
  console.log('JSON:', JSON.stringify(dataEmailInvalido, null, 2));

  console.log('\n▶ PRUEBA 2B: Login con contraseña errónea');
  const resClaveInvalida = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'ClaveTotalmenteErronea!' })
  });
  const dataClaveInvalida = await resClaveInvalida.json();
  console.log(`Status: ${resClaveInvalida.status}`);
  console.log('JSON:', JSON.stringify(dataClaveInvalida, null, 2));
  console.log('¿Mensajes idénticos?:', dataEmailInvalido.error === dataClaveInvalida.error);
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 3: Rate limit (11 intentos seguidos al login)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 3: Rate limit (11 intentos consecutivos)');
  let ultimoStatus = 0;
  let ultimoJson = null;
  for (let i = 1; i <= 11; i++) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@novasalud.com', password: 'password123' })
    });
    ultimoStatus = res.status;
    ultimoJson = await res.json();
    console.log(`Intento #${i} -> HTTP Status: ${res.status}`);
  }
  console.log('Respuesta del intento #11 (debe ser 429):');
  console.log(`Status: ${ultimoStatus}`);
  console.log('JSON:', JSON.stringify(ultimoJson, null, 2));
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 4: GET /api/productos como CAJERO vs como ADMIN
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 4A: GET /api/productos como CAJERO');
  const resProdCajero = await fetch(`${BASE_URL}/productos?limit=2`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const dataProdCajero = await resProdCajero.json();
  console.log(`Status: ${resProdCajero.status}`);
  const primerProdCajero = dataProdCajero.productos[0];
  console.log('Muestra de producto Cajero:', JSON.stringify(primerProdCajero, null, 2));
  console.log('¿Cajero ve costo?:', primerProdCajero?.costo !== undefined);
  console.log('¿Cajero ve proveedor?:', primerProdCajero?.proveedor !== undefined);

  console.log('\n▶ PRUEBA 4B: GET /api/productos como ADMIN');
  const resProdAdmin = await fetch(`${BASE_URL}/productos?limit=2`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const dataProdAdmin = await resProdAdmin.json();
  console.log(`Status: ${resProdAdmin.status}`);
  const primerProdAdmin = dataProdAdmin.productos[0];
  console.log('Muestra de producto Admin:', JSON.stringify(primerProdAdmin, null, 2));
  console.log('¿Admin ve costo?:', primerProdAdmin?.costo !== undefined);
  console.log('¿Admin ve proveedor?:', primerProdAdmin?.proveedor !== undefined);
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 5: GET /api/catalogo sin token (Público)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 5: GET /api/catalogo sin token (Catálogo Público)');
  const resCatalogo = await fetch(`${BASE_URL}/catalogo`);
  const dataCatalogo = await resCatalogo.json();
  console.log(`Status: ${resCatalogo.status}`);
  console.log(`Total productos públicos: ${dataCatalogo.length}`);
  
  // Buscar el producto vencido en la lista pública
  const prodVencido = dataCatalogo.find(p => p.nombre.includes('Vencido'));
  const prodDisponible = dataCatalogo.find(p => p.nombre.includes('Paracetamol'));
  
  console.log('Muestra producto normal:', JSON.stringify(prodDisponible, null, 2));
  console.log('Muestra producto vencido:', JSON.stringify(prodVencido, null, 2));
  console.log('¿Tiene campo stock numérico?:', prodDisponible?.stock !== undefined);
  console.log('¿Producto normal está disponible?:', prodDisponible?.disponible);
  console.log('¿Producto vencido está disponible?:', prodVencido?.disponible);
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 6: POST /api/productos como CAJERO (debe ser 403)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 6: POST /api/productos como CAJERO (Intento no autorizado)');
  const resCrearCajero = await fetch(`${BASE_URL}/productos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCajero}`
    },
    body: JSON.stringify({
      nombre: 'Medicamento Prohibido',
      presentacion: 'Caja x 10',
      costo: 10,
      precio: 20,
      categoriaId: 1
    })
  });
  const dataCrearCajero = await resCrearCajero.json();
  console.log(`Status: ${resCrearCajero.status}`);
  console.log('JSON:', JSON.stringify(dataCrearCajero, null, 2));
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 7: El token de un usuario desactivado ya no funciona (401)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 7: Revocación inmediata al desactivar usuario');
  // 1. Desactivamos al cajero (ID: 2) como Admin
  const resDesactivar = await fetch(`${BASE_URL}/usuarios/2/activo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({ activo: false })
  });
  const dataDesactivar = await resDesactivar.json();
  console.log('Cajero desactivado por Admin:', JSON.stringify(dataDesactivar, null, 2));

  // 2. El cajero intenta usar su token emitido anteriormente
  const resUsoTokenDesactivado = await fetch(`${BASE_URL}/auth/perfil`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const dataUsoTokenDesactivado = await resUsoTokenDesactivado.json();
  console.log(`Status al usar token desactivado: ${resUsoTokenDesactivado.status}`);
  console.log('JSON:', JSON.stringify(dataUsoTokenDesactivado, null, 2));

  // 3. Reactivamos al cajero para no dejarlo roto
  await fetch(`${BASE_URL}/usuarios/2/activo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({ activo: true })
  });
  console.log('Cajero reactivado nuevamente a activo: true');
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 8: Admin no puede desactivarse a sí mismo (400)
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 8: Admin no puede desactivarse a sí mismo');
  const resAutoDesactivar = await fetch(`${BASE_URL}/usuarios/1/activo`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({ activo: false })
  });
  const dataAutoDesactivar = await resAutoDesactivar.json();
  console.log(`Status: ${resAutoDesactivar.status}`);
  console.log('JSON:', JSON.stringify(dataAutoDesactivar, null, 2));
  console.log('---------------------------------------------------------------\n');

  // -------------------------------------------------------------------------
  // PRUEBA 9: GET /api/usuarios nunca devuelve password
  // -------------------------------------------------------------------------
  console.log('▶ PRUEBA 9: GET /api/usuarios nunca devuelve password');
  const resUsuarios = await fetch(`${BASE_URL}/usuarios`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const dataUsuarios = await resUsuarios.json();
  console.log(`Status: ${resUsuarios.status}`);
  console.log('Lista de usuarios obtenidos:');
  console.log(JSON.stringify(dataUsuarios, null, 2));
  
  const algunPasswordExpuesto = dataUsuarios.some(u => u.password !== undefined);
  console.log('¿Algún usuario tiene campo password?:', algunPasswordExpuesto);
  console.log('===============================================================');
  console.log('🏁 BATERÍA DE PRUEBAS COMPLETADA');
  console.log('===============================================================');
}

ejecutarPruebas().catch(err => {
  console.error('Error durante la ejecución del test:', err);
});
