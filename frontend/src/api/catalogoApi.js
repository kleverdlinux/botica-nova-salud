import clienteAxios from './clienteAxios.js';

// Consulta el catálogo público sin requerir token JWT
export async function obtenerCatalogoPublicoApi() {
  const { data } = await clienteAxios.get('/catalogo');
  return data;
}
