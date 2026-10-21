const BASE_URL = 'http://localhost:4000/api';

async function verificarPuntosPrevios() {
  console.log('--- VERIFICACIÓN 1: LOGIN ADMIN Y CAJERO ---');
  const resLoginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
  });
  const { token: tokenAdmin } = await resLoginAdmin.json();

  const resLoginCajero = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cajero@novasalud.com', password: 'Cajero123!' })
  });
  const { token: tokenCajero } = await resLoginCajero.json();

  console.log('--- VERIFICACIÓN 2: /api/productos/buscar?q=para (no confundida con :id) ---');
  const resBuscar = await fetch(`${BASE_URL}/productos/buscar?q=para`, {
    headers: { 'Authorization': `Bearer ${tokenCajero}` }
  });
  const dataBuscar = await resBuscar.json();
  console.log(`Status /buscar: ${resBuscar.status}`);
  console.log('Resultado /buscar:', JSON.stringify(dataBuscar, null, 2));

  console.log('\n--- VERIFICACIÓN 3: /api/catalogo limpio (solo campos acordados) ---');
  const resCatalogo = await fetch(`${BASE_URL}/catalogo`);
  const dataCatalogo = await resCatalogo.json();
  console.log(`Status /catalogo: ${resCatalogo.status}`);
  console.log('Muestra primer producto catálogo:', JSON.stringify(dataCatalogo[0], null, 2));

  console.log('\n--- VERIFICACIÓN 4: ?activo=false como ADMIN ---');
  // 1. Desactivamos un producto para probar el filtro (ej: producto ID 4)
  await fetch(`${BASE_URL}/productos/4`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });

  // 2. Consultamos con ?activo=false como Admin
  const resInactivos = await fetch(`${BASE_URL}/productos?activo=false`, {
    headers: { 'Authorization': `Bearer ${tokenAdmin}` }
  });
  const dataInactivos = await resInactivos.json();
  console.log(`Status ?activo=false: ${resInactivos.status}`);
  console.log('Productos inactivos devueltos:', JSON.stringify(dataInactivos.productos, null, 2));

  // 3. Reactivamos el producto 4
  await fetch(`${BASE_URL}/productos/4`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenAdmin}`
    },
    body: JSON.stringify({
      nombre: 'Alcohol Medicinal 70°',
      presentacion: 'Frasco 1000 ml',
      costo: 6,
      precio: 11,
      stockMinimo: 5,
      activo: true,
      categoriaId: 3
    })
  });
}

verificarPuntosPrevios().catch(console.error);
