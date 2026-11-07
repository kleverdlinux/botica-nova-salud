async function check() {
  try {
    const loginRes = await fetch('https://botica-nova-salud-khs4.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@novasalud.com', password: 'Admin123!' }),
    });

    const loginData = await loginRes.json();
    console.log('Login status:', loginRes.status);
    console.log('Login result:', loginData.token ? 'Token recibido' : loginData);

    if (!loginData.token) {
      console.log('No se pudo autenticar en Render');
      return;
    }

    const prodRes = await fetch('https://botica-nova-salud-khs4.onrender.com/api/productos', {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    console.log('Productos status:', prodRes.status);
    const prodData = await prodRes.json();
    console.log('Total productos en Render:', Array.isArray(prodData) ? prodData.length : prodData);
    if (Array.isArray(prodData)) {
      if (prodData.length > 0) {
        console.log('Muestra producto 0:', prodData[0]);
        console.log('Muestra producto 1:', prodData[1]);
      } else {
        console.log('LA BASE DE DATOS DE RENDER ESTA VACIA (0 PRODUCTOS)');
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

check();
