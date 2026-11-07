async function verifyAll() {
  console.log('=== VERIFICACION INTEGRAL EN PRODUCCION RENDER ===');

  // 1. Login Cajero
  const resCajero = await fetch('https://botica-nova-salud-khs4.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'cajero@novasalud.com', password: 'Cajero123!' })
  });
  const dataCajero = await resCajero.json();
  const tokenCajero = dataCajero.token;
  console.log('1. Autenticacion Cajero:', !!tokenCajero ? 'EXITOSA' : 'FALLO');

  // 1b. Busqueda POS
  const posPanadol = await (await fetch('https://botica-nova-salud-khs4.onrender.com/api/productos/buscar?q=panadol', {
    headers: { 'Authorization': 'Bearer ' + tokenCajero }
  })).json();
  console.log('   - Busqueda POS "panadol":', posPanadol.length, 'coincidencias.');
  posPanadol.forEach(p => console.log('     *', p.nombre, '| Stock:', p.stock, '| S/', p.precio));

  const posApronax = await (await fetch('https://botica-nova-salud-khs4.onrender.com/api/productos/buscar?q=apronax', {
    headers: { 'Authorization': 'Bearer ' + tokenCajero }
  })).json();
  console.log('   - Busqueda POS "apronax":', posApronax.length, 'coincidencias.');
  posApronax.forEach(p => console.log('     *', p.nombre, '| Stock:', p.stock, '| S/', p.precio));

  // 2. Login Almacen
  const resAlmacen = await fetch('https://botica-nova-salud-khs4.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'almacen@novasalud.com', password: 'Almacen123!' })
  });
  const dataAlmacen = await resAlmacen.json();
  const tokenAlmacen = dataAlmacen.token;
  console.log('2. Autenticacion Almacen:', !!tokenAlmacen ? 'EXITOSA' : 'FALLO');

  const invAlmacen = await (await fetch('https://botica-nova-salud-khs4.onrender.com/api/productos?limit=5', {
    headers: { 'Authorization': 'Bearer ' + tokenAlmacen }
  })).json();
  console.log('   - Inventario Almacen total farmacos:', invAlmacen.total);
  console.log('   - Primeros items con costo visible:', invAlmacen.productos.map(p => ({ nom: p.nombre, costo: p.costo, precio: p.precio })));

  // 3. Login Admin
  const resAdmin = await fetch('https://botica-nova-salud-khs4.onrender.com/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' })
  });
  const dataAdmin = await resAdmin.json();
  const tokenAdmin = dataAdmin.token;
  console.log('3. Autenticacion Admin:', !!tokenAdmin ? 'EXITOSA' : 'FALLO');

  const dashboardRes = await (await fetch('https://botica-nova-salud-khs4.onrender.com/api/dashboard', {
    headers: { 'Authorization': 'Bearer ' + tokenAdmin }
  })).json();
  console.log('   - Dashboard Admin metricas de inventario:');
  console.log('     * Total productos activos:', dashboardRes.inventarioMetricas?.totalProductosActivos);
  console.log('     * Total unidades fisicas en stock:', dashboardRes.inventarioMetricas?.totalUnidadesFisicas);
  console.log('     * Total valorizado inventario: S/', dashboardRes.inventarioMetricas?.totalValorizado);
  console.log('     * Distribucion por categorias:', dashboardRes.distribucionCategorias?.map(c => ({ cat: c.nombre, items: c.totalItems })));

  // 4. Catalogo Publico Web
  const catalogoWeb = await (await fetch('https://botica-nova-salud-khs4.onrender.com/api/catalogo')).json();
  console.log('4. Catalogo Publico Web (/api/catalogo):', catalogoWeb.length, 'farmacos disponibles.');
}

verifyAll();

